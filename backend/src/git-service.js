/**
 * Git Service - Wrapper for simple-git
 * Handles all Git operations with AI/human tagging
 */

import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';

const REPO_PATH = process.env.REPO_PATH || path.join(process.cwd(), 'workspace');

class GitService {
  constructor(repoPath = REPO_PATH) {
    this.repoPath = repoPath;
    this.git = null; // Will be initialized when needed
  }

  /**
   * Ensure Git is initialized (lazy initialization)
   */
  async ensureGit() {
    if (this.git) return;

    // Create directory if it doesn't exist
    await fs.mkdir(this.repoPath, { recursive: true });

    this.git = simpleGit(this.repoPath);

    // Check if repo is initialized
    const isRepo = await this.git.checkIsRepo();
    if (!isRepo) {
      await this.git.init();
      await this.git.addConfig('user.name', 'Tandem System');
      await this.git.addConfig('user.email', 'system@tandem.dev');
      console.log(`✅ Git repo auto-initialized at ${this.repoPath}`);
    }
  }

  /**
   * Initialize a new Git repository (explicit init)
   */
  async init() {
    await this.ensureGit();
    console.log(`✅ Git repo initialized at ${this.repoPath}`);
  }

  /**
   * Commit file changes with AI/human metadata
   * @param {string} filePath - File path relative to repo
   * @param {string} content - File content
   * @param {string} author - Author type: 'ai' or 'human'
   * @param {string} authorName - Author name
   * @param {string} message - Optional commit message
   */
  async commitFile(filePath, content, author, authorName, message = null) {
    await this.ensureGit();
    const fullPath = path.join(this.repoPath, filePath);
    const dir = path.dirname(fullPath);

    // Check if file exists before writing (for commit message)
    const fileExisted = await this.fileExists(filePath);

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, content, 'utf-8');

    // Stage file
    await this.git.add(filePath);

    // Generate commit message if not provided
    if (!message) {
      const action = fileExisted ? 'Updated' : 'Created';
      message = `${action} ${filePath}`;
    }

    // Add AI/human metadata to commit message
    const icon = author === 'ai' ? '🤖' : '👤';
    const fullMessage = `${icon} ${message}

Type: ${author}
Author: ${authorName}
File: ${filePath}`;

    // Commit
    const result = await this.git.commit(fullMessage);

    return {
      sha: result.commit,
      message,
      author,
      authorName,
      timestamp: new Date().toISOString(),
      filesChanged: [filePath]
    };
  }

  /**
   * Get file content
   */
  async getFile(filePath) {
    await this.ensureGit();
    const fullPath = path.join(this.repoPath, filePath);
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const stats = await fs.stat(fullPath);

      // Get latest commit for this file
      const log = await this.git.log({ file: filePath, maxCount: 1 });
      const latestCommit = log.latest;

      return {
        path: filePath,
        content,
        metadata: {
          size: stats.size,
          modified: stats.mtime.toISOString(),
          commit: latestCommit?.hash || null,
          author: this.parseAuthorType(latestCommit?.body || '')
        }
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * List all files in repo
   */
  async listFiles() {
    await this.ensureGit();
    const files = [];

    async function scanDir(dirPath, relativePath = '') {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        // Skip .git directory
        if (entry.name === '.git') continue;

        const fullPath = path.join(dirPath, entry.name);
        const relPath = path.join(relativePath, entry.name);

        if (entry.isDirectory()) {
          await scanDir(fullPath, relPath);
        } else {
          const stats = await fs.stat(fullPath);
          files.push({
            path: relPath,
            name: entry.name,
            type: 'file',
            size: stats.size,
            modified: stats.mtime.toISOString()
          });
        }
      }
    }

    await scanDir(this.repoPath);
    return files;
  }

  /**
   * Get commit history
   * @param {string} filePath - Optional: filter by file
   * @param {number} limit - Max commits to return
   */
  async getHistory(filePath = null, limit = 50) {
    await this.ensureGit();
    const options = { maxCount: limit };
    if (filePath) {
      options.file = filePath;
    }

    const log = await this.git.log(options);

    return log.all.map(commit => ({
      sha: commit.hash,
      message: this.parseCommitMessage(commit.message),
      author: this.parseAuthorType(commit.body),
      authorName: this.parseAuthorName(commit.body),
      timestamp: commit.date,
      filesChanged: [this.parseFileName(commit.body)]
    }));
  }

  /**
   * Get diff for a specific commit
   */
  async getDiff(sha) {
    await this.ensureGit();
    const commit = await this.git.show([sha]);
    const log = await this.git.log({ from: sha, to: sha });
    const commitInfo = log.all[0];

    return {
      commit: {
        sha: commitInfo.hash,
        message: this.parseCommitMessage(commitInfo.message),
        author: this.parseAuthorType(commitInfo.body),
        authorName: this.parseAuthorName(commitInfo.body),
        timestamp: commitInfo.date
      },
      diff: commit
    };
  }

  /**
   * Revert to a specific commit
   */
  async revert(sha) {
    await this.ensureGit();
    await this.git.revert(sha, { '--no-edit': null });
    const log = await this.git.log({ maxCount: 1 });
    return {
      success: true,
      newCommit: log.latest.hash
    };
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath, author, authorName) {
    await this.ensureGit();
    const fullPath = path.join(this.repoPath, filePath);
    await fs.unlink(fullPath);
    await this.git.rm(filePath);

    const message = `Deleted ${filePath}`;
    const icon = author === 'ai' ? '🤖' : '👤';
    const fullMessage = `${icon} ${message}

Type: ${author}
Author: ${authorName}
File: ${filePath}`;

    const result = await this.git.commit(fullMessage);

    return {
      sha: result.commit,
      message,
      author,
      authorName,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    const fullPath = path.join(this.repoPath, filePath);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  // Helper methods for parsing commit metadata

  parseCommitMessage(fullMessage) {
    return fullMessage.split('\n')[0].replace(/^[🤖👤]\s*/, '');
  }

  parseAuthorType(body) {
    const match = body.match(/Type:\s*(ai|human)/);
    return match ? match[1] : 'human';
  }

  parseAuthorName(body) {
    const match = body.match(/Author:\s*(.+)/);
    return match ? match[1].trim() : 'Unknown';
  }

  parseFileName(body) {
    const match = body.match(/File:\s*(.+)/);
    return match ? match[1].trim() : '';
  }
}

export default GitService;
