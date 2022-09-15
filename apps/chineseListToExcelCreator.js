const {
  directoryReader,
  extractFiles,
  flatKeysList
} = require('../tools/directoryReader');

const { listToExcel } = require('../tools/i18nJsToExcel');

const { writeFileSync: writer } = require('fs');

const path = require('path');

const { logger } = require('../logger');

(async () => {
  const header = [
    { header: '模块', width: 20 },
    { header: '元素显示中文', width: 45 },
    { header: '元素显示繁体', width: 45 },
    { header: '元素显示英文', width: 45 },
    { header: '_key', width: 25 },
    { header: 'key', width: 25 }
  ];

  const chineseListData = require('../output/chinese');
  const chineseList = chineseListData.chineseList;

  const langList = chineseList.map(cnValue => {
    return ['cm', cnValue, '', '', '', ''];
  });

  const excelFileName = 'chineseListExcel';

  await listToExcel(
    header,
    langList,
    {
      fileName: excelFileName,
      sheetName: excelFileName
    }
  );
  logger(`Excel file \`${excelFileName}_*.xlsx\` has been created in the \`output\` directory successfully!`);
  logger('#####  Finish Read lang Files #####');
})();
