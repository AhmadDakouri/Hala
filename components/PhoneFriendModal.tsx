
import React, { useEffect, useState } from 'react';

interface PhoneFriendModalProps {
  options: string[];
  correctAnswer: string;
  onClose: () => void;
}

const PhoneFriendModal: React.FC<PhoneFriendModalProps> = ({ options, correctAnswer, onClose }) => {
  const [isCalling, setIsCalling] = useState(true);
  const [friendAnswer, setFriendAnswer] = useState('');

  useEffect(() => {
    const callTimer = setTimeout(() => {
      const isCorrect = Math.random() < 0.95;
      let answer = '';
      if (isCorrect) {
        answer = correctAnswer;
      } else {
        const wrongOptions = options.filter(opt => opt !== correctAnswer);
        answer = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
      }
      setFriendAnswer(answer);
      setIsCalling(false);
    }, 8000);

    return () => clearTimeout(callTimer);
  }, [options, correctAnswer]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg p-6 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">اتصال بصديق</h2>
        {isCalling ? (
          <div>
            <p className="text-lg mb-4">...جاري الاتصال</p>
            <div className="flex items-center justify-center space-x-1">
                <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-lg mb-4">صديقك يعتقد أن الإجابة هي:</p>
            <p className="text-2xl font-bold bg-blue-900 py-4 px-6 rounded-lg border border-blue-500">
              {friendAnswer}
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-yellow-500 text-black font-bold py-2 px-6 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              شكرًا، إغلاق
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneFriendModal;
