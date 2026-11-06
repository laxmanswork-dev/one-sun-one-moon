/**
 * Renders schema.org data. The payload is built from our own constants, and
 * `<` is escaped so no value can close the script element early.
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
