const request = require('supertest');
const mongoose = require('mongoose');
const baseUrl = 'https://echoproject-hvchcufahxb3bbh7.canadacentral-01.azurewebsites.net';

describe('User api routes (Azure production)', () => {
    describe('Post /api/message/', () => {
        it('should get user data by id', async () => {
            const senderId = '69257e2861c390622cbdfd5e';
            const receiverId = '6927dae664b3b395685fd996';
            const content = `test:${new Date().toISOString()}`;

            const response = await request(baseUrl)
                .post(`/api/message/`)
                .send({
                    senderId: senderId,
                    receiverId: receiverId,
                    content: content
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.senderId).toBe(senderId);
            expect(response.body.data.receiverId).toBe(receiverId);
            expect(response.body.data.content).toBe(content);
        });
    });

    describe('Get /api/user/', () => {
        it('should return 404', async () => {
            const senderId = new mongoose.Types.ObjectId();
            const receiverId = '6927dae664b3b395685fd996';
            const content = `test:${new Date().toDateString}`;

            const response = await request(baseUrl)
                .post(`/api/message/`)
                .send({
                    senderId: senderId,
                    receiverId: receiverId,
                    content: content
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Receiver or sender does not exist.');
        });
    });

    describe('Get /api/user/', () => {
        it('should return 500 on ObjectId wrong format', async () => {
            const senderId = '123';
            const receiverId = '6927dae664b3b395685fd996';
            const content = `test:${new Date().toDateString}`;

            const response = await request(baseUrl)
                .post(`/api/message/`)
                .send({
                    senderId: senderId,
                    receiverId: receiverId,
                    content: content
                })
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('server error.');
        });
    });
})