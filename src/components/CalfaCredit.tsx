/*
 * "powered by Calfa" credit, as on epigraphy.calfa.fr.
 */
export default function CalfaCredit({
  className,
}: {
  className?: string
}) {
  const logo =
    `${import.meta.env.BASE_URL}brand/calfa-logo.png`

  return (
    <a
      className={
        className
          ? `calfa-link ${className}`
          : 'calfa-link'
      }
      href="https://calfa.fr"
      target="_blank"
      rel="noopener"
    >
      <span>powered by</span>

      <img
        src={logo}
        alt="Calfa"
        width="53"
        height="22"
      />
    </a>
  )
}
