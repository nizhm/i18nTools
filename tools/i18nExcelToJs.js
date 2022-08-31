const { writeFileSync: writer, mkdirSync } = require('fs');
const ExcelJS = require('exceljs');
const { logger } = require('../logger');

const excelToJs = async (
  moduleName,
  sheetName,
  option = {}
) => {
  const defaultOption = {
    // Excel文件名；
    source: '../../input/模块管理.xlsx',
    // 是否保存每行数据处理结果到文件
    resultFile: false,
    // 因为无key值而被忽略的行信息是否保存到文件
    ignoredRowsFile: false,
    // 删除掉的行信息是否保存到文件
    deleteRowsFile: false,
    // 相同key，但简体、繁体、英文不完全一致的行（也就是key自动加数字后缀的行）是否保存到文件
    sameKeyDiffContentRowsFile: false,
    // 是否过滤与开发环境对应模块中重复的key
    filterDevExist: false,
    // 是否删除翻译中多余的空格（trim方法）
    trimText: true,
    // 开发环境的文件位置
    devDataFile_zh: 'D:\\Projects\\UMC\\umc-web\\src\\lang\\utplzh.js',
    devDataFile_zhCHT: 'D:\\Projects\\UMC\\umc-web\\src\\lang\\utplzhCHT.js',
    devDataFile_en: 'D:\\Projects\\UMC\\umc-web\\src\\lang\\utplen.js',
    // 首行中key、简体、繁体、英文列标识
    keyColumnName: 'key',
    cnColumnName: '元素显示中文',
    twColumnName: '元素显示繁体',
    enColumnName: '元素显示英文',
    resultColumnName: 'result'
  };
  const opt = Object.assign({}, defaultOption, option);

  const dataFile = opt.source;

  const resultFile = opt.resultFile;
  const ignoredRowsFile = opt.ignoredRowsFile;
  const deleteRowsFile = opt.deleteRowsFile;
  const sameKeyDiffContentRowsFile = opt.sameKeyDiffContentRowsFile;
  const filterDevExist = opt.filterDevExist;
  const devDataFile = opt.devDataFile_zh;
  const trimText = opt.trimText;

  const { keyColumnName, cnColumnName, twColumnName, enColumnName, resultColumnName } = opt;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(dataFile);
  const workSheet = workbook.getWorksheet(sheetName);

  const extractCellText = (cellValue) => {
    let value;
    try {
      const text = typeof cellValue === 'string' ? cellValue : cellValue.richText[0].text;
      value = trimText ? text.trim() : text;
    } catch (e) {
      logger(`Error when extracting text from cell: ${cellValue}`)
      value = null
    }
    return value;
  };

  // 获取key、简体、繁体、英文列的id
  let keyId, cnId, twId, enId, resultId;
  const headerRow = workSheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    const text = extractCellText(cell.value);
    switch(text) {
      case keyColumnName:
        keyId = colNumber;
        break;
      case cnColumnName:
        cnId = colNumber;
        break;
      case twColumnName:
        twId = colNumber;
        break;
      case enColumnName:
        enId = colNumber;
        break;
      // case resultColumnName:
      //   resultId = colNumber;
      //   break;
      default:
        break;
    }
  })
  let dataList = [];
  let ignoredRows = [];
  let resultStates = [];
  workSheet.eachRow((row, rowNumber) => {
    // 首行跳过
    if (rowNumber === 1) {
      resultStates.push({ idx: -1, result: 'result' });
      return;
    }
    // 没有key值的行跳过
    const key = row.getCell(keyId).value;
    if (!key) {
      ignoredRows.push({ row: rowNumber });
      resultStates.push({ idx: -1, result: 'Ignored' });
      return;
    }
    // 取数据
    const cnValue = row.getCell(cnId).value;
    const twValue = row.getCell(twId).value;
    const enValue = row.getCell(enId).value;
    const item = {
      key: extractCellText(key),
      cn: extractCellText(cnValue),
      tw: extractCellText(twValue),
      en: extractCellText(enValue)
    };
    resultStates.push({ idx: dataList.length, result: undefined });
    dataList.push(item);
  });
  ignoredRows = ignoredRows.map(item => JSON.stringify(item));
  logger(`ignored rows(empty key) count: ${ignoredRows.length}`);

  if (ignoredRowsFile) {
    writer(`../../output/${moduleName}_rows_ignored.txt`, ignoredRows.join('\n') + '\n');

  }

  /**
   * filter duplicate row
   *
   * 保留key值唯一的行、以及key值重复但各个值有区别的行；
   *
   * @param list {Array<Object>}
   * @return {Array<Object>} filtered list
   */
  function filterDuplicate(list) {
    let deleteRows = [];
    let sameKeyDiffContentRows = [];
    const keyMaps = new Map();
    list = list.filter((item, index) => {
      const key = item.key;
      const keyMap = keyMaps.get(key);
      // 首次出现的key 1.将json格式item放到Map；2.保留item；
      if (!keyMap) {
        resultStates.find(el => el.idx === index).result = 'OK';
        keyMaps.set(key, [JSON.stringify(item)]);
        return true
      }
      const currentJSON = JSON.stringify(item);
      // key值重复，且各个值跟之前出现过的完全一致，则过滤掉；
      if (keyMap.find(el => el === currentJSON)) {
        resultStates.find(el => el.idx === index).result = 'Deleted';
        deleteRows.push({ row: index + 2, key });
        return false;
      }
      // key值重复，但各个值有区别 1.将json格式item放到Map；2.更改item的key；3.保留item；
      const newKey = key + keyMap.length;
      sameKeyDiffContentRows.push({ row: index + 2, key, newKey });
      keyMap.push(currentJSON);
      item.key = newKey;
      resultStates.find(el => el.idx === index).result = newKey;
      return true;
    });
    deleteRows = deleteRows.map(item => JSON.stringify(item));
    logger(`deleted rows count: ${deleteRows.length}`);
    sameKeyDiffContentRows = sameKeyDiffContentRows.map(item => JSON.stringify(item));
    logger(`same key but different content rows count: ${sameKeyDiffContentRows.length}`)
    if (resultFile) {
      writer(`../../output/${moduleName}_result.txt`, resultStates.map(item => item.result).join('\n'));
    }
    if (deleteRowsFile) {
      writer(`../../output/${moduleName}_rows_deleted.txt`, deleteRows.join('\n') + '\n');
    }
    if (sameKeyDiffContentRowsFile) {
      writer(`../../output/${moduleName}_rows_same-diff.txt`, sameKeyDiffContentRows.join('\n') + '\n');
    }

    return list;
  }
  logger(`${moduleName} Total：${dataList.length}`);
  // 过滤自身重复值；
  dataList = filterDuplicate(dataList);
  logger(`${moduleName} Total(without deleted rows)：${dataList.length}`);
  if (filterDevExist) {
    // 过滤已经放到项目中的key；
    const devData = require(devDataFile);
    const devDataKeys = Object.keys(devData[moduleName]);
    dataList = dataList.filter(({ key }) => !devDataKeys.includes(key));
    logger(dataList.length);
    if (!dataList.length) {
      logger('Do not add new entry!');
      return
    }
  }

  const cnData = {},
    twData = {},
    enData = {};
  for(const { key, cn, tw, en } of dataList) {
    cnData[key] = cn;
    twData[key] = tw;
    enData[key] = en;
  }

  function jsonToJS(json) {
    json = JSON.stringify(json, null, 2);
    json = json
      .replace(/"\S*":/g, key => key.replace(/"/g, ''))
      .replace(/'/g, "\\'")
      .replace(/&nbsp;/g, "")
      .replace(/"/g, "'");
    return `module.exports = ${json}\n`;
  }
  const cnJSON = {};
  cnJSON[moduleName] = cnData;
  const twJSON = {};
  twJSON[moduleName] = twData;
  const enJSON = {};
  enJSON[moduleName] = enData;
  const cnJS = jsonToJS(cnJSON);
  const twJS = jsonToJS(twJSON);
  const enJS = jsonToJS(enJSON);

  writer(`../../output/${moduleName}_cn.js`, cnJS);
  writer(`../../output/${moduleName}_tw.js`, twJS);
  writer(`../../output/${moduleName}_en.js`, enJS);
  logger(
    `I18n files of module "${moduleName}" have been created successfully.\r\n` +
    `Find them in the "output" directory.`
  );
};

const allToJs = async (
  sheetName,
  option = {}
) => {
  const defaultOption = {
    // Excel文件名；
    source: '../../input/模块管理.xlsx',
    // 是否保存每行数据处理结果到文件
    resultFile: false,
    // 是否删除翻译中多余的空格（trim方法）
    trimText: true,
    // 首行中模块、key、简体、繁体、英文列标识
    moduleColumnName: '模块',
    keyColumnName: 'key',
    cnColumnName: '元素显示中文',
    twColumnName: '元素显示繁体',
    enColumnName: '元素显示英文'
  };
  const opt = Object.assign({}, defaultOption, option);

  const dataFile = opt.source;

  const resultFile = opt.resultFile;
  const trimText = opt.trimText;

  const { moduleColumnName, keyColumnName, cnColumnName, twColumnName, enColumnName } = opt;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(dataFile);
  const workSheet = workbook.getWorksheet(sheetName);

  const extractCellText = (cellValue) => {
    let value;
    try {
      const text = typeof cellValue === 'string' ? cellValue : cellValue.richText[0].text;
      value = trimText ? text.trim() : text;
    } catch (e) {
      logger(`Error when extracting text from cell: ${cellValue}`)
      value = null
    }
    return value;
  };

  // 获取模块、key、简体、繁体、英文列的id
  let moduleId, keyId, cnId, twId, enId;
  const headerRow = workSheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    const text = extractCellText(cell.value);
    switch(text) {
      case keyColumnName:
        keyId = colNumber;
        break;
      case cnColumnName:
        cnId = colNumber;
        break;
      case twColumnName:
        twId = colNumber;
        break;
      case enColumnName:
        enId = colNumber;
        break;
      case moduleColumnName:
        moduleId = colNumber;
        break;
      default:
        break;
    }
  });

  let dataList = [];
  let resultStates = [];
  workSheet.eachRow((row, rowNumber) => {
    // 首行跳过
    if (rowNumber === 1) {
      resultStates.push({ idx: -1, result: 'result' });
      return;
    }
    // 没有key值的行跳过
    const key = row.getCell(keyId).value;
    if (!key) {
      resultStates.push({ idx: -1, result: 'Ignored' });
      return;
    }
    // 取数据
    const cnValue = row.getCell(cnId) ? row.getCell(cnId).value : '';
    const twValue = row.getCell(twId).value ? row.getCell(twId).value : '';
    const enValue = row.getCell(enId).value ? row.getCell(enId).value : '';
    const moduleName = row.getCell(moduleId) ? row.getCell(moduleId).value : '';
    const item = {
      idx: dataList.length,
      key: extractCellText(key),
      cn: extractCellText(cnValue),
      tw: extractCellText(twValue),
      en: extractCellText(enValue),
      moduleName: extractCellText(moduleName)
    };
    resultStates.push({ idx: dataList.length, result: undefined });
    dataList.push(item);
  });

  // writer(`../../output/list.json`, JSON.stringify(dataList, null, 2));

  /**
   * filter duplicate row
   *
   * 保留key值唯一的行、以及key值重复但各个值有区别的行；
   *
   * @param list {Array<Object>}
   * @return {Array<Object>} filtered list
   */
  function filterDuplicate(list) {
    const keyMaps = new Map();
    list = list.filter((item) => {
      const key = item.key;
      const keyMap = keyMaps.get(key);
      // 首次出现的key 1.将json格式item放到Map；2.保留item；
      if (!keyMap) {
        resultStates.find(el => el.idx === item.idx).result = 'OK';
        keyMaps.set(key, [JSON.stringify(item)]);
        return true
      }
      const currentJSON = JSON.stringify(item);
      // key值重复，且各个值跟之前出现过的完全一致，则过滤掉；
      if (keyMap.find(el => el === currentJSON)) {
        resultStates.find(el => el.idx === item.idx).result = 'Deleted';
        return false;
      }
      // key值重复，但各个值有区别 1.将json格式item放到Map；2.更改item的key；3.保留item；
      const newKey = key + keyMap.length;
      keyMap.push(currentJSON);
      item.key = newKey;
      resultStates.find(el => el.idx === item.idx).result = newKey;
      return true;
    });
    return list;
  }

  logger(`##### Start allToJS ##### `);
  logger(`Total：${dataList.length}`);
  let moduleList = dataList.map(el => el.moduleName);
  moduleList = [...new Set(moduleList)];
  const moduleKeys = {};
  for(const moduleName of moduleList) {
    moduleKeys[moduleName] = dataList.filter(item => item.moduleName === moduleName);
  }

  while(moduleList.length) {
    const moduleName = moduleList.shift();
    let dataList = moduleKeys[moduleName];
    logger(`${moduleName || 'common'} module total: ${dataList.length}`);
    dataList = filterDuplicate(dataList);
    logger(`${moduleName || 'common'} module reserved: ${dataList.length}`);

    const cnData = {},
      twData = {},
      enData = {};
    for(const { key, cn, tw, en } of dataList) {
      cnData[key] = cn;
      twData[key] = tw;
      enData[key] = en;
    }

    function jsonToJS(json) {
      json = JSON.stringify(json, null, 2);
      json = json
        .replace(/"\S*":/g, key => key.replace(/"/g, ''))
        .replace(/'/g, "\\'")
        .replace(/&nbsp;/g, "")
        .replace(/"/g, "'");
      return `module.exports = ${json}\n`;
    }
    const cnJSON = {};
    cnJSON[moduleName] = cnData;
    const twJSON = {};
    twJSON[moduleName] = twData;
    const enJSON = {};
    enJSON[moduleName] = enData;
    const cnJS = jsonToJS(cnJSON);
    const twJS = jsonToJS(twJSON);
    const enJS = jsonToJS(enJSON);

    if (!moduleName) {
      writer(`../../output/zh.js`, cnJS);
      writer(`../../output/zhCHT.js`, twJS);
      writer(`../../output/en.js`, enJS);
    } else {
      const moduleDir = `../../output/${moduleName}`;
      try {
        mkdirSync(moduleDir);
      } catch (e) {
        const  alreadyExists = e.message.includes(' already exists');
        if (alreadyExists) {
          logger(`Directory already exists: ${moduleDir}`);
        } else {
          console.trace(e);
        }
      }
      writer(`${moduleDir}/zh.js`, cnJS);
      writer(`${moduleDir}/zhCHT.js`, twJS);
      writer(`${moduleDir}/en.js`, enJS);
    }
  }

  if (resultFile) {
    writer(`../../output/result.txt`, resultStates.map(item => item.result).join('\n'));
    logger(`File \`result.txt\` shows state of each row`);
  }
  logger(
    `All i18n files have been created successfully.\r\n` +
    `Find them in the \`output\` directory.`
  );
  logger(`##### Finish allToJS successfully ##### `);
};

module.exports = {
  excelToJs,
  allToJs
}
