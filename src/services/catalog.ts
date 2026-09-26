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
      `Failed to load catalogue: ${response.status}`,
    )
  }

  return response.json()
}

export async function getJerusalemRecord(
  id: string,
): Promise<ManuscriptRecord> {
  const response = await fetch(
    `${JERUSALEM_BASE_URL}/records/${id}.json`,
  )

  if (!response.ok) {
    throw new Error(
      `Failed to load manuscript ${id}: ${response.status}`,
    )
  }

  return response.json()
}
