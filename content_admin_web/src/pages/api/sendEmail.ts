// pages/api/sendEmail.ts

import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { email, subject, message } = req.body as { email: string; subject: string; message: string };

    // Create a Nodemailer transporter using SMTP
    const transporter = nodemailer.createTransport({
      host: '',
      port: 587,
      auth: {
          user: '',
          pass: ''
      }
    });

    try {
      const info = await transporter.sendMail({
        from: '"Config Admin" email',
        to: email,
        subject: subject,
        text: message,
        html: `<b>${message}</b>`,
      });

      res.status(200).json({ message: `Email sent to ${email}` });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: "Error sending email" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
