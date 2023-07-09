import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signin', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(200);
});

it('returns a 400 with an invalid email', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'testtest.com',
      password: 'password'
    })
    .expect(400);
});

it('returns a 400 with missing email and password', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({ 
      email: "test@test.com" 
    })
    .expect(400);
  return request(app)
    .post('/api/users/signin')
    .send({
      password: "password"
     })
    .expect(400);
});

it('fails when a email that does not exist is supplied', async () => {
  await request(app)
  .post('/api/users/signin')
  .send( {
    email: 'test2@test.com',
    password: 'password'
  })
  .expect(400);
});

it('fails when an incorrect password is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'testme@test.com',
      password: 'password1'
    })
    .expect(201);
  await request(app)
  .post('/api/users/signin')
  .send({
    email: 'testme@test.com',
    password: 'pssword'
  })
  .expect(400);

});


it('sets a cookie after successful signin', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);
  const response = await request(app)
  .post('/api/users/signin')
  .send({
    email: 'test@test.com',
    password: 'password'
  })
  .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});










