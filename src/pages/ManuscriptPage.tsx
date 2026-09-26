import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getJerusalemRecord } from '../services/catalog'
import type { ManuscriptRecord } from '../types/catalog'

const FIELD_LABELS: Record<string, string> = {
  numero: 'Catalogue number',
  no_notice: 'Notice',
  titre: 'Title',
  date_debut: 'Date from',
  date_fin: 'Date to',
  details_date: 'Date details',
  lieu_copie: 'Place of copying',
  reference: 'Reference',
  genre_id: 'Genre',
  nb_pages: 'Pages',
  dimensions: 'Dimensions',
  mise_en_page: 'Layout',
  details_ecriture: 'Script',
  types_cahiers: 'Quires',
  matiere_principale_id: 'Primary material',
  details_matiere: 'Material details',
  nb_lignes: 'Lines',
  reliure: 'Binding',
  etat_conservation: 'Condition',
  copiste: 'Scribe',
  possesseur: 'Owner',
  commanditaire: 'Commissioner',
  enlumineur: 'Illuminator',
  relieur: 'Binder',
  page_garde_parchemin: 'Parchment flyleaf',
  lettrines: 'Decorated initials',
  initiales: 'Initials',
  enluminures_marginales: 'Marginal illuminations',
  images: 'Illustrations',
  table_canons_1: 'Canon tables I',
  table_canons_2: 'Canon tables II',
  titres_texte: 'Text titles',
  pages_blanches: 'Blank pages',
  colophon: 'Colophon',
  informations_diverses: 'Additional information',
  decorations: 'Decoration',
  traducteur: 'Translator',
  encre: 'Ink',
  contenu: 'Contents',
  champ_libre: 'Additional notes',
}

function formatDate(record: ManuscriptRecord) {
  if (record.date.display) {
    return record.date.display
  }

  if (record.date.from && record.date.to) {
    if (record.date.from === record.date.to) {
      return record.date.from
    }

    return `${record.date.from}–${record.date.to}`
  }

  return record.date.from || record.date.to || 'Unknown'
}

export default function ManuscriptPage() {
  const { id } = useParams()

  const [record, setRecord] =
    useState<ManuscriptRecord | null>(null)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    getJerusalemRecord(id)
      .then(setRecord)
      .catch((err: Error) => setError(err.message))
  }, [id])

  const fields = useMemo(() => {
    if (!record) return []

    return Object.entries(record.fields).filter(
      ([key, value]) =>
        key !== 'validee' &&
        value !== null &&
        value !== '' &&
        value !== false,
    )
  }, [record])

  if (error) {
    return (
      <main className="page">
        <Link to="/" className="back-link">
          ← Back to catalogue
        </Link>

        <p>{error}</p>
      </main>
    )
  }

  if (!record) {
    return (
      <main className="page">
        <p>Loading manuscript…</p>
      </main>
    )
  }

  return (
    <main className="page manuscript-page">
      <Link to="/" className="back-link">
        ← Back to catalogue
      </Link>

      <header className="manuscript-header">
        <div className="manuscript-id">
          {record.id}
        </div>

        <p className="eyebrow">
          {record.source} · No. {record.number}
        </p>

        <h1>
          {record.title || 'Untitled manuscript'}
        </h1>

        <div className="manuscript-summary">
          <span>
            <strong>Date:</strong> {formatDate(record)}
          </span>

          <span>
            <strong>Volume:</strong> {record.volume}
          </span>
        </div>
      </header>

      <section className="record-section">
        <h2>Catalogue record</h2>

        <dl className="field-list">
          {fields.map(([key, value]) => (
            <div
              className="field-row"
              key={key}
            >
              <dt>
                {FIELD_LABELS[key] || key}
              </dt>

              <dd>
                {String(value)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {record.images.length > 0 && (
        <section className="record-section">
          <h2>Source catalogue pages</h2>

          <p className="section-note">
            Catalogue page images will be connected to the
            external image storage in a later step.
          </p>

          <div className="source-pages">
            {record.images.map((image) => (
              <span
                className="source-page"
                key={`${image.volume}-${image.file}`}
              >
                {image.volume} / {image.file}
              </span>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
