const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Echo API Document',
            version: '1.0.0',
            description: 'Echo API Document'
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Dev Server'
            },
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    required: ['email', 'uid', 'name'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Google account email'
                        },
                        uid: {
                            type: 'string',
                            description: 'Google SSO uid'
                        },
                        name: {
                            type: 'string',
                            description: 'name'
                        },
                        gender: {
                            type: 'string',
                            enum: ['male', 'female', 'other'],
                            description: 'gender'
                        },
                        birthday: {
                            type: 'string',
                            format: 'date',
                            description: 'birthday'
                        },
                        state: {
                            type: 'string',
                            description: 'state(USA only)'
                        },
                        city: {
                            type: 'string',
                            description: 'city(USA only)'
                        },
                        language: {
                            type: 'string',
                            description: 'language'
                        },
                        occupation: {
                            type: 'string',
                            description: 'occupation'
                        },
                        mbti: {
                            type: 'string',
                            description: 'MBTI'
                        },
                        height: {
                            type: 'integer',
                            description: 'height(cm)'
                        },
                        weight: {
                            type: 'integer',
                            description: 'weight(kg)'
                        },
                        personality: {
                            type: 'string',
                            description: 'personality'
                        },
                        interests: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'interests'
                        },
                        bio: {
                            type: 'string',
                            description: 'bio'
                        },
                        picUrl: {
                            type: 'string',
                            format: 'uri',
                            description: 'profile picture url'
                        },
                        friends: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'friend list'
                        }
                    }
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean'
                        },
                        message: {
                            type: 'string'
                        },
                        data: {
                            type: 'object'
                        }
                    }
                }
            }
        }
    },
    apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = {
    specs,
    swaggerUi
};