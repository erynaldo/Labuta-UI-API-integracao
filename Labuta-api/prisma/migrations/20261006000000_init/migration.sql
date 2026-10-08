-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'PROFESSIONAL', 'ADMIN');
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "DocumentType" AS ENUM ('CPF', 'CNPJ');
CREATE TYPE "RequestKind" AS ENUM ('QUOTE', 'SERVICE');
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "cpf" VARCHAR(11),
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "professions" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "professions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "professional_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "profession_id" UUID NOT NULL,
    "document_type" "DocumentType",
    "document_number" VARCHAR(20),
    "bio" VARCHAR(2000) NOT NULL,
    "experience_years" INTEGER NOT NULL DEFAULT 0,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "professional_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "professional_services" (
    "profile_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    CONSTRAINT "professional_services_pkey" PRIMARY KEY ("profile_id", "name")
);

CREATE TABLE "portfolio_items" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "image_url" VARCHAR(2048) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "portfolio_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "service_requests" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "professional_id" UUID NOT NULL,
    "kind" "RequestKind" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "description" VARCHAR(3000) NOT NULL,
    "desired_date" DATE,
    "quoted_price" DECIMAL(10,2),
    "attachment_url" VARCHAR(2048),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "receiver_id" UUID NOT NULL,
    "request_id" UUID,
    "content" VARCHAR(4000) NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "professional_id" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" VARCHAR(2000) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_events" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "subject_user_id" UUID,
    "action" VARCHAR(160) NOT NULL,
    "details" VARCHAR(2000),
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_role_status_idx" ON "users"("role", "status");
CREATE UNIQUE INDEX "professions_name_key" ON "professions"("name");
CREATE UNIQUE INDEX "professional_profiles_user_id_key" ON "professional_profiles"("user_id");
CREATE UNIQUE INDEX "professional_profiles_document_number_key" ON "professional_profiles"("document_number");
CREATE INDEX "professional_profiles_profession_id_available_idx" ON "professional_profiles"("profession_id", "available");
CREATE INDEX "portfolio_items_profile_id_idx" ON "portfolio_items"("profile_id");
CREATE INDEX "service_requests_client_id_status_idx" ON "service_requests"("client_id", "status");
CREATE INDEX "service_requests_professional_id_status_idx" ON "service_requests"("professional_id", "status");
CREATE INDEX "messages_receiver_id_read_at_created_at_idx" ON "messages"("receiver_id", "read_at", "created_at");
CREATE INDEX "messages_request_id_created_at_idx" ON "messages"("request_id", "created_at");
CREATE UNIQUE INDEX "reviews_request_id_key" ON "reviews"("request_id");
CREATE INDEX "reviews_professional_id_created_at_idx" ON "reviews"("professional_id", "created_at");
CREATE INDEX "audit_events_flagged_resolved_at_created_at_idx" ON "audit_events"("flagged", "resolved_at", "created_at");
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_profession_id_fkey" FOREIGN KEY ("profession_id") REFERENCES "professions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "professional_services" ADD CONSTRAINT "professional_services_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "professional_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "professional_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professional_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "service_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professional_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_subject_user_id_fkey" FOREIGN KEY ("subject_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ALTER TABLE "users" ADD COLUMN "cpf" VARCHAR(11);
-- CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");