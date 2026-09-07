import pandas as pd
import json


def excel_to_json(excel_file_path, output_json_path="data.json"):
    # Read Excel file
    df = pd.read_excel(excel_file_path)

    # Replace NaN / None values with empty string
    df = df.where(pd.notnull(df), None)

    products = []
    current_product = None
    product_id = 1

    for _, row in df.iterrows():
        item_type = str(row.get("Item Type", "") or "").strip().lower()

        if item_type == "parent":
            # Save previous parent product
            if current_product:
                products.append(current_product)

            parent_code = str(row.get("Code", "") or "").strip()

            # Parse categories
            categories = []
            cat_tree = row.get("Category Tree") or row.get("Unnamed: 22") or ""
            if cat_tree:
                if ">" in str(cat_tree):
                    categories = [
                        c.strip() for c in str(cat_tree).split(">") if c.strip()
                    ]
                else:
                    categories = [c.strip() for c in str(cat_tree).split() if c.strip()]

            # Construct main parent JSON structure
            current_product = {
                "id": product_id,
                "sku": parent_code,
                "product_name": str(row.get("Name", "") or ""),
                "product_sub_title": str(
                    row.get("Page Title", "") or str(row.get("Name", "") or "")
                ),
                "brand": str(row.get("Brand", "") or ""),
                "mpn": parent_code,
                "categories": categories,
                "taxonomy": " > ".join(categories) if categories else "",
                "content": str(row.get("Content", "") or ""),
                "tech_spec": "",
                "meta_keywords": str(row.get("Meta, Keywords", "") or ""),
                "meta_description": str(row.get("Meta Description", "") or ""),
                "status": str(row.get("Status", "visible") or "visible").lower(),
                "price": str(row.get("Price", "") or "0.00"),
                "currency": "EUR",
                "variants": {},
                "images": [str(row.get("Image", ""))] if row.get("Image") else [],
                "documents": [],
            }

            # Extract parent option names if defined
            for i in range(1, 4):
                opt_name = row.get(f"Option {i} Name")
                if opt_name and str(opt_name).strip():
                    current_product["variants"][str(opt_name).strip()] = []

            product_id += 1

        elif item_type == "variant" and current_product:
            var_code = str(row.get("Code", "") or "").strip()
            var_name = str(row.get("Name", "") or "").strip()
            var_price = str(row.get("Price", "") or "0.00").strip()

            # Process option values for variant
            for i in range(1, 4):
                opt_val = row.get(f"Option {i} Value")
                if opt_val and str(opt_val).strip():
                    opt_val_str = str(opt_val).strip()

                    # Match option name from parent or fallback to 'Option N'
                    opt_keys = list(current_product["variants"].keys())
                    if i - 1 < len(opt_keys):
                        opt_name = opt_keys[i - 1]
                    else:
                        opt_name = f"Variant {i}"
                        if opt_name not in current_product["variants"]:
                            current_product["variants"][opt_name] = []

                    variant_entry = {
                        "code": var_code,
                        "name": var_name,
                        "option": opt_val_str,
                        "price": var_price,
                    }

                    # Prevent duplicate entries
                    if variant_entry not in current_product["variants"][opt_name]:
                        current_product["variants"][opt_name].append(variant_entry)

    # Append the last product
    if current_product:
        products.append(current_product)

    # Write to data.json
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print(
        f"Successfully converted and saved {len(products)} products to '{output_json_path}'"
    )


# Execute conversion
if __name__ == "__main__":
    excel_file = "aef-data.xlsx"  # Change to your actual file name
    excel_to_json(excel_file, "data.json")
