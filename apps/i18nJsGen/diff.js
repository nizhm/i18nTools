/**
 * 对比两份表格，相同简体中文但英文翻译不同的条目，并生成diff.json
 */
const ExcelJS = require('exceljs');
const { writeFileSync: writer } = require('fs');

(async () => {
  const dataFile = '../../input/翻译0922.xlsx';
  const sheetNameA = '11.28';
  const sheetNameB = '5.0多语言梳理';
  const cnColumnName = '元素显示中文';
  const twColumnName = '元素显示繁体';
  const enColumnName = '元素显示英文';

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(dataFile);
  const workSheetA = workbook.getWorksheet(sheetNameA);
  const workSheetB = workbook.getWorksheet(sheetNameB);

  const extractCellText = (cellValue) => {
    let value;
    try {
      const text = typeof cellValue === 'string' ? cellValue : cellValue.richText[0].text;
      value = text.trim().replace(/\n/g, ' ');
    } catch (e) {
      console.log(`Error when extracting text from cell: ${cellValue}`)
      value = null
    }
    return value;
  };

  let cnId, twId, enId;
  const dataListA = [];
  workSheetA.getRow(1).eachCell((cell, colNumber) => {
    const text = extractCellText(cell.value);
    switch(text) {
      case cnColumnName:
        cnId = colNumber;
        break;
      case twColumnName:
        twId = colNumber;
        break;
      case enColumnName:
        enId = colNumber;
        break;
      default:
        break;
    }
  })
  workSheetA.eachRow((row, rowNumber) => {
    // 首行跳过
    if (rowNumber === 1) {
      return;
    }
    // 取数据
    const cnValue = row.getCell(cnId).value;
    const twValue = row.getCell(twId).value;
    const enValue = row.getCell(enId).value;
    const item = {
      cn: extractCellText(cnValue),
      tw: extractCellText(twValue),
      en: extractCellText(enValue)
    };
    dataListA.push(item);
  });

  const dataListB = [];
  workSheetB.getRow(1).eachCell((cell, colNumber) => {
    const text = extractCellText(cell.value);
    switch(text) {
      case cnColumnName:
        cnId = colNumber;
        break;
      case twColumnName:
        twId = colNumber;
        break;
      case enColumnName:
        enId = colNumber;
        break;
      default:
        break;
    }
  })
  workSheetB.eachRow((row, rowNumber) => {
    // 首行跳过
    if (rowNumber === 1) {
      return;
    }
    // 取数据
    const cnValue = row.getCell(cnId).value;
    const twValue = row.getCell(twId).value;
    const enValue = row.getCell(enId).value;
    const item = {
      cn: extractCellText(cnValue),
      tw: extractCellText(twValue),
      en: extractCellText(enValue)
    };
    dataListB.push(item);
  });

  const diffList = []
  dataListA.forEach(item => {
    const bItem = dataListB.find(el => el.cn === item.cn)
    bItem && item.en !== bItem.en && diffList.push({
      [sheetNameA]: item,
      [sheetNameB]: bItem
    })
  })

  diffList.unshift({ TotalDiffCount: diffList.length || 'No different item!' })
  writer(`../../output/diff.json`, JSON.stringify(diffList, null, 2));
})();
