import model from 'wink-eng-lite-web-model';
import {GraphQLError} from 'graphql';
import winkNLP, {ItemSentence} from 'wink-nlp';
import {Question} from '../types/DBTypes';
const nlp = winkNLP(model);
const its = nlp.its;

const textToQuestions = async (text: string): Promise<Question[]> => {
  const doc = nlp.readDoc(text.replace(/\n/g, '').replace(/\./g, '. '));

  const sentences = doc.sentences().out();

  console.log('\nSentences :\n', sentences);

  if (sentences.length === 0) {
    console.log('Not enough sentences');
    throw new GraphQLError('Not enough sentences');
  }

  doc.sentences().each((sentence: ItemSentence) => {
    console.log('\nSentence :\n', sentence.out());
    sentence.entities().each((entity) => {
      console.log('\n', entity.out());
      console.log(entity.out(its.type));
    });
  });

  const questions = [
    {
      question: 'What is the capital of France ?',
      type: 'single' as const,
      options: ['Paris', 'London', 'France'],
      answers: ['Paris'],
    },
    {
      question: 'What is the capital of Finland ?',
      type: 'single' as const,
      answers: ['Helsinki'],
    },
  ];

  return questions;
};

export default textToQuestions;
