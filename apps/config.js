module.exports = {
  // 自动替换工具参数
  // UMC
  autoReplacer: {
    // lang文件位置
    langDataList: [
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\zh.js',

      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\aimEdit\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\auditManage\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\cm\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\contact\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\entWechat\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\fgEdit\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\fgTemplate\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\headerIcon\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\loginPage\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\monitorCenter\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\rmsEdit\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\shortChain\\zh.js',
      // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\statistics\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\systemManage\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\templateManage\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\utplSend\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\utpltemplate\\zh.js'
    ],
    // 额外的key
    additionalKeyList: [
      { i18nKey: 'cmcc', cnValue: '中国移动' },
      { i18nKey: 'cucc', cnValue: '中国联通' },
      { i18nKey: 'ctcc', cnValue: '中国电信' }
    ],
    // 需替换的文件所在文件夹
    directoryPath: 'D:\\Projects\\UMC\\dev\\umc-web\\src\\views\\cm\\frontend',
    excludeDirectory: ['node_modules', 'backend-emp', 'frontend-emp', 'security-emp'],
    excludeFile: ['access-account-emp.vue', 'sign-manage-emp.vue'],
    includeExt: ['vue'],
    // 额外的文件
    additionalFileList: [
      // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\components\\Collapse.vue',
      // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\components\\PageLimitsItem.vue'
      // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\views\\buswechat\\groupSendManage\\group-send-gather.vue'
    ],
    // 单次任务处理的文件数量
    taskBlockSize: 10,
    i18nImport: 'import { i18n } from \'@/main\''
  },
  // // RMS Editor
  // autoReplacer: {
  //   // lang文件位置
  //   langDataList: [
  //     'D:\\Projects\\UMC\\umc-rms-editor\\src\\libs\\lang\\zh.js',
  //
  //     // 'D:\\Projects\\UMC\\umc-rms-editor\\src\\list\\lang\\zh.js',
  //     // 'D:\\Projects\\UMC\\umc-rms-editor\\src\\media\\lang\\zh.js',
  //     'D:\\Projects\\UMC\\umc-rms-editor\\src\\send\\lang\\zh.js'
  //   ],
  //   // 额外的key
  //   additionalKeyList: [
  //     { i18nKey: 'cmcc', cnValue: '中国移动' },
  //     { i18nKey: 'cucc', cnValue: '中国联通' },
  //     { i18nKey: 'ctcc', cnValue: '中国电信' }
  //   ],
  //   // 需替换的文件所在文件夹
  //   directoryPath: 'D:\\Projects\\UMC\\umc-rms-editor\\src\\send',
  //   excludeDirectory: ['node_modules', 'assets', 'lang', 'security-emp'],
  //   excludeFile: ['index.html', 'README.md'],
  //   includeExt: ['vue'],
  //   // 额外的文件
  //   additionalFileList: [
  //     'D:\\Projects\\UMC\\umc-rms-editor\\src\\send\\components\\mixins\\contact.js'
  //     // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\components\\Collapse.vue',
  //     // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\components\\PageLimitsItem.vue'
  //     // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\utils\\fg-config.js'
  //   ],
  //   // 单次任务处理的文件数量
  //   taskBlockSize: 10,
  //   i18nImport: 'import { i18n } from \'@/main\''
  // },
  // 中文检索工具参数
  chineseInspector: {
    // 是否忽略注释里的内容；
    excludeComments: true,
    // 单次任务处理的文件数量
    taskBlockSize: 10,
    // 额外的文件
    additionalLangFileList: [
      // 'D:\\Projects\\UMC\\umc-rms-editor\\src\\list\\lang\\zh.js',
      // 'D:\\Projects\\UMC\\umc-rms-editor\\src\\media\\lang\\zh.js',
      // 'D:\\Projects\\UMC\\umc-rms-editor\\src\\send\\lang\\zh.js'
    ],
  },
  // 读取项目lang数据，并生成excel的工具配置
  excelCreator: {
    // 语言文件位置
    langPath: 'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang',
    // 读取哪些模块的数据（会自从忽略elementLang）
    moduleLevel: [
      [],
      ['aimEdit'],
      ['auditManage'],
      ['cm'],
      ['contact'],
      ['entWechat'],
      ['fgEdit'],
      ['fgTemplate'],
      ['headerIcon'],
      ['loginPage'],
      ['monitorCenter'],
      ['rmsEdit'],
      ['shortChain'],
      ['statistics'],
      ['systemManage'],
      ['templateManage'],
      ['utplSend'],
      ['utpltemplate']
    ],
    // excel表头（仅支持从后往前无间断删除）
    header: [
      { header: '模块', width: 20 },
      { header: '元素显示中文', width: 45 },
      { header: '元素显示繁体', width: 45 },
      { header: '元素显示英文', width: 45 },
      // { header: '_key', width: 25 },
      // { header: 'key', width: 25 }
    ]
  },
  // 读取chineseInspector中noDirectKey数据，并生成excel的工具配置
  chineseListExcelCreator: {
    header: [
      { header: '元素显示中文', width: 45 },
      { header: '元素显示繁体', width: 45 },
      { header: '元素显示英文', width: 45 },
      { header: '_key', width: 25 },
      { header: 'key', width: 25 }
    ],
    excelFileName: 'chineseListExcel'
  }
}
