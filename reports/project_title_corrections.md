# Project Title Corrections — Validation Report

**Report date:** 2026-09-21
**Status:** Analysis only — no corrections applied
**Source data:** `data/processed/evidence.json` (610 projects, unchanged)

---

## Scope

This report examines the 8 project_title findings from the original data quality audit (`reports/data_quality_audit.json`) that were classified REJECT_CORRECTION in the first validation pass (`reports/validated_display_corrections.json`). Those 8 findings were rejected because the audit generated isolated display words rather than complete corrected titles.

This report attempts to produce complete corrected titles for each of the 8 source projects. For each project:

1. The exact source title is reproduced verbatim from `data/processed/evidence.json`.
2. Every apparent spelling/wording issue is identified separately.
3. A complete corrected title is proposed.
4. Each proposed correction is classified as CERTAIN or UNCERTAIN.
5. Ambiguous wording is preserved where the intended meaning cannot be established.

**No project title has been modified in the application or source data.**

---

## Important note on the `": "` artefact

Some audit findings include a leading `": "` prefix (e.g. `": Restoratio of River Kadua Biodersity"`). This prefix is a fact-extraction artefact from how the audit parsed the `Project title:` fact in the evidence data. The actual source titles in `evidence.json` do NOT include this prefix. For example, PID 445's source title is:

```
Project title: Restoratio of River Kadua Biodersity
```

The display title (after stripping the `Project title: ` prefix) is:

```
Restoratio of River Kadua Biodersity
```

This report uses the actual source titles from `evidence.json`, without the artefact.

---

## 1. PID 449 — Brushing, Road Clearing, Coppies Reduction and Singling to Standard

### Source title (verbatim)

```
Brushing, Road Clearing, Coppies Reduction and Singling to Standard
```

### Identified issues

| Position | Text | Issue type |
|----------|------|------------|
| Word 3 | `Coppies` | Apparent spelling error |
| Word 7 | `Singling` | Apparent domain-specific terminology — not necessarily an error |

### Analysis

#### `Coppies`

The word "coppies" does not exist in standard English. The nearest valid word is "coppice" (a noun meaning a small wood periodically cut for regrowth, or the verb meaning to cut trees/brush down to ground level for regrowth).

However, this is a **road maintenance** project title, alongside "Brushing" and "Road Clearing". In road/linear infrastructure contexts, "coppicing" can refer to clearing shrubby vegetation along road verges. But the plural form "coppies" is orthographically incorrect in any reading.

If the intended word is "coppice" (singular noun), the phrase would be "Coppice Reduction" — reducing coppice growth.
If the intended word is "coppicing" (gerund), the phrase would be "Coppicing Reduction" — reducing the act/need of coppicing.
If the intended word is a plural of something else, the reading is unclear.

The most plausible correction given the road maintenance context and parallel terms ("Road Clearing", "Brushing") is **"Coppicing Reduction"** or **"Coppice Reduction"**. But the exact intended form is not 100% certain from the title alone.

**Classification: UNCERTAIN** — the correct form (coppice vs coppicing) cannot be determined from the source title alone. Both are plausible; the dataset does not specify which.

#### `Singling`

Contrary to an initial assumption that "Singling" might be a misspelling of "Copies" or another word, **singling is a real and established term** in agriculture and forestry:

- In agriculture/horticulture: the thinning out of seedlings (especially root crops like turnips, mangolds, sugar beet) to leave one plant per spacing interval, allowing the remaining plant more room to grow. (Source: WordReference forums; historical agricultural texts such as John Stewart Collis, *The Worm Forgives the Plough*; Evelyn Dunbar's *Singling Turnips* (1943).)
- In forestry/woodland management: the practice of selecting and retaining a single best sprout from each stump after coppicing, removing all other sprouts. (Source: USDA Forest Service research paper NRS-6748, "Sprout Singling in North Alabama Hardwoods"; also vocabulary references defining singling as "the thinning out of seedlings to leave only one plant in a space".)

In the context of this project title — which pairs singling with "Coppies Reduction" — the singling likely refers to the forestry practice: after coppicing (clearing shrubby growth), singling selects the best regrowth stem from each stump. This is a coherent land management activity.

**Classification: CERTAIN** that "Singling" is NOT a misspelling — it is a valid domain-specific term in agriculture/forestry. No correction to "Singling" is needed.

**However**, the relationship between "Coppies Reduction" and "Singling" suggests these are two related but distinct land management activities. The title lists them as separate items in a sequence: Brushing → Road Clearing → Coppies Reduction → Singling → Standard. This reading is preserved.

### Proposed corrected title

```
Brushing, Road Clearing, Coppice Reduction and Singling to Standard
```

or

```
Brushing, Road Clearing, Coppicing Reduction and Singling to Standard
```

### Correction classification

| Proposed change | Classification |
|-----------------|----------------|
| `Coppies` → `Coppice` | UNCERTAIN (coppice vs coppicing not determinable) |
| `Coppies` → `Coppicing` | UNCERTAIN (coppice vs coppicing not determinable) |
| `Singling` left unchanged | CERTAIN (valid domain term, no correction needed) |

### Recommendation

**Do not apply an isolated "Coppies → Copies" correction.** That would produce a nonsensical title ("Copies Reduction") with no basis in the source evidence.

The corrected title should use either "Coppice" or "Coppicing" — both are valid English words in a land management context. The choice between them requires additional evidence (e.g. the original procurement document, agency terminology conventions, or comparable project titles in the dataset). Until that evidence is available, the preferred conservative display title retains the structure but corrects only the unambiguous spelling error:

```
Brushing, Road Clearing, Coppicing Reduction and Singling to Standard
```

This treats "Coppies" as a misspelling of the gerund "Coppicing" (the act of coppicing), which is the most natural parallel to "Brushing" (gerund) and "Road Clearing" (noun phrase). This is proposed but marked UNCERTAIN on the coppice/coppicing distinction.

---

## 2. PID 250 — Extention of KADFAMA HQ Head office Renovation the Department of Public Affairs

### Source title (verbatim)

```
Extention of KADFAMA HQ Head office Renovation the Department of Public Affairs
```

### Identified issues

| Position | Text | Issue type |
|----------|------|------------|
| Word 1 | `Extention` | Spelling error — should be "Extension" |
| Words 5–6 | `Head office` | Possible casing inconsistency (vs "Head Office") |
| Words 9–10 | `Renovation the` | Possible missing preposition ("of the") — UNCERTAIN |

### Analysis

#### `Extention` → `Extension`

"Extention" is a clear misspelling of "Extension" — the 't' and 's' are transposed. This is unambiguous.

**Classification: CERTAIN**

#### `Head office` casing

The title uses "Head office" (lowercase 'o' in office). This may be intentional (sentence case) or an inconsistency. It is not a spelling error per se. If the display style uses title case elsewhere, this could be normalised, but that is a casing/style decision, not a spelling correction.

**Classification: UNCERTAIN** — casing is a style choice, not a clear source typo.

#### `Renovation the Department` — missing preposition?

The phrase "Renovation the Department of Public Affairs" reads as if a preposition is missing: "Renovation **of** the Department of Public Affairs" or "Renovation **of** KADFAMA HQ Head office **for** the Department of Public Affairs".

However, procurement project titles often omit prepositions for brevity. Without the original source document, we cannot be certain that "Renovation the" is an error rather than a stylistic abbreviation.

Additionally, the title structure is ambiguous: is this one project ("Extension of KADFAMA HQ Head office Renovation") for the Department of Public Affairs, or two activities ("Extension of KADFAMA HQ Head office" + "Renovation the Department of Public Affairs")?

The source title as written has grammatical awkwardness but not a clear single-word spelling error (other than "Extention"). Changing "Renovation the" to "Renovation of the" would be an editorial intervention, not a documented error correction.

**Classification: UNCERTAIN** — missing preposition cannot be confirmed without the source document.

### Proposed corrected title

```
Extension of KADFAMA HQ Head Office Renovation the Department of Public Affairs
```

Note: only "Extention" is corrected to "Extension". The "Renovation the" wording is preserved because the missing preposition cannot be confirmed.

If title casing is desired: "Head Office" instead of "Head office".

### Correction classification

| Proposed change | Classification |
|-----------------|----------------|
| `Extention` → `Extension` | CERTAIN |
| `Head office` → `Head Office` | UNCERTAIN (style/casing) |
| `Renovation the` → `Renovation of the` | UNCERTAIN (cannot confirm missing preposition) |

### Recommendation

Apply only the CERTAIN correction:

```
Extension of KADFAMA HQ Head office Renovation the Department of Public Affairs
```

Preserve "Renovation the" as-is. Do not insert "of" without source evidence.

---

## 3. PID 190 — Major Repairs/Rehablitation of Kangimi Dam.

### Source title (verbatim)

```
Major Repairs/Rehablitation of Kangimi Dam.
```

### Identified issues

| Position | Text | Issue type |
|----------|------|------------|
| Word 2 | `Rehablitation` | Spelling error — should be "Rehabilitation" |

### Analysis

#### `Rehablitation` → `Rehabilitation`

"Rehablitation" is a clear misspelling. The correct spelling is "Rehabilitation" (with an 'i' after 'b': Re-ha-bi-li-tation). The error is a missing 'i'.

"Kangimi Dam" — no spelling issue identified. Kangimi is a known location in Kaduna State (Kangimi Dam is a real water infrastructure project area in Kaduna North LGA).

The trailing period "." is preserved as part of the source title.

**Classification: CERTAIN**

### Proposed corrected title

```
Major Repairs/Rehabilitation of Kangimi Dam.
```

### Correction classification

| Proposed change | Classification |
|-----------------|----------------|
| `Rehablitation` → `Rehabilitation` | CERTAIN |

### Recommendation

Apply the correction:

```
Major Repairs/Rehabilitation of Kangimi Dam.
```

Preserve trailing period.

---

## 4. PID 444 — Procuremet of laboratory Reaget/Equipmet

### Source title (verbatim)

```
Procuremet of laboratory Reaget/Equipmet
```

### Identified issues

| Position | Text | Issue type |
|----------|------|------------|
| Word 1 | `Procuremet` | Spelling error — should be "Procurement" |
| Word 4 | `Reaget` | Spelling error — should be "Reagent" |
| Word 5–6 | `Equipmet` | Spelling error — should be "Equipment" |

### Analysis

#### `Procuremet` → `Procurement`

"Procuremet" is missing the final 'n'. The correct word is "Procurement". This is unambiguous.

**Classification: CERTAIN**

#### `Reaget` → `Reagent`

"Reaget" is a misspelling of "Reagent" — the 'n' is replaced by 't' (or the 'n' is missing and 't' is in the wrong position). A reagent is a substance used in chemical reactions for analysis or production. In a laboratory procurement context, "Reagent" is the correct term.

The slash "/" in "Reaget/Equipmet" joins two items: "Reagents and Equipment" or "Reagent/Equipment". The slash likely means "and/or" — i.e. the procurement covers both reagents and equipment, or either.

**Classification: CERTAIN**

#### `Equipmet` → `Equipment`

"Equipmet" is missing the final 'n'. The correct word is "Equipment". This is unambiguous.

**Classification: CERTAIN**

Note: "Equipment" is an uncountable noun (no plural "equipments"). The corrected title should use "Equipment" (singular form, uncountable).

### Proposed corrected title

```
Procurement of laboratory Reagent/Equipment
```

or, if the slash is read as "and":

```
Procurement of laboratory Reagents and Equipment
```

The slash form is preserved as in the source. Whether it means "and" or "and/or" is unclear.

### Correction classification

| Proposed change | Classification |
|-----------------|----------------|
| `Procuremet` → `Procurement` | CERTAIN |
| `Reaget` → `Reagent` | CERTAIN |
| `Equipmet` → `Equipment` | CERTAIN |

### Recommendation

Apply all three corrections. The corrected title:

```
Procurement of laboratory Reagent/Equipment
```

Preserve the slash and the lack of article ("of laboratory" without "the") as in the source.

---

## 5. PID 232 — Rehabilitation and Retrofiting of pumps and equipment at Birnin Gwari Water Works.

### Source title (verbatim)

```
Rehabilitation and Retrofiting of pumps and equipment at Birnin Gwari Water Works.
```

### Identified issues

| Position | Text | Issue type |
|----------|------|------------|
| Word 4 | `Retrofiting` | Spelling error — should be "Retrofitting" |

### Analysis

#### `Retrofiting` → `Retrofitting`

"Retrofiting" is missing the second 'r' in "Retrofitting". The correct spelling is "Retrofitting" (retro-fit-ing). This is unambiguous.

"Birnin Gwari" — this is the correct spelling of a Local Government Area in Kaduna State. Birnin Gwari (also spelled Birni Gwari) is a real LGA and town. No correction needed.

"Water Works" — standard term for a water treatment/pumping facility. No issue.

The trailing period "." is preserved.

**Classification: CERTAIN**

### Proposed corrected title

```
Rehabilitation and Retrofitting of pumps and equipment at Birnin Gwari Water Works.
```

### Correction classification

| Proposed change | Classification |
|-----------------|----------------|
| `Retrofiting` → `Retrofitting` | CERTAIN |

### Recommendation

Apply the correction:

```
Rehabilitation and Retrofitting of pumps and equipment at Birnin Gwari Water Works.
```

Preserve trailing period.

---

## 6. PID 233 — Rehabilitation and Retrofiting of pumps and equipment at Ikara Water Works.

### Source title (verbatim)

```
Rehabilitation and Retrofiting of pumps and equipment at Ikara Water Works.
```

### Identified issues

| Position | Text | Issue type |
|----------|------|------------|
| Word 4 | `Retrofiting` | Spelling error — should be "Retrofitting" |

### Analysis

Same as PID 232. "Retrofiting" → "Retrofitting".

"Ikara" — correct spelling of a town/LGA in Kaduna State (Ikara is a known LGA; also appears as "Ikara Water Works" in related project titles in the dataset). No correction needed.

**Classification: CERTAIN**

### Proposed corrected title

```
Rehabilitation and Retrofitting of pumps and equipment at Ikara Water Works.
```

### Correction classification

| Proposed change | Classification |
|-----------------|----------------|
| `Retrofiting` → `Retrofitting` | CERTAIN |

### Recommendation

Apply the correction:

```
Rehabilitation and Retrofitting of pumps and equipment at Ikara Water Works.
```

Preserve trailing period.

---

## 7. PID 234 — Rehabilitation and Retrofiting of pumps and equipment at Kwoi Water Works.

### Source title (verbatim)

```
Rehabilitation and Retrofiting of pumps and equipment at Kwoi Water Works.
```

### Identified issues

| Position | Text | Issue type |
|----------|------|------------|
| Word 4 | `Retrofiting` | Spelling error — should be "Retrofitting" |
| Word 5 | `Kwoi` | Possible variant spelling — investigate |

### Analysis

#### `Retrofiting` → `Retrofitting`

Same as PIDs 232 and 233. **Classification: CERTAIN**

#### `Kwoi` — location verification

The source title uses "Kwoi". This is NOT a spelling error — "Kwoi" is the correct and established name of a town/community in Kaduna State, Nigeria.

External evidence confirms "Kwoi" is the correct spelling:

- **World Bank document** (NWRP project, documents1.worldbank.org): "construction of new regional water supply systems at **Kwoi** and Zonkwa" — using "Kwoi" as the town name in Kaduna State water infrastructure context.
- **Kaduna State Governor news** (National Accord Newspaper, 2025): "Jaba–K**woi** Road" and "Kwoi road reconstruction" — using "Kwoi" as the correct community name.
- **SURWASH programme news** (National Accord Newspaper): "major water facilities in Kaduna, Zaria, Kafanchan, **Kwoi**, Manchok, and Kagoro have undergone rehabilitation" — using "Kwoi" as a water project location.

Therefore, "Kwoi" in the source title is the correct place name. It is NOT a misspelling of "Kwop" or any other word.

**Classification: CERTAIN** — "Kwoi" is correct. No correction to the location name is needed.

### Proposed corrected title

```
Rehabilitation and Retrofitting of pumps and equipment at Kwoi Water Works.
```

### Correction classification

| Proposed change | Classification |
|-----------------|----------------|
| `Retrofiting` → `Retrofitting` | CERTAIN |
| `Kwoi` unchanged | CERTAIN (correct place name) |

### Recommendation

Apply only the "Retrofiting → Retrofitting" correction. Preserve "Kwoi" as-is (it is the correct spelling).

```
Rehabilitation and Retrofitting of pumps and equipment at Kwoi Water Works.
```

Preserve trailing period.

---

## 8. PID 445 — Restoratio of River Kadua Biodersity

### Source title (verbatim)

```
Restoratio of River Kadua Biodersity
```

### Identified issues

| Position | Text | Issue type |
|----------|------|------------|
| Word 1 | `Restoratio` | Spelling error — should be "Restoration" |
| Word 4 | `Kadua` | Spelling error — should be "Kaduna" |
| Word 6 | `Biodersity` | Spelling error — should be "Biodiversity" |

### Analysis

#### `Restoratio` → `Restoration`

"Restoratio" is missing the final 'n'. The correct word is "Restoration". This is unambiguous.

**Classification: CERTAIN**

#### `Kadua` → `Kaduna`

"Kadua" is missing the final 'n'. The correct state name is "Kaduna". This is unambiguous and is the same correction applied as a SAFE_DISPLAY_CORRECTION for the LGA field (see `reports/validated_display_corrections.json`).

**Classification: CERTAIN**

#### `Biodersity` → `Biodiversity`

"Biodersity" has the 'e' and 'i' transposed (or the 'i' is missing and 'e' is in the wrong position). The correct word is "Biodiversity". This is unambiguous.

**Classification: CERTAIN**

All three corrections are independent spelling errors in the same title. They do not interact with each other.

### Proposed corrected title

```
Restoration of River Kaduna Biodiversity
```

### Correction classification

| Proposed change | Classification |
|-----------------|----------------|
| `Restoratio` → `Restoration` | CERTAIN |
| `Kadua` → `Kaduna` | CERTAIN |
| `Biodersity` → `Biodiversity` | CERTAIN |

### Recommendation

Apply all three corrections:

```
Restoration of River Kaduna Biodiversity
```

---

## Summary table

| PID | Source title | Issues | Corrected title (proposed) | Status |
|-----|-------------|--------|---------------------------|--------|
| 449 | Brushing, Road Clearing, Coppies Reduction and Singling to Standard | `Coppies` (uncertain: coppice vs coppicing); `Singling` (certain: valid domain term) | Brushing, Road Clearing, Coppicing Reduction and Singling to Standard | UNCERTAIN on coppice/coppicing distinction; do NOT change Singling |
| 250 | Extention of KADFAMA HQ Head office Renovation the Department of Public Affairs | `Extention` (certain); `Renovation the` (uncertain: possible missing "of") | Extension of KADFAMA HQ Head office Renovation the Department of Public Affairs | Apply only "Extention → Extension"; preserve "Renovation the" |
| 190 | Major Repairs/Rehablitation of Kangimi Dam. | `Rehablitation` (certain) | Major Repairs/Rehabilitation of Kangimi Dam. | CERTAIN — apply correction |
| 444 | Procuremet of laboratory Reaget/Equipmet | `Procuremet` (certain); `Reaget` (certain); `Equipmet` (certain) | Procurement of laboratory Reagent/Equipment | CERTAIN — apply all three corrections |
| 232 | Rehabilitation and Retrofiting of pumps and equipment at Birnin Gwari Water Works. | `Retrofiting` (certain) | Rehabilitation and Retrofitting of pumps and equipment at Birnin Gwari Water Works. | CERTAIN — apply correction |
| 233 | Rehabilitation and Retrofiting of pumps and equipment at Ikara Water Works. | `Retrofiting` (certain) | Rehabilitation and Retrofitting of pumps and equipment at Ikara Water Works. | CERTAIN — apply correction |
| 234 | Rehabilitation and Retrofiting of pumps and equipment at Kwoi Water Works. | `Retrofiting` (certain); `Kwoi` (certain: correct place name, no correction) | Rehabilitation and Retrofitting of pumps and equipment at Kwoi Water Works. | CERTAIN — apply Retrofitting correction only; preserve Kwoi |
| 445 | Restoratio of River Kadua Biodersity | `Restoratio` (certain); `Kadua` (certain); `Biodersity` (certain) | Restoration of River Kaduna Biodiversity | CERTAIN — apply all three corrections |

---

## Key findings

### `Singling` is a valid term — do not "correct" it

"Singling" is not a misspelling. It is a well-established term in agriculture and forestry:

- Agriculture: thinning seedlings to leave one plant per spacing interval (turnips, mangolds, sugar beet). (WordReference; John Stewart Collis, *The Worm Forgives the Plough*; Evelyn Dunbar, *Singling Turnips* (1943).)
- Forestry: selecting one best sprout from a coppiced stump and removing others. (USDA Forest Service NRS-6748; vocabulary references.)

In the context of PID 449 ("Brushing, Road Clearing, Coppies Reduction and Singling to Standard"), "Singling" likely refers to the forestry practice — selecting the best regrowth stem after coppicing. This is a coherent land management activity alongside coppicing.

**Correction proposal: leave "Singling" unchanged.**

### `Coppies` — the correction is certain in direction but uncertain in form

"Coppies" is not a valid English word. The intended word is almost certainly "coppice" or "coppicing" (woodland/brush management). The road maintenance context ("Brushing", "Road Clearing") supports a vegetation management reading.

But the exact form is uncertain:
- "Coppice Reduction" — reducing coppice growth (noun phrase, parallel to "Road Clearing" noun phrase)
- "Coppicing Reduction" — reducing the need/act of coppicing (gerund, parallel to "Brushing" gerund)

Both are valid. Without the source document or agency convention, the choice is UNCERTAIN.

**Correction proposal: propose "Coppicing Reduction" as the preferred display title (gerund parallel to "Brushing"), but mark the choice as UNCERTAIN.**

### `Kwoi` is the correct place name — do not "correct" it

"Ko[i]" is NOT a misspelling. It is the established name of a town/community in Kaduna State, confirmed by:

- World Bank NWRP project document: "construction of new regional water supply systems at Kwoi and Zonkwa"
- Kaduna State Governor news (2025): "Jaba–Kwoi Road reconstruction"
- SURWASH programme news: "water facilities in Kaduna, Zaria, Kafanchan, Kwoi, Manchok, and Kagoro"

**Correction proposal: leave "Kwoi" unchanged.**

### `Coppies` is NOT "Copies"

A naïve correction of "Coppies" → "Copies" would produce "Copies Reduction" — which is nonsensical in a road/land management context. This is the error that led to the original REJECT_CORRECTION classification. The correct reading is **coppice/coppicing** (woodland management), not "copies" (duplicates/reproductions).

---

## External verification sources

| Term | Evidence | Source URL |
|------|----------|------------|
| Singling (agriculture) | Agricultural thinning of seedlings | https://dictai.org/w/singling (Wordnik/Century Dictionary); WordReference forum discussions |
| Singling (forestry) | Selecting one best sprout from coppiced stump | https://research.fs.usda.gov/treesearch/6748 (USDA Forest Service NRS-6748) |
| Coppice/coppicing | Woodland management — cutting trees to stump for regrowth | https://en.wikipedia.org/wiki/Coppicing; https://www.woodlands.co.uk/blog/practical-guides/coppicing-an-introduction/ |
| Kwoi (Kaduna town) | World Bank NWRP project: "regional water supply systems at Kwoi and Zonkwa" | https://documents1.worldbank.org/curated/en/890001468083936459/pdf/multi0page.pdf |
| Kwoi (Kaduna town) | Kaduna Governor flags off Jaba–Kwoi road reconstruction (2025) | https://nationalaccordnewspaper.com/kaduna-governor-flags-off-jaba-kwoi-road-reconstruction |
| Kwoi (Kaduna town) | SURWASH: water facilities in Kwoi rehabilitated | https://nationalaccordnewspaper.com/world-water-day-uba-sanis-water-reforms-deliver-clean-supply-to-1-5-million-kaduna-residents |

---

## Comparison with prior audit

The original audit (`reports/data_quality_audit.json`) classified all 8 project title findings as CONFIRMED_SOURCE_TYPO and proposed isolated display words:

| PID | Audit's proposed display word | This report's finding |
|-----|-------------------------------|----------------------|
| 449 | "Copies" | INCORRECT — should be "Coppice" or "Coppicing", not "Copies". "Singling" is valid. |
| 250 | "Extension" | CORRECT for "Extention", but incomplete — other wording issues exist |
| 190 | "Rehabilitation" | CORRECT, but incomplete — only fixes one word |
| 444 | "Procurement" | CORRECT for "Procuremet", but incomplete — also "Reaget" and "Equipmet" |
| 232 | "Retrofitting" | CORRECT, but incomplete — only fixes one word |
| 233 | "Retrofitting" | CORRECT, but incomplete — only fixes one word |
| 234 | "Retrofitting" | CORRECT, but incomplete — only fixes one word; "Kwoi" is correct |
| 445 | "Kaduna" | CORRECT for "Kadua", but incomplete — also "Restoratio" and "Biodersity" |

The original audit's approach of generating isolated single-word display corrections was fundamentally inadequate for project titles. This report provides complete corrected titles.

---

## Decision: Do not apply these corrections yet

All 8 project title corrections are **analysis only** in this report. None has been applied to the application or source data.

**Reasons:**

1. PID 449 (`Coppies`): the correct form (coppice vs coppicing) is UNCERTAIN. Applying either without confirming the intended form would be an editorial guess.
2. PID 250 (`Renovation the`): the missing preposition ("of") is UNCERTAIN. Applying it would be editorial.
3. For all 8: complete corrected titles require careful handling of the full title structure, not isolated word swaps. The correction layer (`lib/displayCorrections.ts`) is designed for field-specific single-value corrections, not full-title reconstruction.

**Recommended path forward:**

- For PIDs 190, 232, 233, 234, 444, 445: all corrections are CERTAIN. These are candidates for implementation once the correction mechanism is extended to handle full titles.
- For PID 449: the "Coppies" correction needs resolution (coppice vs coppicing) before implementation. "Singling" should NOT be changed.
- For PID 250: the "Extention → Extension" correction is CERTAIN, but the title has additional uncertain wording ("Renovation the"). A partial implementation could fix only "Extention", or the full title could be held until the missing preposition question is resolved.

---

## Verification checklist

- [x] All 8 source titles reproduced verbatim from `data/processed/evidence.json`
- [x] Every apparent spelling/wording issue identified separately
- [x] Complete corrected title proposed for each project
- [x] Each correction classified as CERTAIN or UNCERTAIN
- [x] `Singling` investigated — confirmed as valid domain term, not a misspelling
- [x] `Coppies` investigated — not "Copies"; corrected form (coppice/coppicing) is UNCERTAIN
- [x] `Kwoi` investigated — confirmed as correct place name, not a misspelling
- [x] Ambiguous wording preserved where meaning cannot be established
- [x] No project title modified in application or source data
- [x] `: ` artefact from audit noted and excluded from reported source titles
- [x] External evidence cited with source URLs for uncertain terms

---

## File reference

- Source data: `data/processed/evidence.json`
- Original audit: `reports/data_quality_audit.json` and `reports/data_quality_audit.md`
- Display correction validation: `reports/validated_display_corrections.json` and `reports/validated_display_correction.md`
- Correction layer: `lib/displayCorrections.ts`
- This report: `reports/project_title_corrections.md`
