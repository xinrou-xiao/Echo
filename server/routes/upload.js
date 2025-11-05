const AWS = require('aws-sdk');
const router = require('express').Router();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

router.get('/presigned-url', async (req, res) => {
    try {
        const { fileName, fileType } = req.query;

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `profile-pictures/${Date.now()}-${fileName}`,
            ContentType: fileType,
            Expires: 300
        };

        const presignedUrl = await s3.getSignedUrlPromise('putObject', params);

        res.json({
            success: true,
            presignedUrl: presignedUrl,
            fileUrl: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`
        });
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate upload URL'
        });
    }
});

module.exports = router;