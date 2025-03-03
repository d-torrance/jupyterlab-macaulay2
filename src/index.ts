import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the jupyterlab-macaulay2 extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-macaulay2:plugin',
  description: 'CodeMirror-based syntax highlighting for Macaulay2 in Jupyter code cells',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab-macaulay2 is activated!');
  }
};

export default plugin;
