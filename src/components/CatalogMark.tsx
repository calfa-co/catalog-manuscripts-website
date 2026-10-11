/*
 * Catalogue mark: three codex spines on a shelf, one for
 * each printed catalogue (Jerusalem, Vienna, Venice).
 */
export default function CatalogMark({
  size = 28,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      >
        <rect x="5" y="7" width="6" height="19" rx="0.8" />
        <rect x="21" y="9" width="6" height="17" rx="0.8" />
      </g>

      <rect
        x="13"
        y="4"
        width="6"
        height="22"
        rx="0.8"
        fill="#8a2a1e"
        stroke="#8a2a1e"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      <path
        d="M5 11h6M5 22h6M21 13h6M21 22h6"
        stroke="currentColor"
        strokeWidth="1.2"
      />

      <path
        d="M13 8.5h6M13 22h6"
        stroke="#fff"
        strokeWidth="1.2"
      />

      <path
        d="M2.5 28h27"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
