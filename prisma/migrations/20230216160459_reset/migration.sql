-- CreateTable
CREATE TABLE "User" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "imageId" TEXT,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL,
    "roleName" TEXT NOT NULL DEFAULT 'BASIC',
    CONSTRAINT "User_roleName_fkey" FOREIGN KEY ("roleName") REFERENCES "Role" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Role" (
    "name" TEXT NOT NULL DEFAULT 'BASIC'
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL,
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Game" (
    "_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "short_description" TEXT,
    "header_image" TEXT,
    "website" TEXT,
    "favoritedById" TEXT,
    "rating" REAL
);

-- CreateTable
CREATE TABLE "Developer" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Publisher" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Genre" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_GameToPublisher" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GameToPublisher_A_fkey" FOREIGN KEY ("A") REFERENCES "Game" ("_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GameToPublisher_B_fkey" FOREIGN KEY ("B") REFERENCES "Publisher" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_GameToGenre" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GameToGenre_A_fkey" FOREIGN KEY ("A") REFERENCES "Game" ("_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GameToGenre_B_fkey" FOREIGN KEY ("B") REFERENCES "Genre" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_GameToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GameToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Game" ("_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GameToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_DeveloperToGame" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_DeveloperToGame_A_fkey" FOREIGN KEY ("A") REFERENCES "Developer" ("_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DeveloperToGame_B_fkey" FOREIGN KEY ("B") REFERENCES "Game" ("_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User__id_key" ON "User"("_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken__id_key" ON "RefreshToken"("_id");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Game__id_key" ON "Game"("_id");

-- CreateIndex
CREATE UNIQUE INDEX "Developer__id_key" ON "Developer"("_id");

-- CreateIndex
CREATE UNIQUE INDEX "Publisher__id_key" ON "Publisher"("_id");

-- CreateIndex
CREATE UNIQUE INDEX "Genre__id_key" ON "Genre"("_id");

-- CreateIndex
CREATE UNIQUE INDEX "_GameToPublisher_AB_unique" ON "_GameToPublisher"("A", "B");

-- CreateIndex
CREATE INDEX "_GameToPublisher_B_index" ON "_GameToPublisher"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GameToGenre_AB_unique" ON "_GameToGenre"("A", "B");

-- CreateIndex
CREATE INDEX "_GameToGenre_B_index" ON "_GameToGenre"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GameToUser_AB_unique" ON "_GameToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_GameToUser_B_index" ON "_GameToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DeveloperToGame_AB_unique" ON "_DeveloperToGame"("A", "B");

-- CreateIndex
CREATE INDEX "_DeveloperToGame_B_index" ON "_DeveloperToGame"("B");
