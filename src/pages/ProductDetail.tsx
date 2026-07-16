import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getProductBySku } from "../api/productDetail";
import AppTaxonomy from "../components/AppTaxonomy";

import {
  FaXTwitter,
  FaWhatsapp,
  FaFacebookF,
  FaRegCopy,
} from "react-icons/fa6";
import { MdOutlineEmail, MdShare } from "react-icons/md";

const shareIcons = [
  { icon: FaXTwitter, name: "X", color: "text-black" },
  { icon: MdOutlineEmail, name: "Email", color: "text-red-500" },
  { icon: FaWhatsapp, name: "WhatsApp", color: "text-green-500" },
  { icon: MdShare, name: "Share", color: "text-blue-500" },
  { icon: FaRegCopy, name: "Copy Link", color: "text-gray-600" },
  { icon: FaFacebookF, name: "Facebook", color: "text-blue-600" },
];

export default function ProductDetailPage() {
  const { sku } = useParams<{ sku: string }>();
  const [activeTab, setActiveTab] = useState<
    "description" | "technical" | "reviews" | "documents"
  >("description");

  // Asynchronous product states
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState("");

  // Handle async product fetching
  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      const result = await getProductBySku(sku);
      setProduct(result);
      setLoading(false);
    }

    loadProduct();
  }, [sku]);

  console.log(" product detail", product);

  // Sync selectedMedia once product data is loaded or changes
  useEffect(() => {
    if (product?.images?.length > 0) {
      setSelectedMedia(product.images[0]);
    } else {
      setSelectedMedia("");
    }
  }, [product]);

  // Helper to detect if a string is a YouTube URL
  const isYouTubeUrl = (url: string) => {
    return url
      ? url.includes("youtube.com") || url.includes("youtu.be")
      : false;
  };

  // Helper to extract clean embed ID from various YouTube formats
  const getYouTubeEmbedId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // 1. Loading State UI
  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  // 2. Fallback UI if product is not found after loading finishes
  if (!product) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-32 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Product Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          We couldn't find a product with SKU:{" "}
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{sku}</span>
        </p>
        <Link
          to="/"
          className="bg-orange-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-orange-700 transition"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 antialiased font-sans">

      {/* Dynamic Meta Head Tags */}
      <Helmet>
        <title>
          {product?.page_title || product?.product_name || "Product Details"}
        </title>
        <meta
          name="description"
          content={
            product?.meta_description ||
            product?.description ||
            "Product details page"
          }
        />

        {/* Open Graph / Social Media Tags (Optional Best Practice) */}
        <meta
          property="og:title"
          content={product?.meta_title || product?.product_name}
        />
        <meta property="og:description" content={product?.meta_description} />
        {product?.images?.[0] && (
          <meta property="og:image" content={product.images[0]} />
        )}
      </Helmet>

      <main className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
        <AppTaxonomy products={[product]} />
        {/* 2. Top Section: Core Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          {/* Left Column: Modern Media Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage View with Overlay Navigation Arrows */}
            <div className="relative group/main bg-white border border-gray-50 rounded-2xl overflow-hidden aspect-video flex items-center justify-center p-0 shadow-sm">
              {/* Left Arrow Button (Circular Loop) */}
              <button
                onClick={() => {
                  const currentIndex = product.images.indexOf(selectedMedia);
                  // If at the beginning, wrap around to the end of the array
                  const prevIndex =
                    currentIndex <= 0
                      ? product.images.length - 1
                      : currentIndex - 1;
                  setSelectedMedia(product.images[prevIndex]);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md border border-gray-50/50 rounded-full shadow-md text-gray-700 opacity-0 group-hover/main:opacity-100 transition-all duration-200 hover:bg-white hover:scale-105 active:scale-95"
                aria-label="Previous media"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Media Viewer */}
              {isYouTubeUrl(selectedMedia) ? (
                <iframe
                  className="w-full h-full rounded-xl"
                  src={`https://www.youtube.com/embed/${getYouTubeEmbedId(selectedMedia)}`}
                  title="Product Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <img
                  src={selectedMedia || "/placeholder-image.jpg"}
                  alt={product.product_name}
                  className="w-full h-full object-contain"
                />
              )}

              {/* Right Arrow Button (Circular Loop) */}
              <button
                onClick={() => {
                  const currentIndex = product.images.indexOf(selectedMedia);
                  // If at the end, wrap around to the first item
                  const nextIndex =
                    currentIndex === product.images.length - 1
                      ? 0
                      : currentIndex + 1;
                  setSelectedMedia(product.images[nextIndex]);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md border border-gray-50/50 rounded-full shadow-md text-gray-700 opacity-0 group-hover/main:opacity-100 transition-all duration-200 hover:bg-white hover:scale-105 active:scale-95"
                aria-label="Next media"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Scrollable Thumbnails row (Clean & Independent) */}
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-thin scrollbar-thumb-gray-300 w-full py-0.5">
              {product.images?.map((media: string, index: number) => {
                const isVideo = isYouTubeUrl(media);
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedMedia(media)}
                    className={`w-24 h-20 flex-shrink-0 border rounded-xl overflow-hidden bg-white snap-start relative flex items-center justify-center p-0 transition-all ${
                      selectedMedia === media
                        ? "border-orange-600 ring-2 ring-orange-100"
                        : "border-gray-50 hover:border-gray-200"
                    }`}
                  >
                    {isVideo ? (
                      <div className="relative w-full h-full bg-gray-900 flex items-center justify-center rounded-lg">
                        <span className="text-xs font-bold text-white tracking-wide">
                          VIDEO
                        </span>
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white pl-0.5 shadow-md">
                            ▶
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={media}
                        alt={`Thumbnail ${index}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Checkout Purchase Card & Meta */}
          <div className="lg:col-span-5 bg-white border border-gray-50 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-sm font-semibold text-orange-600 tracking-wider uppercase">
                  {product.brand}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight text-balance">
                {product.product_name}
              </h1>
              <p className="text-xs text-gray-400 mt-1">Code: {product.mpn}</p>
            </div>

            {/* Price block */}
            {/* Extract integer and cents dynamically */}
            {(() => {
              const priceNum = Number(product.price) || 0;
              const integerPart = Math.floor(priceNum);
              // Get the 2-digit cents (e.g., "99")
              const centsPart = (priceNum % 1).toFixed(2).split(".")[1];

              return (
                <div className="border-y border-gray-50 py-4 flex items-start gap-1">
                  {/* Main Price (Integer) */}
                  <span className="text-3xl font-black tracking-tight text-gray-900 leading-none">
                    {product.currency === "EUR" ? "€" : product.currency || "$"}
                    {integerPart}
                  </span>

                  {/* Column for Superscript Cents and VAT */}
                  <div className="flex flex-col items-start leading-none pt-0.5">
                    {/* Superscript Cents */}
                    <span className="text-sm font-bold tracking-tight text-gray-900">
                      .{centsPart}
                    </span>

                    {/* VAT Below Cents */}
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap mt-0.5">
                      incl. VAT
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Availability */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                In Stock
              </span>
            </div>

            {/* Interactive Quantity & Add Action */}
            <div className="flex gap-3">
              <div className="w-24 border border-gray-300 rounded-xl flex items-center justify-between px-3 bg-gray-50 focus-within:border-orange-500 transition-colors">
                <input
                  type="number"
                  defaultValue={1}
                  min={1}
                  className="w-full bg-transparent font-semibold text-center outline-none py-3 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-orange-600/10 active:scale-[0.99] transition transform-all uppercase tracking-wider text-sm">
                Add To Cart
              </button>
            </div>

            {/* Modern Native Social Share Layer */}
            <div className="flex items-center gap-2 pt-2 text-gray-500 border-t border-gray-100">
              <span className="text-xs font-semibold mr-2">Share item:</span>
              {shareIcons.map(({ icon: Icon, name, color }) => (
                <button
                  key={name}
                  title={name}
                  className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-orange-50 border border-gray-50 flex items-center justify-center transition-colors"
                >
                  <Icon className={`text-base ${color}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Bottom Section: Tabbed Content Panels */}
        <div className="bg-white border border-gray-50 rounded-2xl shadow-sm overflow-hidden">
          {/* Tab Selection Header */}
          <div className="flex border-b border-gray-50 bg-gray-50/70 px-4 pt-2 gap-2">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-3.5 text-sm font-bold tracking-wide rounded-t-xl transition-all border-t-2 -mb-px ${
                activeTab === "description"
                  ? "bg-white border-orange-600 text-orange-600 shadow-sm"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
            >
              Product Information
            </button>
            <button
              onClick={() => setActiveTab("technical")}
              className={`px-6 py-3.5 text-sm font-bold tracking-wide rounded-t-xl transition-all border-t-2 -mb-px ${
                activeTab === "technical"
                  ? "bg-white border-orange-600 text-orange-600 shadow-sm"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
            >
              Technical Information
            </button>

            <button
              onClick={() => setActiveTab("documents")}
              className={`px-6 py-3.5 text-sm font-bold tracking-wide rounded-t-xl transition-all border-t-2 -mb-px ${
                activeTab === "documents"
                  ? "bg-white border-orange-600 text-orange-600 shadow-sm"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
            >
              Documents
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-3.5 text-sm font-bold tracking-wide rounded-t-xl transition-all border-t-2 -mb-px ${
                activeTab === "reviews"
                  ? "bg-white border-orange-600 text-orange-600 shadow-sm"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
            >
              Reviews
            </button>
          </div>

          {/* Panel View Switcher */}
          <div className="p-6 md:p-8 min-h-[250px]">
            {/* {activeTab === "description" && <div>{product.content}</div>} */}
            {activeTab === "description" && (
              <div dangerouslySetInnerHTML={{ __html: product.content }} />
            )}

            {activeTab === "technical" && (
              <div className="space-y-8 max-w-4xl">
                <div dangerouslySetInnerHTML={{ __html: product.tech_spec }} />
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="max-w-4xl py-8">{/* Empty for now */}</div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-6 max-w-4xl">
                {product.documents && product.documents.length > 0 ? (
                  <div className="border border-gray-50 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm border-collapse">
                      <tbody className="divide-y divide-gray-100">
                        {product.documents.map((doc: string, idx: number) => {
                          // Extracts the file name from the path string (e.g., "manual.pdf")
                          const fileName =
                            doc.split("/").pop() || `Document ${idx + 1}`;

                          return (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="px-6 py-4 font-medium text-gray-700 truncate max-w-md">
                                {fileName}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <a
                                  href={doc}
                                  download
                                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                  </svg>
                                  Download
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No documents available for this product.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
