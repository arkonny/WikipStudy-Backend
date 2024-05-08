import {Question} from '../types/DBTypes';

const calculateResult = (questions: Question[], answers: string[]): number => {
  let score = 0;
  let answer = '';
  let correctAnswer = '';
  for (let i = 0; i < questions.length; i++) {
    answer = answers[i].replace(/[^a-zA-Z0-9]/g, '').toLocaleLowerCase();
    correctAnswer = questions[i].answers[0]
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLocaleLowerCase();
    if (answer === correctAnswer) {
      score++;
    }
  }
  return score;
};

export default calculateResult;
