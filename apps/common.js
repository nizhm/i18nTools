(async () => {
  const moduleName = 'common';
  const sheetName = '通用词语汇总';
  const { i18nReader } = require('../reader/i18nReader');
  await i18nReader(
    moduleName,
    sheetName,
    {
      resultFile: true
    }
  );
})();
