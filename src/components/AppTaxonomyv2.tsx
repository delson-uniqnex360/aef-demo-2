import { Link, useLocation, useParams } from "react-router-dom";
import type { Product } from "../types/Product";

interface Props {
  products?: Product[];
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const formatSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
};

const AppTaxonomyV2 = ({ products = [] }: Props) => {
  const location = useLocation();
  const params = useParams();

  const {
    level1: urlLevel1,
    level2: urlLevel2,
    level3: urlLevel3,
    categorySlug,
    sku,
  } = params;

  let level1 = urlLevel1;
  let level2 = urlLevel2;
  let level3 = urlLevel3;
  let brandName: string | undefined;
  let productName: string | undefined;

  const isProductCategoryPage =
    location.pathname.startsWith("/product/") &&
    !location.pathname.startsWith("/product/detail/");

  const isProductDetailPage = location.pathname.startsWith("/product/detail/");

  // Match product by category slug if on /product/:categorySlug
  if (isProductCategoryPage && categorySlug && products.length) {
    const decodedCategory = decodeURIComponent(categorySlug);
    const matchedProduct = products.find(
      (p) => p.categories?.[2] === decodedCategory,
    );

    if (matchedProduct) {
      level1 = matchedProduct.categories?.[0];
      level2 = matchedProduct.categories?.[1];
      level3 = matchedProduct.categories?.[2];
      brandName = matchedProduct.brand;
    }
  }

  // Match product by SKU if on /product/detail/:sku
  if (isProductDetailPage && sku && products.length) {
    const matchedProduct = products.find((p) => p.sku === sku);

    if (matchedProduct) {
      level1 = matchedProduct.categories?.[0];
      level2 = matchedProduct.categories?.[1];
      level3 = matchedProduct.categories?.[2];
      brandName = matchedProduct.brand;
      productName =
        matchedProduct.product_name  || matchedProduct.sku;
    }
  }

  // 1. Static base flow
  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/" },
    { label: "Categories", href: "/" },
  ];

  // 2. Dynamic taxonomy levels
  if (level1) {
    items.push({
      label: level1,
      href: `/category/${formatSlug(level1)}`,
    });
  }

  if (level1 && level2) {
    items.push({
      label: level2,
      href: `/category/${formatSlug(level1)}/${formatSlug(level2)}`,
    });
  }

  if (level1 && level2 && level3) {
    items.push({
      label: level3,
      href: `/category/${formatSlug(level1)}/${formatSlug(level2)}/${formatSlug(level3)}`,
    });
  }

  // 3. Dynamic Brand & Product Name
  if (brandName) {
    items.push({
      label: brandName,
      href: undefined,
    });
  }

  if (productName) {
    // Last leaf node doesn't strictly need a link
    items.push({ label: productName });
  }

  return (
    <nav aria-label="Breadcrumb" className="py-3 text-sm text-gray-500">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-2"
            >
              {index > 0 && <span className="text-gray-400">&gt;</span>}

              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="font-medium text-gray-800 break-all"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="hover:text-black transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default AppTaxonomyV2;
