(async () => {
  const moduleName = 'common';
  const sheetName = '通用词语汇总';
  const { excelToJs } = require('../../tools/i18nExcelToJs');
  await excelToJs(
    moduleName,
    sheetName,
    {
      resultFile: true
    }
  );
})();
