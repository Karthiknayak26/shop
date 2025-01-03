// src/components/ui/input.js
export const Input = ({ type, value, onChange, placeholder, className, required }) => (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`input ${className}`}
      required={required}
    />
  );
  