module.exports = {
  // 自动替换工具参数
  // UMC
  autoReplacer: {
    // lang文件位置
    langDataList: [
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\zh.js',

      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\aimEdit\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\contact\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\fgEdit\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\fgTemplate\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\headerIcon\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\loginPage\\zh.js',
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\rmsEdit\\zh.js',
      // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\lang\\statistics\\zh.js',
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
    directoryPath: 'D:\\Projects\\UMC\\dev\\umc-web\\src\\views\\buswechat\\groupSendManage\\groupTemplateNews',
    excludeDirectory: ['node_modules', 'backend-emp', 'frontend-emp', 'security-emp'],
    excludeFile: ['ChannelNumItem-emp.vue'],
    includeExt: ['vue'],
    // 额外的文件
    additionalFileList: [
      // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\components\\Collapse.vue',
      // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\components\\PageLimitsItem.vue'
      'D:\\Projects\\UMC\\dev\\umc-web\\src\\views\\buswechat\\groupSendManage\\group-send-gather.vue'
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
      'D:\\Projects\\UMC\\umc-rms-editor\\src\\list\\lang\\zh.js',
      'D:\\Projects\\UMC\\umc-rms-editor\\src\\media\\lang\\zh.js',
      'D:\\Projects\\UMC\\umc-rms-editor\\src\\send\\lang\\zh.js'
    ],
  }
}
