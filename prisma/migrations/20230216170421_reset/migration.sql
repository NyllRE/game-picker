/*
  Warnings:

  - The primary key for the `Publisher` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `Publisher` table. All the data in the column will be lost.
  - The primary key for the `Developer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `_id` on the `Developer` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Publisher" (
    "name" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "new_Publisher" ("name") SELECT "name" FROM "Publisher";
DROP TABLE "Publisher";
ALTER TABLE "new_Publisher" RENAME TO "Publisher";
CREATE UNIQUE INDEX "Publisher_name_key" ON "Publisher"("name");
CREATE TABLE "new__DeveloperToGame" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_DeveloperToGame_A_fkey" FOREIGN KEY ("A") REFERENCES "Developer" ("name") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DeveloperToGame_B_fkey" FOREIGN KEY ("B") REFERENCES "Game" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__DeveloperToGame" ("A", "B") SELECT "A", "B" FROM "_DeveloperToGame";
DROP TABLE "_DeveloperToGame";
ALTER TABLE "new__DeveloperToGame" RENAME TO "_DeveloperToGame";
CREATE UNIQUE INDEX "_DeveloperToGame_AB_unique" ON "_DeveloperToGame"("A", "B");
CREATE INDEX "_DeveloperToGame_B_index" ON "_DeveloperToGame"("B");
CREATE TABLE "new__GameToPublisher" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GameToPublisher_A_fkey" FOREIGN KEY ("A") REFERENCES "Game" ("_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GameToPublisher_B_fkey" FOREIGN KEY ("B") REFERENCES "Publisher" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__GameToPublisher" ("A", "B") SELECT "A", "B" FROM "_GameToPublisher";
DROP TABLE "_GameToPublisher";
ALTER TABLE "new__GameToPublisher" RENAME TO "_GameToPublisher";
CREATE UNIQUE INDEX "_GameToPublisher_AB_unique" ON "_GameToPublisher"("A", "B");
CREATE INDEX "_GameToPublisher_B_index" ON "_GameToPublisher"("B");
CREATE TABLE "new_Developer" (
    "name" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "new_Developer" ("name") SELECT "name" FROM "Developer";
DROP TABLE "Developer";
ALTER TABLE "new_Developer" RENAME TO "Developer";
CREATE UNIQUE INDEX "Developer_name_key" ON "Developer"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
