import api from './api';

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response;
  } catch (error) {
    console.error("Registration Error from Server:", error.response?.data);
    throw error;
  }
};

export const verifyOTP = async (otpData) => {
  try {
    const response = await api.post('/auth/verify-otp', otpData);
    return response;
  } catch (error) {
    console.error("Verification Error from Server:", error.response?.data);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response;
  } catch (error) {
    console.error("Login Error from Server:", error.response?.data);
    throw error;
  }
};

export const resendOTP = async (email) => {
  try {
    const response = await api.post('/auth/resend-otp', { email });
    return response;
  } catch (error) {
    console.error("Resend OTP Error Server:", error.response?.data);
    throw error;
  }
};
