const {
  directoryReader,
  extractFiles
} = require('../tools/directoryReader.js');

const {
  readFileSync: reader,
  writeFileSync: writer
} = require('fs');

const {
  VueComponent,
  keyToReplacement,
  filterVariableItem
} = require('../tools/i18nAutoReplacement');

const { logger } = require('../logger');

const { flatAllKeys } = require('../tools/directoryReader');
const path = require('path');

(async () => {
  // lang文件位置
  const langDataList = [
    'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\zh.js',
    'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\aimEdit\\zh.js',
    // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\contact\\zh.js',
    'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\fgEdit\\zh.js',
    'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\fgTemplate\\zh.js',
    // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\headerIcon\\zh.js',
    // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\loginPage\\zh.js',
    'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\rmsEdit\\zh.js',
    // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\statistics\\zh.js',
    // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\templateManage\\zh.js',
    // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\utplSend\\zh.js',
    // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\utpltemplate\\zh.js'
  ];
  const additionalKeyList = [
    { i18nKey: 'cmcc', cnValue: '中国移动' },
    { i18nKey: 'cucc', cnValue: '中国联通' },
    { i18nKey: 'ctcc', cnValue: '中国电信' }
  ];

  // 需替换的文件所在文件夹
  const directoryPath = 'D:\\Projects\\UMC\\dev\\umc-web\\src\\views\\fg\\template';
  const excludeDirectory = ['node_modules', 'backend-emp', 'frontend-emp', 'security-emp'];
  const excludeFile = ['ChannelNumItem-emp.vue'];
  const includeExt = ['vue'];

  // 额外的文件
  const additionalFileList = [
    // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\components\\Collapse.vue',
    // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\components\\PageLimitsItem.vue'
  ];

  // 单次任务处理的文件数量
  const taskBlockSize = 10;


  const i18nImport = `import { i18n } from '@/main'`;

  // 获取中文i18n文件，并转换格式
  const flatCnData = [];
  for(const langPath of langDataList) {
    let data = require(langPath);
    data = flatAllKeys(data);
    flatCnData.push(...data);
  }
  // writer('../output/cnData.json', JSON.stringify(flatCnData, null, 2));
  if (additionalKeyList.length) {
    flatCnData.push(...additionalKeyList);
  }
  const filtered = filterVariableItem(flatCnData);
  const noVariableList = filtered[0];
  const variableList = filtered[1];
  const replacementList = keyToReplacement(noVariableList);

  logger(`##### Start auto replace #####`);
  logger(`##### Keys #####`);
  logger(`Total key:${flatCnData.length}`);
  logger(`No variable key:${noVariableList.length}`);
  logger(`Variable key:${variableList.length}`);
  if (variableList.length) {
    writer('../output/variable.json', JSON.stringify(variableList, null, 2));
    logger(`Find \`variable.json\` in the \`output\` directory and replace manually!`);
  }

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

  // writer('../output/files.json', JSON.stringify(files, null, 2));

  // 开始
  const taskBlockQueue = [];
  const vueFiles = files['vue'] || [];
  const jsFiles = files['js'] || [];
  const totalFileCount = vueFiles.length + jsFiles.length;
  let currentFileCount = 0;

  logger(`##### Tasks #####`);
  logger(`Total file:${totalFileCount}(${vueFiles.length} vue ${jsFiles.length} js)`);

  // 处理vue文件
  while(vueFiles.length) {
    taskBlockQueue.push([...vueFiles.splice(0, taskBlockSize)]);
  }
  while(taskBlockQueue.length) {
    const files = taskBlockQueue.shift();
    // 读文件
    for(const file of files) {
      let fileText;
      try {
        fileText = reader(file.filePath, 'utf8');
      } catch (e) {
        logger(`Can not find File \`${path.basename(file.filePath)}\` in directory \`${file.filePath}\``);
        console.trace(e);
        continue;
      }
      const fileContent = new VueComponent(fileText);
      file.fileContent = fileContent;
    }
    // 替换中文
    for(const file of files) {
      currentFileCount++;
      logger(`current file:${file.fileName} (${currentFileCount}/${totalFileCount})`);
      // if (file.fileName === 'supplier.vue') {
      //   logger(JSON.stringify(file.fileContent.template));
      // }

      for(const replacement of replacementList) {
        const vueComponent = file.fileContent;
        const {
          template,
          script
        } = vueComponent;
        const {
          templateAttrReg,
          templateAttrReplacement,
          templatePlainTextReg,
          templatePlainTextReplacement,
          jsReg,
          scriptReplacement
        } = replacement;
        vueComponent.template = template
          .replace(
            templateAttrReg,
            function (match, cn, suffix) {
              file.isModified = true;

              if (cn) {
                if (suffix) {
                  return ':' + match.replace(suffix, '').replace(cn, templateAttrReplacement + ` + '${suffix}'`);
                } else {
                  return ':' + match.replace(cn, templateAttrReplacement);
                }
              }
              return templateAttrReplacement;
            }
          )
          .replace(
            templatePlainTextReg,
            function (match, cn) {
              file.isModified = true;

              return match.replace(cn, templatePlainTextReplacement);
            }
          );
        vueComponent.script = script
          .replace(
            jsReg,
            function (match, suffix) {
              file.isModified = true;

              // if (match.includes('确定删除该敏感词')) {
              //   console.log(JSON.stringify(
              //     [
              //       arguments[0],
              //       arguments[1],
              //       arguments[2]
              //     ]
              //   ));
              // }
              // if (suffix) {
              //   return scriptReplacement + ` + '${suffix}'`;
              // }
              return scriptReplacement;
            }
          );
      }
    }
    // 写文件
    for(const file of files) {
      if (!file.isModified) {
        continue;
      }
      const { template, script, style } = file.fileContent;
      writer(
        file.filePath,
        template + script + style
      );
    }
  }

  // 处理js文件
  while(jsFiles.length) {
    taskBlockQueue.push([...jsFiles.splice(0, taskBlockSize)]);
  }
  while(taskBlockQueue.length) {
    const files = taskBlockQueue.shift();
    // 读文件
    for(const file of files) {
      let fileText;
      try {
        fileText = reader(file.filePath, 'utf8');
      } catch (e) {
        logger(`Can not find File \`${path.basename(file.filePath)}\` in directory \`${file.filePath}\``);
        console.trace(e);
        continue;
      }
      file.fileContent = fileText + '\n';
    }
    // 替换中文
    for(const file of files) {
      currentFileCount++;
      logger(`current file:${file.fileName} (${currentFileCount}/${totalFileCount})`);

      for(const replacement of replacementList) {
        const fileContent = file.fileContent;
        const {
          jsReg,
          jsReplacement
        } = replacement;
        file.fileContent = fileContent.replace(
          jsReg,
          function (match, suffix) {
            file.isModified = true;

          // console.log(JSON.stringify(
          //   [
          //     arguments[0],
          //     arguments[1],
          //     arguments[2]
          //   ]
          // ));
          // if (suffix) {
          //   return jsReplacement + ` + '${suffix}'`;
          // }
          return jsReplacement;});
      }
    }
    // 写文件
    for(const file of files) {
      if (!file.isModified) {
        continue;
      }
      let content = file.fileContent;
      const hasI18nImport = content.includes('i18n');
      content = hasI18nImport ? content :  i18nImport + '\n' + content;
      writer(
        file.filePath,
        content
      );
    }
  }

  // writer('../output/replacement.json', JSON.stringify(replacementList, null, 2));

  logger(`##### Finish auto replace #####`);
})();
