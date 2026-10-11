/*
 * Search normalisation.
 *
 * - case-insensitive (Armenian included);
 * - the ligature և is matched as եւ;
 * - Armenian accent and punctuation marks written over
 *   letters (՛ ՜ ՝ ՞ ՟, U+055B–U+055F) are ignored;
 * - all whitespace is ignored, so that titles printed
 *   letter-spaced ("Ճ Ա Ռ Ը Ն Տ Ի Ր") are found by the
 *   word ("ճառընտիր").
 *
 * Applied to both the query and the record text, this only
 * adds matches: anything that matched before still matches.
 */
export function normalizeForSearch(
  value: string,
): string {
  return value
    .normalize('NFC')
    .toLowerCase()
    .replace(/և/g, 'եւ')
    .replace(/[՛-՟]/g, '')
    .replace(/\s+/g, '')
}

/*
 * Field separator for the precomputed search text, so that
 * a query never matches across two fields.
 */
export const SEARCH_FIELD_SEPARATOR = '\u0001'
