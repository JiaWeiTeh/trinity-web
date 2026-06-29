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

The default worker count adapts to the machine: the full allocation
inside a SLURM job (`SLURM_CPUS_PER_TASK`), or `max(1, CPU count // 2 - 1)`
on a laptop. It must be ≥ 1 and never exceeds the cores available to the
process. `--emit-jobs` and `--collect-report` are mutually exclusive.

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

Each sweep combination is named automatically:

```text
{mCloud}_sfe{sfe*100:03d}_n{nCore}[_density-profile][_PHII][_other-swept-keys]
```

Suffixes appear only for parameters set explicitly in the sweep file — a
key you leave out gets no suffix (nothing is compared against
`default.param`):

- `_PL{alpha}` for `dens_profile = densPL` (e.g. `_PL0`, `_PL-2`), or
  `_BE{Omega}` for `densBE` (e.g. `_BE14`).
- `_yesPHII` / `_noPHII` when `include_PHII` is set.
- `_{key}{value}` for any other swept key, so distinct combinations never
  share a folder. snake_case becomes camelCase, decimal points become
  `p`, and minus signs are kept — `ZCloud = [0.5, 1.0]` gives `_ZCloud0p5`
  / `_ZCloud1p0`. Multiple suffixes follow sorted-key order.

Generic values are checked for filesystem safety:

| Check | Trigger | Effect |
| --- | --- | --- |
| Hard-reject | `/`, `\`, `..`, control chars | `ValueError`, no runs — so filepath params can't be swept |
| Sanitise | anything outside `[A-Za-z0-9.+-]` | replaced with `-`; the sweep still runs |
| Length cap | run name over 200 characters | sweep aborts with a clear error |

For example, `1e7_sfe010_n1e4_noPHII` is `mCloud=1e7, sfe=0.10, nCore=1e4`
with `include_PHII = False`.

> **Note** — The folder name is only a readable handle. Every run also
> writes its full resolved parameters to a per-run `.param` file (and the
> sweep-wide `sweep_report.json`), so keys left at their default are still
> recorded. Scripts comparing across sweeps should read those sidecars
> rather than parse the folder name.

## Output data model

### dictionary.jsonl

Each simulation streams its full state to `dictionary.jsonl` as
newline-delimited JSON, one object per snapshot. Writes are append-only
and crash-safe — buffered snapshots flush on a clean exit, `Ctrl+C`, or
`SIGTERM`, so the file always parses (a trailing partial line aside).
Each snapshot is saved before its ODE step, so all its values share one
`t_now`.

Snapshot keys fall into a few categories:

| Category | Example keys |
| --- | --- |
| Administrative | `model_name`, `current_phase`, `SimulationEndReason` |
| Cloud setup | `mCloud`, `mCluster`, `rCloud`, `nEdge` |
| Dynamical state | `t_now`, `R2`, `v2`, `Eb`, `T0`, `R1`, `Pb` |
| Feedback (SPS) | `Lmech_W`, `Lmech_SN`, `Qi`, `Lbol`, `pdot_total` |
| Pressures | `P_drive`, `P_HII`, `P_ram` |
| Forces | `F_grav`, `F_ram`, `F_ram_wind`, `F_ram_SN`, `F_HII`, `F_rad` |
| Bubble / shell profiles | `log_bubble_T_arr` + `bubble_T_arr_r_arr`, `bubble_v_arr` + `bubble_v_arr_r_arr`, `log_shell_n_arr` + `shell_r_arr` |

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
(schema version 4) instead of being repeated in every snapshot. The
reader folds the constants back into each snapshot on load, so you rarely
read this file directly — but it is small and human-readable. Its blocks:

| Block | Contents |
| --- | --- |
| run constants | Inputs and set-once derived values fixed after phase 0 (`mCloud`, `sfe`, `dens_profile`, …), drawn from the ParamSpec registry. |
| `termination` | `{exit_code, outcome, detail, timestamp, model_name}` — how the run ended. |
| `final_state` | Every scalar / bool / string at run end, in internal units (pc, Myr, pc⁻³). |
| `termination_debug` | Last-snapshot diff, a NaN/Inf inventory, and sanity checks for post-mortems. |

All writes are atomic, so an interrupted write never corrupts the file.

### show_run

For a quick human-readable view of a finished run — context, termination
reason, and final state — without writing any plotting code:

```bash
python -m trinity._output.show_run path2output/
```

It reads `metadata.json` and pretty-prints a curated subset. Pass
`--json` for the full dump, or `--quiet` for a scriptable exit code
(handy in batch loops over a sweep tree).

## Logging

The [Parameter Specifications](?view=docs&page=parameters) list the four
logging parameters (`log_level`, `log_console`, `log_file`, `log_colors`)
and their defaults. Each level includes itself and every more severe one
— `CRITICAL > ERROR > WARNING > INFO > DEBUG` — so `log_level = INFO`
emits `INFO` and above.

| Level | Typical messages | When to use |
| --- | --- | --- |
| `DEBUG` | Variable values, loop iterations, function entry/exit. | Development; opt-in for diagnostics (slower hot path). |
| `INFO` | Phase transitions, major events, init and completion markers. | Normal runs (default). |
| `WARNING` | Clamped values, fallbacks, unusual but non-critical conditions. | Production, when only problems matter. |
| `ERROR` | Calculation failures, recoverable errors. | Runs where only real errors matter. |
| `CRITICAL` | Unrecoverable, fatal errors. | When only stopping errors should print. |

Console logging is off by default (`log_console = False`); with it enabled
at `log_level = INFO`, output looks like:

```text
2026-01-08 15:30:00 | INFO     | trinity.main | === TRINITY Simulation Starting ===
2026-01-08 15:30:00 | INFO     | trinity.main | Model: test_simulation
2026-01-08 15:30:01 | INFO     | trinity.sps.read_sps | SPS data processed
2026-01-08 15:30:03 | INFO     | trinity.phase1_energy | Entering energy-driven phase
2026-01-08 15:30:45 | INFO     | trinity.main | === TRINITY Simulation Complete ===
```

## Troubleshooting

Most parameter errors are typos against the schema. The authoritative
list of keywords and defaults is the ParamSpec registry
(`trinity/_input/registry.py`), which generates `trinity/_input/default.param`
and the [Parameter Specifications](?view=docs&page=parameters). For issues
and feature requests, see
[github.com/JiaWeiTeh/trinity/issues](https://github.com/JiaWeiTeh/trinity/issues).
