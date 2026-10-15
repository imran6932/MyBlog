import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BaseURL = import.meta.env.VITE_BASE_URL;

// Define the async thunk for signup
export const signupAPI = createAsyncThunk(
  "api/sign-up", // Unique action type string
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BaseURL}/api/sign-up`, data);
      // console.log('signup response', response.data)
      return response.data; // This is the payload for the `fulfilled` action
    } catch (error) {
      if (error.response) {
        // Check for specific status codes and handle accordingly
        // const status = error.response.status;

        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("Network error");
    }
  }
);

// Create the slice
const signupSlice = createSlice({
  name: "signup",
  initialState: {
    data: [],
    loading: false,
    error: null,
    isSignedUp: false,
    signupUserEmail: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.isSignedUp = true;
        state.signupUserEmail = action.payload.data.email;
      })
      .addCase(signupAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || action.payload.detail || "Signup failed";
      });
  },
});

export const { clearError } = signupSlice.actions; // Export the clearError action
export default signupSlice.reducer;
