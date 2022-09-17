(async () => {
  const moduleName = 'fgEdit';
  const sheetName = '模板编辑器-5G';
  const { excelToJs } = require('../../tools/i18nExcelToJs');
  await excelToJs(moduleName, sheetName);
})();

