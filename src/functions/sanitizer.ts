import {Question} from '../types/DBTypes';
import {QuizInput, UserInput} from '../types/OutputTypes';
import {escape} from 'validator';

const sanitizeQuestions = (questions: Question[]): Question[] => {
  return questions.map((question) => {
    const input = {
      question: escape(question.question),
      type: question.type,
      options: question.options?.map((option) => escape(option)),
      answers: question.answers.map((answer) => escape(answer)),
    };
    return input;
  });
};

const sanitizeQuiz = (quiz: QuizInput): QuizInput => {
  const input = {
    quiz_name: escape(quiz.quiz_name),
    questions: sanitizeQuestions(quiz.questions),
    filename: quiz.filename ? escape(quiz.filename) : undefined,
    owner: quiz.owner,
  };
  return input;
};

const sanitizeUser = (user: UserInput): UserInput => {
  console.log(user);
  const input = {
    user_name: escape(user.user_name),
    email: user.email,
    password: user.password,
  };
  console.log(input);
  return input;
};

export {sanitizeQuiz, sanitizeUser};
