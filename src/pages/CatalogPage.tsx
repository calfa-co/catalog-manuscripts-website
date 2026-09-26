import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type {
  Catalog,
  CatalogRecord,
} from '../types/catalog'
import { getJerusalemCatalog } from '../services/catalog'

function displayDate(record: CatalogRecord) {
  if (record.date_display) {
    return record.date_display
  }

  if (record.date_from && record.date_to) {
    if (record.date_from === record.date_to) {
      return record.date_from
    }

    return `${record.date_from}–${record.date_to}`
  }

  return record.date_from || record.date_to || 'Unknown date'
}

export default function CatalogPage() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getJerusalemCatalog()
      .then(setCatalog)
      .catch((err: Error) => setError(err.message))
  }, [])

  const results = useMemo(() => {
    if (!catalog) return []

    const query = search.trim().toLowerCase()

    if (!query) {
      return catalog.records.slice(0, 50)
    }

    return catalog.records
      .filter((record) => {
        const values = [
          record.id,
          record.number,
          record.title,
          record.date_from,
          record.date_to,
          record.date_display,
          record.volume,
          record.source,
        ]

        return values.some((value) =>
          value?.toLowerCase().includes(query),
        )
      })
      .slice(0, 100)
  }, [catalog, search])

  if (error) {
    return (
      <main className="page">
        <p>Could not load catalogue: {error}</p>
      </main>
    )
  }

  return (
    <main className="page">
      <header className="header">
        <p className="eyebrow">CALFA</p>

        <h1>Armenian Manuscript Catalogue</h1>

        <p className="subtitle">
          Search the digitized catalogues of Armenian manuscript
          collections.
        </p>
      </header>

      <section className="search-section">
        <input
          type="search"
          placeholder="Search by ID, title, number, date…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="search-input"
        />

        {catalog && (
          <p className="count">
            Jerusalem · {catalog.record_count.toLocaleString()} records
          </p>
        )}
      </section>

      {!catalog ? (
        <p>Loading Jerusalem catalogue…</p>
      ) : (
        <section className="results">
          {results.map((record) => (
            <article className="record-card" key={record.id}>
              <div className="record-main">
                <span className="record-id">
                  {record.id}
                </span>

                <div>
                  <h2>
                    {record.title || 'Untitled manuscript'}
                  </h2>

                  <div className="metadata">
                    <span>{record.source}</span>
                    <span>No. {record.number}</span>
                    <span>{displayDate(record)}</span>
                    <span>{record.volume}</span>
                  </div>
                </div>
              </div>

              <Link
                className="view-button"
                to={`/manuscript/${record.id}`}
              >
                View record →
              </Link>
            </article>
          ))}

          {results.length === 0 && (
            <p>No manuscripts match your search.</p>
          )}
        </section>
      )}
    </main>
  )
}
