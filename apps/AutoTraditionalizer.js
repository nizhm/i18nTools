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

const AutoTraditionalizer = async () => {
  logger(`##### Start auto traditionalizer #####`);

  // 每次执行重新获取配置
  const { autoTraditionalizer } = require('./config');

  const {
    langDir,
    transferWeb,
    taskBlockSize
  } = autoTraditionalizer;

  // 获取在线繁体转换器html，并提取核心代码
  const { data } = await axios.get(transferWeb);
  const scriptContent = data.match(/<script language="JavaScript">\r\n<!--([\s\S]*)\/\/-->\r\n<\/script>/)[1];
  const transfer = (function () {
    eval(scriptContent)
    return {
      convert,
      traditionalized
    }
  })();

  // 读文件夹、读文件、提取js文件
  const dir = directoryReader(
    langDir,
    {
      includeExt: ['js'],
    }
  );
  const files = extractFiles(dir);
  const jsFiles = files['js'];

  // 提取繁体文件
  const traditionalLangFiles = jsFiles.filter(item => item.fileName.includes('TW') || item.fileName.includes('CHT'));

  const total = traditionalLangFiles.length;
  let count = 0;
  while(traditionalLangFiles.length) {
    const { filePath, fileName, directoryName } = traditionalLangFiles.shift();
    logger(`File: ${directoryName}/${fileName} (${++count} of ${total})`);

    // 读取文件内容
    let fileContent = null;
    if (fileName.includes('TW')) {
      // element-ui那份，直接读取繁体文件
      fileContent = reader(filePath, 'utf8');
    } else {
      // 其他模块，读取简体文件
      const zhFilePath = filePath.replace('CHT', '');
      fileContent = reader(zhFilePath, 'utf8');
    }

    // 转成繁体
    const traditionalizedContent = transfer.traditionalized(fileContent);

    // 回写文件
    writer(filePath, traditionalizedContent);
  }

  logger(`##### Finish auto traditionalizer #####`);
};

module.exports.AutoTraditionalizer = AutoTraditionalizer;
