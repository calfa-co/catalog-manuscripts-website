export const SITE = {
  title: 'Armenian Manuscript Catalogues',

  subtitle:
    'A digital edition of the printed catalogues of Jerusalem, Vienna and Venice',

  url: 'https://catalogs.calfa.fr',
}

export interface HeritageProject {
  name: string
  url: string
  logo: string
  /* Two sentences. */
  description: readonly [string, string]
}

export const OTHER_CALFA_PROJECTS: HeritageProject[] = [
  {
    name: 'Digital Corpus of Armenian Inscriptions',
    url: 'https://epigraphy.calfa.fr',
    logo: 'brand/projects/epigraphy.svg',
    description: [
      'Inscription notices from the ten volumes of the Corpus of Armenian Inscriptions, machine-read by Calfa.',
      'Each notice is searchable and linked to the page of the printed volume it was read from.',
    ],
  },
  {
    name: 'Index of Digitized Armenian Manuscripts',
    url: 'https://www.armenian-manuscripts-index.com',
    logo: 'brand/projects/armenian-manuscripts-index.png',
    description: [
      'A list of Armenian manuscripts digitised by libraries and collections, with their metadata.',
      'IIIF links give direct access to the images, with tools for consultation and annotation.',
    ],
  },
  {
    name: 'Enriched Dictionaries of Classical and Modern Armenian',
    url: 'https://dictionary.calfa.fr',
    logo: 'brand/projects/dictionary.png',
    description: [
      'Dictionaries of Classical and Modern Armenian, with French and English, built on major lexicons.',
      'Entries give proper nouns, synonyms, etymology and inflection, with examples from 400 sources.',
    ],
  },
]
