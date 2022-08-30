const replaceComments = str => {
  const multiHtmlReg = /<!--[\w\W\n\s]+?-->/g;
  const singleHtmlReg = /<!--.*?-->/g;
  const multiJsReg = /\/\*(?:(?!\*\/).|[\n\r])*\*\//g;
  const singleJsReg = /\/\/.*/g;
  const reg = new RegExp(
    [
      multiHtmlReg.source,
      singleHtmlReg.source,
      multiJsReg.source,
      singleJsReg.source
    ].join('|'),
    'g'
  );
  str = str
    // .replace(multiHtmlReg, '')
    // .replace(singleHtmlReg, '')
    // .replace(multiJsReg, '')
    // .replace(singleJsReg, '')
    .replace(reg, '');
  return str;
};

const createTagReg = tagName => new RegExp(`<${tagName}[^>]*>[\\s\\S]*<\\/${tagName}>`, 'gi');
const templateTagReg = createTagReg('template');
const scriptTagReg = createTagReg('script');
const styleTagReg = createTagReg('style');

class VueComponent {
  constructor(fileText) {
    const template = fileText.match(templateTagReg);
    const script = fileText.match(scriptTagReg);
    const style = fileText.match(styleTagReg);

    this.template = template ? template[0] : '';
    this.script = script ? '\n\n' + script[0] : '';
    this.style = style ? '\n\n' + style[0] + '\n' : '\n';
  }
}

class Replacement {
  constructor({ i18nKey, cnValue }) {
    const value = cnValue.replace(/([\[\]{}.$*])/g, '\\$1');
    this.i18nKey = i18nKey;
    this.reg = new RegExp(value, 'g').source;
    this.templateReplacement = `$t('${i18nKey}')`;
    this.scriptReplacement = `this.$t('${i18nKey}')`;
    this.jsReplacement = `i18n.tc('${i18nKey}')`;
  }
}

const keyToReplacement = (keyList = []) => {
  const list = keyList.map(keyData => {
    const r = new Replacement(keyData);
    console.log(r);
    return r;
  });
  return list;
};

module.exports = {
  replaceComments,
  VueComponent,
  keyToReplacement
}
