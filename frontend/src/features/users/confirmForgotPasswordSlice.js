import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BaseURL = import.meta.env.VITE_BASE_URL;

// Define the async thunk for signup
export const confirmForgotPasswordAPI = createAsyncThunk(
  "api/confirm-reset-password", // Unique action type string
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BaseURL}/api/confirm-reset-password`,
        data
      );
      // console.log("confirm-reset-password response", response.data)

      return response.data; // This is the payload for the `fulfilled` action
    } catch (error) {
      if (error.response) {
        // Check for specific status codes and handle accordingly
        // const status = error.response.status;
        // console.log('confirm-reset-password error', error.response.data)

        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("Network error");
    }
  }
);

// Create the slice
const confirmForgotPasswordSlice = createSlice({
  name: "confirmForgotPassword",
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
      state.isSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(confirmForgotPasswordAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmForgotPasswordAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.isSuccess = true;
        state.resetEmail = action.payload.email;
      })
      .addCase(confirmForgotPasswordAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || action.payload.detail || "Failed to confirm password reset";
        state.isSuccess = false;
      });
  },
});

export const { clearError } = confirmForgotPasswordSlice.actions; // Export the clearError action
export default confirmForgotPasswordSlice.reducer;
