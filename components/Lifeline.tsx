
import React from 'react';

interface LifelineProps {
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  label: string;
}

const Lifeline: React.FC<LifelineProps> = ({ icon, onClick, disabled, label }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`relative flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-full border-2 transition-all duration-300 transform hover:scale-105 ${
        disabled
          ? 'bg-red-800 border-red-600 cursor-not-allowed'
          : 'bg-blue-900 border-blue-500 hover:bg-blue-800'
      }`}
    >
      {disabled && (
        <svg
          className="absolute w-full h-full text-red-400 opacity-70"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <div className={`text-2xl md:text-4xl ${disabled ? 'text-gray-500' : 'text-yellow-400'}`}>
        {icon}
      </div>
    </button>
  );
};

export default Lifeline;
