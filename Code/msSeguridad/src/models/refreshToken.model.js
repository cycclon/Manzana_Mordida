const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    userAgent: { 
        type: String 
    },
    revoked: { 
        type: Boolean,
        default: false 
    },
    replacedByToken: {
        type: String,
        default: null
    },
    createdAt: { type: Date, default: Date.now, index: true, expires: 60*60*24* (process.env.REFRESH_TOKEN_EXPIRY_DAYS ? Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS): 7)},
    expiresAt: { type: Date, required: true }
});

// TTL index for automatic cleanup
RefreshTokenSchema.index({ expiresAt: 1}, { expireAfterSeconds: 0 });

RefreshTokenSchema.statics.cleanupForUser = async function (userId) {
    await this.deleteMany({user: userId, expiresAt: { $lt: new Date() }});
};

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);