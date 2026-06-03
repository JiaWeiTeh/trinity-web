# Parameter Specifications

Every parameter TRINITY recognises is listed below, with its default,
unit, and a short description. Use the search box to find a keyword by
name, group, default, unit, or description, and the group dropdown to
narrow by category.

```parameter-table
```

## File format

The canonical parameter schema — the authoritative, fully-commented list
of keys and defaults — lives at `trinity/_input/default.param`; the
reference above mirrors it. Worked example files live under `param/`
(see `param/simple_cluster.param` or `param/cloud_example_PL.param`) and
override those defaults.

A parameter file contains one `keyword    value` entry per line. A `#`
starts a comment, either as a whole line or after a value. Keyword names
are case-sensitive and may appear in any order.

Keywords with a default are optional; those without a default are
required. A value written as a bracketed list (`mCloud [1e5, 1e6]`) or
through a `tuple(...)` directive turns the file into a sweep — see
[Running TRINITY](?view=docs&page=running) for the sweep syntax.

### Supported value types

TRINITY parses values in the following order of precedence:

| Type | Example | Notes |
| --- | --- | --- |
| Boolean | `True`, `False` | Case-sensitive |
| Scientific | `1e6`, `3.14e-2` | Standard notation |
| Fraction | `5/3` | Converted to float (1.6667) |
| Number | `100`, `0.01` | Integer or decimal |
| String | `densPL`, `my_model` | Fallback for text values |

## Unit system

Inputs in the parameter file are CGS, extended by $M_\odot$ (mass) and
Myr (time). Common per-quantity units: pc for length, cm$^{-3}$ for
number density, km/s for velocity, K for temperature. Internally TRINITY
works in `[Msun, pc, Myr]`; conversion is automatic, driven by the
`# UNIT:` annotations in `default.param`. Example annotations:

```text
# UNIT: [Msun]
# UNIT: [cm**-3]
# UNIT: [km * s**-1]
# UNIT: [erg * s**-1 * cm**-1 * K**(-7/2)]
```

## Derived quantities

- Cluster mass: $M_{\rm cluster} = M_{\rm cloud} \times {\rm sfe}$
- Remaining cloud mass: $M_{\rm cloud,after} = M_{\rm cloud} - M_{\rm cluster}$

## Density profiles

When `dens_profile = densPL`, the density follows:

$$
\rho(r) = \begin{cases}
\rho_0 & r \leq r_0 \\
\rho_0 \left(\frac{r}{r_0}\right)^\alpha & r_0 < r \leq r_{\rm cloud} \\
\rho_{\rm ISM} & r > r_{\rm cloud}
\end{cases}
$$

When `dens_profile = densBE`, TRINITY implements a Bonnor-Ebert sphere
([Ebert 1955](https://ui.adsabs.harvard.edu/abs/1955ZA.....37..217E/abstract);
[Bonnor 1956](https://ui.adsabs.harvard.edu/abs/1956MNRAS.116..351B/abstract)).

> **Note** — `densPL_alpha` is ignored when using `densBE`, and
> `densBE_Omega` is ignored when using `densPL`.

## Termination semantics

Setting `stop_r`, `stop_t`, or `stop_at_rCloud_nSnap` to `None` disables
that termination condition, allowing the simulation to continue until
other conditions are met (shell dissolution, collapse, or cloud
boundary).

## Examples

### Minimal parameter file

**`minimal.param`**

```text
model_name    my_simulation
mCloud        1e6
sfe           0.01
```

### Power-law cloud

**`powerlaw.param`**

```text
# Model identification
model_name      powerlaw_test
path2output     outputs/powerlaw

# Cloud properties
mCloud          1e7
sfe             0.05
ZCloud          1

# Power-law density profile
dens_profile    densPL
densPL_alpha    -1.5
nCore           1e4
rCore           0.5
nISM            1

# Termination
stop_t          20
stop_r          300
```

### Bonnor-Ebert sphere

**`bonnor_ebert.param`**

```text
# Model identification
model_name      BE_sphere
path2output     outputs/BE

# Cloud properties
mCloud          1e5
sfe             0.02

# Bonnor-Ebert profile
dens_profile    densBE
densBE_Omega    14.1
nCore           1e5
rCore           0.1
```

For sweep-style parameter files (list values and `tuple(...)`
directives), see [Running TRINITY](?view=docs&page=running).
