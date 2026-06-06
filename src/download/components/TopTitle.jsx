function TopTitle({title, subTitle, showGuide}){
    return(
        <>
            <div className="row align-items-center mb-3">
                <div className="col"> 
                    <div className="row">
                        <div className="col">
                            <h2 className="fw-bold mb-2">{title}</h2>
                        </div>
                        {
                            showGuide &&
                            <div className="col-auto">
                                <button className="btn btn-light border text-secondary">
                                    <i className="bi bi-question-circle me-2"></i>
                                    이용가이드
                                </button>
                            </div>
                        }

                    </div>
                    <div className="text-secondary" style={{fontSize: "12px"}}>
                        {subTitle}
                    </div>
                    
                </div>
            </div>
        </>
    )
}

export default TopTitle;