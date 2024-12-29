// src/components/ui/button.js
export const Button = ({ children, className, onClick, type, disabled }) => (
    <button
      className={`button ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
  