(async () => {
  const moduleName = 'fgTemplate';
  const sheetName = '待转换中文';
  const { excelToJs } = require('../../tools/i18nExcelToJs');
  await excelToJs(moduleName, sheetName);
})();
