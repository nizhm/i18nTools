const {
  directoryReader,
  extractFiles,
  flatKeysList
} = require('../../tools/directoryReader');

const { listToExcel } = require('../../tools/i18nJsToExcel');

const { writeFileSync: writer } = require('fs');

const path = require('path');

const { logger } = require('../../tools/logger');

const { excelCreator } = require('../config');

(async () => {
  const {
    header,
    langPath,
    moduleLevel
  } = excelCreator;
  const excelFileName = path.basename(langPath);

  const excludeDirectory = [
    'node_modules',
    'elementLang'
  ];
  const includeExt = ['js'];

  // 开始读lang文件
  logger('#####  Start excelCreator #####');
  const langData = directoryReader(
    langPath,
    {
      excludeDirectory,
      includeExt
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

  // 提取翻译信息
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

  // 将简体数据的key转换成i18nKey
  let langList = flatKeysList(cnData, moduleLevel);
  const twEmptyList = [];
  const enEmptyList = [];
  // 以简体数据的key为标准，从繁体、英文中提取数据
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

    // 如果繁体、英文中对应key值没有数据（包括空字符及undefined），加到对应的空缺List；
    if (!twValue) {
      twEmptyList.push({ ...item });
    }
    if (!enValue) {
      enEmptyList.push({ ...item });
    }
  }

  // 发现繁体、英文中有空缺值时，生成json
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

  // 按表头顺序排列数据
  const headerLen = header.length;
  langList = langList.map(({ moduleName, cnValue, twValue, enValue, _key }) => {
    const row = [moduleName, cnValue, twValue, enValue, _key, _key];
    row.length = headerLen;
    return row;
  });

  // 生成excel
  await listToExcel(
    header,
    langList,
    {
      fileName: excelFileName,
      sheetName: excelFileName
    }
  );
  logger(`Excel file \`${excelFileName}_*.xlsx\` has been created in the \`output\` directory successfully!`);
  logger('#####  Finish excelCreator #####');
})();
