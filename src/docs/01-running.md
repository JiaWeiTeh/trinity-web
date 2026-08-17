# Running TRINITY

## Running a simulation

A TRINITY run is fully specified by one plain-text parameter file. From
the repository root:

```bash
python run.py param/simple_cluster.param
```

`run.py` reads the file and dispatches automatically: list (`[...]`) or
`tuple(...)` values trigger a parameter sweep across a parallel worker
pool; anything else runs a single simulation. There is no separate
command for sweeps. To scale a sweep across an HPC cluster, emit a SLURM
job array with `--emit-jobs` (see *Running on a cluster* below).

Output goes to the `path2output` directory. The default, `def_dir`,
resolves to `outputs/<model_name>/` for a single run, or one
`outputs/<run_name>/` subfolder per combination for a sweep — see
*Outputs* below for the layout.

## Parameter-file formats

A parameter file lists one `keyword    value` per line (the
[Parameter Specifications](?view=docs&page=parameters) cover every
keyword). The *value* syntax alone decides single run vs. sweep:

**`param/sweep_hybrid_example.param`**

```text
# Plain key/value — fixed across every run
dens_profile    densPL
nISM            0.1
path2output     outputs/demo

# tuple(...) — only these explicit (mCloud, sfe) pairs are run
tuple(mCloud, sfe)    [1e5, 0.01] [1e7, 0.10]

# [list] — swept Cartesian-style across each tuple pair
nCore    [1e3, 1e4]
```

How many simulations a file generates depends only on the value forms it
uses:

| Value syntax | Mode | Runs generated |
| --- | --- | --- |
| no `[ ]`, no `tuple()` | single | 1 |
| `key [a, b, c]` | Cartesian | every combination (`mCloud` × `sfe` = 3 × 2 = 6) |
| `tuple(x, y) [..] [..]` | tuple | only the listed points |
| tuple **and** list | hybrid | tuple points × list combinations |

The hybrid example above runs 2 tuple pairs × 2 `nCore` values = 4
simulations. Worked examples ship as `param/sweep_example.param`
(Cartesian), `param/sweep_tuple_example.param` (tuple), and
`param/sweep_hybrid_example.param` (hybrid).

## Command-line flags

| Flag | Description |
| --- | --- |
| `--dry-run`, `-n` | Preview every combination (with GMC warnings) without running. |
| `--workers N`, `-w` | Parallel workers for the sweep pool — or the array cap with `--emit-jobs`. |
| `--yes`, `-y` | Skip the confirmation prompt. |
| `--verbose`, `-v` | DEBUG-level logs and the full base-parameter list. |
| `--emit-jobs DIR` | Emit a SLURM job-array bundle in `DIR` instead of running locally. |
| `--collect-report DIR` | Aggregate a finished `--emit-jobs` bundle into a sweep report. |

> **Note** — Most flags apply only to sweeps. For a single run,
> `--dry-run` prints the parameter file and exits, while
> `--workers` and `--yes` are ignored.

The default worker count adapts to the machine — the full allocation
inside a SLURM job, a sensible fraction of the cores otherwise; `--help`
has the details. `--emit-jobs` and `--collect-report` are mutually
exclusive.

Before launching, `run.py` runs a plausibility check on every
combination (cloud mass vs. core/ISM density, cloud radius, …) and lists
any invalid ones up front, so you can abort before wasting compute.
`Ctrl+C` or `SIGTERM` (e.g. from SLURM `scancel`) cancels cleanly:
in-flight workers stop and a completed / failed / cancelled report is
written to the output directory.

## Running on a cluster

A sweep runs in-process on a laptop or single node, sized by
`--workers`. To spread it across nodes on an HPC cluster (e.g.
bwForCluster Helix), emit a SLURM **job array** instead — one task per
combination, packed across nodes and restarted independently on failure:

```bash
python run.py param/sweep_example.param --emit-jobs jobs/
# edit jobs/submit_sweep.sbatch: --account, --partition, --time, --mem
sbatch jobs/submit_sweep.sbatch
python run.py --collect-report jobs/      # after the array finishes
```

`--emit-jobs DIR` writes a self-contained, submittable bundle:

```text
jobs/
├── params/<run_name>.param   # one per combination, absolute path2output
├── runs.tsv                  # param_path <TAB> output_dir; line N = task N
├── manifest.json             # index: names, params, output dirs
├── submit_sweep.sbatch       # #SBATCH --array=1-N[%K]; one sim per task
└── logs/                     # %A_%a.out per task
```

Each task runs one simulation on one CPU, with math-library threads
pinned to one (`OMP_NUM_THREADS=1`, `MPLBACKEND=Agg`) — parallelism comes
from many tasks, not threading. `--workers K` at emit time caps
concurrency as `--array=1-N%K`.

When the array finishes, `--collect-report DIR` reads each task's exit
code and duration, writes the same `sweep_report.txt` / `.json` as a
local sweep, and prints a ready
`sbatch --array=<failed ids> jobs/submit_sweep.sbatch` to rerun only the
failures.

> **Note** — Bundled inputs (SPS, cooling tables, `lib/default/`) resolve
> relative to the package, so the clone location does not matter. Only
> `path2output` follows the launch directory — point it at an absolute
> work/scratch path for cluster runs. Running the in-process pool on a
> *login* node is discouraged; `run.py` warns when SLURM is detected
> without an active job.

## Outputs

### File layout

A single run writes four files into `path2output`:

```text
path2output/
├── dictionary.jsonl            # simulation state, one JSON object per snapshot
├── metadata.json               # run constants + termination + final state
├── metadata_humanreadable.txt  # pretty-printed show_run summary
└── trinity.log                 # log file (written when log_file = True)
```

A sweep writes those same files into one subdirectory per combination,
adds a fully-resolved `.param` sidecar to each, and two top-level
reports:

```text
outputs/my_sweep/
├── 1e5_sfe001_n1e3/
│   ├── 1e5_sfe001_n1e3.param   # full resolved params for this run
│   ├── dictionary.jsonl
│   ├── metadata.json
│   ├── metadata_humanreadable.txt
│   └── trinity.log
├── 1e5_sfe001_n1e4/
│   └── ...
├── sweep_report.txt            # human-readable sweep summary
└── sweep_report.json           # machine-readable sweep summary
```

### Run names

Each sweep combination gets its own folder, named automatically from the
parameters that vary — for example `1e7_sfe010_n1e4_noPHII` is
`mCloud=1e7, sfe=0.10, nCore=1e4` with `include_PHII = False`. Values
that would be unsafe in a path are sanitised, and an over-long name
aborts the sweep with a clear error.

> **Note** — The folder name is only a readable handle. Every run also
> writes its full resolved parameters to a per-run `.param` file (and the
> sweep-wide `sweep_report.json`), so keys left at their default are still
> recorded. Scripts comparing across sweeps should read those sidecars
> rather than parse the folder name.

## Output data model

### dictionary.jsonl

Each simulation streams its full state to `dictionary.jsonl` as
newline-delimited JSON, one object per snapshot — administrative fields,
cloud setup, dynamical state, feedback rates, pressures, forces, and the
1-D bubble and shell profiles. Writes are append-only and crash-safe, so
the file always parses (a trailing partial line aside). Each snapshot is
saved before its ODE step, so all its values share one `t_now`.

Long 1-D profiles are downsampled before serialisation. Each simplified
array carries its own abscissa (`*_r_arr`) and, when values span many
decades, is stored in $\log_{10}$ space (`log_*`); the point budget is
set by `simplify_npoints`. To recover a profile, interpolate the abscissa
against the (possibly log-space) values.

> **Note** — To read the file, use the TRINITY reader API: it hides the
> JSONL layout, the per-key units, and the legacy `.json` format behind a
> small set of classes.

### metadata.json

Run constants and end-of-run summaries live in a sibling `metadata.json`
instead of being repeated in every snapshot: the inputs and set-once
derived values, how the run ended, the full final state, and a
post-mortem block for diagnosing failures. The reader folds the constants
back into each snapshot on load, so you rarely read this file directly —
but it is small and human-readable. All writes are atomic, so an
interrupted write never corrupts the file.

### show_run

For a quick human-readable view of a finished run — context, termination
reason, and final state — without writing any plotting code:

```bash
python -m trinity._output.show_run path2output/
```

It reads `metadata.json` and pretty-prints a curated subset. Pass
`--json` for the full dump, or `--quiet` for a scriptable exit code
(handy in batch loops over a sweep tree).

## Reading a run

The output is designed to be read back with the bundled reader rather than
parsed by hand. It takes the `dictionary.jsonl` path and picks up
`metadata.json` from the same folder, so point it at a run directory's file:

```python
from trinity._output.trinity_reader import TrinityOutput

run = TrinityOutput.open('outputs/my_model/dictionary.jsonl')
run.info()          # phases, how it ended, the final state of the bubble

t  = run.get('t_now')     # every snapshot, as a numpy array
R2 = run.get('R2')
v2 = run.get('v2')
```

`get()` returns TRINITY's internal units — $M_\odot$, pc, Myr. You do not have
to remember which applies to what:

```python
run.units('v2')                    # 'pc/Myr'
run.quantity('v2').to('km/s')      # the same numbers, as an astropy Quantity
```

A few other things worth knowing:

| Call | What it gives you |
| --- | --- |
| `run.get_at_time(2.0)` | the state at any moment, interpolated between snapshots |
| `run.filter(phase='momentum')` | part of a run, itself a `TrinityOutput` |
| `run.to_dataframe()` | the whole run as a pandas `DataFrame` |
| `run.info(verbose=True)` | every stored quantity, described, with units |

> **Note** — Snapshots are written in the order the output buffer flushes them,
> which is not chronological, and a long run can repeat snapshots. Sort on
> `t_now` before plotting a raw run, or pass it through `examples/thin_run.py`,
> which sorts and de-duplicates.

The [tutorial notebook](?view=docs&page=notebook) does all of this against
finished runs that ship with the repository, so you can see the output without
running a simulation first.

## Logging

The [Parameter Specifications](?view=docs&page=parameters) list the four
logging parameters (`log_level`, `log_console`, `log_file`, `log_colors`)
and their defaults. Levels follow the usual ladder — `DEBUG`, `INFO`,
`WARNING`, `ERROR`, `CRITICAL` — and each includes every more severe one,
so `log_level = INFO` emits `INFO` and above. Console logging is off by
default; the log file is written.

## Troubleshooting

Most parameter errors are typos against the schema. The authoritative
list of keywords and defaults is the ParamSpec registry
(`trinity/_input/registry.py`), which generates `trinity/_input/default.param`
and the [Parameter Specifications](?view=docs&page=parameters). For issues
and feature requests, see
[github.com/JiaWeiTeh/trinity/issues](https://github.com/JiaWeiTeh/trinity/issues).

## Common questions

**Why does the install pin numpy below 2?**
Some numpy 2.x patch releases emit floating-point output that the
bubble-structure integrator's monotonic guard rejects. The cap is deliberate,
not neglect; `requirements.txt` records which versions were affected.

**Do I need LaTeX?**
Only to regenerate the published paper figures, whose style renders text with
`text.usetex`. Running simulations and reading output do not need it.

**Where do my outputs go?**
To `path2output`. Left at its default, that resolves to `outputs/<model_name>/`
under wherever you launched the run — so a sweep on a cluster should set an
absolute path on a work or scratch filesystem.

**Can I run a sweep on a login node?**
You can, and `run.py` will warn you when it detects SLURM without an active
job. Don't: use `--emit-jobs` to emit a job array instead.

**Where is the raw simulation data from the papers?**
Not in the repository — the run sets and the full SPS and cooling libraries are
too large. They are available on request; see the
[publications page](?view=docs&page=publications) for contact details.
