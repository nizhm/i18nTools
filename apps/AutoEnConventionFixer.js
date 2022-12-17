const {
  directoryReader,
  extractFiles
} = require('../tools/directoryReader.js');

const {
  readFileSync: reader,
  writeFileSync: writer
} = require('fs');

const { logger } = require('../tools/logger');

const path = require('path');

const axios = require('axios');

const AutoEnConventionFixer = async () => {
  logger(`##### Start auto fix EnConvention #####`);

  const langDir = 'D:\\Projects\\UMC\\umc-web\\src\\lang';

  // 读文件夹、读文件、提取js文件
  const dir = directoryReader(
    langDir,
    {
      includeExt: ['js'],
    }
  );
  const files = extractFiles(dir);
  const jsFiles = files['js'];

  // 提取英文文件
  const enLangFiles = jsFiles.filter(item => item.fileName.includes('en'));

  const total = enLangFiles.length;
  let count = 0;
  const items = [];
  while(enLangFiles.length) {
    const { filePath, fileName, directoryName } = enLangFiles.shift();
    logger(`File: ${directoryName}/${fileName} (${++count} of ${total})`);

    // 读取文件内容
    let fileContent = null;
    // 其他模块，读取英文文件
    fileContent = reader(filePath, 'utf8');

    items.push(...fileContent.match(/(?<=:[ \r\n]').*(?=',)/g))

    // 按照英文翻译规范自动校正
    const enConventionFixedContent = fileContent
      // 首字母大写校正
      .replace(
        /:[ \r\n]?'(.)/g,
        (match, g) => {
          console.log(match.replace(g, g.toUpperCase()))
          return match.replace(g, g.toUpperCase());
        }
      )
    ;

    // 回写文件
    writer(filePath, enConventionFixedContent);
  }

  const itemSet = new Set();
  items.forEach(item => {
    // 取所有的单词
    const els = (item.match(/(?<=\b)[\w]*(?=\b)/) || [])
      // 剔除纯数字
      .filter(val => !/^[\d]*$/.test(val))
      // 留下包含2个或两个以上大写字母的单词
      .filter(val => val.replace(/[^A-Z]/g, '').length > 1)
    ;
    // 去重
    itemSet.add(...els);
  })
  const itemList = Array.from(itemSet);
  itemList.shift();
  // console.log(JSON.stringify(itemList, null, 2));
  const l = [
    "APP",
    "ID",
    "RCS",
    "SP",
    "UMC",
    "MMS",
    "CTCC",
    "SMS",
    "QR",
    "RMS",
    "CUCC",
    "FlashSMS",
    "WeChat",
    "CMCC",
    "AIM",
    "WeCom",
    "IT",
    "IP",
    "CN",
    "EN",
    "API",
    "MO",
    "MSN",
    "OpenID",
    "QQ",
    "VIP",
    "GeTui",
    "ANT",
    "APK",
    "ChatBot",
    "TikTok",
    "FangSong",
    "SimHei",
    "JD",
    "KaiTi",
    "SimSun",
    "ChatbotID",
    "CPU",
    "MT",
    "RPT",
    "MW",
    "GIF",
    "CC",
    "DB",
    "EMP"
  ];
  logger(`##### Finish auto fix EnConvention #####`);
};

module.exports.AutoEnConventionFixer = AutoEnConventionFixer;

(async () => await AutoEnConventionFixer())();
