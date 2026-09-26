export interface CatalogRecord {
  id: string
  source: string
  number: string
  title: string | null
  date_from: string | null
  date_to: string | null
  date_display: string | null
  volume: string
  record: string
}

export interface Catalog {
  collection: string
  collection_code: string
  record_count: number
  records: CatalogRecord[]
}

export interface ManuscriptImage {
  volume: string
  file: string
}

export interface ManuscriptRecord {
  id: string
  source: string
  collection_code: string
  number: string
  notice: string
  volume: string
  title: string | null

  date: {
    from: string | null
    to: string | null
    display: string | null
  }

  fields: Record<string, string | boolean | null>

  images: ManuscriptImage[]

  provenance?: {
    repository?: string
    source_file?: string
    pipeline_version?: string
  }
}
