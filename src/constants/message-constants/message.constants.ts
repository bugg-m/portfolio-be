import { StringObjectTypes } from "@src/types/app.types";

const Message: StringObjectTypes = {
    ALL_FIELDS_REQUIRED: "All fields are required!",
    ADMIN_SUMMARY_NOT_FOUND: "Admin summary not found!",
    ADMIN_REPOS_NOT_FOUND: "Admin github repos not found!",
    ADMIN_SUMMARY_FETCHED: "Admin summary fetched successfully",
    ADMIN_REPOS_FETCHED: "Admin repos fetched successfully",
    USERNAME_EMAIL_REQUIRED: "Invalid username or email",
    USER_ALREADY_EXISTS: "User already exists",
    USERNAME_ALREADY_EXISTS: "Username already exists",
    EMAIL_ALREADY_EXISTS: "Email already exists",
    USER_NOT_FOUND: "User not found",
    USER_ALREADY_REGISTERED: "User already registered",
    USER_LOGGED_IN: "User logged in",
    USER_CREATED_SUCCESSFULLY: "User created successfully",
    INVALID_PASSWORD: "Invalid password",
    INVALID_ADMIN_SECRET: "Invalid admin secret",
    INVALID_TOKEN: "Invalid token",
    USER_LOGGED_OUT: "User logged out",
    UNAUTHORIZED_REQUEST: "User is not authorized",
    REFRESH_TOKEN_EXPIRED: "Refresh token expired",
    ACCESS_TOKEN_REFRESHED: "Access token refreshed",
    SOMETHING_WENT_WRONG_REGISTERING_USER: "Something went wrong while registering the user",
    SOMETHING_WENT_WRONG_REGISTERING_AVATAR: "Something went wrong while uploading avatar to"
};

export { Message };
