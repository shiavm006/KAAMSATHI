const twilio = require('twilio');

// Initialize Twilio client only if credentials are available
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

const sendSMS = async (to, message) => {
  // If Twilio is not configured, return a mock success for development
  if (!client) {
    console.log(`📱 [MOCK SMS] To: +91${to}, Message: ${message}`);
    return {
      success: true,
      messageId: 'mock-message-id',
      development: true
    };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${to}` // Assuming Indian phone numbers
    });

    return {
      success: true,
      messageId: result.sid
    };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const sendOTP = async (phoneNumber, otp) => {
  const message = `Your KaamSathi verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
  return await sendSMS(phoneNumber, message);
};

module.exports = {
  sendSMS,
  sendOTP
}; 