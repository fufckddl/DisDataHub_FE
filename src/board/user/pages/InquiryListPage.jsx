import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInquiryListApi } from "../../api/inquiryApi";
import "../css/InquiryListPage.css";

function InquiryListPage() {
  const navigate = useNavigate();

  const [inquiryList, setInquiryList] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [searchWord, setSearchWord] = useState("");

  const getInquiryList = async () => {
    try {
      setLoading(true);

      const data = await getInquiryListApi();

      if (data.result === "success") {
        setInquiryList(data.inquiryList ?? []);
      }
    } catch (error) {
      console.error("문의 게시판 목록 조회 실패:", error);
      alert("문의 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInquiryList();
  }, []);

  const filteredInquiryList = inquiryList.filter((inquiry) =>
    inquiry.title?.toLowerCase().includes(searchWord.toLowerCase())
  );

  const handleInquiryClick = (postId) => {
    navigate(`/board/inquiry/${postId}`);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  const getInquiryStatusName = (statusCode) => {
    if (statusCode === "RECEIVED") return "접수완료";
    if (statusCode === "ANSWERED") return "답변완료";
    return statusCode ?? "-";
  };

  const getStatusClassName = (statusCode) => {
    if (statusCode === "RECEIVED") return "status-received";
    if (statusCode === "ANSWERED") return "status-answered";
    return "";
  };

  const getVisibilityName = (visibilityStatus) => {
    if (visibilityStatus === "PUBLIC") return "공개";
    if (visibilityStatus === "PRIVATE") return "비공개";
    return "-";
  };

  return (
    <div className="inquiry-list-page">
      <section className="inquiry-list-header">
        <div>
          <h1>문의 게시판</h1>
          <p>서비스 이용 중 궁금한 내용을 문의할 수 있습니다.</p>
        </div>

        <button
          type="button"
          className="inquiry-write-button"
          onClick={() => navigate("/board/inquiry/write")}
        >
          문의 작성
        </button>
      </section>

      <section className="inquiry-search-section">
        <input
          type="text"
          placeholder="문의 제목을 검색하세요."
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
        />

        <button type="button" onClick={getInquiryList}>
          새로고침
        </button>
      </section>

      <section className="inquiry-list-section">
        <table>
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>문의유형</th>
              <th>상태</th>
              <th>공개여부</th>
              <th>작성일</th>
              <th>조회수</th>
            </tr>
          </thead>

          <tbody>
            {filteredInquiryList.map((inquiry) => (
              <tr
                key={inquiry.postId}
                className="inquiry-row"
                onClick={() => handleInquiryClick(inquiry.postId)}
              >
                <td>{inquiry.postId}</td>
                <td className="inquiry-title-cell">{inquiry.title}</td>
                <td>{inquiry.inquiryCategoryCode}</td>
                <td>
                  <span
                    className={`inquiry-status-badge ${getStatusClassName(
                      inquiry.inquiryStatusCode
                    )}`}
                  >
                    {getInquiryStatusName(inquiry.inquiryStatusCode)}
                  </span>
                </td>
                <td>{getVisibilityName(inquiry.visibilityStatus)}</td>
                <td>{formatDate(inquiry.createdAt)}</td>
                <td>{inquiry.viewCount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading && (
          <div className="inquiry-empty-message">
            문의 목록을 불러오는 중입니다.
          </div>
        )}

        {!isLoading && filteredInquiryList.length === 0 && (
          <div className="inquiry-empty-message">
            등록된 문의가 없습니다.
          </div>
        )}
      </section>
    </div>
  );
}

export default InquiryListPage;