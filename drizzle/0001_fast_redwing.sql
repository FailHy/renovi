ALTER TABLE "projek" ADD COLUMN "is_verified_complete" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "projek" ADD COLUMN "verified_by" uuid;--> statement-breakpoint
ALTER TABLE "projek" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "projek" ADD COLUMN "verification_note" text;--> statement-breakpoint
ALTER TABLE "projek" ADD CONSTRAINT "projek_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;