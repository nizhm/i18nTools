(async () => {
  const moduleName = 'fgTemplate';
  const sheetName = '5Gæ¶æ¯-èé';
  const { excelToJs } = require('../../tools/i18nExcelToJs');
  await excelToJs(moduleName, sheetName);
})();
