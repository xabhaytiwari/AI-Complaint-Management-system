// This is a mock API to simulate OTP generation and verification without a real backend.
// In a real application, these functions would make network requests to a server.

interface OtpStore {
  [phoneNumber: string]: {
    otp: string;
    expires: number;
  };
}

interface SendOtpResponse {
    success: boolean;
    message: string;
    otp?: string; // OTP is included for demo purposes
}

const otpStore: OtpStore = {};

const OTP_EXPIRATION_MINUTES = 5;

/**
 * Simulates sending an OTP to a phone number.
 */
export const sendOtp = (phoneNumber: string): Promise<SendOtpResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the OTP and its expiration time
      otpStore[phoneNumber] = {
        otp,
        expires: Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000,
      };

      // In a real app, you would send the OTP via SMS and not return it in the response.
      // We return it here so the UI can display it for the demo.
      resolve({ success: true, message: 'OTP sent successfully.', otp });
    }, 1000); // Simulate network latency
  });
};

/**
 * Simulates verifying an OTP.
 */
export const verifyOtp = (phoneNumber: string, otp: string): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const stored = otpStore[phoneNumber];

      if (!stored) {
        resolve({ success: false, message: 'No OTP found for this number, or it has expired. Please try again.' });
        return;
      }

      if (Date.now() > stored.expires) {
        delete otpStore[phoneNumber];
        resolve({ success: false, message: 'OTP has expired. Please request a new one.' });
        return;
      }
      
      if (stored.otp === otp) {
        // OTP is correct, remove it after verification
        delete otpStore[phoneNumber];
        resolve({ success: true, message: 'OTP verified successfully.' });
      } else {
        resolve({ success: false, message: 'Invalid OTP. Please try again.' });
      }
    }, 500); // Simulate network latency
  });
};