const path = require('path');

(async () => {
  const moduleName = 'chineseList';
  const sheetName = 'chineseListExcel';
  const source = path.resolve('../../output/chineseListExcel.xlsx');
  const { excelToJs } = require('../../tools/i18nExcelToJs');
  await excelToJs(
    moduleName,
    sheetName,
    {
      resultFile: true,
      source
    }
  );
})();
