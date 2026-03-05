const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // Check if credentials exist
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("⚠️ Email credentials not found in environment variables. Simulating email send:");
            console.log(`To: ${options.email}\nSubject: ${options.subject}\nMessage: ${options.message}`);
            return;
        }

        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail', // You can change this based on your provider
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Define email options
        const mailOptions = {
            from: `"Business System" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${options.email}`);
    } catch (error) {
        console.error(`Error sending email to ${options.email}:`, error.message);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
