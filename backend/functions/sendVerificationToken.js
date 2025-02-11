const connectDB = require( '../config/database.js');
const User = require( '../models/User.js');
const { sendVerificationEmail } = require( '../utils/sendEmail.js');
const { errorHandler } = require( '../utils/errorHandler.js');

const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    await connectDB();
    
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { email } = JSON.parse(event.body);

    const user = await User.findOne({ email });
    if (!user) {
      return { statusCode: 404, body: JSON.stringify({ message: 'User not found' }) };
    }

    if (user.isEmailVerified) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Email is already verified' }) };
    }

    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendVerificationEmail(user, verificationToken);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Verification email sent!' })
      };
    } catch (err) {
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return { statusCode: 500, body: JSON.stringify({ message: 'Error sending email. Please try again.' }) };
    }
  } catch (error) {
    return errorHandler(error);
  }
};

module.exports = {
  handler
};