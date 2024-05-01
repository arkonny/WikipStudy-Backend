import model from 'wink-eng-lite-web-model';
import {GraphQLError} from 'graphql';
import winkNLP, {ItemSentence} from 'wink-nlp';
import {Question} from '../types/DBTypes';
const nlpWink = winkNLP(model);
const its = nlpWink.its;

const clarifyText = (text: string): string => {
  return text
    .replace(/\n/g, ' ') // Remove new lines
    .replace(/([^a-zA-Z0-9\-_\s\p{Lu}\p{Ll}])/gu, ' $1 ') // Add spaces around punctuation (when using compromise)
    .replace(/(\s)\s+/g, '$1'); // Remove multiple spaces
};

type Sentence = {
  sentence: string;
  entities: string[];
  types: string[];
};

const textToQuestions = async (inputText: string): Promise<Question[]> => {
  const text = clarifyText(inputText);
  const doc = nlpWink.readDoc(text);
  const sentences = doc.sentences().out();

  if (sentences.length === 0) {
    console.log('Not enough sentences');
    throw new GraphQLError('Not enough sentences');
  }

  const sentencesEntitiesWink: Sentence[] = [];
  doc.sentences().each((sentence: ItemSentence) => {
    if (sentence.entities().itemAt(0) !== undefined) {
      sentencesEntitiesWink.push({
        sentence: sentence.out(),
        entities: sentence.entities().out(),
        types: sentence.entities().out(its.type),
      });
    }
  });

  const questions: Question[] = [];

  sentencesEntitiesWink.forEach((sentence: Sentence) => {
    const regex = new RegExp(sentence.entities[0]);
    const question: Question = {
      question: sentence.sentence.replace(
        regex,
        '_[' + sentence.types[0] + ']_',
      ),
      type: 'single',
      answers: [sentence.entities[0]],
    };
    questions.push(question);
  });

  return questions;
};

export default textToQuestions;
