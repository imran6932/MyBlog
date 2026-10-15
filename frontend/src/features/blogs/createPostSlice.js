import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";

// Define the async thunk for creating a post
export const createPostAPI = createAsyncThunk(
  "blog/createPost", // Unique action type string
  async (formData, { rejectWithValue }) => {
    try {
      // Make a POST request with data and extended timeout for file uploads
      const response = await apiClient.post(`/api/blog`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 60 seconds timeout for file uploads
      });

      // console.log("Create post response:", response.data);
      return { data: response.data, status: response.status }; // Return response data as the payload
    } catch (error) {
      console.error("Create post error:", error);

      if (error.code === 'ECONNABORTED') {
        return rejectWithValue("Request timeout. Please check your internet connection and try again.");
      }

      if (error.response) {
        // Handle server-side errors
        return rejectWithValue({
          data: error.response.data,
          status: error.response.status,
        });
      }

      // Handle network errors
      return rejectWithValue("Network error. Please check your connection and try again.");
    }
  }
);

// Create the slice
const createPostAPISlice = createSlice({
  name: "createPost",
  initialState: {
    data: null, // Stores the created blog post data
    loading: false, // Indicates whether a request is in progress
    error: null, // Stores any error message
    status: null, // Stores status code
    success: false, // Indicates successful creation
  },
  reducers: {
    clearError: (state) => {
      state.error = null; // Reset error state
    },
    clearSuccess: (state) => {
      state.success = false; // Reset success state
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPostAPI.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear previous errors
        state.success = false; // Clear previous success
      })
      .addCase(createPostAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data; // Update state with the created post data
        state.status = action.payload.status; // Update state with the status code
        state.success = true; // Set success to true
        state.error = null; // Clear any previous errors
      })
      .addCase(createPostAPI.rejected, (state, action) => {
        state.loading = false;
        state.success = false; // Clear success on error
        state.error =
          action.payload?.data?.message || action.payload || "Something went wrong"; // Set error message
        state.status = action.payload?.status || null;
      });
  },
});

// Export actions and reducer
export const { clearError, clearSuccess } = createPostAPISlice.actions;
export default createPostAPISlice.reducer;
