// Display correction layer for Ordaciti.
// Applies validated display corrections to source-derived values at the display layer.
// Source values are NEVER modified. Corrections are presentation-only.
//
// Evidence hierarchy used for each correction:
// 1. Original source-derived value
// 2. Repeated occurrence/context within the dataset
// 3. Official Kaduna State source
// 4. Official agency/institution source
// 5. Other authoritative public source
// 6. Dictionary/general spelling (ordinary words only)
//
// Corrections are keyed by (field, source_value) → display_value.
// Only the six validated SAFE_DISPLAY_CORRECTION entries are included.
// REJECT_CORRECTION and NEEDS_HUMAN_REVIEW entries are NOT applied.

export type CorrectionField = 'executing_mda' | 'location_lga' | 'contractor' | 'title'

export interface DisplayCorrection {
  field: CorrectionField
  source_value: string
  display_value: string
  reason: string
  evidence: string
  confidence: 'high' | 'medium'
}

// Correction map: (field, source_value) → display_value
// Keyed by field + source value for efficient lookup.
const correctionsByField: Partial<Record<CorrectionField, Record<string, DisplayCorrection>>> = {
  executing_mda: {
    'Ministry of Works Housing and Transportation': {
      field: 'executing_mda',
      source_value: 'Ministry of Works Housing and Transportation',
      display_value: 'Ministry of Works, Housing and Transportation',
      reason: 'Missing comma after "Works". A parallel entry for the same ministry exists elsewhere in the dataset as "Ministry of Works, Housing and Transport" (with comma). The comma is required for readability and is consistent with standard government ministry naming conventions.',
      evidence: 'Internal dataset evidence (parallel entry). General language knowledge for comma usage in lists.',
      confidence: 'high',
    },
    'Customary Court of Apeal': {
      field: 'executing_mda',
      source_value: 'Customary Court of Apeal',
      display_value: 'Customary Court of Appeal',
      reason: '"Apeal" is an obvious misspelling of "Appeal". The same court type appears elsewhere in the dataset as "Sharia Court of Appeal" (correctly spelled), confirming the intended word is "Appeal".',
      evidence: 'Internal dataset evidence ("Sharia Court of Appeal" in other projects). Standard English spelling of "appeal".',
      confidence: 'high',
    },
    'Kaduna State College of Mid-Wifery': {
      field: 'executing_mda',
      source_value: 'Kaduna State College of Mid-Wifery',
      display_value: 'Kaduna State College of Midwifery',
      reason: 'Resolved from NEEDS_HUMAN_REVIEW based on external Kaduna State Government evidence. Kaduna State Government material from 2017 uses "Kaduna State College of Midwifery, Tudun-Wada". Kaduna State\'s 2018 law refers to and repeals the previous "Kaduna State College of Midwifery, Tudun Wada Kaduna" law as part of institutional restructuring. These confirm the historical institution name used "Midwifery" (one word). The source value uses the segmented form "Mid-Wifery" which is a non-standard spelling. The display correction is spelling-only and preserves the historical institution. NOTE: The current institution is Kaduna State College of Nursing & Midwifery, which is a separate entity and is NOT applied as a correction.',
      evidence: 'External authoritative sources: (1) Kaduna State Government material from 2017 using "Kaduna State College of Midwifery, Tudun-Wada"; (2) Kaduna State 2018 law referring to and repealing the previous "Kaduna State College of Midwifery, Tudun Wada Kaduna" law. Standard English spelling of "midwifery" is also unambiguous.',
      confidence: 'high',
    },
  },

  location_lga: {
    'Kadua': {
      field: 'location_lga',
      source_value: 'Kadua',
      display_value: 'Kaduna',
      reason: '"Kadua" is missing the final "n" — the correct state name is "Kaduna". The source_value ": Kadua" has a ": " prefix artifact from fact extraction that must be stripped before correction.',
      evidence: 'Kaduna is the correct name of the state. Standard geography knowledge. The ": " prefix is a data artifact from fact extraction.',
      confidence: 'high',
    },
    'Kakau Viilage Kaduna': {
      field: 'location_lga',
      source_value: 'Kakau Viilage Kaduna',
      display_value: 'Kakau Village Kaduna',
      reason: '"Viilage" is a clear transposition error for "Village" (letters "i" and "l" swapped). The full corrected LGA name is "Kakau Village Kaduna". The source_value ": Kakau Viilage Kaduna" has a ": " prefix artifact from fact extraction.',
      evidence: 'Standard English spelling of "village". The context ("Kaduna" as state name) confirms this is a location entry.',
      confidence: 'high',
    },
  },

  contractor: {
    'Phenart Intergrated Health Services': {
      field: 'contractor',
      source_value: 'Phenart Intergrated Health Services',
      display_value: 'Phenart Integrated Health Services',
      reason: 'Display spelling correction only. "Intergrated" → "Integrated" corrects a transposition error in an ordinary English word within the contractor name. This is NOT a verified legal/registered name correction. The source value "Phenart Intergrated Health Services" remains untouched. The trade name "Phenart" is preserved as-is; only the ordinary word "Integrated" is corrected for display.',
      evidence: 'Standard English spelling of "integrated". "Intergrated" is a commonly attested typographic error with no evidence of intentional use as a proper noun.',
      confidence: 'high',
    },
  },
}

/**
 * Get the display value for a given field and source value.
 * Returns the corrected display value if a correction exists, otherwise returns the source value unchanged.
 *
 * @param field - The field type: 'executing_mda', 'location_lga', 'contractor', or 'title'
 * @param sourceValue - The original source-derived value
 * @returns The display value (corrected if a correction exists, otherwise the source value)
 */
export function getDisplayValue(field: CorrectionField, sourceValue: string): string {
  const fieldCorrections = correctionsByField[field]
  if (!fieldCorrections) return sourceValue
  const correction = fieldCorrections[sourceValue]
  return correction ? correction.display_value : sourceValue
}

/**
 * Apply a field correction to a normalized value.
 * Looks up the correction based on the field and the normalized value.
 * Returns the corrected display value if a correction exists, otherwise returns the value unchanged.
 *
 * @param field - The field type: 'executing_mda', 'location_lga', 'contractor', or 'title'
 * @param value - The normalized or source-derived value to correct
 * @returns The corrected display value if a correction exists, otherwise the value unchanged
 */
export function getCorrectedFieldValue(field: CorrectionField, value: string | null | undefined): string | null {
  if (value == null || value === '') return value ?? null
  return getDisplayValue(field, value)
}

/**
 * Check whether a correction exists for a given field and source value.
 */
export function hasCorrection(field: CorrectionField, sourceValue: string): boolean {
  const fieldCorrections = correctionsByField[field]
  return !!(fieldCorrections && fieldCorrections[sourceValue])
}

/**
 * Get the full correction record for a given field and source value.
 * Returns null if no correction exists.
 */
export function getCorrection(field: CorrectionField, sourceValue: string): DisplayCorrection | null {
  const fieldCorrections = correctionsByField[field]
  return (fieldCorrections && fieldCorrections[sourceValue]) ?? null
}

/**
 * Get all corrections for a given field.
 */
export function getCorrectionsForField(field: CorrectionField): DisplayCorrection[] {
  const fieldCorrections = correctionsByField[field]
  return fieldCorrections ? Object.values(fieldCorrections) : []
}

/**
 * Get all corrections across all fields.
 */
export function getAllCorrections(): DisplayCorrection[] {
  const all: DisplayCorrection[] = []
  for (const field of Object.keys(correctionsByField) as CorrectionField[]) {
    const fieldCorrections = correctionsByField[field]
    if (fieldCorrections) {
      all.push(...Object.values(fieldCorrections))
    }
  }
  return all
}

/**
 * Apply corrections to a project title from evidence facts.
 * The title is derived from the 'Project title:' fact in the evidence data.
 * The ": " prefix artifact from fact extraction is stripped before correction lookup.
 *
 * @param facts - The facts array from the evidence data
 * @returns The corrected display title, or 'Untitled' if no title fact exists
 */
export function getDisplayTitle(facts: Array<{ text: string }>): string {
  const titleFact = facts.find(f => f.text.startsWith('Project title:'))
  if (!titleFact) return 'Untitled'

  // Strip the "Project title: " prefix and any leading ": " artifact
  let rawTitle = titleFact.text.slice('Project title: '.length)
  // Strip leading ": " artifact from fact extraction
  if (rawTitle.startsWith(': ')) {
    rawTitle = rawTitle.slice(2)
  } else if (rawTitle.startsWith(':')) {
    rawTitle = rawTitle.slice(1)
  }

  // Note: no title corrections are currently applied.
  // The 8 project title REJECT_CORRECTION entries are not applied yet.
  // This function returns the raw title (with ": " artifact stripped) for now.
  return rawTitle
}
