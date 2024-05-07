/* eslint-disable node/no-unpublished-import */
import request from 'supertest';
import {Application} from 'express';
require('dotenv').config();

const reportAddQuery = `mutation ReportAdd($target: ID!, $message: String) {
  reportAdd(target: $target, message: $message) {
    target
    source
    message
  }
}`;

const reportAdd = async (
  url: string | Application,
  target: string,
  message: string,
  token: string,
) => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: reportAddQuery,
        variables: {
          target,
          message,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          if (response.body.errors) reject(response.body.errors[0].message);
          const report = response.body.data.reportAdd;
          expect(report).toHaveProperty('target');
          expect(report).toHaveProperty('source');
          expect(report).toHaveProperty('message');
          expect(report.target).toBe(target);
          expect(report.message).toBe(message);
          resolve(report);
        }
      });
  });
};

export {reportAdd};
