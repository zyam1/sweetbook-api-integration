import './Badge.css';

// variant: 'lavender' | 'pink' | 'yellow' | 'subtle'
export default function Badge({ variant = 'subtle', className = '', children, ...rest }) {
  return (
    <span className={`ant-badge ${variant}${className ? ' ' + className : ''}`} {...rest}>
      {children}
    </span>
  );
}
