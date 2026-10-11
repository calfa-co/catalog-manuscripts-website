import type {
  Catalog,
  ManuscriptRecord,
} from '../types/catalog'

import {
  COLLECTIONS,
  getRawBaseUrl,
  isCollectionCode,
  type CollectionCode,
} from '../config/collections'


/*
 * Catalogue indexes are fetched once per session
 * and shared between pages.
 */
const catalogRequests =
  new Map<CollectionCode, Promise<Catalog>>()

export function getCatalog(
  collectionCode: CollectionCode,
): Promise<Catalog> {
  const cached =
    catalogRequests.get(collectionCode)

  if (cached) {
    return cached
  }

  const baseUrl =
    getRawBaseUrl(
      COLLECTIONS[collectionCode],
    )

  const request = fetch(
    `${baseUrl}/catalog.json`,
  ).then((response) => {
    if (!response.ok) {
      throw new Error(
        `Failed to load ${collectionCode} catalogue (${response.status})`,
      )
    }

    return response.json() as Promise<Catalog>
  })

  // Allow a retry after a failed request.
  request.catch(() =>
    catalogRequests.delete(collectionCode),
  )

  catalogRequests.set(
    collectionCode,
    request,
  )

  return request
}


/*
 * Record IDs: collection letter, then digits, Armenian or
 * Latin letters and hyphens (J2, J102ա, J3602-Ա-ԻԱ,
 * V1181-1182). Anything else, notably "/", "." or "%", is
 * rejected before building the URL: raw.githubusercontent.com
 * decodes %2F and resolves "..", so a crafted ID could
 * otherwise load another file of the data repository.
 */
const VALID_RECORD_ID =
  /^[JWVjwv][0-9A-Za-z\u0531-\u0556\u0561-\u0587-]*$/u


export async function getManuscriptRecord(
  id: string,
  signal?: AbortSignal,
): Promise<ManuscriptRecord> {
  const trimmedId = id.trim()

  if (!trimmedId) {
    throw new Error(
      'Manuscript ID is required.',
    )
  }

  if (!VALID_RECORD_ID.test(trimmedId)) {
    throw new Error(
      `Manuscript ${trimmedId} was not found.`,
    )
  }

  const collectionCode =
    trimmedId.charAt(0).toUpperCase()

  if (!isCollectionCode(collectionCode)) {
    throw new Error(
      `Collection ${collectionCode} is not available yet.`,
    )
  }

  const baseUrl =
    getRawBaseUrl(
      COLLECTIONS[collectionCode],
    )

  /*
   * Only the collection letter is case-insensitive:
   * Armenian suffixes are case-sensitive (J102ա ≠ J102Ա).
   * The fully upper-cased ID is kept as a fallback for
   * links typed in lower case (j125բ → J125Բ).
   */
  const candidates = [
    ...new Set([
      collectionCode + trimmedId.slice(1),
      trimmedId.toUpperCase(),
    ]),
  ]

  for (const candidate of candidates) {
    const response = await fetch(
      `${baseUrl}/records/${encodeURIComponent(candidate)}.json`,
      { signal },
    )

    if (response.ok) {
      return response.json()
    }

    if (response.status !== 404) {
      throw new Error(
        `Failed to load manuscript ${candidate} (${response.status})`,
      )
    }
  }

  throw new Error(
    `Manuscript ${candidates[0]} was not found.`,
  )
}
