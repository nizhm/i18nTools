const { writeFileSync: writer } = require('fs');

const createAutoKeyFun = (
  enCell,
  option = {}
) => {
  const defaultOption = {
    keyFormat: 'lowerCamelCase',
    maxWord: 5
  };
  const opt = Object.assign({}, defaultOption, option);
  const {
    keyFormat,
    maxWord
  } = opt;

  // 找空格位置时用的占位符号；
  const holder = '&END&';

  // excel中，两个双引号表示一个双引号；
  // 此处不用放空格，中间处理需要用到空格，最后会一起去掉；
  const filterList = [
    // 英文标点
    '\`', '~', '!', '@', '#',
    '$', '%', '^', '&', '*',
    '(', ')', '-', '_', '=',
    '+', '\\', '|', ';', ':',
    '\'', '""', ',', '<', '.',
    '>', '/', '?',
    // 数字
    '0', '1', '2', '3', '4',
    '5', '6', '7', '8', '9',
    // 中文标点
    '【', '】', '，', '。', '、',
    '（', '）'
  ];

  // 英文中filterList的字符都替换成空格；
  let enData = enCell;
  filterList.forEach(item => {
    enData = `SUBSTITUTE(${enData},"${item}"," ")`;
  });
  // 去掉多余空格；
  enData = `TRIM(${enData})`;

  // 英文是单个单词时，直接用；
  let keyFromWord;
  // 英文是句子时，提取最多maxWord个单词组成key;
  let keyFromSentence;
  if (keyFormat === 'lowerCamelCase') {
    keyFromWord = `LOWER(${enData})`;
    keyFromSentence =
      `LOWER(LEFT(${enData},FIND(" ",${enData})))&` +
      `PROPER(` +
        `MID(` +
          `${enData},` +
          `FIND(" ",${enData}),` +
          `IF(` +
            `LEN(${enData})-LEN(SUBSTITUTE(${enData}," ",""))>${maxWord - 1},` +
            `FIND("${holder}",SUBSTITUTE(${enData}," ","${holder}",${maxWord}))-FIND(" ",${enData}),` +
            `LEN(${enData})` +
          `)` +
        `)`+
      `)`;
  } else if (keyFormat === 'UpperCamelCase') {
    keyFromWord = `PROPER(${enData})`;
    keyFromSentence =
      `PROPER(` +
        `LEFT(` +
          `${enData},` +
          `IF(` +
            `LEN(${enData})-LEN(SUBSTITUTE(${enData}," ",""))>${maxWord - 1},` +
            `FIND("${holder}",SUBSTITUTE(${enData}," ","${holder}",${maxWord})),` +
            `LEN(${enData})` +
          `)` +
        `)`+
      `)`;
  } else {
    keyFromWord = `LOWER(${enData})`;
    keyFromSentence =
      `LOWER(LEFT(${enData},FIND(" ",${enData})))&` +
      `PROPER(` +
        `MID(` +
          `${enData},` +
          `FIND(" ",${enData}),` +
          `IF(` +
            `LEN(${enData})-LEN(SUBSTITUTE(${enData}," ",""))>${maxWord - 1},` +
            `FIND("${holder}",SUBSTITUTE(${enData}," ","${holder}",${maxWord}))-FIND(" ",${enData}),` +
            `LEN(${enData})` +
          `)` +
        `)`+
      `)`;
  }

  const keyFun =
    `=IF(` +
      `EXACT(${enData},SUBSTITUTE(${enData}," ","")),` +
      `${ keyFromWord },` +
      `SUBSTITUTE(${ keyFromSentence }," ","")` +
    `)`;

  writer('../output/keyFun.txt', keyFun);;
}

module.exports = {
  createAutoKeyFun
}
