import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { buildCategoryTreeV2 } from "../api/category";
import { getProductsByFlexLevel } from "../api/product";
import AppTaxonomy from "../components/AppTaxonomy";

export default function ProductPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();

  const [productsToDisplay, setProductsToDisplay] = useState<any[]>([]);
  const [allDbProducts, setAllDbProducts] = useState<any[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const [pageTitle, setPageTitle] = useState<string>("Products");
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const formatSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  useEffect(() => {
    setLoading(true);
    fetch("/db.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load products database");
        return res.json();
      })
      .then((rawData) => {
        const products = Array.isArray(rawData) ? rawData : rawData.data;
        setAllDbProducts(products ?? []);

        const tree = buildCategoryTreeV2(products ?? []);
        const result = getProductsByFlexLevel(
          tree,
          formatSlug,
          categorySlug,
          products,
        );

        setProductsToDisplay(result.products);
        setBreadcrumbs(result.breadcrumbs);
        setPageTitle(result.title);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error matching items for category layout:", err);
        setLoading(false);
      });
  }, [categorySlug]);

  console.log('product to display', productsToDisplay)

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center text-sm font-semibold text-gray-400 animate-pulse">
        Loading product collection...
      </div>
    );
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-8 bg-gray-50/50 min-h-screen font-sans antialiased">
      <AppTaxonomy products={productsToDisplay} />

      {/* 1. Dynamic Breadcrumbs */}
      <nav className="text-xs md:text-sm text-gray-500 mb-6 flex flex-wrap gap-1 items-center capitalize">
        <Link
          to="/"
          className="hover:text-orange-600 font-medium transition-colors"
        >
          Home
        </Link>
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <div key={idx} className="flex items-center gap-1">
              <span className="text-gray-300 px-1">/</span>
              {isLast ? (
                <span className="text-gray-800 font-semibold">{crumb}</span>
              ) : (
                <Link
                  to={`/product/${formatSlug(crumb)}`}
                  className="hover:text-orange-600 transition-colors"
                >
                  {crumb}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* 2. Page Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {productsToDisplay.length}
            </span>{" "}
            items found
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select className="text-xs border border-gray-200 rounded px-3 py-2.5 bg-white text-gray-700 shadow-sm outline-none focus:border-orange-500 cursor-pointer">
            <option>Default Sorting</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>

          <div className="flex items-center border border-gray-200 rounded bg-white p-0.5 shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors ${
                viewMode === "grid"
                  ? "bg-gray-100 text-orange-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="Grid View"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors ${
                viewMode === "list"
                  ? "bg-gray-100 text-orange-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="List View"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Product Presentation Grid/List */}
      {productsToDisplay.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center text-gray-400 border border-gray-200 shadow-sm">
          No individual items listed inside this category layer.
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              : "flex flex-col gap-4"
          }
        >
          {productsToDisplay.map((item) => {
            // Find full product details from db.json using the SKU
            const fullProduct =
              allDbProducts.find(
                (p) =>
                  p.sku &&
                  item.sku &&
                  p.sku.toLowerCase() === item.sku.toLowerCase(),
              ) || item;

            const productName =
              fullProduct.product_name ||
              fullProduct.name ||
              item.product_name ||
              item.name ||
              "Unnamed Product";

            const productImg =
              fullProduct.images?.[0] ||
              item.images?.[0] ||
              fullProduct.category_image ||
              item.category_image ||
              "https://via.placeholder.com/400x300?text=No+Product+Image";

            // Extract numeric price safely from fullProduct
            const rawPriceStr = String(
              fullProduct.price ??
                fullProduct.unitPrice ??
                fullProduct.cost ??
                item.price ??
                "",
            );

            const parsedPrice = parseFloat(rawPriceStr);
            const isValidPrice = !isNaN(parsedPrice) && parsedPrice >= 0;

            const formattedPrice = isValidPrice
              ? parsedPrice.toFixed(2)
              : "0.00";
            const [basePrice, decimalPrice] = formattedPrice.split(".");

            const productSku = encodeURIComponent(
              (fullProduct.sku || item.sku)?.toString() || "unknown-sku",
            );

            const displayId =
              fullProduct.sku ||
              item.sku ||
              fullProduct.mpn ||
              item.mpn ||
              "N/A";

            return (
              <div
                key={displayId || Math.random()}
                className={`bg-white border border-gray-200/80 rounded-xl hover:shadow-md hover:border-gray-300 transition-all duration-200 overflow-hidden group ${
                  viewMode === "grid"
                    ? "flex flex-col"
                    : "grid grid-cols-1 md:grid-cols-[160px_1fr_220px] items-stretch"
                }`}
              >
                {/* PRODUCT IMAGE LINK */}
                <Link
                  to={`/product/detail/${productSku}`}
                  className={`bg-gray-50 flex items-center justify-center relative overflow-hidden transition-opacity hover:opacity-90 ${
                    viewMode === "grid"
                      ? "w-full aspect-square p-6"
                      : "p-4 border-b md:border-b-0 md:border-r border-gray-100"
                  }`}
                >
                  <img
                    src={productImg}
                    alt={productName}
                    className={`object-contain mix-blend-multiply transform group-hover:scale-105 transition-transform duration-300 ease-out ${
                      viewMode === "grid"
                        ? "max-h-full max-w-full"
                        : "w-32 h-32 md:w-full md:h-full"
                    }`}
                    loading="lazy"
                  />
                </Link>

                {/* PRODUCT DETAILS LINK */}
                <Link
                  to={`/product/detail/${productSku}`}
                  className="p-5 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100 block hover:no-underline"
                >
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[11px] uppercase font-bold text-orange-600 tracking-wider">
                      {fullProduct.brand || item.brand || "Generic"}
                    </span>
                    <span className="text-gray-300 text-[10px]">•</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      SKU: {displayId}
                    </span>
                  </div>

                  <h3 className="text-sm md:text-base font-bold text-gray-800 group-hover:text-orange-600 transition-colors mb-3 leading-snug line-clamp-2">
                    {productName}
                  </h3>

                  <div>
                    <span className="inline-flex items-center text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                      In Stock
                    </span>
                  </div>
                </Link>

                {/* PRICE / ACTION PANEL (LIST VIEW) */}
                <div
                  className={`p-5 flex flex-col justify-center bg-gray-50/50 ${
                    viewMode === "grid" ? "hidden" : "flex"
                  }`}
                >
                  <div className="text-left md:text-right mb-4">
                    {isValidPrice ? (
                      <div className="flex items-baseline justify-start md:justify-end text-gray-900">
                        <span className="text-xs font-bold mr-0.5">€</span>
                        <span className="text-2xl font-black tracking-tight leading-none">
                          {basePrice}
                        </span>
                        <span className="text-xs font-bold">
                          .{decimalPrice}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-gray-500">
                        Price on Request
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 block font-normal mt-1">
                      incl. VAT taxes
                    </span>
                  </div>

                  <Link
                    to={`/product/detail/${productSku}`}
                    className="w-full text-center bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs uppercase tracking-wider py-3 px-4 rounded-lg shadow-sm hover:shadow transition-all active:scale-[0.99]"
                  >
                    View Details
                  </Link>
                </div>

                {/* PRICE / ACTION PANEL (GRID VIEW) */}
                {viewMode === "grid" && (
                  <div className="mt-auto p-4 pt-0 border-t border-gray-50 flex items-center justify-between gap-2">
                    <div className="text-gray-900">
                      {isValidPrice ? (
                        <div className="flex items-baseline">
                          <span className="text-xs font-bold">€</span>
                          <span className="text-lg font-black tracking-tight">
                            {basePrice}
                          </span>
                          <span className="text-xs font-bold">
                            .{decimalPrice}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-gray-500">
                          Price on Request
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/product/detail/${productSku}`}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] uppercase tracking-wide px-3 py-2 rounded-md transition-colors"
                    >
                      View
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
