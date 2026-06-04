function BoardSearchBox (){
    return (
        <div className="board-search-box">
            <select>
                <option value="">전체</option>
                <option value="title">제목</option>
                <option value="content">내용</option>
                <option value="writer">작성자</option>
            </select>

            <input type="terxt" placeholder="검색어를 입력하세요"/>

            <button>검색</button>
        </div>
    );
}

export default BoardSearchBox;