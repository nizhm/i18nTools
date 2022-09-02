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

module.exports = {
  logger
}
