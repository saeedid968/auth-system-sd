import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const requiredEnv = ["SMTP_EMAIL", "SMTP_PASSWORD", "FROM_NAME", "FROM_EMAIL"];
    const missingEnv = requiredEnv.filter((key) => !process.env[key]);

    if (missingEnv.length) {
        throw new Error(`Missing email environment variables: ${missingEnv.join(", ")}`);
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : true,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 12000,
    });

    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    await transporter.sendMail(message);
};

export default sendEmail;
