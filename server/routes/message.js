const express = require('express');
const router = express.Router();
const Messasge = require('../models/Message');

router.get('/', async (req, res) => {
    try {
        const { user1, user2 } = req.body;

        const
    } catch (err) {
        console.error("get /message error:", err);
        return res.status(500).json({
            success: false,
            message: 'server error.'
        });
    }
});