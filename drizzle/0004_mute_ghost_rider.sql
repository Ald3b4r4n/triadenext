CREATE TABLE "shipping_quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid,
	"postal_code" text NOT NULL,
	"cart_hash" text NOT NULL,
	"provider" "shipping_provider" DEFAULT 'manual' NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"options" jsonb NOT NULL,
	"selected_option_id" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shipping_rules" ALTER COLUMN "rule_type" SET DEFAULT 'uf';--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "shipping_postal_code" text;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "selected_shipping_quote_id" uuid;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "selected_shipping_option" jsonb;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "shipping_amount_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "shipping_rules" ADD COLUMN "uf" text;--> statement-breakpoint
ALTER TABLE "shipping_rules" ADD COLUMN "postal_code_start" text;--> statement-breakpoint
ALTER TABLE "shipping_rules" ADD COLUMN "postal_code_end" text;--> statement-breakpoint
ALTER TABLE "shipping_rules" ADD COLUMN "price_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "shipping_rules" ADD COLUMN "priority" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "shipping_quotes" ADD CONSTRAINT "shipping_quotes_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "shipping_quotes_cart_id_idx" ON "shipping_quotes" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "shipping_quotes_expires_at_idx" ON "shipping_quotes" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "carts_selected_shipping_quote_id_idx" ON "carts" USING btree ("selected_shipping_quote_id");--> statement-breakpoint
CREATE INDEX "shipping_rules_active_manual_idx" ON "shipping_rules" USING btree ("provider","is_active","priority");--> statement-breakpoint
CREATE INDEX "shipping_rules_uf_idx" ON "shipping_rules" USING btree ("uf");--> statement-breakpoint
CREATE INDEX "shipping_rules_postal_range_idx" ON "shipping_rules" USING btree ("postal_code_start","postal_code_end");