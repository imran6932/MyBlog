import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BaseURL = import.meta.env.VITE_BASE_URL;

// Define the async thunk for updating a post
export const updatePostAPI = createAsyncThunk(
  "blog/updatePost", // Unique action type string
  async ({ id, formData }, { rejectWithValue }) => {
    const accessToken = localStorage.getItem("accessToken"); // Retrieve access token from localStorage
    try {
      if (!accessToken) {
        throw new Error("Access token is missing");
      }

      // Make a PATCH request with data
      const response = await axios.patch(
        `${BaseURL}/api/blog/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Ensure token is properly formatted
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // console.log("Update post response:", response.data);
      return { data: response.data, status: response.status }; // Return response data as the payload
    } catch (error) {
      // console.log("Update post error:", error);

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
const updatePostAPISlice = createSlice({
  name: "updatePost",
  initialState: {
    data: null, // Stores the created blog post data
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
      .addCase(updatePostAPI.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear previous errors
      })
      .addCase(updatePostAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data; // Update state with the created post data
        state.status = action.payload.status; // Update state with the status code
      })
      .addCase(updatePostAPI.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload.data.message || JSON.stringify("Something went wrong"); // Set error message
        state.status = action.payload.status;
      });
  },
});

// Export actions and reducer
export const { clearError } = updatePostAPISlice.actions;
export default updatePostAPISlice.reducer;
