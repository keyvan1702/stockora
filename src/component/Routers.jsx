
import { createBrowserRouter, useOutletContext } from "react-router-dom";

import Maindashboard from "../pages/Maindashboard";
import DashboardHome from "../component/DashboardHome";
import Store from "../component/Store";
import Outputs from "../component/Outputs";
import Customers from "../component/Customers";
import AddProduct from "../component/AddProduct";
import Settings from "../component/Settings";

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
  const { products, productTypes, actions } = useOutletContext();

  return <Store products={products} productTypes={productTypes} actions={actions} />;
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

const Routers = createBrowserRouter(
  [
    {
      path: "/",
      element: <Maindashboard />,
      children: [
        { index: true, element: <DashboardRoute /> },
        { path: "inventory", element: <InventoryRoute /> },
        { path: "outputs", element: <OutputsRoute /> },
        { path: "customers", element: <CustomersRoute /> },
        { path: "add-product", element: <AddProductRoute /> },
        { path: "settings", element: <SettingsRoute /> },
      ],
    },
  ],
  {
    basename: "/stockora",
  }
);

export default Routers;
