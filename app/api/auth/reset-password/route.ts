import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { email, password } = await req.json();

    if (!email || password.length < 8) {
        return NextResponse.json(
            { message: 'Invalid data' },
            { status: 400 }
        );
    }

    console.log('Password reset for:', email);
    console.log('New password:', password);

    return NextResponse.json({
        message: 'Password reset successfully',
    });
}
