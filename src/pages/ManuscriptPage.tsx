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
} from '../config/collections'

import {
  getManuscriptRecord,
} from '../services/catalog'

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

  traducteur:
    'Translator',

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

    description:
      'Catalogue identification and classification.',

    fields: [
      'reference',
      'genre_id',
    ],
  },

  {
    title: 'Physical description',

    description:
      'Material, format, script and physical characteristics.',

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

    description:
      'Information concerning production, copying and historical ownership.',

    fields: [
      'details_date',
      'lieu_copie',
      'copiste',
      'traducteur',
      'possesseur',
      'commanditaire',
      'relieur',
    ],
  },

  {
    title: 'Decoration',

    description:
      'Illumination, decoration and other visual elements.',

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

    description:
      'Texts, titles and colophons recorded in the manuscript.',

    fields: [
      'contenu',
      'titres_texte',
      'colophon',
    ],
  },

  {
    title: 'Additional information',

    description:
      'Additional catalogue notes and observations.',

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
  if (record.date.display) {
    return record.date.display
  }

  if (
    record.date.from &&
    record.date.to
  ) {
    if (
      record.date.from ===
      record.date.to
    ) {
      return record.date.from
    }

    return (
      `${record.date.from}–` +
      `${record.date.to}`
    )
  }

  return (
    record.date.from ||
    record.date.to ||
    'Date unknown'
  )
}


/* =========================================================
   GitHub correction report
   ========================================================= */

function buildIssueUrl(
  record: ManuscriptRecord,
  repository: string,
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

${formatFieldValue(
  options?.value,
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

export default function ManuscriptPage() {
  const { id } =
    useParams()

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


  /* =======================================================
     Load manuscript
     ======================================================= */

  useEffect(() => {
    if (!id) {
      return
    }

    setRecord(null)
    setError(null)
    setActiveImageUrl(undefined)

    getManuscriptRecord(id)
      .then(setRecord)
      .catch((err: Error) =>
        setError(err.message),
      )
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

        <div className="error-state">

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

        <div className="loading-state">
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
    )

  const collectionLogo =
    `${import.meta.env.BASE_URL}${collection.logo}`


  /* =======================================================
     URLs
     ======================================================= */

  const genericIssueUrl =
    buildIssueUrl(
      record,
      collection.repository,
      {
        imageUrl:
          activeImageUrl,
      },
    )

  const sourceRecordUrl =
    `${collection.repository}` +
    `/blob/main/records/` +
    `${record.id}.json`


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


        <h1>
          {record.title ||
            'Untitled manuscript'}
        </h1>


        <div className="manuscript-summary">

          <div className="summary-item">

            <span className="summary-label">
              Date
            </span>

            <strong>
              {formatDate(record)}
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

              <p className="section-kicker">
                Original source
              </p>

              <h2>
                No source scan linked
              </h2>

              <p>
                No catalogue image is
                currently associated with
                this manuscript record.
              </p>

            </div>
          )}

        </div>


        {/* =================================================
            Extracted record
            ================================================= */}

        <div className="verification-record-column">

          <div className="verification-heading">

            <p className="section-kicker">
              Extracted data
            </p>

            <h2>
              Catalogue record
            </h2>

            <p>
              Compare the structured
              transcription below with the
              original catalogue scan.
              If you find an error, report
              the specific field directly.
            </p>

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

                    <p>
                      {
                        section.description
                      }
                    </p>

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


                            <dd>
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

                <p>
                  Additional structured
                  information contained in
                  the source record.
                </p>

              </div>


              <dl className="field-list">

                {additionalFields.map(
                  ([key, value]) => {
                    const issueUrl =
                      buildIssueUrl(
                        record,
                        collection.repository,
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
                          >
                            Report
                          </a>

                        </dt>


                        <dd>
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

        <div>

          <p className="section-kicker">
            Community corrections
          </p>

          <h2>
            Found something wrong?
          </h2>

          <p>
            Compare the extracted metadata
            with the original catalogue scan
            and report transcription errors,
            typos, incorrect metadata or
            other catalogue problems.
          </p>

        </div>


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