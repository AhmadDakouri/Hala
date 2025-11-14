
import React, { useEffect, useState } from 'react';

interface AudienceVoteModalProps {
  options: string[];
  correctAnswer: string;
  onClose: () => void;
}

const AudienceVoteModal: React.FC<AudienceVoteModalProps> = ({ options, correctAnswer, onClose }) => {
  const [percentages, setPercentages] = useState<number[]>([]);
  const [isVoting, setIsVoting] = useState(true);

  useEffect(() => {
    const votingTimer = setTimeout(() => {
      const isCorrect = Math.random() < 0.95;
      const finalPercentages = [0, 0, 0, 0];
      let remaining = 100;

      const correctIndex = options.indexOf(correctAnswer);

      if (isCorrect) {
        const correctVote = Math.floor(Math.random() * 30) + 50; // 50-79%
        finalPercentages[correctIndex] = correctVote;
        remaining -= correctVote;
      } else {
        // Pick a random wrong answer to be highest
        let wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIndex);
        const highestWrongIndex = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
        const wrongVote = Math.floor(Math.random() * 30) + 40; // 40-69%
        finalPercentages[highestWrongIndex] = wrongVote;
        remaining -= wrongVote;
      }
      
      // Distribute remaining %
      for (let i = 0; i < 4; i++) {
        if (finalPercentages[i] === 0) {
          const vote = Math.floor(Math.random() * (remaining / 2));
          finalPercentages[i] = vote;
          remaining -= vote;
        }
      }
      finalPercentages[finalPercentages.findIndex(p => p === 0)] += remaining; // Add any leftover

      setPercentages(finalPercentages);
      setIsVoting(false);
    }, 8000);

    return () => clearTimeout(votingTimer);
  }, [options, correctAnswer]);

  const barColors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg p-6 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">تصويت الجمهور</h2>
        {isVoting ? (
          <div>
            <p className="text-lg mb-4">...يتم التصويت</p>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          </div>
        ) : (
          <div>
            <div className="flex justify-around items-end h-48 space-x-2">
              {percentages.map((p, index) => (
                <div key={index} className="flex flex-col items-center w-1/4">
                  <div className="w-full bg-gray-700 rounded-t-lg h-full flex items-end">
                    <div
                      className={`${barColors[index]} rounded-t-lg w-full transition-all duration-1000 ease-out`}
                      style={{ height: `${p}%` }}
                    ></div>
                  </div>
                  <span className="mt-2 font-bold text-lg">{p}%</span>
                  <span className="text-sm text-gray-300">{['A', 'B', 'C', 'D'][index]}</span>
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              className="mt-6 bg-yellow-500 text-black font-bold py-2 px-6 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              إغلاق
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudienceVoteModal;
