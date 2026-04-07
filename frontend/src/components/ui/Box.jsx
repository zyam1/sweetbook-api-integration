import './Box.css';

/**
 * SweetPress Box (카드 컨테이너)
 * @param {'default'|'bordered'|'highlighted'} variant
 */
function Box({ variant = 'default', as: As = 'div', className = '', children, ...rest }) {
  const classes = ['sp-box', `sp-box--${variant}`, className].filter(Boolean).join(' ');
  return (
    <As className={classes} {...rest}>
      {children}
    </As>
  );
}

export default Box;
