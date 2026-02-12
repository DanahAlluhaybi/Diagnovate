import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    const { email } = await req.json();

    if (!email) {
        return NextResponse.json({ message: 'Email required' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'YOUR_EMAIL@gmail.com',
            pass: 'YOUR_APP_PASSWORD',
        },
    });

    const resetLink = `http://localhost:3000/reset-password?email=${email}`;

    try {
        await transporter.sendMail({
            from: '"Support" <YOUR_EMAIL@gmail.com>',
            to: email,
            subject: 'Reset your password',
            html: `
                <h3>Password Reset</h3>
                <p>Click the link below:</p>
                <a href="${resetLink}">Reset Password</a>
            `,
        });

        return NextResponse.json({ message: 'Email sent' });
    } catch (err) {
        return NextResponse.json(
            { message: 'Failed to send email' },
            { status: 500 }
        );
    }
}
