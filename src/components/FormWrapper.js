import React from 'react';

const FormWrapper = ({ children, className = '' }) => {
  return (
    <div 
      className={className}
      style={{ 
        direction: 'ltr', // Always keep forms LTR
        textAlign: 'left' // Always left align form text
      }}
    >
      {children}
    </div>
  );
};

export default FormWrapper; 