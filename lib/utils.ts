import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Tag } from "./store";
import { AutocompleteItem } from "./types";
import { AUTOCOMPLETE_DATA } from "./constants";

// Create a map of variable values from the autocomplete data
const VARIABLE_VALUES: Record<string, number> = AUTOCOMPLETE_DATA.reduce(
  (acc, item) => {
    if (typeof item.value === "number") {
      acc[item.name] = item.value;
    } else if (typeof item.value === "string" && !isNaN(Number(item.value))) {
      acc[item.name] = Number(item.value);
    } else {
      acc[item.name] = 0;
    }
    return acc;
  },
  {} as Record<string, number>
);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const calculateFormula = (tags: Tag[]): number => {
  const formula = tags
    .map((tag) => {
      if (tag.type === "variable") {
        return VARIABLE_VALUES[tag.value] || 0;
      }
      return tag.value;
    })
    .join("");

  try {
    // Using Function constructor to safely evaluate the formula
    // Note: In a production environment, you should use a proper formula parser
    return new Function(`return ${formula}`)();
  } catch (error) {
    console.error("Error calculating formula:", error);
    return 0;
  }
};

export const getVariableValue = (variableName: string): number => {
  return VARIABLE_VALUES[variableName] || 0;
};
