/* eslint-disable node/no-unpublished-import */
import request from 'supertest';
import {UploadResponse} from '../src/types/MessageTypes';
import {Application} from 'express';
import {QuizTest} from '../src/types/OutputTypes';
require('dotenv').config();

// add test for graphql query
// before testing graphql, upload image to /api/v1/upload, parameter name: file
// the file is test/picWithGPS.JPG
// the upload route will return JSON object:
/* {
  message: 'file uploaded',
  data: {
    filename: string,
  },
}
*/

const postFile = (
  url: string | Application,
  token: string,
): Promise<UploadResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', 'test/picWithGPS.JPG')
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const uploadMessageResponse = response.body;
          expect(uploadMessageResponse).toHaveProperty('message');
          expect(uploadMessageResponse).toHaveProperty('data');
          expect(uploadMessageResponse.data).toHaveProperty('filename');
          resolve(uploadMessageResponse);
        }
      });
  });
};

// test for graphql query
const quizResearchQuery = `query QuizResearch($search: String!) {
  quizResearch(search: $search) {
    id
    quiz_name
    filename
  }
}`;

const quizResearch = (
  url: string | Application,
  search: string,
  token: string,
): Promise<QuizTest[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: quizResearchQuery,
        variables: {
          search: search,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const quizzes = response.body.data.quizResearch;
          quizzes.forEach((quiz: QuizTest) => {
            expect(quiz).toHaveProperty('id');
            expect(quiz).toHaveProperty('quiz_name');
          });
          resolve(quizzes);
        }
      });
  });
};

const wrongQuizResearch = (
  url: string | Application,
  search: string,
  token: string,
): Promise<QuizTest[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: quizResearchQuery,
        variables: {
          search: search,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const quizzes = response.body.data.quizResearch;
          expect(quizzes).toBe([]);
          resolve(quizzes);
        }
      });
  });
};

// test for graphql query
const createQuizQuery = `mutation CreateQuiz($input: QuizInput!) {
  createQuiz(input: $input) {
    id
    quiz_name
    questions {
      id
      question
      options
      answers
      type
    }
    owner {
      id
      user_name
    }
    filename
  }
}`;

const createQuiz = (
  url: string | Application,
  vars: {input: QuizTest},
  token: string,
): Promise<QuizTest> => {
  console.log(vars);
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: createQuizQuery,
        variables: vars,
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const quiz = vars.input;
          const createdQuiz = response.body.data.createQuiz;
          expect(createdQuiz.quiz_name).toBe(quiz.quiz_name);
          expect(createdQuiz).toHaveProperty('questions');
          expect(createdQuiz).toHaveProperty('owner');
          expect(createdQuiz.owner).toHaveProperty('id');
          expect(createdQuiz.owner).toHaveProperty('user_name');
          resolve(createdQuiz);
        }
      });
  });
};

// add test for graphql query
const quizByIdQuery = `query QuizById($id: ID!) {
  quizById(id: $id) {
    id
    quiz_name
    questions {
      id
      question
      type
      options
      answers
    }
    owner {
      id
      user_name
    }
    filename
    favorite
  }
}`;

const quizById = (
  url: string | Application,
  id: string,
  token: string,
): Promise<QuizTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: quizByIdQuery,
        variables: {
          id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const quiz = response.body.data.quizById;
          expect(quiz).toHaveProperty('id');
          expect(quiz.id).toBe(id);
          expect(quiz).toHaveProperty('quiz_name');
          expect(quiz).toHaveProperty('questions');
          expect(quiz).toHaveProperty('owner');
          expect(quiz.owner).toHaveProperty('id');
          expect(quiz.owner).toHaveProperty('user_name');
          resolve(quiz);
        }
      });
  });
};

const wrongQuizById = (
  url: string | Application,
  id: string,
  token: string,
): Promise<QuizTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: quizByIdQuery,
        variables: {
          id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const error = response.body.errors[0];
          expect(error).toHaveProperty('message');
          expect(error).toHaveProperty('extensions');
          expect(error.extensions).toHaveProperty('code');
          expect(error.extensions.code).toBe('NOT_FOUND');
          resolve(error);
        }
      });
  });
};

const updateQuizQuery = `mutation UpdateQuiz($id: ID!, $input: QuizInput!) {
  updateQuiz(id: $id, input: $input) {
    id
    quiz_name
    questions {
      id
      question
      type
      options
      answers
    }
    owner {
      id
      user_name
    }
    filename
  }
}`;

const updateQuiz = (
  url: string | Application,
  vars: {input: QuizTest; id: string},
  token: string,
): Promise<QuizTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateQuizQuery,
        variables: vars,
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const quiz = vars.input;
          const updatedQuiz = response.body.data.updateQuiz;
          expect(updatedQuiz.quiz_name).toBe(quiz.quiz_name);
          expect(updatedQuiz).toHaveProperty('questions');
          expect(updatedQuiz).toHaveProperty('owner');
          expect(updatedQuiz.owner).toHaveProperty('id');
          resolve(updatedQuiz);
        }
      });
  });
};

const wrongUpdateQuiz = (
  url: string | Application,
  vars: {input: QuizTest; id: string},
  token: string,
): Promise<QuizTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: updateQuizQuery,
        variables: vars,
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const updatedQuiz = response.body.data.updateQuiz;
          expect(updatedQuiz).toBe(null);
          resolve(updatedQuiz);
        }
      });
  });
};

// add test for graphql query
const deleteQuizQuery = `mutation DeleteQuiz($id: ID!) {
  deleteQuiz(id: $id) {
    id
    quiz_name
    questions {
      id
      question
      type
      options
      answers
    }
    owner {
      id
      user_name
    }
    filename
  }
}`;

const deleteQuiz = (
  url: string | Application,
  id: string,
  token: string,
): Promise<QuizTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: deleteQuizQuery,
        variables: {
          id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const deletedQuiz = response.body.data.deleteQuiz;
          expect(deletedQuiz.id).toBe(id);
          resolve(deletedQuiz);
        }
      });
  });
};

const wrongDeleteQuiz = (
  url: string | Application,
  id: string,
  token: string,
): Promise<QuizTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: deleteQuizQuery,
        variables: {
          id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const deletedQuiz = response.body.data.deleteQuiz;
          expect(deletedQuiz).toBe(null);
          resolve(deletedQuiz);
        }
      });
  });
};

// add test for graphql query
const quizzesByOwnerQuery = `query QuizzesByOwner($owner: ID!) {
  quizzesByOwner(owner: $owner) {
    id
    quiz_name
    filename
  }
}`;

const quizzesByOwner = (
  url: string | Application,
  id: string,
): Promise<QuizTest[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .send({
        query: quizzesByOwnerQuery,
        variables: {
          owner: id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const quizzes = response.body.data.quizzesByOwner;
          quizzes.forEach((quiz: QuizTest) => {
            expect(quiz).toHaveProperty('id');
            expect(quiz).toHaveProperty('quiz_name');
          });
          resolve(quizzes);
        }
      });
  });
};

export {
  postFile,
  quizResearch,
  wrongQuizResearch,
  createQuiz,
  quizById,
  wrongQuizById,
  updateQuiz,
  wrongUpdateQuiz,
  deleteQuiz,
  wrongDeleteQuiz,
  quizzesByOwner,
};
