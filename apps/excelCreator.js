const {
  directoryReader,
  extractFiles,
  flatKeysList
} = require('../tools/directoryReader');

const { listToExcel } = require('../tools/i18nJsToExcel');

const { writeFileSync: writer } = require('fs');

const path = require('path');

const { logger } = require('../logger');

(async () => {
  const header = [
    { header: '模块', width: 20 },
    { header: '元素显示中文', width: 45 },
    { header: '元素显示繁体', width: 45 },
    { header: '元素显示英文', width: 45 },
    { header: 'key', width: 25 }
  ];

  const langPath = 'D:\\Projects\\UMC\\umc-web\\src\\lang';

  const excelFileName = path.basename(langPath);

  const excludeDirectory = [
    'node_modules',
    'elementLang'
  ];
  const includeFile = ['js'];

  // 开始读文件
  logger('#####  Start to Read lang Files #####');
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
    ['utpltemplate'],
    ['cm'],
    ['auditManage'],
    ['monitoringCenter'],
    ['shortChain']
  ];
  let langList = flatKeysList(cnData, moduleLevel);
  const twEmptyList = [];
  const enEmptyList = [];
  for(const item of langList) {
    const { i18nKey } = item;
    const splitor = '.';
    let moduleName, _key;
    if (i18nKey.includes(splitor)) {
      const [module, key] = i18nKey.split(splitor);
      moduleName = module;
      _key = key;
    } else {
      moduleName = '';
      _key = i18nKey;
    }

    item['moduleName'] = moduleName;
    item['_key'] = _key;
    const twValue = eval(`twData.${i18nKey}`);
    const enValue = eval(`enData.${i18nKey}`);
    item['twValue'] = twValue;
    item['enValue'] = enValue;

    if (!twValue) {
      twEmptyList.push({ ...item });
    }
    if (!enValue) {
      enEmptyList.push({ ...item });
    }
  }

  const twEmptyCount = twEmptyList.length;
  const enEmptyCount = enEmptyList.length;
  if (twEmptyCount) {
    writer('../output/zhCHT_Empty.json', JSON.stringify(twEmptyList, null, 2));
    logger(`There are ${twEmptyCount} keys absent in \`zhCHT\``);
    logger(`Find \`zhCHT_Empty.json\` in the output directory`);
  }
  if (enEmptyList) {
    writer('../output/en_Empty.json', JSON.stringify(enEmptyList, null, 2));
    logger(`There are ${enEmptyCount} keys absent in \`en\``);
    logger(`Find \`en_Empty.json\` in the output directory`);
  }

  langList = langList.map(({ moduleName, cnValue, twValue, enValue, _key }) => {
    return [moduleName, cnValue, twValue, enValue, _key];
  });

  await listToExcel(
    header,
    langList,
    {
      fileName: excelFileName,
      sheetName: excelFileName
    }
  );
  logger(`Excel file \`${excelFileName}_*.xlsx\` has been created in the \`output\` directory successfully!`);
  logger('#####  Finish Read lang Files #####');
})();
