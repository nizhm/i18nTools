(async () => {
  const moduleName = 'fgEdit';
  const sheetName = '模板编辑器-5G';
  const { i18nReader } = require('../reader/i18nReader');
  await i18nReader(moduleName, sheetName);
})();

