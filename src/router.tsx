import { createBrowserRouter } from "react-router-dom";

import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/Product";
import ProductDetailPage from "./pages/ProductDetail";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />, // Your root grid view
      },

      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/category/:level1",
        element: <CategoryPage />,
      },
      {
        path: "/category/:level1?/:level2",
        element: <CategoryPage />,
      },
      {
        path: "/category/:level1?/:level2?/:level3",
        element: <CategoryPage />,
      },
      {
        path: "/product/:categorySlug",
        element: <ProductPage />,
      },
      {
        path: "/product/detail/:sku",
        element: <ProductDetailPage />,
      },
    ],
  },
]);
