import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { buildCategoryTree } from "../api/category";
import AppTaxonomy from "../components/AppTaxonomy";
import type { MainCategory } from "../types/Product";

export default function CategoryPage() {
  const params = useParams();
  const { level1, level2, level3 } = params;
  const navigate = useNavigate();

  const [categoriesTree, setCategoriesTree] = useState<MainCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Fetch data & build the same category tree structure
  useEffect(() => {
    fetch("/db.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load categories");
        return res.json();
      })
      .then((rawData) => {
        const products = Array.isArray(rawData) ? rawData : rawData.data;
        const tree = buildCategoryTree(products ?? []);
        console.log("DEBUG: Category Tree Built Successfully ->", tree);
        setCategoriesTree(tree);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  }, []);

  // 2. URL slug helper
  const formatSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  // Change 3 & Bug Fix: Pointing to raw data structure (.images array)
  const getDynamicCategoryImage = (obj: any): string => {
    console.log("ctaegory obj",obj)
    console.log("image obj", obj);
    const fallbackImage =
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=500&auto=format&fit=crop";

    if (!obj) return fallbackImage;

    // Main category level depth search
    if (obj.subCategories?.length) {
      for (const sub of obj.subCategories) {
        for (const group of sub.groups || []) {
          const product = group.items?.find(
            (i: any) => i.images && i.images.length > 0,
          );
          if (product?.images?.[0]) return product.images[0];
        }
      }
    }

    // Sub category level depth search
    if (obj.groups?.length) {
      for (const group of obj.groups) {
        const product = group.items?.find(
          (i: any) => i.images && i.images.length > 0,
        );
        if (product?.images?.[0]) return product.images[0];
      }
    }

    // Group level depth search
    if (obj.items?.length) {
      const product = obj.items.find(
        (i: any) => i.images && i.images.length > 0,
      );
      if (product?.images?.[0]) return product.images[0];
    }

    return fallbackImage;
  };

  // Log URL parameters every render to see exactly what React Router captures
  console.log("DEBUG: Current Route Params Captured ->", {
    level1,
    level2,
    level3,
  });

  // 4. Logic block to drill down and handle Level Redirects / Children listing
  let currentTitle = "Categories";

  // Change 2: Updated the type definition to include data: any
  let itemsToDisplay: Array<{
    id: string | number;
    title: string;
    targetUrl: string;
    data: any;
  }> = [];

  if (!loading && categoriesTree.length > 0) {
    if (level3 && level3.trim() !== "") {
      console.log(
        `DEBUG: Triggering Redirect Condition! level3 is active: "${level3}". Navigating to /product/${level3}`,
      );

      setTimeout(() => {
        navigate(`/product/${level3}`);
      }, 0);
      return null;
    } else if (level2 && level2.trim() !== "") {
      console.log(
        `DEBUG: Condition Level 2 active. level1: "${level1}", level2: "${level2}". Searching for Level 3 groups...`,
      );

      const parentL1 = categoriesTree.find(
        (c) => formatSlug(c.title) === level1,
      );
      const parentL2 = parentL1?.subCategories?.find(
        (sub) => formatSlug(sub.title) === level2,
      );

      console.log("DEBUG: Level 2 Parent Lookup Result ->", {
        parentL1,
        parentL2,
      });

      if (parentL2) {
        currentTitle = parentL2.title;
        // Change 1 (Level 2): Retaining original node mapping onto 'data'
        itemsToDisplay = (parentL2.groups || []).map((group) => ({
          //@ts-ignore
          id: group.id,
          title: group.title,
          targetUrl: `/category/${level1}/${level2}/${formatSlug(group.title)}`,
          data: group,
        }));
      }
    } else if (level1 && level1.trim() !== "") {
      console.log(
        `DEBUG: Condition Level 1 active. level1: "${level1}". Searching for Level 2 subcategories...`,
      );

      const parentL1 = categoriesTree.find(
        (c) => formatSlug(c.title) === level1,
      );
      console.log("DEBUG: Level 1 Parent Lookup Result ->", parentL1);

      if (parentL1) {
        currentTitle = parentL1.title;
        // Change 1 (Level 1): Retaining original node mapping onto 'data'
        itemsToDisplay = (parentL1.subCategories || []).map((sub) => ({
          id: sub.id,
          title: sub.title,
          targetUrl: `/category/${level1}/${formatSlug(sub.title)}`,
          data: sub,
        }));
        console.log(
          `DEBUG: Mapped ${itemsToDisplay.length} Level 2 subcategories to display.`,
        );
      } else {
        console.warn(
          `DEBUG WARNING: Could not find matching level1 category in tree for slug: "${level1}"`,
        );
      }
    } else {
      console.log("DEBUG: No parameters match. Listing all main categories...");
      currentTitle = "All Categories";
      // Change 1 (Level 0): Retaining original node mapping onto 'data'
      itemsToDisplay = categoriesTree.map((c) => ({
        id: c.id,
        title: c.title,
        targetUrl: `/category/${formatSlug(c.title)}`,
        data: c,
      }));
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-12 text-center text-sm font-medium text-gray-500 animate-pulse">
        Loading categories...
      </div>
    );
  }

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-16 bg-white">
      {/* Dynamic Section Header */}
      <div>
        <AppTaxonomy />
      </div>
      <div className="text-center mb-10">
        <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-[#14002a] uppercase">
          {currentTitle}
        </h2>
      </div>

      {/* Reused Categories Grid System Design */}
      {itemsToDisplay.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No items found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {itemsToDisplay.map((item) => {
            // Change 4: Passing item.data instead of item
            const imageUrl = getDynamicCategoryImage(item.data);

            return (
              <Link
                key={item.id}
                to={item.targetUrl}
                className="group flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 decoration-transparent"
              >
                {/* Aspect Ratio Cropped Image Frame */}
                <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Centered Deep Purple Typography Label Section */}
                <div className="p-5 text-center bg-white border-t border-gray-50">
                  <h3 className="text-sm md:text-base font-bold text-[#14002a] tracking-wide transition-colors group-hover:text-orange-600">
                    {item.title}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
