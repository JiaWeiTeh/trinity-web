# Running TRINITY

One parameter file describes one run, or one whole sweep. You give that file to
`run.py` from the top of the repository:

```bash
python run.py param/simple_cluster.param
```

## The parameter file

A parameter file has one `keyword    value` pair per line. A `#` starts a
comment. Any keyword you leave out takes its default, and the
[parameter table](?view=docs&page=parameters) lists every keyword with its
default and unit.

```text
model_name      my_cloud
mCloud          1e6
sfe             0.01
dens_profile    densPL
densPL_alpha    -2
nCore           1e4
rCore           5
nISM            10
```

`model_name` names the output folder. This run writes to `outputs/my_cloud/`
under the directory you launched it from. A file with no `model_name` uses its
own file name. Set `path2output` to send the results somewhere else.

## Three files to start from

The repository ships one working file per density profile. They describe the
same cloud mass and efficiency, and they are the runs the
[tutorial notebook](?view=docs&page=notebook) opens.

### `param/cloud_example_homogeneous.param`

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

### `param/cloud_example_PL.param`

```text
model_name    cloud_example_PL
mCloud    1e6
sfe    0.01
# powerlaw, -2 (isothermal)
dens_profile    densPL
densPL_alpha    -2
nCore    1e4
rCore    5
nISM    10
```

### `param/cloud_example_BE.param`

```text
model_name    cloud_example_BE
mCloud    1e6
sfe    0.01
# Bonnor-Ebert sphere
dens_profile    densBE
densBE_Omega    14.1
nCore    1e4
nISM    10
```

## Sweeps

You start a sweep with the same command. `run.py` sees a list or a `tuple(...)`
in the file and runs every combination in a pool of parallel workers.

```text
# two explicit (mCloud, sfe) pairs
tuple(mCloud, sfe)    [1e5, 0.01] [1e7, 0.10]

# each pair is run at both core densities
nCore    [1e3, 1e4]

# the same for all four runs
dens_profile    densPL
densPL_alpha    0
nISM            0.1
path2output     outputs/demo
```

| You write | Runs you get |
| --- | --- |
| `mCloud 1e6` | one |
| `mCloud [1e5, 1e6, 1e7]` | one per value, and every combination when several keywords are lists |
| `tuple(mCloud, sfe) [1e5, 0.01] [1e7, 0.10]` | only the listed pairs |
| a tuple and a list together | every listed pair at every list value |

The file above gives 2 pairs times 2 core densities, so 4 runs. Check any sweep
before you launch it:

```bash
python run.py param/sweep_example.param --dry-run
```

The dry run prints every combination and flags the ones that fail the
plausibility check on cloud mass, density and radius. Three
working sweep files are in `param/`: `sweep_example.param`,
`sweep_tuple_example.param` and `sweep_hybrid_example.param`.

Each run in a sweep gets its own folder under `path2output`, named from the
cloud mass, the efficiency, the core density and the profile.
`1e7_sfe010_n1e4_PL0` is $M_{\rm cloud}=10^7\,M_\odot$, a star-formation
efficiency of 10%, a core density of $10^4$ cm$^{-3}$ and a uniform profile.

## Command-line flags

| Flag | What it does |
| --- | --- |
| `--dry-run`, `-n` | Print every combination and stop. For a single run it prints the parameter file. |
| `--workers N`, `-w N` | Number of parallel workers for a sweep. |
| `--yes`, `-y` | Start a sweep without the confirmation prompt. |
| `--verbose`, `-v` | Print the fixed parameters of a sweep and the launcher's debug messages. For a DEBUG `trinity.log`, set `log_level DEBUG` in the file. |
| `--emit-jobs DIR` | Write a SLURM job array into `DIR` and stop. |
| `--collect-report DIR` | Summarise a finished job array. |

`Ctrl+C` stops a sweep cleanly. The workers stop, and the report in the output
folder says which runs completed, failed or were cancelled.

## On a cluster

On a laptop or one node, a sweep runs in the worker pool. On a SLURM cluster,
turn the sweep into a job array, one task per run:

```bash
python run.py param/sweep_example.param --emit-jobs jobs/
# edit jobs/submit_sweep.sbatch: --partition, --time, --mem, and the lines that load Python
sbatch jobs/submit_sweep.sbatch
python run.py --collect-report jobs/      # after the array finishes
```

`jobs/` then holds the batch script, one parameter file per run in
`jobs/params/` and a `logs/` folder. The batch script is written for the
cluster I use: it loads a conda module and activates an environment called
`trinity`, so change those lines for your own cluster. It has no `--account`
line, and Slurm takes the project from `$SBATCH_ACCOUNT`. Each task runs one
simulation on one core. Add `--workers K` to the first command to let at most
`K` tasks run at once.

`--collect-report` writes the same `sweep_report.txt` and `sweep_report.json`
as a local sweep. If some tasks failed, it prints the `sbatch --array=...`
line that reruns only those.

Set `path2output` to an absolute path on your work or scratch filesystem
before you emit the jobs. Start sweeps from a job, and keep them off the login
node. `run.py` warns you when it finds SLURM but no active job.

## Logging

Each run writes `trinity.log` into its output folder. `log_level` sets how much
goes in: `DEBUG`, `INFO` (the default), `WARNING`, `ERROR` or `CRITICAL`. Set
`log_console True` to see the same messages in the terminal.
