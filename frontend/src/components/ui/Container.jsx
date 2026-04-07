import './Container.css';

/**
 * 페이지 너비 제약 래퍼.
 * @param {'sm'|'md'|'lg'} size
 */
function Container({ size = 'lg', as: As = 'div', className = '', children, ...rest }) {
  const classes = ['sp-container', `sp-container--${size}`, className].filter(Boolean).join(' ');
  return (
    <As className={classes} {...rest}>
      {children}
    </As>
  );
}

export default Container;
