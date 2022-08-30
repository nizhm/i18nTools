const path = require('path')
const { directoryReader, extractFiles } = require('./directoryReader');

const langPath = 'D:\\Projects\\UMC\\umc-web\\src\\lang';

const excludeDirectory = ['node_modules', 'elementLang'];
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
  if (fileName.includes('utpl')) {
    continue;
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
  Object.assign(enData, en)
}

const json = JSON.stringify(cnData, null, 2);
const { writeFileSync: writer } = require('fs');
writer(`../output/${path.basename(langPath)}.json`, json);
