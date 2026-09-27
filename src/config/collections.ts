export type CollectionCode = 'J' | 'W' | 'V'

export interface CollectionConfig {
  code: CollectionCode
  name: string
  institution: string
  description: string
  logo: string
  repository: string
  available: boolean
}

export const COLLECTIONS: Record<
  CollectionCode,
  CollectionConfig
> = {
  J: {
    code: 'J',
    name: 'Jerusalem',
    institution: 'Armenian Patriarchate of Jerusalem',
    description:
      'Catalogue of Armenian manuscripts preserved in Jerusalem.',
    logo: 'brand/jerusalem.gif',
    repository:
      'https://github.com/calfa-co/catalog-manuscripts-jerusalem',
    available: true,
  },

  W: {
    code: 'W',
    name: 'Vienna',
    institution: 'Mekhitarist Congregation of Vienna',
    description:
      'Catalogue of Armenian manuscripts preserved in Vienna.',
    logo: 'brand/vienna.png',
    repository:
      'https://github.com/calfa-co/catalog-manuscripts-vienna',
    available: true,
  },

  V: {
    code: 'V',
    name: 'Venice',
    institution: 'Mekhitarist Congregation of Venice',
    description:
      'Catalogue of Armenian manuscripts preserved in Venice.',
    logo: 'brand/venice.png',
    repository:
      'https://github.com/calfa-co/catalog-manuscripts-venice',
    available: true,
  },
}

export function getCollectionByCode(
  code?: string,
): CollectionConfig {
  if (code && code in COLLECTIONS) {
    return COLLECTIONS[code as CollectionCode]
  }

  return COLLECTIONS.J
}