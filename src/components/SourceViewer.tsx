import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import type {
  ManuscriptImage,
} from '../types/catalog'

import {
  getManuscriptImageUrl,
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

  const dialogRef =
    useRef<HTMLDivElement | null>(null)

  const closeButtonRef =
    useRef<HTMLButtonElement | null>(null)

  /*
   * Indexes of scans that failed to load
   * (main image or thumbnail).
   */
  const [failedIndexes, setFailedIndexes] =
    useState<ReadonlySet<number>>(
      () => new Set(),
    )

  function markFailed(index: number) {
    setFailedIndexes((previous) =>
      previous.has(index)
        ? previous
        : new Set(previous).add(index),
    )
  }

  const urls = useMemo(
    () =>
      images.map((image) =>
        getManuscriptImageUrl(
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

  const imageError =
    failedIndexes.has(currentIndex)

  useEffect(() => {
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

  /*
   * Lightbox: move focus into the dialog, lock page scroll,
   * and give focus back to the enlarged scan on close.
   */
  useEffect(() => {
    if (!zoomed) {
      return
    }

    const previouslyFocused =
      document.activeElement as HTMLElement | null

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow = 'hidden'

    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow =
        previousOverflow

      previouslyFocused?.focus()
    }
  }, [zoomed])

  useEffect(() => {
    if (!zoomed) {
      return
    }

    function trapFocus(
      event: KeyboardEvent,
    ) {
      const dialog = dialogRef.current

      if (!dialog) {
        return
      }

      const focusable = [
        ...dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled)',
        ),
      ]

      if (focusable.length === 0) {
        return
      }

      const first = focusable[0]
      const last =
        focusable[focusable.length - 1]

      const active =
        document.activeElement

      if (
        !active ||
        !dialog.contains(active)
      ) {
        event.preventDefault()
        first.focus()
      } else if (
        event.shiftKey &&
        active === first
      ) {
        event.preventDefault()
        last.focus()
      } else if (
        !event.shiftKey &&
        active === last
      ) {
        event.preventDefault()
        first.focus()
      }
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === 'Tab') {
        trapFocus(event)
      }

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
      <section
        className="source-viewer"
        aria-label="Catalogue scan"
      >

        <div className="source-viewer-heading">

          <h2>
            Catalogue scan
          </h2>

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
                  markFailed(currentIndex)
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
                  {failedIndexes.has(index) ? (
                    <span
                      className="source-thumbnail-missing"
                      aria-hidden="true"
                    />
                  ) : (
                    <img
                      src={urls[index]}
                      alt=""
                      loading="lazy"
                      onError={() =>
                        markFailed(index)
                      }
                    />
                  )}

                  <span>
                    {image.file}
                  </span>
                </button>
              ),
            )}

          </div>
        )}

      </section>

      {zoomed && (
        <div
          ref={dialogRef}
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Catalogue image viewer"
          onClick={() =>
            setZoomed(false)
          }
        >

          <button
            ref={closeButtonRef}
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
