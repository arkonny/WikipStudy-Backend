import jwt from 'jsonwebtoken';
import randomstring from 'randomstring';
import mongoose from 'mongoose';
import {QuizTest, UserTest} from '../src/types/OutputTypes';
import app from '../src/app';
import {LoginResponse} from '../src/types/MessageTypes';
import {getNotFound} from './testFunctions';
import {
  deleteUser,
  userById,
  login,
  register,
  updateUser,
  checkToken,
} from './userFunctions';
import {
  postFile,
  quizResearch,
  createQuiz,
  quizById,
  updateQuiz,
  wrongUpdateQuiz,
  deleteQuiz,
  wrongDeleteQuiz,
  quizzesByOwner,
  wrongQuizById,
  generateQuiz,
} from './quizFunctions';
import {favoritesAdd, favoritesRemove, favoritesGet} from './favoriteFunctions';
import {reportAdd} from './reportFunctions';
import {answerQuiz} from './resultFunctions';

describe('Testing graphql api', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.DATABASE_URL as string);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // test not found
  it('responds with a not found message', async () => {
    await getNotFound(app);
  });

  // User variables
  let userData: LoginResponse;
  let userData2: LoginResponse;
  let adminData: LoginResponse;

  const testUser: UserTest = {
    user_name: 'Test User ' + randomstring.generate(7),
    email: randomstring.generate(9) + '@user.fi',
    password: 'testpassword',
  };

  const testUser2: UserTest = {
    user_name: 'Test User ' + randomstring.generate(7),
    email: randomstring.generate(9) + '@user.fi',
    password: 'testpassword',
  };

  const adminUser: UserTest = {
    email: 'admin@metropolia.fi',
    password: process.env.ADMIN_PASSWORD,
  };

  // Quiz variables
  let quizData: QuizTest;
  let quizData2: QuizTest;
  const testQuiz: QuizTest = {
    quiz_name: 'Test Quiz ' + randomstring.generate(7),
    questions: [
      {
        question: 'What is the capital of Finland?',
        type: 'single',
        answers: ['Helsinki'],
      },
      {
        question: 'What is the capital of Sweden?',
        type: 'single',
        answers: ['Stockholm'],
      },
    ],
    filename: undefined,
  };

  const testQuizUpdate: QuizTest = {
    quiz_name: 'Test Quiz Updated ' + randomstring.generate(7),
    questions: [
      {
        question: 'What is the capital of Finland?',
        type: 'single',
        answers: ['Helsinki'],
      },
      {
        question: 'What is the capital of Sweden?',
        type: 'single',
        answers: ['Stockholm'],
      },
      {
        question: 'What is the capital of Norway?',
        type: 'single',
        answers: ['Oslo'],
      },
    ],
  };

  /*
   * User tests
   */

  // create first user
  it('should create a new user', async () => {
    await register(app, testUser);
  });

  // create second user to try to modify someone else's cats and userdata
  it('should create second user', async () => {
    await register(app, testUser2);
  });

  // test login
  it('should login user', async () => {
    const vars = {
      credentials: {
        username: testUser.email!,
        password: testUser.password!,
      },
    };
    userData = await login(app, vars);
  });

  // test login with second user
  it('should login second user', async () => {
    const vars = {
      credentials: {
        username: testUser2.email!,
        password: testUser2.password!,
      },
    };
    userData2 = await login(app, vars);
  });

  // test login with admin user
  it('should login admin user', async () => {
    const vars = {
      credentials: {
        username: adminUser.email!,
        password: adminUser.password!,
      },
    };
    adminData = await login(app, vars);
  });

  // make sure token has role (so that we can test if user is admin or not)
  it('token should have role', async () => {
    const dataFromToken = jwt.verify(
      userData.token!,
      process.env.JWT_SECRET as string,
    );
    expect(dataFromToken).toHaveProperty('role');
  });

  // test checkToken
  it('should return user data', async () => {
    await checkToken(app, userData.token!);
  });

  // test get single user
  it('should return single user', async () => {
    await userById(app, userData.user.id!);
  });

  // test update user
  it('should update user', async () => {
    await updateUser(app, userData.token!);
  });

  /*
   * Quiz tests
   */

  // test upload file
  it('should upload file', async () => {
    testQuiz.filename = (
      await postFile(process.env.UPLOAD_URL!, userData.token!)
    ).data.filename;
  });

  // test create quiz
  it('should create quiz', async () => {
    quizData = await createQuiz(app, {input: testQuiz}, userData.token!);
  });

  // test generate quiz
  it('should generate quiz', async () => {
    quizData2 = await generateQuiz(app, 'Finland', userData2.token!);
  });

  // test get all quizzes
  it('should find by research a quiz', async () => {
    await quizResearch(app, testQuiz.quiz_name!, userData.token!);
  });

  // test get single quiz
  it('should return single quiz', async () => {
    quizData = await quizById(app, quizData.id!, userData.token!);
  });

  // test update quiz
  it('should update quiz', async () => {
    await updateQuiz(
      app,
      {input: testQuizUpdate, id: quizData.id!},
      userData.token!,
    );
  });

  // test update quiz with wrong user
  it('should not update quiz', async () => {
    await wrongUpdateQuiz(
      app,
      {input: testQuizUpdate, id: quizData.id!},
      userData2.token!,
    );
  });

  // test quizzes by owner
  it('should return quizzes by owner', async () => {
    await quizzesByOwner(app, userData.user.id!);
  });

  // test delete quiz
  it('should delete quiz', async () => {
    await deleteQuiz(app, quizData2.id!, userData2.token!);
  });

  // test delete quiz with wrong user
  it('should not delete quiz', async () => {
    await wrongDeleteQuiz(app, quizData.id!, userData2.token!);
  });

  /*
   * Result tests
   */
  // test answer quiz
  it('should answer quiz', async () => {
    const {score} = await answerQuiz(
      app,
      {quizId: quizData.id!, answers: ['Helsinki', 'Stockholm', 'Oslo']},
      userData.token!,
    );
    expect(score).toBe(3);
  });

  /*
   * Favorites tests
   */

  // test favorite add
  it('should add favorite', async () => {
    await favoritesAdd(app, quizData.id!, userData.token!);
  });

  // test favorite get
  it('should get favorite', async () => {
    await favoritesGet(app, userData.token!);
  });

  // test favorite remove
  it('should remove favorite', async () => {
    await favoritesRemove(app, quizData.id!, userData.token!);
  });

  /*
   * Report tests
   */
  // test report add
  it('should add report', async () => {
    await reportAdd(
      app,
      quizData.id!,
      'This is a test report',
      userData.token!,
    );
  });

  /*
   * Clean up
   */
  // test delete user based on token
  it('should delete current user', async () => {
    await deleteUser(app, userData.token!);
  });

  // test quiz deleted with user
  it('should not find quiz', async () => {
    await wrongQuizById(app, quizData.id!, adminData.token!);
  });

  // test delete second user based on token
  it('should delete second user', async () => {
    await deleteUser(app, userData2.token!);
  });

  // test brute force protectiom
  // test('Brute force attack simulation', async () => {
  //   const maxAttempts = 20;
  //   const mockUser: UserTest = {
  //     user_name: 'Test User ' + randomstring.generate(7),
  //     email: randomstring.generate(9) + '@user.fi',
  //     password: 'notthepassword',
  //   };

  //   try {
  //     // Call the mock login function until the maximum number of attempts is reached
  //     for (let i = 0; i < maxAttempts; i++) {
  //       const result = await loginBrute(app, mockUser);
  //       if (result) throw new Error('Brute force attack unsuccessful');
  //     }

  //     // If the while loop completes successfully, the test fails
  //     throw new Error('Brute force attack succeeded');
  //   } catch (error) {
  //     console.log(error);
  //     // If the login function throws an error, the test passes
  //     expect((error as Error).message).toBe('Brute force attack unsuccessful');
  //   }
  // }, 15000);
});
