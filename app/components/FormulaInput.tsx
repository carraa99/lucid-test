"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormulaStore, Tag } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { calculateFormula } from "@/lib/utils";
import { AutocompleteItem } from "@/lib/types";
import { AUTOCOMPLETE_DATA } from "@/lib/constants";

const OPERATORS = ["+", "-", "*", "/", "(", ")", "^"];

export const FormulaInput = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const { tags, currentInput, setCurrentInput, addTag, removeTag, updateTag } =
    useFormulaStore();

  // Calculate result whenever tags change
  const result = calculateFormula(tags);

  // Autocomplete suggestions using React Query
  const { data: suggestions = [] } = useQuery({
    queryKey: ["suggestions", currentInput],
    queryFn: async () => {
      // In a real implementation, this would be an API call
      return AUTOCOMPLETE_DATA.filter(
        (item) =>
          item.name.toLowerCase().includes(currentInput.toLowerCase()) ||
          item.category.toLowerCase().includes(currentInput.toLowerCase())
      );
    },
    enabled: currentInput.length > 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentInput(value);

    // Check if the last character is an operator
    const lastChar = value[value.length - 1];
    if (OPERATORS.includes(lastChar)) {
      addTag({
        id: crypto.randomUUID(),
        type: "operator",
        value: lastChar,
      });
      setCurrentInput("");
    }

    // Check if the input is a natural number
    if (/^\d+$/.test(value)) {
      addTag({
        id: crypto.randomUUID(),
        type: "number",
        value: value,
      });
      setCurrentInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && currentInput === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1].id);
    }
  };

  const handleSuggestionClick = (suggestion: AutocompleteItem) => {
    addTag({
      id: crypto.randomUUID(),
      type: "variable",
      value: suggestion.name,
    });
    setCurrentInput("");
    setShowSuggestions(false);
  };

  const handleTagClick = (tagId: string) => {
    setActiveTagId(tagId);
  };

  const handleTagUpdate = (tagId: string, newValue: string) => {
    updateTag(tagId, newValue);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeTagId && !(event.target as Element).closest(".tag-dropdown")) {
        setActiveTagId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeTagId]);

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-2xl">
        <div className="flex flex-wrap gap-2 p-2 border rounded-lg min-h-[40px]">
          {tags.map((tag) => (
            <div key={tag.id} className="relative group tag-dropdown">
              <div className="flex items-center">
                <div
                  onClick={() => handleTagClick(tag.id)}
                  className={`px-2 py-1 rounded-md cursor-pointer ${
                    tag.type === "operator"
                      ? "bg-gray-100 text-gray-800"
                      : tag.type === "number"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {tag.value}
                </div>
                {activeTagId === tag.id && (
                  <div className="absolute left-full top-0 ml-1 w-64 bg-white border rounded-lg shadow-lg z-10">
                    <div className="p-2 space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <input
                          type="text"
                          value={tag.value}
                          onChange={(e) =>
                            handleTagUpdate(tag.id, e.target.value)
                          }
                          className="w-full px-2 py-1 border rounded"
                          autoFocus
                        />
                      </div>
                      {tag.type === "variable" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Value
                            </label>
                            <div className="w-full px-2 py-1 border rounded bg-gray-50 min-h-[32px] flex items-center">
                              {AUTOCOMPLETE_DATA.find(
                                (item) => item.name === tag.value
                              )?.value || "No value"}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            Category:{" "}
                            {
                              AUTOCOMPLETE_DATA.find(
                                (item) => item.name === tag.value
                              )?.category
                            }
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            className="flex-1 min-w-[100px] outline-none"
            placeholder="Type to add formula..."
          />
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-lg shadow-lg">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="font-medium">{suggestion.name}</div>
                <div className="text-sm text-gray-500">
                  {suggestion.category}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {tags.length > 0 && (
        <div className="text-lg font-medium">Result: {result}</div>
      )}
    </div>
  );
};
