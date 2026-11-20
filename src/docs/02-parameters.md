# Parameters

Search the table by name, group, unit or description. Any keyword you leave out
of your parameter file takes the default shown here.

```parameter-table
```

The table is generated from `trinity/_input/default.param`, which lists the
same keywords with longer comments.

## Writing values

| You write | TRINITY reads |
| --- | --- |
| `True`, `False` | a boolean |
| `1e6`, `3.14e-2`, `100`, `0.01` | a number |
| `5/3` | a fraction, converted to 1.6667 |
| `densPL`, `my_cloud` | text |
| `None` | switches a stopping condition off |

Keywords are case-sensitive and can come in any order. A list such as
`[1e5, 1e6]` or a `tuple(...)` line turns the file into a sweep, which
[Running TRINITY](?view=docs&page=running) explains.

## Units

Write masses in $M_\odot$, lengths in pc, times in Myr, number densities in
cm$^{-3}$, velocities in km/s and temperatures in K. The unit of each keyword
is in the table. TRINITY converts everything to $M_\odot$, pc and Myr when it
reads the file, and the output is in those three units.

The stars form from the cloud you specify: the cluster has mass
$M_{\rm cloud} \times {\rm sfe}$, and the gas that remains has
$M_{\rm cloud}\,(1 - {\rm sfe})$.

## Density profiles

`dens_profile` picks the shape of the cloud. With `densPL` the density is flat
inside a core and falls as a power law outside it:

$$
\rho(r) = \begin{cases}
\rho_0 & r \leq r_0 \\
\rho_0 \left(\frac{r}{r_0}\right)^\alpha & r_0 < r \leq r_{\rm cloud} \\
\rho_{\rm ISM} & r > r_{\rm cloud}
\end{cases}
$$

Here $\rho_0$ comes from `nCore`, $r_0$ is `rCore`, $\alpha$ is `densPL_alpha`
and $\rho_{\rm ISM}$ comes from `nISM`. Set `densPL_alpha 0` for a uniform
cloud.

With `densBE` the cloud is a Bonnor-Ebert sphere
([Ebert 1955](https://ui.adsabs.harvard.edu/abs/1955ZA.....37..217E/abstract);
[Bonnor 1956](https://ui.adsabs.harvard.edu/abs/1956MNRAS.116..351B/abstract)).
`densBE_Omega` is its density contrast between centre and edge. `densPL_alpha`
has no effect on a `densBE` cloud, and `densBE_Omega` has none on a `densPL`
cloud.

## When a run stops

A run ends when the shell dissolves, when it collapses back onto the cluster,
or when it reaches one of three limits you can set: `stop_t` (an age, 15 Myr by
default), `stop_r` (a radius, 500 pc by default) and `stop_at_rCloud_nSnap`
(a number of snapshots after the shell leaves the cloud, off by default). Set
any of the three to `None` to switch it off.

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
