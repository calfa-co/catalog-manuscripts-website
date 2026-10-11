const IMAGE_BASE_URL =
  'https://armenian-catalogs.s3.eu-west-par.io.cloud.ovh.net'

const COLLECTION_FOLDERS: Record<string, string> = {
  Jerusalem: 'jerusalem',
  Vienna: 'vienna',
  Venice: 'venice',
}

/*
 * Volumes are named <Collection>_<volume>, e.g. Jerusalem_V1.
 * An unknown prefix falls back to its lower-cased, encoded form
 * instead of throwing; a missing image is then handled by the
 * viewer.
 */
function getCollectionPath(
  volume: string,
): string {
  const prefix =
    volume.split('_')[0]

  return (
    COLLECTION_FOLDERS[prefix] ??
    encodeURIComponent(prefix.toLowerCase())
  )
}

export function getManuscriptImageUrl(
  volume: string,
  notice: string,
  file: string,
): string {
  const collection =
    getCollectionPath(volume)

  return (
    `${IMAGE_BASE_URL}/manuscripts/${collection}/` +
    `${encodeURIComponent(volume)}/` +
    `${encodeURIComponent(notice)}/` +
    `${encodeURIComponent(file)}`
  )
}
