// import type { MainCategory } from "../types/Product";

// /**
//  * Scans a MainCategory tree flexibly. Searches for a slug matching
//  * Level 1, Level 2, or Level 3 individually, and flattens all child products.
//  */
// export function getProductsByFlexLevel(
//   tree: MainCategory[],
//   formatSlug: (t: string) => string,
//   categorySlug?: string,
// ): { products: any[]; breadcrumbs: string[]; title: string } {
//   if (!categorySlug || !tree || tree.length === 0) {
//     return { products: [], breadcrumbs: [], title: "All Products" };
//   }

//   // 1. Check if the slug matches a Main Category (Level 1)
//   const targetL1 = tree.find((c) => formatSlug(c.title) === categorySlug);
//   if (targetL1) {
//     const products = (targetL1.subCategories || []).flatMap((s) =>
//       (s.groups || []).flatMap((g) => g.items || []),
//     );
//     return {
//       products,
//       breadcrumbs: [targetL1.title],
//       title: targetL1.title,
//     };
//   }

//   // 2. Check if the slug matches a Sub-Category (Level 2)
//   for (const l1 of tree) {
//     const targetL2 = l1.subCategories?.find(
//       (s) => formatSlug(s.title) === categorySlug,
//     );
//     if (targetL2) {
//       const products = (targetL2.groups || []).flatMap((g) => g.items || []);
//       return {
//         products,
//         breadcrumbs: [l1.title, targetL2.title],
//         title: targetL2.title,
//       };
//     }
//   }

//   // 3. Check if the slug matches a Leaf Group (Level 3)
//   for (const l1 of tree) {
//     for (const l2 of l1.subCategories || []) {
//       const targetL3 = l2.groups?.find(
//         (g) => formatSlug(g.title) === categorySlug,
//       );
//       if (targetL3) {
//         return {
//           products: targetL3.items || [],
//           breadcrumbs: [l1.title, l2.title, targetL3.title],
//           title: targetL3.title,
//         };
//       }
//     }
//   }

//   return { products: [], breadcrumbs: [], title: "Category Not Found" };
// }

import type { MainCategory } from "../types/Product";

/**
 * Scans a MainCategory tree. Searches for a slug matching Level 1, 2, or 3,
 * and returns the full product objects (including SKU, name, etc.) from the main database.
 */
export function getProductsByFlexLevel(
  tree: MainCategory[],
  formatSlug: (t: string) => string,
  categorySlug?: string,
  allProducts: any[] = [], // The full products array from your fetch('/db.json')
): { products: any[]; breadcrumbs: string[]; title: string } {
  if (!categorySlug || !tree || tree.length === 0) {
    return { products: [], breadcrumbs: [], title: "All Products" };
  }

  /**
   * Maps category items to their full database objects containing fields like sku, name, brand, etc.
   */
  const enrichProducts = (categoryItems: any[]) => {
    console.log("========== enrichProducts ==========");
    console.log("Total category items:", categoryItems.length);
    console.log("Total DB products:", allProducts.length);

    if (!allProducts || allProducts.length === 0) {
      console.log("allProducts is empty!");
      return categoryItems;
    }

    console.log("First DB Product:", allProducts[0]);
    console.log("First DB Product Keys:", Object.keys(allProducts[0]));

    return categoryItems.map((item, index) => {
      console.log("====================================");
      console.log(`Category Item ${index}:`, item);
      console.log("Category Item Keys:", Object.keys(item));

      const fullProduct = allProducts.find((p) => {
        const match = p.id === item.id;

        if (match) {
          console.log("MATCH FOUND!");
          console.log("Matched Product:", p);
        }

        return match;
      });

      if (!fullProduct) {
        console.log("NO MATCH FOUND");
        console.log("Searching for id:", item.id);

        console.log(
          "First 20 DB ids:",
          allProducts.slice(0, 20).map((p) => p.id),
        );

        console.log(
          "First 20 DB skus:",
          allProducts.slice(0, 20).map((p) => p.sku),
        );
      }

      return fullProduct ?? item;
    });
  };

  // 1. Check if the slug matches a Main Category (Level 1)
  const targetL1 = tree.find((c) => formatSlug(c.title) === categorySlug);
  if (targetL1) {
    const items = (targetL1.subCategories || []).flatMap((s) =>
      (s.groups || []).flatMap((g) => g.items || []),
    );

    console.log("========== LEVEL 1 ==========");
    console.log("Category:", targetL1.title);
    console.log("Items:", items);
    console.log("First Item:", items[0]);
    console.log("First DB Product:", allProducts[0]);

    return {
      products: enrichProducts(items),
      breadcrumbs: [targetL1.title],
      title: targetL1.title,
    };
  }

  // 2. Check if the slug matches a Sub-Category (Level 2)
  for (const l1 of tree) {
    const targetL2 = l1.subCategories?.find(
      (s) => formatSlug(s.title) === categorySlug,
    );

    if (targetL2) {
      const items = (targetL2.groups || []).flatMap((g) => g.items || []);

      console.log("========== LEVEL 2 ==========");
      console.log("Main Category:", l1.title);
      console.log("Sub Category:", targetL2.title);
      console.log("Items:", items);
      console.log("First Item:", items[0]);
      console.log("First DB Product:", allProducts[0]);

      return {
        products: enrichProducts(items),
        breadcrumbs: [l1.title, targetL2.title],
        title: targetL2.title,
      };
    }
  }

  // 3. Check if the slug matches a Leaf Group (Level 3)
  for (const l1 of tree) {
    for (const l2 of l1.subCategories || []) {
      const targetL3 = l2.groups?.find(
        (g) => formatSlug(g.title) === categorySlug,
      );

      if (targetL3) {
        console.log("========== LEVEL 3 ==========");
        console.log("Main Category:", l1.title);
        console.log("Sub Category:", l2.title);
        console.log("Leaf Group:", targetL3.title);
        console.log("Items:", targetL3.items);
        console.log("First Item:", targetL3.items?.[0]);
        console.log("First DB Product:", allProducts[0]);

        return {
          products: enrichProducts(targetL3.items || []),
          breadcrumbs: [l1.title, l2.title, targetL3.title],
          title: targetL3.title,
        };
      }
    }
  }

  console.log("Category not found:", categorySlug);

  return { products: [], breadcrumbs: [], title: "Category Not Found" };
}
