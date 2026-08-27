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

    // highlightElement() sets data-highlighted, so this selector both finds the
    // work and skips what is already done
    const pending = 'code.language-macaulay2:not([data-highlighted])';

    const highlightIn = (root: HTMLElement) => {
      if (root.matches(pending)) {
        hljs.highlightElement(root);
      }
      root
        .querySelectorAll<HTMLElement>(pending)
        .forEach(element => hljs.highlightElement(element));
    };

    // anything rendered before we started watching
    highlightIn(document.body);

    // highlightElement() rewrites innerHTML, which is itself a mutation of the
    // observed subtree, so only look at what was added rather than rescanning
    // the whole document on every callback
    const observer = new MutationObserver(records => {
      records.forEach(record => {
        record.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            highlightIn(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
};

export default plugin;
