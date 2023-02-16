/*
  Warnings:

  - You are about to alter the column `A` on the `_DeveloperToGame` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `Genre` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `_id` on the `Genre` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `B` on the `_GameToGenre` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `Developer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `_id` on the `Developer` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `Publisher` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `_id` on the `Publisher` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `B` on the `_GameToPublisher` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new__DeveloperToGame" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_DeveloperToGame_A_fkey" FOREIGN KEY ("A") REFERENCES "Developer" ("_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DeveloperToGame_B_fkey" FOREIGN KEY ("B") REFERENCES "Game" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__DeveloperToGame" ("A", "B") SELECT "A", "B" FROM "_DeveloperToGame";
DROP TABLE "_DeveloperToGame";
ALTER TABLE "new__DeveloperToGame" RENAME TO "_DeveloperToGame";
CREATE UNIQUE INDEX "_DeveloperToGame_AB_unique" ON "_DeveloperToGame"("A", "B");
CREATE INDEX "_DeveloperToGame_B_index" ON "_DeveloperToGame"("B");
CREATE TABLE "new_Genre" (
    "_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Genre" ("_id", "name") SELECT "_id", "name" FROM "Genre";
DROP TABLE "Genre";
ALTER TABLE "new_Genre" RENAME TO "Genre";
CREATE UNIQUE INDEX "Genre__id_key" ON "Genre"("_id");
CREATE TABLE "new__GameToGenre" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_GameToGenre_A_fkey" FOREIGN KEY ("A") REFERENCES "Game" ("_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GameToGenre_B_fkey" FOREIGN KEY ("B") REFERENCES "Genre" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__GameToGenre" ("A", "B") SELECT "A", "B" FROM "_GameToGenre";
DROP TABLE "_GameToGenre";
ALTER TABLE "new__GameToGenre" RENAME TO "_GameToGenre";
CREATE UNIQUE INDEX "_GameToGenre_AB_unique" ON "_GameToGenre"("A", "B");
CREATE INDEX "_GameToGenre_B_index" ON "_GameToGenre"("B");
CREATE TABLE "new_Developer" (
    "_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Developer" ("_id", "name") SELECT "_id", "name" FROM "Developer";
DROP TABLE "Developer";
ALTER TABLE "new_Developer" RENAME TO "Developer";
CREATE UNIQUE INDEX "Developer__id_key" ON "Developer"("_id");
CREATE TABLE "new_Publisher" (
    "_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Publisher" ("_id", "name") SELECT "_id", "name" FROM "Publisher";
DROP TABLE "Publisher";
ALTER TABLE "new_Publisher" RENAME TO "Publisher";
CREATE UNIQUE INDEX "Publisher__id_key" ON "Publisher"("_id");
CREATE TABLE "new__GameToPublisher" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_GameToPublisher_A_fkey" FOREIGN KEY ("A") REFERENCES "Game" ("_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GameToPublisher_B_fkey" FOREIGN KEY ("B") REFERENCES "Publisher" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__GameToPublisher" ("A", "B") SELECT "A", "B" FROM "_GameToPublisher";
DROP TABLE "_GameToPublisher";
ALTER TABLE "new__GameToPublisher" RENAME TO "_GameToPublisher";
CREATE UNIQUE INDEX "_GameToPublisher_AB_unique" ON "_GameToPublisher"("A", "B");
CREATE INDEX "_GameToPublisher_B_index" ON "_GameToPublisher"("B");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
