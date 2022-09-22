const ExcelJS = require('exceljs');
const { writeFileSync: writer } = require('fs');

(async () => {
  const dataFile = '../../input/翻译0922.xlsx';
  const sheetName = '统一翻译0921';
  const cnColumnName = '元素显示中文';
  const enColumnName = '元素显示英文';

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(dataFile);
  const workSheet = workbook.getWorksheet(sheetName);

  const extractCellText = (cellValue) => {
    let value;
    try {
      const text = typeof cellValue === 'string' ? cellValue : cellValue.richText[0].text;
      value = text.trim();
    } catch (e) {
      console.log(`Error when extracting text from cell: ${cellValue}`)
      value = null
    }
    return value;
  };

  let cnId, enId;
  const headerRow = workSheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    const text = extractCellText(cell.value);
    switch(text) {
      case cnColumnName:
        cnId = colNumber;
        break;
      case enColumnName:
        enId = colNumber;
        break;
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
      return;
    }
    // 取数据
    const cnValue = row.getCell(cnId).value;
    const enValue = row.getCell(enId).value;
    const item = {
      onlineCn: extractCellText(cnValue),
      onlineEn: extractCellText(enValue)
    };
    dataList.push(item);
  });

  console.log(dataList.length);
  writer(`../../output/dataList.json`, JSON.stringify(dataList, null, 2));

  const cmZhPath = 'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\monitorCenter\\zh.js';
  const cmEnPath = 'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\monitorCenter\\en.js';
  const cmZh = require(cmZhPath).monitorCenter;
  const cmEn = require(cmEnPath).monitorCenter;
  const cmList = [];
  const reg = /[^\u4e00-\u9fa5]/g;
  for(const [key, cn] of Object.entries(cmZh)) {
    const item = {};
    item.key = key;
    item.cn = cn;
    // item.cnVal = cn.replace(reg, '');
    item.en = eval(`cmEn.${key}`);
    cmList.push(item);
  }

  const diffList = [];
  for(const { onlineCn, onlineEn } of dataList) {
    // const onlineCnVal = onlineCn.replace(reg, '');
    const cmItem = cmList.find(el => el.cn === onlineCn);
    if (!cmItem) {
      console.log(onlineCn);
      continue;
    }
    const en = cmItem.en;
    if (onlineEn !== en) {
      cmItem.onlineEn = onlineEn;
      diffList.push(cmItem);
    }
  }
  writer(`../../output/diffList.json`, JSON.stringify(diffList, null, 2));
})();
