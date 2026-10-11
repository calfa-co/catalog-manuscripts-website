import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import SourceViewer from '../components/SourceViewer'

import {
  getCollectionByCode,
  getSourceRecordUrl,
} from '../config/collections'

import {
  getManuscriptRecord,
} from '../services/catalog'

import {
  useDocumentTitle,
} from '../hooks/useDocumentTitle'

import {
  formatDateRange,
  MAX_DATE_LENGTH,
  shortenText,
  UNTITLED,
} from '../utils/format'

import type {
  ManuscriptRecord,
} from '../types/catalog'


/* =========================================================
   Field labels
   ========================================================= */

const FIELD_LABELS: Record<
  string,
  string
> = {
  reference: 'Reference',
  genre_id: 'Genre',

  nb_pages: 'Pages',
  dimensions: 'Dimensions',
  mise_en_page: 'Layout',
  details_ecriture: 'Script',
  types_cahiers: 'Quires',

  matiere_principale_id:
    'Primary material',

  details_matiere:
    'Material details',

  nb_lignes: 'Lines',
  reliure: 'Binding',

  etat_conservation:
    'Condition',

  encre: 'Ink',

  page_garde_parchemin:
    'Parchment flyleaf',

  pages_blanches:
    'Blank pages',

  details_date:
    'Date details',

  lieu_copie:
    'Place of copying',

  copiste: 'Scribe',

  auteur: 'Author',

  traducteur:
    'Translator',

  correcteur:
    'Corrector',

  possesseur:
    'Owner',

  commanditaire:
    'Commissioner',

  relieur:
    'Binder',

  enlumineur:
    'Illuminator',

  lettrines:
    'Decorated initials',

  initiales:
    'Initials',

  enluminures_marginales:
    'Marginal illumination',

  images:
    'Illustrations',

  table_canons_1:
    'Canon tables I',

  table_canons_2:
    'Canon tables II',

  decorations:
    'Decoration',

  contenu:
    'Contents',

  titres_texte:
    'Text titles',

  colophon:
    'Colophon',

  informations_diverses:
    'Additional information',

  champ_libre:
    'Additional notes',
}


/* =========================================================
   Record sections
   ========================================================= */

const SECTIONS = [
  {
    title: 'Manuscript',

    fields: [
      'reference',
      'genre_id',
    ],
  },

  {
    title: 'Physical description',

    fields: [
      'nb_pages',
      'dimensions',
      'matiere_principale_id',
      'details_matiere',
      'mise_en_page',
      'nb_lignes',
      'details_ecriture',
      'types_cahiers',
      'encre',
      'reliure',
      'etat_conservation',
      'page_garde_parchemin',
      'pages_blanches',
    ],
  },

  {
    title: 'Production & history',

    fields: [
      'details_date',
      'lieu_copie',
      'copiste',
      'auteur',
      'traducteur',
      'correcteur',
      'possesseur',
      'commanditaire',
      'relieur',
    ],
  },

  {
    title: 'Decoration',

    fields: [
      'enlumineur',
      'lettrines',
      'initiales',
      'enluminures_marginales',
      'images',
      'table_canons_1',
      'table_canons_2',
      'decorations',
    ],
  },

  {
    title: 'Contents',

    fields: [
      'contenu',
      'titres_texte',
      'colophon',
    ],
  },

  {
    title: 'Additional information',

    fields: [
      'informations_diverses',
      'champ_libre',
    ],
  },
]


/* =========================================================
   Internal fields not shown in the generic section
   ========================================================= */

const HIDDEN_FIELDS =
  new Set([
    'validee',
    'numero',
    'no_notice',
    'titre',
    'date_debut',
    'date_fin',
  ])


/* =========================================================
   Helpers
   ========================================================= */

function hasValue(
  value: unknown,
): boolean {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    value === false
  ) {
    return false
  }

  if (
    Array.isArray(value) &&
    value.length === 0
  ) {
    return false
  }

  return true
}


function formatFieldValue(
  value: unknown,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return ''
  }

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        String(item),
      )
      .join('\n')
  }

  if (
    typeof value === 'object'
  ) {
    return JSON.stringify(
      value,
      null,
      2,
    )
  }

  return String(value)
}


function formatDate(
  record: ManuscriptRecord,
): string {
  return formatDateRange(record.date)
}


/* =========================================================
   GitHub correction report
   ========================================================= */

/*
 * GitHub rejects issue URLs longer than about 8,000
 * characters. Long field values are therefore quoted in
 * part, with a link to the full source record.
 */
const QUOTE_LENGTHS = [800, 300, 0]

const MAX_ISSUE_URL_LENGTH = 7000

function quoteFieldValue(
  value: string,
  maxLength: number,
  sourceUrl: string,
): string {
  if (value.length <= maxLength) {
    return value
  }

  const note =
    `_Value truncated (${value.length.toLocaleString('en')} characters). ` +
    `Full value in the source record: ${sourceUrl}_`

  if (maxLength === 0) {
    return note
  }

  return (
    `${value.slice(0, maxLength).trimEnd()} […]` +
    `\n\n${note}`
  )
}

function buildIssueUrl(
  record: ManuscriptRecord,
  repository: string,
  sourceUrl: string,
  options?: {
    field?: string
    value?: unknown
    imageUrl?: string
  },
): string {
  let url = ''

  for (const quoteLength of QUOTE_LENGTHS) {
    url = buildIssueUrlWithQuote(
      record,
      repository,
      sourceUrl,
      quoteLength,
      options,
    )

    if (url.length <= MAX_ISSUE_URL_LENGTH) {
      break
    }
  }

  return url
}

function buildIssueUrlWithQuote(
  record: ManuscriptRecord,
  repository: string,
  sourceUrl: string,
  quoteLength: number,
  options?: {
    field?: string
    value?: unknown
    imageUrl?: string
  },
): string {
  const field =
    options?.field

  const fieldLabel =
    field
      ? FIELD_LABELS[field] ||
        field
      : undefined

  const title =
    fieldLabel
      ? `[${record.id}] Correction: ${fieldLabel}`
      : `[${record.id}] Catalogue correction`

  let body = `## Manuscript

**Record:** ${record.id}
**Collection:** ${record.source}
**Catalogue number:** ${record.number}
**Volume:** ${record.volume}
`

  if (fieldLabel) {
    body += `
## Field

**Field:** ${fieldLabel}

**Current extracted value:**

${quoteFieldValue(
  formatFieldValue(options?.value),
  quoteLength,
  sourceUrl,
)}
`
  } else {
    body += `
## Field

Which field contains the problem?
`
  }

  if (options?.imageUrl) {
    body += `
## Source catalogue image

${options.imageUrl}
`
  }

  body += `
## Suggested correction

Please provide the corrected text or value.

## Explanation

Add any supporting information or explanation here.

## Record URL

${window.location.href}
`

  const params =
    new URLSearchParams({
      title,
      body,
    })

  return (
    `${repository}/issues/new?` +
    params.toString()
  )
}


/* =========================================================
   Page
   ========================================================= */

/*
 * The record view is keyed by ID so that opening another
 * record starts from a fresh state (no stale record, error
 * or selected scan from the previous one).
 */
export default function ManuscriptPage() {
  const { id = '' } =
    useParams()

  return (
    <ManuscriptView
      key={id}
      id={id}
    />
  )
}


function ManuscriptView({
  id,
}: {
  id: string
}) {

  const [
    record,
    setRecord,
  ] =
    useState<ManuscriptRecord | null>(
      null,
    )

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  /*
   * This always contains the scan
   * currently selected in SourceViewer.
   */
  const [
    activeImageUrl,
    setActiveImageUrl,
  ] =
    useState<string | undefined>(
      undefined,
    )


  useDocumentTitle(
    record
      ? [
          record.id,
          record.title,
        ]
          .filter(Boolean)
          .join(' · ')
      : id,
  )


  /* =======================================================
     Load manuscript
     ======================================================= */

  useEffect(() => {
    const controller =
      new AbortController()

    getManuscriptRecord(
      id,
      controller.signal,
    )
      .then(setRecord)
      .catch((err: Error) => {
        if (!controller.signal.aborted) {
          setError(err.message)
        }
      })

    return () => controller.abort()
  }, [id])


  /* =======================================================
     Stable SourceViewer callback
     ======================================================= */

  const handleActiveImageChange =
    useCallback(
      (
        _image: unknown,
        url: string,
      ) => {
        setActiveImageUrl(url)
      },
      [],
    )


  /* =======================================================
     Known structured fields
     ======================================================= */

  const knownFields =
    useMemo(() => {
      const fields =
        new Set<string>()

      SECTIONS.forEach(
        (section) => {
          section.fields.forEach(
            (field) =>
              fields.add(field),
          )
        },
      )

      return fields
    }, [])


  /* =======================================================
     Any fields not explicitly mapped above
     ======================================================= */

  const additionalFields =
    useMemo(() => {
      if (!record) {
        return []
      }

      return Object.entries(
        record.fields,
      ).filter(
        ([key, value]) =>
          !knownFields.has(key) &&
          !HIDDEN_FIELDS.has(key) &&
          hasValue(value),
      )
    }, [
      record,
      knownFields,
    ])


  /* =======================================================
     Error
     ======================================================= */

  if (error) {
    return (
      <main className="page">

        <Link
          to="/"
          className="back-link"
        >
          ← Back to catalogue
        </Link>

        <div
          className="error-state"
          role="alert"
        >

          <strong>
            Unable to open manuscript
          </strong>

          <p>
            {error}
          </p>

        </div>

      </main>
    )
  }


  /* =======================================================
     Loading
     ======================================================= */

  if (!record) {
    return (
      <main className="page">

        <div
          className="loading-state"
          role="status"
        >
          Loading manuscript…
        </div>

      </main>
    )
  }


  /* =======================================================
     Collection configuration
     ======================================================= */

  const collection =
    getCollectionByCode(
      record.collection_code,
    ) ??
    getCollectionByCode(
      record.id.charAt(0),
    )

  if (!collection) {
    return (
      <main className="page">

        <Link
          to="/"
          className="back-link"
        >
          ← Back to catalogue
        </Link>

        <div
          className="error-state"
          role="alert"
        >

          <strong>
            Unable to open manuscript
          </strong>

          <p>
            Unknown collection {record.collection_code}.
          </p>

        </div>

      </main>
    )
  }

  const collectionLogo =
    `${import.meta.env.BASE_URL}${collection.logo}`


  /* =======================================================
     URLs
     ======================================================= */

  const sourceRecordUrl =
    getSourceRecordUrl(
      collection,
      record.id,
    )

  const genericIssueUrl =
    buildIssueUrl(
      record,
      collection.repository,
      sourceRecordUrl,
      {
        imageUrl:
          activeImageUrl,
      },
    )

  const fullDate =
    formatDate(record)

  const shortDate =
    shortenText(
      fullDate,
      MAX_DATE_LENGTH,
    )


  /* =======================================================
     Render
     ======================================================= */

  return (
    <main className="page manuscript-page">

      {/* ===================================================
          Back
          =================================================== */}

      <Link
        to="/"
        className="back-link"
      >
        ← Back to catalogue
      </Link>


      {/* ===================================================
          Manuscript header
          =================================================== */}

      <header className="manuscript-header">

        <div className="collection-heading">

          <div className="manuscript-heading-copy">

            <div className="record-identity">

              <span className="manuscript-id">
                {record.id}
              </span>

              <span className="collection-name">
                {collection.name}
              </span>

            </div>

            <p className="eyebrow">
              {collection.institution}
              {' · '}
              Manuscript No.{' '}
              {record.number}
            </p>

          </div>


          <div className="collection-logo-wrapper">

            <img
              src={collectionLogo}
              alt={
                collection.institution
              }
              className="collection-logo"
            />

          </div>

        </div>


        <h1
          lang={
            record.title
              ? 'hy'
              : undefined
          }
        >
          {record.title ||
            UNTITLED}
        </h1>


        <div className="manuscript-summary">

          <div className="summary-item">

            <span className="summary-label">
              Date
            </span>

            <strong
              lang="hy"
              title={
                shortDate === fullDate
                  ? undefined
                  : fullDate
              }
            >
              {shortDate}
            </strong>

          </div>


          <div className="summary-item">

            <span className="summary-label">
              Catalogue number
            </span>

            <strong>
              {record.number}
            </strong>

          </div>


          <div className="summary-item">

            <span className="summary-label">
              Volume
            </span>

            <strong>
              {record.volume}
            </strong>

          </div>


          <div className="summary-item">

            <span className="summary-label">
              Notice
            </span>

            <strong>
              {record.notice}
            </strong>

          </div>

        </div>


        <div className="record-actions">

          <a
            href={genericIssueUrl}
            target="_blank"
            rel="noreferrer"
            className="primary-action"
          >
            Report a typo or error
          </a>

          <a
            href={sourceRecordUrl}
            target="_blank"
            rel="noreferrer"
            className="secondary-action"
          >
            View source JSON ↗
          </a>

        </div>

      </header>


      {/* ===================================================
          Verification workspace
          =================================================== */}

      <div className="verification-layout">


        {/* =================================================
            Source scan
            ================================================= */}

        <div className="verification-source-column">

          {record.images &&
          record.images.length > 0 ? (
            <SourceViewer
              key={record.id}
              volume={
                record.volume
              }
              notice={
                record.notice
              }
              images={
                record.images
              }
              onActiveImageChange={
                handleActiveImageChange
              }
            />
          ) : (
            <div className="source-viewer source-viewer-empty">

              <h2>
                No source scan linked
              </h2>

            </div>
          )}

        </div>


        {/* =================================================
            Extracted record
            ================================================= */}

        <div className="verification-record-column">

          <div className="verification-heading">

            <h2>
              Catalogue record
            </h2>

          </div>


          {/* ===============================================
              Standard sections
              =============================================== */}

          {SECTIONS.map(
            (section) => {
              const visibleFields =
                section.fields.filter(
                  (key) =>
                    hasValue(
                      record.fields[
                        key
                      ],
                    ),
                )

              if (
                visibleFields.length ===
                0
              ) {
                return null
              }

              return (
                <section
                  className="record-section"
                  key={section.title}
                >

                  <div className="record-section-heading">

                    <h2>
                      {section.title}
                    </h2>

                  </div>


                  <dl className="field-list">

                    {visibleFields.map(
                      (key) => {
                        const value =
                          record.fields[
                            key
                          ]

                        const issueUrl =
                          buildIssueUrl(
                            record,
                            collection.repository,
                            sourceRecordUrl,
                            {
                              field:
                                key,

                              value,

                              /*
                               * This is the important part:
                               * the CURRENT scan is attached
                               * to the correction report.
                               */
                              imageUrl:
                                activeImageUrl,
                            },
                          )

                        return (
                          <div
                            className="field-row"
                            key={key}
                          >

                            <dt>

                              <span>
                                {FIELD_LABELS[
                                  key
                                ] ||
                                  key}
                              </span>


                              <a
                                href={
                                  issueUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="field-report-link"
                                aria-label={`Report an error in ${
                                  FIELD_LABELS[
                                    key
                                  ] ||
                                  key
                                }`}
                                title={`Report an error in ${
                                  FIELD_LABELS[
                                    key
                                  ] ||
                                  key
                                }`}
                              >
                                Report
                              </a>

                            </dt>


                            <dd lang="hy">
                              {formatFieldValue(
                                value,
                              )}
                            </dd>

                          </div>
                        )
                      },
                    )}

                  </dl>

                </section>
              )
            },
          )}


          {/* ===============================================
              Unmapped fields
              =============================================== */}

          {additionalFields.length >
            0 && (
            <section className="record-section">

              <div className="record-section-heading">

                <h2>
                  Other catalogue data
                </h2>

              </div>


              <dl className="field-list">

                {additionalFields.map(
                  ([key, value]) => {
                    const issueUrl =
                      buildIssueUrl(
                        record,
                        collection.repository,
                        sourceRecordUrl,
                        {
                          field:
                            key,

                          value,

                          imageUrl:
                            activeImageUrl,
                        },
                      )

                    return (
                      <div
                        className="field-row"
                        key={key}
                      >

                        <dt>

                          <span>
                            {FIELD_LABELS[
                              key
                            ] ||
                              key}
                          </span>


                          <a
                            href={
                              issueUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="field-report-link"
                            aria-label={`Report an error in ${
                              FIELD_LABELS[
                                key
                              ] ||
                              key
                            }`}
                            title={`Report an error in ${
                              FIELD_LABELS[
                                key
                              ] ||
                              key
                            }`}
                          >
                            Report
                          </a>

                        </dt>


                        <dd lang="hy">
                          {formatFieldValue(
                            value,
                          )}
                        </dd>

                      </div>
                    )
                  },
                )}

              </dl>

            </section>
          )}

        </div>

      </div>


      {/* ===================================================
          General correction section
          =================================================== */}

      <section className="correction-section">

        <p>
          Corrections are collected as
          issues on GitHub.
        </p>


        <a
          href={genericIssueUrl}
          target="_blank"
          rel="noreferrer"
          className="report-button"
        >
          Report a typo or error
        </a>

      </section>

    </main>
  )
}