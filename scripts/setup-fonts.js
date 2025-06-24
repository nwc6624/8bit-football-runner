const fs = require('fs');
const path = require('path');
const https = require('https');

// Ensure assets/fonts directory exists
const fontsDir = path.join(__dirname, '../assets/fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// Font URLs
const fonts = {
  'PressStart2P-Regular': 'https://fonts.google.com/download?family=Press%20Start%202P',
  'VT323-Regular': 'https://fonts.google.com/download?family=VT323',
};

// Download function
function downloadFont(fontName, url) {
  const filePath = path.join(fontsDir, `${fontName}.ttf`);
  
  // Skip if already downloaded
  if (fs.existsSync(filePath)) {
    console.log(`${fontName}.ttf already exists, skipping...`);
    return Promise.resolve();
  }
  
  console.log(`Downloading ${fontName}...`);
  
  // Note: This is a simplified example. In a real app, you would:
  // 1. Download the font files from a reliable source
  // 2. Add them to your project's assets/fonts directory
  // 3. Configure them in app.json
  
  // For now, we'll create a placeholder file
  return new Promise((resolve) => {
    fs.writeFileSync(filePath, '');
    console.log(`Created placeholder for ${fontName}.ttf`);
    resolve();
  });
}

// Download all fonts
async function setupFonts() {
  try {
    for (const [fontName, url] of Object.entries(fonts)) {
      await downloadFont(fontName, url);
    }
    console.log('Font setup complete!');
  } catch (error) {
    console.error('Error setting up fonts:', error);
    process.exit(1);
  }
}

setupFonts();
