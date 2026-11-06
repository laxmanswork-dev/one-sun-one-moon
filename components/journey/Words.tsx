import { Fragment } from 'react'

/**
 * Splits a line into word spans carrying their index as `--i`, so a stylesheet
 * can stagger their entrance. Screen readers get the line as one phrase.
 */
export function Words({ text, className, start = 0 }: { text: string; className?: string; start?: number }) {
  const words = text.split(' ')
  return (
    <>
      <span className="visually-hidden">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <Fragment key={i}>
            <span className={className} style={{ '--i': start + i } as React.CSSProperties}>
              {word}
            </span>
            {i < words.length - 1 && ' '}
          </Fragment>
        ))}
      </span>
    </>
  )
}
