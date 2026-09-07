import type { Product } from "../types/Product";

interface ProductDb {
  data: Product[];
}

export async function getProductBySku(
  sku: string | number | undefined | null,
  selectedVariants: Record<string, string> = {},
): Promise<Product | null> {
  if (sku === undefined || sku === null) {
    return null;
  }

  try {
    const response = await fetch("/db.json");

    if (!response.ok) {
      throw new Error("Failed to load db.json");
    }

    const db: ProductDb = await response.json();
    const targetSku = String(sku).trim().toLowerCase();

    // 1. Locate base product by top-level SKU or through any variant child SKU/code
    let parentProduct = db.data.find(
      (item) => String(item.sku).trim().toLowerCase() === targetSku,
    );

    if (!parentProduct) {
      parentProduct = db.data.find((item) => {
        if (!item.variants) return false;

        const allVariants = Object.values(
          item.variants as unknown as Record<string, any[]>,
        ).flat();

        return allVariants.some(
          (variant) =>
            String(variant.code || variant.sku)
              .trim()
              .toLowerCase() === targetSku,
        );
      });
    }

    if (!parentProduct) {
      return null;
    }

    // 2. If no variant selections provided, return parent product immediately
    const activeSelections = Object.entries(selectedVariants).filter(
      ([_, val]) => Boolean(val),
    );
    if (activeSelections.length === 0 || !parentProduct.variants) {
      return parentProduct;
    }

    // 3. Search and merge options matching active selected variants
    const groupMap = parentProduct.variants as unknown as Record<string, any[]>;
    let matchedPrice: number | string | undefined;
    let matchedSku: string = parentProduct.sku;
    let matchedName: string = parentProduct.product_name;
    let matchedImages: string[] = parentProduct.images || [];

    activeSelections.forEach(([groupName, selectedCode]) => {
      const optionsInGroup = groupMap[groupName];
      if (!Array.isArray(optionsInGroup)) return;

      const targetCode = String(selectedCode).trim().toLowerCase();

      // Match on variant code, sku, or visible option/name
      const matchedOption = optionsInGroup.find((opt) => {
        const optionCode = String(opt.code || opt.sku || "")
          .trim()
          .toLowerCase();
        const optionLabel = String(opt.option || opt.name || opt.value || "")
          .trim()
          .toLowerCase();
        return optionCode === targetCode || optionLabel === targetCode;
      });

      if (matchedOption) {
        if (matchedOption.price !== undefined)
          matchedPrice = matchedOption.price;
        if (matchedOption.code || matchedOption.sku)
          matchedSku = matchedOption.code || matchedOption.sku;
        if (matchedOption.name) matchedName = matchedOption.name;
        if (matchedOption.images?.length) matchedImages = matchedOption.images;
      }
    });

    // Return combined product payload with updated variant details
    return {
      ...parentProduct,
      sku: matchedSku,
      price: String(matchedPrice ?? parentProduct.price),
      product_name: matchedName,
      images: matchedImages,
    };
  } catch (error) {
    console.error("Error loading product:", error);
    return null;
  }
}
