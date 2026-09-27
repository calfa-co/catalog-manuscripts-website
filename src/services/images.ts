const IMAGE_BASE_URL =
  'https://armenian-catalogs.s3.eu-west-par.io.cloud.ovh.net'

export function getJerusalemImageUrl(
  volume: string,
  notice: string,
  file: string,
): string {
  return (
    `${IMAGE_BASE_URL}/manuscripts/jerusalem/` +
    `${encodeURIComponent(volume)}/` +
    `${encodeURIComponent(notice)}/` +
    `${encodeURIComponent(file)}`
  )
}
