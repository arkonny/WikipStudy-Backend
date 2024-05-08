import model from 'wink-eng-lite-web-model';
import {GraphQLError} from 'graphql';
import winkNLP, {Document} from 'wink-nlp';
import {Question} from '../types/DBTypes';
import nlp from 'compromise/three';
const nlpWink = winkNLP(model);
const its = nlpWink.its;

const clarifyText = (text: string): string => {
  return text
    .replace(/\n/g, ' ') // Remove new lines
    .replace(/\s*=+ [a-zA-Z0-9\s]+ =+/g, '. ') // Remove titles and replace by an end of sentence
    .replace(/([^a-zA-Z0-9\-_\s\p{Lu}\p{Ll}.])/gu, ' $1 ') // Add spaces around punctuation (when using compromise)
    .replace(/(\s)\s+/g, '$1'); // Remove multiple spaces
};

type SentenceEntities = {
  sentence: string;
  entities: string[];
  types: string[];
};

const entitiesFinderWink = (sentence: string): SentenceEntities | undefined => {
  const doc: Document = nlpWink.readDoc(sentence);
  const entities: SentenceEntities = {
    sentence: sentence,
    entities: [],
    types: [],
  };
  if (doc.entities().itemAt(0) !== undefined) {
    entities.entities = doc.entities().out();
    entities.types = doc.entities().out(its.type);
    return entities;
  }
  return undefined;
};

const entitiesFinderCompromise = (sentence: string): SentenceEntities => {
  const doc = nlp(sentence);
  const peoples = doc.people().out('array');
  const places = doc.places().out('array');
  const organisations = doc.organizations().out('array');
  const entities: SentenceEntities = {
    sentence: sentence,
    entities: [],
    types: [],
  };
  if (peoples.length > 0) {
    peoples.forEach((person: string) => {
      entities.entities.push(person);
      entities.types.push('Person');
    });
  }
  if (places.length > 0) {
    places.forEach((place: string) => {
      entities.entities.push(place);
      entities.types.push('Place');
    });
  }
  if (organisations.length > 0) {
    organisations.forEach((organisation: string) => {
      entities.entities.push(organisation);
      entities.types.push('Organisation');
    });
  }
  return entities;
};

const sentenceToQuestion = (sentence: SentenceEntities): Question => {
  const replacement = sentence.entities[0]
    .replace(/[a-zA-Z]/g, 'x')
    .replace(/[0-9]/g, '#');
  return {
    question: sentence.sentence.replace(
      sentence.entities[0],
      '[' + replacement + '] (' + sentence.types[0] + ')',
    ),
    type: 'single',
    answers: [sentence.entities[0]],
  };
};

const textToQuestions = async (inputText: string): Promise<Question[]> => {
  const text = clarifyText(inputText);
  const doc = nlpWink.readDoc(text);
  const sentences = doc.sentences().out();

  if (sentences.length === 0) {
    console.log('Not enough sentences');
    throw new GraphQLError('Not enough sentences');
  }

  const sentencesEntities: SentenceEntities[] = [];
  sentences.forEach((sentence) => {
    let entities = entitiesFinderWink(sentence);
    if (!entities) entities = entitiesFinderCompromise(sentence);
    if (entities) sentencesEntities.push(entities);
  });

  const questions: Question[] = [];

  sentencesEntities.forEach((sentence) => {
    if (sentence.entities.length !== 0) {
      const question = sentenceToQuestion(sentence);
      questions.push(question);
    }
  });

  return questions;
};

export default textToQuestions;
