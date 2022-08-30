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
    this.replacedCount = 0;
    const value = cnValue.replace(/([\[\]{}.$*/?"<>|`])/g, '\\$1');
    this.i18nKey = i18nKey;
    this.templateAttrReg = new RegExp(`[A-Za-z0-9.-]+="(${value})(|:|：)"|['\`]${value}['\`]`, 'g');
    this.templatePlainTextReg = new RegExp(`>[ \n]*(${value})<`, 'g');
    this.jsReg = new RegExp(`['"\`]${value}(|\\?|!|\\.|？|！|。)['"\`]`, 'g');
    this.templateAttrReplacement = `$t('${i18nKey}')`;
    this.templatePlainTextReplacement = `{{ $t('${i18nKey}') }}`;
    this.scriptReplacement = `this.$t('${i18nKey}')`;
    this.jsReplacement = `i18n.tc('${i18nKey}')`;
  }
}

const keyToReplacement = (keyList = []) => keyList.map(keyData => new Replacement(keyData));

module.exports = {
  replaceComments,
  VueComponent,
  keyToReplacement
}
