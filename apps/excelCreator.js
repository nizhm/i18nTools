const {
  directoryReader,
  extractFiles,
  flatKeysList
} = require('../tools/directoryReader');

const { listToExcel } = require('../tools/i18nJsToExcel');

const path = require('path');

(async () => {
  const header = [
    { header: '模块', width: 10 },
    { header: '元素显示中文', width: 32 },
    { header: '元素显示繁体', width: 32 },
    { header: '元素显示英文', width: 32 },
    { header: 'i18nKey', width: 20 }
  ];

  const langPath = 'D:\\Projects\\UMC\\umc-web\\src\\lang';

  const excelFileName = path.basename(langPath);

  const excludeDirectory = [
    'node_modules',
    'elementLang',
    'cm',
    'auditManage',
    'monitoringCenter',
    'shortChain'
  ];
  const includeFile = ['js'];
  const langData = directoryReader(
    langPath,
    {
      excludeDirectory,
      includeFile
    }
  );
  const files = extractFiles(langData);
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

  langList = langList.map(
    ({ i18nKey, cnValue, twValue, enValue }) => [i18nKey, cnValue, twValue, enValue]
  );

  await listToExcel(
    header,
    langList,
    {
      fileName: excelFileName,
      sheetName: excelFileName
    }
  );
})();
