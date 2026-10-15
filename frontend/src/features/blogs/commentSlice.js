import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";

// Create a new comment
export const createCommentAPI = createAsyncThunk(
  "comment/createComment",
  async ({ blog_id, content, parent_id = null, user_id }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/api/comments", {
        user: user_id,    // Backend expects 'user' not 'user_id'
        blog: blog_id,    // Backend expects 'blog' not 'blog_id'
        parent_id,        // This is correct
        content           // This is correct
      });
      
      // Debug API response structure
      console.log("Create comment API response:", response.data);
      
      return { ...response.data, blog_id };
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("Network error");
    }
  }
);

// Get comments for a blog post
export const getCommentsAPI = createAsyncThunk(
  "comment/getComments",
  async ({ blog_id, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/api/all-comments/${blog_id}?page=${page}`);
      return { ...response.data, blog_id, page };
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("Network error");
    }
  }
);

// Update a comment
export const updateCommentAPI = createAsyncThunk(
  "comment/updateComment",
  async ({ comment_id, content }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/api/comments/${comment_id}`, {
        content,
      });
      
      // Debug update response
      console.log("Update comment API response:", response.data);
      
      return { ...response.data, comment_id };
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("Network error");
    }
  }
);

// Delete a comment
export const deleteCommentAPI = createAsyncThunk(
  "comment/deleteComment",
  async ({ comment_id }, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/api/comments/${comment_id}`);
      
      // Debug delete response  
      console.log("Delete comment API response:", response.data);
      
      return { ...response.data, comment_id };
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("Network error");
    }
  }
);

// Get comment details with replies
export const getCommentRepliesAPI = createAsyncThunk(
  "comment/getCommentReplies",
  async ({ comment_id }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/api/comments/${comment_id}`);
      return { ...response.data, comment_id };
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("Network error");
    }
  }
);

const commentSlice = createSlice({
  name: "comment",
  initialState: {
    commentsData: {}, // Store comments by blog_id
    commentsPagination: {}, // Store pagination info by blog_id
    showingAllComments: {}, // Track if showing all comments for blog_id
    commentReplies: {}, // Store replies by comment_id
    loadingReplies: {}, // Track loading state for replies by comment_id
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    error: null,
  },
  reducers: {
    resetCommentsData: (state) => {
      state.commentsData = {};
      state.commentsPagination = {};
      state.showingAllComments = {};
      state.commentReplies = {};
      state.loadingReplies = {};
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setShowingAllComments: (state, action) => {
      const { blog_id, showing } = action.payload;
      state.showingAllComments[blog_id] = showing;
    },
    initializeComments: (state, action) => {
      const { blog_id, comments } = action.payload;
      // Only initialize if we don't already have comments for this blog
      if (!state.commentsData[blog_id] || state.commentsData[blog_id].length === 0) {
        state.commentsData[blog_id] = comments || [];
      }
    },
    updateLocalComment: (state, action) => {
      const { blog_id, comment, action: commentAction } = action.payload;
      
      if (!state.commentsData[blog_id]) {
        state.commentsData[blog_id] = [];
      }
      
      if (commentAction === 'add') {
        state.commentsData[blog_id].unshift(comment);
      } else if (commentAction === 'update') {
        const index = state.commentsData[blog_id].findIndex(c => c.id === comment.id);
        if (index !== -1) {
          state.commentsData[blog_id][index] = comment;
        }
      } else if (commentAction === 'delete') {
        state.commentsData[blog_id] = state.commentsData[blog_id].filter(c => c.id !== comment.id);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create comment
      .addCase(createCommentAPI.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createCommentAPI.fulfilled, (state, action) => {
        state.creating = false;
        
        // Debug what we received
        console.log("createCommentAPI.fulfilled action.payload:", action.payload);
        
        const { blog_id } = action.payload;
        const data = action.payload.data || action.payload; // Handle different response structures
        
        console.log("Extracted data:", data);
        console.log("Blog ID:", blog_id);
        
        if (!state.commentsData[blog_id]) {
          state.commentsData[blog_id] = [];
        }
        
        // Check if data exists and has the necessary properties
        if (!data) {
          console.error("No comment data received from API");
          return;
        }
        
        // If it's a reply (has parent_id and parent_id is not null), update immediate parent comment's reply count
        if (data.parent_id !== null && data.parent_id !== undefined) {
          console.log("Processing reply with parent_id:", data.parent_id);
          
          // Find all comments (including replies) in the blog
          let allComments = [...state.commentsData[blog_id]];
          
          // Add replies from commentReplies to the search pool
          Object.values(state.commentReplies).forEach(repliesData => {
            if (repliesData && repliesData.comments) {
              allComments = [...allComments, ...repliesData.comments];
            }
          });
          
          // Find the immediate parent comment (not root parent)
          const immediateParent = allComments.find(c => (c.comment_id || c.id) === data.parent_id);
          
          if (immediateParent) {
            console.log("Found immediate parent:", immediateParent.id || immediateParent.comment_id);
            
            // Update the immediate parent's count in the main comments if it's there
            const parentIndex = state.commentsData[blog_id].findIndex(
              c => (c.comment_id || c.id) === data.parent_id
            );
            
            if (parentIndex !== -1) {
              // Parent is in main comments array
              state.commentsData[blog_id][parentIndex].comments_count = 
                (state.commentsData[blog_id][parentIndex].comments_count || 0) + 1;
              console.log("Updated immediate parent comment count in main comments:", 
                state.commentsData[blog_id][parentIndex].comments_count);
            } else {
              // Parent might be in commentReplies - update it there
              Object.keys(state.commentReplies).forEach(parentCommentId => {
                if (state.commentReplies[parentCommentId] && state.commentReplies[parentCommentId].comments) {
                  const replyIndex = state.commentReplies[parentCommentId].comments.findIndex(c =>
                    c && (c.comment_id || c.id) === data.parent_id
                  );
                  if (replyIndex !== -1) {
                    state.commentReplies[parentCommentId].comments[replyIndex].comments_count = 
                      (state.commentReplies[parentCommentId].comments[replyIndex].comments_count || 0) + 1;
                    console.log("Updated immediate parent comment count in replies:", 
                      state.commentReplies[parentCommentId].comments[replyIndex].comments_count);
                  }
                }
              });
            }
          } else {
            console.warn("Could not find immediate parent for reply:", data.parent_id);
          }
          
          // Also check in commentReplies if the parent's replies are loaded
          if (state.commentReplies[data.parent_id] && state.commentReplies[data.parent_id].comments) {
            state.commentReplies[data.parent_id].comments.unshift(data);
          }
        } else {
          // It's a parent comment (parent_id is null), add to the top
          state.commentsData[blog_id].unshift(data);
        }
      })
      .addCase(createCommentAPI.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload?.message || "Failed to create comment";
      })
      
      // Get comments
      .addCase(getCommentsAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCommentsAPI.fulfilled, (state, action) => {
        state.loading = false;
        const { blog_id, comments, page, pagination } = action.payload;
        
        // Store pagination info
        if (pagination) {
          state.commentsPagination[blog_id] = pagination;
        }
        
        if (page === 1) {
          // Replace comments for first page
          state.commentsData[blog_id] = comments || [];
          state.showingAllComments[blog_id] = true;
        } else {
          // Append comments for subsequent pages
          if (!state.commentsData[blog_id]) {
            state.commentsData[blog_id] = [];
          }
          state.commentsData[blog_id] = [...state.commentsData[blog_id], ...(comments || [])];
        }
      })
      .addCase(getCommentsAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to get comments";
      })
      
      // Update comment
      .addCase(updateCommentAPI.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateCommentAPI.fulfilled, (state, action) => {
        state.updating = false;
        
        // Debug what we received for update
        console.log("updateCommentAPI.fulfilled action.payload:", action.payload);
        
        const { data } = action.payload;
        const updateData = data || action.payload; // Handle different response structures
        
        console.log("Update data:", updateData);
        
        if (!updateData) {
          console.error("No comment data received for update");
          return;
        }
        
        // Find and update the comment in the appropriate blog's comments
        Object.keys(state.commentsData).forEach(blog_id => {
          const commentIndex = state.commentsData[blog_id].findIndex(c => 
            c && ((c.comment_id || c.id) === (updateData.comment_id || updateData.id))
          );
          if (commentIndex !== -1) {
            console.log("Found comment to update at index:", commentIndex);
            state.commentsData[blog_id][commentIndex] = { 
              ...state.commentsData[blog_id][commentIndex], 
              ...updateData 
            };
          }
        });
        
        // Also update in commentReplies if it's a reply
        Object.keys(state.commentReplies).forEach(parentId => {
          if (state.commentReplies[parentId] && state.commentReplies[parentId].comments) {
            const replyIndex = state.commentReplies[parentId].comments.findIndex(c =>
              c && ((c.comment_id || c.id) === (updateData.comment_id || updateData.id))
            );
            if (replyIndex !== -1) {
              console.log("Found reply to update at index:", replyIndex);
              state.commentReplies[parentId].comments[replyIndex] = {
                ...state.commentReplies[parentId].comments[replyIndex],
                ...updateData
              };
            }
          }
        });
      })
      .addCase(updateCommentAPI.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload?.message || "Failed to update comment";
      })
      
      // Delete comment
      .addCase(deleteCommentAPI.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteCommentAPI.fulfilled, (state, action) => {
        state.deleting = false;
        const { comment_id } = action.payload;
        
        if (!comment_id) {
          console.error("No comment ID received for deletion");
          return;
        }
        
        // First, find the comment to check if it's a reply (has parent_id)
        let deletedComment = null;
        let parentId = null;
        
        // Look for the comment in all blogs and replies to find its parent_id
        Object.keys(state.commentsData).forEach(blog_id => {
          const comment = state.commentsData[blog_id].find(c => 
            c && (c.comment_id || c.id) === comment_id
          );
          if (comment) {
            deletedComment = comment;
            parentId = comment.parent_id;
          }
        });
        
        // Also check in commentReplies
        if (!deletedComment) {
          Object.values(state.commentReplies).forEach(repliesData => {
            if (repliesData && repliesData.comments) {
              const comment = repliesData.comments.find(c => 
                c && (c.comment_id || c.id) === comment_id
              );
              if (comment) {
                deletedComment = comment;
                parentId = comment.parent_id;
              }
            }
          });
        }
        
        // If it's a reply (has parent_id), decrease immediate parent comment's reply count
        if (parentId) {
          // Find all comments (including replies) in all blogs
          let allComments = [];
          Object.keys(state.commentsData).forEach(blog_id => {
            allComments = [...allComments, ...state.commentsData[blog_id]];
          });
          
          // Add replies from commentReplies to the search pool
          Object.values(state.commentReplies).forEach(repliesData => {
            if (repliesData && repliesData.comments) {
              allComments = [...allComments, ...repliesData.comments];
            }
          });
          
          // Find the immediate parent comment (not root parent)
          const immediateParent = allComments.find(c => (c.comment_id || c.id) === parentId);
          
          if (immediateParent && immediateParent.comments_count > 0) {
            console.log("Found immediate parent for deletion:", immediateParent.id || immediateParent.comment_id);
            
            // Update the immediate parent's count in main comments if it's there
            Object.keys(state.commentsData).forEach(blog_id => {
              const parentIndex = state.commentsData[blog_id].findIndex(
                c => (c.comment_id || c.id) === parentId
              );
              
              if (parentIndex !== -1) {
                state.commentsData[blog_id][parentIndex].comments_count = Math.max(
                  (state.commentsData[blog_id][parentIndex].comments_count || 0) - 1,
                  0
                );
                console.log("Decreased immediate parent comment count in main comments:", 
                  state.commentsData[blog_id][parentIndex].comments_count);
              }
            });
            
            // Also update in commentReplies if the parent is there
            Object.keys(state.commentReplies).forEach(parentCommentId => {
              if (state.commentReplies[parentCommentId] && state.commentReplies[parentCommentId].comments) {
                const replyIndex = state.commentReplies[parentCommentId].comments.findIndex(c =>
                  c && (c.comment_id || c.id) === parentId
                );
                if (replyIndex !== -1) {
                  state.commentReplies[parentCommentId].comments[replyIndex].comments_count = Math.max(
                    (state.commentReplies[parentCommentId].comments[replyIndex].comments_count || 0) - 1,
                    0
                  );
                  console.log("Decreased immediate parent comment count in replies:", 
                    state.commentReplies[parentCommentId].comments[replyIndex].comments_count);
                }
              }
            });
          }
        }
        
        // Remove the comment from all blog comments
        Object.keys(state.commentsData).forEach(blog_id => {
          state.commentsData[blog_id] = state.commentsData[blog_id].filter(c => 
            c && (c.comment_id || c.id) !== comment_id
          );
        });
        
        // Also remove from comment replies if it exists there
        Object.keys(state.commentReplies).forEach(parentCommentId => {
          if (state.commentReplies[parentCommentId] && state.commentReplies[parentCommentId].comments) {
            state.commentReplies[parentCommentId].comments = state.commentReplies[parentCommentId].comments.filter(c =>
              c && (c.comment_id || c.id) !== comment_id
            );
          }
        });
      })
      .addCase(deleteCommentAPI.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload?.message || "Failed to delete comment";
      })
      
      // Get comment replies
      .addCase(getCommentRepliesAPI.pending, (state, action) => {
        const { comment_id } = action.meta.arg;
        state.loadingReplies[comment_id] = true;
        state.error = null;
      })
      .addCase(getCommentRepliesAPI.fulfilled, (state, action) => {
        const { comment_id, comments } = action.payload;
        state.loadingReplies[comment_id] = false;
        
        // Store the replies directly from the comments field
        if (comments) {
          state.commentReplies[comment_id] = { comments };
        }
      })
      .addCase(getCommentRepliesAPI.rejected, (state, action) => {
        const { comment_id } = action.meta.arg;
        state.loadingReplies[comment_id] = false;
        state.error = action.payload?.message || "Failed to load replies";
      });
  },
});

export const { resetCommentsData, clearError, setShowingAllComments, updateLocalComment, initializeComments } = commentSlice.actions;
export default commentSlice.reducer;
