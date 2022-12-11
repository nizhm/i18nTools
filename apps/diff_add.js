const {
  directoryReader,
  extractFiles
} = require('../tools/directoryReader.js');

const {
  readFileSync: reader,
  writeFileSync: writer,
  copyFileSync: copy,
  mkdirSync: mkdir
} = require('fs');

const { logger } = require('../tools/logger');

const path = require('path');

const { autoTraditionalizer } = require('./config');

const axios = require('axios');
const constants = require('constants')

const {
  langDir,
  transferWeb,
  taskBlockSize
} = autoTraditionalizer;

(async () => {
  logger(`##### Start diff #####`);

  const basePath = 'D:\\Projects\\UMC\\umc-web';
  const diffDataPath = `${__dirname}/../input/diff_add.txt`;
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
  // writer(`${__dirname}/../output/diff_add.json`, diffJson);

  // 解析src
  if (diffFilesClassed.src) {
    const srcFiles = diffFilesClassed.src;

    const imgFiles = srcFiles
      .filter(item => /\.png$/g.test(item))
      .map(item => ({ sourcePath: path.resolve(basePath, item), path: item }))

    // 输出图片文件
    // const diff_add_ImgJson = JSON.stringify(imgFiles, null, 2);
    // writer(`${__dirname}/../output/diff_add_ImgJson.json`, diff_add_ImgJson);

    // 整理图片文件
    imgFiles.forEach((item, index) => {
      const { path: targetPath, sourcePath } = item;
      const absTargetPath = `${__dirname}/../output/${targetPath}`;
      const targetDir = path.parse(absTargetPath).dir;
      try {
        mkdir(targetDir, { recursive: true });
        copy(sourcePath, absTargetPath);
      } catch (e) {
        console.error(e)
      }
    });
  }

  logger(`##### Finish diff #####`);
})();
