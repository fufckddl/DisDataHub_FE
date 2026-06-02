import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminNoticeListApi, deleteNoticeApi } from "../../api/noticeApi";
import "../css/AdminNoticeManagePage.css";

function AdminNoticeManagePage() {
  const [noticeList, setNoticeList] = useState([]);
  const [searchWord, setSearchWord] = useState("");
  const [visibilityStatus, setVisibilityStatus] = useState("");
  const [isLoading, setLoading] = useState(false);

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

  const filteredNoticeList = noticeList.filter((notice) => {
    const matchSearch = notice.title
      ?.toLowerCase()
      .includes(searchWord.toLowerCase());

    const matchVisibility =
      visibilityStatus === "" || notice.visibilityStatus === visibilityStatus;

    return matchSearch && matchVisibility;
  });

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
    <div className="admin-notice-manage-page">
      <section className="admin-notice-header">
        <div>
          <h1>공지사항 관리</h1>
          <p>공지사항을 등록하고 관리할 수 있습니다.</p>
        </div>
      </section>

      <section className="admin-notice-summary-section">
        <div className="admin-notice-summary-card">
          <div className="summary-icon">📄</div>

          <div>
            <p>전체 공지</p>
            <strong>{totalCount}건</strong>
            <span>삭제 포함 전체 공지사항</span>
          </div>
        </div>

        <div className="admin-notice-summary-card">
          <div className="summary-icon">⭐</div>

          <div>
            <p>중요 공지</p>
            <strong>{pinnedCount}건</strong>
            <span>상단 고정된 중요 공지</span>
          </div>
        </div>

        <div className="admin-notice-summary-card">
          <div className="summary-icon">📢</div>

          <div>
            <p>공개 공지</p>
            <strong>{publicCount}건</strong>
            <span>현재 공개 중인 공지</span>
          </div>
        </div>

        <div className="admin-notice-summary-card">
          <div className="summary-icon">🗑️</div>

          <div>
            <p>삭제 공지</p>
            <strong>{deletedCount}건</strong>
            <span>삭제 처리된 공지사항</span>
          </div>
        </div>
      </section>

      <section className="admin-notice-filter-section">
        <div className="filter-item search-item">
          <label>제목 검색</label>

          <input
            type="text"
            placeholder="제목을 입력하세요."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label>공개 여부</label>

          <select
            value={visibilityStatus}
            onChange={(e) => setVisibilityStatus(e.target.value)}
          >
            <option value="">전체</option>
            <option value="PUBLIC">공개</option>
            <option value="PRIVATE">비공개</option>
          </select>
        </div>

        <button
          type="button"
          className="notice-search-button"
          onClick={getAdminNoticeList}
        >
          🔍 새로고침
        </button>

        <Link to="/admin/board/notice/write" className="notice-write-button">
          ✎ 공지 작성
        </Link>
      </section>

      <section className="admin-notice-table-section">
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
            {filteredNoticeList.map((notice) => (
              <tr
                key={notice.postId}
                className={notice.deletedYn === "Y" ? "deleted-notice-row" : ""}
              >
                <td>{notice.postId}</td>

                <td className="notice-title-cell">
                  <Link to={`/admin/board/notice/${notice.postId}`}>
                    {notice.title}
                  </Link>

                  {notice.deletedYn === "Y" && (
                    <span className="notice-deleted-text">삭제됨</span>
                  )}
                </td>

                <td>
                  <span className="notice-category-badge category-system">
                    공지사항
                  </span>
                </td>

                <td>
                  <span
                    className={
                      notice.pinnedYn === "Y"
                        ? "notice-pinned-star active"
                        : "notice-pinned-star"
                    }
                  >
                    {notice.pinnedYn === "Y" ? "★" : "☆"}
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
                    <span className="notice-delete-status active">
                      정상
                    </span>
                  )}
                </td>

                <td>{formatDate(notice.createdAt)}</td>

                <td>
                  {notice.deletedYn === "N" ? (
                    <div className="notice-action-buttons">
                      <Link
                        to={`/admin/board/notice/edit/${notice.postId}`}
                        className="notice-edit-button"
                      >
                        수정
                      </Link>

                      <button
                        type="button"
                        className="notice-delete-button"
                        onClick={() => handleDelete(notice.postId)}
                      >
                        삭제
                      </button>
                    </div>
                  ) : (
                    <span className="notice-disabled-action">
                      삭제 처리됨
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading && (
          <div className="admin-notice-empty-message">
            공지사항 목록을 불러오는 중입니다.
          </div>
        )}

        {!isLoading && filteredNoticeList.length === 0 && (
          <div className="admin-notice-empty-message">
            검색 결과가 없습니다.
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminNoticeManagePage;