(async () => {
  const moduleName = 'cm';
  const sheetName = '通信管理-陈栩杰';
  const { i18nReader } = require('../reader/i18nReader');
  await i18nReader(
    moduleName,
    sheetName,
    {
      resultFile: true
    }
  );
})();
