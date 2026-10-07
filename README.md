# TRINITY — Feedback-driven bubble evolution in molecular clouds

Interactive showcase website for the TRINITY stellar feedback code.

- **Live site:** <a href="https://jiaweiteh.github.io/trinity-web/" target="_blank">jiaweiteh.github.io/trinity-web</a>
- **TRINITY source code:** <a href="https://github.com/JiaWeiTeh/trinity" target="_blank">github.com/JiaWeiTeh/trinity</a>
- **Legacy docs (deprecated):** <a href="https://trinitysf.readthedocs.io/" target="_blank">trinitysf.readthedocs.io</a> — superseded by the live site above.

## Local development

```bash
npm install
npm run dev      # live server
npm run lint     # eslint
npm run build    # production build into dist/ (what the Pages workflow deploys)
```

The parameter reference (`src/docs/parameters.json`) is refreshed from trinity's
`default.param` with `node scripts/extract-parameters.mjs --write`; the script's header
describes what it preserves and what it overwrites. The tutorial notebook page and its
figures are written by `examples/export_web.sh` in the trinity repository.
