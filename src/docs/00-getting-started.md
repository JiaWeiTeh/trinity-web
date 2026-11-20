# Getting started

You need git and Python 3.11 or newer. TRINITY is pure Python, so there is
nothing to compile.

## Install

```bash
git clone https://github.com/JiaWeiTeh/trinity
cd trinity
pip install -r requirements.txt
```

`requirements.txt` holds numpy below 2 and scipy at 1.17.1 or newer. Keep both
pins. Some numpy 2 releases break the bubble-structure integrator, and older
scipy stops a run that starts in a dense core.

## Run the example

```bash
python run.py param/simple_cluster.param
```

The file you just ran is two lines long:

```text
mCloud    1e5
sfe    0.3
```

It asks for a cloud of $10^5\,M_\odot$ that turns 30% of its mass into stars.
Every other parameter takes its default. A run like this takes tens of minutes
on one core. The results go to
`outputs/simple_cluster/`, a folder named after the parameter file.

If the run stops before it starts, the message in the terminal names the
problem. A misspelt keyword is the usual one, and the
[parameter table](?view=docs&page=parameters) has the correct spelling. Once a
run is under way, the last lines of `outputs/simple_cluster/trinity.log` say
why it stopped.

## Look at a run

Three finished runs ship with the repository, so you can look at TRINITY output
while your own run is still going. The
[tutorial notebook](?view=docs&page=notebook) opens them and plots the shell
radius, the density inside it and how many ionising photons escape.

To set up your own cloud, go to [Running TRINITY](?view=docs&page=running).

## Cite and license

If you publish work that uses TRINITY, cite
[Paper I](https://ui.adsabs.harvard.edu/abs/arXiv:2605.27517/abstract). The
BibTeX entry is on the [overview page](?view=overview). The code is released
under the [GNU General Public License v3](https://www.gnu.org/licenses/gpl-3.0.html),
and a copy is in `LICENSE` at the top of the repository.

## Questions

Email me at jiaweiteh.astro (at) gmail.com. For a bug, an
[issue on GitHub](https://github.com/JiaWeiTeh/trinity/issues) with your
parameter file and `trinity.log` attached is the fastest route to a fix.
