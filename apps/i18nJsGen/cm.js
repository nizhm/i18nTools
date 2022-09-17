(async () => {
  const moduleName = 'cm';
  const sheetName = '9.16';
  const { excelToJs } = require('../../tools/i18nExcelToJs');
  await excelToJs(
    moduleName,
    sheetName,
    {
      resultFile: true
    }
  );
})();
