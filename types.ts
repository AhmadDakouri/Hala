
export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export enum GameState {
  StartScreen,
  Loading,
  Playing,
  AnswerSelected,
  AnswerCorrect,
  AnswerIncorrect,
  GameOver,
  Win
}

export interface Lifelines {
  fiftyFifty: boolean;
  audience: boolean;
  phone: boolean;
  switch: boolean;
}
