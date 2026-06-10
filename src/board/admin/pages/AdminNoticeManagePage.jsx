import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAdminNoticeListApi, deleteNoticeApi } from "../../api/noticeApi";
import "../css/AdminNoticeManagePage.css";

function AdminNoticeManagePage() {
  const navigate = useNavigate();

  const [noticeList, setNoticeList] = useState([]);
  const [searchWord, setSearchWord] = useState("");
  const [visibilityStatus, setVisibilityStatus] = useState("");
  const [deletedYn, setDeletedYn] = useState("");
  const [isLoading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const getAdminNoticeList = async () => {
    try {
      setLoading(true);

      const data = await getAdminNoticeListApi();

      if (data.result === "success") {
        setNoticeList(data.adminNoticeList ?? data.adminNotice ?? []);
      }
    } catch (error) {
      console.error("관리자 공지사항 목록 조회 실패:", error);
      alert("공지사항 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdminNoticeList();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchWord, visibilityStatus, deletedYn]);

  const filteredNoticeList = useMemo(() => {
    return noticeList.filter((notice) => {
      const title = notice.title ?? "";

      const matchSearch = title
        .toLowerCase()
        .includes(searchWord.toLowerCase());

      const matchVisibility =
        visibilityStatus === "" || notice.visibilityStatus === visibilityStatus;

      const matchDeleted = deletedYn === "" || notice.deletedYn === deletedYn;

      return matchSearch && matchVisibility && matchDeleted;
    });
  }, [noticeList, searchWord, visibilityStatus, deletedYn]);

  const totalPage = Math.max(
    1,
    Math.ceil(filteredNoticeList.length / pageSize)
  );

  const startIndex = (currentPage - 1) * pageSize;

  const pagedNoticeList = filteredNoticeList.slice(
    startIndex,
    startIndex + pageSize
  );

  const pageNumbers = Array.from({ length: totalPage }, (_, index) => index + 1);

  useEffect(() => {
    if (currentPage > totalPage) {
      setCurrentPage(totalPage);
    }
  }, [currentPage, totalPage]);

  const totalCount = noticeList.length;

  const pinnedCount = noticeList.filter(
    (notice) => notice.pinnedYn === "Y" && notice.deletedYn === "N"
  ).length;

  const publicCount = noticeList.filter(
    (notice) =>
      notice.visibilityStatus === "PUBLIC" && notice.deletedYn === "N"
  ).length;

  const deletedCount = noticeList.filter(
    (notice) => notice.deletedYn === "Y"
  ).length;

  const getVisibilityClassName = (visibilityStatus) => {
    if (visibilityStatus === "PUBLIC") return "visibility-public";
    if (visibilityStatus === "PRIVATE") return "visibility-private";
    return "";
  };

  const getVisibilityName = (visibilityStatus) => {
    if (visibilityStatus === "PUBLIC") return "공개";
    if (visibilityStatus === "PRIVATE") return "비공개";
    return "-";
  };

  const formatDate = (createdAt) => {
    if (!createdAt) return "-";
    return createdAt.substring(0, 10);
  };

  const handleMoveDetail = (postId) => {
    navigate(`/admin/board/notice/${postId}`);
  };

  const handleResetSearch = () => {
    setSearchWord("");
    setVisibilityStatus("");
    setDeletedYn("");
    setCurrentPage(1);
  };

  const handleDelete = async (postId) => {
    const isConfirm = window.confirm(
      `${postId}번 공지사항을 삭제하시겠습니까?`
    );

    if (!isConfirm) {
      return;
    }

    try {
      const data = await deleteNoticeApi(postId);

      if (data.result === "success") {
        alert("공지사항이 삭제되었습니다.");
        getAdminNoticeList();
      } else {
        alert("공지사항 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("공지사항 삭제 실패:", error);
      alert("공지사항 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container-fluid px-4 py-3 admin-notice-manage-page">
      <section className="admin-notice-header">
        <div>
          <h1>공지사항 관리</h1>
          <p>공지사항 등록, 수정, 삭제 및 공개 상태를 관리합니다.</p>
        </div>
      </section>

      <section className="admin-notice-summary-section">
        <div className="admin-notice-summary-card">
          <p>전체 공지</p>
          <strong>{totalCount}건</strong>
          <span>삭제 포함 전체 공지사항</span>
        </div>

        <div className="admin-notice-summary-card">
          <p>상단 고정</p>
          <strong>{pinnedCount}건</strong>
          <span>현재 고정된 공지사항</span>
        </div>

        <div className="admin-notice-summary-card">
          <p>공개 공지</p>
          <strong>{publicCount}건</strong>
          <span>사용자에게 공개 중인 공지</span>
        </div>

        <div className="admin-notice-summary-card">
          <p>삭제 공지</p>
          <strong>{deletedCount}건</strong>
          <span>삭제 처리된 공지사항</span>
        </div>
      </section>

      <section className="admin-notice-board-section">
        <div className="admin-notice-filter-section">
          <input
            type="text"
            placeholder="제목을 입력하세요."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
          />

          <select
            value={visibilityStatus}
            onChange={(e) => setVisibilityStatus(e.target.value)}
          >
            <option value="">공개 여부 전체</option>
            <option value="PUBLIC">공개</option>
            <option value="PRIVATE">비공개</option>
          </select>

          <select
            value={deletedYn}
            onChange={(e) => setDeletedYn(e.target.value)}
          >
            <option value="">삭제 여부 전체</option>
            <option value="N">정상 게시글</option>
            <option value="Y">삭제된 게시글</option>
          </select>

          <button
            type="button"
            className="notice-reset-button"
            onClick={handleResetSearch}
          >
            초기화
          </button>
        </div>

        <div className="admin-notice-table-header">
          <div>
            <h2>공지사항 목록</h2>
            <span>
              검색 결과 {filteredNoticeList.length}건 / 전체 {totalCount}건
            </span>
          </div>

          <Link to="/admin/board/notice/write" className="notice-write-button">
            공지 작성
          </Link>
        </div>

        <div className="admin-notice-table-wrap">
          <table>
            <thead>
              <tr>
                <th>번호</th>
                <th>제목</th>
                <th>분류</th>
                <th>상단고정</th>
                <th>공개여부</th>
                <th>삭제여부</th>
                <th>작성일</th>
                <th>관리</th>
              </tr>
            </thead>

            <tbody>
              {pagedNoticeList.map((notice) => (
                <tr
                  key={notice.postId}
                  className={
                    notice.deletedYn === "Y"
                      ? "deleted-notice-row clickable-row"
                      : "clickable-row"
                  }
                  onClick={() => handleMoveDetail(notice.postId)}
                >
                  <td>{notice.postId}</td>

                  <td className="notice-title-cell">
                    <span className="notice-title-text">{notice.title}</span>

                    {notice.deletedYn === "Y" && (
                      <span className="notice-deleted-text">삭제됨</span>
                    )}
                  </td>

                  <td>
                    <span className="notice-category-badge">공지사항</span>
                  </td>

                  <td>
                    <span
                      className={
                        notice.pinnedYn === "Y"
                          ? "notice-pinned-badge active"
                          : "notice-pinned-badge"
                      }
                    >
                      {notice.pinnedYn === "Y" ? "고정" : "일반"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`notice-visibility-badge ${getVisibilityClassName(
                        notice.visibilityStatus
                      )}`}
                    >
                      {getVisibilityName(notice.visibilityStatus)}
                    </span>
                  </td>

                  <td>
                    {notice.deletedYn === "Y" ? (
                      <span className="notice-delete-status deleted">
                        삭제됨
                      </span>
                    ) : (
                      <span className="notice-delete-status active">정상</span>
                    )}
                  </td>

                  <td>{formatDate(notice.createdAt)}</td>

                  <td>
                    {notice.deletedYn === "N" ? (
                      <div className="notice-action-buttons">
                        <Link
                          to={`/admin/board/notice/edit/${notice.postId}`}
                          className="notice-edit-button"
                          onClick={(e) => e.stopPropagation()}
                        >
                          수정
                        </Link>

                        <button
                          type="button"
                          className="notice-delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notice.postId);
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    ) : (
                      <span className="notice-disabled-action">삭제 처리됨</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && (
          <div className="admin-notice-empty-message">
            공지사항 목록을 불러오는 중입니다.
          </div>
        )}

        {!isLoading && filteredNoticeList.length === 0 && (
          <div className="admin-notice-empty-message">검색 결과가 없습니다.</div>
        )}

        {!isLoading && filteredNoticeList.length > 0 && (
          <div className="admin-notice-list-bottom">
            <div className="admin-notice-pagination">
              <button
                type="button"
                className="pagination-arrow-button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={currentPage === pageNumber ? "active" : ""}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                className="pagination-arrow-button"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPage))
                }
                disabled={currentPage === totalPage}
              >
                &gt;
              </button>
            </div>

            <div className="admin-notice-page-info">
              {currentPage} / {totalPage}페이지
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminNoticeManagePage;