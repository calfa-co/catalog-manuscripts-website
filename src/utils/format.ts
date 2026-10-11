export const UNTITLED = 'Untitled manuscript'

export const DATE_UNKNOWN = 'Date unknown'

/*
 * Longest date shown in result rows and record headers.
 * Longer values (some catalogues copy a whole paragraph
 * into the date) are shortened; the full text remains
 * available in the "Date details" field.
 */
export const MAX_DATE_LENGTH = 60


export function formatDateRange(date: {
  display: string | null
  from: string | null
  to: string | null
}): string {
  if (date.display) {
    return date.display
  }

  if (date.from && date.to) {
    if (date.from === date.to) {
      return date.from
    }

    return `${date.from}–${date.to}`
  }

  return (
    date.from ||
    date.to ||
    DATE_UNKNOWN
  )
}


export function shortenText(
  text: string,
  maxLength: number,
): string {
  if (text.length <= maxLength) {
    return text
  }

  let cut =
    text.slice(0, maxLength)

  const lastSpace =
    cut.lastIndexOf(' ')

  if (lastSpace > maxLength * 0.6) {
    cut = cut.slice(0, lastSpace)
  }

  return `${cut.replace(/[\s,;:։.\-–—]+$/u, '')}…`
}
