import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";

// Define the async thunk for updating a post
export const updateProfileAPI = createAsyncThunk(
  "blog/updateProfile", // Unique action type string
  async (formData, { rejectWithValue }) => {
    try {
      // Make a PATCH request with data
      const response = await apiClient.patch(`/api/profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // console.log("Update profile response:", response.data);
      return { data: response.data, status: response.status }; // Return response data as the payload
    } catch (error) {
      // console.log("Update profile error:", error);

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
const updateProfileAPISlice = createSlice({
  name: "updateProfile",
  initialState: {
    data: false, // Stores the created blog post data
    loading: false, // Indicates whether a request is in progress
    error: null, // Stores any error message
    status: null, // Stores any error message
  },
  reducers: {
    clearError: (state) => {
      state.error = null; // Reset error state
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfileAPI.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear previous errors
      })
      .addCase(updateProfileAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data; // Update state with the created post data
        state.status = action.payload.status; // Update state with the status code
      })
      .addCase(updateProfileAPI.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload.data.message || JSON.stringify("Something went wrong"); // Set error message
        state.status = action.payload.status;
      });
  },
});

// Export actions and reducer
export const { clearError } = updateProfileAPISlice.actions;
export default updateProfileAPISlice.reducer;
