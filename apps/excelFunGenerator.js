const { createAutoKeyFun } = require('../tools/i18nExcelFunCreation');

// 英文数据所在单元格；
// 取哪一行的值生成的函数就适用在哪一行；
const enCell = 'C2';

// key暂时只支持`lowerCamelCase`和`UpperCamelCase`;
const keyFormat = 'lowerCamelCase';

// key的最大单词数量；
const maxWord = 5;

createAutoKeyFun(enCell, { keyFormat, maxWord });
