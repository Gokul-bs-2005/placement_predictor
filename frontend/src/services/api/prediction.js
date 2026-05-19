import API from "./client";

export const predictPlacement = (data) => API.post("/predict", data);
export const getStudents = (params) => API.get("/students", { params });
export const getHistory = () => API.get("/history");
export const getAnalytics = () => API.get("/analytics");
export const uploadDataset = (formData) => API.post("/upload-dataset", formData);
export const downloadReport = (data) =>
  API.post("/download-report", data, { responseType: "blob" });
