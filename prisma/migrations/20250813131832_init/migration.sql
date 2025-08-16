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
CREATE TABLE "sessions" (
    "id" TEXT PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "packs" (
    "id" SERIAL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "released" TIMESTAMP NOT NULL,
    "position" INTEGER,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "cards" (
    "id" SERIAL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pack_code" TEXT NOT NULL,
    "card_type" TEXT NOT NULL,
    "faction" TEXT,
    "cost" INTEGER,
    "traits" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "collections" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "pack_code" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "deck_cards" (
    "id" SERIAL PRIMARY KEY,
    "deck_id" INTEGER NOT NULL,
    "card_code" TEXT NOT NULL,
    "card_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "card_type" TEXT NOT NULL,
    "pack_code" TEXT NOT NULL
);

-- Create Foreign Key Constraints
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cards" ADD CONSTRAINT "cards_pack_code_fkey"
    FOREIGN KEY ("pack_code") REFERENCES "packs" ("code") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "collections" ADD CONSTRAINT "collections_pack_code_fkey"
    FOREIGN KEY ("pack_code") REFERENCES "packs" ("code") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "decks" ADD CONSTRAINT "decks_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "deck_cards" ADD CONSTRAINT "deck_cards_deck_id_fkey"
    FOREIGN KEY ("deck_id") REFERENCES "decks" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create Indexes
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");
CREATE UNIQUE INDEX "packs_code_key" ON "packs"("code");
CREATE UNIQUE INDEX "cards_code_key" ON "cards"("code");
CREATE UNIQUE INDEX "collections_user_id_pack_code_key" ON "collections"("user_id", "pack_code");
CREATE UNIQUE INDEX "decks_user_id_marvelcdb_id_key" ON "decks"("user_id", "marvelcdb_id");