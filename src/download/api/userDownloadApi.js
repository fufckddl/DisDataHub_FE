import axiosInstance from "../../commons/api/axiosinstance";

export const uploadTempTestFileApi = () => {
  const formData = new FormData();
  formData.append(
    "file",
    new File(["hello s3"], "sample.txt", { type: "text/plain" })
  );

  return axiosInstance.post("/api/s3/temp-files", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const downloadFileApi = ({ filePath, storedFilename, originalFilename }) => {
  return axiosInstance.get("/api/s3/files/download", {
    params: {
      filePath,
      storedFilename,
      originalFilename,
    },
    responseType: "blob",
  });
};

export const getDatasetDownloadPageApi = (datasetId) => {
  return axiosInstance.get(`/api/download/datasets/${datasetId}`)
}

export const getApprovedDownloadDatasetListApi = () => {
  return axiosInstance.get("/api/download/datasets");
}

export const getDatasetPreviewGeoJsonApi = (datasetId) => {
  return axiosInstance.get(`/api/download/datasets/${datasetId}/preview-geojson`)
}
