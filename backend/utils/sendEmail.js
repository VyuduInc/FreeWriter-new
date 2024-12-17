// utils/sendEmail.js
const nodemailer = require( "nodemailer");
  const AppError = require( "./appError.js");

const createTransporter = () => {
  // For development/testing, you can use ethereal.email
  if (process.env.NODE_ENV === "development") {
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // For production, use your preferred email service (e.g., Gmail, SendGrid)
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    console.log("Attempting to send email to:", to);
    const transporter = createTransporter();
    console.log("Transporter created");

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    };
    console.log("Mail options:", mailOptions);

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new AppError(`Email could not be sent: ${error.message}`, 500);
  }
};

const sendVerificationEmail = async (user, verificationToken) => {
  console.log("Sending verification email to:", user.email);

  // Add more detailed validation
  if (!user || !user.email || !user.username) {
    console.error("Invalid user object:", user);
    throw new AppError(
      "Invalid user data. Required fields missing: " +
        (!user ? "user" : !user.email ? "email" : "username"),
      500
    );
  }

  const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: #333; text-align: center;">Verify Your Email Address</h1>
      <p style="color: #666;">Hi ${user.username},</p>
      <p style="color: #666;">A new verification email was requested for your account. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationURL}" 
           style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Verify Email
        </a>
      </div>
      <p style="color: #666;">This link will expire in 24 hours.</p>
      <p style="color: #666;">If you didn't request this verification email, please ignore it or contact support if you're concerned.</p>
    </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: "Email Verification",
      text: `Please verify your email by clicking the following link: ${verificationURL}`,
      html,
    });
    console.log("Verification email sent successfully to:", user.email);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw new AppError(
      `Failed to send verification email: ${error.message}`,
      500
    );
  }
};

const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    console.log("Sending password reset email to:", user);
    if (!user || !user.email) {
      console.error("Invalid user object:", user);
      throw new Error("User object is invalid or email is missing");
    }
    const resetURL = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;

    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #333; text-align: center;">Reset Your Password</h1>
        <p style="color: #666;">Hi ${user.username || "User"},</p>
        <p style="color: #666;">You requested to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetURL}" 
             style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #666;">This link will expire in 10 minutes.</p>
        <p style="color: #666;">If you didn't request a password reset, please ignore this email.</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: `Reset your password by clicking the following link: ${resetURL}`,
      html,
    });
  } catch (err) {
    throw new AppError(`Email could not be sent: ${err.message}`, 500);
  }
};


module.exports = {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendEmail,
  createTransporter,
};
