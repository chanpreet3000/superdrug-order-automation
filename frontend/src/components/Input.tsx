import React, {InputHTMLAttributes, forwardRef} from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({label, id, ...props}, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="flex flex-col text-soft-white">
        <label
          htmlFor={inputId}
          className="mb-1 text-sm font-medium"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className="px-3 py-2 text-sm bg-deep-black-2 border border-gray-300 rounded-md shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          {...props}
        />
      </div>
    );
  }
);

export default Input;