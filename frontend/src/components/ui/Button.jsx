import './Button.css';

/**
 * SweetPress Button
 * @param {'primary'|'secondary'|'ghost'|'accent'} variant
 * @param {'sm'|'md'|'lg'} size
 */
function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const classes = ['sp-btn', `sp-btn--${variant}`, `sp-btn--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}

export default Button;
