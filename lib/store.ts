import { create } from "zustand";

export type Tag = {
  id: string;
  type: "variable" | "operator" | "number";
  value: string;
};

interface FormulaState {
  tags: Tag[];
  currentInput: string;
  setCurrentInput: (input: string) => void;
  addTag: (tag: Tag) => void;
  removeTag: (id: string) => void;
  updateTag: (id: string, value: string) => void;
}

export const useFormulaStore = create<FormulaState>((set) => ({
  tags: [],
  currentInput: "",
  setCurrentInput: (input) => set({ currentInput: input }),
  addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
  removeTag: (id) =>
    set((state) => ({
      tags: state.tags.filter((tag) => tag.id !== id),
    })),
  updateTag: (id, value) =>
    set((state) => ({
      tags: state.tags.map((tag) => (tag.id === id ? { ...tag, value } : tag)),
    })),
}));
