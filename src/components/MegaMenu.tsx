import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { SubCategory, MainCategory } from "../types/Product";
import { buildCategoryTree } from "../api/category";

export default function MegaMenu() {
  const navigate = useNavigate();

  const [menuData, setMenuData] = useState<MainCategory[]>([]);
  const [activeMain, setActiveMain] = useState<MainCategory | null>(null);
  const [activeSub, setActiveSub] = useState<SubCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/db.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load db.json");
        return res.json();
      })
      .then((rawData) => {
        const products = Array.isArray(rawData) ? rawData : rawData.data || [];
        setMenuData(buildCategoryTree(products));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Helper function to safely generate URL slugs from titles
  const formatSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-"); // Replace spaces with dashes
  };

  const handleMainClick = (category: MainCategory) => {
    const mainSlug = formatSlug(category.title);
    navigate(`/category/${mainSlug}`);

    // Guard clause: If there are no subcategories, do not open the dropdown menu
    if (!category.subCategories || category.subCategories.length === 0) {
      setActiveMain(null);
      setActiveSub(null);
      return;
    }

    if (activeMain?.id === category.id) {
      setActiveMain(null);
      setActiveSub(null);
      return;
    }

    setActiveMain(category);
    setActiveSub(category.subCategories[0]);
  };

  const handleSubClick = (
    mainCategory: MainCategory,
    subCategory: SubCategory,
  ) => {
    setActiveSub(subCategory);

    const mainSlug = formatSlug(mainCategory.title);
    const subSlug = formatSlug(subCategory.title);
    navigate(`/category/${mainSlug}/${subSlug}`);
  };

  const handleGroupClick = (groupTitle: string) => {
    const groupSlug = formatSlug(groupTitle);
    navigate(`/product/${groupSlug}`);
  };

  const handleBrandClick = (groupTitle: string, brandName: string) => {
    const groupSlug = formatSlug(groupTitle);
    const brandSlug = formatSlug(brandName);
    navigate(`/product/${groupSlug}?brand=${brandSlug}`);

    setActiveMain(null);
    setActiveSub(null);
  };

  if (loading) {
    return (
      <div className="w-full bg-[#14002a] text-white p-3 text-xs font-semibold animate-pulse">
        Loading Categories...
      </div>
    );
  }

  return (
    <div className="relative w-full z-50 select-none">
      {/* Level 1 Navigation */}
      <nav className="w-full bg-[#14002a] text-white px-4 py-3 border-b border-gray-200">
        {/* Added arbitrary variants to hide the horizontal scrollbar cross-browser */}
        <div className="max-w-[1600px] mx-auto flex items-center gap-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {menuData.map((mainCat) => {
            const isOpen = activeMain?.id === mainCat.id;
            const hasNoSubs =
              !mainCat.subCategories || mainCat.subCategories.length === 0;

            return (
              <button
                key={mainCat.id}
                onClick={() => handleMainClick(mainCat)}
                disabled={hasNoSubs}
                className={`flex items-center gap-2 whitespace-nowrap text-xs font-semibold border-b-2 py-1 transition-colors ${
                  hasNoSubs
                    ? "cursor-default opacity-70 border-transparent"
                    : isOpen
                      ? "border-[#ff6a00] text-[#ff6a00]"
                      : "border-transparent hover:text-orange-400"
                }`}
              >
                <span>{mainCat.title}</span>

                {/* Only render arrow if there are subcategories to display */}
                {!hasNoSubs && (
                  <svg
                    className={`w-3 h-3 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Multi-Level Dropdown Overlay */}
      {activeMain && activeMain.subCategories.length > 0 && (
        <div
          className="absolute left-0 w-full bg-white shadow-2xl border-b border-gray-200 flex"
          style={{ minHeight: 420 }}
        >
          {/* Level 2 Subcategories */}
          <div className="w-64 border-r border-gray-200 bg-white">
            {activeMain.subCategories.map((subCat) => {
              const active = activeSub?.id === subCat.id;

              return (
                <div
                  key={subCat.id}
                  onMouseEnter={() => setActiveSub(subCat)}
                  onClick={() => handleSubClick(activeMain, subCat)}
                  className={`flex items-center justify-between px-4 py-3 border-b border-gray-200 text-xs cursor-pointer transition ${
                    active
                      ? "bg-[#ff6a00] text-white"
                      : "hover:bg-gray-100 text-[#14002a]"
                  }`}
                >
                  <span>{subCat.title}</span>

                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </div>
              );
            })}
          </div>

          {/* Level 3 Groups & Brands */}
          <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 overflow-y-auto max-h-[550px]">
            {activeSub?.groups.map((group, index) => (
              <div key={index}>
                <button
                  onClick={() => handleGroupClick(group.title)}
                  className="font-bold text-sm border-b border-gray-200 pb-2 w-full text-left hover:text-[#ff6a00]"
                >
                  {group.title}
                </button>

                <ul className="mt-3 space-y-2">
                  {group.items.map((item, i) => (
                    <li key={i}>
                      <button
                        onClick={() => handleBrandClick(group.title, item.name)}
                        className="text-xs text-gray-700 hover:text-[#ff6a00] text-left w-full"
                      >
                        &gt; {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Click-away Backdrop Layer */}
      {activeMain && (
        <div
          className="fixed inset-0 bg-black/10 -z-10"
          onClick={() => {
            setActiveMain(null);
            setActiveSub(null);
          }}
        />
      )}
    </div>
  );
}
