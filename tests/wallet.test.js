const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

test('register, login, add, transfer, transactions flow', async () => {
  // Register user A
  const resA = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Alice', email: 'alice@example.com', password: 'pass123' });
  expect(resA.statusCode).toBe(200);
  expect(resA.body.token).toBeTruthy();

  // Register user B
  const resB = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Bob', email: 'bob@example.com', password: 'pass123' });
  expect(resB.statusCode).toBe(200);

  // Login A
  const loginA = await request(app)
    .post('/api/auth/login')
    .send({ email: 'alice@example.com', password: 'pass123' });
  const tokenA = loginA.body.token;

  // Add money to A
  const addRes = await request(app)
    .post('/api/wallet/add')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ amount: 100 });
  expect(addRes.statusCode).toBe(200);
  expect(addRes.body.balance).toBe(100);

  // Transfer from A to B
  const transferRes = await request(app)
    .post('/api/wallet/transfer')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ toEmail: 'bob@example.com', amount: 30 });
  expect(transferRes.statusCode).toBe(200);
  expect(transferRes.body.fromBalance).toBe(70);

  // Login B and check balance
  const loginB = await request(app)
    .post('/api/auth/login')
    .send({ email: 'bob@example.com', password: 'pass123' });
  const tokenB = loginB.body.token;

  const balB = await request(app)
    .get('/api/wallet/balance')
    .set('Authorization', `Bearer ${tokenB}`);
  expect(balB.statusCode).toBe(200);
  expect(balB.body.balance).toBe(30);

  // Transactions for A
  const txA = await request(app)
    .get('/api/wallet/transactions')
    .set('Authorization', `Bearer ${tokenA}`);
  expect(txA.statusCode).toBe(200);
  expect(txA.body.length).toBeGreaterThanOrEqual(2);
});
