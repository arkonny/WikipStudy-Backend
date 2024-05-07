/* eslint-disable node/no-unpublished-import */
import request from 'supertest';
import randomstring from 'randomstring';
import {Application} from 'express';
import {LoginResponse, UserResponse} from '../src/types/MessageTypes';
import {UserTest} from '../src/types/OutputTypes';

/* test for graphql query
query UserById($userByIdId: ID!) {
  userById(id: $userByIdId) {
    user_name
    id
  }
}
*/
const userById = (url: string | Application, id: string): Promise<UserTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .send({
        query: `query UserById($userByIdId: ID!) {
          userById(id: $userByIdId) {
            user_name
            id
          }
        }`,
        variables: {
          userByIdId: id,
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const user = response.body.data.userById;
          expect(user.id).toBe(id);
          expect(user).toHaveProperty('user_name');
          resolve(response.body.data.userById);
        }
      });
  });
};

/* test for graphql query
mutation Mutation($user: UserInput!) {
  register(user: $user) {
    message
    user {
      id
      user_name
      email
    }
  }
}
*/
const register = (
  url: string | Application,
  user: UserTest,
): Promise<UserTest> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .send({
        query: `mutation Mutation($user: UserInput!) {
          register(user: $user) {
            message
            user {
              id
              user_name
              email
            }
          }
        }`,
        variables: {
          user: {
            user_name: user.user_name,
            email: user.email,
            password: user.password,
          },
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const userData = response.body.data.register;
          expect(userData).toHaveProperty('message');
          expect(userData).toHaveProperty('user');
          expect(userData.user).toHaveProperty('id');
          expect(userData.user.user_name).toBe(user.user_name);
          expect(userData.user.email).toBe(user.email);
          resolve(response.body.data.register);
        }
      });
  });
};

/* test for graphql query
mutation Login($credentials: Credentials!) {
  login(credentials: $credentials) {
    message
    token
    user {
      email
      id
      user_name
    }
  }
}
*/

const login = (
  url: string | Application,
  vars: {credentials: {username: string; password: string}},
): Promise<LoginResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .send({
        query: `mutation Login($credentials: Credentials!) {
          login(credentials: $credentials) {
            token
            message
            user {
              email
              user_name
              id
            }
          }
        }`,
        variables: vars,
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const user = vars.credentials;
          console.log('login response', response.body);
          const userData = response.body.data.login;
          expect(userData).toHaveProperty('message');
          expect(userData).toHaveProperty('token');
          expect(userData).toHaveProperty('user');
          expect(userData.user).toHaveProperty('id');
          expect(userData.user.email).toBe(user.username);
          resolve(response.body.data.login);
        }
      });
  });
};

const loginBrute = (
  url: string | Application,
  user: UserTest,
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .send({
        query: `mutation Login($credentials: Credentials!) {
          login(credentials: $credentials) {
            message
            token
            user {
              email
              id
              user_name
            }
          }
        }`,
        variables: {
          credentials: {
            username: user.email,
            password: user.password,
          },
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          if (
            response.body.errors?.[0]?.message ===
            "You are trying to access 'login' too often"
          ) {
            console.log('brute blocked', response.body.errors[0].message);
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
  });
};

/* test for graphql query
query CheckToken {
  checkToken {
    message
    user {
      id
      user_name
      email
    }
  }
}`
*/
const checkToken = (url: string | Application, token: string) => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({
        query: `query CheckToken {
            checkToken {
                message
                user {
                    id
                    user_name
                    email
                }
            }
        }`,
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const userData = response.body.data.checkToken;
          expect(userData).toHaveProperty('message');
          expect(userData).toHaveProperty('user');
          expect(userData.user).toHaveProperty('id');
          expect(userData.user).toHaveProperty('user_name');
          expect(userData.user).toHaveProperty('email');
          resolve(response.body.data.checkToken);
        }
      });
  });
};

/* test for graphql query
mutation UpdateUser($user: UserModify!) {
  updateUser(user: $user) {
    token
    message
    user {
      id
      user_name
      email
    }
  }
}
*/
const updateUser = (url: string | Application, token: string) => {
  return new Promise((resolve, reject) => {
    const newValue = 'Test Update ' + randomstring.generate(7);
    request(url)
      .post('/graphql')
      .set('Content-type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .send({
        query: `mutation UpdateUser($user: UserModify!) {
          updateUser(user: $user) {
            message
            user {
              id
              user_name
              email
            }
          }
        }`,
        variables: {
          user: {
            user_name: newValue,
          },
        },
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const userData = response.body.data.updateUser;
          expect(userData).toHaveProperty('message');
          expect(userData).toHaveProperty('user');
          expect(userData.user).toHaveProperty('id');
          expect(userData.user.user_name).toBe(newValue);
          resolve(response.body.data.updateUser);
        }
      });
  });
};

/* test for graphql query
mutation DeleteUser {
  deleteUser {
    message
    user {
      id
      user_name
      email
    }
  }
}
*/

const deleteUser = (
  url: string | Application,
  token: string,
): Promise<UserResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({
        query: `mutation DeleteUser {
          deleteUser {
            message
            user {
              id
              user_name
              email
            }
          }
        }`,
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const userData = response.body.data.deleteUser;
          expect(userData).toHaveProperty('message');
          expect(userData).toHaveProperty('user');
          resolve(userData);
        }
      });
  });
};

export {
  userById,
  register,
  checkToken,
  updateUser,
  deleteUser,
  login,
  loginBrute,
};
