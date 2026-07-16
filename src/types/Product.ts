export type ProductAttribute = {
  name: string;
  value: string | null;
  uom: string | null;
};

export type Product = {
  sku: string;
  product_name: string;
  brand: string;
  mpn: string;

  categories: string[];
  taxonomy: string;

  weight: string;
  weight_unit: string;
  currency: string;

  images: string[];
  category_image?:string;

  long_description: string;

  features: string[];

  attributes: ProductAttribute[];
};

// FIX: MenuItem must contain the SKU or extend Product for the search to work
export type MenuItem = {
  name: string;
  path: string;
  sku?: string; // Added SKU here so the tree can actually hold product references
};

export type MenuGroup = {
  title: string;
  items: (MenuItem & Partial<Product>)[]; // Allows items to hold full product data
};

export type SubCategory = {
  id: string;
  title: string;
  groups: MenuGroup[];
};

export type MainCategory = {
  id: string;
  title: string;
  subCategories: SubCategory[];
  category_image?: string | null;
};
