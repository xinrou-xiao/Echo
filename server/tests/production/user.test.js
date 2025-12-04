const request = require('supertest');
const mongoose = require('mongoose');
const baseUrl = 'https://echoproject-hvchcufahxb3bbh7.canadacentral-01.azurewebsites.net';

describe('User api routes (Azure production)', () => {
    describe('Get /api/user/:_id', () => {
        it('should get user data by id', async () => {
            const userId = '69257e2861c390622cbdfd5e';

            const response = await request(baseUrl).get(`/api/user/${userId}`).expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(userId);
            expect(response.body.data.email).toBe('apple88501@gmail.com');
            expect(response.body.data.name).toBe('Xinrou');
        });
    });

    describe('Get /api/user/:_id', () => {
        it('should return 404', async () => {
            const mockUserId = new mongoose.Types.ObjectId();

            const response = await request(baseUrl).get(`/api/user/${mockUserId}`).expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('user not found.');
        });
    });

    describe('Get /api/user/:_id', () => {
        it('should return 500 on ObjectId wrong format', async () => {
            const mockUserId = '123456';

            const response = await request(baseUrl).get(`/api/user/${mockUserId}`).expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('server error.');
        });
    });

    describe('Get /api/user/friend-list/:_id', () => {
        it('should get user data by id', async () => {
            const userId = '69257e2861c390622cbdfd5e';

            const response = await request(baseUrl).get(`/api/user/friend-list/${userId}`).expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0]._id).toBe('6927dae664b3b395685fd996');
            expect(response.body.data[1]._id).toBe('6927dacb64b3b395685fd942');
        });
    });

    describe('Get /api/user/:_id', () => {
        it('should return 404', async () => {
            const mockUserId = new mongoose.Types.ObjectId();

            const response = await request(baseUrl).get(`/api/user/friend-list/${mockUserId}`).expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('user not found.');
        });
    });

    describe('Get /api/user/:_id', () => {
        it('should return 500 on ObjectId wrong format', async () => {
            const mockUserId = '123456';

            const response = await request(baseUrl).get(`/api/user/friend-list/${mockUserId}`).expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('server error.');
        });
    });
})