const Input = ({ label, type = "text", name, value, onChange, placeholder, required = false, error }) => {
  return (
    <div style={{ marginBottom: '1.2rem', width: '100%' }}>
      {label && (
        <label style={{ 
            display: 'block', 
            marginBottom: '0.4rem', 
            fontWeight: '500', 
            color: '#374151',
            fontSize: '0.95rem'
        }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '6px',
          border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
          outline: 'none',
          fontSize: '1rem',
          transition: 'border-color 0.2s',
          backgroundColor: '#f9fafb'
        }}
        onFocus={(e) => {
           if(!error) e.target.style.border = '1px solid #22c55e';
        }}
        onBlur={(e) => {
           if(!error) e.target.style.border = '1px solid #d1d5db';
        }}
      />
      {error && <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}
    </div>
  );
};

export default Input;
