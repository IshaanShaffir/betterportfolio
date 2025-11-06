import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendLoginCode(email: string, code: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '🔐 Your Admin Login Code',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #a855f7 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Portfolio Admin Login</h1>
        </div>
        <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Your one-time login code is:
          </p>
          <div style="background: white; border: 2px solid #06b6d4; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #06b6d4; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${code}
            </span>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            This code will expire in 10 minutes.
          </p>
          <p style="font-size: 14px; color: #666; margin-top: 10px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>Powered by Next.js & Prisma</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export function generateLoginCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
