#!/usr/bin/env node
// scripts/extract-parameters.mjs
//
// Refresh src/docs/parameters.json from the upstream default.param schema.
//
// Reads the canonical parameter schema (default.param) from the trinity
// repository — either from a local path or fetched live from GitHub — and
// merges it with the existing parameters.json on this site. Manual
// fields (desc, aliases, notes, acceptedValues, unit) are preserved;
// auto-derived fields (defaultValue, sourceComment) are refreshed; new
// parameters are appended with empty manual fields for someone to fill
// in later.
//
//   node scripts/extract-parameters.mjs                 # dry run, prints merged JSON
//   node scripts/extract-parameters.mjs --write         # update src/docs/parameters.json in place
//   node scripts/extract-parameters.mjs path/to/file    # use a local default.param
//
// No external dependencies — uses node:fs, node:path, and the global fetch.

import fs from 'node:fs'
import path from 'node:path'

const UPSTREAM_URL = 'https://raw.githubusercontent.com/JiaWeiTeh/trinity/main/trinity/_input/default.param'
const PARAMS_JSON = 'src/docs/parameters.json'

// Map raw upstream unit strings (LaTeX-ish) to the unicode form used on
// the site. Anything not in here falls back to the raw string.
const UNIT_MAP = {
  'Msun': 'M☉',
  'Zsun': 'Z☉',
  'cm**-3': 'cm⁻³',
  'cm**3 / (g * s**2)': 'cm³/(g s²)',
  'cm**3 * s**-1': 'cm³/s',
  'cm**2': 'cm²',
  'cm**2 / g': 'cm²/g',
  'erg * s**-1 * cm**-1 * K**(-7/2)': 'erg/(s cm K^(7/2))',
  'cm * s**-1': 'cm/s',
  'km * s**-1': 'km/s',
  'erg / K': 'erg/K',
  'K * cm**-3': 'K cm⁻³',
  'Myr': 'Myr',
  'pc': 'pc',
  'K': 'K',
  'unitless': '—',
  'bool': '—',
  'path': 'path',
}

function mapUnit(raw) {
  if (!raw) return '—'
  const cleaned = raw.replace(/^\s*\[?/, '').replace(/\]?\s*$/, '').trim()
  return UNIT_MAP[cleaned] ?? cleaned ?? '—'
}

// Heuristic group classification from the section banners that precede a
// parameter in default.param. Falls back to name-pattern matches.
function classify(section, subSection, name) {
  const s = (section || '').toLowerCase()
  const sub = (subSection || '').toLowerCase()
  if (sub.includes('administrative')) return 'administrative'
  if (sub.includes('logging')) return 'logging'
  if (sub.includes('physical')) return 'physical'
  if (s.includes('density profile')) return 'density'
  if (s.includes('termination') || s.includes('collapse')) return 'termination'
  if (s.includes('sps') || s.includes('feedback')) {
    if (name.startsWith('SB99_')) return 'starburst99'
    if (name.startsWith('sps_')) return 'starburst99'
    if (name.startsWith('FB_')) return 'feedback'
    return 'feedback'
  }
  if (s.includes('cooling')) return 'cooling'
  if (s.includes('phase')) return 'phase'
  if (s.includes('path')) return 'paths'
  if (s.includes('constant')) return 'constants'
  // name-pattern fallbacks
  if (name.startsWith('log_')) return 'logging'
  if (name.startsWith('SB99_')) return 'starburst99'
  if (name.startsWith('FB_')) return 'feedback'
  if (name.startsWith('cool_')) return 'cooling'
  if (name.startsWith('path_')) return 'paths'
  if (name.startsWith('stop_') || name === 'coll_r' || name === 'allowShellDissolution') return 'termination'
  if (name.startsWith('mu_') || name.startsWith('TShell_') || name.startsWith('dust_') ||
      ['gamma_adia', 'caseB_alpha', 'C_thermal', 'c_light', 'G', 'k_B', 'PISM', 'bubble_xi_Tb'].includes(name)) return 'constants'
  return 'physical'
}

function parse(content) {
  const lines = content.split('\n')
  const records = []
  let currentSection = ''
  let currentSubSection = ''
  let infoBuffer = []
  let optionsBuffer = []
  let unit = ''
  // Track === banner sandwiches: open banner → title line(s) → close banner.
  // Without tracking the close banner, a later "# INFO:" inside a section
  // can be mistaken for the next section's title.
  let inHeader = false
  let headerCaptured = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // === banner — flip the in-header flag (open then close). Reset the
    // sub-section on entering a new major section so "Physical parameters"
    // doesn't leak from Basic Parameters into the next # === group.
    if (line.match(/^#\s*={5,}\s*$/)) {
      if (!inHeader) { inHeader = true; headerCaptured = false; currentSubSection = '' }
      else { inHeader = false }
      continue
    }

    // Inside a header sandwich, capture the first non-banner # line as the
    // section title and ignore any further header content lines.
    if (inHeader && line.startsWith('#') && !line.match(/^#\s*-{3,}/)) {
      if (!headerCaptured) {
        const title = line.replace(/^#\s*/, '').trim()
        if (title) { currentSection = title; headerCaptured = true }
      }
      continue
    }

    // --- sub-section header (only "# --- name" pattern, not the dashes line)
    const subMatch = line.match(/^#\s*---\s+(.+?)\s*$/)
    if (subMatch) {
      currentSubSection = subMatch[1].trim()
      continue
    }
    // bare "# ---" rule lines: ignore
    if (line.match(/^#\s*-{3,}\s*$/)) continue

    // INFO accumulator
    const infoMatch = line.match(/^#\s*INFO:\s*(.*)$/)
    if (infoMatch) {
      infoBuffer.push(infoMatch[1].trim())
      continue
    }
    // INFO continuation — a `# <whitespace> <text>` line right after an
    // INFO, without its own tag. Stops at any tag, banner, sub-section,
    // blank line, or param line (those are handled earlier or later in
    // the loop and `continue` before reaching here).
    if (infoBuffer.length > 0 && line.match(/^#\s+\S/) &&
        !line.match(/^#\s*(INFO|UNIT|OPTIONS):/)) {
      infoBuffer.push(line.replace(/^#\s*/, '').trim())
      continue
    }
    // OPTIONS line (used by enumerated params; kept separately, doesn't leak into INFO)
    const optMatch = line.match(/^#\s*OPTIONS:\s*(.*)$/)
    if (optMatch) {
      optionsBuffer.push(optMatch[1].trim())
      continue
    }
    // UNIT
    const unitMatch = line.match(/^#\s*UNIT:\s*(.*)$/)
    if (unitMatch) {
      unit = unitMatch[1].trim()
      continue
    }

    // Parameter line: starts with an identifier, no leading whitespace, no #.
    const paramMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s+(.+?)\s*$/)
    if (paramMatch && !line.startsWith('#')) {
      let value = paramMatch[2]
      const hashIdx = value.indexOf('#')
      if (hashIdx > 0) value = value.slice(0, hashIdx).trim()
      records.push({
        name: paramMatch[1],
        defaultValue: value,
        unit: mapUnit(unit),
        sourceComment: infoBuffer.join(' ').replace(/\s+/g, ' ').trim(),
        rawOptions: optionsBuffer.join(' ').trim(),
        section: currentSection,
        subSection: currentSubSection,
      })
      infoBuffer = []
      optionsBuffer = []
      unit = ''
      continue
    }

    // Blank line resets pending INFO/UNIT so they don't leak forward.
    if (line.trim() === '') {
      infoBuffer = []
      optionsBuffer = []
      unit = ''
    }
  }

  return records
}

// Decide whether the upstream defaultValue is a real schema change or
// just a precision/format diff (e.g. "1.273" vs "1.2727272727272727",
// "2.998e10" vs "29979245800"). Keep the existing hand-formatted value
// when the numeric content is within 1% — the rounded form reads better
// in the table — but log it either way so the maintainer can review.
function isPrecisionOnlyChange(oldV, newV) {
  if (oldV === newV) return true
  const oldNum = parseFloat(oldV)
  const newNum = parseFloat(newV)
  if (!Number.isFinite(oldNum) || !Number.isFinite(newNum)) return false
  if (oldNum === 0 && newNum === 0) return true
  const ref = Math.max(Math.abs(oldNum), Math.abs(newNum))
  return Math.abs(oldNum - newNum) / ref < 0.01
}

function extractAcceptedValues(rawOptions) {
  if (!rawOptions) return []
  // "DEBUG (most detailed), INFO (general information), WARNING (warnings only)..."
  // Pull bare tokens before any parenthetical.
  return rawOptions.split(/,/).map((s) => s.replace(/\(.*?\)/g, '').trim()).filter(Boolean)
}

const FIELD_ORDER = [
  'name', 'group', 'defaultValue', 'unit',
  'desc', 'aliases', 'acceptedValues', 'notes', 'doc', 'sourceComment',
]

function serialiseEntry(entry) {
  const parts = []
  for (const key of FIELD_ORDER) {
    const v = entry[key]
    if (v === undefined || v === null) continue
    if (Array.isArray(v) && v.length === 0) continue
    if (typeof v === 'string' && v === '') continue
    parts.push(`${JSON.stringify(key)}: ${JSON.stringify(v)}`)
  }
  return `{ ${parts.join(', ')} }`
}

function serialise(entries) {
  return '[\n' + entries.map((e) => '  ' + serialiseEntry(e)).join(',\n') + '\n]\n'
}

function merge(existing, extracted) {
  const byName = new Map(existing.map((p) => [p.name, p]))
  const out = []
  const stats = { updated: 0, added: 0, kept: 0 }

  for (const ex of extracted) {
    const old = byName.get(ex.name)
    const group = classify(ex.section, ex.subSection, ex.name)

    if (old) {
      stats.updated++
      const precisionOnly = isPrecisionOnlyChange(old.defaultValue, ex.defaultValue)
      if (!precisionOnly && old.defaultValue !== ex.defaultValue) {
        console.error(`  CHANGED defaultValue: ${ex.name}: ${old.defaultValue} -> ${ex.defaultValue}`)
      }
      out.push({
        ...old,
        // upstream is the schema authority, but precision-only diffs are
        // dropped to keep the table readable.
        defaultValue: precisionOnly ? old.defaultValue : ex.defaultValue,
        // preserve hand-curated unit unicode; only seed if currently the placeholder
        unit: (old.unit && old.unit !== '—') ? old.unit : ex.unit,
        // preserve hand-curated group if already set
        group: old.group ?? group,
        sourceComment: ex.sourceComment,
      })
      byName.delete(ex.name)
    } else {
      stats.added++
      const acceptedValues = extractAcceptedValues(ex.rawOptions)
      out.push({
        name: ex.name,
        group,
        defaultValue: ex.defaultValue,
        unit: ex.unit,
        desc: ex.sourceComment,
        aliases: [],
        ...(acceptedValues.length ? { acceptedValues } : {}),
        sourceComment: ex.sourceComment,
      })
    }
  }

  for (const old of byName.values()) {
    stats.kept++
    console.error(`  KEPT (no longer in schema): ${old.name}`)
    out.push(old)
  }

  return { merged: out, stats }
}

async function readContent(arg) {
  if (arg) {
    return fs.readFileSync(arg, 'utf8')
  }
  console.error(`Fetching ${UPSTREAM_URL}`)
  const res = await fetch(UPSTREAM_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

async function main() {
  const argv = process.argv.slice(2)
  const writeFlag = argv.includes('--write')
  const fileArg = argv.find((a) => !a.startsWith('--'))

  const content = await readContent(fileArg)
  const extracted = parse(content)
  console.error(`Parsed ${extracted.length} parameters from default.param`)

  const existingPath = path.join(process.cwd(), PARAMS_JSON)
  const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'))

  const { merged, stats } = merge(existing, extracted)
  const output = serialise(merged)

  console.error(`Merge: ${stats.updated} updated, ${stats.added} added, ${stats.kept} kept (orphaned)`)

  if (writeFlag) {
    fs.writeFileSync(existingPath, output)
    console.error(`Wrote ${merged.length} entries to ${PARAMS_JSON}`)
  } else {
    process.stdout.write(output)
    console.error('Dry run — pass --write to commit to ' + PARAMS_JSON)
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
