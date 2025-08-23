import request from 'supertest';
import { app } from '../../app';

it('responds with current token for current user', async () => {
 
  const cookie = await global.signin();

  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual('test@test.com');

  const tokenresponse = await request(app)
    .get('/api/users/currenttoken')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(tokenresponse.body.currentToken).not.toEqual('');

});

it('responds with null if not authenticated', async () => {
 
   const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);
  const tokenresponse = await request(app)
    .get('/api/users/currenttoken')
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
  expect(tokenresponse.body.currentToken).toEqual(null);

});


