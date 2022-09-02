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
    'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\fgEdit\\zh.js',

    'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\aimEdit\\zh.js',
    'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\contact\\zh.js',
    // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\fgEdit\\zh.js',
    'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\fgTemplate\\zh.js',
    'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\headerIcon\\zh.js',
    'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\loginPage\\zh.js',
    'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\rmsEdit\\zh.js',
    'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\statistics\\zh.js',
    'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\templateManage\\zh.js',
    'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\utplSend\\zh.js',
    'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\utpltemplate\\zh.js'
  ];
  const additionalKeyList = [
    { i18nKey: 'cmcc', cnValue: '中国移动' },
    { i18nKey: 'cucc', cnValue: '中国联通' },
    { i18nKey: 'ctcc', cnValue: '中国电信' }
  ];

  // 需替换的文件所在文件夹
  const directoryPath = 'D:\\Projects\\UMC\\dev\\umc-web\\src\\views\\cm\\unityCommunicationSet\\component';
  const excludeDirectory = ['node_modules', 'backend-emp', 'frontend-emp', 'security-emp'];
  const excludeFile = ['ChannelNumItem-emp.vue'];
  const includeExt = ['vue', 'js'];

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
        logger(`Error while finding File \`${file.filePath}\``);
        console.trace(e);
        continue;
      }
      file.fileContent = fileText;
    }
    // 替换中文
    for(const file of files) {
      currentFileCount++;
      logger(`current file:${file.fileName} (${currentFileCount}/${totalFileCount})`);

      const fileContent = file.fileContent;
      const templateStartIndex = fileContent.search(/<template[^>]*>/);
      const scriptStartIndex = fileContent.search(/<script>/);
      const exportStartIndex = fileContent.search(/export default/);
      let styleStartIndex = fileContent.search(/<style[^>]*>/);
      styleStartIndex = styleStartIndex === -1 ? fileContent.length : styleStartIndex;
      console.log(templateStartIndex, scriptStartIndex, exportStartIndex, styleStartIndex)

      for(const replacement of replacementList) {
        const {
          templateAttrReg,
          templateAttrReplacement,
          templatePlainTextReg,
          templatePlainTextReplacement,
          jsReg,
          scriptReplacement,
          jsReplacement
        } = replacement;

        file.fileContent = fileContent
          .replace(
            // new RegExp(`[A-Za-z0-9.-]+="(${value})(|:|：)"|['\`]${value}['\`]`, 'g')
            templateAttrReg,
            function (match, cn, suffix, offset) {
              // Range: <template .... </template>
              // if (
              //   !(offset < scriptStartIndex &&
              //   offset > templateStartIndex)
              // ) {
              //   return match;
              // }

              file.isModified = true;
              if (cn) {
                if (suffix) {
                  return ':' + match.replace(suffix, '').replace(cn, templateAttrReplacement + ` + '${suffix}'`);
                } else {
                  return ':' + match.replace(cn, templateAttrReplacement);
                }
              }
              console.log('templateAttrReg')
              console.log(offset, match, cn)
              return 'templateAttrReplacement';
            }
          )
          .replace(
            // new RegExp(`>[ \r\n]*(${value})[ \r\n:：]*<`, 'g')
            templatePlainTextReg,
            function (match, cn, offset) {
              // Range: <template .... </template>
              if (
                offset > scriptStartIndex ||
                offset > styleStartIndex ||
                offset < templateStartIndex
              ) {
                return match;
              }

              file.isModified = true;
              return match.replace(cn, templatePlainTextReplacement);
            }
          )
          .replace(
            // new RegExp(`['"\`]${value}['"\`]`, 'g');
            jsReg,
            function (match, offset, input) {
              // Range: <script> .... export default
              if (
                offset > exportStartIndex ||
                offset > styleStartIndex ||
                offset < scriptStartIndex
              ) {
                return match;
              }

              file.isModified = true;
              if (input.search('i18n') === -1) {
                file.needI18nImport = true;
              }
              return jsReplacement;
            }
          )
          .replace(
            // new RegExp(`['"\`]${value}['"\`]`, 'g');
            jsReg,
            function (match, offset) {
              // Range: export default .... </script>
              if (
                offset > styleStartIndex ||
                offset < exportStartIndex
              ) {
                return match;
              }

              file.isModified = true;
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
      let fileContent = file.fileContent;
      if (file.needI18nImport) {
        fileContent = fileContent.replace(/(<script>)/, `$1\r\n${i18nImport}`);
      }
      console.log(fileContent)
      writer(
        file.filePath,
        fileContent
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
        logger(`Error while finding file \`${file.filePath}\``);
        console.trace(e);
        continue;
      }
      file.fileContent = fileText;
    }
    // 替换中文
    for(const file of files) {
      currentFileCount++;
      logger(`current file:${file.fileName} (${currentFileCount}/${totalFileCount})`);

      const fileContent = file.fileContent;
      const exportStartIndex = fileContent.search(/export default/);

      for(const replacement of replacementList) {
        const {
          jsReg,
          jsReplacement,
          scriptReplacement
        } = replacement;

        if (exportStartIndex !== -1) {
          // this file is part of vue component
          file.fileContent = fileContent
            .replace(
              // new RegExp(`['"\`]${value}['"\`]`, 'g');
              jsReg,
              function (match, offset, input) {
                // Range: ^...... export default
                if (offset > exportStartIndex) {
                  return match;
                }

                file.isModified = true;
                if (input.search('i18n') === -1) {
                  file.needI18nImport = true;
                }
                return jsReplacement;
              }
            )
            .replace(
              // new RegExp(`['"\`]${value}['"\`]`, 'g');
              jsReg,
              function (match, offset, input) {
                // Range: export default ...... $
                // if (offset < exportStartIndex) {
                //   return match;
                // }

                file.isModified = true;
                return scriptReplacement;
              }
            );
        } else {
          // ordinary js file
          file.fileContent = fileContent
            .replace(
              // new RegExp(`['"\`]${value}['"\`]`, 'g');
              jsReg,
              function (match, offset, input) {
                // Range: ^...... $

                file.isModified = true;
                if (input.search('i18n') === -1) {
                  file.needI18nImport = true;
                }
                return jsReplacement;
              }
            );
        }
      }
    }
    // 写文件
    for(const file of files) {
      if (!file.isModified) {
        continue;
      }
      let fileContent = file.fileContent;
      if (file.needI18nImport) {
        fileContent = `${i18nImport}\r\n${fileContent}`
      }
      writer(
        file.filePath,
        fileContent
      );
    }
  }

  // writer('../output/replacement.json', JSON.stringify(replacementList, null, 2));

  logger(`##### Finish auto replace #####`);
})();
