import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // Use SSL/TLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
    const info = await transporter.sendMail({
        from: `"Support" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
    });
    return info;
}
