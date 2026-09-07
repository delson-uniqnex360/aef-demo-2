import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getProductBySku } from "../api/productDetail";
import AppTaxonomy from "../components/AppTaxonomy";
import AppTaxonomyV2 from "../components/AppTaxonomyv2";

import {
  FaXTwitter,
  FaWhatsapp,
  FaFacebookF,
  FaRegCopy,
} from "react-icons/fa6";
import { MdOutlineEmail, MdShare } from "react-icons/md";

// Icon definition with exact background colors matching reference UI
const shareIcons = [
  { icon: FaXTwitter, name: "X", bg: "bg-black text-white" },
  { icon: MdOutlineEmail, name: "Email", bg: "bg-gray-500 text-white" },
  { icon: FaWhatsapp, name: "WhatsApp", bg: "bg-[#25D366] text-white" },
  { icon: MdShare, name: "Share", bg: "bg-[#8ed743] text-white" },
  { icon: FaRegCopy, name: "Copy Link", bg: "bg-[#0f6b32] text-white" },
  { icon: FaFacebookF, name: "Facebook", bg: "bg-[#4267B2] text-white" },
];

export default function ProductDetailPage() {
  const { sku } = useParams<{ sku: string }>();

  const [searchParams, setSearchParams] = useSearchParams();

  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Asynchronous product states
  const [product, setProduct] = useState<any>(null);
  const [baseProduct, setBaseProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState("");
  const [isScrollable, setIsScrollable] = useState(false);

  // Stores active selection for each variant group: { [groupName]: selectedCode }
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});

  // Helper to extract strictly unique options per group based on visible text/value
  const getUniqueGroupOptions = (options: any[]) => {
    if (!Array.isArray(options)) return [];

    const seenValues = new Set<string>();
    const uniqueItems: any[] = [];

    options.forEach((item) => {
      const rawLabel = (
        item.option ||
        item.name ||
        item.value ||
        item.label ||
        item.code ||
        item.sku ||
        ""
      )
        .toString()
        .trim();

      if (!rawLabel) return;

      // Convert to lowercase to treat "Z/P", "z/p", and "Z/p" as duplicate entries
      const normalizedKey = rawLabel.toLowerCase();

      if (!seenValues.has(normalizedKey)) {
        seenValues.add(normalizedKey);
        uniqueItems.push(item);
      }
    });

    // Natural alphanumeric sort (1 -> 9 -> A -> Z)
    return uniqueItems.sort((a, b) => {
      const labelA = (
        a.option ||
        a.name ||
        a.value ||
        a.label ||
        a.code ||
        a.sku ||
        ""
      ).toString();

      const labelB = (
        b.option ||
        b.name ||
        b.value ||
        b.label ||
        b.code ||
        b.sku ||
        ""
      ).toString();

      return labelA.localeCompare(labelB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  };

  // Helper to fetch product data with selected variant permutations from API
  const fetchProductData = async (
    targetSku: string,
    variantSelections: Record<string, string>,
  ) => {
    try {
      // Pass variant selection parameters directly to the API endpoint
      const result = await getProductBySku(targetSku, variantSelections);
      return result;
    } catch (error) {
      console.error("Failed to fetch product for variants:", error);
      return null;
    }
  };

  // 1. Initial product load
  useEffect(() => {
    async function loadInitialProductData() {
      if (!sku) return;
      setLoading(true);

      try {
        const baseResult = await getProductBySku(sku);
        setBaseProduct(baseResult);

        // Populate selected variants from URL query parameters
        const initialSelections: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          initialSelections[key] = value;
        });

        // If variants exist, select the first available option for any missing group
        const variants = baseResult?.variants;
        if (variants && Object.keys(variants).length > 0) {
          Object.entries(variants).forEach(
            ([groupName, rawOptions]: [string, any]) => {
              if (!initialSelections[groupName]) {
                const uniqueOptions = getUniqueGroupOptions(rawOptions);
                if (uniqueOptions.length > 0) {
                  const firstOpt = uniqueOptions[0];
                  const displayLabel =
                    firstOpt.option ||
                    firstOpt.name ||
                    firstOpt.value ||
                    firstOpt.label ||
                    firstOpt.code;
                  const variantCode =
                    firstOpt.code || firstOpt.sku || displayLabel;

                  initialSelections[groupName] = variantCode;
                }
              }
            },
          );

          // Reflect default variant selections back into the URL search params
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              Object.entries(initialSelections).forEach(([key, val]) => {
                next.set(key, val);
              });
              return next;
            },
            { replace: true },
          );
        }

        setSelectedVariants(initialSelections);

        // Fetch display data if initial variant parameters exist
        if (Object.keys(initialSelections).length > 0) {
          const variantResult = await fetchProductData(sku, initialSelections);
          setProduct(variantResult || baseResult);
        } else {
          setProduct(baseResult);
        }
      } catch (error) {
        console.error("Failed to load product details:", error);
      } finally {
        setLoading(false);
      }
    }

    loadInitialProductData();
  }, [sku]);

  // Sync selectedMedia once product data is loaded or active variant changes
  useEffect(() => {
    if (product?.images?.length > 0) {
      setSelectedMedia(product.images[0]);
    } else {
      setSelectedMedia("");
    }
  }, [product]);

  useEffect(() => {
    if (!product?.images) return;

    const activeIndex = product.images.indexOf(selectedMedia);
    const activeThumbnail = thumbnailRefs.current[activeIndex];
    const container = scrollContainerRef.current;

    if (activeThumbnail && container) {
      const thumbnailLeft = activeThumbnail.offsetLeft;
      const thumbnailWidth = activeThumbnail.offsetWidth;
      const containerWidth = container.clientWidth;

      container.scrollTo({
        left: thumbnailLeft - containerWidth / 2 + thumbnailWidth / 2,
        behavior: "smooth",
      });
    }
  }, [selectedMedia, product?.images]);

  useEffect(() => {
    const checkScrollable = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setIsScrollable(scrollWidth > clientWidth);
      }
    };

    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [product?.images]);

  // Handle toggling/selecting options across any combination of variants
  const handleVariantSelect = async (groupName: string, code: string) => {
    if (!sku) return;

    const nextSelections = { ...selectedVariants };

    // Toggle selection: unselect if clicking the active option, or set new code
    if (nextSelections[groupName] === code) {
      delete nextSelections[groupName];
    } else {
      nextSelections[groupName] = code;
    }

    setSelectedVariants(nextSelections);

    // Update URL parameters dynamically to mirror active variant state
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (nextSelections[groupName]) {
          next.set(groupName, code);
        } else {
          next.delete(groupName);
        }
        return next;
      },
      { replace: true },
    );

    // Call API with updated variant combination to fetch precise price and data
    const updatedProduct = await fetchProductData(sku, nextSelections);
    if (updatedProduct) {
      setProduct(updatedProduct);
    }
  };

  // Loading State UI
  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  // Fallback UI if product is not found
  if (!product) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-48 text-center">
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

  const taxonomyData = baseProduct || product;
  const availableVariants = baseProduct?.variants || product?.variants;

  return (
    <div className="bg-white min-h-screen text-gray-900 antialiased font-sans py-28">
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
        <meta
          property="og:title"
          content={product?.meta_title || product?.product_name}
        />
        <meta property="og:description" content={product?.meta_description} />
        {product?.images?.[0] && (
          <meta property="og:image" content={product.images[0]} />
        )}
      </Helmet>

      <div className="max-w-[1200px] mx-auto px-4">
        <div>
          {sku === "0103152038" ? (
            <AppTaxonomyV2 products={[taxonomyData]} />
          ) : (
            <AppTaxonomy products={[taxonomyData]} />
          )}
        </div>

        {/* Top Section: Media Gallery and Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          <div className="lg:col-span-6 space-y-4">
            <div className="relative border border-gray-200 rounded-sm overflow-hidden aspect-[4/3] flex items-center justify-center bg-white p-2">
              {selectedMedia?.endsWith(".mp4") ||
              selectedMedia?.includes("/video/upload/") ? (
                <video
                  key={selectedMedia}
                  src={selectedMedia}
                  controls
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={selectedMedia || "/placeholder-image.jpg"}
                  alt={product.product_name}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Thumbnails row */}
            <div className="relative flex items-center gap-2">
              {isScrollable && product.images?.length > 1 && (
                <button
                  onClick={() => {
                    const currentIndex = product.images.indexOf(selectedMedia);
                    const prevIndex =
                      currentIndex <= 0
                        ? product.images.length - 1
                        : currentIndex - 1;
                    setSelectedMedia(product.images[prevIndex]);
                  }}
                  className="text-gray-600 hover:text-black p-1 text-xl font-bold shrink-0"
                  aria-label="Previous image"
                >
                  ‹
                </button>
              )}

              <div
                ref={scrollContainerRef}
                className={`flex gap-4 overflow-x-auto py-3 scrollbar-none flex-1 ${
                  isScrollable
                    ? "justify-start"
                    : "justify-start md:justify-center"
                }`}
              >
                {product.images?.map((media: string, index: number) => {
                  const isVideo =
                    media?.endsWith(".mp4") ||
                    media?.includes("/video/upload/");
                  const isSelected = selectedMedia === media;
                  const videoThumbnailUrl = isVideo
                    ? media.replace(/\.[^/.]+$/, ".jpg")
                    : media;

                  return (
                    <button
                      key={index}
                      //@ts-ignore
                      ref={(el) => (thumbnailRefs.current[index] = el)}
                      onClick={() => setSelectedMedia(media)}
                      className={`w-28 h-24 flex-shrink-0 border rounded-sm overflow-hidden bg-white p-2 flex items-center justify-center transition-all cursor-pointer relative ${
                        isSelected
                          ? "border-orange-500 ring-1 ring-orange-500"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={videoThumbnailUrl}
                        alt={`Thumbnail ${index}`}
                        className="w-full h-full object-contain"
                      />

                      {isVideo && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="w-7 h-7 bg-black/60 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white translate-x-[1px]"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {isScrollable && product.images?.length > 1 && (
                <button
                  onClick={() => {
                    const currentIndex = product.images.indexOf(selectedMedia);
                    const nextIndex =
                      currentIndex === product.images.length - 1
                        ? 0
                        : currentIndex + 1;
                    setSelectedMedia(product.images[nextIndex]);
                  }}
                  className="text-gray-600 hover:text-black p-1 text-xl font-bold shrink-0"
                  aria-label="Next image"
                >
                  ›
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <h1 className="text-[2.5em] font-normal text-[rgb(31,12,87)] tracking-tight leading-tight mb-1">
                {product.product_name}
              </h1>
              <p className="text-sm text-[#1F0C57] flex items-center gap-1">
                <span className="text-[#1F0C57]">└</span>{" "}
                {product.mpn || product.sku}
              </p>
            </div>

            {/* Price block - Dynamically updating based on API response */}
            {(() => {
              const priceNum = Number(product.price) || 0;
              const integerPart = Math.floor(priceNum);
              const centsPart = (priceNum % 1).toFixed(2).split(".")[1];

              return (
                <div className="flex items-start text-[#1e1450] font-sans">
                  <span className="text-4xl font-extrabold leading-none tracking-tight">
                    {product.currency === "EUR" ? "€" : product.currency || "$"}
                    {integerPart}
                  </span>

                  <div className="flex flex-col text-left leading-none ml-[1px] mt-[1px]">
                    <span className="text-base font-bold tracking-tight">
                      .{centsPart}
                    </span>
                    <span className="text-[11px] text-[#1e1450] font-normal mt-1 whitespace-nowrap">
                      incl VAT
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Availability */}
            <div>
              <span className="text-xs font-semibold text-emerald-600 border border-emerald-500 px-2 py-0.5 rounded-sm bg-white inline-block">
                In Stock
              </span>
            </div>

            {/* Multi-Group Variant Selector */}
            {availableVariants && Object.keys(availableVariants).length > 0 && (
              <div className="space-y-3 pt-2">
                {Object.entries(availableVariants).map(
                  ([groupName, rawOptions]: [string, any]) => {
                    const uniqueOptions = getUniqueGroupOptions(rawOptions);

                    return (
                      <div key={groupName}>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                          {groupName}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {uniqueOptions.map((variant: any, idx: number) => {
                            const displayLabel =
                              variant.option ||
                              variant.name ||
                              variant.value ||
                              variant.label ||
                              variant.code;

                            const variantCode =
                              variant.code || variant.sku || displayLabel;
                            const isActive =
                              selectedVariants[groupName] === variantCode;

                            return (
                              <button
                                key={`${variantCode}-${idx}`}
                                type="button"
                                onClick={() =>
                                  handleVariantSelect(groupName, variantCode)
                                }
                                title={displayLabel}
                                className={`px-3 py-1.5 min-w-[5rem] cursor-pointer rounded-sm border text-sm font-medium transition ${
                                  isActive
                                    ? "border-orange-500 bg-orange-50 text-orange-700 font-semibold"
                                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                                }`}
                              >
                                {displayLabel}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
            {/* Quantity Input & Add to Cart */}
            <div className="flex gap-2 max-w-sm pt-2">
              <input
                type="number"
                defaultValue={1}
                min={1}
                className="w-16 border border-gray-300 rounded-sm text-center font-normal text-base py-2 focus:outline-none focus:border-orange-500"
              />
              <button className="flex-1 bg-[#ff5500] hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-sm transition text-sm uppercase tracking-wide">
                ADD TO CART
              </button>
            </div>

            {/* Social Share Icon Bar */}
            <div className="flex items-center gap-1.5 pt-4">
              {shareIcons.map(({ icon: Icon, name, bg }) => (
                <button
                  key={name}
                  title={name}
                  className={`w-8 h-8 rounded-sm ${bg} flex items-center justify-center transition-opacity hover:opacity-90`}
                >
                  <Icon className="text-sm" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Content Block */}
        <div className="border border-gray-200 rounded-sm bg-white overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-4 pt-3">
            <span className="inline-block text-[#1F0C57] bg-white border-t-2 border-t-[#1e1450] border-x border-x-gray-200 border-b-white px-5 py-2.5 text-[16.5px] font-bold -mb-px">
              Product Description
            </span>
          </div>

          <div className="p-6 md:p-8 space-y-2 text-gray-800 text-sm leading-relaxed">
            {sku &&
              ["0103152038", "AWA06060", "3037", "93310120"].includes(sku) && (
                <div className="py-2">
                  <div className="inline-block text-[#1F0C57] text-[25px]">
                    {product.product_sub_title || ""}
                  </div>

                  <div
                    className="text-[#1F0C57] text-[25px]"
                    dangerouslySetInnerHTML={{
                      __html: product.product_h3_title || product.product_name,
                    }}
                  />

                  <div className="text-[#1F0C57] text-[25px]">
                    Product Description
                  </div>
                </div>
              )}

            {product.content && (
              <div>
                <div
                  className="[&_*]:[all:revert] text-[16px]"
                  dangerouslySetInnerHTML={{ __html: product.content }}
                />
              </div>
            )}

            {product.tech_spec && (
              <div className="space-y-3 border-t border-gray-100">
                <h5
                  style={{
                    fontSize: "22.4px",
                    color: "rgb(31, 12, 87)",
                    fontWeight: 400,
                  }}
                >
                  Technical Information:
                </h5>
                {sku &&
                  ["0103152038", "AWA06060", "3037", "93310120"].includes(
                    sku,
                  ) && (
                    <h2 className="font-bold text-[16px]">Characteristics</h2>
                  )}
                <div
                  className="[&_*]:[all:revert] text-[16px] font-normal text-[rgb(51,51,51)]"
                  dangerouslySetInnerHTML={{ __html: product.tech_spec }}
                />
              </div>
            )}

            {/* Documents Download Table */}
            {product.documents && product.documents.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-100 max-w-2xl">
                <h5
                  style={{
                    fontSize: "22.4px",
                    color: "rgb(31, 12, 87)",
                    fontWeight: 400,
                  }}
                >
                  Documents:
                </h5>
                <div className="border border-gray-200 rounded-sm overflow-hidden">
                  <table className="w-full text-left text-sm border-collapse">
                    <tbody className="divide-y divide-gray-200">
                      {product.documents.map(
                        (
                          doc: { name?: string; path: string } | string,
                          idx: number,
                        ) => {
                          const docUrl =
                            typeof doc === "string" ? doc : doc.path;
                          const documentLabel =
                            typeof doc !== "string" && doc.name
                              ? doc.name
                              : `Document ${idx + 1}`;

                          const handleDownload = async (
                            e: React.MouseEvent<HTMLAnchorElement>,
                          ) => {
                            e.preventDefault();
                            try {
                              const response = await fetch(docUrl);
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = url;

                              const ext =
                                docUrl.split(".").pop()?.split("?")[0] || "pdf";
                              link.download = `${documentLabel}.${ext}`;

                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                            } catch (error) {
                              window.open(docUrl, "_blank");
                            }
                          };

                          return (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3 font-medium text-gray-700 truncate">
                                {documentLabel}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <a
                                  href={docUrl}
                                  onClick={handleDownload}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline cursor-pointer"
                                >
                                  Download
                                </a>
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <p className="font-normal text-[rgb(51,51,51)] text-[16px] pt-4">
              For further information regarding {product.brand || "product"}{" "}
              sales, please contact us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
