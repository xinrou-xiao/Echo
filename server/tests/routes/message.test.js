const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const Message = require('../../models/Message');
const { User } = require('../../models/User');

jest.mock('../../models/Message');
jest.mock('../../models/User');

describe('Message api route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('Get /api/message/', () => {
        it('should get top 3 messages', async () => {
            const mockUser1Id = new mongoose.Types.ObjectId();
            const mockUser2Id = new mongoose.Types.ObjectId();
            const mockMessage1Id = new mongoose.Types.ObjectId();
            const mockMessage2Id = new mongoose.Types.ObjectId();
            const mockMessage3Id = new mongoose.Types.ObjectId();
            const now = Date.now();

            const mockMessages = [
                {
                    _id: mockMessage1Id,
                    receiverId: mockUser1Id,
                    senderId: mockUser2Id,
                    content: "Hello there.",
                    createdAt: new Date(now + 2000),
                    updatedAt: new Date(now + 2000)
                }, {
                    _id: mockMessage2Id,
                    receiverId: mockUser2Id,
                    senderId: mockUser1Id,
                    content: "Hi, nice to meet you",
                    createdAt: new Date(now + 1000),
                    updatedAt: new Date(now + 1000)
                }, {
                    _id: mockMessage3Id,
                    receiverId: mockUser1Id,
                    senderId: mockUser2Id,
                    content: "yeah, nice to meet you too",
                    createdAt: now,
                    updatedAt: now
                },
            ]

            const mockQuery = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockMessages)
            };

            User.exists.mockResolvedValue(true);
            Message.find.mockReturnValue(mockQuery);

            const response = await request(app)
                .get('/api/message')
                .query({
                    user1Id: mockUser1Id.toString(),
                    user2Id: mockUser2Id.toString(),
                    skip: 0,
                    limit: 3
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(3);
            expect(response.body.data[0]._id.toString()).toBe(mockMessage3Id.toString());
            expect(response.body.data[1]._id.toString()).toBe(mockMessage2Id.toString());
            expect(response.body.data[2]._id.toString()).toBe(mockMessage1Id.toString());

            expect(User.exists).toHaveBeenCalledWith({ _id: mockUser1Id.toString() });
            expect(User.exists).toHaveBeenCalledWith({ _id: mockUser2Id.toString() });
            expect(Message.find).toHaveBeenCalledWith({
                $or: [
                    { senderId: mockUser1Id.toString(), receiverId: mockUser2Id.toString() },
                    { senderId: mockUser2Id.toString(), receiverId: mockUser1Id.toString() }
                ]
            });
            expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(mockQuery.skip).toHaveBeenCalledWith(0);
            expect(mockQuery.limit).toHaveBeenCalledWith(3);
        });
    });

    describe('Get /api/message/', () => {
        it('should return 200 with 0 messages', async () => {
            const mockQuery = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(null)
            };

            User.exists.mockResolvedValue(true);
            Message.find.mockReturnValue(mockQuery);


            const response = await request(app)
                .get('/api/message')
                .query({
                    user1Id: new mongoose.Types.ObjectId().toString(),
                    user2Id: new mongoose.Types.ObjectId().toString()
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(0);
            expect(User.exists).toHaveBeenCalledTimes(2);
            expect(Message.find).toHaveBeenCalledTimes(1);
        });
    });

    describe('Get /api/message/', () => {
        it('should return 404 on user not found', async () => {
            User.exists.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/message')
                .query({
                    user1Id: new mongoose.Types.ObjectId().toString(),
                    user2Id: new mongoose.Types.ObjectId().toString()
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('user1 or user2 does not exist.');
            expect(User.exists).toHaveBeenCalledTimes(2);
        });
    });

    describe('Get /api/message/', () => {
        it('should return 500 on DB error', async () => {
            User.exists.mockRejectedValue('DB error');

            const response = await request(app)
                .get('/api/message')
                .query({
                    user1Id: new mongoose.Types.ObjectId().toString(),
                    user2Id: new mongoose.Types.ObjectId().toString()
                })
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('server error.');
            expect(User.exists).toHaveBeenCalledTimes(2);
        });
    });

    describe('Post /api/message/', () => {
        it('should insert a new Message', async () => {
            const mockUser1Id = new mongoose.Types.ObjectId();
            const mockUser2Id = new mongoose.Types.ObjectId();
            const mockMessageId = new mongoose.Types.ObjectId();

            const mockMessages = {
                _id: mockMessageId,
                receiverId: mockUser1Id,
                senderId: mockUser2Id,
                content: 'Hello there.',
                createdAt: new Date(),
                updatedAt: new Date()
            }

            const mockSave = jest.fn().mockResolvedValue(mockMessages);
            Message.mockImplementation(() => ({
                save: mockSave
            }));
            User.exists.mockResolvedValue(true);

            const response = await request(app)
                .post('/api/message')
                .send({
                    senderId: mockUser1Id.toString(),
                    receiverId: mockUser2Id.toString(),
                    content: 'Hello there.'
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(mockMessageId.toString());
            expect(response.body.data.receiverId).toBe(mockUser1Id.toString());
            expect(response.body.data.senderId).toBe(mockUser2Id.toString());
            expect(response.body.data.content).toBe('Hello there.');

            expect(User.exists).toHaveBeenCalledTimes(2);
            expect(User.exists).toHaveBeenCalledWith({ _id: mockUser1Id.toString() });
            expect(User.exists).toHaveBeenCalledWith({ _id: mockUser2Id.toString() });
            expect(User.exists).toHaveBeenCalledWith({ _id: mockUser2Id.toString() });
            []
        });
    });

    describe('Post /api/message/', () => {
        it('should return 400 on receiver or sender does not exist. ', async () => {
            const mockUser1Id = new mongoose.Types.ObjectId();
            const mockUser2Id = new mongoose.Types.ObjectId();

            User.exists.mockResolvedValue(false);

            const response = await request(app)
                .post('/api/message')
                .send({
                    senderId: mockUser1Id.toString(),
                    receiverId: mockUser2Id.toString(),
                    content: 'Hello there.'
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Receiver or sender does not exist.');

            expect(User.exists).toHaveBeenCalledTimes(2);
        });
    });

    describe('Post /api/message/', () => {
        it('should return 500 on DB error', async () => {
            const mockUser1Id = new mongoose.Types.ObjectId();
            const mockUser2Id = new mongoose.Types.ObjectId();

            User.exists.mockRejectedValue('DB error');

            const response = await request(app)
                .post('/api/message')
                .send({
                    senderId: mockUser1Id.toString(),
                    receiverId: mockUser2Id.toString(),
                    content: 'Hello there.'
                })
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('server error.');

            expect(User.exists).toHaveBeenCalledTimes(2);
        });
    });
});