import { Reveal } from './Reveal';

/**
 * Section header rendered as the declaration it truly is: every section of
 * this site renders an export from src/data/profile.js, and `lineno` is that
 * export's real line number in the file.
 */
export function SectionDecl({ name, lineno, title, titleId }) {
  return (
    <Reveal className="decl">
      <p className="decl-line" aria-hidden="true">
        <span className="decl-lineno">profile.js:{lineno}</span>
        <code className="decl-code">
          <span className="tok-kw">export const</span>{' '}
          <span className="tok-en">{name}</span>
          <span className="tok-pn"> = [</span>
        </code>
      </p>
      <h2 className="decl-title" id={titleId}>
        {title}
      </h2>
    </Reveal>
  );
}

/** Closes the section's array — pairs with SectionDecl. */
export function SectionClose() {
  return (
    <span className="decl-close" aria-hidden="true">
      ];
    </span>
  );
}
