const { appendFileSync } = require('fs');

const logger = str => {
  const msg = `\n[${new Date().toLocaleString()}] ` + str;
  console.log(msg);
  setTimeout(
    () => {
      appendFileSync(
        `${__dirname}/logger.log`,
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
        `${__dirname}/logger.log`,
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
