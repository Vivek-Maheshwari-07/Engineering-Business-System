const Button = ({ children, type = "button", onClick, disabled = false, loading = false, variant = "primary", style = {} }) => {
  const baseStyle = {
    width: '100%',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    border: 'none',
    transition: 'background-color 0.2s, transform 0.1s',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: disabled || loading ? 0.7 : 1,
    ...style
  };

  const variants = {
    primary: {
      backgroundColor: '#16a34a',
      color: 'white',
    },
    secondary: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db'
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#16a34a',
      border: '2px solid #16a34a'
    }
  };

  const combinedStyle = { ...baseStyle, ...variants[variant] };

  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled || loading} 
      style={combinedStyle}
      onMouseOver={(e) => {
         if(!disabled && !loading && variant === 'primary') e.currentTarget.style.backgroundColor = '#15803d';
         if(!disabled && !loading && variant === 'outline') e.currentTarget.style.backgroundColor = '#f0fdf4';
      }}
      onMouseOut={(e) => {
         if(!disabled && !loading && variant === 'primary') e.currentTarget.style.backgroundColor = '#16a34a';
         if(!disabled && !loading && variant === 'outline') e.currentTarget.style.backgroundColor = 'transparent'; 
      }}
    >
      {loading ? 'Processing...' : children}
    </button>
  );
};

export default Button;
