const path = require('path')
const {
  directoryReader,
  extractFiles,
  flatKeysList
} = require('./directoryReader');

const langPath = 'D:\\Projects\\UMC\\umc-web\\src\\lang';

const excludeDirectory = [
  'node_modules',
  'elementLang',
  'cm',
  'auditManage',
  'monitoringCenter',
  'shortChain'
];
const includeFile = ['js'];
const langContent = directoryReader(
  langPath,
  {
    excludeDirectory,
    includeFile
  }
);
const files = extractFiles(langContent);
const jsFiles = files['js'];
const transFiles = {};
for(const jsFile of jsFiles) {
  const { fileName, filePath, directoryName } = jsFile;
  if (!transFiles[directoryName]) {
    transFiles[directoryName] = {};
  }
  transFiles[directoryName][fileName] = filePath;
}

const cnData = {};
const twData = {};
const enData = {};
for(const [, files] of Object.entries(transFiles)) {
  const cn = require(files['zh.js']);
  const tw = require(files['zhCHT.js']);
  const en = require(files['en.js']);
  Object.assign(cnData, cn);
  Object.assign(twData, tw);
  Object.assign(enData, en);
}

const moduleLevel = [
  [],
  ['common'],
  ['aimEdit'],
  ['contact'],
  ['fgEdit'],
  ['fgTemplate'],
  ['headerIcon'],
  ['loginPage'],
  ['rmsEdit'],
  ['statistics'],
  ['templateManage'],
  ['utplSend'],
  ['utpltemplate']
];
let langList = flatKeysList(cnData, moduleLevel);
for(const item of langList) {
  const { i18nKey } = item;
  const splitor = '.';
  let moduleName;
  if (i18nKey.includes(splitor)) {
    moduleName = i18nKey.split(splitor)[0];
  } else {
    moduleName = 'public';
  }
  item['moduleName'] = moduleName;
  item['twValue'] = eval(`twData.${i18nKey}`);
  item['enValue'] = eval(`enData.${i18nKey}`);
}
console.log(langList.length);


function jsonToJS(json) {
  json = JSON.stringify(json, null, 2);
  json = json
    .replace(/"\S*":/g, key => key.replace(/"/g, ''))
    .replace(/'/g, "\\'")
    .replace(/&nbsp;/g, "")
    .replace(/"/g, "'");
  return `module.exports = ${json}\n`;
}

// const json = JSON.stringify(cnData, null, 2);
const { writeFileSync: writer } = require('fs');
for(const row of langList) {

}
writer(`../output/${path.basename(langPath)}_list.js`, jsonToJS(langList));
// writer(`../output/${path.basename(langPath)}_tw.js`, jsonToJS(twData));
// writer(`../output/${path.basename(langPath)}_en.js`, jsonToJS(enData));
