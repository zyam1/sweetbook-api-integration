import './Input.css';

/**
 * SweetPress Input
 * @param {boolean} error
 */
function Input({ error = false, className = '', type = 'text', ...rest }) {
  const classes = ['sp-input', error && 'sp-input--error', className].filter(Boolean).join(' ');
  return <input type={type} className={classes} {...rest} />;
}

export default Input;
