import './Badge.css';

/**
 * SweetPress Badge
 * @param {'pink'|'lavender'|'yellow'|'neutral'} color
 */
function Badge({ color = 'neutral', className = '', children, ...rest }) {
  const classes = ['sp-badge', `sp-badge--${color}`, className].filter(Boolean).join(' ');
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}

export default Badge;
