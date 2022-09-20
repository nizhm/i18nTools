const { access, mkdir } = require('fs');

const { exec } = require('child_process');

const neededDirs = ['input', 'output', 'logger'];
neededDirs.forEach(dirName => {
  const dirPath = `./${dirName}`;
  access(
    dirPath,
    err => {
      if (err) {
        mkdir(
          dirPath,
          err => {
            if (err) {
              console.trace(err);
            }
          }
        );
      }
    }
  );
  console.log(`The \`${dirName}\` directory is available!`);
});

console.log('> npm install');
console.log('Running `npm install`');
exec(
  'npm install',
  (err, stdout) => {
    if (err) {
      console.trace(err);
      return;
    }

    console.log(stdout);
  }
);
