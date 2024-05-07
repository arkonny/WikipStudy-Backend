/* eslint-disable node/no-unpublished-import */
import request from 'supertest';
import {Application} from 'express';
require('dotenv').config();

import {FavoritesOut} from '../src/types/OutputTypes';

const favoritesAddQuery = `mutation FavoritesAdd($quizId: ID!) {
  favoritesAdd(quizId: $quizId) {
    owner
    items {
      id
      quiz_name
    }
  }
}`;

const favoritesAdd = async (
  url: string | Application,
  quizId: string,
  token: string,
): Promise<FavoritesOut> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: favoritesAddQuery,
        variables: {
          quizId,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          if (response.body.errors) reject(response.body.errors[0].message);
          const favorites = response.body.data.favoritesAdd;
          expect(favorites).toHaveProperty('owner');
          expect(favorites).toHaveProperty('items');
          expect(favorites.items).toBeInstanceOf(Array);
          expect(favorites.items[0]).toHaveProperty('id');
          expect(favorites.items[0].id).toBe(quizId);
          expect(favorites.items[0]).toHaveProperty('quiz_name');
          resolve(favorites);
        }
      });
  });
};

const favoritesRemoveQuery = `mutation FavoritesRemove($quizId: ID!) {
  favoritesRemove(quizId: $quizId) {
    owner
    items {
      id
      quiz_name
    }
  }
}`;

const favoritesRemove = async (
  url: string | Application,
  quizId: string,
  token: string,
): Promise<FavoritesOut> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: favoritesRemoveQuery,
        variables: {
          quizId,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          if (response.body.errors) reject(response.body.errors[0].message);
          const favorites = response.body.data.favoritesRemove;
          expect(favorites).toHaveProperty('owner');
          expect(favorites).toHaveProperty('items');
          expect(favorites.items).toBeInstanceOf(Array);
          expect(favorites.items).not.toContainEqual(
            expect.objectContaining({id: quizId}),
          );
          resolve(favorites);
        }
      });
  });
};

const favoritesGetQuery = `query FavoritesGet {
  favoritesGet {
    owner
    items {
      id
      quiz_name
    }
  }
}`;

const favoritesGet = async (
  url: string | Application,
  token: string,
): Promise<FavoritesOut> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: favoritesGetQuery,
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          if (response.body.errors) reject(response.body.errors[0].message);
          const favorites = response.body.data.favoritesGet;
          expect(favorites).toHaveProperty('owner');
          expect(favorites).toHaveProperty('items');
          expect(favorites.items).toBeInstanceOf(Array);
          resolve(favorites);
        }
      });
  });
};

export {favoritesAdd, favoritesRemove, favoritesGet};
