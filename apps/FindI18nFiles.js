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

const {
  replaceComments,
  replaceStyle
} = require('../tools/i18nAutoReplacement');

const FindI18nFiles = async () => {
  logger(`##### Start FindI18nFiles #####`);

  const sourcePath = 'D:\\Projects\\UMC\\umc-web\\src';

  const excludeDirectory = [
    'backend-emp',
    'frontend-emp',
    'security-emp',
    'out-box-emp',
    'sendDetail-emp',
    'sendTask-emp',
    'form-emp',
    'search-emp',
    'search-erm-emp',
    'umcmonitor-emp',
    'router'
  ];

  const excludeFile = [
    'loginsass.vue',
    'AccountTypeEmp.vue',
    'ConnectionMethodEmp.vue',
    'PartnersItemEmp.vue',
    'access-account-emp.vue',
    'sign-manage-emp.vue',
    'SpUserItemEmp.vue',
    'newChannel-emp.vue',
    'newSPAccount-emp.vue',
    'unityAgentUphold-emp.vue',
    'unityChannelManage-emp.vue',
    'unityForwardManage-emp.vue',
    'unityManageUphold-emp.vue',
    'unityOperatorManage-emp.vue',
    'unityOperatorManagesass-emp.vue',
    'unitySPAccount-emp.vue',
    'unitySPAccountBindOperator-emp.vue',
    'unitySPAccountBindSupplier-emp.vue',
    'Pushinformation-emp.vue',
    'addsupplier-emp.vue',
    'channelnode-emp.vue',
    'supplier-emp.vue'
  ];

  const includeExt = ['vue', 'js'];

  const Regs = {
    // 文件做过多语言的标志，意味着文件需要检查多语言是否有新增或者遗漏
    get i18nFlagReg() {
      return /i18n\.t|\.\$t/g
    },
    get dirReg() {
      return new RegExp('\\\\src\\\\([a-zA-Z-_.]+)\\\\?')
    },
    get subDirReg() {
      return new RegExp('\\\\src\\\\views\\\\([a-zA-Z-_.]+)\\\\?')
    }
  }

  // 读取目标文件夹中所有文件
  const directory = directoryReader(
    sourcePath,
    {
      excludeDirectory,
      excludeFile,
      includeExt
    }
  );

  const files = extractFiles(directory);

  // writer(`${__dirname}/../output/FindI18nFiles_files.json`, JSON.stringify(files, null, 2));

  const vueI18nFilesList =
    files['vue']
      .map(item => item.filePath)
      .filter(filePath => {
        let fileText = reader(filePath, 'utf8');
        // 去掉style
        fileText = replaceStyle(fileText);
        // 去掉注释
        fileText = replaceComments(fileText);
        return Regs.i18nFlagReg.test(fileText)
      })
  ;
  const jsI18nFilesList =
    files['js']
      .map(item => item.filePath)
      .filter(filePath => {
        let fileText = reader(filePath, 'utf8');
        // 去掉style
        fileText = replaceStyle(fileText);
        // 去掉注释
        fileText = replaceComments(fileText);
        return Regs.i18nFlagReg.test(fileText)
      })
  ;

  // writer(`${__dirname}/../output/FindI18nFiles_vueI18nFilesList.json`, JSON.stringify(vueI18nFilesList, null, 2));
  // writer(`${__dirname}/../output/FindI18nFiles_jsI18nFilesList.json`, JSON.stringify(jsI18nFilesList, null, 2));

  const vueClassedI18nFiles = {};
  vueI18nFilesList.forEach(item => {
    const dir = item.match(Regs.dirReg)[1];
    if (dir === 'views') {
      const subDirFiles = vueClassedI18nFiles[dir] || (vueClassedI18nFiles[dir] = {});
      const subDir = item.match(Regs.subDirReg)[1];
      subDirFiles[subDir] ? subDirFiles[subDir].push(item) : subDirFiles[subDir] = [item]
    } else {
      vueClassedI18nFiles[dir] ? vueClassedI18nFiles[dir].push(item) : vueClassedI18nFiles[dir] = [item]
    }
  });

  writer(`${__dirname}/../output/FindI18nFiles_vueClassedI18nFiles.json`, JSON.stringify(vueClassedI18nFiles, null, 2));

  logger(`##### Finish FindI18nFiles #####`);
};

module.exports.FindI18nFiles = FindI18nFiles;

(async () => await FindI18nFiles())();
