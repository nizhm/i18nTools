(async () => {
  const VueTemplateCompiler = require('vue-template-compiler');
  const ComponentCompiler = require('@vue/component-compiler');
  const path = require('path');
  // console.log(VueTemplateCompiler);
  // console.log(VueTemplateCompiler.compile);
  // console.log(VueTemplateCompiler.parseComponent);

  const filePath = 'D:\\Projects\\ChiyuBank\\git\\umc-web\\src\\views\\smail\\components\\AttachmentUploader.vue';
  const { readFile } = require('fs/promises');
  const fileString = await readFile(filePath, 'utf8');
  const component = VueTemplateCompiler.parseComponent(fileString);
  const compiler = ComponentCompiler.createDefaultCompiler();
  const componentDescriptor = await compiler.compileToDescriptor(path.basename(filePath), component.source);
  console.log(componentDescriptor)
})()

