(async () => {
  const moduleName = 'fgTemplate';
  const sheetName = '待转换中文';
  const { i18nReader } = require('../reader/i18nReader');
  await i18nReader(moduleName, sheetName);
})();
