import { createBrowserRouter, useOutletContext, Navigate } from "react-router-dom";

import App from "../App";
import Maindashboard from "../pages/Maindashboard";
import DashboardHome from "../component/DashboardHome";
import Store from "../component/Store";
import Outputs from "../component/Outputs";
import Customers from "../component/Customers";
import AddProduct from "../component/AddProduct";
import Settings from "../component/Settings";
import StockLog from "../component/StockLog";
import LoginPage from "../component/LoginPage";
import { useAuth } from "../component/AuthContext";

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function DashboardRoute() {
  const { products, productTypes, customers, transactions } = useOutletContext();
  return (
    <DashboardHome
      products={products}
      productTypes={productTypes}
      customers={customers}
      transactions={transactions}
    />
  );
}

function InventoryRoute() {
  const { products, productTypes } = useOutletContext();
  return <Store products={products} productTypes={productTypes} />;
}

function OutputsRoute() {
  const { transactions } = useOutletContext();
  return <Outputs transactions={transactions} />;
}

function CustomersRoute() {
  const { customers, actions, products, productTypes, transactions } =
    useOutletContext();
  return (
    <Customers
      customers={customers}
      actions={actions}
      products={products}
      productTypes={productTypes}
      transactions={transactions}
    />
  );
}

function AddProductRoute() {
  const { products, productTypes, actions } = useOutletContext();
  return (
    <AddProduct
      products={products}
      productTypes={productTypes}
      actions={actions}
    />
  );
}

function SettingsRoute() {
  const { productTypes, products, actions } = useOutletContext();
  return (
    <Settings
      productTypes={productTypes}
      products={products}
      actions={actions}
    />
  );
}

function StockLogRoute() {
  const { transactions } = useOutletContext();
  return <StockLog transactions={transactions} />;
}

const Routers = createBrowserRouter(
  [
    { path: "/login", element: <LoginPage /> },
    {
      path: "/",
      element: <App />,
      children: [
        {
          path: "",
          element: (
            <RequireAuth>
              <Maindashboard />
            </RequireAuth>
          ),
          children: [
            { path: "", element: <DashboardRoute /> },
            { path: "inventory", element: <InventoryRoute /> },
            { path: "outputs", element: <OutputsRoute /> },
            { path: "customers", element: <CustomersRoute /> },
            { path: "add-product", element: <AddProductRoute /> },
            { path: "settings", element: <SettingsRoute /> },
            { path: "stock-log", element: <StockLogRoute /> },
          ],
        },
      ],
    },
  ],
  {
    basename: "/stockora",
  }
);

export default Routers;