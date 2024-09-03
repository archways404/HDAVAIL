const supertest = require('supertest');

const serverUrl = 'http://localhost:3000';

describe('Authentication Routes', () => {
	it('POST /login should authenticate the user and set a cookie', async () => {
		const response = await supertest(serverUrl).post('/login').send({
			username: 'testuser',
			password: 'testpassword',
		});

		expect(response.status).toBe(200);
		expect(response.body.message).toBe('Login successful');
		expect(response.headers['set-cookie']).toBeDefined();
	});

	it('GET /protected should return authentication status', async () => {
		// First, log in to get the cookie
		const loginResponse = await supertest(serverUrl).post('/login').send({
			username: 'testuser',
			password: 'testpassword',
		});

		const cookies = loginResponse.headers['set-cookie'];

		// Then, access the protected route with the cookie
		const protectedResponse = await supertest(serverUrl)
			.get('/protected')
			.set('Cookie', cookies);

		expect(protectedResponse.status).toBe(200);
		expect(protectedResponse.body.message).toBe('You are authenticated');
		expect(protectedResponse.body.user).toBeDefined();
	});
});
