import type { Product, MainCategory } from "../types/Product";

export function buildCategoryTree(products: Product[]): MainCategory[] {
  const tree: Record<string, Record<string, Record<string, Product[]>>> = {};
  const mainCatImages: Record<string, string> = {};

  products.forEach((product) => {
    const cats = product.categories ?? [];

    const main = cats[0];
    const sub = cats[1];
    const group = cats[2];

    if (!main) return;

    if (!mainCatImages[main]) {
      mainCatImages[main] = product.category_image || product.images?.[0] || "";
    }

    if (!tree[main]) tree[main] = {};

    // No subcategory → stop here
    if (!sub) return;

    if (!tree[main][sub]) tree[main][sub] = {};

    // No level 3 → stop here
    if (!group) return;

    if (!tree[main][sub][group]) {
      tree[main][sub][group] = [];
    }

    tree[main][sub][group].push(product);
  });

  return Object.keys(tree).map((mainKey) => ({
    id: mainKey.toLowerCase().trim().replace(/\s+/g, "-"),

    title: mainKey,

    category_image: mainCatImages[mainKey] || null,

    subCategories: Object.keys(tree[mainKey]).map((subKey) => ({
      id: `${mainKey}-${subKey}`.toLowerCase().trim().replace(/\s+/g, "-"),

      title: subKey,

      groups: Object.keys(tree[mainKey][subKey]).map((groupKey) => {
        const allProducts = tree[mainKey][subKey][groupKey];

        const uniqueBrands = [
          ...new Set(allProducts.map((p) => p.brand || "Generic")),
        ];

        return {
          id: `${mainKey}-${subKey}-${groupKey}`
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-"),

          title: groupKey,

          items: uniqueBrands.map((brandName) => {
            const brandProducts = allProducts.filter(
              (p) => (p.brand || "Generic") === brandName,
            );

            const firstProduct = brandProducts[0];

            return {
              id: `${groupKey}-${brandName}`
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-"),

              sku: firstProduct?.sku,

              name: brandName,

              brand: brandName,

              images: brandProducts.flatMap((p) => p.images ?? []),

              path: `/search?category=${encodeURIComponent(
                groupKey,
              )}&brand=${encodeURIComponent(brandName)}`,
            };
          }),
        };
      }),
    })),
  }));
}

export function buildCategoryTreeV2(products: Product[]): MainCategory[] {
  const tree: Record<string, Record<string, Record<string, Product[]>>> = {};
  const mainCatImages: Record<string, string> = {};

  products.forEach((product) => {
    const cats = product.categories ?? [];

    const main = cats[0];
    const sub = cats[1];
    const group = cats[2];

    if (!main) return;

    if (!mainCatImages[main]) {
      mainCatImages[main] = product.category_image || product.images?.[0] || "";
    }

    if (!tree[main]) tree[main] = {};

    // No subcategory → stop here
    if (!sub) return;

    if (!tree[main][sub]) tree[main][sub] = {};

    // No level 3 → stop here
    if (!group) return;

    if (!tree[main][sub][group]) {
      tree[main][sub][group] = [];
    }

    tree[main][sub][group].push(product);
  });

  return Object.keys(tree).map((mainKey) => ({
    id: mainKey.toLowerCase().trim().replace(/\s+/g, "-"),

    title: mainKey,

    category_image: mainCatImages[mainKey] || null,

    subCategories: Object.keys(tree[mainKey]).map((subKey) => ({
      id: `${mainKey}-${subKey}`.toLowerCase().trim().replace(/\s+/g, "-"),

      title: subKey,

      groups: Object.keys(tree[mainKey][subKey]).map((groupKey) => {
        const allProducts = tree[mainKey][subKey][groupKey];

        return {
          id: `${mainKey}-${subKey}-${groupKey}`
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-"),

          title: groupKey,

          // CHANGED: return one item per product instead of one item per brand
          items: allProducts.map((product) => ({
            id: `${groupKey}-${product.sku}`
              .toLowerCase()
              .trim()
              .replace(/\s+/g, "-"),

            sku: product.sku,

            name: product.product_name,

            brand: product.brand,

            images: product.images ?? [],

            path: `/product/detail/${product.sku}`,
          })),
        };
      }),
    })),
  }));
}
