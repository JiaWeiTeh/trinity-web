# Output

A run writes five files into its output folder:

```text
outputs/my_cloud/
├── dictionary.jsonl              one line per snapshot, the full state of the bubble
├── metadata.json                 the inputs, how the run ended and the final state
├── metadata_humanreadable.txt    the same summary as plain text
├── trinity.log                   the log
└── shadow_R1_1b.csv              a developer diagnostic you can ignore
```

A sweep writes one such folder per run, each with a `.param` file that records
the values the sweep set for that run. Two reports sit beside the folders:
`sweep_report.txt` for you and `sweep_report.json` for scripts.

## A quick look

```bash
python -m trinity._output.show_run outputs/my_cloud/
```

This prints the cloud you asked for, how the run ended and the final state of
the bubble. Add `--json` for everything in `metadata.json`.

## Reading a run in Python

Use the reader that ships with TRINITY. Give it the `dictionary.jsonl` and it
finds `metadata.json` in the same folder, so keep the two files together.

```python
from trinity._output.trinity_reader import TrinityOutput

run = TrinityOutput.open('outputs/my_cloud/dictionary.jsonl')
run.info()                # phases, how it ended, the final state

t  = run.get('t_now')     # one value per snapshot, as a numpy array
R2 = run.get('R2')
v2 = run.get('v2')
```

`get()` returns TRINITY's internal units: $M_\odot$, pc and Myr. The reader
tells you the unit of a quantity and converts it with astropy:

```python
run.units('v2')                    # 'pc/Myr'
run.quantity('v2').to('km/s')      # the same numbers as an astropy Quantity
```

A quantity with no recorded unit makes `quantity()` raise a `ValueError`. Use
`get()` for those.

| Call | What you get |
| --- | --- |
| `run.info(verbose=True)` | every stored quantity with its description and unit |
| `run.get_at_time(2.0)` | the state at 2 Myr, interpolated between snapshots |
| `run.filter(phase='momentum')` | part of a run, as another `TrinityOutput` |
| `run.to_dataframe()` | all per-snapshot numbers as a pandas `DataFrame` |
| `run.termination` | how the run ended |

Sort on `t_now` before you plot a run straight from `outputs/`.
`examples/thin_run.py` sorts a run, drops repeated snapshots and thins it to a
size you can keep in a repository.

The [tutorial notebook](?view=docs&page=notebook) uses all of this on three
finished runs.

## Radial profiles

Most quantities are one number per snapshot. A few are profiles through the
bubble and the shell. Each profile is stored with its own radius array, named
with the suffix `_r_arr`. A profile that spans many decades is stored as
$\log_{10}$ and its key starts with `log_`. The density through the shell, for
example, is `log_shell_n_arr` against `shell_r_arr`.

Profiles are stored at reduced resolution to keep the file small.
`simplify_npoints` sets the number of points, 100 by default. Two more
parameters control them:

| Parameter | Default | What it does |
| --- | --- | --- |
| `profile_every` | 1 | Store profiles in every Nth snapshot. With 0 the file holds only the per-snapshot numbers and each line is 86% smaller. |
| `profile_dump_every` | 0 | Also save every Nth profile at full resolution into `profiles_full/`. Read one back with `run.profile_full(index)`. |
