const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i += 2) {
  if (args[i].startsWith('--')) {
    options[args[i].replace('--', '')] = args[i + 1];
  }
}

const configPath = path.join(__dirname, '../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const platforms = {
  twitter: async (content) => {
    console.log('🐦 Posting to Twitter...');
    console.log('   Note: Implement with Twitter API v2');
    console.log(`   Content: ${JSON.stringify(content)}`);
    return { platform: 'twitter', status: 'simulated' };
  },
  linkedin: async (content) => {
    console.log('💼 Posting to LinkedIn...');
    console.log('   Note: Implement with LinkedIn OAuth 2.0');
    console.log(`   Content: ${JSON.stringify(content)}`);
    return { platform: 'linkedin', status: 'simulated' };
  },
  instagram: async (content) => {
    console.log('📸 Posting to Instagram...');
    console.log('   Note: Requires Facebook Graph API integration');
    return { platform: 'instagram', status: 'simulated' };
  }
};

async function publish() {
  const platform = options.platform || 'twitter';
  const contentFile = options.content;
  const contentDir = path.join(__dirname, '../content/pending');
  
  let content;
  
  if (contentFile) {
    if (fs.existsSync(contentFile)) {
      content = JSON.parse(fs.readFileSync(contentFile, 'utf-8'));
    } else {
      console.error(`❌ File not found: ${contentFile}`);
      process.exit(1);
    }
  } else {
    const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
      console.log('📭 No pending content to publish');
      return;
    }
    const latestFile = files.sort().pop();
    content = JSON.parse(fs.readFileSync(path.join(contentDir, latestFile), 'utf-8'));
  }
  
  const publisher = platforms[platform];
  if (!publisher) {
    console.error(`❌ Unknown platform: ${platform}`);
    console.log(`   Available: ${Object.keys(platforms).join(', ')}`);
    process.exit(1);
  }
  
  if (!config[platform]?.enabled) {
    console.error(`❌ Platform ${platform} is not enabled in config.json`);
    process.exit(1);
  }
  
  const result = await publisher(content);
  
  if (result.status === 'simulated') {
    console.log(`\n⚠️  This was a simulation. Configure API credentials in config.json to enable real publishing.`);
  } else {
    const publishedDir = path.join(__dirname, '../content/published');
    const timestamp = Date.now();
    fs.writeFileSync(
      path.join(publishedDir, `${platform}_${timestamp}.json`),
      JSON.stringify(content, null, 2)
    );
  }
  
  console.log(`\n✅ ${platform} publish complete`);
}

if (options.verify) {
  console.log('🔍 Checking recent posts...');
  console.log('   Note: Implement API calls to verify published content');
} else {
  publish().catch(console.error);
}
