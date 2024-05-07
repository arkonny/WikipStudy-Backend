/* eslint-disable node/no-unpublished-import */
import request from 'supertest';
import {Application} from 'express';
import {Result} from '../src/types/DBTypes';
require('dotenv').config();

const answerQuizQuery = `mutation AnswerQuiz($input: AnswerInput!) {
  answerQuiz(input: $input) {
    quiz
    owner
    score
  }
}`;

const answerQuiz = async (
  url: string | Application,
  input: {quizId: string; answers: string[]},
  token: string,
): Promise<Result> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: answerQuizQuery,
        variables: {
          input,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          if (response.body.errors) reject(response.body.errors[0].message);
          const answer = response.body.data.answerQuiz;
          expect(answer).toHaveProperty('quiz');
          expect(answer).toHaveProperty('owner');
          expect(answer).toHaveProperty('score');
          resolve(answer);
        }
      });
  });
};

export {answerQuiz};
