# Tutorial notebook

[Download this notebook](/trinity-web/notebook/quickstart.ipynb) and run it inside a clone of the
repository, or read it here.

Three finished runs ship with the repository in `examples/runs/`. Open them here and plot
what is inside before you run anything yourself. You need the packages in
`requirements.txt`, plus `jupyter` and `smplotlib` for the plot style.

The three clouds have the same mass ($10^6\,M_\odot$) and the same star-formation
efficiency (1%). They differ in how the gas is arranged:

| Run | Cloud | Parameter file |
|---|---|---|
| `homogeneous` | uniform, $10^3$ cm$^{-3}$ | `param/cloud_example_homogeneous.param` |
| `powerlaw` | $n \propto r^{-2}$ outside a 5 pc core of $10^4$ cm$^{-3}$ | `param/cloud_example_PL.param` |
| `bonnor_ebert` | Bonnor-Ebert sphere, $10^4$ cm$^{-3}$ at the centre | `param/cloud_example_BE.param` |

## Open a run


```python
%matplotlib inline

import logging
import sys
from pathlib import Path

import astropy.units as u
import matplotlib.pyplot as plt
import numpy as np

# The smplotlib font makes matplotlib print a harmless notice. Keep it out of the notebook.
logging.getLogger('matplotlib.font_manager').setLevel(logging.ERROR)

try:
    import smplotlib  # noqa: F401  (importing it switches the plot style on)
except ImportError:
    print('smplotlib is not installed, so the plots use the matplotlib default style.')

# Find the top of the repository, so the notebook works from any folder inside
# it and without installing TRINITY as a package.
repo_root = Path.cwd()
while not (repo_root / 'trinity' / '__init__.py').exists():
    if repo_root == repo_root.parent:
        raise SystemExit('Run this notebook from inside a clone of the TRINITY repository.')
    repo_root = repo_root.parent
sys.path.insert(0, str(repo_root))

from trinity._output.trinity_reader import TrinityOutput

runs_dir = repo_root / 'examples' / 'runs'
runs = {}
for name in ['homogeneous', 'powerlaw', 'bonnor_ebert']:
    runs[name] = TrinityOutput.open(runs_dir / name / 'dictionary.jsonl')

# One label and one colour per cloud, used in every figure below.
labels = {'homogeneous': 'uniform',
          'powerlaw': r'power law, $r^{-2}$',
          'bonnor_ebert': 'Bonnor-Ebert'}
colours = {'homogeneous': '#1E2430',
           'powerlaw': '#096D84',
           'bonnor_ebert': '#C2703D'}

# Most sections follow the uniform cloud.
run = runs['homogeneous']
run
```




```output
TrinityOutput('dictionary.jsonl', snapshots=66, t=[1.9562e-06, 1.5000e+01])
```
A run is a folder. `TrinityOutput.open()` takes the `dictionary.jsonl` in it and reads
`metadata.json` from the same folder, so copy a run as a whole folder. The line printed
above gives the number of snapshots in the run and the time they span, in Myr.

## What happened in the run


```python
run.info()
```

```output
======================================================================
TRINITY Output: dictionary.jsonl
======================================================================

  Model name:    cloud_example_homogeneous
  Snapshots:     66
  Time range:    [1.9562e-06, 1.5000e+01] Myr
  Parameters:    214

  Phases:
    energy      :   12 snapshots, t=[1.9562e-06, 3.0000e-03]
    implicit    :   54 snapshots, t=[3.7747e-03, 1.5000e+01]

  Ended:         stopping_time — Stopping time reached
  Final state:
    age                    15.000 Myr
    shell radius R2        183.498 pc
    expansion velocity     6.438 km/s
    shell mass swept       9.940e+06 Msun
    shell thickness        0.189 pc
    peak shell density     5.177e+03 cm^-3
    bubble energy          9.737e+51 erg
    bubble pressure        6.186e+04 K cm^-3 (P/k_B)
    bubble temperature     8.131e+05 K
    fate                   still expanding
```
`info()` lists the phases the run went through with the number of snapshots in each, how
the run ended, and the state of the bubble at the last snapshot.
`run.info(verbose=True)` adds every stored quantity with its description and unit.

## Radius and velocity


```python
# TRINITY labels the energy-driven regime 'energy' or 'implicit', depending on
# how the cooling is solved. They are one physical regime and share a band.
regime_of = {'energy': 'energy-driven',
             'implicit': 'energy-driven',
             'transition': 'transition',
             'momentum': 'momentum-driven'}
band_colour = {'energy-driven': '#DCEAF5',
               'transition': '#F5E9DC',
               'momentum-driven': '#E6F0E4'}


def shade_regimes(ax, out):
    # Shade the background of a time axis, one band per regime.
    times = out.get('t_now')
    regimes = [regime_of[phase] for phase in out.get('current_phase', as_array=False)]
    start = 0
    for i in range(1, len(regimes) + 1):
        at_the_end = (i == len(regimes))
        if at_the_end or regimes[i] != regimes[start]:
            end = times[-1] if at_the_end else times[i]
            ax.axvspan(times[start], end, color=band_colour[regimes[start]],
                       zorder=0, label=regimes[start])
            start = i


time = run.get('t_now')

fig, (top, bottom) = plt.subplots(2, 1, figsize=(7, 6.5), sharex=True)

shade_regimes(top, run)
top.plot(time, run.get('R2'), color=colours['homogeneous'])
top.set_ylabel(r'shell radius $R_2$ [pc]')
top.set_yscale('log')
top.legend(loc='lower right', frameon=True)

shade_regimes(bottom, run)
bottom.plot(time, run.get('v2'), color=colours['homogeneous'])
bottom.set_ylabel(r'velocity $v_2$ [pc/Myr]')
bottom.set_xlabel('time [Myr]')
bottom.set_xscale('log')
bottom.set_yscale('log')

fig.tight_layout()
```


    
![png](/trinity-web/notebook/quickstart_files/quickstart_8_0.png)
    


`get()` returns one stored quantity for every snapshot, as a NumPy array. `R2` is the
radius of the inner edge of the shell and `v2` is its velocity. Times come back in Myr,
radii in pc and velocities in pc/Myr.

The bands mark the regime the bubble is in. A run starts energy-driven and, once the
bubble cools, passes through a transition and ends momentum-driven, always in that order.
A run that stops before its bubble cools shows fewer bands.

## Units


```python
print('R2 is stored in', run.units('R2'))
print('v2 is stored in', run.units('v2'))

velocity = run.quantity('v2')
radius = run.quantity('R2')
print(f'final velocity: {velocity[-1]:.3g} = {velocity[-1].to("km/s"):.3g}')
print(f'final radius:   {radius[-1]:.3g} = {radius[-1].to("lyr"):.3g}')
```

```output
R2 is stored in pc
v2 is stored in pc/Myr
final velocity: 6.58 pc / Myr = 6.44 km / s
final radius:   183 pc = 598 lyr
```
Everything is stored in TRINITY's internal units: $M_\odot$, pc and Myr. `units()` names
the unit of a quantity. `quantity()` returns the same numbers as an astropy `Quantity`, and
astropy converts them for you. A quantity with no recorded unit makes `quantity()` raise a
`ValueError`. Use `get()` for those.

## Inside the shell


```python
# The earliest snapshots have no resolved shell yet. Keep the ones that do.
with_profile = []
for snapshot in run:
    if len(snapshot.get('shell_r_arr') or []) >= 10:
        with_profile.append(snapshot)

chosen = np.linspace(0, len(with_profile) - 1, 4, dtype=int)

fig, ax = plt.subplots(figsize=(7, 4.5))

for i in chosen:
    snapshot = with_profile[i]
    radius = np.asarray(snapshot['shell_r_arr'])
    # Undo the log10, then let astropy convert pc^-3 to cm^-3.
    density = (10 ** np.asarray(snapshot['log_shell_n_arr']) / u.pc ** 3).to(1 / u.cm ** 3)

    # Depth through the shell: 0 at its inner edge, 1 at its outer edge.
    thickness = radius[-1] - radius[0]
    if thickness <= 0:
        continue
    depth = (radius - radius[0]) / thickness

    ax.plot(depth, density,
            label=f"{snapshot.t_now:.3g} Myr, $R_2$ = {snapshot['R2']:.3g} pc")

ax.set_xlabel('depth through the shell (0 = inner edge, 1 = outer edge)')
ax.set_ylabel(r'number density [cm$^{-3}$]')
ax.set_yscale('log')
ax.legend()
fig.tight_layout()
```


    
![png](/trinity-web/notebook/quickstart_files/quickstart_14_0.png)
    


Most stored quantities are one number per snapshot. A few are profiles along the radius.
Each profile has its own radius array, named with the suffix `_r_arr`. A profile that
spans many decades is stored as $\log_{10}$ and its key starts with `log_`, so undo the
logarithm before you plot it. `quantity()` works on the per-snapshot numbers only. For a
profile, attach the unit yourself as the code above does.

The shell grows by orders of magnitude during a run, so on a shared radius axis the early
profiles would be squeezed into the left edge. The horizontal axis here is the depth
through the shell, which lets you compare the shape of the profile at every age. The
legend keeps the physical size.

## How many ionising photons escape


```python
fig, ax = plt.subplots(figsize=(7, 4.5))

for name, out in runs.items():
    ax.plot(out.get('t_now'), out.get('shell_fEscLyC_total'),
            color=colours[name], label=labels[name])

ax.set_xscale('log')
ax.set_ylim(-0.03, 1.03)
ax.set_xlabel('time [Myr]')
ax.set_ylabel('escape fraction of ionising photons')
ax.legend()
fig.tight_layout()
```


    
![png](/trinity-web/notebook/quickstart_files/quickstart_17_0.png)
    


`shell_fEscLyC_total` is the fraction of the cluster's ionising photons that leave the
shell, counted over the whole sky. It is 1 when the shell absorbs none of them and 0 when
the ionisation front is trapped inside the shell. This is the quantity to compare with an
observed escape fraction.

## Three clouds, three histories


```python
fig, ax = plt.subplots(figsize=(7, 4.5))

for name, out in runs.items():
    t = out.get('t_now')
    radius = out.get('R2')
    ax.plot(t, radius, color=colours[name], label=labels[name])
    ax.plot(t[-1], radius[-1], 'o', color=colours[name])

ax.set_xscale('log')
ax.set_yscale('log')
ax.set_xlabel('time [Myr]')
ax.set_ylabel(r'shell radius $R_2$ [pc]')
ax.legend()
fig.tight_layout()

for name, out in runs.items():
    ending = out.termination or {}
    print(f"{name:13} ran to {out.t_max:6.2f} Myr: {ending.get('detail', 'unknown')}")
```

```output
homogeneous   ran to  15.00 Myr: Stopping time reached
powerlaw      ran to   1.97 Myr: Small radius reached (event): R2 < 0.815 pc (0.1 x R2_max 8.15 pc; coll_r 1 pc not used)
bonnor_ebert  ran to   4.05 Myr: Small radius reached (event): R2 < 1 pc (coll_r)
```
![png](/trinity-web/notebook/quickstart_files/quickstart_20_1.png)
    


The clouds have the same mass and form the same mass of stars, and their shells still
follow different histories. The dot marks the last snapshot of each run, and the lines
printed under the figure say how long each run lasted and why it stopped.
`run.termination` holds that record for any run.

## Radius and velocity, as an observer measures them


```python
fig, ax = plt.subplots(figsize=(7, 4.5))

for name, out in runs.items():
    radius = out.quantity('R2').to_value('pc')
    speed = out.quantity('v2').to_value('km/s')
    ax.plot(radius, speed, color=colours[name], label=labels[name])

    # Mark three ages along each track.
    for age in [0.1, 1.0, 3.0]:                                # Myr
        if age < out.t_max:
            snapshot = out.get_at_time(age, quiet=True)
            speed_at_age = (snapshot['v2'] * u.pc / u.Myr).to_value('km/s')
            ax.plot(snapshot['R2'], speed_at_age, 'o', color=colours[name])

ax.axhline(0, color='0.6', lw=0.8, zorder=0)
ax.set_xscale('log')
ax.set_yscale('symlog', linthresh=1)
ax.set_xlabel('shell radius [pc]')
ax.set_ylabel('expansion velocity [km/s]')
ax.legend()
fig.tight_layout()
```


    
![png](/trinity-web/notebook/quickstart_files/quickstart_23_0.png)
    


An observed bubble gives you a radius and an expansion velocity. Each curve is the path
of one model through that plane, and the dots mark ages of 0.1, 1 and 3 Myr,
where a run lasts that long.
`get_at_time()` returns the state at any age, interpolated between snapshots. A shell
that falls back crosses zero and continues at negative velocity. Put a measured radius
and velocity on this figure to see which models pass through the point, and at what age.

## Run your own

The uniform cloud came from `param/cloud_example_homogeneous.param`:

```text
model_name    cloud_example_homogeneous
mCloud    1e6
sfe    0.01
# powerlaw, homogeneous
dens_profile    densPL
densPL_alpha    0
nCore    1e3
nISM    10
```

Copy that file to `my_cloud.param`, set `model_name` to `my_cloud`, change any value you
like, and run it from the top of the repository:

```bash
python run.py my_cloud.param
```

Then open the result the same way as the shipped runs:

```python
mine = TrinityOutput.open(repo_root / 'outputs' / 'my_cloud' / 'dictionary.jsonl')
```

Sort a run on `t_now` before you plot it straight from `outputs/`, or pass it through
`examples/thin_run.py`, which sorts it, drops repeated snapshots and thins it.

## Where to go next

- [Running TRINITY](https://jiaweiteh.github.io/trinity-web/?view=docs&page=running) covers
  parameter files, sweeps and clusters.
- [Output](https://jiaweiteh.github.io/trinity-web/?view=docs&page=output) lists the files
  a run writes and the rest of the reader.
- [Parameters](https://jiaweiteh.github.io/trinity-web/?view=docs&page=parameters) has
  every keyword with its default and unit.
