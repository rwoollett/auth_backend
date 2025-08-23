import request from 'supertest';
import { app } from '../../app';
import '../../test/setup';

it('responds with refresh token for the current user', async () => {

  await global.signin();

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
  const cookie = response.get('Set-Cookie');
  console.log(cookie);

  const refreshresponse = await request(app)
    .post('/api/users/refreshtoken')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(refreshresponse.get('Set-Cookie')).toBeDefined();

  const refreshcookie = refreshresponse.get('Set-Cookie');
  console.log('refreshgg', refreshcookie);

  const currentresponse = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', refreshcookie)
    .send()
    .expect(200);

  //expect(refreshresponse.body.email).toBeDefined();
  expect(currentresponse.body.currentUser.email).toEqual('test@test.com');

});

it('responds with null if not authenticated', async () => {

  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);

});


