CREATE TABLE "artikel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"judul" text NOT NULL,
	"konten" text NOT NULL,
	"gambar" text,
	"kategori" text,
	"published" boolean DEFAULT false NOT NULL,
	"posting" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bahan_harian" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proyek_id" uuid NOT NULL,
	"milestone_id" uuid,
	"status" text NOT NULL,
	"nama" text NOT NULL,
	"deskripsi" text,
	"gambar" text[],
	"harga" real NOT NULL,
	"kuantitas" real DEFAULT 1 NOT NULL,
	"satuan" text NOT NULL,
	"tanggal" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestone" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proyek_id" uuid NOT NULL,
	"status" text NOT NULL,
	"nama" text NOT NULL,
	"deskripsi" text,
	"gambar" text[],
	"tanggal" timestamp NOT NULL,
	"mulai" timestamp,
	"selesai" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proyek_id" uuid NOT NULL,
	"name" text NOT NULL,
	"client" text NOT NULL,
	"location" text NOT NULL,
	"category" text NOT NULL,
	"duration" text NOT NULL,
	"completed_date" timestamp NOT NULL,
	"description" text NOT NULL,
	"image_url" text[],
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "portfolio_proyek_id_unique" UNIQUE("proyek_id")
);
--> statement-breakpoint
CREATE TABLE "projek" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pelanggan_id" uuid NOT NULL,
	"mandor_id" uuid,
	"status" text NOT NULL,
	"nama" text NOT NULL,
	"tipe_layanan" text NOT NULL,
	"deskripsi" text NOT NULL,
	"gambar" text[],
	"alamat" text NOT NULL,
	"telpon" text,
	"mulai" timestamp NOT NULL,
	"selesai" timestamp,
	"progress" integer DEFAULT 0 NOT NULL,
	"last_update" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimoni" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proyek_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"komentar" text NOT NULL,
	"gambar" text,
	"rating" integer NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"approved_at" timestamp,
	"approved_by" uuid,
	"posting" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "testimoni_proyek_id_unique" UNIQUE("proyek_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" text NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"alamat" text,
	"telpon" text,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "artikel" ADD CONSTRAINT "artikel_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bahan_harian" ADD CONSTRAINT "bahan_harian_proyek_id_projek_id_fk" FOREIGN KEY ("proyek_id") REFERENCES "public"."projek"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bahan_harian" ADD CONSTRAINT "bahan_harian_milestone_id_milestone_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestone"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_proyek_id_projek_id_fk" FOREIGN KEY ("proyek_id") REFERENCES "public"."projek"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_proyek_id_projek_id_fk" FOREIGN KEY ("proyek_id") REFERENCES "public"."projek"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projek" ADD CONSTRAINT "projek_pelanggan_id_user_id_fk" FOREIGN KEY ("pelanggan_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projek" ADD CONSTRAINT "projek_mandor_id_user_id_fk" FOREIGN KEY ("mandor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimoni" ADD CONSTRAINT "testimoni_proyek_id_projek_id_fk" FOREIGN KEY ("proyek_id") REFERENCES "public"."projek"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimoni" ADD CONSTRAINT "testimoni_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimoni" ADD CONSTRAINT "testimoni_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;