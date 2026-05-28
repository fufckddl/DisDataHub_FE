import axios from "axios"

export const getNoticeListApi = async () => {
    const response = await axios.get(
        "http://localhost:8080/api/board/notices/findNoticeList"
    );

    return response.data;
};