const ExcelJS = require('exceljs');

const listToExcel = async (
  header = [],
  data = [],
  option
) => {
  const defaultOption = {
    fileName: 'lang',
    sheetName: 'lang'
  };
  const opt = Object.assign({}, defaultOption, option);
  const {
    fileName,
    sheetName
  } = opt;

  const output = `../output/${fileName}.xlsx`;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = header;
  sheet.addRows(data);
  await workbook.xlsx.writeFile(output);
};

module.exports = {
  listToExcel
}
