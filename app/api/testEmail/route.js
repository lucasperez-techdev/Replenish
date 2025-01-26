import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Replace below with your own receiving email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // test by sending email to yourself
      subject: 'Test from Next.js',
      text: 'If you see this, your setup is working!',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email Sent:', info.messageId);

    return NextResponse.json({ message: 'Test email sent successfully!' });
  } catch (error) {
    console.error('Error sending test email', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
