#!/usr/bin/env node

/**
 * Tandem CLI
 * Command-line interface for AI to interact with Tandem
 * All operations are automatically tagged as 'ai' type
 */

import { Command } from 'commander';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const program = new Command();
const CONFIG_PATH = path.join(os.homedir(), '.tandem', 'config.json');
const DEFAULT_API_URL = 'http://localhost:3000';

// Load config
async function loadConfig() {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { apiUrl: DEFAULT_API_URL, authorName: 'AI Assistant' };
  }
}

// Save config
async function saveConfig(config) {
  const dir = path.dirname(CONFIG_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
}

// API client
async function apiCall(endpoint, options = {}) {
  const config = await loadConfig();
  const url = `${config.apiUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Commands

program
  .name('tandem')
  .description('Tandem CLI - Work in tandem with AI')
  .version('0.1.0');

// Init
program
  .command('init')
  .description('Initialize Tandem workspace')
  .option('-u, --url <url>', 'API URL', DEFAULT_API_URL)
  .option('-n, --name <name>', 'AI name', 'AI Assistant')
  .action(async (options) => {
    try {
      // Save config
      await saveConfig({
        apiUrl: options.url,
        authorName: options.name,
      });

      // Initialize repo via API
      await apiCall('/api/init', { method: 'POST' });

      console.log('✅ Tandem workspace initialized');
      console.log(`📡 API: ${options.url}`);
      console.log(`🤖 AI Name: ${options.name}`);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// List files
program
  .command('list')
  .alias('ls')
  .description('List all files')
  .action(async () => {
    try {
      const { files } = await apiCall('/api/files');

      if (files.length === 0) {
        console.log('📂 No files yet');
        return;
      }

      console.log(`📂 ${files.length} file(s):\n`);
      files.forEach(file => {
        const size = (file.size / 1024).toFixed(1);
        console.log(`  ${file.path} (${size} KB)`);
      });
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Read file
program
  .command('read <file>')
  .description('Read file content')
  .action(async (filePath) => {
    try {
      const file = await apiCall(`/api/files/${filePath}`);

      console.log(file.content);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Write file
program
  .command('write <file> [content...]')
  .description('Write or update file')
  .option('-m, --message <message>', 'Commit message')
  .action(async (filePath, contentArray, options) => {
    try {
      const config = await loadConfig();
      const content = contentArray.join(' ');

      if (!content) {
        console.error('❌ Error: Content is required');
        process.exit(1);
      }

      const result = await apiCall(`/api/files/${filePath}`, {
        method: 'POST',
        body: JSON.stringify({
          content,
          author: 'ai',
          authorName: config.authorName,
          message: options.message,
        }),
      });

      console.log(`✅ File saved: ${filePath}`);
      console.log(`📝 Commit: ${result.commit.substring(0, 7)}`);
      console.log(`💬 ${result.message}`);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Delete file
program
  .command('delete <file>')
  .alias('rm')
  .description('Delete file')
  .action(async (filePath) => {
    try {
      const config = await loadConfig();

      const result = await apiCall(`/api/files/${filePath}`, {
        method: 'DELETE',
        body: JSON.stringify({
          author: 'ai',
          authorName: config.authorName,
        }),
      });

      console.log(`✅ File deleted: ${filePath}`);
      console.log(`📝 Commit: ${result.commit.substring(0, 7)}`);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// History
program
  .command('history [file]')
  .alias('log')
  .description('Show commit history')
  .option('-n, --limit <number>', 'Number of commits', '10')
  .action(async (filePath, options) => {
    try {
      const query = new URLSearchParams();
      if (filePath) query.set('file', filePath);
      query.set('limit', options.limit);

      const { commits } = await apiCall(`/api/commits?${query}`);

      if (commits.length === 0) {
        console.log('📜 No commits yet');
        return;
      }

      console.log(`📜 ${commits.length} commit(s):\n`);
      commits.forEach(commit => {
        const icon = commit.author === 'ai' ? '🤖' : '👤';
        const sha = commit.sha.substring(0, 7);
        const date = new Date(commit.timestamp).toLocaleString();

        console.log(`${icon} ${sha} - ${commit.authorName}`);
        console.log(`   ${commit.message}`);
        console.log(`   ${date}\n`);
      });
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

// Status
program
  .command('status')
  .description('Show workspace status')
  .action(async () => {
    try {
      const config = await loadConfig();
      const { files } = await apiCall('/api/files');
      const { commits } = await apiCall('/api/commits?limit=1');

      console.log('📊 Tandem Workspace Status\n');
      console.log(`📡 API: ${config.apiUrl}`);
      console.log(`🤖 AI Name: ${config.authorName}`);
      console.log(`📂 Files: ${files.length}`);
      console.log(`📝 Commits: ${commits.length > 0 ? commits[0].sha.substring(0, 7) : 'none'}`);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
