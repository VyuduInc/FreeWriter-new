import connectDB from "../config/database.js";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import { generateToken as createToken } from "../utils/jwt.js";
import { errorHandler } from "../utils/errorHandler.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await connectDB();

    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { username, email, password, writingMode } = JSON.parse(event.body);

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email or username already exists" }),
      };
    }

    const newUser = await User.create({
      username,
      email,
      password,
      writingMode,
    });
    console.log("New User:", newUser);
    await Profile.create({ user: newUser._id });

    // Generate a verification token
    const verificationToken = newUser.createEmailVerificationToken();
    
    try {
      await sendVerificationEmail(newUser, verificationToken);
      console.log("Verification email sent successfully");
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // You may want to delete the user if email sending fails
      // await User.findByIdAndDelete(newUser._id);
      // await Profile.findOneAndDelete({ user: newUser._id });
      throw new AppError("Failed to send verification email", 500);
    }

    const token = createToken(newUser._id);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "User registered successfully. Please check your email to verify your account.",
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      }),
    };
  } catch (error) {
    console.error("Registration error:", error);
    return errorHandler(error);
  }
};
