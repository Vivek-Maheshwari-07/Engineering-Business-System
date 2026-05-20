const Button = ({ children, type = "button", onClick, disabled = false, loading = false, variant = "primary", style = {}, className = "" }) => {
  const baseStyle = {
    width: '100%',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...style
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-black)',
    },
    secondary: {
      backgroundColor: 'var(--color-primary-light)',
      color: 'var(--color-black)',
    },
    danger: {
      backgroundColor: 'var(--color-danger)',
      color: 'var(--color-white)',
    },
    outline: {
      backgroundColor: 'var(--color-white)',
      color: 'var(--color-black)',
    }
  };

  const combinedStyle = { ...baseStyle, ...variants[variant] };

  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled || loading} 
      style={combinedStyle}
      className={`brutal-btn ${className}`}
    >
      {loading ? 'Processing...' : children}
    </button>
  );
};

export default Button;
