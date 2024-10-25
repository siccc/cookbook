-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "cookedCount" INTEGER NOT NULL DEFAULT 0,
    "servings" TEXT NOT NULL,
    "prepTime" INTEGER,
    "cookTime" INTEGER,
    "ingredients" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "nutritionData" TEXT DEFAULT '',
    "imageName" TEXT NOT NULL DEFAULT '',
    "imagePublicId" TEXT NOT NULL DEFAULT '',
    "accountId" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Recipe" ("accountId", "category", "cookTime", "cookedCount", "createdAt", "id", "imageName", "imagePublicId", "ingredients", "notes", "nutritionData", "prepTime", "servings", "steps", "title", "updatedAt") SELECT "accountId", "category", "cookTime", "cookedCount", "createdAt", "id", "imageName", "imagePublicId", "ingredients", "notes", "nutritionData", "prepTime", "servings", "steps", "title", "updatedAt" FROM "Recipe";
DROP TABLE "Recipe";
ALTER TABLE "new_Recipe" RENAME TO "Recipe";
CREATE UNIQUE INDEX "Recipe_id_key" ON "Recipe"("id");
PRAGMA foreign_key_check("Recipe");
PRAGMA foreign_keys=ON;
