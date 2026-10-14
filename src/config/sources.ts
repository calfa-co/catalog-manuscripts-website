import type { CollectionCode } from './collections'

/*
 * The printed catalogues the records are compiled from, as
 * read off their title pages. Digitised copies are those of
 * the Fundamental Scientific Library of the National Academy
 * of Sciences of Armenia (served over http only).
 */

export const DIGITAL_LIBRARY = {
  name:
    'Fundamental Scientific Library of the National Academy of Sciences of Armenia',
  url: 'http://serials.flib.sci.am/matenagitutyun/test/index.html',
}

export interface CatalogueVolume {
  volume: number
  compiler: string
  year: number
  /* Digitised copy, when one is available. */
  url?: string
  note?: string
}

export interface PrintedCatalogue {
  collection: CollectionCode
  /* Armenian title, as printed. */
  title: string
  /* Parallel title, as printed. */
  parallelTitle?: string
  /* English rendering, when the volumes have no parallel title. */
  translation?: string
  imprint: string
  volumes: readonly CatalogueVolume[]
}

function digitisedCopy(path: string): string {
  return `http://serials.flib.sci.am/matenagitutyun/${path}/book/content.html`
}

export const PRINTED_CATALOGUES: readonly PrintedCatalogue[] = [
  {
    collection: 'J',
    title: 'Մայր ցուցակ ձեռագրաց Սրբոց Յակոբեանց',
    parallelTitle: 'Grand Catalogue of St. James Manuscripts',
    imprint: 'Jerusalem: Armenian Convent Printing Press, 1966–1991',
    volumes: [
      { volume: 1, compiler: 'Norair Bogharian', year: 1966, url: digitisedCopy('PoxaryanH.1') },
      { volume: 2, compiler: 'Norair Bogharian', year: 1967, url: digitisedCopy('PoxaryanH.2') },
      { volume: 3, compiler: 'Norair Bogharian', year: 1968, url: digitisedCopy('PoxaryanH.3') },
      { volume: 4, compiler: 'Norair Bogharian', year: 1969, url: digitisedCopy('PoxaryanH.4') },
      { volume: 5, compiler: 'Norair Bogharian', year: 1971, url: digitisedCopy('PoxaryanH.5') },
      { volume: 6, compiler: 'Norair Bogharian', year: 1972, url: digitisedCopy('PoxaryanH.6') },
      { volume: 7, compiler: 'Norair Bogharian', year: 1974, url: digitisedCopy('mayrcucak-7') },
      { volume: 8, compiler: 'Norair Bogharian', year: 1977, url: digitisedCopy('Mayr%20cucak%20h8-1977') },
      { volume: 9, compiler: 'Norair Bogharian', year: 1978, url: digitisedCopy('Mayr%20cucak%20h9-1978') },
      { volume: 10, compiler: 'Norair Bogharian', year: 1990, url: digitisedCopy('PoxaryanH.10') },
      { volume: 11, compiler: 'Norair Bogharian', year: 1991, url: digitisedCopy('Mayr%20cucak%20h11-1991') },
    ],
  },

  {
    collection: 'W',
    title: 'Ցուցակ հայերէն ձեռագրաց Մխիթարեան մատենադարանին ի Վիեննա',
    parallelTitle: 'Katalog der armenischen Handschriften in der Mechitharisten-Bibliothek zu Wien',
    imprint: 'Vienna: Mechitharisten-Buchdruckerei, 1895–1983',
    volumes: [
      { volume: 1, compiler: 'Jacobus Dashian', year: 1895, url: digitisedCopy('Cucak%20hayeren%20ceragray%201895') },
      { volume: 2, compiler: 'Hamazasp Oskian', year: 1963, url: digitisedCopy('Cucak%20dzeragrac1963') },
      { volume: 3, compiler: 'Augustin L. Szekula', year: 1983, url: digitisedCopy('cucak%20ceragras.h3.1984') },
    ],
  },

  {
    collection: 'V',
    title: 'Մայր ցուցակ հայերէն ձեռագրաց մատենադարանին Մխիթարեանց ի Վենետիկ',
    translation: 'Grand Catalogue of the Armenian Manuscripts of the Mekhitarist Library in Venice',
    imprint: 'Venice: San Lazzaro, 1914–1998',
    volumes: [
      { volume: 1, compiler: 'Barsegh Sargisian', year: 1914, url: digitisedCopy('venetikN1') },
      { volume: 2, compiler: 'Barsegh Sargisian', year: 1924, url: digitisedCopy('venetikN2') },
      { volume: 3, compiler: 'Barsegh Sargisian, Grigor Sargsian', year: 1966, url: digitisedCopy('venetikN3') },
      { volume: 4, compiler: 'Sahak Chemchemian', year: 1993, url: digitisedCopy('venetikN4') },
      { volume: 5, compiler: 'Sahak Chemchemian', year: 1995, url: digitisedCopy('venetikN5') },
      { volume: 6, compiler: 'Sahak Chemchemian', year: 1996, url: digitisedCopy('venetikN6') },
      { volume: 7, compiler: 'Sahak Chemchemian', year: 1996 },
      { volume: 8, compiler: 'Sahak Chemchemian', year: 1998, url: digitisedCopy('venetikN8'), note: 'Not yet in this edition' },
    ],
  },
]
