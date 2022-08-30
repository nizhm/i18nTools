(async () => {
  const moduleName = 'fgTemplate';
  const sheetName = '5G消息-舒静';
  const { i18nReader } = require('../reader/i18nReader');
  await i18nReader(moduleName, sheetName);
})();
