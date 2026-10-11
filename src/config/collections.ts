export type CollectionCode = 'J' | 'W' | 'V'

export interface CollectionConfig {
  code: CollectionCode
  name: string
  institution: string
  /* Two sentences, shown on two lines on the collection page. */
  description: readonly [string, string]
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
    description: [
      'The manuscripts of the Armenian Patriarchate of Jerusalem are kept at the Monastery of St James, in the Armenian Quarter of the Old City.',
      'The records are compiled from the eleven volumes of the Grand Catalogue of St James Manuscripts by Archbishop Norayr Bogharian (1966–1991).',
    ],
    logo: 'brand/jerusalem.gif',
    repository:
      'https://github.com/calfa-co/catalog-manuscripts-jerusalem',
    branch: 'main',
  },

  W: {
    code: 'W',
    name: 'Vienna',
    institution: 'Mekhitarist Congregation of Vienna',
    description: [
      'The Mekhitarist Congregation, settled in Vienna since 1811, keeps its collection of Armenian manuscripts in the library of its monastery.',
      'The records are compiled from the three volumes of the printed catalogue of this collection, the first published by Jacobus Dashian in 1895.',
    ],
    logo: 'brand/vienna.png',
    repository:
      'https://github.com/calfa-co/catalog-manuscripts-vienna',
    branch: 'main',
  },

  V: {
    code: 'V',
    name: 'Venice',
    institution: 'Mekhitarist Congregation of Venice',
    description: [
      'The Mekhitarist Congregation has kept its library on the island of San Lazzaro, in the Venetian lagoon, since 1717.',
      'The records are compiled from the Grand Catalogue of Armenian Manuscripts of the Mekhitarist Library, in eight volumes (1914–1998).',
    ],
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
