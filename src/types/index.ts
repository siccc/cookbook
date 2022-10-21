//ComputedRef
import type { ComputedRef } from 'vue';

export interface Recipe {
  id: number,
  title: string,
  category: string,
  cookTime: number
  prepTime?: number,
  totalTime?: ComputedRef<number>,
  servings: string,
  cookedCount: number,
  // TODO: tags: []
  ingredients: string
  steps: string
  notes: string
}
