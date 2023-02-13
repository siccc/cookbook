import foodsJson from '@/assets/sesonalFoods.json?raw';
import type { Food, FoodList } from '@/types';

const currentMonthIndex = new Date().getMonth();
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export function getSeasonalFoods(): FoodList {
  const foods = JSON.parse(foodsJson);
  return foods;
}

export function getSeasonalFoodsByMonth(month: string): FoodList {
  const monthIndex = months.indexOf(month);
  const foods = getSeasonalFoods();
  return {
    fruits: foods.fruits
      .filter((fruit: Food) => !!fruit.inSeason_HU && !!fruit.inSeason_HU[monthIndex])
      .sort((a: Food, b: Food) => a.name_EN.localeCompare(b.name_EN)),
    vegetables: foods.vegetables
      .filter((veggie: Food) => !!veggie.inSeason_HU && !!veggie.inSeason_HU[monthIndex])
      .sort((a: Food, b: Food) => a.name_EN.localeCompare(b.name_EN))
  };
}

export function getCurrentMonth() {
  return months[currentMonthIndex];
}

export function getMonths() {
  return months;
}