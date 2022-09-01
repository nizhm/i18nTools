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
// const templateTagReg = /^<template[^>]*>[\s\S]*<\/template>[\r\n]*/;
// const scriptTagReg = /<script[^>]*>[\s\S]*<\/script>/;
// const styleTagReg = /[\r\n]*<style[^>]*>[\s\S]*$/;

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

// 匹配句末含符号（问号和感叹号）的中文（不包括特殊字符限制提示语）
const endMarkReg = /[A-Za-z0-9 \u4e00-\u9fa5](\?|？|!|！)$/;
const endMarkMap = new Map([
  ['?', '?？'],
  ['？', '?？'],
  ['!', '!！'],
  ['！', '!！']
]);
// 正则元字符匹配
const metaCharsReg = /([\^$.|?*+()\[\]{}:<>`])/g; // todo: 转义字符也是meta

class Replacement {
  constructor({ i18nKey, cnValue }) {
    this.i18nKey = i18nKey;

    const matchResult = cnValue.match(endMarkReg);
    let value;
    if (matchResult) {
      const end = matchResult[1];
      // 中文先去掉句末符号（句末符号放到正则组里不需要转义）
      let noEndCn = cnValue.replace(end, '');
      // 前面一截中文转义元字符
      noEndCn = noEndCn.replace(metaCharsReg, '\\$1');
      // 句末符号放到组
      value = noEndCn + `[${endMarkMap.get(end)}]`;
    } else {
      // 句末无符号的中文，整个转义元字符
      value = cnValue.replace(metaCharsReg, '\\$1');
    }

    this.templateAttrReg = new RegExp(`[A-Za-z0-9.-]+="(${value})(|:|：)"|['\`]${value}['\`]`, 'g');
    this.templateAttrReplacement = `$t('${i18nKey}')`;

    this.templatePlainTextReg = new RegExp(`>[ \r\n]*(${value})[ \r\n:：]*<`, 'g');
    this.templatePlainTextReplacement = `{{ $t('${i18nKey}') }}`;


    this.jsReg = new RegExp(`['"\`]${value}['"\`]`, 'g');
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
