import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";

// Toggle like for a blog post
export const toggleLikeAPI = createAsyncThunk(
  "like/toggleLike",
  async ({ blog_id }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/api/like-blog", { blog_id });
      
      // Determine action based on status code and message
      let action = 'liked';
      if (response.status === 204 || response.data.message?.includes('unliked')) {
        action = 'unliked';
      } else if (response.data.message?.includes('liked')) {
        action = 'liked';
      }
      
      return { 
        ...response.data, 
        blog_id,
        action,
        status: response.status
      };
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("Network error");
    }
  }
);

// Get liked users for a blog post
export const getLikedUsersAPI = createAsyncThunk(
  "like/getLikedUsers",
  async ({ blog_id }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/api/like-blog?blog_id=${blog_id}`);
      return { ...response.data, blog_id };
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("Network error");
    }
  }
);

const likeSlice = createSlice({
  name: "like",
  initialState: {
    likesData: {}, // Store likes by blog_id
    likedUsers: {}, // Store liked users by blog_id
    loading: false,
    error: null,
  },
  reducers: {
    resetLikeData: (state) => {
      state.likesData = {};
      state.likedUsers = {};
      state.error = null;
    },
    updateLocalLike: (state, action) => {
      const { blog_id, isLiked, total_likes } = action.payload;
      if (!state.likesData[blog_id]) {
        state.likesData[blog_id] = {};
      }
      if (isLiked !== undefined) {
        state.likesData[blog_id].isLiked = isLiked;
      }
      if (total_likes !== undefined) {
        state.likesData[blog_id].total_likes = total_likes;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Toggle like
      .addCase(toggleLikeAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleLikeAPI.fulfilled, (state, action) => {
        state.loading = false;
        const { blog_id, action: likeAction } = action.payload;
        
        if (!state.likesData[blog_id]) {
          state.likesData[blog_id] = { total_likes: 0, isLiked: false };
        }
        
        // Update like status
        const wasLiked = state.likesData[blog_id].isLiked;
        const isNowLiked = likeAction === 'liked';
        
        state.likesData[blog_id].isLiked = isNowLiked;
        
        // Update count based on action
        if (isNowLiked && !wasLiked) {
          state.likesData[blog_id].total_likes += 1;
        } else if (!isNowLiked && wasLiked) {
          state.likesData[blog_id].total_likes = Math.max(0, state.likesData[blog_id].total_likes - 1);
        }
        
        // Invalidate liked users list to force refresh
        state.likedUsers[blog_id] = null;
      })
      .addCase(toggleLikeAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to toggle like";
      })
      
      // Get liked users
      .addCase(getLikedUsersAPI.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLikedUsersAPI.fulfilled, (state, action) => {
        state.loading = false;
        const { blog_id, data } = action.payload;
        state.likedUsers[blog_id] = data || [];
        
        // Update isLiked status based on current user being in the liked users list
        // This will be handled by the useLikeStatus hook
      })
      .addCase(getLikedUsersAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to get liked users";
      });
  },
});

export const { resetLikeData, updateLocalLike } = likeSlice.actions;
export default likeSlice.reducer;
