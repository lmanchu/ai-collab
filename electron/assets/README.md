# App Icons

## Required Icons

For proper app packaging, you need to provide:

### macOS
- `icon.icns` - macOS app icon (1024x1024 PNG converted to ICNS)

### Windows
- `icon.ico` - Windows app icon (256x256 ICO format)

### Linux
- `icon.png` - Linux app icon (512x512 PNG)

## Creating Icons

You can use online tools or command-line tools to convert PNG to ICNS/ICO:

### Online Tools
- https://cloudconvert.com/png-to-icns
- https://convertio.co/png-ico/

### Command Line (macOS)
```bash
# Install iconutil (comes with Xcode)
# Create icon.iconset folder with required sizes
mkdir icon.iconset
# Add icon files at different sizes
# Then convert
iconutil -c icns icon.iconset
```

### Command Line (ImageMagick)
```bash
# Install ImageMagick
brew install imagemagick

# Convert to ICO (Windows)
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico

# For ICNS on macOS, use iconutil as above
```

## Temporary Placeholder

For development, electron-builder will use a default icon if these files are missing.

To add custom icons:
1. Create your 1024x1024 PNG icon
2. Convert to .icns (Mac) and .ico (Windows)
3. Place them in this directory
4. Rebuild the app
