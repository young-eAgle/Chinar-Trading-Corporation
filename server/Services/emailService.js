import nodemailer from 'nodemailer';
// // import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times

// Log email configuration for debugging (without showing the actual password)
console.log("Email configuration:");
console.log("- EMAIL_USER:", process.env.EMAIL_USER);
console.log("- EMAIL_PASS set:", !!process.env.EMAIL_PASS);
console.log("- EMAIL_PASS length:", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
console.log("- NODE_ENV:", process.env.NODE_ENV);

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: process.env.NODE_ENV === 'production' ? 465 : 587,
    secure: process.env.NODE_ENV === 'production', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    debug: true // Enable debug logs
});

// Add a simple verify method to test connection on startup
transporter.verify(function(error, success) {
    if (error) {
        console.log("Email service error:", error);
        console.log("This error often occurs when:");
        console.log("1. You need to use an App Password if 2FA is enabled on Gmail");
        console.log("2. There are quotes in your EMAIL_PASS environment variable");
        console.log("3. Less secure app access is disabled (for accounts without 2FA)");
    } else {
        console.log("Email server is ready to send messages");
    }
});

const sendOrderConfirmationEmail = async (recipients, subject, htmlContent) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipients,
        subject,
        html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (email, verificationToken) => {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email',
        html: `
            <h1>Email Verification</h1>
            <p>Please click the link below to verify your email:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
            <p>This link will expire in 24 hours.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

export { sendVerificationEmail, sendPasswordResetEmail };
export default sendOrderConfirmationEmail;