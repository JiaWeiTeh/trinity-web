# Tutorial notebook

[Download this notebook](/trinity-web/notebook/quickstart.ipynb) to run it yourself, or read it
here. It works on a fresh clone — the runs it opens ship with the repository.

This notebook opens finished TRINITY runs and plots them. Three runs ship with the
repository under `examples/runs/`, so everything below works straight after cloning —
there is no simulation to run first.

The three use the same cloud mass ($10^6\,M_\odot$) and the same star-formation
efficiency (1%). The only thing that differs is how the cloud's mass is arranged:

| Run | Density profile | Config |
|---|---|---|
| `homogeneous` | uniform | `param/cloud_example_homogeneous.param` |
| `powerlaw` | $\rho \propto r^{-2}$ | `param/cloud_example_PL.param` |
| `bonnor_ebert` | Bonnor–Ebert sphere | `param/cloud_example_BE.param` |

That one difference turns out to decide whether the shell escapes or falls back —
which is what the last section shows.

## Opening a run

A run is a folder. `TrinityOutput.open()` takes the `dictionary.jsonl` inside it and
picks up `metadata.json` from alongside — which is why a run folder has to be copied
as a whole, not just the `.jsonl`.


```python
%matplotlib inline

import sys
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

# Walk up from wherever this notebook was started until we find the repository
# root. This means the notebook works whether you launched Jupyter at the top
# level or inside examples/, and without installing TRINITY first.
repo_root = Path.cwd()
while not (repo_root / 'trinity' / '__init__.py').exists():
    repo_root = repo_root.parent

if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

import astropy.units as u

from trinity._output.trinity_reader import TrinityOutput

runs_dir = repo_root / 'examples' / 'runs'

runs = {}
for name in ['homogeneous', 'powerlaw', 'bonnor_ebert']:
    runs[name] = TrinityOutput.open(runs_dir / name / 'dictionary.jsonl')

# Most of the notebook follows the uniform cloud. The last section uses all three.
run = runs['homogeneous']
run
```




```output
TrinityOutput('dictionary.jsonl', snapshots=82, t=[1.9562e-06, 1.5000e+01])
```
## What is in the run

`info()` summarises the run: how long it went on for, which evolutionary phases it
passed through, how it ended, and the state of the bubble when it stopped. Add
`verbose=True` to list every stored quantity with its description and units.


```python
run.info()
```

```output
======================================================================
TRINITY Output: dictionary.jsonl
======================================================================

  Model name:    cloud_example_homogeneous
  Snapshots:     82
  Time range:    [1.9562e-06, 1.5000e+01] Myr
  Parameters:    162

  Phases:
    energy      :   13 snapshots, t=[1.9562e-06, 1.8693e-03]
    implicit    :   20 snapshots, t=[3.5000e-03, 2.2437e+00]
    transition  :    6 snapshots, t=[2.4957e+00, 2.9022e+00]
    momentum    :   43 snapshots, t=[2.9196e+00, 1.5000e+01]

  Ended:         stopping_time — Stopping time reached
  Final state:
    age                    15.000 Myr
    shell radius R2        85.719 pc
    expansion velocity     0.825 km/s
    shell mass swept       1.893e+06 Msun
    shell thickness        64.109 pc
    peak shell density     1.625e+01 cm^-3
    bubble energy          0.000e+00 erg
    bubble pressure        1.491e+03 K cm^-3 (P/k_B)
    bubble temperature     1.656e+06 K
    fate                   still expanding
```
## Shell radius and velocity

`get()` returns any stored quantity across every snapshot as a NumPy array. Times are
in Myr, radii in pc, velocities in pc/Myr (1 pc/Myr is about 0.98 km/s).

The coloured bands behind the curves mark the evolutionary regime. TRINITY labels the
energy-driven regime with two names, `energy` and `implicit`, depending on how cooling
is solved — so both are shaded as one band below. After that come `transition` and
finally `momentum`, always in that order.


```python
# 'energy' and 'implicit' are two labels for the same physical regime.
regime_of = {
    'energy':     'energy-driven',
    'implicit':   'energy-driven',
    'transition': 'transition',
    'momentum':   'momentum',
}

band_colour = {
    'energy-driven': '#DCEAF5',
    'transition':    '#F5E9DC',
    'momentum':      '#E6F0E4',
}


def shade_regimes(ax, out):
    """Shade the background of a time axis, one band per regime."""
    times = out.get('t_now')
    regimes = [regime_of[p] for p in out.get('current_phase', as_array=False)]

    already_labelled = []
    band_start = 0

    for i in range(1, len(regimes) + 1):
        last_snapshot = (i == len(regimes))
        if last_snapshot or regimes[i] != regimes[band_start]:
            name = regimes[band_start]
            end = times[-1] if last_snapshot else times[i]

            # Only label each regime once, so the legend has three entries.
            label = None if name in already_labelled else name
            already_labelled.append(name)

            ax.axvspan(times[band_start], end, color=band_colour[name],
                       zorder=0, label=label)
            band_start = i


time = run.get('t_now')

fig, (top, bottom) = plt.subplots(2, 1, figsize=(7, 6), sharex=True)

shade_regimes(top, run)
top.plot(time, run.get('R2'), color='#1E2430', lw=1.6)
top.set_ylabel('shell radius $R_2$  [pc]')
top.legend(loc='lower right', fontsize=9, frameon=False)

shade_regimes(bottom, run)
bottom.plot(time, run.get('v2'), color='#0EA5C8', lw=1.6)
bottom.set_ylabel('velocity $v_2$  [pc/Myr]')
bottom.set_xlabel('time  [Myr]')

top.set_yscale('log')
bottom.set_yscale('log')
bottom.set_xscale('log')

fig.suptitle('Uniform cloud: how the shell expands', y=0.94)
fig.tight_layout()
```


    
![png](/trinity-web/notebook/quickstart_files/quickstart_6_0.png)
    


## Units

Everything comes back in TRINITY's internal units — masses in $M_\odot$, lengths in
pc, times in Myr. You do not have to remember which is which: `units()` tells you what
a quantity is stored in, and `quantity()` hands back the same numbers as an astropy
`Quantity`, so astropy can do the conversion for you.


```python
print('R2 is stored in  ', run.units('R2'))
print('v2 is stored in  ', run.units('v2'))
print('Eb is stored in  ', run.units('Eb'))
print('isCollapse is    ', run.units('isCollapse'), '(no units — it is a flag)')

# Attach the units and let astropy convert.
velocity = run.quantity('v2')
print()
print('final velocity:', velocity[-1])
print('          same:', velocity[-1].to('km/s'))
print('shell radius :', run.quantity('R2')[-1].to('lyr'))
```

```output
R2 is stored in   pc
v2 is stored in   pc/Myr
Eb is stored in   Msun*pc^2/Myr^2
isCollapse is     None (no units — it is a flag)

final velocity: 0.8433577434446878 pc / Myr
          same: 0.8246286416344784 km / s
shell radius : 279.57757711528933 lyr
```
## Which feedback channel is pushing

Every snapshot stores the forces acting on the shell, so you can watch the balance
shift as the cluster ages. Gravity pulls inward and everything else pushes outward, so
the plot shows magnitudes.


```python
forces = {
    'F_ram':  'wind ram pressure',
    'F_HII':  'photoionised gas',
    'F_rad':  'radiation pressure',
    'F_grav': 'gravity (inward)',
}

fig, ax = plt.subplots(figsize=(7, 4))
shade_regimes(ax, run)

for key, label in forces.items():
    linestyle = '--' if key == 'F_grav' else '-'
    ax.plot(time, np.abs(run.get(key)), linestyle, lw=1.5, label=label)

ax.set_xscale('log')
ax.set_yscale('log')
ax.set_xlabel('time  [Myr]')
ax.set_ylabel(r'|force|  [$M_\odot$ pc Myr$^{-2}$]')
ax.legend(fontsize=9, frameon=False, ncol=2)
ax.set_title('What drives the shell')
fig.tight_layout()
```


    
![png](/trinity-web/notebook/quickstart_files/quickstart_10_0.png)
    


## Looking inside a snapshot

Most stored quantities are a single number per snapshot, but a few are radial
profiles. Each profile comes with its own radius axis, named `*_r_arr`. Profiles that
span many orders of magnitude are stored as $\log_{10}$ and named with a `log_`
prefix, so remember to undo that before plotting. Profile arrays are not covered by
`quantity()` — that works on the per-snapshot time series — so attach the unit yourself
and let astropy convert, exactly as above.

Plotting the raw radius is not much use here. The shell grows from about 0.07 pc to
190 pc over the run, so on a shared axis the early profiles collapse into the left
edge and you cannot see them at all. Dividing by $R_2$ is not enough either: the
youngest shell is so thin that it still comes out as a single vertical line.

So the x-axis below is the fraction of the way through the shell — 0 at the inner
edge $R_2$, 1 at the outer edge. Every snapshot then fills the axis and you can
compare the *shape* of the density profile across four orders of magnitude in size.
The legend keeps the physical scale, since that is what the normalisation hides.


```python
# The earliest snapshots are from before there is a resolved shell, so their
# profile arrays are nearly empty. Use the ones that actually have a profile.
with_profile = []
for snapshot in run:
    if len(snapshot.get('shell_r_arr', []) or []) >= 10:
        with_profile.append(snapshot)

chosen = np.linspace(0, len(with_profile) - 1, 4, dtype=int)

fig, ax = plt.subplots(figsize=(7, 4))

for i in chosen:
    snapshot = with_profile[i]
    radius = np.asarray(snapshot['shell_r_arr'])
    # Undo the log10, then let astropy convert pc^-3 to cm^-3.
    density = (10 ** np.asarray(snapshot['log_shell_n_arr']) / u.pc ** 3).to(1 / u.cm ** 3)

    # Rescale to 'fraction of the way through the shell', so a shell 0.07 pc
    # across and one 100 pc across can be compared side by side.
    thickness = radius[-1] - radius[0]
    if thickness <= 0:
        continue                      # a shell with no width yet: nothing to draw
    depth = (radius - radius[0]) / thickness

    ax.plot(depth, density, lw=1.4,
            label=f"{snapshot.t_now:8.3g} Myr   $R_2$={snapshot['R2']:6.3g} pc")

ax.set_xlabel('depth into the shell      (0 = inner edge $R_2$, 1 = outer edge)')
ax.set_ylabel(r'shell number density  [cm$^{-3}$]')
ax.set_yscale('log')
ax.legend(fontsize=9, frameon=False, title='snapshot at')
ax.set_title('The shell thickens as it sweeps up gas')
fig.tight_layout()
```


    
![png](/trinity-web/notebook/quickstart_files/quickstart_12_0.png)
    


## Same cloud mass, same efficiency, three different endings

This is the comparison the three shipped runs exist for. Nothing differs between them
except the density profile, and yet one shell keeps expanding while the other two turn
around and collapse. The marker shows where each run ended.


```python
styles = {
    'homogeneous':  ('uniform',                 '#1E2430'),
    'powerlaw':     ('power law, $r^{-2}$',     '#0EA5C8'),
    'bonnor_ebert': ('Bonnor-Ebert',            '#C2703D'),
}

fig, ax = plt.subplots(figsize=(7, 4.5))

for name, out in runs.items():
    label, colour = styles[name]
    t = out.get('t_now')
    radius = out.get('R2')
    ax.plot(t, radius, color=colour, lw=1.7, label=label)
    ax.plot(t[-1], radius[-1], 'o', color=colour, ms=6)

ax.set_xscale('log')
ax.set_yscale('log')
ax.set_xlabel('time  [Myr]')
ax.set_ylabel('shell radius $R_2$  [pc]')
ax.legend(fontsize=9, frameon=False)
ax.set_title('Cloud structure decides the outcome')
fig.tight_layout()

for name, out in runs.items():
    ending = out.termination or {}
    print(f"{styles[name][0]:22} ran to {out.t_max:6.2f} Myr   "
          f"{ending.get('detail', 'unknown')}")
```

```output
uniform                ran to  15.00 Myr   Stopping time reached
power law, $r^{-2}$    ran to   1.88 Myr   Small radius reached (event)
Bonnor-Ebert           ran to   4.03 Myr   Small radius reached (event)
```
![png](/trinity-web/notebook/quickstart_files/quickstart_14_1.png)
    


## Where to go from here

A few things worth knowing once you start using your own runs:

- `run.get_at_time(2.0)` gives the state at any moment, interpolated between snapshots.
- `run.filter(phase='momentum')` narrows to part of a run and hands back another
  `TrinityOutput`, so everything above still works on it.
- `run.to_dataframe()` converts a whole run to a pandas `DataFrame`.
- `run.info(verbose=True)` lists every available quantity with its units.

One practical note if you open your own fresh output rather than the runs shipped here:
TRINITY writes snapshots in the order its buffer flushes them, which is not
chronological, and long runs can repeat snapshots. Sort before plotting, or pass the
run through `examples/thin_run.py`, which sorts and de-duplicates.

The [parameter reference](https://jiaweiteh.github.io/trinity-web/?view=docs&page=parameters)
lists every quantity and its units, and the
[running guide](https://jiaweiteh.github.io/trinity-web/?view=docs&page=running)
covers setting up your own runs and sweeps.
