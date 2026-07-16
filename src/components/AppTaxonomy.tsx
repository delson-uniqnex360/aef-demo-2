import { Link, useLocation, useParams } from "react-router-dom";
import type { Product } from "../types/Product";

interface Props {
  products?: Product[];
}

const formatSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
};

const AppTaxonomy = ({ products = [] }: Props) => {
  const location = useLocation();

  const {
    level1: urlLevel1,
    level2: urlLevel2,
    level3: urlLevel3,
    categorySlug,
    sku,
  } = useParams();

  let level1 = urlLevel1;
  let level2 = urlLevel2;
  let level3 = urlLevel3;

  const isProductPage =
    location.pathname.startsWith("/product/") &&
    !location.pathname.startsWith("/product/detail/");

  const isProductDetailPage = location.pathname.startsWith("/product/detail/");

  // /product/:categorySlug
  if (isProductPage && categorySlug && products.length) {
    const product = products.find(
      (p) => p.categories?.[2] === decodeURIComponent(categorySlug),
    );

    if (product) {
      level1 = product.categories?.[0];
      level2 = product.categories?.[1];
      level3 = product.categories?.[2];
    }
  }

  // /product/detail/:sku
  if (isProductDetailPage && sku && products.length) {
    const product = products.find((p) => p.sku === sku);

    if (product) {
      level1 = product.categories?.[0];
      level2 = product.categories?.[1];
      level3 = product.categories?.[2];
    }
  }

  const levels = [level1, level2, level3].filter(Boolean) as string[];

  return (
    <nav className="flex flex-wrap items-center gap-2 py-3 text-sm text-gray-500">
      <Link to="/" className="hover:text-black transition-colors">
        Home
      </Link>

      {levels.map((level, index) => {
        const isLast = index === levels.length - 1;

        const slug = formatSlug(level);

        let href = "/";

        if (index === 0) {
          href = `/category/${slug}`;
        } else if (index === 1) {
          href = `/category/${formatSlug(levels[0])}/${slug}`;
        } else {
          // Level 3
          href =
            isProductPage || isProductDetailPage
              ? `/product/${slug}`
              : `/category/${formatSlug(levels[0])}/${formatSlug(levels[1])}/${slug}`;
        }

        return (
          <div key={level} className="flex items-center gap-2">
            <span>&gt;</span>

            <Link
              to={href}
              className={`transition-colors ${
                isLast
                  ? "font-medium text-gray-700 hover:underline"
                  : "hover:text-black"
              }`}
            >
              {level}
            </Link>
          </div>
        );
      })}
    </nav>
  );
};

export default AppTaxonomy;
