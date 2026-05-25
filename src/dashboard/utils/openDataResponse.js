/** 서울 열린데이터광장 API 빈 응답 (HTTP 200 + INFO-200) */
export function getOpenDataEmptyMessage(data) {
    const code = data?.RESULT?.CODE;
    if (code === "INFO-200") {
        return data?.RESULT?.MESSAGE ?? "해당하는 데이터가 없습니다.";
    }
    return null;
}
