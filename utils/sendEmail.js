import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    // Gmail ke liye direct service use karna zyada stable hai
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message, // Fallback for non-HTML clients
        html: options.html,    // Yahan HTML template jayega
    };

    await transporter.sendMail(message);
};

export default sendEmail;