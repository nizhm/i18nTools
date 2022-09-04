const {
  directoryReader,
  extractFiles
} = require('../tools/directoryReader.js');

const { autoReplacer, chineseInspector } = require('./config');

const {
  readFileSync: reader,
  writeFileSync: writer
} = require('fs');

const { logger } = require('../logger');

const path = require('path');

const { replaceComments } = require('../tools/i18nAutoReplacement');

const { flatKeysList } = require('../tools/directoryReader');

const { chineseReg, nonChineseReg, chineseMark } = require('../tools/i18nInspection');

(async () => {
  // 检索中文的文件夹，此处可以对应autoPlacer，用于检查刚才替换漏掉的中文；
  const {
    directoryPath,
    excludeDirectory,
    excludeFile,
    includeExt,
    additionalFileList
  } = autoReplacer;

  const {
    excludeComments,
    taskBlockSize
  } = chineseInspector;

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
      let matches = fileText.match(chineseReg) || [];
      chineseList.push(...matches);
    }
  }

  chineseList = [...new Set(chineseList)];
  const specialChar = chineseMark + '/[]?!';
  chineseList = chineseList.filter(el => !(el.length === 1 && specialChar.includes(el)));
  // writer('../output/chinese1.json', JSON.stringify(chineseList, null, 2));
  // return;

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
  const nonChineseReg = /[^\u4e00-\u9fa5]/g;
  const cnList = langList.map(el => {
    const text = el.cnValue.replace(nonChineseReg, '');
    el.text = text;
    return el;
  });

  const chineseInfo = {
    existKey: [],
    noDirectKey: []
  };
  for(const chinese of chineseList) {
    const cn = chinese.replace(nonChineseReg, '');
    const item = cnList.find(el => el.text === cn);
    if (item && item.text) {
      chineseInfo.existKey.push(item);
      continue;
    }

    chineseInfo.noDirectKey.push(chinese);
  }

  logger(`Total found chinese:${chineseList.length}`);
  writer('../output/chinese.json', JSON.stringify(chineseInfo, null, 2));
  logger(`Find \`chinese.json\` in \`output\``);
  logger(`##### Finish chinese inspector #####`);
})();
