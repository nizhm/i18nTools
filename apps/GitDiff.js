const { logger } = require('../tools/logger');

const path = require('path');

const { writeFileSync: writer } = require('fs');

const { execSync } = require('child_process');

const GitDiff = async () => {
  logger('##### Start GitDiff #####');

  const projectDirPath = 'D:\\Projects\\UMC\\umc-web';

  const cmd = `git diff`;

  const cmdOptions = [
    'bf5a7f2665e2d1e14611241b1f0e42c3bfc52afd',
    'e6a0d6e6b748d8ece2e8a1f51935a2fc89e78445',
    '--name-only',
    '--diff-filter=d'
  ];
  const outputPath =
    path.resolve(
      // 文件位置
      `${__dirname}/../output/` +
      // 文件名
      `git-diff_${cmdOptions[0].substr(0, 8)}-${cmdOptions[1].substr(0, 8)}.txt`
    )
  ;
  // 设置output参数
  // cmdOptions.push('--output=' + outputPath);

  const command = `${cmd} ${cmdOptions.join(' ')}`;

  const options = {
    cwd: projectDirPath
  };


  logger(`##### Command: ${command}`);

  let dataBuffer = null;
  try {
    dataBuffer = execSync(command, options);
  } catch (e) {
    console.error(e)
  }

  // 去掉末尾的换行符
  const data = dataBuffer.toString('utf8');
  const dataList = data.replace(/[\r\n]+$/, '');
  writer(outputPath, dataList, 'utf8');

  logger(`##### Result file: ${outputPath} #####`);
  logger('##### Finish GitDiff #####');
};

module.exports.GitDiff = GitDiff;

(async () => await GitDiff())();
