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

    console.log("db", db, targetSku)
    console.log("target sku", targetSku)

    const product =
      db.data.find(
        (item) => String(item.sku).trim().toLowerCase() === targetSku,
      ) ?? null;

      console.log("product detail", product)
    return product;
  } catch (error) {
    console.error("Error loading product:", error);
    return null;
  }
}
