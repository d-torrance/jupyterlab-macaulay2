import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IEditorLanguageRegistry } from '@jupyterlab/codemirror';
import { LanguageSupport } from '@codemirror/language';
import { macaulay2 } from 'codemirror-lang-macaulay2';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-macaulay2:plugin',
  autoStart: true,
  description: 'CodeMirror-based syntax highlighting for Macaulay2 code',
  requires: [IEditorLanguageRegistry],
  activate: async (app: JupyterFrontEnd, registry: IEditorLanguageRegistry) => {
    registry.addLanguage({
      name: 'Macaulay2',
      mime: 'text/x-macaulay2',
      support: new LanguageSupport(macaulay2()),
      extensions: ['m2']
    });
  }
};

export default plugin;
