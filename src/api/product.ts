// import type { MainCategory } from "../types/Product";

// /**
//  * Scans a MainCategory tree. Searches for a slug matching Level 1, 2, or 3,
//  * and returns the full product objects (including SKU, name, etc.) from the main database.
//  */
// export function getProductsByFlexLevel(
//   tree: MainCategory[],
//   formatSlug: (t: string) => string,
//   categorySlug?: string,
//   allProducts: any[] = [], // The full products array from your fetch('/db.json')
// ): { products: any[]; breadcrumbs: string[]; title: string } {
//   if (!categorySlug || !tree || tree.length === 0) {
//     return { products: [], breadcrumbs: [], title: "All Products" };
//   }

//   /**
//    * Maps category items to their full database objects containing fields like sku, name, brand, etc.
//    */
//   const enrichProducts = (categoryItems: any[]) => {
//     if (!allProducts || allProducts.length === 0) {
//       return categoryItems;
//     }
//     //@ts-ignore
//     return categoryItems.map((item, index) => {
//       const fullProduct = allProducts.find((p) => {
//         const match = p.id === item.id;
//         return match;
//       });

//       return fullProduct ?? item;
//     });
//   };

//   // 1. Check if the slug matches a Main Category (Level 1)
//   const targetL1 = tree.find((c) => formatSlug(c.title) === categorySlug);
//   if (targetL1) {
//     const items = (targetL1.subCategories || []).flatMap((s) =>
//       (s.groups || []).flatMap((g) => g.items || []),
//     );

//     return {
//       products: enrichProducts(items),
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
//       const items = (targetL2.groups || []).flatMap((g) => g.items || []);

//       return {
//         products: enrichProducts(items),
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
//           products: enrichProducts(targetL3.items || []),
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
 * and returns the full product objects (including SKU, name, categories, etc.) from the main database.
 */
export function getProductsByFlexLevel(
  tree: MainCategory[],
  formatSlug: (t: string) => string,
  categorySlug?: string,
  allProducts: any[] = [],
): { products: any[]; breadcrumbs: string[]; title: string } {
  if (!categorySlug || !tree || tree.length === 0) {
    return {
      products: [],
      breadcrumbs: [],
      title: "All Products",
    };
  }

  /**
   * Replace lightweight category items with full DB products.
   * Matches primarily on SKU (case-insensitive), with a fallback to ID if present.
   */
  const enrichProducts = (categoryItems: any[]) => {
    if (!allProducts || allProducts.length === 0) {
      return categoryItems;
    }

    return categoryItems.map((item) => {
      const itemKey = (item.sku || item.id || "")
        .toString()
        .trim()
        .toLowerCase();

      if (!itemKey) {
        return item;
      }

      // Find full product match in database by SKU (or id fallback)
      const fullProduct = allProducts.find((p) => {
        const pSku = (p.sku || "").toString().trim().toLowerCase();
        const pId = (p.id || "").toString().trim().toLowerCase();

        return (pSku && pSku === itemKey) || (pId && pId === itemKey);
      });

      if (!fullProduct) {
        console.warn(
          `⚠ Product not found in database for SKU/ID: "${itemKey}". Using category item.`,
        );
      }

      // Merge item data with full DB product (DB properties take precedence, including categories)
      return fullProduct ? { ...item, ...fullProduct } : item;
    });
  };

  // =====================================================
  // LEVEL 1: Main Category
  // =====================================================
  const targetL1 = tree.find((c) => formatSlug(c.title) === categorySlug);

  if (targetL1) {
    const items = (targetL1.subCategories || []).flatMap((s) => {
      return (s.groups || []).flatMap((g) => g.items || []);
    });

    return {
      products: enrichProducts(items),
      breadcrumbs: [targetL1.title],
      title: targetL1.title,
    };
  }

  // =====================================================
  // LEVEL 2: Sub-Category
  // =====================================================
  for (const l1 of tree) {
    const targetL2 = l1.subCategories?.find(
      (s) => formatSlug(s.title) === categorySlug,
    );

    if (targetL2) {
      const items = (targetL2.groups || []).flatMap((g) => g.items || []);

      return {
        products: enrichProducts(items),
        breadcrumbs: [l1.title, targetL2.title],
        title: targetL2.title,
      };
    }
  }

  // =====================================================
  // LEVEL 3: Leaf Group
  // =====================================================
  for (const l1 of tree) {
    for (const l2 of l1.subCategories || []) {
      const targetL3 = l2.groups?.find(
        (g) => formatSlug(g.title) === categorySlug,
      );

      if (targetL3) {
        return {
          products: enrichProducts(targetL3.items || []),
          breadcrumbs: [l1.title, l2.title, targetL3.title],
          title: targetL3.title,
        };
      }
    }
  }

  console.warn("❌ Category not found:", categorySlug);

  return {
    products: [],
    breadcrumbs: [],
    title: "Category Not Found",
  };
}
