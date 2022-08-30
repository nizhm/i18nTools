(async () => {
  const moduleName = 'fgTemplate';
  const sheetName = '5G消息-舒静';
  const { excelToJs } = require('../../tools/i18nExcelToJs');
  await excelToJs(moduleName, sheetName);
})();
