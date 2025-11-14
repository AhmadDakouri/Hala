
import React from 'react';

const prizeLevels = [
  "100", "200", "300", "500", "1,000",
  "2,000", "4,000", "8,000", "16,000", "32,000",
  "64,000", "125,000", "250,000", "500,000", "1,000,000"
].reverse();

interface ProgressBarProps {
  currentLevel: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentLevel }) => {
  return (
    <div className="w-full md:w-64 bg-black bg-opacity-50 p-4 rounded-lg border-2 border-blue-700">
      <ul className="space-y-1 text-center">
        {prizeLevels.map((level, index) => {
          const questionNumber = 15 - index;
          const isCurrent = questionNumber === currentLevel + 1;
          const isGuaranteed = questionNumber === 5 || questionNumber === 10 || questionNumber === 15;
          const isPassed = questionNumber < currentLevel + 1;

          return (
            <li
              key={level}
              className={`py-1 px-4 rounded-md transition-all duration-300 text-sm md:text-base ${
                isCurrent
                  ? 'bg-yellow-500 text-black font-bold scale-105'
                  : isPassed
                  ? 'text-gray-500'
                  : isGuaranteed
                  ? 'text-white font-bold'
                  : 'text-yellow-400'
              }`}
            >
              <span className="mr-2">{questionNumber}</span> {level}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ProgressBar;
