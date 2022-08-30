(async () => {
  const moduleName = 'rmsEdit';
  const sheetName = '模板编辑器-富信';
  const { i18nReader } = require('../reader/i18nReader');
  await i18nReader(moduleName, sheetName);
})();

