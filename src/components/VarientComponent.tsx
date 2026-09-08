import { useEffect, useMemo, useRef, useState } from "react";

interface MpnVariantDropdownProps {
  groupName: string;
  options: any[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  isOptionAvailable?: (value: string) => boolean;
}

export default function MpnVariantDropdown({
  groupName,
  options,
  selectedValue,
  onSelect,
  isOptionAvailable,
}: MpnVariantDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Reference to the entire dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking anywhere outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const uniqueOptions = useMemo(() => {
    if (!Array.isArray(options)) return [];

    const seenValues = new Set<string>();
    const uniqueItems: any[] = [];

    options.forEach((item) => {
      const rawLabel = (
        item.option ??
        item.name ??
        item.value ??
        item.label ??
        item.code ??
        item.sku ??
        ""
      )
        .toString()
        .trim();

      if (!rawLabel) return;

      // Hide unavailable options
      if (isOptionAvailable && !isOptionAvailable(rawLabel)) {
        return;
      }

      const normalizedKey = rawLabel.toLowerCase();

      if (!seenValues.has(normalizedKey)) {
        seenValues.add(normalizedKey);
        uniqueItems.push(item);
      }
    });

    return uniqueItems.sort((a, b) => {
      const labelA = (
        a.option ??
        a.name ??
        a.value ??
        a.label ??
        a.code ??
        a.sku ??
        ""
      ).toString();

      const labelB = (
        b.option ??
        b.name ??
        b.value ??
        b.label ??
        b.code ??
        b.sku ??
        ""
      ).toString();

      return labelA.localeCompare(labelB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }, [options, isOptionAvailable]);

  const filteredOptions = useMemo(() => {
    return uniqueOptions.filter((item) => {
      const displayValue = String(
        item.option ??
          item.name ??
          item.value ??
          item.label ??
          item.code ??
          item.sku ??
          "",
      ).trim();

      return displayValue.toLowerCase().includes(search.toLowerCase());
    });
  }, [uniqueOptions, search]);

  const selectedOption = uniqueOptions.find((item) => {
    const value = String(
      item.option ??
        item.name ??
        item.value ??
        item.label ??
        item.code ??
        item.sku ??
        "",
    ).trim();

    return value.toLowerCase() === String(selectedValue || "").toLowerCase();
  });

  const selectedLabel = selectedOption
    ? String(
        selectedOption.option ??
          selectedOption.name ??
          selectedOption.value ??
          selectedOption.label ??
          selectedOption.code ??
          selectedOption.sku ??
          "",
      )
    : "";

  return (
    <div ref={dropdownRef} className="relative">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {groupName}
      </p>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full max-w-sm cursor-pointer flex items-center justify-between border border-gray-300 rounded-sm px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:border-gray-400 transition"
      >
        <span className={selectedLabel ? "text-gray-700" : "text-gray-400"}>
          {selectedLabel || `Select ${groupName}`}
        </span>

        <span className="text-gray-500 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-w-sm bg-white border border-gray-300 rounded-sm shadow-lg">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${groupName}...`}
              autoFocus
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="border-b border-gray-200">
            <button
              type="button"
              onClick={() => {
                onSelect("");
                setOpen(false);
                setSearch("");
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition"
            >
              Clear selection
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((variant, index) => {
                const value = String(
                  variant.option ??
                    variant.name ??
                    variant.value ??
                    variant.label ??
                    variant.code ??
                    variant.sku ??
                    "",
                ).trim();

                const isSelected =
                  String(selectedValue || "").toLowerCase() ===
                  value.toLowerCase();

                const isAvailable = isOptionAvailable
                  ? isOptionAvailable(value)
                  : true;

                return (
                  <button
                    key={`${value}-${index}`}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      if (!isAvailable) return;

                      onSelect(value);

                      setOpen(false);
                      setSearch("");
                    }}
                    className={`w-full text-left px-3 py-2 text-sm transition ${
                      isSelected
                        ? "bg-orange-50 text-orange-700 font-semibold"
                        : isAvailable
                          ? "text-gray-700 hover:bg-gray-50"
                          : "text-gray-300 bg-gray-50 cursor-not-allowed"
                    }`}
                  >
                    {value}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-3 text-sm text-gray-400">
                No {groupName} found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
