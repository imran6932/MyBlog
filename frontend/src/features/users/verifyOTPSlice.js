import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BaseURL = import.meta.env.VITE_BASE_URL;

// Define the async thunk for signup
export const verifyOTPAPI = createAsyncThunk(
  "api/verify-otp", // Unique action type string
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BaseURL}/api/verify-otp?email=${data.email}&otp=${data.otp}`
      );
      // console.log("verify otp response", response.data)

      return { data: response.data, status: response.status }; // This is the payload for the `fulfilled` action
    } catch (error) {
      if (error.response) {
        // Check for specific status codes and handle accordingly
        // const status = error.response.status;
        // console.log('verify otp error', error.response.data)

        return rejectWithValue({
          data: error.response.data,
          status: error.response.status,
        });
      }
      return rejectWithValue("Network error");
    }
  }
);

// Create the slice
const verifyOTPSlice = createSlice({
  name: "verifyotp",
  initialState: {
    data: [],
    loading: false,
    error: null,
    accessToken: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyOTPAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTPAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.accessToken = action.payload.data.access_token;
        localStorage.setItem("accessToken", action.payload.data.access_token); // Save the token to localStorage
        localStorage.setItem("isLoggedIn", true);
      })
      .addCase(verifyOTPAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.data.message;
      });
  },
});

export const { clearError } = verifyOTPSlice.actions; // Export the clearError action
export default verifyOTPSlice.reducer;
