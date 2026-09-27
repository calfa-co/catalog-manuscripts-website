const IMAGE_BASE_URL =
  'https://armenian-catalogs.s3.eu-west-par.io.cloud.ovh.net'

function getCollectionPath(
  volume: string,
): string {
  if (volume.startsWith('Jerusalem_')) {
    return 'jerusalem'
  }

  if (volume.startsWith('Vienna_')) {
    return 'vienna'
  }

  if (volume.startsWith('Venice_')) {
    return 'venice'
  }

  throw new Error(
    `Unknown manuscript image volume: ${volume}`,
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
