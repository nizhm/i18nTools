const { appendFileSync } = require('fs');
const path = require('path')

const outputTarget = path.resolve(`${__dirname}/../logger/logger.log`);
console.log(outputTarget)

const logger = str => {
  const msg = `\n[${new Date().toLocaleString()}] ` + str;
  console.log(msg);
  setTimeout(
    () => {
      appendFileSync(
        outputTarget,
        msg,
        'utf8',
        err => { if (err) { console.trace(err); } }
      );
    }
  );
};

const errorLog = e => {
  if (!(e instanceof Error)) {
    logger(e);
    return;
  }
  const msg = `\n[${new Date().toLocaleString()}] ` + e.message;
  console.trace(e);
  setTimeout(
    () => {
      appendFileSync(
        outputTarget,
        e,
        'utf8',
        err => { if (err) { console.trace(err); } }
      );
    }
  );
};

module.exports = {
  logger
}
