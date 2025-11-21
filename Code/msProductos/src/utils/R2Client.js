const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");

// Verify credentials exist
if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    throw new Error('R2 credentials are missing from environment variables');
}

const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

/**
 * Upload image to R2 and return public URL
 */
async function uploadImage(file) {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `equipos/${crypto.randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await r2Client.send(command);

    return `${process.env.R2_PUBLIC_URL}/${fileName}`;
}

/**
 * Delete image from R2
 */
async function deleteImage(imageUrl) {
    // Extract filename from URL
    const fileName = imageUrl.replace(`${process.env.R2_PUBLIC_URL}/`, '');

    const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
    });

    await r2Client.send(command);
}

module.exports = { uploadImage, deleteImage };
