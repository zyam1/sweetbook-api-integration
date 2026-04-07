import './Typography.css';

/**
 * Heading — level 1~3
 */
export function Heading({ level = 1, className = '', children, ...rest }) {
  const Tag = `h${level}`;
  const classes = ['sp-heading', `sp-heading--${level}`, className].filter(Boolean).join(' ');
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Text — body 텍스트
 * @param {'xs'|'sm'|'md'} size
 * @param {'primary'|'secondary'|'tertiary'} tone
 * @param {'regular'|'semibold'|'bold'} weight
 */
export function Text({
  size = 'sm',
  tone = 'primary',
  weight = 'regular',
  as: As = 'p',
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'sp-text',
    `sp-text--${size}`,
    tone !== 'primary' && `sp-text--${tone}`,
    weight !== 'regular' && `sp-text--${weight}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <As className={classes} {...rest}>
      {children}
    </As>
  );
}
