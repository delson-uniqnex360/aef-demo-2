import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Import Link component
import { buildCategoryTree } from "../api/category";
import type { MainCategory } from "../types/Product";

export default function PopularCategories() {
  const [categories, setCategories] = useState<MainCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/db.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load categories");
        return res.json();
      })
      .then((rawData) => {
        const products = Array.isArray(rawData) ? rawData : rawData.data;
        setCategories(buildCategoryTree(products ?? []));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  }, []);

  // Helper function to safely generate URL slugs from category names
  const formatSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-"); // Replace spaces with dashes
  };

  // Helper function to dig into the data structure and find a valid product image
  const getDynamicCategoryImage = (category: MainCategory): string => {
    if (category?.category_image) {
      return category.category_image;
    }

    const firstSub = category.subCategories?.[0];
    const firstGroup = firstSub?.groups?.[0];
    const firstItem = firstGroup?.items?.[0];

    // Fallback placeholder if no image exists inside your items structure
    return (
      (firstItem as any)?.image ||
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=500&auto=format&fit=crop"
    );
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-12 text-center text-sm font-medium text-gray-500 animate-pulse">
        Loading popular categories...
      </div>
    );
  }

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-12 bg-white">
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-[#14002a] uppercase">
          Popular Categories
        </h2>
      </div>

      {/* Categories Grid System */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const imageUrl = getDynamicCategoryImage(category);

          const mainSlug = formatSlug(category.title);
          const targetUrl = `/category/${mainSlug}`;

          const hasSubCategories =
            category.subCategories && category.subCategories.length > 0;

          const cardContent = (
            <>
              <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                <img
                  src={imageUrl}
                  alt={category.title}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    hasSubCategories ? "group-hover:scale-105" : ""
                  }`}
                  loading="lazy"
                />
              </div>

              <div className="p-5 text-center bg-white border-t border-gray-50">
                <h3
                  className={`text-sm md:text-base font-bold tracking-wide ${
                    hasSubCategories
                      ? "text-[#14002a] group-hover:text-orange-600"
                      : "text-gray-500"
                  }`}
                >
                  {category.title}
                </h3>
              </div>
            </>
          );

          if (hasSubCategories) {
            return (
              <Link
                key={category.id}
                to={targetUrl}
                className="group flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 decoration-transparent"
              >
                {cardContent}
              </Link>
            );
          }

          return (
            <div
              key={category.id}
              className="flex flex-col bg-white border border-gray-100 shadow-sm cursor-default"
            >
              {cardContent}
            </div>
          );
        })}
      </div>
    </section>
  );
}
