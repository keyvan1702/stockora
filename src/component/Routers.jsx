import { createBrowserRouter } from "react-router-dom";
import Shopdashboard from "../Pages/Shopdashboard";
import Maindashboard from "./Shopdashboard/Maindashboard";
import Product from "./Shopdashboard/Product";
import Categories from "./Shopdashboard/Categories";
import Auth from "../Pages/Auth";




const Routers=createBrowserRouter([
    {
        path:"dashboard",
        element:<Shopdashboard/>,
        children:[
            {
                path:"",
                element:<Maindashboard/>
            },{
                path:"product",
                element:<Product/>
            },{
                path:"categories",
                element:<Categories/>
            }
        ]
    },{
        path:"auth",
        element:<Auth/>
    }
])


export default Routers