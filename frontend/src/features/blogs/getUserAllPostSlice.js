import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";

// Define the async thunk for fetching user posts
export const userAllPostsAPI = createAsyncThunk(
  "user/getUserAllPosts", // Unique action type string
  async ({ statusFilter = '', page = 1, reset = false }, { rejectWithValue }) => {
    try {
      let url = `/api/blog?page=${page}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      
      const response = await apiClient.get(url);

      // console.log('Get user all posts response:', response.data);
      return { ...response.data, reset }; // This is the payload for the `fulfilled` action
    } catch (error) {
      // console.log('Get user all posts error:', error);

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
const userAllPostsSlice = createSlice({
  name: "userPosts",
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
      .addCase(userAllPostsAPI.pending, (state, action) => {
        const { page = 1 } = action.meta.arg || {};
        if (page === 1) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(userAllPostsAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        
        const { data, pagination, reset } = action.payload;
        
        if (reset || state.currentPage === 1) {
          // Reset data for new filter or first page
          state.postsData = data;
        } else {
          // Append data for pagination
          state.postsData = [...state.postsData, ...data];
        }
        
        state.pagination = pagination;
        state.currentPage = pagination.current_page;
        state.hasMore = pagination.next_page !== null;
      })
      .addCase(userAllPostsAPI.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error =
          action.payload.message || action.payload.detail || JSON.stringify("Something went wrong");
      });
  },
});

export const { clearError, resetPosts, setLoadingMore } = userAllPostsSlice.actions; // Export the actions
export default userAllPostsSlice.reducer;
