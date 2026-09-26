import type {
  Catalog,
  ManuscriptRecord,
} from '../types/catalog'

const JERUSALEM_BASE_URL =
  'https://raw.githubusercontent.com/calfa-co/catalog-manuscripts-jerusalem/main'

export async function getJerusalemCatalog(): Promise<Catalog> {
  const response = await fetch(
    `${JERUSALEM_BASE_URL}/catalog.json`,
  )

  if (!response.ok) {
    throw new Error(
      `Failed to load catalogue (${response.status})`,
    )
  }

  return response.json()
}

export async function getManuscriptRecord(
  id: string,
): Promise<ManuscriptRecord> {
  const normalizedId =
    id.trim().toUpperCase()

  const collectionCode =
    normalizedId.charAt(0)

  if (collectionCode !== 'J') {
    throw new Error(
      `Collection ${collectionCode} is not available yet.`,
    )
  }

  const response = await fetch(
    `${JERUSALEM_BASE_URL}/records/${normalizedId}.json`,
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