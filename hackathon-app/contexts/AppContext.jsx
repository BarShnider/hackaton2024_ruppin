import {createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AppContext = createContext();

function AppProvider({ children }) {
  
  const [routes,setRoutes] = useState([])
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate()
  const notifySuccess = (text) => toast.success(text);
  const notifyFail = (text) => toast.error(text)


  useEffect(function(){
    if(routes.length > 0){
      navigate("/routes")

    }
    else if (routes.length === 0 ){
      notifyFail("No Routes Found");
    }
  },[routes])

 
  return <AppContext.Provider value={{routes,isLoading,notifySuccess,notifyFail,setIsLoading,setRoutes}}>{children}</AppContext.Provider>;
}



function useData() {
    const context = useContext(AppContext);
    if (context === undefined)
      throw new Error("AppContext was used outside AppProvider");
    return context;
  }

export {AppProvider, useData}
