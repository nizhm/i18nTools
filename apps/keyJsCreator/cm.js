(async () => {
  const moduleName = 'cm';
  const sheetName = '通信管理-陈栩杰';
  const { excelToJs } = require('../../tools/i18nExcelToJs');
  await excelToJs(
    moduleName,
    sheetName,
    {
      resultFile: true
    }
  );
})();
