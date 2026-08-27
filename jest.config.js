const jestJupyterLab = require('@jupyterlab/testutils/lib/jest-config');

const esModules = [
  '@codemirror',
  '@jupyter/react-components',
  '@jupyter/web-components',
  '@jupyter/ydoc',
  '@jupyterlab/',
  '@microsoft',
  'exenv-es6',
  'lib0',
  'nanoid',
  'vscode-ws-jsonrpc',
  'y-protocols',
  'y-websocket',
  'yjs'
].join('|');

const baseConfig = jestJupyterLab(__dirname);

module.exports = {
  ...baseConfig,
  automock: false,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/.ipynb_checkpoints/*'
  ],
  coverageReporters: ['lcov', 'text'],
  // Match against <rootDir> rather than testRegex: Jest tests the regex
  // against absolute paths, so a bare "src/" also matches a checkout that
  // happens to live under a directory named src -- and would then try to run
  // the Playwright specs in ui-tests under jsdom.
  testMatch: ['<rootDir>/src/**/*.spec.ts?(x)'],
  testRegex: undefined,
  transform: {
    ...baseConfig.transform,
    // Transpile only.  Under ts-jest, module resolution runs in CommonJS mode
    // and picks @codemirror/* up through their "require" condition, i.e. the
    // .d.cts files, while @jupyterlab/codemirror's own declarations reference
    // the .d.ts ones -- so identical types are reported as unrelated.  The
    // production resolution has no such split, so type checking lives in
    // "jlpm typecheck" instead.
    '^.+\\.tsx?$': [
      'ts-jest/legacy',
      { tsconfig: './tsconfig.test.json', diagnostics: false }
    ]
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules}).+`]
};
