function SearchForm({type, title}){
    return(
        <>
            <div className="col">
                <div className="row">
                    <div className="col">{title}</div>
                </div>
                <div className="row">
                    <div className="col">
                        <input type={type} className="form-control"/>
                    </div>
                </div>
            </div>        
        </>
    )
}

function CardForm(){
    return(
        <>
            <div className="col">
                <div className="card p-3">
                    <div className="row">
                        <div className="col-2">
                            이미지
                        </div>
                        <div className="col">
                            글
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}


function UserDownloadMainPage(){
    return(
        <>
            <h3>사용자 다운로드 페이지</h3>

            {/* 상단 제목 */}
            <div className="row align-items-center p-2">
                <div className="col "> 
                    <div className="row">
                        <div className="col">
                            <h4 className="fw-bold mb-1">GIS 데이터 다운로드</h4>
                        </div>
                        <div className="col-auto">
                            <button className="btn btn-secondary">이용가이드</button>
                        </div>
                    </div>
                    <label >승인된 공공 데이터만 확인 가능</label>
                </div>

            </div>

            {/* 검색창 */}
            <div className="row p-2">
                <div className="col">
                    <div className="card p-3">
                        <div className="row mb-3">
                            <SearchForm type="text" title="검색"></SearchForm>
                            <SearchForm type="text" title="지역"></SearchForm>
                            <SearchForm type="text" title="파일 형식"></SearchForm>
                            <SearchForm type="text" title="데이터 유형"></SearchForm>
                            <SearchForm type="date" title="등록일"></SearchForm>
                        </div>
                        <div className="row">
                            <div className="col">
                                <button className="me-2 btn btn-light">초기화</button>
                                <button className="btn btn-primary">검색</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 중간 데시보드 카드 */}

            <div className="row p-2">
                <CardForm></CardForm>
                <CardForm></CardForm>
                <CardForm></CardForm>
                <CardForm></CardForm>
            </div>



        </>
    )
}

export default UserDownloadMainPage;