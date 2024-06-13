export interface Recipe {
  id: string,
  title: string,
  category: string,
  cookTime?: number
  prepTime?: number,
  servings: string,
  cookedCount: number,
  tags?: Tag[],
  ingredients: string,
  steps: string,
  notes: string,
  imageName: string,
  imagePublicId: string
}

export interface Tag {
  id?: string,
  name: string
}

export interface RecipeExtract {
  id: string,
  title: string,
  category: string,
  imagePublicId?: string
}

export interface Account {
  id: string,
  createdAt: string,
  users: User[]
}

export interface User {
  userId: string,
  isMultiAccount: string,
  firstName?: string,
  lastName?: string,
  displayName?: string,
  profileImage?: string,
  settings: UserSettings,
}

export interface UserSettings {
  lang: string,
  location: string
}

export interface ShoppingList {
  id: string,
  items: ShoppingListItem[]
}

export interface ShoppingListItem {
  checked: boolean,
  name: string
}

export interface FoodList {
  vegetables: Food[],
  fruits: Food[]
}

export interface Food {
  name_EN: string,
  name_HU: string,
  inSeason_HU: number[],
  inSeason_NL: number[],
  stored_HU: number[],
  stored_NL: number[],
  imageId?: string
}
