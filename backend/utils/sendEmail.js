const nodemailer= require('nodemailer');

let transporter = null;

// Initialize transporter only if email config is provided
const initializeTransporter = () => {
  if (transporter) return transporter;

  const emailHost = process.env.EMAIL_HOST;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // Only create transporter if all email config is provided
  if (emailHost && emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      host: emailHost,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        rejectUnauthorized: false // For development, accept self-signed certificates
      }
    });
  }

  return transporter;
};

exports.sendOTPEmail = async (email, otp) => {
  try {
    const transporter = initializeTransporter();

    // If no email config, return success in development mode
    if (!transporter) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Email not configured. OTP will be returned in response.');
        console.log(`📧 OTP for ${email}: ${otp}`);
        return { success: true, messageId: 'dev-mode', devMode: true, otp };
      }
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Agriculture Chat - OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Agriculture Chat - OTP Verification</h2>
          <p>Your OTP code for registration is:</p>
          <div style="background-color: #f0fdf4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #22c55e; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP is valid for 2 minutes only.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    
    // In development mode, return OTP in response if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚠️  Email sending failed. Returning OTP in response for development.`);
      console.log(`📧 OTP for ${email}: ${otp}`);
      return { success: true, messageId: 'dev-mode-fallback', devMode: true, otp };
    }
    
    throw new Error('Failed to send OTP email. Please check your email configuration.');
  }
};

