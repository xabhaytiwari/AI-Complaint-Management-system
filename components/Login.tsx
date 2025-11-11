import React, { useState } from 'react';
import { User } from '../types';
import { USERS } from '../constants';
import { sendOtp, verifyOtp } from '../utils/api';

interface LoginProps {
  onLogin: (user: User) => void;
}

const COUNTRIES = [
    { name: 'USA', code: '+1' },
    { name: 'India', code: '+91' },
    { name: 'UK', code: '+44' },
    { name: 'Australia', code: '+61'},
    { name: 'Germany', code: '+49'}
];

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(USERS[0].id);
  const [countryCode, setCountryCode] = useState(COUNTRIES[0].code);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');


  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.match(/^\d{7,15}$/)) { // A more generic phone number validation
        setError('Please enter a valid phone number.');
        return;
    }
    
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    
    try {
        const response = await sendOtp(fullPhoneNumber);
        if (response.success && response.otp) {
            setOtpSent(true);
            setSuccessMessage(`For demo purposes, your OTP is: ${response.otp}. In a real app, this would be sent via SMS.`);
        } else {
            setError(response.message);
        }
    } catch (err) {
        setError('An unexpected error occurred while sending the OTP.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const selectedUser = USERS.find(u => u.id === selectedUserId);
    if (!selectedUser) {
        setError('Please select a valid user.');
        return;
    }
    
    if (!otp.match(/^\d{6}$/)) {
        setError('Please enter a valid 6-digit OTP.');
        return;
    }
    
    setIsLoading(true);
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    try {
        const response = await verifyOtp(fullPhoneNumber, otp);
        if (response.success) {
            onLogin(selectedUser);
        } else {
            setError(response.message);
        }
    } catch (err) {
        setError('An unexpected error occurred during verification.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
              <svg className="h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">AI Complaint Management System</h1>
          </div>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400">Please select a role and verify your phone number to log in</p>
        </div>

        {error && <p className="text-base text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        {successMessage && !error && (
             <div className="text-center p-3 bg-green-100 rounded-md">
                <p className="text-base text-green-700">{successMessage}</p>
             </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={otpSent ? handleLogin : handleSendOtp}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="user-select" className="sr-only">Select User</label>
              <select
                id="user-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={otpSent}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 placeholder-gray-500 text-gray-900 dark:text-gray-200 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-base disabled:opacity-50"
              >
                {USERS.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
             <div className="flex">
                <select 
                    id="country-code"
                    name="country-code"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    disabled={otpSent}
                    className="appearance-none z-10 block px-3 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base disabled:opacity-50"
                >
                    {COUNTRIES.map(country => (
                        <option key={country.code} value={country.code}>{country.name} ({country.code})</option>
                    ))}
                </select>
                <input
                    id="phone-number"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={otpSent}
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 placeholder-gray-500 text-gray-900 dark:text-gray-200 rounded-r-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-base disabled:opacity-50"
                    placeholder="Phone Number"
                />
            </div>

            {otpSent && (
                <div>
                    <label htmlFor="otp" className="sr-only">OTP</label>
                    <input
                        id="otp"
                        name="otp"
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 placeholder-gray-500 text-gray-900 dark:text-gray-200 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-base"
                        placeholder="6-digit OTP"
                    />
                </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {isLoading ? 'Processing...' : (otpSent ? 'Verify & Login' : 'Send OTP')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
