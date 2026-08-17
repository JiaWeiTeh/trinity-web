# Tutorial notebook

A Jupyter notebook that opens finished TRINITY runs and plots them. Three runs
ship with the repository, so it works on a fresh clone with no simulation to run
first.

```notebook
```

## What it covers

- Opening a run and reading its summary — phases, how it ended, the state of the
  bubble at the end.
- Shell radius and velocity against time, shaded by evolutionary regime.
- Finding out what units a quantity is stored in, and handing it to astropy.
- The force budget: which feedback channel drives the shell, and when.
- A radial profile from inside a single snapshot.
- The three shipped runs side by side — same cloud mass, same star-formation
  efficiency, three different fates.

## Running it yourself

The notebook and its data live under `examples/` in the
[repository](https://github.com/JiaWeiTeh/trinity):

```bash
git clone https://github.com/JiaWeiTeh/trinity
cd trinity
pip install -r requirements.txt jupyter
jupyter lab examples/quickstart.ipynb
```

It finds the repository root by itself, so it runs whether you start Jupyter at
the top level or inside `examples/`, and without installing TRINITY first.

To point it at your own results instead, change the run directory in the first
cell. See [Running TRINITY](?view=docs&page=running) for how output is laid out.
