import { readFile, writeFile } from 'fs/promises';

/**
 * 使用说明：
 *  1.在线文档《模块管理》中利用Excel加一列_key；
 *  2.将_key复制值（！！！仅复制值）到新一列key;
 *  3.这里修改key这列，key列就是前端i18n文件中的key值；
 *  4.将表格中的所有英文逗号替换为`&dot;`；
 *  5.将表格中所有英文双引号替换为`&quote;`；
 *  6.导出表格到csv文件；
 *  7.利用notepad将csv转成utf8格式；
 *  8.将转换格式后的csv放到i18n文件夹下；
 *  9.根据模块名修改moduleName；
 *  10.根据文件名修改filePath;
 *  11.执行本文件；
 *  12.会生成三份i18n模块文件：cn.js、en.js、tw.js（原来有同名文件时旧文件会被overwrite）；
 *
 * 问题：
 *  1.最后一行空行被解析了；
 *  2.
 */
const moduleName = 'fgEdit';
const filePath = './fgEdit.csv';

const data = await readFile(filePath, 'utf8');
const rowData = data.split('\r\n');
// TODO: 最后一行空行不知道为啥解析进来了？；
rowData.pop();
rowData.forEach((row, index) => rowData[index] = row.split(','));
const headers = rowData.shift();
const keyIdx = headers.findIndex(el => el === 'key');
const cnIdx = headers.findIndex(el => el === '元素显示中文');
const enIdx = headers.findIndex(el => el === '元素显示英文');
const twIdx = headers.findIndex(el => el === '元素显示繁体');

const i18nData = rowData.map(item => ({
  key: item[keyIdx],
  cn: item[cnIdx]?.replace(/&dot;/g, ','),
  en: item[enIdx]?.replace(/&dot;/g, ','),
  tw: item[twIdx]?.replace(/&dot;/g, ',')
}));
const keyCountMap = new Map();
const cnData = {};
const enData = {};
const twData = {};
for(const datum of i18nData) {
  let count = keyCountMap.get(datum.key) || 0;
  count++;
  keyCountMap.set(datum.key, count);

  const key = `${ datum.key }${ count === 1 ? '' : count }`;

  cnData[key] = datum.cn;
  enData[key] = datum.en;
  twData[key] = datum.tw;
}

const i18nModule = class {
  constructor(moduleName, data) {
    this[moduleName] = data;
  }
}
function dataToJSON(data) {
  data = new i18nModule(moduleName, data);

  let json = JSON.stringify(data, null, 2);
  json = json
    .replace(/"\S*":/g, key => key.replace(/"/g, ''))
    .replace(/'/g, "\\'")
    .replace(/"/g, "'")
    .replace(/&quote;/g, '"');

  return json;
}
const cnJS = `module.exports = ${dataToJSON(cnData)}`;
const enJS = `module.exports = ${dataToJSON(enData)}`;
const twJS = `module.exports = ${dataToJSON(twData)}`;

await writeFile(`./multi/${moduleName}_cn.js`, cnJS, 'utf8');
await writeFile(`./multi/${moduleName}_en.js`, enJS, 'utf8');
await writeFile(`./multi/${moduleName}_tw.js`, twJS, 'utf8');
