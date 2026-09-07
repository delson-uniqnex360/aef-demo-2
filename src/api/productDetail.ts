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

    const groupMap =
      (parentProduct.variants as unknown as Record<string, any[]>) || {};
    const totalGroups = Object.keys(groupMap);

    // Filter out empty selection entries
    const activeSelections = Object.entries(selectedVariants).filter(
      ([_, val]) => Boolean(val),
    );

    // Requirement 1: Only dynamically update product details if EVERY variant group has a selection
    const isAllGroupsSelected =
      totalGroups.length > 0 &&
      totalGroups.every((group) => Boolean(selectedVariants[group]));

    if (!isAllGroupsSelected) {
      return parentProduct;
    }

    // 2. Search exact matrix combination match if matrix exists on parentProduct
    let matchedOption: any = null;

    if (Array.isArray((parentProduct as any).variant_matrix)) {
      matchedOption = (parentProduct as any).variant_matrix.find(
        (matrixItem: Record<string, string>) =>
          totalGroups.every(
            (group) =>
              String(matrixItem[group] || "").toLowerCase() ===
              String(selectedVariants[group] || "").toLowerCase(),
          ),
      );
    }

    // 3. Match across variant groups by shared item code (Handles structure like Material, Thread Size, Length)
    if (!matchedOption && totalGroups.length > 0) {
      // Find matching item objects for each selected group
      const selectedItemsByGroup: Record<string, any[]> = {};

      totalGroups.forEach((groupName) => {
        const selectedVal = String(selectedVariants[groupName] || "")
          .trim()
          .toLowerCase();
        const optionsInGroup = groupMap[groupName] || [];

        const matches = optionsInGroup.filter((opt: any) => {
          const optValue = String(
            opt.option || opt.name || opt.value || opt.label || "",
          )
            .trim()
            .toLowerCase();
          const optCode = String(opt.code || opt.sku || "")
            .trim()
            .toLowerCase();
          return optValue === selectedVal || optCode === selectedVal;
        });

        selectedItemsByGroup[groupName] = matches;
      });

      // Find an item code that exists in ALL selected group matches
      const firstGroup = totalGroups[0];
      const candidateCodes = (selectedItemsByGroup[firstGroup] || []).map(
        (item) =>
          String(item.code || item.sku)
            .trim()
            .toLowerCase(),
      );

      const matchingCode = candidateCodes.find((candidateCode) => {
        return totalGroups.every((groupName) =>
          selectedItemsByGroup[groupName].some(
            (item) =>
              String(item.code || item.sku)
                .trim()
                .toLowerCase() === candidateCode,
          ),
        );
      });

      if (matchingCode) {
        // Collect exact matched option object containing full product info (name, price, code)
        for (const groupName of totalGroups) {
          const found = selectedItemsByGroup[groupName].find(
            (item) =>
              String(item.code || item.sku)
                .trim()
                .toLowerCase() === matchingCode,
          );
          if (found) {
            matchedOption = found;
            break;
          }
        }
      }
    }

    let matchedPrice: number | string | undefined = parentProduct.price;
    let matchedSku: string = parentProduct.sku;
    let matchedName: string = parentProduct.product_name;
    let matchedImages: string[] = parentProduct.images || [];

    if (matchedOption) {
      matchedPrice = matchedOption.price ?? parentProduct.price;
      matchedSku = matchedOption.code || matchedOption.sku || parentProduct.sku;
      matchedName = matchedOption.name || parentProduct.product_name;
      matchedImages = matchedOption.images?.length
        ? matchedOption.images
        : parentProduct.images || [];
    } else {
      activeSelections.forEach(([groupName, selectedCode]) => {
        const optionsInGroup = groupMap[groupName];
        if (!Array.isArray(optionsInGroup)) return;

        const targetVal = String(selectedCode).trim().toLowerCase();

        const opt = optionsInGroup.find((o) => {
          const optionCode = String(o.code || o.sku || "")
            .trim()
            .toLowerCase();
          const optionLabel = String(o.option || o.name || o.value || "")
            .trim()
            .toLowerCase();
          return optionCode === targetVal || optionLabel === targetVal;
        });

        if (opt) {
          if (opt.price !== undefined) matchedPrice = opt.price;
          if (opt.code || opt.sku) matchedSku = opt.code || opt.sku;
          if (opt.name) matchedName = opt.name;
          if (opt.images?.length) matchedImages = opt.images;
        }
      });
    }

    return {
      ...parentProduct,
      sku: matchedSku,
      price: String(matchedPrice),
      product_name: matchedName,
      images: matchedImages,
    };
  } catch (error) {
    console.error("Error loading product:", error);
    return null;
  }
}
