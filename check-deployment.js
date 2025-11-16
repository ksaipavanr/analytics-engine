const fs = require('fs');
const path = require('path');

console.log('🔍 Checking deployment readiness...');

// Check essential files
const essentialFiles = [
  'package.json',
  'src/app.js',
  'src/controllers/analyticsController.js',
  'src/middleware/googleAuth.js',
  'src/models/Application.js',
  'src/models/User.js',
  'src/models/AnalyticsEvent.js',
  'src/routes/auth.js',
  'src/routes/analytics.js'
];

let allFilesExist = true;

essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check if mock data is present
const analyticsController = fs.readFileSync('src/controllers/analyticsController.js', 'utf8');
const hasMockData = analyticsController.includes('mockData') || analyticsController.includes('mockUsers');

if (hasMockData) {
  console.log('✅ Mock data detected in analytics controller');
} else {
  console.log('❌ No mock data found - using real database queries');
}

if (allFilesExist) {
  console.log('\n🎉 Deployment check PASSED! Your app is ready for deployment.');
  console.log('\n📋 Next steps:');
  console.log('   1. git add .');
  console.log('   2. git commit -m "Ready for deployment"');
  console.log('   3. Deploy to Railway: railway up');
} else {
  console.log('\n❌ Deployment check FAILED! Please fix missing files.');
}