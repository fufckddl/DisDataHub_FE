import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../css/InquiryListPage.css";
import { getInquiryListApi } from "../../api/inquiryApi";

function InquiryListPage() {
  const navigate = useNavigate();

  const [inquiryList, setInquiryList] = useState([]);
  const [searchWord, setSearchWord] = useState("");
  const [inquiryStatus, setInquiryStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const inquiryStatusList = [
    { code: "", name: "전체 상태" },
    { code: "PROCESSING", name: "처리중" },
    { code: "ANSWERED", name: "답변 완료" },
  ];

  const getInquiryList = async () => {
    try {
      const data = await getInquiryListApi();

      if (data.result === "success") {
        setInquiryList(data.inquiryList ?? []);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("질문게시판 목록 조회 실패:", error);
    }
  };

  useEffect(() => {
    getInquiryList();
  }, []);

  const getInquiryStatusCode = (inquiry) => {
    const status =
      inquiry.statusCode ??
      inquiry.status ??
      inquiry.answerStatus ??
      inquiry.processStatus ??
      "";

    if (
      status === "ANSWERED" ||
      status === "COMPLETE" ||
      status === "DONE" ||
      status === "답변 완료"
    ) {
      return "ANSWERED";
    }

    return "PROCESSING";
  };

  const getInquiryStatusName = (inquiry) => {
    const statusCode = getInquiryStatusCode(inquiry);

    if (statusCode === "ANSWERED") {
      return "답변 완료";
    }

    return "처리중";
  };

  const getInquiryStatusClassName = (inquiry) => {
    const statusCode = getInquiryStatusCode(inquiry);

    if (statusCode === "ANSWERED") {
      return "inquiry-status-badge status-answered";
    }

    return "inquiry-status-badge status-received";
  };

  const filteredInquiryList = inquiryList.filter((inquiry) => {
    const title = inquiry.title ?? "";

    const matchSearch = title
      .toLowerCase()
      .includes(searchWord.toLowerCase());

    const matchStatus =
      inquiryStatus === "" || getInquiryStatusCode(inquiry) === inquiryStatus;

    return matchSearch && matchStatus;
  });

  const totalPage = Math.ceil(filteredInquiryList.length / pageSize);

  const pageList = Array.from({ length: totalPage }, (_, index) => index + 1);

  const currentPageInquiryList = filteredInquiryList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchWord, inquiryStatus]);

  useEffect(() => {
    if (totalPage > 0 && currentPage > totalPage) {
      setCurrentPage(totalPage);
    }
  }, [currentPage, totalPage]);

  const handleInquiryRowClick = (postId) => {
    navigate(`/board/inquiry/${postId}`);
  };

  const handleInquiryWriteClick = () => {
    navigate("/board/inquiry/write");
  };

  const handlePrevPage = () => {
    if (currentPage <= 1) return;
    setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage >= totalPage) return;
    setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleResetSearch = () => {
    setSearchWord("");
    setInquiryStatus("");
    setCurrentPage(1);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return dateValue.substring(0, 10);
  };

  return (
    <div className="container-fluid px-4 py-3 inquiry-list-page">
      <div className="inquiry-list-header">
        <div>
          <h1>문의 게시판</h1>
          <p>서비스 이용 중 궁금한 사항을 등록하고 답변을 확인할 수 있습니다.</p>
        </div>
      </div>

      <div className="inquiry-board-panel">
        <section className="inquiry-search-section">
          <input
            type="text"
            placeholder="질문 제목을 검색하세요"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
          />

          <select
            value={inquiryStatus}
            onChange={(e) => setInquiryStatus(e.target.value)}
          >
            {inquiryStatusList.map((status) => (
              <option key={status.code} value={status.code}>
                {status.name}
              </option>
            ))}
          </select>

          <button type="button" onClick={getInquiryList}>
            새로고침
          </button>

          <button
            type="button"
            className="inquiry-reset-button"
            onClick={handleResetSearch}
          >
            초기화
          </button>
        </section>

        <section className="inquiry-list-section">
          <div className="inquiry-list-toolbar">
            <div className="inquiry-list-count">
              총 <strong>{filteredInquiryList.length}</strong>건
            </div>

            <button
              type="button"
              className="inquiry-write-button"
              onClick={handleInquiryWriteClick}
            >
              질문 작성
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>번호</th>
                <th>제목</th>
                <th>작성자</th>
                <th>분류</th>
                <th>작성일</th>
                <th>상태</th>
                <th>조회수</th>
              </tr>
            </thead>

            <tbody>
              {currentPageInquiryList.map((inquiry) => (
                <tr
                  key={inquiry.postId}
                  className="inquiry-row"
                  onClick={() => handleInquiryRowClick(inquiry.postId)}
                >
                  <td>{inquiry.postId}</td>

                  <td className="inquiry-title-cell">
                    {inquiry.title || "제목 없음"}
                  </td>

                  <td>{inquiry.nickname || inquiry.writerName || "-"}</td>

                  <td>{inquiry.categoryName || inquiry.inquiryTypeName || "-"}</td>

                  <td>{formatDate(inquiry.createdAt)}</td>

                  <td>
                    <span className={getInquiryStatusClassName(inquiry)}>
                      {getInquiryStatusName(inquiry)}
                    </span>
                  </td>

                  <td>{inquiry.viewCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInquiryList.length === 0 && (
            <div className="inquiry-empty-message">
              등록된 질문이 없습니다.
            </div>
          )}

          {filteredInquiryList.length > 0 && (
            <div className="inquiry-list-bottom">
              <div className="inquiry-pagination">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                >
                  ‹
                </button>

                {pageList.map((page) => (
                  <button
                    type="button"
                    key={page}
                    className={page === currentPage ? "active" : ""}
                    onClick={() => handlePageClick(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPage || totalPage === 0}
                >
                  ›
                </button>
              </div>

              <div className="inquiry-page-info">
                총 {filteredInquiryList.length}건 / {currentPage}
                {totalPage > 0 ? ` / ${totalPage}페이지` : " / 0페이지"}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default InquiryListPage;