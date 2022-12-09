const { readdirSync } = require('fs');
const path = require('path');
const { direntTypeKeysMap } = require('./dirent.js');


const excludeDirectoryDefault = [];
const includeExtDefault = [];
const excludeDirectory = [];
const excludeFile = [];
const includeExt = [];

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
      !includeExt.includes(getExt(item.name))
    ) {
      continue;
    }

    if (
      direntTypeKey === direntTypeKeysMap.get(1) &&
      excludeFile.includes(item.name)
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
  if (!directoryPath) {
    return new Directory(directoryPath, directoryPath);
  }
  excludeDirectory.length = 0;
  includeExt.length = 0;
  excludeFile.length = 0;
  const excludeDir = options.excludeDirectory || [];
  const excludeFs = options.excludeFile || []
  const includeFs = options.includeExt || [];
  excludeDirectory.push(...[...new Set([
    ...excludeDirectoryDefault,
    ...excludeDir
  ])]);
  excludeFile.push(...[...new Set([
    ...excludeFs
  ])])
  includeExt.push(...[...new Set([
    ...includeExtDefault,
    ...includeFs
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

const extractFileList = (additionalFileList, container) => {
  for(const additionalFileListElement of additionalFileList) {
    const filePath = additionalFileListElement;
    const fileName = path.basename(filePath);
    const directoryName = path.basename(path.dirname(filePath));
    const ext = getExt(filePath);
    if (!container[ext]) {
      container[ext] = [];
    }
    container[ext].push({
      fileName: fileName,
      filePath,
      directoryName
    });
  }
};

const extractFiles = (directory, additionalFileList = []) => {
  const fileList = {};
  extractFilePath(directory, fileList);
  if (additionalFileList.length) {
    extractFileList(additionalFileList, fileList);
  }
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

const flatAllKeys = (keysData, container = [], keyPrefix = '') => {
  for(const [key, value] of Object.entries(keysData)) {
    if (typeof value === 'string') {
      container.push({
        i18nKey: keyPrefix + key,
        cnValue: value
      });
    } else {
      flatAllKeys(value, container, keyPrefix + key + '.');
    }
  }
  return container
};

module.exports = {
  directoryReader,
  extractFiles,
  resolvePath,
  flatKeysList,
  flatAllKeys
}
