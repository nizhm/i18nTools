(async () => {
  const moduleName = 'rmsEdit';
  const sheetName = '模板编辑器-富信';
  const { excelToJs } = require('../../tools/i18nExcelToJs');
  await excelToJs(moduleName, sheetName);
})();

