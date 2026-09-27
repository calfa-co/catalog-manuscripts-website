import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import type {
  ManuscriptImage,
} from '../types/catalog'

import {
  getJerusalemImageUrl,
} from '../services/images'

interface SourceViewerProps {
  volume: string
  notice: string
  images: ManuscriptImage[]

  onActiveImageChange?: (
    image: ManuscriptImage,
    url: string,
  ) => void
}

export default function SourceViewer({
  volume,
  notice,
  images,
  onActiveImageChange,
}: SourceViewerProps) {
  const [currentIndex, setCurrentIndex] =
    useState(0)

  const [zoomed, setZoomed] =
    useState(false)

  const [imageError, setImageError] =
    useState(false)

  const urls = useMemo(
    () =>
      images.map((image) =>
        getJerusalemImageUrl(
          image.volume || volume,
          notice,
          image.file,
        ),
      ),
    [images, notice, volume],
  )

  const currentImage =
    images[currentIndex]

  const currentUrl =
    urls[currentIndex]

  useEffect(() => {
    setCurrentIndex(0)
  }, [notice, volume, images])

  useEffect(() => {
    setImageError(false)

    if (
      currentImage &&
      currentUrl
    ) {
      onActiveImageChange?.(
        currentImage,
        currentUrl,
      )
    }
  }, [
    currentIndex,
    currentImage,
    currentUrl,
    onActiveImageChange,
  ])

  useEffect(() => {
    if (!zoomed) {
      return
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === 'Escape') {
        setZoomed(false)
      }

      if (
        event.key === 'ArrowLeft' &&
        currentIndex > 0
      ) {
        setCurrentIndex(
          (index) => index - 1,
        )
      }

      if (
        event.key === 'ArrowRight' &&
        currentIndex <
          images.length - 1
      ) {
        setCurrentIndex(
          (index) => index + 1,
        )
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () =>
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )
  }, [
    zoomed,
    currentIndex,
    images.length,
  ])

  function previousImage() {
    if (currentIndex === 0) {
      return
    }

    setCurrentIndex(
      (index) => index - 1,
    )
  }

  function nextImage() {
    if (
      currentIndex ===
      images.length - 1
    ) {
      return
    }

    setCurrentIndex(
      (index) => index + 1,
    )
  }

  if (images.length === 0) {
    return null
  }

  return (
    <>
      <aside className="source-viewer">

        <div className="source-viewer-heading">

          <div>
            <p className="section-kicker">
              Original source
            </p>

            <h2>
              Catalogue scan
            </h2>
          </div>

          <span className="source-page-counter">
            {currentIndex + 1} /{' '}
            {images.length}
          </span>

        </div>

        <div className="source-image-frame">

          {!imageError ? (
            <button
              type="button"
              className="source-image-button"
              onClick={() =>
                setZoomed(true)
              }
              aria-label="Enlarge catalogue page"
            >
              <img
                src={currentUrl}
                alt={`Catalogue page ${currentImage.file}`}
                className="source-main-image"
                onError={() =>
                  setImageError(true)
                }
              />

              <span className="source-zoom-hint">
                Click to enlarge
              </span>
            </button>
          ) : (
            <div className="source-image-error">

              <strong>
                Image unavailable
              </strong>

              <p>
                This scan may not yet
                have public access.
              </p>

              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open image URL ↗
              </a>

            </div>
          )}

        </div>

        <div className="source-image-details">

          <div>
            <span className="source-detail-label">
              File
            </span>

            <strong>
              {currentImage.file}
            </strong>
          </div>

          <div>
            <span className="source-detail-label">
              Source
            </span>

            <strong>
              {currentImage.volume}
            </strong>
          </div>

        </div>

        <div className="source-viewer-actions">

          <button
            type="button"
            onClick={previousImage}
            disabled={
              currentIndex === 0
            }
          >
            ← Previous
          </button>

          <a
            href={currentUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open full image ↗
          </a>

          <button
            type="button"
            onClick={nextImage}
            disabled={
              currentIndex ===
              images.length - 1
            }
          >
            Next →
          </button>

        </div>

        {images.length > 1 && (
          <div className="source-thumbnails">

            {images.map(
              (image, index) => (
                <button
                  type="button"
                  key={`${image.volume}-${image.file}`}
                  className={
                    index === currentIndex
                      ? 'source-thumbnail source-thumbnail-active'
                      : 'source-thumbnail'
                  }
                  onClick={() =>
                    setCurrentIndex(index)
                  }
                  aria-label={`Open ${image.file}`}
                >
                  <img
                    src={urls[index]}
                    alt=""
                    loading="lazy"
                  />

                  <span>
                    {image.file}
                  </span>
                </button>
              ),
            )}

          </div>
        )}

      </aside>

      {zoomed && (
        <div
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Catalogue image viewer"
          onClick={() =>
            setZoomed(false)
          }
        >

          <button
            type="button"
            className="lightbox-close"
            onClick={() =>
              setZoomed(false)
            }
            aria-label="Close image viewer"
          >
            ×
          </button>

          <button
            type="button"
            className="lightbox-nav lightbox-nav-left"
            onClick={(event) => {
              event.stopPropagation()
              previousImage()
            }}
            disabled={
              currentIndex === 0
            }
            aria-label="Previous image"
          >
            ‹
          </button>

          <img
            src={currentUrl}
            alt={`Catalogue page ${currentImage.file}`}
            className="lightbox-image"
            onClick={(event) =>
              event.stopPropagation()
            }
          />

          <button
            type="button"
            className="lightbox-nav lightbox-nav-right"
            onClick={(event) => {
              event.stopPropagation()
              nextImage()
            }}
            disabled={
              currentIndex ===
              images.length - 1
            }
            aria-label="Next image"
          >
            ›
          </button>

          <div className="lightbox-caption">
            {currentImage.volume}
            {' · '}
            {currentImage.file}
            {' · '}
            {currentIndex + 1}/
            {images.length}
          </div>

        </div>
      )}
    </>
  )
}
