import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { POS } from "./pages/POS";
import { Inventory } from "./pages/Inventory";
import { Cashbook } from "./pages/Cashbook";
import { Customers } from "./pages/Customers";
import { Suppliers } from "./pages/Suppliers";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { BusinessTools } from "./pages/BusinessTools";
import { Team } from "./pages/Team";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "pos", Component: POS },
      { path: "inventory", Component: Inventory },
      { path: "cashbook", Component: Cashbook },
      { path: "customers", Component: Customers },
      { path: "team", Component: Team },
      { path: "suppliers", Component: Suppliers },
      { path: "reports", Component: Reports },
      { path: "settings", Component: Settings },
      { path: "tools", Component: BusinessTools },
    ],
  },
]);