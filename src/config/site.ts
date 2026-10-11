export const SITE = {
  title: 'Armenian Manuscript Catalogues',

  subtitle:
    'A digital edition of the printed catalogues of Jerusalem, Vienna and Venice',

  url: 'https://catalogs.calfa.fr',
}

export interface HeritageProject {
  name: string
  url: string
}

export const OTHER_CALFA_PROJECTS: HeritageProject[] = [
  {
    name: 'Digital Corpus of Armenian Inscriptions',
    url: 'https://epigraphy.calfa.fr',
  },
  {
    name: 'Index of Digitized Armenian Manuscripts',
    url: 'https://www.armenian-manuscripts-index.com',
  },
]
