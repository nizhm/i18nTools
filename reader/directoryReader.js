const { readdirSync } = require('fs');
const path = require('path');
const { direntTypeKeysMap } = require('../dir/dirent.js');


const excludeDirectoryDefault = ['node_modules'];
const includeFileDefault = ['js'];
const excludeDirectory = [];
const includeFile = [];

class Directory {
  constructor(directoryName, directoryPath) {
    this.type = direntTypeKeysMap.get(2);
    this.directoryName = directoryName;
    this.directoryPath = directoryPath;
    this.isEmpty = true;
  }
}

const resolvePath = (...args) => {
  return path.resolve(...args);
};

const getExt = filePath => {
  return path.extname(filePath)
    .replace('.', '')
    .toLowerCase();
};

const directoryContentReader = (directory) => {
  const files = readdirSync(directory.directoryPath, { withFileTypes: true });
  if (!files.length) {
    return;
  }

  directory.isEmpty = false;
  let direntTypeSymbol = Object.getOwnPropertySymbols(files[0])[0];

  for(const item of files) {
    const direntTypeKey = direntTypeKeysMap.get(item[direntTypeSymbol]);

    if (
      direntTypeKey === direntTypeKeysMap.get(1) &&
      !includeFile.includes(getExt(item.name))
    ) {
      continue;
    }

    if (
      direntTypeKey === direntTypeKeysMap.get(2) &&
      excludeDirectory.includes(item.name)
    ) {
      continue;
    }

    if (!directory[direntTypeKey]) {
      directory[direntTypeKey] = [];
    }
    directory[direntTypeKey].push(item.name);
  }

  const dirKey = direntTypeKeysMap.get(2);
  const dir = directory[dirKey];
  if (dir) {
    const newlyDir = dir.map(item => new Directory(item, resolvePath(directory.directoryPath, item)));
    directory[dirKey] = newlyDir;
    for(const newlyDirItem of newlyDir) {
      directoryContentReader(newlyDirItem);
    }
  }
};

const directoryReader = (directoryPath, options) => {
  excludeDirectory.length = 0;
  includeFile.length = 0;
  const excludeDir = options.excludeDirectory || [];
  const includeFe = options.includeFile || [];
  excludeDirectory.push(...[...new Set([
    ...excludeDirectoryDefault,
    ...excludeDir
  ])]);
  includeFile.push(...[...new Set([
    ...includeFileDefault,
    ...includeFe
  ])]);

  const directoryName = path.basename(directoryPath);
  const directory = new Directory(directoryName, resolvePath(directoryPath));
  directoryContentReader(directory);
  return directory;
};

const extractFilePath = (directory, container) => {
  const { directoryPath, directoryName } = directory;
  const file = directory[direntTypeKeysMap.get(1)];
  if (file) {
    for(const fileElement of file) {
      const filePath = resolvePath(directoryPath, fileElement);
      const ext = getExt(fileElement);
      if (!container[ext]) {
        container[ext] = [];
      }
      container[ext].push({
        fileName: fileElement,
        filePath,
        directoryName
      });
    }
  }
  const dir = directory[direntTypeKeysMap.get(2)];
  if (dir) {
    for(const dirElement of dir) {
      extractFilePath(dirElement, container);
    }
  }
};

const extractFiles = (directory) => {
  const fileList = {};
  extractFilePath(directory, fileList);
  return fileList;
};

const flatKeysList = (keysData, targetLevel) => {
  const list = [];
  for(const level of targetLevel) {
    const code = 'keysData' + ['', ...level].join('.');
    const keyPrefix = [...level, ''].join('.');
    let data, hasError = false;
    try {
      data = eval(code);
    } catch(e) {
      hasError = true
    }
    if (!data) {
      console.trace(level, 'module层级不正确');
      continue;
    }
    for(const [key, value] of Object.entries(data)) {
      if (typeof value !== 'string') {
        continue;
      }
      list.push({
        i18nKey: keyPrefix + key,
        cnValue: value
      });
    }
  }
  return list;
};

module.exports = {
  directoryReader,
  extractFiles,
  resolvePath,
  flatKeysList
}
