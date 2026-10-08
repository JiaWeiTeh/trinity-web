# trinity-web

[![Deploy](https://github.com/JiaWeiTeh/trinity-web/actions/workflows/deploy.yml/badge.svg)](https://github.com/JiaWeiTeh/trinity-web/actions/workflows/deploy.yml)
[![Website](https://img.shields.io/badge/website-trinity--web-brightgreen.svg)](https://jiaweiteh.github.io/trinity-web/)
[![Code](https://img.shields.io/badge/code-JiaWeiTeh%2Ftrinity-blue.svg)](https://github.com/JiaWeiTeh/trinity)
[![arXiv](https://img.shields.io/badge/arXiv-2605.27517-b31b1b.svg)](https://arxiv.org/abs/2605.27517)

Source for the website of TRINITY, the feedback-driven bubble evolution code:
<https://jiaweiteh.github.io/trinity-web/>. The code itself lives in
[JiaWeiTeh/trinity](https://github.com/JiaWeiTeh/trinity).

## Local development

```bash
npm install
npm run dev      # live server
npm run lint     # eslint
npm run build    # production build into dist/
```

Every push to `main` builds the site and deploys it to GitHub Pages.

## Where the content lives

- `src/docs/*.md`: the Docs pages, one file per page, ordered by their number prefix.
- `src/components/Publications.jsx`: the publications list and the Citing TRINITY text.
  To add a paper, add a row to `PAPERS` or `USING`.
- `src/docs/parameters.json`: the parameter reference, refreshed from trinity's
  `default.param` with `node scripts/extract-parameters.mjs --write`. The script's header
  describes what it preserves and what it overwrites.
- `src/docs/03-notebook.md` and `public/notebook/`: the tutorial notebook and its figures,
  written by `examples/export_web.sh` in the trinity repository.
