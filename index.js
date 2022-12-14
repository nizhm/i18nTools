const { mkdirSync } = require('fs');

const { execSync } = require('child_process');

const neededDirs = ['input', 'output', 'logger'];
neededDirs.forEach(dirName => {
  const dirPath = `./${dirName}`;
  try {
    mkdirSync(dirPath, { recursive: true });
  } catch (e) {
    console.error(e);
  }
});

console.log('> npm install');
console.log('Running `npm install`......');
const dataBuffer = execSync('npm install');
const data = dataBuffer.toString('utf8');
console.log(data);

