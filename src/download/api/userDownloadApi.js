import axiosInstance from "../../commons/api/axiosinstance";



export const getDatasetDownloadPageApi = (datasetId) => {
  return axiosInstance.get(`/api/download/datasets/${datasetId}`)
}

export const getApprovedDownloadDatasetListApi = () => {
  return axiosInstance.get("/api/download/datasets");
}

export const getDownloadDatasetMainPageApi = (params) => {
  return axiosInstance.get("/api/download/datasets/search", {
    params,
  });
}

export const getDatasetPreviewGeoJsonApi = (datasetId) => {
  return axiosInstance.get(`/api/download/datasets/${datasetId}/preview-geojson`)
}

export const getDownloadDatasetFilApi = () => {
  
}




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

//  파일 다운로드
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

export const downloadDatasetByFormatApi = (datasetId, format) => {
  return axiosInstance.get(`/api/download/datasets/${datasetId}/download`, {
    params: { format },
    responseType: "blob",
  });
};

export const toggleDatasetFavoriteApi = (datasetId) => {
  return axiosInstance.post(`/api/download/datasets/${datasetId}/favorite`);
};

export const runPointRadiusSimulationApi = (datasetId, radius) => {
  return axiosInstance.post(`/api/download/simulation/datasets/${datasetId}/point-radius`, {
    radius,
  });
};

export const measureSimulationAreaApi = (datasetId, points) => {
  return axiosInstance.post(`/api/download/simulation/datasets/${datasetId}/measure-area`, {
    points,
  });
};
