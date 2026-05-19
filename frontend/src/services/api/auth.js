import API from "./client";

export const signup = (data) => API.post("/signup", data);
export const login = (data) => API.post("/login", data);
