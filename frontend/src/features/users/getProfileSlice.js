import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";

// Define the async thunk for fetching user profile
export const userProfileAPI = createAsyncThunk(
  "user/getProfile", // Unique action type string
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/api/profile`);
      // console.log('Get user profile response:', response.data);
      return { data: response.data, status: response.status };
    } catch (error) {
      // console.log('Get user profile error:', error);

      if (error.response) {
        // Handle server-side errors
        return rejectWithValue({
          data: error.response.data,
          status: error.response.status,
        });
      }

      // Handle network errors
      return rejectWithValue("Network error");
    }
  }
);

// Create the slice
const userProfileAPISlice = createSlice({
  name: "getProfile",
  initialState: {
    user: [],
    loading: false,
    error: null,
    status: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userProfileAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userProfileAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data; // Update the blog data
        state.status = action.payload.status;
      })
      .addCase(userProfileAPI.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload.message || action.payload.detail || JSON.stringify("Something went wrong"); // Update error message
        state.status = action.payload.status;
      });
  },
});

export const { clearError } = userProfileAPISlice.actions; // Export the clearError action
export default userProfileAPISlice.reducer;
