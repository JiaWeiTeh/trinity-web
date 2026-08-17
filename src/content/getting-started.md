## Install

Clone the repository and install the Python dependencies:

```bash
git clone https://github.com/JiaWeiTeh/trinity
cd trinity
pip install -r requirements.txt
```

TRINITY is pure Python (no compilation step) and requires Python 3.9 or
newer.

## First run

From the repository root:

```bash
python run.py param/simple_cluster.param
```

This integrates a small, pre-shipped example (a $10^5\,M_\odot$ cloud at
30% star-formation efficiency, with everything else falling back to
defaults). Outputs land in the directory set by `path2output` — by
default, `outputs/<model_name>/` under the working directory. See
[Running TRINITY](?view=docs&page=running) for the parameter-file
syntax, sweep modes, CLI flags, and output layout.

## Seeing the output

The [tutorial notebook](?view=docs&page=notebook) reads finished runs that ship
with the repository and plots them, so you can see what TRINITY produces before
running anything yourself.

## License & citation

TRINITY is distributed under the [GNU GPL v3](?view=docs&page=license).
For the physical model and results, see the [Paper](?view=paper). If
you use it in published work, please see the
[publications page](?view=docs&page=publications) for the citation and
acknowledgement.
