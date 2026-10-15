import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";

// Define the async thunk for fetching all public posts
export const getAllPostsAPI = createAsyncThunk(
  "getAllPosts", // Unique action type string
  async ({ page = 1, reset = false } = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/api/all-blog?page=${page}`);

      // console.log('Get all posts response:', response.data);
      return { ...response.data, reset }; // This is the payload for the `fulfilled` action
    } catch (error) {
      // console.log('Get all posts error:', error);

      if (error.response) {
        // Handle server-side errors
        return rejectWithValue(error.response.data);
      }

      // Handle network errors
      return rejectWithValue("Network error");
    }
  }
);

// Create the slice
const AllPostsSlice = createSlice({
  name: "posts", // This should match the state selector in components
  initialState: {
    postsData: [],
    pagination: null,
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: true,
    currentPage: 1,
  },
  reducers: {
    resetPosts: (state) => {
      state.postsData = [];
      state.pagination = null;
      state.currentPage = 1;
      state.hasMore = true;
      state.error = null;
    },
    setLoadingMore: (state, action) => {
      state.loadingMore = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPostsAPI.pending, (state, action) => {
        const { page = 1 } = action.meta.arg || {};
        if (page === 1) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(getAllPostsAPI.fulfilled, (state, action) => {
        // console.log("Get all posts fulfilled:", action.payload);
        state.loading = false;
        state.loadingMore = false;
        
        const { data, pagination, reset } = action.payload;
        
        if (reset || state.currentPage === 1) {
          // Reset data for first page
          state.postsData = { data };
        } else {
          // Append data for pagination
          const existingData = Array.isArray(state.postsData.data) ? state.postsData.data : [];
          state.postsData = { data: [...existingData, ...data] };
        }
        
        state.pagination = pagination;
        state.currentPage = pagination.current_page;
        state.hasMore = pagination.next_page !== null;
      })
      .addCase(getAllPostsAPI.rejected, (state, action) => {
        // console.log("Get all posts rejected:", action.payload);
        state.loading = false;
        state.loadingMore = false;
        state.error =
          action.payload.message || action.payload.detail || JSON.stringify("Something went wrong");
      });
  },
});

export const { clearError, resetPosts, setLoadingMore } = AllPostsSlice.actions; // Export the actions
export default AllPostsSlice.reducer;
