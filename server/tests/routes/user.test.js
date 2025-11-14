const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const { User } = require('../../models/User');
const Message = require('../../models/Message');

jest.mock('../../models/User');
jest.mock('../../models/Message');

describe('User api routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    // Test /api/user/:_id api
    describe('Get /api/user/:_id', () => {
        it('should get user data by id', async () => {
            const mockUserId = new mongoose.Types.ObjectId();
            const mockUser = {
                _id: mockUserId,
                email: 'josh@test.com',
                uid: 'uid123',
                name: 'Josh'
            };

            User.findOne.mockResolvedValue(mockUser);

            const response = await request(app).get(`/api/user/${mockUserId}`).expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(mockUserId.toString());
            expect(response.body.data.email).toBe('josh@test.com');
            expect(response.body.data.name).toBe('Josh');
            expect(User.findOne).toHaveBeenCalledWith({ _id: mockUserId.toString() });
        });
    });

    describe('Get /api/user/:_id', () => {
        it('should return 404', async () => {
            const mockUserId = new mongoose.Types.ObjectId();
            User.findOne.mockResolvedValue(null);

            const response = await request(app).get(`/api/user/${mockUserId}`).expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('user not found.');
            expect(User.findOne).toHaveBeenCalledWith({ _id: mockUserId.toString() });
        });
    });

    describe('Get /api/user/:_id', () => {
        it('should return 500 on ObjectId wrong format', async () => {
            const mockUserId = '123456';
            User.findOne.mockRejectedValue(new Error('DB error'));

            const response = await request(app).get(`/api/user/${mockUserId}`).expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('server error.');
            expect(User.findOne).toHaveBeenCalledWith({ _id: mockUserId.toString() });
        });
    });

    // Test get /api/user/friend-list/:_id
    describe('Get /api/user/friend-list/:_id', () => {
        it('should get user\'s friends data by user id', async () => {
            const mockUserId = new mongoose.Types.ObjectId();
            const mockFriendUserId = new mongoose.Types.ObjectId();
            const mockUser = {
                _id: mockUserId,
                email: 'josh@test.com',
                uid: 'uid123',
                name: 'Josh',
                friends: [mockFriendUserId]
            };
            const mockFriend = {
                _id: mockFriendUserId,
                email: 'Amy@test.com',
                uid: 'uid234',
                name: 'Amy',
                friends: [mockUserId],
                toObject: function () {
                    return { ...this };
                }
            };

            const mockMessage = {
                _id: new mongoose.Types.ObjectId(),
                receiverId: mockFriendUserId,
                senderId: mockUserId,
                content: "hi",
                createdAt: new Date(),
                updatedAt: new Date()
            }

            const mockQuery = {
                sort: jest.fn().mockResolvedValue(mockMessage),
            };

            User.findOne.mockResolvedValueOnce(mockUser);
            User.findOne.mockResolvedValueOnce(mockFriend);
            Message.findOne.mockReturnValue(mockQuery);

            const response = await request(app).get(`/api/user/friend-list/${mockUserId}`).expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0]._id).toBe(mockFriendUserId.toString());
            expect(response.body.data[0].email).toBe('Amy@test.com');
            expect(response.body.data[0].name).toBe('Amy');
            expect(response.body.data[0].lastMessage).toBe('hi');
            expect(response.body.data[0].lastMessageTime).toBe(mockMessage.createdAt.toISOString());
            expect(User.findOne).toHaveBeenNthCalledWith(1,
                { _id: mockUserId.toString() },
                { _id: 0, friends: 1 }
            );
            expect(User.findOne).toHaveBeenNthCalledWith(2,
                { _id: mockFriendUserId }
            );
            expect(Message.findOne).toHaveBeenCalledWith({
                $or: [
                    { senderId: mockUserId.toString(), receiverId: mockFriendUserId },
                    { senderId: mockFriendUserId, receiverId: mockUserId.toString() }
                ]
            });
        });
    });

    describe('Get /api/user/friend-list/:_id', () => {
        it('should return 404', async () => {
            const mockUserId = new mongoose.Types.ObjectId();
            User.findOne.mockResolvedValue(null);

            const response = await request(app).get(`/api/user/friend-list/${mockUserId}`).expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('user not found.');
            expect(User.findOne).toHaveBeenCalledWith(
                { _id: mockUserId.toString() },
                { _id: 0, friends: 1 }
            );
        });
    });

    describe('Get /api/user/friend-list/:_id', () => {
        it('should return 500 on DB connection failed', async () => {
            const mockUserId = new mongoose.Types.ObjectId();
            User.findOne.mockRejectedValue(new Error('Database connection failed'));

            const response = await request(app)
                .get(`/api/user/friend-list/${mockUserId}`)
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('server error.');
        });
    });

    // Put /api/user/:_id
    describe('PUT /api/user/:_id', () => {
        it('should update user successfully', async () => {
            const mockUserId = new mongoose.Types.ObjectId();
            const updateData = {
                name: 'Updated Name',
                gender: 'Male',
                birthday: '1990-01-01',
                location: { state: 'CA', city: 'LA' },
                language: 'English',
                occupation: 'Engineer',
                mbti: 'INTJ',
                height: 180,
                weight: 75,
                personality: 'Friendly',
                interests: ['coding', 'music'],
                bio: 'Updated bio',
                profilePicture: { url: 'https://example.com/photo.jpg' },
                food: 'Pizza',
                vibe: 'Chill',
                music: 'Rock',
                movie: 'Action',
                weather: 'Sunny',
                friendQuality: 'Loyal'
            };

            const mockUpdatedUser = {
                _id: mockUserId,
                ...updateData,
                state: 'CA',
                city: 'LA',
                picUrl: 'https://example.com/photo.jpg'
            };

            User.exists.mockResolvedValue(true);
            User.findOneAndUpdate.mockResolvedValue(mockUpdatedUser);

            const response = await request(app)
                .put(`/api/user/${mockUserId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Updated Name');
            expect(User.exists).toHaveBeenCalledWith({ _id: mockUserId.toString() });
            expect(User.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: mockUserId.toString() },
                {
                    $set: {
                        name: 'Updated Name',
                        gender: 'Male',
                        birthday: '1990-01-01',
                        state: 'CA',
                        city: 'LA',
                        language: 'English',
                        occupation: 'Engineer',
                        mbti: 'INTJ',
                        height: 180,
                        weight: 75,
                        personality: 'Friendly',
                        interests: ['coding', 'music'],
                        bio: 'Updated bio',
                        picUrl: 'https://example.com/photo.jpg',
                        food: 'Pizza',
                        vibe: 'Chill',
                        music: 'Rock',
                        movie: 'Action',
                        weather: 'Sunny',
                        friendQuality: 'Loyal'
                    }
                },
                {
                    new: true,
                    runValidators: true
                }
            );
        });

        it('should return 400 when user does not exist', async () => {
            const mockUserId = new mongoose.Types.ObjectId();
            const updateData = { name: 'New Name' };

            User.exists.mockResolvedValue(false);

            const response = await request(app)
                .put(`/api/user/${mockUserId}`)
                .send(updateData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('user do not exist');
            expect(User.findOneAndUpdate).not.toHaveBeenCalled();
        });
    });

    it('should return 500 on DB error', async () => {
        const mockUserId = new mongoose.Types.ObjectId();
        const updateData = { name: 'New Name' };

        User.exists.mockRejectedValue(new Error('DB error'));

        const response = await request(app)
            .put(`/api/user/${mockUserId}`)
            .send(updateData)
            .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('server error.');
    });
})