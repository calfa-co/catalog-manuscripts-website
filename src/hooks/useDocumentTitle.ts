import { useEffect } from 'react'

import { SITE } from '../config/site'

const MAX_PART_LENGTH = 60

function shorten(part: string): string {
  if (part.length <= MAX_PART_LENGTH) {
    return part
  }

  return `${part.slice(0, MAX_PART_LENGTH - 1).trimEnd()}…`
}

/*
 * Sets the browser tab title as
 * "<part> — <part> — Armenian Manuscript Catalogues".
 */
export function useDocumentTitle(
  ...parts: Array<string | null | undefined>
) {
  const title = [
    ...parts
      .filter(
        (part): part is string =>
          Boolean(part),
      )
      .map(shorten),
    SITE.title,
  ].join(' — ')

  useEffect(() => {
    document.title = title
  }, [title])
}
