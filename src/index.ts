import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IEditorLanguageRegistry } from '@jupyterlab/codemirror';
import { LanguageSupport } from '@codemirror/language';
import { macaulay2 as cmMacaulay2 } from 'codemirror-lang-macaulay2';

// kept out of activate() so that deactivate() can stop it again
let observer: MutationObserver | null = null;

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-macaulay2:plugin',
  autoStart: true,
  description: 'CodeMirror-based syntax highlighting for Macaulay2 code',
  requires: [IEditorLanguageRegistry],
  activate: async (app: JupyterFrontEnd, registry: IEditorLanguageRegistry) => {
    const language = {
      name: 'Macaulay2',
      mime: 'text/x-macaulay2',
      support: new LanguageSupport(cmMacaulay2()),
      extensions: ['m2']
    };

    registry.addLanguage(language);

    // Neither kind of rendered Macaulay2 arrives highlighted: the kernel emits
    // documentation as raw HTML, which rendermime's markdown highlighter never
    // sees, and fenced macaulay2 blocks in markdown cells come out plain too.
    // Both carry the same class, so highlight them ourselves, using the same
    // language and the same theme-aware styles as the editor above.
    const pending = 'code.language-macaulay2:not([data-highlighted])';

    const highlight = async (element: HTMLElement) => {
      // mark before awaiting, so a later callback cannot pick up the same
      // element while this one is still running
      element.dataset.highlighted = 'yes';
      const code = element.textContent ?? '';
      element.textContent = '';
      try {
        await registry.highlight(code, language, element);
      } catch (error) {
        // The element is emptied before the await, so a failure here would
        // otherwise leave the block blank with no way back to the source.
        // Put the text back unhighlighted and keep the marker, so a block
        // that cannot be parsed is not retried every time it is re-inserted.
        element.textContent = code;
        console.error('failed to highlight Macaulay2 code', error);
      }
    };

    const highlightIn = (root: HTMLElement) => {
      if (root.matches(pending)) {
        void highlight(root);
      }
      root
        .querySelectorAll<HTMLElement>(pending)
        .forEach(element => void highlight(element));
    };

    // anything rendered before we started watching
    highlightIn(document.body);

    observer = new MutationObserver(records => {
      records.forEach(record => {
        record.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            highlightIn(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  },
  deactivate: () => {
    observer?.disconnect();
    observer = null;
  }
};

export default plugin;
