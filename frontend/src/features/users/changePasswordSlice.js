import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../utils/apiClient";

// Define the async thunk for change password
export const changePasswordAPI = createAsyncThunk(
  "api/change-password", // Unique action type string
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/api/change-password`, data);
      // console.log("change-password response", response.data)

      return response.data; // This is the payload for the `fulfilled` action
    } catch (error) {
      if (error.response) {
        // Check for specific status codes and handle accordingly
        // const status = error.response.status;
        // console.log('change-password error', error.response.data)

        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("Network error");
    }
  }
);

// Create the slice
const changePasswordSlice = createSlice({
  name: "changePassword",
  initialState: {
    data: [],
    loading: false,
    error: null,
    isSuccess: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.isSuccess= false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changePasswordAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePasswordAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.isSuccess = true;
      })
      .addCase(changePasswordAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || action.payload.detail || "Failed to change password";
      });
  },
});

export const { clearError } = changePasswordSlice.actions; // Export the clearError action
export default changePasswordSlice.reducer;
