const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const { User } = require('../../models/User');
const Match = require('../../models/Match');
const { TRIGGER_FIELDS } = jest.requireActual('../../models/User');

jest.mock('../../models/User', () => {
    const actual = jest.requireActual('../../models/User');
    return {
        ...actual,
        User: {
            findOne: jest.fn(),
        },
    };
});
jest.mock('../../models/Match');

describe('User api routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    // test get /api/match/:_id
    describe('Get /api/match/:_id', () => {
        it('should get user\'s match by user id', async () => {
            const mockUserId = new mongoose.Types.ObjectId();
            const mockMatchUserId = new mongoose.Types.ObjectId();
            const mockUser = {
                _id: mockUserId,
                email: 'josh@test.com',
                uid: 'uid123',
                name: 'Josh',
                gender: 'Male',
                birthday: '1990-01-01',
                state: 'California',
                city: 'Los Angeles',
                language: 'English',
                occupation: 'Finance Professional',
                mbti: 'ENFJ',
                height: 180,
                weight: 75,
                personality: 'Extrovert',
                interests: ['Sports', 'Travel'],
                bio: 'bio',
                picUrl: 'https://example.com/photo.jpg',
                food: 'Pizza or pasta',
                vibe: 'Night owl — creative or focused after dark',
                music: 'Rock / Metal',
                movie: 'Action or superhero',
                weather: 'Rainy and cozy',
                friendQuality: 'Humor',
            };
            const mockMatchUser = {
                _id: mockMatchUserId,
                email: 'Amy@test.com',
                uid: 'uid234',
                name: 'Amy',
                gender: 'Female',
                birthday: '1991-01-01',
                state: 'New York',
                city: 'New York',
                language: 'English',
                occupation: 'Software Engineer',
                mbti: 'INTJ',
                height: 165,
                weight: 58,
                personality: 'Ambivert',
                interests: ['Travel', 'Reading'],
                bio: 'bio',
                picUrl: 'https://example.com/photo.jpg',
                food: 'Pizza or pasta',
                vibe: 'Early bird — love slow mornings and sunlight',
                music: 'Pop / K-pop',
                movie: 'Thrillers or mysteries',
                weather: 'Sunny and warm',
                friendQuality: 'Kindness',
            };

            const mockMatch = {
                _id: new mongoose.Types.ObjectId(),
                user1: mockUserId,
                user2: mockMatchUserId,
                user1Response: 'pending',
                user2Response: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            }

            User.findOne.mockResolvedValueOnce(mockUser);
            User.findOne.mockResolvedValueOnce(mockMatchUser);
            Match.findOne.mockResolvedValue(mockMatch);

            const response = await request(app).get(`/api/match/${mockUserId}`).expect(200);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            expect(response.body.success).toBe(true);
            expect(response.body.data.match.user1).toBe(mockUserId.toString());
            expect(response.body.data.match.user2).toBe(mockMatchUserId.toString());
            expect(response.body.data.match.user1Response).toBe('pending');
            expect(response.body.data.match.user2Response).toBe('pending');
            expect(response.body.data.match.createdAt).toBe(mockMatch.createdAt.toISOString());

            expect(response.body.data.matchedUser._id).toBe(mockMatchUserId.toString());
            expect(response.body.data.matchedUser.name).toBe(mockMatchUser.name);
            expect(response.body.data.matchedUser.gender).toBe(mockMatchUser.gender);
            expect(response.body.data.matchedUser.birthday).toBe(mockMatchUser.birthday);
            expect(response.body.data.matchedUser.height).toBe(mockMatchUser.height);
            expect(response.body.data.matchedUser.weight).toBe(mockMatchUser.weight);
            expect(response.body.data.matchedUser.picUrl).toBe(mockMatchUser.picUrl);
            expect(response.body.data.matchedUser.bio).toBe(mockMatchUser.bio);
            expect(response.body.data.matchedUser.language).toBe(mockMatchUser.language);
            expect(response.body.data.matchedUser.food).toBe(mockMatchUser.food);
            expect(response.body.data.matchedUser.commonInterests).toHaveLength(1);

            expect(User.findOne).toHaveBeenCalledWith({ _id: mockUserId.toString() });
            expect(Match.findOne).toHaveBeenCalledWith({
                $or: [
                    { user1: mockUserId.toString() },
                    { user2: mockUserId.toString() }
                ],
                createdAt: {
                    $gte: today
                }
            });
            expect(User.findOne).toHaveBeenCalledWith({ _id: mockMatchUserId });
        });
    });

    describe('Get /api/match/:_id', () => {
        it('should return 404 on user no found', async () => {
            const mockUserId = new mongoose.Types.ObjectId();
            User.findOne.mockResolvedValue(null);

            const response = await request(app).get(`/api/match/${mockUserId}`).expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('user not found.');
        });
    });

    describe('Get /api/match/:_id', () => {
        it('should return 204 on match no found', async () => {
            const mockUserId = new mongoose.Types.ObjectId();
            const mockUser = {
                _id: mockUserId,
                email: 'josh@test.com',
                uid: 'uid123',
                name: 'Josh',
            };
            User.findOne.mockResolvedValue(mockUser);
            Match.findOne.mockResolvedValue(null);

            const response = await request(app).get(`/api/match/${mockUserId}`).expect(204);
        });
    });

    describe('Get /api/match/:_id', () => {
        it('should return 500 on DB error', async () => {
            const mockUserId = '123';
            User.findOne.mockRejectedValue(new Error('DB error'));

            const response = await request(app).get(`/api/match/${mockUserId}`).expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('server error.');
        });
    });
});