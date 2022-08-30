const { directoryReader, extractFiles } = require('../tools/directoryReader.js');
const { readFileSync: reader, writeFileSync: writer } = require('fs');
const { VueComponent, keyToReplacement } = require('../tools/i18nAutoReplacement');
const { flatKeysList } = require('../tools/directoryReader');

(async () => {
  const cnDataPath = 'D:\\Projects\\UMC\\umc-web\\src\\lang\\zh.js';
  const moduleLevel = [
    [],
    ['common']
  ];

  // 需替换的文件所在文件夹
  const directoryPath = 'D:\\Projects\\UMC\\umc-web\\src\\views\\cm';
  const excludeDirectory = ['node_modules', 'backend-emp', 'frontend-emp', 'security-emp'];
  const includeFile = ['vue'];

  // 单次任务处理的文件数量
  const taskBlockSize = 10;

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
  writer('../output/files.json', JSON.stringify(files, null, 2));

  // 开始
  const taskBlockQueue = [];

  // 处理vue文件
  const vueFiles = files['vue'] || [];
  while(vueFiles.length) {
    taskBlockQueue.push([...vueFiles.splice(0, taskBlockSize)]);
  }
  while(taskBlockQueue.length) {
    const tasks = taskBlockQueue.shift();
    // 读文件
    for(const task of tasks) {
      const fileText = reader(task.filePath, 'utf8');
      const fileContent = new VueComponent(fileText);
      task.fileContent = fileContent;
    }
    // 替换中文
    for(const task of tasks) {
      for(const replacement of replacementList) {
        const vueComponent = task.fileContent;
        const { template, script } = vueComponent;
        const { reg, templateReplacement, scriptReplacement } = replacement;
        vueComponent.template = template.replace(reg, templateReplacement);
        vueComponent.script = script.replace(reg, scriptReplacement);
      }
    }
    // 写文件
    for(const task of tasks) {
      const { template, script, style } = task.fileContent;
      writer(
        task.filePath,
        template + script + style
      );
    }
  }

  // 处理js文件
  const jsFiles = files['js'] || [];
  while(jsFiles.length) {
    taskBlockQueue.push([...jsFiles.splice(0, taskBlockSize)]);
  }
  while(taskBlockQueue.length) {
    const tasks = taskBlockQueue.shift();
    // 读文件
    for(const task of tasks) {
      const fileText = reader(task.filePath, 'utf8');
      task.fileContent = fileText + '\n';
    }
    // 替换中文
    for(const task of tasks) {
      for(const replacement of replacementList) {
        const fileContent = task.fileContent;
        const { reg, jsReplacement } = replacement;
        task.fileContent = fileContent.replace(reg, jsReplacement);
      }
    }
    // 写文件
    for(const task of tasks) {
      writer(
        task.filePath,
        i18nImport + '\n' + task.fileContent
      );
    }
  }

})();
