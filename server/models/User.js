import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    batch: {
        type: String,
        default: ""
    },
    department: {
        type: String,
        default: ""
    },
    rollNumber: {
        type: String,
        unique: true,
        sparse: true   // allows admin to not have roll number
    },
    password: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['admin', 'alumni'],
        default: 'alumni'
    },
    status: {
        type: String,
        enum: ['approved', 'pending'],
        default: 'pending'
    },
    isPasswordChanged: {
        type: Boolean,
        default: false
    },
    isFirstLogin: {
        type: Boolean,
        default: true
    },
    isImported: {
        type: Boolean,
        default: false
    },
    passwordResetToken: {
        type: String,
        default: null
    },
    passwordResetExpires: {
        type: Date,
        default: null
    },
    otpRequestCount: {
        type: Number,
        default: 0
    },
    otpRequestWindowStartedAt: {
        type: Date,
        default: null
    },
    otpLastSentAt: {
        type: Date,
        default: null
    },
    otpVerifyAttempts: {
        type: Number,
        default: 0
    },
    otpLastStatus: {
        type: String,
        default: ""
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
