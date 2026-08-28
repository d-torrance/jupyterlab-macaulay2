import { JupyterFrontEnd } from '@jupyterlab/application';
import {
  EditorLanguageRegistry,
  IEditorLanguageRegistry
} from '@jupyterlab/codemirror';
import plugin from '../index';

/**
 * The observer would otherwise outlive its test, with a fixture from an
 * earlier case being highlighted while a later one sets up.
 */
afterEach(() => {
  plugin.deactivate?.({} as JupyterFrontEnd);
  document.body.innerHTML = '';
});

const activate = async (): Promise<IEditorLanguageRegistry> => {
  const registry = new EditorLanguageRegistry();
  const activatePlugin = plugin.activate as (
    app: JupyterFrontEnd,
    registry: IEditorLanguageRegistry
  ) => Promise<void>;
  await activatePlugin({} as JupyterFrontEnd, registry);
  return registry;
};

const waitFor = async (predicate: () => boolean): Promise<void> => {
  for (let i = 0; i < 200; i++) {
    if (predicate()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  throw new Error('timed out waiting for highlighting');
};

/** A documentation example: <pre><code class="language-macaulay2">. */
const docExample = (text: string): HTMLElement => {
  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.className = 'language-macaulay2';
  code.textContent = text;
  pre.appendChild(code);
  document.body.appendChild(pre);
  return code;
};

const highlighted = (element: HTMLElement) => () =>
  element.dataset.highlighted === 'yes' &&
  element.querySelectorAll('span').length > 0;

describe('plugin metadata', () => {
  it('is a Macaulay2 plugin that starts on its own', () => {
    expect(plugin.id).toBe('jupyterlab-macaulay2:plugin');
    expect(plugin.autoStart).toBe(true);
  });

  it('requires the editor language registry', () => {
    expect(plugin.requires).toContain(IEditorLanguageRegistry);
  });
});

describe('language registration', () => {
  it('registers Macaulay2 with its mime type and file extension', async () => {
    const registry = await activate();
    const language = registry
      .getLanguages()
      .find(candidate => candidate.name === 'Macaulay2');

    expect(language).toBeDefined();
    expect(language!.mime).toBe('text/x-macaulay2');
    expect(language!.extensions).toEqual(['m2']);
    expect(language!.support).toBeDefined();
  });

  it('makes the language reachable by mime type', async () => {
    const registry = await activate();
    expect(registry.findByMIME('text/x-macaulay2')?.name).toBe('Macaulay2');
  });
});

describe('highlighting Macaulay2 in output', () => {
  it('highlights blocks that are already present when it activates', async () => {
    const code = docExample('R = QQ[x,y]');
    await activate();
    await waitFor(highlighted(code));
  });

  it('highlights blocks added afterwards', async () => {
    await activate();
    const code = docExample('ideal(x,y)');
    await waitFor(highlighted(code));
  });

  it('highlights a code element added on its own', async () => {
    await activate();
    const code = document.createElement('code');
    code.className = 'language-macaulay2';
    code.textContent = 'isPrime 7';
    document.body.appendChild(code);
    await waitFor(highlighted(code));
  });

  it('highlights inline code outside a pre, as in Usage lines', async () => {
    await activate();
    const dd = document.createElement('dd');
    dd.innerHTML = '<code class="language-macaulay2">gcd(x,y,...)</code>';
    document.body.appendChild(dd);
    const code = dd.querySelector('code') as HTMLElement;
    await waitFor(highlighted(code));
  });

  it('preserves the original text exactly', async () => {
    await activate();
    const source = 'R = QQ[x,y]\nideal(x^2, x*y)';
    const code = docExample(source);
    await waitFor(highlighted(code));
    expect(code.textContent).toBe(source);
  });

  it('gives different tokens different styles', async () => {
    await activate();
    const code = docExample('if isPrime 5 then QQ else ZZ');
    await waitFor(highlighted(code));

    const classes = new Set(
      Array.from(code.querySelectorAll('span')).map(span => span.className)
    );
    expect(classes.size).toBeGreaterThan(1);
  });

  it('does not highlight a block it has already done', async () => {
    const registry = await activate();

    // somewhere the observer will see again when it is re-inserted
    const container = document.createElement('div');
    document.body.appendChild(container);
    const code = document.createElement('code');
    code.className = 'language-macaulay2';
    code.textContent = 'matrix{{1,2},{3,4}}';
    container.appendChild(code);
    await waitFor(highlighted(code));

    const highlight = jest.spyOn(registry, 'highlight');
    container.remove();
    document.body.appendChild(container);
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(highlight).not.toHaveBeenCalled();
    highlight.mockRestore();
  });

  it('restores the source when highlighting fails', async () => {
    const registry = new EditorLanguageRegistry();
    jest.spyOn(registry, 'highlight').mockRejectedValue(new Error('boom'));
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});

    const source = 'R = QQ[x,y]';
    const code = docExample(source);
    const activatePlugin = plugin.activate as (
      app: JupyterFrontEnd,
      registry: IEditorLanguageRegistry
    ) => Promise<void>;
    await activatePlugin({} as JupyterFrontEnd, registry);

    await waitFor(() => error.mock.calls.length > 0);
    expect(code.textContent).toBe(source);
    error.mockRestore();
  });

  it('stops watching once the plugin is deactivated', async () => {
    await activate();
    plugin.deactivate?.({} as JupyterFrontEnd);

    const code = docExample('R = QQ[x,y]');
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(code.dataset.highlighted).toBeUndefined();
    expect(code.querySelectorAll('span')).toHaveLength(0);
  });

  it('leaves other languages alone', async () => {
    await activate();
    const code = document.createElement('code');
    code.className = 'language-python';
    code.textContent = 'import sys';
    document.body.appendChild(code);

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(code.dataset.highlighted).toBeUndefined();
    expect(code.querySelectorAll('span')).toHaveLength(0);
  });
});
