(async () => {
  const moduleName = 'monitorCenter';
  const sheetName = '一期已完成（9.9前）';
  const { excelToJs } = require('../../tools/i18nExcelToJs');
  await excelToJs(
    moduleName,
    sheetName,
    {
      resultFile: true
    }
  );
})();
