const {
  directoryReader,
  extractFiles
} = require('../tools/directoryReader.js');

const {
  readFileSync: reader,
  writeFileSync: writer
} = require('fs');

const { logger } = require('../logger');

const path = require('path');

const { replaceComments } = require('../tools/i18nAutoReplacement');
const { flatKeysList } = require('../tools/directoryReader');

(async () => {
  // 检索中文的文件夹
  const directoryPath = 'D:\\Projects\\UMC\\dev\\umc-web\\src\\views\\fg\\template';
  const excludeDirectory = ['node_modules', 'backend-emp', 'frontend-emp', 'security-emp'];
  const excludeFile = ['ChannelNumItem-emp.vue'];
  const includeExt = ['vue'];

  // 额外的文件
  const additionalFileList = [
    // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\components\\Collapse.vue',
    // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\components\\PageLimitsItem.vue'
  ];

  // 是否忽略注释里的内容；
  const excludeComments = true;

  // 单次任务检索的文件数
  const taskBlockSize = 10;

  logger(`##### Start chinese inspector #####`);

  logger(`##### Reading directory #####`);
  // 读取目标文件夹中所有文件
  const directoryContent = directoryReader(
    directoryPath,
    {
      excludeDirectory,
      excludeFile,
      includeExt
    }
  );
  const files = extractFiles(directoryContent, additionalFileList);

  // 开始
  const taskBlockQueue = [];
  const fileList = [];

  for(const [fileType, list] of Object.entries(files)) {
    fileList.push(...list);
    logger(`${fileType} file:${list.length}`);
  }
  const totalFileCount = fileList.length;
  logger(`Total file:${totalFileCount}`);
  let currentFileCount = 0;

  let chineseList = [];

  // 处理js文件
  while(fileList.length) {
    taskBlockQueue.push([...fileList.splice(0, taskBlockSize)]);
  }
  while(taskBlockQueue.length) {
    const files = taskBlockQueue.shift();
    // 读文件
    for(const file of files) {
      currentFileCount++;
      logger(`Current file:${path.basename(file.filePath)}(${currentFileCount}/${totalFileCount})`)
      let fileText;
      try {
        fileText = reader(file.filePath, 'utf8');
      } catch (e) {
        logger(`Error while reading File \`${file.filePath}\``);
        console.trace(e);
        continue;
      }

      if (excludeComments) {
        fileText = replaceComments(fileText);
      }
      const chineseReg = /[\u4e00-\u9fa5，（）。？！、；：]+/g;
      let matches = fileText.match(chineseReg) || [];
      chineseList.push(...matches);
    }
  }

  chineseList = [...new Set(chineseList)];

  const langPath = 'D:\\Projects\\UMC\\umc-web\\src\\lang';

  // 开始读文件
  const langData = directoryReader(
    langPath,
    {
      excludeDirectory: [
        'node_modules',
        'elementLang'
      ],
      includeExt: ['js']
    }
  );
  const langFile = extractFiles(langData);
  const langFileList = langFile['js'];
  const transFiles = {};
  for(const jsFile of langFileList) {
    const { fileName, filePath, directoryName } = jsFile;
    if (!transFiles[directoryName]) {
      transFiles[directoryName] = {};
    }
    transFiles[directoryName][fileName] = filePath;
  }

  const cnData = {};
  for(const [, files] of Object.entries(transFiles)) {
    const cn = require(files['zh.js']);
    Object.assign(cnData, cn);
  }

  const moduleLevel = [
    [],
    // ['common'],
    ['aimEdit'],
    ['contact'],
    ['fgEdit'],
    ['fgTemplate'],
    ['headerIcon'],
    ['loginPage'],
    ['rmsEdit'],
    ['statistics'],
    ['templateManage'],
    ['utplSend'],
    ['utpltemplate'],
    // ['cm'],
    // ['auditManage'],
    // ['monitoringCenter'],
    // ['shortChain']
  ];
  const langList = flatKeysList(cnData, moduleLevel);
  const notHanZiReg = /[^\u4e00-\u9fa5]/g;
  const cnList = langList.map(el => el.cnValue.replace(notHanZiReg, ''));

  const chineseInfo = {
    existKey: [],
    noDirectKey: []
  };
  for(const chinese of chineseList) {
    const cn = chinese.replace(notHanZiReg, '');
    if (cnList.includes(cn)) {
      chineseInfo.existKey.push(chinese);
      continue;
    }

    chineseInfo.noDirectKey.push(chinese);
  }

  logger(`Total found chinese:${chineseList.length}`);
  writer('../output/chinese.json', JSON.stringify(chineseInfo, null, 2));
  logger(`Find \`chinese.json\` in \`output\``);
  logger(`##### Finish chinese inspector #####`);
})();
