-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "image_url" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "remaining" INTEGER NOT NULL DEFAULT 50,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencies" (
    "id" TEXT NOT NULL,
    "original_id" TEXT,
    "name" TEXT NOT NULL,
    "state" TEXT,
    "state_code" TEXT,
    "type" TEXT,
    "population" TEXT,
    "website" TEXT,
    "county" TEXT,
    "phone" TEXT,
    "mailing_address" TEXT,
    "physical_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "original_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" TEXT,
    "department" TEXT,
    "agency" TEXT,
    "agency_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_views" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_clerk_user_id_key" ON "user_profiles"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "contact_views_contact_id_clerk_user_id_key" ON "contact_views"("contact_id", "clerk_user_id");

-- AddForeignKey
ALTER TABLE "contact_views" ADD CONSTRAINT "contact_views_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
