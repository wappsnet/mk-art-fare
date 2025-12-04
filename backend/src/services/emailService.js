import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

export class EmailService {

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: 'Password Reset Request - Art Fare',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested to reset your password for your Art Fare account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}"
             style="display: inline-block; padding: 12px 24px; background-color: #1890ff;
                    color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Reset Password
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 40px;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent to:', email);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(email, firstName) {
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: 'Welcome to Art Fare!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Art Fare!</h2>
          <p>Hi ${firstName || 'there'},</p>
          <p>Thank you for joining Art Fare, the premier platform for artists and art lovers.</p>
          <p>Start exploring amazing artworks, connect with talented artists, and discover upcoming art events.</p>
          <a href="${config.frontendUrl}"
             style="display: inline-block; padding: 12px 24px; background-color: #1890ff;
                    color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Explore Art Fare
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 40px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent to:', email);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }
}

export const emailService = new EmailService();
