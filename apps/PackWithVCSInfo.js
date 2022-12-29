try {
  const ChildProcess = require('child_process')
  const { writeFileSync } = require('fs')
  const vcsCommands = [
    ['git', 'git status'],
    ['svn', 'svn info']
  ]
  let vcsData = null
  while(!vcsData && vcsCommands.length) {
    const [vcsType, cmd] = vcsCommands.shift()
    let data = null
    try {
      data = ChildProcess.execSync(cmd, { encoding: 'utf8' })
    } catch (e) {
      data = null
      // console.warn(e.message)
    }

    switch (vcsType) {
      case 'git':
        if (data && !data.includes('fatal') && !data.includes('not a git repository')) {
          vcsData = data.match(/^[^\r\n]*[\r\n]+[^\r\n]*/)[0]
        }
        break;
      case 'svn':
        if (data && !data.includes('not a working copy')) {
          vcsData = data.match(/URL:[^\r\n]*[\r\n]+[^\r\n]*/)[0]
        }
        break;
      default:
        vcsData = null;
    }
  }

  if (vcsData) {
    writeFileSync(`${config.build.assetsRoot}/vcs.info`, vcsData, 'utf8')
  }
} catch (e) {
  console.warn(e.message)
}
