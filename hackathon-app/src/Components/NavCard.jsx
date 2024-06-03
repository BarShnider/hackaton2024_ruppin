function NavCard({from,to,type,pollution,time}) {
    return (
        <div className="nav-card">
            <div className="from-to-card">
                <span className="card-label">{from}<img style={{width:"30px", margin:"0px 10px"}} src={`${type}.png`} alt={"type"} />{to}</span>
                {/* <span className="card-label">to: {to}</span> */}
                {/* <span className="card-label"><img style={{width:"30px", marginRight:"10px"}} src={`${type}.png`} alt={"type"} /></span> */}
                <div className="info-item">
                <span className="card-label"><img style={{width:"30px", marginRight:"10px"}} src="clock.png" alt="air-pollution" /> {(time/60).toFixed(2)} Min.</span>
                </div>
                <div className="info-item">
                <span className="card-label"><img style={{width:"30px", marginRight:"10px"}} src="air-pollution.png" alt="air-pollution" /> {pollution.toFixed(2)}</span>
                </div>
            </div>

        </div>
    )
}

export default NavCard
