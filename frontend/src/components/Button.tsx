import React, {ButtonHTMLAttributes, forwardRef} from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({children, className = '', ...props}, ref) => {
    const baseStyle = 'px-4 py-2 bg-lime-green text-white rounded-md font-medium hover:bg-blue-600 transition-colors duration-200';

    return (
      <button
        ref={ref}
        className={`${baseStyle} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export default Button;