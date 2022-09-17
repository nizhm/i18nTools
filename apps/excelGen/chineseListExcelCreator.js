const { listToExcel } = require('../../tools/i18nJsToExcel');

const { logger } = require('../../tools/logger');

const { chineseListExcelCreator } = require('../config');

(async () => {
  const {
    header,
    excelFileName
  } = chineseListExcelCreator;

  const chineseListData = require('../../output/chinese.json');
  const chineseList = chineseListData.noDirectKey;

  const langList = chineseList.map(cnValue => {
    return [cnValue, '', '', '', ''];
  });

  await listToExcel(
    header,
    langList,
    {
      fileName: excelFileName,
      sheetName: excelFileName,
      isSoleFile: false
    }
  );
  logger(`Excel file \`${excelFileName}_*.xlsx\` has been created in the \`output\` directory successfully!`);
  logger('#####  Finish Read lang Files #####');
})();
