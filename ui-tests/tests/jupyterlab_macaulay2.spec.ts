import { IJupyterLabPageFixture, expect, test } from '@jupyterlab/galata';

const source = 'R = QQ[x,y]';

/** A comment, a string and a symbol: three different token styles. */
const editorSource = ['-- a ring', 'R = QQ[x,y]', 'f = "hello"'].join('\n');

/** A code element as the Macaulay2 kernel emits it, inside raw HTML output. */
const htmlOutput = (language: string, code: string) =>
  [
    'from IPython.display import HTML',
    `HTML('<pre><code class="language-${language}">${code}</code></pre>')`
  ].join('\n');

/**
 * Ask for python3 explicitly: any kernel will do to emit the HTML, but the
 * default depends on what is installed -- a machine with the Macaulay2 kernel
 * would get that one and never run the Python below.
 */
const notebookWith = async (page: IJupyterLabPageFixture, cell: string) => {
  await page.notebook.createNew(undefined, { kernel: 'python3' });
  await page.notebook.setCell(0, 'code', cell);
  await page.notebook.runCell(0, true);
};

test('highlights a Macaulay2 file in the editor', async ({ page, tmpPath }) => {
  // contents paths are relative to the server root, the file browser to the
  // per-test directory
  await page.contents.uploadContent(
    editorSource,
    'text',
    `${tmpPath}/example.m2`
  );
  await page.filebrowser.open('example.m2');

  const spans = page.locator('.cm-content .cm-line span');
  await expect.poll(() => spans.count()).toBeGreaterThan(0);

  // the language really is Macaulay2, not just any tokenizer: the comment,
  // the string and the symbol come out styled differently
  const classes = new Set(
    await spans.evaluateAll(elements =>
      elements.map(element => element.className)
    )
  );
  expect(classes.size).toBeGreaterThan(1);
});

test('highlights Macaulay2 code in HTML output', async ({ page }) => {
  await notebookWith(page, htmlOutput('macaulay2', source));

  const code = page.locator('.jp-RenderedHTMLCommon code.language-macaulay2');
  await expect(code).toHaveAttribute('data-highlighted', 'yes');
  await expect(code.locator('span')).not.toHaveCount(0);

  // highlighting rewrites the element's children, so check the text survived
  await expect(code).toHaveText(source);
});

test('colors both class vocabularies, and only on the kernel elements', async ({
  page
}) => {
  // Macaulay2 emits prism.js class names; the Jupyter kernel rewrites them to
  // highlight.js ones (replaceHypertext in JupyterKernel.m2).  Both go on SAMP
  // for values and DIV for the timing line, while prism.js and highlight.js
  // themselves use SPAN -- which belongs to whatever else produced it.
  const markup = [
    '<samp class="hljs-type">ZZ</samp>',
    '<samp class="token class-name">ZZ</samp>',
    '<div class="hljs-comment">-- 0 seconds</div>',
    '<div class="token comment">-- 0 seconds</div>',
    '<span class="hljs-type">ZZ</span>',
    '<span class="token class-name">ZZ</span>'
  ];
  await notebookWith(
    page,
    ['from IPython.display import HTML', `HTML('''${markup.join('')}''')`].join(
      '\n'
    )
  );

  const color = (selector: string) =>
    page
      .locator(`.jp-RenderedHTMLCommon ${selector}`)
      .evaluate(element => getComputedStyle(element).color);

  const plain = await page
    .locator('.jp-RenderedHTMLCommon')
    .first()
    .evaluate(element => getComputedStyle(element).color);

  expect(await color('samp.hljs-type')).not.toBe(plain);
  expect(await color('samp.token.class-name')).toBe(
    await color('samp.hljs-type')
  );
  expect(await color('div.hljs-comment')).not.toBe(plain);
  expect(await color('div.token.comment')).toBe(
    await color('div.hljs-comment')
  );

  expect(await color('span.hljs-type')).toBe(plain);
  expect(await color('span.token.class-name')).toBe(plain);
});

test('highlights a Macaulay2 fence in a markdown cell', async ({ page }) => {
  await page.notebook.createNew(undefined, { kernel: 'python3' });
  await page.notebook.setCell(
    0,
    'markdown',
    ['```macaulay2', source, '```'].join('\n')
  );
  await page.notebook.runCell(0, true);

  const code = page.locator('.jp-RenderedHTMLCommon code.language-macaulay2');
  await expect(code.locator('span')).not.toHaveCount(0);
  await expect(code).toHaveText(source);
});

test('leaves other languages in HTML output alone', async ({ page }) => {
  await notebookWith(page, htmlOutput('python', 'import sys'));

  const code = page.locator('.jp-RenderedHTMLCommon code.language-python');
  await expect(code).toHaveText('import sys');
  await expect(code).not.toHaveAttribute('data-highlighted');
  await expect(code.locator('span')).toHaveCount(0);
});
