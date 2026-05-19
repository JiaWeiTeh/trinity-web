# Getting started

Placeholder — replace this file with your own documentation content.

The docs view reads every `*.md` file in `src/docs/` (alphabetical order — prefix filenames with `01-`, `02-`, … to control the order) and renders them inline with the rest of the paper.

## Markdown features

Standard GitHub-flavoured markdown is supported, including tables, code fences, and task lists.

```python
from trinity import Trinity

run = Trinity(
    cloud_mass=1e6,        # M_sun
    sf_efficiency=0.1,
    metallicity=1.0,
)
run.evolve(t_max=10.0)     # Myr
```

## Math

Inline math like $R(t) \propto t^{3/5}$ and display math both work:

$$
R(t) = \left(\frac{125}{154\pi}\right)^{1/5} L_{\rm w}^{1/5}\,\bar{\rho}^{-1/5}\,t^{3/5}
$$

## Adding more pages

Drop additional `.md` files into `src/docs/`. The first `#` heading in each file becomes its entry in the side index on the left of this view.
