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

const { autoReplacer } = require('./config');

(async () => {
  const {
    langDataList,
    additionalKeyList,
    directoryPath,
    excludeDirectory,
    excludeFile,
    includeExt,
    additionalFileList,
    taskBlockSize,
    i18nImport
  } = autoReplacer;

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
        logger(`Error while finding file \`${file.filePath}\``);
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
          scriptReplacement,
          jsReplacement
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
            function (match, offset, input) {
              file.isModified = true;
              const beforeExport = offset < input.search('export default');
              if (beforeExport) {
                if (input.search('i18n') === -1) {
                  file.needI18nImport = true
                }
                return jsReplacement;
              }
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
      let { template, script, style } = file.fileContent;
      if (file.needI18nImport) {
        script = script.replace(/(<script[^>]*>)/, `$1\r\n${i18nImport}`);
      }
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
        logger(`Error while finding \`${path.basename(file.filePath)}\` in directory \`${file.filePath}\``);
        console.trace(e);
        continue;
      }
      file.fileContent = fileText;
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

        file.fileContent = fileContent
          .replace(
            jsReg,
            function (match, offset, input) {
              file.isModified = true;
              if (input.search('i18n') === -1) {
                file.needI18nImport = true;
              }
              return jsReplacement;
            }
          );
      }
    }
    // 写文件
    for(const file of files) {
      if (!file.isModified) {
        continue;
      }
      let content = file.fileContent;
      if (file.needI18nImport) {
        content = i18nImport + '\r\n' + content;
      }
      writer(
        file.filePath,
        content
      );
    }
  }

  // writer('../output/replacement.json', JSON.stringify(replacementList, null, 2));

  logger(`##### Finish auto replace #####`);
})();
