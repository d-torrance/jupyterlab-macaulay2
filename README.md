# jupyterlab_macaulay2

[![PyPI version](https://badge.fury.io/py/jupyterlab-macaulay2.svg)](https://pypi.org/project/jupyterlab-macaulay2/)
[![npm version](https://badge.fury.io/js/jupyterlab-macaulay2.svg)](https://www.npmjs.com/package/jupyterlab-macaulay2)
[![Github Actions Status](https://github.com/d-torrance/jupyterlab-macaulay2/workflows/build/badge.svg)](https://github.com/d-torrance/jupyterlab-macaulay2/actions/workflows/build.yml)

CodeMirror-based syntax highlighting for Macaulay2 in Jupyter code cells

The extension registers Macaulay2 with JupyterLab's CodeMirror language
registry, so code cells running the
[Macaulay2 kernel](https://github.com/Macaulay2/Macaulay2-Jupyter-Kernel/) and
files ending in `.m2` are highlighted as you type.

It also highlights Macaulay2 in the kernel's _output_. The kernel emits
documentation as raw HTML, which JupyterLab renders without highlighting, so
the extension picks out those code blocks itself -- using the same language
and the same theme-aware colors as the editor. Alongside that, it fixes a
few things about how that output is laid out: examples and nets are
left-aligned, and documentation `Usage:` lines keep the label and the code on
one line.

## Requirements

- JupyterLab >= 4.0.0

## Install

To install the extension, execute:

```bash
pip install jupyterlab_macaulay2
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall jupyterlab_macaulay2
```

## Contributing

If you would like to contribute to this extension, please refer to the [Contributing Guide](CONTRIBUTING.md).
