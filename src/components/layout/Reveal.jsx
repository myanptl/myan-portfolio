import { useScrollReveal } from '../../hooks/useScrollReveal';

/**
 * Wraps children in a scroll-revealed element. `delay` staggers siblings.
 */
export function Reveal({ children, as: Tag = 'div', delay = 0, className = '', ...rest }) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal ${isVisible ? 'is-visible' : ''} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
