-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "collections" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "pack_code" TEXT NOT NULL,
    "pack_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "decks" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "marvelcdb_id" INTEGER,
    "name" TEXT NOT NULL,
    "hero_code" TEXT NOT NULL,
    "hero_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deck_url" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "decks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "deck_cards" (
    "id" SERIAL PRIMARY KEY,
    "deck_id" INTEGER NOT NULL,
    "card_code" TEXT NOT NULL,
    "card_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "card_type" TEXT NOT NULL,
    "pack_code" TEXT NOT NULL,
    CONSTRAINT "deck_cards_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "decks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "collections_user_id_pack_code_key" ON "collections"("user_id", "pack_code");

-- CreateIndex
CREATE UNIQUE INDEX "decks_marvelcdb_id_key" ON "decks"("marvelcdb_id");