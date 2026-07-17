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
 * and returns the full product objects (including SKU, name, etc.) from the main database.
 */
export function getProductsByFlexLevel(
  tree: MainCategory[],
  formatSlug: (t: string) => string,
  categorySlug?: string,
  allProducts: any[] = [],
): { products: any[]; breadcrumbs: string[]; title: string } {
  console.log("========================================");
  console.log("getProductsByFlexLevel()");
  console.log("Searching slug:", categorySlug);
  console.log("Tree main categories:", tree.length);
  console.log("Database products:", allProducts.length);

  if (!categorySlug || !tree || tree.length === 0) {
    console.log("No category slug or empty tree.");
    return {
      products: [],
      breadcrumbs: [],
      title: "All Products",
    };
  }

  /**
   * Replace lightweight category items with full DB products.
   */
  const enrichProducts = (categoryItems: any[]) => {
    console.log("----------------------------------------");
    console.log("Enriching products...");
    console.log("Category items count:", categoryItems.length);

    const seenIds = new Set();

    const enriched = categoryItems.map((item, index) => {
      console.log("");
      console.log(`Item ${index + 1}`);
      console.log("Category Item:", item);

      if (seenIds.has(item.id)) {
        console.warn("⚠ Duplicate category item id:", item.id);
      }
      seenIds.add(item.id);

      const matches = allProducts.filter((p) => p.id === item.id);

      console.log(`Database matches for id=${item.id}:`, matches.length);

      if (matches.length > 1) {
        console.warn("⚠ Multiple database products have the same id!", matches);
      }

      if (matches.length === 0) {
        console.warn("⚠ Product not found in database, using category item.");
      }

      return matches[0] ?? item;
    });

    console.log("----------------------------------------");
    console.log("Final enriched product count:", enriched.length);
    console.log("Final products:", enriched);

    return enriched;
  };

  // =====================================================
  // LEVEL 1
  // =====================================================

  console.log("");
  console.log("Checking Level 1...");

  const targetL1 = tree.find((c) => {
    const slug = formatSlug(c.title);
    console.log(`Compare L1: "${slug}" === "${categorySlug}"`);
    return slug === categorySlug;
  });

  if (targetL1) {
    console.log("✅ Matched Level 1:", targetL1.title);

    const items = (targetL1.subCategories || []).flatMap((s) => {
      console.log(`SubCategory "${s.title}" groups:`, s.groups?.length ?? 0);

      return (s.groups || []).flatMap((g) => {
        console.log(`  Group "${g.title}" items:`, g.items?.length ?? 0);
        return g.items || [];
      });
    });

    console.log("Collected items:", items.length);

    return {
      products: enrichProducts(items),
      breadcrumbs: [targetL1.title],
      title: targetL1.title,
    };
  }

  // =====================================================
  // LEVEL 2
  // =====================================================

  console.log("");
  console.log("Checking Level 2...");

  for (const l1 of tree) {
    console.log("Inside L1:", l1.title);

    const targetL2 = l1.subCategories?.find((s) => {
      const slug = formatSlug(s.title);

      console.log(`Compare L2: "${slug}" === "${categorySlug}"`);

      return slug === categorySlug;
    });

    if (targetL2) {
      console.log("✅ Matched Level 2:", targetL2.title);

      const items = (targetL2.groups || []).flatMap((g) => {
        console.log(`Group "${g.title}" items:`, g.items?.length ?? 0);
        return g.items || [];
      });

      console.log("Collected items:", items.length);

      return {
        products: enrichProducts(items),
        breadcrumbs: [l1.title, targetL2.title],
        title: targetL2.title,
      };
    }
  }

  // =====================================================
  // LEVEL 3
  // =====================================================

  console.log("");
  console.log("Checking Level 3...");

  for (const l1 of tree) {
    console.log("L1:", l1.title);

    for (const l2 of l1.subCategories || []) {
      console.log("  L2:", l2.title);

      const targetL3 = l2.groups?.find((g) => {
        const slug = formatSlug(g.title);

        console.log(`Compare L3: "${slug}" === "${categorySlug}"`);

        return slug === categorySlug;
      });

      if (targetL3) {
        console.log("✅ Matched Level 3:", targetL3.title);

        console.log("Items inside group:", targetL3.items?.length ?? 0);

        console.table(targetL3.items);

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
