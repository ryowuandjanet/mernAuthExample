import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

function PasswordInput({
  value,
  onChange,
  placeholder = '密碼',
  name = 'password',
  required = true,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        {showPassword ? (
          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
        ) : (
          <EyeIcon className="h-5 w-5 text-gray-400" />
        )}
      </button>
    </div>
  );
}

export default PasswordInput;
