import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";

// Define the async thunk for deleting a post
export const deletePostAPI = createAsyncThunk(
  "blog/deletePost",
  async (id, { rejectWithValue }) => {
    try {
      // Make a DELETE request
      const response = await apiClient.delete(`/api/blog/${id}`);

      // console.log("Delete post response:", response.data, response.status);
      return { data: response.data, status: response.status }; // Return data and status
    } catch (error) {
      // console.log("Delete post error:", error);

      if (error.response) {
        // Handle server-side errors
        return rejectWithValue({
          data: error.response.data,
          status: error.response.status,
        });
      }

      // Handle network or unexpected errors
      return rejectWithValue({
        data: "Network error or unexpected issue",
        status: null,
      });
    }
  }
);

// Create the slice
const deletePostAPISlice = createSlice({
  name: "deletePost",
  initialState: {
    data: null, // Response data
    loading: false, // Loading indicator
    error: null, // Error message
    status: null, // HTTP status code
  },
  reducers: {
    clearError: (state) => {
      state.error = null; // Clear the error state
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deletePostAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = null;
      })
      .addCase(deletePostAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data; // Store response data
        state.status = action.payload.status; // Store HTTP status code
      })
      .addCase(deletePostAPI.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload.data.message || JSON.stringify("Something went wrong"); // Store error message
        state.status = action.payload.status; // Store HTTP status code if available
      });
  },
});

// Export actions and reducer
export const { clearError } = deletePostAPISlice.actions;
export default deletePostAPISlice.reducer;
