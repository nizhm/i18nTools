(async () => {
  const sheetName = '前端一期翻译汇总';
  const { allToJs } = require('../../tools/i18nExcelToJs');
  await allToJs(
    sheetName,
    {
      resultFile: true
    }
  );
})();
