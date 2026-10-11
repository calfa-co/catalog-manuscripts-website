export type CollectionCode = 'J' | 'W' | 'V'

export interface CollectionConfig {
  code: CollectionCode
  name: string
  institution: string
  logo: string
  repository: string
  branch: string
}

export const COLLECTIONS: Record<
  CollectionCode,
  CollectionConfig
> = {
  J: {
    code: 'J',
    name: 'Jerusalem',
    institution: 'Armenian Patriarchate of Jerusalem',
    logo: 'brand/jerusalem.gif',
    repository:
      'https://github.com/calfa-co/catalog-manuscripts-jerusalem',
    branch: 'main',
  },

  W: {
    code: 'W',
    name: 'Vienna',
    institution: 'Mekhitarist Congregation of Vienna',
    logo: 'brand/vienna.png',
    repository:
      'https://github.com/calfa-co/catalog-manuscripts-vienna',
    branch: 'main',
  },

  V: {
    code: 'V',
    name: 'Venice',
    institution: 'Mekhitarist Congregation of Venice',
    logo: 'brand/venice.png',
    repository:
      'https://github.com/calfa-co/catalog-manuscripts-venice',
    branch: 'master',
  },
}

export const COLLECTION_CODES =
  Object.keys(COLLECTIONS) as CollectionCode[]

export function isCollectionCode(
  code: string,
): code is CollectionCode {
  return code in COLLECTIONS
}

export function getCollectionByCode(
  code?: string,
): CollectionConfig | undefined {
  const normalizedCode =
    code?.trim().toUpperCase() ?? ''

  return isCollectionCode(normalizedCode)
    ? COLLECTIONS[normalizedCode]
    : undefined
}

/*
 * Raw file base URL for a collection's data repository,
 * e.g. https://raw.githubusercontent.com/calfa-co/catalog-manuscripts-venice/master
 */
export function getRawBaseUrl(
  collection: CollectionConfig,
): string {
  return (
    collection.repository.replace(
      'https://github.com/',
      'https://raw.githubusercontent.com/',
    ) + `/${collection.branch}`
  )
}

export function getSourceRecordUrl(
  collection: CollectionConfig,
  recordId: string,
): string {
  return (
    `${collection.repository}/blob/` +
    `${collection.branch}/records/` +
    `${encodeURIComponent(recordId)}.json`
  )
}
