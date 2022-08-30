(async () => {
  const { directoryReader, extractFiles } = require('../reader/directoryReader.js');
  const { readFileSync: reader, writeFileSync: writer } = require('fs');

  const taskBlockSize = 10;
  const directoryPath = 'D:\\Projects\\UMC\\umc-web\\src\\views\\sul';
  const excludeDirectory = ['node_modules', 'browser-env', 'js-API'];
  const includeFile = ['vue'];

  const directoryContent = directoryReader(
    directoryPath,
    {
      excludeDirectory,
      includeFile
    }
  );

  const files = extractFiles(directoryContent);

  const replaceComments = str => {
    const multiHtmlReg = /<!--[\w\W\n\s]+?-->/g;
    const singleHtmlReg = /<!--.*?-->/g;
    const multiJsReg = /\/\*(?:(?!\*\/).|[\n\r])*\*\//g;
    const singleJsReg = /\/\/.*/g;
    const reg = new RegExp(
      [
        multiHtmlReg.source,
        singleHtmlReg.source,
        multiJsReg.source,
        singleJsReg.source
      ].join('|'),
      'g'
    );
    str = str
      // .replace(multiHtmlReg, '')
      // .replace(singleHtmlReg, '')
      // .replace(multiJsReg, '')
      // .replace(singleJsReg, '')
      .replace(reg, '');
    return str;
  };

  const createTagReg = tagName => new RegExp(`<${tagName}[^>]*>[\\s\\S]*<\\/${tagName}>`, 'gi');

  const replacementList = [
    {
      i18nKey: '',
      reg: '',
      templateReplacement: '',
      scriptReplacement: '',
      jsReplacement: ''
    }
  ];
  const i18nImport = '';


// 开始
  const taskBlockQueue = [];

// 处理vue文件
  const vueFiles = files['vue'] || [];
  const templateTagReg = createTagReg('template');
  const scriptTagReg = createTagReg('script');
  const styleTagReg = createTagReg('style');
  class VueComponent {
    constructor(fileText) {
      const template = fileText.match(templateTagReg);
      const script = fileText.match(scriptTagReg);
      const style = fileText.match(styleTagReg);

      this.template = template ? template[0] : '';
      this.script = script ? '\n\n' + script[0] : '';
      this.style = style ? '\n\n' + style[0] + '\n' : '\n';
    }
  }
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

})()
