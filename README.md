# Armenian Manuscript Catalogues

A digital edition of the printed catalogues of Armenian manuscripts of Jerusalem, Vienna and Venice, published by [Calfa](https://calfa.fr) at **https://catalogs.calfa.fr**.

The catalogues were machine-read (OCR and vision-language models developed by Calfa) and turned into structured records. Each record can be compared with the scan of the printed catalogue page, and errors can be reported field by field.

## Data

The website holds no data. It reads, at runtime, the `catalog.json` index and the `records/<ID>.json` files of three repositories:

| Collection | Code | Repository | Branch |
|---|---|---|---|
| Armenian Patriarchate of Jerusalem | `J` | [calfa-co/catalog-manuscripts-jerusalem](https://github.com/calfa-co/catalog-manuscripts-jerusalem) | `main` |
| Mekhitarist Congregation of Vienna | `W` | [calfa-co/catalog-manuscripts-vienna](https://github.com/calfa-co/catalog-manuscripts-vienna) | `main` |
| Mekhitarist Congregation of Venice | `V` | [calfa-co/catalog-manuscripts-venice](https://github.com/calfa-co/catalog-manuscripts-venice) | `master` |

Repository URLs and branches are declared once in `src/config/collections.ts`. Catalogue scans are served from an object storage bucket (`src/services/images.ts`).

Corrections are collected as GitHub issues on the data repository of the collection concerned.

## Development

Requires Node 22.

```sh
npm ci
npm run dev       # local server
npm run build     # type-check and build to dist/
npm run lint
npm run preview   # serve the production build
```

## Structure

```
src/
  config/       collections (repositories, branches, logos) and site constants
  services/     data and scan URL access
  pages/        catalogue, record and About pages
  components/   header, footer, scan viewer, catalogue mark, Calfa credit
  utils/        date formatting and search normalisation
public/         favicon, Open Graph image, institution and Calfa logos
```

Routes use a hash router: `/#/`, `/#/collection/{J|W|V}`, `/#/manuscript/<ID>`, `/#/about`.

## Deployment

Every push to `main` is built and published to GitHub Pages by `.github/workflows/deploy-pages.yml`. The custom domain is set in `public/CNAME`.
