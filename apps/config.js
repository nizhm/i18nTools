module.exports = {
  // 自动替换工具参数
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
    directoryPath: 'D:\\Projects\\UMC\\dev\\umc-web\\src\\views\\sendManage',
    excludeDirectory: ['node_modules', 'backend-emp', 'frontend-emp', 'security-emp'],
    excludeFile: ['ChannelNumItem-emp.vue'],
    includeExt: ['vue', 'js'],
    // 额外的文件
    additionalFileList: [
      // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\components\\Collapse.vue',
      // 'D:\\Projects\\UMC\\dev\\umc-web\\src\\components\\PageLimitsItem.vue'
    ],
    // 单次任务处理的文件数量
    taskBlockSize: 10,
    i18nImport: 'import { i18n } from \'@/main\''
  },
  // 中文检索工具参数
  chineseInspector: {
    // 是否忽略注释里的内容；
    excludeComments: true,
    // 单次任务处理的文件数量
    taskBlockSize: 10
  }
}
