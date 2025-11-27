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
 * Upload payment proof to R2 and return public URL
 */
async function uploadComprobante(file) {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `comprobantes/${crypto.randomUUID()}.${fileExtension}`;

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
 * Delete payment proof from R2
 */
async function deleteComprobante(comprobanteUrl) {
    // Extract filename from URL
    const fileName = comprobanteUrl.replace(`${process.env.R2_PUBLIC_URL}/`, '');

    const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
    });

    await r2Client.send(command);
}

module.exports = { uploadComprobante, deleteComprobante };
