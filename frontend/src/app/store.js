import { configureStore } from "@reduxjs/toolkit";
import signupReducer from "../features/users/signupSlice";
import verifyotpReducer from "../features/users/verifyOTPSlice";
import loginReducer from "../features/users/loginSlice";
import forgotPasswordReducer from "../features/users/forgotPasswordSlice";
import confirmForgotPasswordReducer from "../features/users/confirmForgotPasswordSlice";
import changePasswordReducer from "../features/users/changePasswordSlice";
import userPostsReducer from "../features/blogs/getUserAllPostSlice";
import allPostReducer from "../features/blogs/getallPostSlice";
import userPostReducer from "../features/blogs/getUserPostSlice";
import createPostReducer from "../features/blogs/createPostSlice";
import updatePostReducer from "../features/blogs/updatePostSlice";
import deletePostReducer from "../features/blogs/deletePostSlice";
import getProfileReducer from "../features/users/getProfileSlice";
import likeReducer from "../features/blogs/likeSlice";
import commentReducer from "../features/blogs/commentSlice";

const store = configureStore({
  reducer: {
    signup: signupReducer,
    verifyotp: verifyotpReducer,
    login: loginReducer,
    forgotPassword: forgotPasswordReducer,
    confirmForgotPassword: confirmForgotPasswordReducer,
    changePassword: changePasswordReducer,
    userPosts: userPostsReducer,
    posts: allPostReducer,
    blog: userPostReducer,
    createPost: createPostReducer,
    updatePost: updatePostReducer,
    deletePost: deletePostReducer,
    getProfile: getProfileReducer,
    like: likeReducer,
    comment: commentReducer,
  },
});

export default store;
