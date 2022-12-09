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

const { autoTraditionalizer } = require('./config');

const axios = require('axios');

const {
  langDir,
  transferWeb,
  taskBlockSize
} = autoTraditionalizer;

(async () => {
  logger(`##### Start diff #####`);

  const basePath = 'D:\\Projects\\UMC\\umc-web';
  const diffDataPath = `${__dirname}/../input/diff.txt`;
  const diffData = reader(diffDataPath, 'utf8');
  const diffFiles = diffData.split('\n').filter(item => !!item);

  // 分类，root，非root目录
  const diffFilesClassed = {
    root: []
  };
  diffFiles.forEach(item => {
    const dir = item.match(/^([^\/]+)\//);
    if (dir) {
      const dirName = dir[1];
      const classed = diffFilesClassed[dirName];
      classed ? classed.push(item) : (diffFilesClassed[dirName] = [item]);
    } else {
      diffFilesClassed.root.push(item);
    }
  })

  // 输出分类后的文件列表
  // const diffJson = JSON.stringify(diffFilesClassed, null, 2);
  // writer(`${__dirname}/../output/diff.json`, diffJson);

  // 解析src
  if (diffFilesClassed.src) {
    const srcFiles = diffFilesClassed.src;

    // 输入所有src文件列表
    // const srcFileJson = JSON.stringify(srcFiles, null, 2);
    // writer(`${__dirname}/../output/diffSrc.json`, srcFileJson);

    // 处理js及vue文件，且忽略lang文件夹
    const jsVueFiles = srcFiles
      .filter(item => /(\.js|\.vue)$/.test(item))
      .filter(item => !/^(src\/lang)/.test(item))
    ;

    // 输出所有js Vue文件列表
    // const jsVueFilesJson = JSON.stringify(jsVueFiles, null, 2);
    // writer(`${__dirname}/../output/jsVueFiles.json`, jsVueFilesJson);

    const jsFiles = [];
    const vueFiles = [];
    jsVueFiles.forEach(item => {
      /(\.js)$/.test(item) && jsFiles.push(path.resolve(basePath, item));
      /(\.vue)$/.test(item) && vueFiles.push(item);
    });

    // 分别输出js vue文件列表
    // writer(`${__dirname}/../output/jsDiff.json`, JSON.stringify(jsFiles, null, 2));
    // writer(`${__dirname}/../output/vueDiff.json`, JSON.stringify(vueFiles, null, 2));

    // vue文件分模块
    const srcRootVueFiles = [];
    const publicComponentVueFiles = [];
    const viewsVueFiles = [];
    vueFiles.forEach(item => {
      const absPath = path.resolve(basePath, item);
      if (/^(src\/views)/.test(item)) {
        viewsVueFiles.push(item);
      } else if (/^(src\/components)/.test(item)) {
        publicComponentVueFiles.push(absPath);
      } else {
        srcRootVueFiles.push(absPath);
      }
    });

    // 分别输出文件列表
    // writer(`${__dirname}/../output/srcRootVueFilesDiff.json`, JSON.stringify(srcRootVueFiles, null, 2));
    // writer(`${__dirname}/../output/publicComponentVueFilesDiff.json`, JSON.stringify(publicComponentVueFiles, null, 2));
    // writer(`${__dirname}/../output/viewsVueFilesDiff.json`, JSON.stringify(viewsVueFiles, null, 2));

    const moduleVueFiles = {};
    viewsVueFiles.forEach(item => {
      const module = item.match(/^src\/views\/([^\/]+)/)[1];
      const classed = moduleVueFiles[module];
      const absPath = path.resolve(basePath, item);
      classed ? classed.push(absPath) : (moduleVueFiles[module] = [absPath]);
    });

    // 分别输出文件列表
    // writer(`${__dirname}/../output/moduleVueFilesDiff.json`, JSON.stringify(moduleVueFiles, null, 2));
  }

  logger(`##### Finish diff #####`);
})();
