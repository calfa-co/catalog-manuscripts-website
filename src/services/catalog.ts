import type {
  Catalog,
  ManuscriptRecord,
} from '../types/catalog'

const COLLECTION_BASE_URLS = {
  J: 'https://raw.githubusercontent.com/calfa-co/catalog-manuscripts-jerusalem/main',
  W: 'https://raw.githubusercontent.com/calfa-co/catalog-manuscripts-vienna/main',
} as const

type AvailableCollectionCode =
  keyof typeof COLLECTION_BASE_URLS


function getCollectionBaseUrl(
  code: string,
): string {
  const normalizedCode =
    code.trim().toUpperCase()

  if (
    normalizedCode in
    COLLECTION_BASE_URLS
  ) {
    return COLLECTION_BASE_URLS[
      normalizedCode as AvailableCollectionCode
    ]
  }

  throw new Error(
    `Collection ${normalizedCode} is not available yet.`,
  )
}


export async function getCatalog(
  collectionCode:
    AvailableCollectionCode,
): Promise<Catalog> {
  const baseUrl =
    getCollectionBaseUrl(
      collectionCode,
    )

  const response = await fetch(
    `${baseUrl}/catalog.json`,
  )

  if (!response.ok) {
    throw new Error(
      `Failed to load ${collectionCode} catalogue (${response.status})`,
    )
  }

  return response.json()
}


export async function getJerusalemCatalog():
  Promise<Catalog> {
  return getCatalog('J')
}


export async function getViennaCatalog():
  Promise<Catalog> {
  return getCatalog('W')
}


export async function getManuscriptRecord(
  id: string,
): Promise<ManuscriptRecord> {
  const normalizedId =
    id.trim().toUpperCase()

  if (!normalizedId) {
    throw new Error(
      'Manuscript ID is required.',
    )
  }

  const collectionCode =
    normalizedId.charAt(0)

  const baseUrl =
    getCollectionBaseUrl(
      collectionCode,
    )

  const response = await fetch(
    `${baseUrl}/records/${normalizedId}.json`,
  )

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        `Manuscript ${normalizedId} was not found.`,
      )
    }

    throw new Error(
      `Failed to load manuscript ${normalizedId} (${response.status})`,
    )
  }

  return response.json()
}
