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

const endMarkReg = /[A-Za-z0-9 \u4e00-\u9fa5](\?|？|!|！)$/;
class Replacement {
  constructor({ i18nKey, cnValue }) {
    this.i18nKey = i18nKey;

    const value = cnValue.replace(/([\[\]{}.$*/?"<>|`])/g, '\\$1');

    this.templateAttrReg = new RegExp(`[A-Za-z0-9.-]+="(${value})(|:|：)"|['\`]${value}['\`]`, 'g');
    this.templateAttrReplacement = `$t('${i18nKey}')`;

    this.templatePlainTextReg = new RegExp(`>[ \n]*(${value})[ \n:：]*<`, 'g');
    this.templatePlainTextReplacement = `{{ $t('${i18nKey}') }}`;

    this.jsReg = new RegExp(`['"\`]${value}(|\\?|!|\\.|？|！|。)['"\`]`, 'g');
    this.scriptReplacement = `this.$t('${i18nKey}')`;
    this.jsReplacement = `i18n.tc('${i18nKey}')`;
  }
}

const keyToReplacement = (keyList = []) => keyList.map(keyData => new Replacement(keyData));

const filterVariableItem = (keyList = []) => {
  const variableReg = /[^$]\{[A-Za-z0-9-_]+}/;
  const list = [];
  const variableItemList = [];

  for(const keyListElement of keyList) {
    if (variableReg.test(keyListElement.cnValue)) {
      variableItemList.push(keyListElement);
      continue;
    }

    list.push(keyListElement);
  }

  return [list, variableItemList];
};

module.exports = {
  replaceComments,
  VueComponent,
  keyToReplacement,
  filterVariableItem
}
