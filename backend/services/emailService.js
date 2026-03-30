const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // Create a transporter using Gmail SMTP
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Internal setting for SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Define email options
        const mailOptions = {
            from: `"Engineering Business System" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            // You can add HTML body here for even cleaner looks
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
                    <h2 style="color: #333;">OTP Verification</h2>
                    <p style="font-size: 16px;">${options.message}</p>
                    <p style="color: #777; font-size: 12px;">This is an automated message. Please do not reply.</p>
                </div>
            `,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${options.email}`);
    } catch (error) {
        console.error(`❌ Error sending email to ${options.email}:`, error.message);
        throw new Error('Email could not be sent. Please check your .env credentials.');
    }
};

module.exports = sendEmail;
