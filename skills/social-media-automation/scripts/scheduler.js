const fs = require('fs');
const path = require('path');

const schedule = {
  twitter: [
    { time: "09:00", days: [1,2,3,4,5] },
    { time: "18:00", days: [1,2,3,4,5] }
  ],
  linkedin: [
    { time: "10:00", days: [2,4] }
  ]
};

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getNextRun(scheduleEntry) {
  const now = new Date();
  const [hours, minutes] = scheduleEntry.time.split(':').map(Number);
  
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + i);
    checkDate.setHours(hours, minutes, 0, 0);
    
    const dayOfWeek = checkDate.getDay();
    if (scheduleEntry.days.includes(dayOfWeek)) {
      if (checkDate > now || i === 0) {
        return checkDate;
      }
    }
  }
  return null;
}

function displaySchedule() {
  console.log('📅 Social Media Schedule\n');
  console.log('Platform    | Time  | Days');
  console.log('------------|-------|-----------------');
  
  for (const [platform, entries] of Object.entries(schedule)) {
    for (const entry of entries) {
      const days = entry.days.map(d => dayNames[d]).join(', ');
      console.log(`${platform.padEnd(11)}| ${entry.time} | ${days}`);
    }
  }
  
  console.log('\n📌 Next scheduled runs:');
  for (const [platform, entries] of Object.entries(schedule)) {
    for (const entry of entries) {
      const nextRun = getNextRun(entry);
      if (nextRun) {
        console.log(`  ${platform} at ${nextRun.toLocaleString()}`);
      }
    }
  }
}

function checkAndRun() {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  for (const [platform, entries] of Object.entries(schedule)) {
    for (const entry of entries) {
      if (entry.days.includes(currentDay) && entry.time === currentTime) {
        console.log(`⏰ Running ${platform} scheduler...`);
        const publishScript = require('./publish.js');
      }
    }
  }
}

const args = process.argv.slice(2);
if (args.includes('--view')) {
  displaySchedule();
} else if (args.includes('--run')) {
  checkAndRun();
} else {
  displaySchedule();
  console.log('\nUsage:');
  console.log('  node scheduler.js --view    Show schedule');
  console.log('  node scheduler.js --run     Check and run due tasks');
}
