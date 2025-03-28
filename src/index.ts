import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IEditorLanguageRegistry } from '@jupyterlab/codemirror';
import { LanguageSupport } from '@codemirror/language';
import { macaulay2 as cmMacaulay2 } from 'codemirror-lang-macaulay2';
import hljs from 'highlight.js';
import hljsMacaulay2 from 'highlightjs-macaulay2';
import 'highlight.js/styles/github.css';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-macaulay2:plugin',
  autoStart: true,
  description: 'CodeMirror-based syntax highlighting for Macaulay2 code',
  requires: [IEditorLanguageRegistry],
  activate: async (app: JupyterFrontEnd, registry: IEditorLanguageRegistry) => {
    registry.addLanguage({
      name: 'Macaulay2',
      mime: 'text/x-macaulay2',
      support: new LanguageSupport(cmMacaulay2()),
      extensions: ['m2']
    });

    // syntax highlighting in output
    hljs.registerLanguage('macaulay2', hljsMacaulay2);

    const observer = new MutationObserver(() => {
      document.querySelectorAll('code.language-macaulay2').forEach(element => {
        const htmlElement = element as HTMLElement;
        if (!htmlElement.dataset.highlighted) {
          hljs.highlightElement(htmlElement);
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
};

export default plugin;
