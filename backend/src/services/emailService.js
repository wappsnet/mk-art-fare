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

  async sendEventTicketEmail(booking) {
    const {
      attendee_email,
      attendee_name,
      booking_number,
      virtual_ticket_code,
      qr_code_url,
      quantity,
      event_title,
      event_start_date,
      venue_name,
      ticket_type,
      total_price,
      delivery_method,
      pickup_location,
      delivery_address_line1,
      delivery_city,
      delivery_state,
      delivery_postal_code,
    } = booking;

    let deliveryInfo = '';

    if (delivery_method === 'virtual') {
      deliveryInfo = `
        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Virtual Ticket</h3>
          <p><strong>Ticket Code:</strong> ${virtual_ticket_code}</p>
          ${qr_code_url ? `<img src="${qr_code_url}" alt="QR Code" style="max-width: 200px; margin: 10px 0;" />` : ''}
          <p style="color: #666; font-size: 14px;">Please present this QR code or ticket code at the event entrance.</p>
        </div>
      `;
    } else if (delivery_method === 'pickup') {
      deliveryInfo = `
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">Ticket Pickup</h3>
          <p><strong>Pickup Location:</strong> ${pickup_location || 'Event venue'}</p>
          <p><strong>Booking Number:</strong> ${booking_number}</p>
          <p style="color: #856404; font-size: 14px;">Please bring a valid ID and quote your booking number to collect your tickets.</p>
        </div>
      `;
    } else if (delivery_method === 'physical_delivery') {
      deliveryInfo = `
        <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0c5460; margin-top: 0;">Physical Ticket Delivery</h3>
          <p><strong>Delivery Address:</strong></p>
          <p style="margin: 5px 0;">
            ${delivery_address_line1}<br/>
            ${delivery_city}, ${delivery_state} ${delivery_postal_code}
          </p>
          <p style="color: #0c5460; font-size: 14px;">Your tickets will be delivered within 5-7 business days.</p>
        </div>
      `;
    }

    const mailOptions = {
      from: config.email.from,
      to: attendee_email,
      subject: `Event Ticket Confirmation - ${event_title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Event Ticket Confirmation</h2>
          <p>Hi ${attendee_name},</p>
          <p>Thank you for your purchase! Your ticket(s) for <strong>${event_title}</strong> have been confirmed.</p>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Event Details</h3>
            <p><strong>Event:</strong> ${event_title}</p>
            <p><strong>Date:</strong> ${new Date(event_start_date).toLocaleString()}</p>
            <p><strong>Venue:</strong> ${venue_name || 'TBA'}</p>
            <p><strong>Ticket Type:</strong> ${ticket_type}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <p><strong>Total:</strong> $${parseFloat(total_price).toFixed(2)}</p>
            <p><strong>Booking Number:</strong> ${booking_number}</p>
          </div>

          ${deliveryInfo}

          <p style="color: #999; font-size: 12px; margin-top: 40px;">
            If you have any questions about your booking, please contact our support team with your booking number.
          </p>

          <a href="${config.frontendUrl}/my-tickets"
             style="display: inline-block; padding: 12px 24px; background-color: #1890ff;
                    color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            View My Tickets
          </a>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Event ticket email sent to:', attendee_email);
      return true;
    } catch (error) {
      console.error('Error sending event ticket email:', error);
      throw new Error('Failed to send event ticket email');
    }
  }

  async sendEventModerationNotification(event, status, comment, moderatorName) {
    const creatorEmail = event.creator_email;
    const eventTitle = event.title;

    const statusMessages = {
      approved: {
        subject: `Event Approved - ${eventTitle}`,
        heading: 'Event Approved!',
        color: '#52c41a',
        message: 'Congratulations! Your event has been approved and is now live on Art Fare.',
      },
      declined: {
        subject: `Event Declined - ${eventTitle}`,
        heading: 'Event Declined',
        color: '#ff4d4f',
        message: 'Your event submission has been declined.',
      },
      removed: {
        subject: `Event Removed - ${eventTitle}`,
        heading: 'Event Removed',
        color: '#ff4d4f',
        message: 'Your event has been removed from Art Fare.',
      },
    };

    const statusInfo = statusMessages[status];

    const mailOptions = {
      from: config.email.from,
      to: creatorEmail,
      subject: statusInfo.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${statusInfo.color};">${statusInfo.heading}</h2>
          <p>Hello,</p>
          <p>${statusInfo.message}</p>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Event Details</h3>
            <p><strong>Event:</strong> ${eventTitle}</p>
            <p><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
            ${comment ? `<p><strong>Moderator Comment:</strong> ${comment}</p>` : ''}
            <p><strong>Reviewed by:</strong> ${moderatorName}</p>
          </div>

          ${status === 'approved' ? `
            <a href="${config.frontendUrl}/events/${event.slug}"
               style="display: inline-block; padding: 12px 24px; background-color: #1890ff;
                      color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
              View Event
            </a>
          ` : `
            <a href="${config.frontendUrl}/my-events"
               style="display: inline-block; padding: 12px 24px; background-color: #1890ff;
                      color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
              Manage My Events
            </a>
          `}

          <p style="color: #999; font-size: 12px; margin-top: 40px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Event moderation notification sent to:', creatorEmail);
    } catch (error) {
      console.error('Error sending moderation notification:', error);
    }
  }
}

export const emailService = new EmailService();
