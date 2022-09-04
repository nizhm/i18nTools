const path = require('path');
const { writeFileSync: writer } = require('fs');

const ExcelJS = require('exceljs');

const {
  directoryReader,
  extractFiles,
  flatKeysList
} = require('./directoryReader');

// (async () => {
//   const langPath = 'D:\\Projects\\UMC\\umc-web\\src\\lang';
//
//   const excludeDirectory = [
//     'node_modules',
//     'elementLang',
//     'cm',
//     'auditManage',
//     'monitoringCenter',
//     'shortChain'
//   ];
//   const includeExt = ['js'];
//   const langContent = directoryReader(
//     langPath,
//     {
//       excludeDirectory,
//       includeExt
//     }
//   );
//   const files = extractFiles(langContent);
//   const jsFiles = files['js'];
//   const transFiles = {};
//   for(const jsFile of jsFiles) {
//     const { fileName, filePath, directoryName } = jsFile;
//     if (!transFiles[directoryName]) {
//       transFiles[directoryName] = {};
//     }
//     transFiles[directoryName][fileName] = filePath;
//   }
//
//   const cnData = {};
//   const twData = {};
//   const enData = {};
//   for(const [, files] of Object.entries(transFiles)) {
//     const cn = require(files['zh.js']);
//     const tw = require(files['zhCHT.js']);
//     const en = require(files['en.js']);
//     Object.assign(cnData, cn);
//     Object.assign(twData, tw);
//     Object.assign(enData, en);
//   }
//
//   const moduleLevel = [
//     [],
//     ['common'],
//     ['aimEdit'],
//     ['contact'],
//     ['fgEdit'],
//     ['fgTemplate'],
//     ['headerIcon'],
//     ['loginPage'],
//     ['rmsEdit'],
//     ['statistics'],
//     ['templateManage'],
//     ['utplSend'],
//     ['utpltemplate']
//   ];
//   let langList = flatKeysList(cnData, moduleLevel);
//   for(const item of langList) {
//     const { i18nKey } = item;
//     const splitor = '.';
//     let moduleName;
//     if (i18nKey.includes(splitor)) {
//       moduleName = i18nKey.split(splitor)[0];
//     } else {
//       moduleName = 'public';
//     }
//     item['moduleName'] = moduleName;
//     item['twValue'] = eval(`twData.${i18nKey}`);
//     item['enValue'] = eval(`enData.${i18nKey}`);
//   }
//   console.log(langList.length);
//
//
//   function jsonToJS(json) {
//     json = JSON.stringify(json, null, 2);
//     json = json
//       .replace(/"\S*":/g, key => key.replace(/"/g, ''))
//       .replace(/'/g, "\\'")
//       .replace(/&nbsp;/g, "")
//       .replace(/"/g, "'");
//     return `module.exports = ${json}\n`;
//   }
//
//   const xlsxFilePath = '../output/output.xlsx';
//   const workbook = new ExcelJS.Workbook();
//   const langSheet = workbook.addWorksheet('lang');
//   langSheet.columns = [
//     { header: 'Id', width: 10 },
//     { header: 'Name', width: 32 },
//     { header: 'D.O.B.', width: 10 }
//   ];
//   await workbook.xlsx.writeFile(xlsxFilePath);
//
//   for(const row of langList) {
//
//   }
//   writer(`../output/${path.basename(langPath)}_list.js`, jsonToJS(langList));
//   // writer(`../output/${path.basename(langPath)}_tw.js`, jsonToJS(twData));
//   // writer(`../output/${path.basename(langPath)}_en.js`, jsonToJS(enData));
// })();

// 中文
const chinese = '\u4e00-\u9fa5';
// 中文特殊符号
const chineseMark = '·！￥……（）——【】、；：‘’“”，《》。？'
// 中文及中文特殊字符
const chineseAndMark = chinese + chineseMark;
// 单独使用的中文
const singleChinese = new RegExp(`(?<![${chinese}])[${chinese}](?!${chinese})`, 'g');
// 空格隔开的中文
const spaceChinese = new RegExp(`[${chinese}][ ]+([ ]+|[${chinese}]+)*[${chinese}]`, 'g');
// 纯中文句子
const chineseSentence = new RegExp(`[${chineseAndMark}/]+[?!]?`, 'g');
// 中文中还有英文、数字；
const chineseSentenceMixedEnNumber = new RegExp(`[\\w－ *AB.-]*[${chineseAndMark}]+([A-Za-z-_/.]+|[0-9-_:/~－.]+|[${chineseAndMark}]+)*[${chineseAndMark}]+[\\w－ ]*[?!]?`, 'g');
// 数字开头的句子
const leftNumber = new RegExp(`(?<![\\w\\d])[\\d]?[${chineseAndMark}]+`, 'g');
// 英文在句子中间
const insideEn_1 = new RegExp(`[${chineseAndMark}]+[A-Za-z-_/]+[${chineseAndMark}]+`, 'g');
const insideEn_2 = new RegExp(`[${chineseAndMark}]+[A-Za-z-_/]+[${chineseAndMark}]+[A-Za-z-_/]+[${chineseAndMark}]+`, 'g');
const insideEn_3 = new RegExp(`[${chineseAndMark}]+[A-Za-z-_/]+[${chineseAndMark}]+[A-Za-z-_/]+[${chineseAndMark}]+[A-Za-z-_/]+[${chineseAndMark}]+`, 'g');
const insideEn_4 = new RegExp(`[${chineseAndMark}]+[A-Za-z-_/]+[${chineseAndMark}]+[A-Za-z-_/]+[${chineseAndMark}]+[A-Za-z-_/]+[${chineseAndMark}]+[A-Za-z-_/]+[${chineseAndMark}]+`, 'g');
// const insideEn = new RegExp(`[${chineseAndMark}]+[${chineseAndMark}A-Za-z-_/]+[${chineseAndMark}]+`, 'g');
// const insideEn = new RegExp(`(\\d、|\\d.|[A-Fa-f]、|[A-Fa-f].)?[${chineseAndMark}]+[${chineseAndMark}A-Za-z-_/]+[${chineseAndMark}]+`, 'g');
// 数字在句子中间
const insideDigit_1 = new RegExp(`[${chineseAndMark}]+[0-9-_:/~]+[${chineseAndMark}]+`, 'g');
const insideDigit_2 = new RegExp(`[${chineseAndMark}]+[0-9-_:/~]+[${chineseAndMark}]+[0-9-_:/~]+[${chineseAndMark}]+`, 'g');
// 含英文的中文句子
const cnAndEnSentence = new RegExp(
  [
    insideEn_4.source,
    insideEn_3.source,
    insideEn_2.source,
    insideEn_1.source
  ].join('|'),
  'g'
);
const cnAndDigitSentence = new RegExp(
  [
    insideDigit_2.source,
    insideDigit_1.source
  ].join('|'),
  'g'
);
const chineseReg = new RegExp(
  [
    spaceChinese.source,
    // cnAndEnSentence.source,
    // cnAndDigitSentence.source,
    chineseSentenceMixedEnNumber.source,
    // chineseSentence.source,
    // leftNumber.source,
    singleChinese.source
  ].join('|'),
  'g'
);
const chineseRegList = [
  singleChinese,
  spaceChinese,
  chineseSentence,
  cnAndEnSentence,
];

const nonChineseReg = /[^\u4e00-\u9fa5]/g;

module.exports = {
  chineseMark,
  chineseReg,
  nonChineseReg
}
