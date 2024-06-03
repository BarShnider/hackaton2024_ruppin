import { useData } from "../../contexts/AppContext";
import NavCard from "./NavCard";


function RoutesScreen() {
  const {routes} = useData()

  return (
    <div className="container">
      <div className="wrapper-results">
      <div className="nav-card totals" >
            <div className="from-to-card totals" >
                <span className="card-label">Total Time: {(routes.reduce((total, route) => total + route.time, 0)/60).toFixed(2)} Min.</span>
                <span className="card-label">Total Pollution: {routes.reduce((total, route) => total + route.pollution, 0).toFixed(2)}</span>

            </div>

        </div>
        
          {routes.map((route, index) => (
            <NavCard 
              key={index} 
              from={route.start} 
              to={route.end} 
              type={route.type} 
              pollution={route.pollution} 
              time={route.time} 
            />
          ))}
      </div>

    </div>
  );
}

export default RoutesScreen;
