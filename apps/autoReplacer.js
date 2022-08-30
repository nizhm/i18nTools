const { directoryReader, extractFiles } = require('../tools/directoryReader.js');
const { readFileSync: reader, writeFileSync: writer } = require('fs');
const { VueComponent, keyToReplacement } = require('../tools/i18nAutoReplacement');
const { flatKeysList } = require('../tools/directoryReader');

(async () => {
  // 中文文件位置
  const cnDataPath = 'D:\\Projects\\UMC\\umc-web\\src\\lang\\cm\\zh.js';
  // zh.js的对象嵌套深度，每层深度只会读取value不是对象类型的key
  // 空数组表示取对象的第一层属性
  // 单个元素数组表示取对象的某个模块的属性（第二层）
  // 如果要取第三层属性，另外再加两个元素的数组，比如['cm', 'security']，表示取cm.security
  const moduleLevel = [
    [],
    ['cm']
  ];

  // 需替换的文件所在文件夹
  const directoryPath = 'D:\\Projects\\UMC\\umc-web\\src\\views\\cm';
  const excludeDirectory = ['node_modules', 'backend-emp', 'frontend-emp', 'security-emp'];
  const includeFile = ['vue'];

  // 单次任务处理的文件数量
  const taskBlockSize = 10;


  const i18nImport = `import { i18n } from '@/main'`;

  // 获取中文i18n文件，并转换格式
  const cnData = require(cnDataPath);
  const flatCnData = flatKeysList(cnData, moduleLevel);
  const replacementList = keyToReplacement(flatCnData);

  // 读取目标文件夹中所有文件
  const directoryContent = directoryReader(
    directoryPath,
    {
      excludeDirectory,
      includeFile
    }
  );
  const files = extractFiles(directoryContent);

  // 开始
  const taskBlockQueue = [];
  const vueFiles = files['vue'] || [];
  const jsFiles = files['js'] || [];

  // 处理vue文件
  while(vueFiles.length) {
    taskBlockQueue.push([...vueFiles.splice(0, taskBlockSize)]);
  }
  while(taskBlockQueue.length) {
    const files = taskBlockQueue.shift();
    // 读文件
    for(const file of files) {
      const fileText = reader(file.filePath, 'utf8');
      const fileContent = new VueComponent(fileText);
      file.fileContent = fileContent;
    }
    // 替换中文
    for(const file of files) {
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
              replacement.replacedCount++;
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
              replacement.replacedCount++;
              return match.replace(cn, templatePlainTextReplacement);
            }
          );
        vueComponent.script = script.replace(jsReg, function (match, suffix) {
          file.isModified = true;
          replacement.replacedCount++;

          if (match.includes('确定删除该敏感词')) {
            console.log(JSON.stringify(
              [
                arguments[0],
                arguments[1],
                arguments[2]
              ]
            ));
          }
          if (suffix) {
            return scriptReplacement + ` + '${suffix}'`
          }
          return scriptReplacement;
        });
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
      const fileText = reader(file.filePath, 'utf8');
      file.fileContent = fileText + '\n';
    }
    // 替换中文
    for(const file of files) {
      for(const replacement of replacementList) {
        const fileContent = file.fileContent;
        const { jsReg, jsReplacement } = replacement;
        file.fileContent = fileContent.replace(
          jsReg,
          function (match, suffix) {
            file.isModified = true;
            replacement.replacedCount++;
          // console.log(JSON.stringify(
          //   [
          //     arguments[0],
          //     arguments[1],
          //     arguments[2]
          //   ]
          // ));
          if (suffix) {
            return jsReplacement + ` + '${suffix}'`
          }
          return jsReplacement;
        });
      }
    }
    // 写文件
    for(const file of files) {
      if (!file.isModified) {
        continue;
      }
      let content = file.fileContent;
      const hasI18nImport = content.includes('i18n');
      content = hasI18nImport ? content :  i18nImport + '\n' + file.fileContent;
      writer(
        file.filePath,
        content
      );
    }
  }

  writer('../output/replacement.json', JSON.stringify(replacementList, null, 2));

})();