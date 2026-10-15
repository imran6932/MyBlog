import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BaseURL = import.meta.env.VITE_BASE_URL;

// Define the async thunk for signup
export const forgotPasswordAPI = createAsyncThunk(
  "api/request-reset-password", // Unique action type string
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BaseURL}/api/request-reset-password`,
        data
      );
      // console.log("request-reset-password response", response.data)

      return response.data; // This is the payload for the `fulfilled` action
    } catch (error) {
      if (error.response) {
        // Check for specific status codes and handle accordingly
        // const status = error.response.status;
        // console.log('request-reset-password error', error.response.data)

        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("Network error");
    }
  }
);

// Create the slice
const forgotPasswordSlice = createSlice({
  name: "forgotPassword",
  initialState: {
    data: [],
    loading: false,
    error: null,
    isSuccess: false,
    resetEmail: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(forgotPasswordAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPasswordAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.isSuccess = true;
        state.resetEmail = action.payload.email;
      })
      .addCase(forgotPasswordAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || action.payload.detail || "Failed to request password reset";
        state.isSuccess = false;
      });
  },
});

export const { clearError } = forgotPasswordSlice.actions; // Export the clearError action
export default forgotPasswordSlice.reducer;
