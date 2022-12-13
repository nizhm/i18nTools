(async () => {
  const repl = require('repl');

  // 应用引入
  const Apps = [
    require('./ChineseInspector').ChineseInspector,
    require('./AutoReplacer').AutoReplacer,
    require('./AutoTraditionalizer').AutoTraditionalizer
  ];

  // 应用个数
  const AppsLen = Apps.length;

  // 应用索引列表
  const AppsIdxList = Apps.map((app, index) => index);

  // 应用提示信息
  const AppsMessage = [
    '',
    '# Applications',
    ...Apps.map((app, index) => `# ${index.toString().padEnd(2, ' ').padEnd(6, '.')} ${app.name} `),
    `# Input ${AppsLen < 2 ? AppsLen - 1 : '0-' + (AppsLen - 1)} followed by \`Enter\` to run`,
    ''
  ];

  const myEval = async function (cmd, context, filename, callback) {
    let appIdx = cmd.match(/^[\d]+/);
    appIdx = appIdx ? parseInt(appIdx[0]) : undefined;
    if (AppsIdxList.includes(appIdx)) {
      await Apps[appIdx]();
    } else {
      console.log(`No application matched`);
    }
    callback(null, cmd);
  };

  const outputWriter = function (output) {
    console.log(AppsMessage.join('\n'));
    return '';
  }

  // 先输出一次应用列表信息
  outputWriter();

  const replServer = repl.start({
    terminal: true,
    eval: myEval,
    writer: outputWriter
  });

  // .empty 清屏命令
  replServer.defineCommand('empty', function () {
    console.clear();
    outputWriter();
  });
})();
