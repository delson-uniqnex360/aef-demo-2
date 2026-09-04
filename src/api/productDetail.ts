import type { Product } from "../types/Product";

interface ProductDb {
  data: Product[];
}

export async function getProductBySku(
  sku: string | number | undefined | null,
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

    // 1. Direct match on the product's own top-level sku (existing behavior)
    const directMatch =
      db.data.find(
        (item) => String(item.sku).trim().toLowerCase() === targetSku,
      ) ?? null;

    if (directMatch) {
      return directMatch;
    }

    // 2. Fallback: variants in db.json are grouped by category, e.g.
    // { meterial: [{ code, name, option }] } — NOT a flat array, despite
    // what the Product type currently says. Flatten each product's groups
    // before searching. Fully optional — products with no `variants` are
    // simply skipped.
    for (const item of db.data) {
      if (!item.variants) continue;

      const allVariants = Object.values(
        item.variants as unknown as Record<string, any[]>,
      ).flat();

      const matchedVariant = allVariants.find(
        (variant) => String(variant.code).trim().toLowerCase() === targetSku,
      );

      if (matchedVariant) {
        return {
          ...item,
          sku: matchedVariant.code,
          product_name: matchedVariant.name ?? item.product_name,
        };
      }
    }

    // 3. Nothing matched at all
    return null;
  } catch (error) {
    console.error("Error loading product:", error);
    return null;
  }
}
