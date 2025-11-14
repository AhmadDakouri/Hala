import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Question, GameState, Lifelines } from './types';
import { generateQuestions } from './services/geminiService';
import ProgressBar from './components/ProgressBar';
import Lifeline from './components/Lifeline';
import AudienceVoteModal from './components/AudienceVoteModal';
import PhoneFriendModal from './components/PhoneFriendModal';
import { useAudio } from './hooks/useAudio';

const TOTAL_QUESTIONS = 15;

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.StartScreen);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [lifelines, setLifelines] = useState<Lifelines>({ fiftyFifty: false, audience: false, phone: false, switch: false });
    const [disabledAnswers, setDisabledAnswers] = useState<string[]>([]);
    const [isAudienceModalOpen, setIsAudienceModalOpen] = useState(false);
    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Audio Hooks with relative paths for better deployment compatibility
    const { play: playBg, stop: stopBg } = useAudio('./sounds/background.mp3', true);
    const { play: playSelect } = useAudio('./sounds/select.mp3');
    const { play: playCorrect } = useAudio('./sounds/correct.mp3');
    const { play: playIncorrect } = useAudio('./sounds/incorrect.mp3');
    const { play: playSuspense, stop: stopSuspense } = useAudio('./sounds/suspense.mp3', true);

    const loadQuestions = useCallback(async (count: number, existing: Question[]) => {
        const existingTexts = existing.map(q => q.question);
        const newQuestions = await generateQuestions(count, existingTexts);
        setQuestions(prev => [...prev, ...newQuestions]);
    }, []);

    const startGame = useCallback(async () => {
        setError(null);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setLifelines({ fiftyFifty: false, audience: false, phone: false, switch: false });
        setDisabledAnswers([]);
        setGameState(GameState.Loading);
        playBg();
        try {
            await loadQuestions(5, []); // Load first 5 questions
            setGameState(GameState.Playing);
            loadQuestions(TOTAL_QUESTIONS - 5, []); // Load the rest in background
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "حدث خطأ غير متوقع.";
            setError(errorMessage);
            setGameState(GameState.StartScreen);
            stopBg();
        }
    }, [loadQuestions, playBg, stopBg]);

    const handleAnswerSelect = useCallback((answer: string) => {
        if (gameState !== GameState.Playing) return;

        playSelect();
        setSelectedAnswer(answer);
        setGameState(GameState.AnswerSelected);

        setTimeout(() => {
            const isCorrect = answer === questions[currentQuestionIndex].correctAnswer;
            if (isCorrect) {
                playCorrect();
                setGameState(GameState.AnswerCorrect);
                setTimeout(() => {
                    if (currentQuestionIndex === TOTAL_QUESTIONS - 1) {
                        setGameState(GameState.Win);
                        stopBg();
                    } else {
                        setCurrentQuestionIndex(prev => prev + 1);
                        setSelectedAnswer(null);
                        setDisabledAnswers([]);
                        setGameState(GameState.Playing);
                    }
                }, 3000);
            } else {
                playIncorrect();
                setGameState(GameState.AnswerIncorrect);
                setTimeout(() => {
                    setGameState(GameState.GameOver);
                    stopBg();
                }, 5000);
            }
        }, 3000);
    }, [gameState, currentQuestionIndex, questions, playSelect, playCorrect, playIncorrect, stopBg]);

    const useFiftyFifty = () => {
        if (lifelines.fiftyFifty) return;
        const currentQ = questions[currentQuestionIndex];
        const wrongAnswers = currentQ.options.filter(opt => opt !== currentQ.correctAnswer);
        const toDisable = [wrongAnswers[0], wrongAnswers[1]];
        setDisabledAnswers(toDisable);
        setLifelines(prev => ({ ...prev, fiftyFifty: true }));
    };
    
    const useAudience = () => {
        if (lifelines.audience) return;
        playSuspense();
        setIsAudienceModalOpen(true);
        setLifelines(prev => ({ ...prev, audience: true }));
    };

    const usePhone = () => {
        if (lifelines.phone) return;
        playSuspense();
        setIsPhoneModalOpen(true);
        setLifelines(prev => ({ ...prev, phone: true }));
    };

    const useSwitch = () => {
        if (lifelines.switch || currentQuestionIndex < 7) return;
        setLifelines(prev => ({ ...prev, switch: true }));
        if (questions.length > currentQuestionIndex + 1) {
            // Replace current question with the next one by moving current to the end
            const newQuestions = [...questions];
            const switchedQuestion = newQuestions.splice(currentQuestionIndex, 1)[0];
            newQuestions.push(switchedQuestion);
            setQuestions(newQuestions);
            setSelectedAnswer(null);
            setDisabledAnswers([]);
        } else {
            // fetch a new one if buffer is empty
            loadQuestions(1, questions);
        }
    };
    
    const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

    if (gameState === GameState.StartScreen) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-blue-900 p-4">
                {error && (
                    <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded-lg relative mb-6 max-w-lg text-center shadow-lg" role="alert">
                        <strong className="font-bold block text-lg">حدث خطأ</strong>
                        <span className="block mt-1">{error}</span>
                    </div>
                )}
                <h1 className="text-5xl md:text-7xl font-bold text-yellow-400 mb-4">مليونير اللغة الألمانية</h1>
                <p className="text-xl text-gray-300 mb-8">هل أنت مستعد لاختبار معلوماتك في اللغة الألمانية؟</p>
                <button
                    onClick={startGame}
                    className="bg-yellow-500 text-black font-bold py-4 px-10 rounded-lg text-2xl hover:bg-yellow-600 transition-transform transform hover:scale-105"
                >
                    ابدأ اللعبة
                </button>
            </div>
        );
    }

    if (gameState === GameState.Loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-blue-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
                    <p className="text-2xl mt-4">...جاري تحضير الأسئلة</p>
                </div>
            </div>
        );
    }
    
    if (gameState === GameState.GameOver || gameState === GameState.Win) {
         return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-blue-900 p-4">
                <h1 className="text-5xl md:text-7xl font-bold text-yellow-400 mb-4">
                    {gameState === GameState.Win ? "تهانينا! لقد فزت بالمليون!" : "انتهت اللعبة"}
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                    {gameState === GameState.Win ? "لقد أظهرت إتقانًا رائعًا للغة الألمانية." : `لقد وصلت إلى السؤال ${currentQuestionIndex + 1}.`}
                </p>
                <button
                    onClick={startGame}
                    className="bg-yellow-500 text-black font-bold py-4 px-10 rounded-lg text-2xl hover:bg-yellow-600 transition-transform transform hover:scale-105"
                >
                    العب مرة أخرى
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-b from-gray-900 to-blue-900 p-2 md:p-4">
            {isAudienceModalOpen && currentQuestion && (
                <AudienceVoteModal
                    options={currentQuestion.options}
                    correctAnswer={currentQuestion.correctAnswer}
                    onClose={() => { stopSuspense(); setIsAudienceModalOpen(false); }}
                />
            )}
            {isPhoneModalOpen && currentQuestion && (
                <PhoneFriendModal
                    options={currentQuestion.options}
                    correctAnswer={currentQuestion.correctAnswer}
                    onClose={() => { stopSuspense(); setIsPhoneModalOpen(false); }}
                />
            )}

            <header className="w-full flex justify-between items-center p-2">
                <div className="flex gap-2 md:gap-4">
                    <Lifeline icon="50:50" onClick={useFiftyFifty} disabled={lifelines.fiftyFifty} label="حذف إجابتين"/>
                    <Lifeline icon="📊" onClick={useAudience} disabled={lifelines.audience} label="تصويت الجمهور"/>
                    <Lifeline icon="📞" onClick={usePhone} disabled={lifelines.phone} label="اتصال بصديق"/>
                    {currentQuestionIndex >= 7 && (
                      <Lifeline icon="🔄" onClick={useSwitch} disabled={lifelines.switch} label="تبديل السؤال"/>
                    )}
                </div>
                <div className="hidden md:block">
                    <ProgressBar currentLevel={currentQuestionIndex} />
                </div>
            </header>

            <main className="w-full flex flex-col items-center justify-center flex-grow my-4">
                {currentQuestion ? (
                    <div className="w-full max-w-4xl">
                        <div className="bg-black bg-opacity-50 border-2 border-blue-700 rounded-lg p-4 md:p-6 mb-6 text-center">
                            <h2 className="text-xl md:text-3xl font-bold text-white">{currentQuestion.question}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentQuestion.options.map((option, i) => {
                                const isSelected = selectedAnswer === option;
                                const isCorrect = option === currentQuestion.correctAnswer;
                                const isDisabled = disabledAnswers.includes(option);

                                let stateClass = 'bg-blue-900 hover:bg-blue-800 border-blue-500';
                                if (gameState === GameState.AnswerSelected && isSelected) {
                                    stateClass = 'bg-orange-500 border-orange-300 animate-pulse';
                                } else if (gameState === GameState.AnswerCorrect && isCorrect) {
                                    stateClass = 'bg-green-600 border-green-400';
                                } else if (gameState === GameState.AnswerIncorrect && isSelected) {
                                    stateClass = 'bg-red-700 border-red-500';
                                } else if (gameState === GameState.AnswerIncorrect && isCorrect) {
                                    stateClass = 'bg-green-600 border-green-400 animate-pulse';
                                }

                                return (
                                <button
                                    key={i}
                                    onClick={() => handleAnswerSelect(option)}
                                    disabled={gameState !== GameState.Playing || isDisabled}
                                    className={`w-full p-4 rounded-lg border-2 text-lg md:text-xl font-semibold text-left transition-all duration-300 ${
                                        isDisabled ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50' : stateClass
                                    }`}
                                >
                                   <span className="text-yellow-400 mr-2">{['A', 'B', 'C', 'D'][i]}:</span> {option}
                                </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <p>Loading question...</p>
                )}
            </main>
            <footer className="w-full md:hidden">
                <ProgressBar currentLevel={currentQuestionIndex} />
            </footer>
        </div>
    );
};

export default App;
