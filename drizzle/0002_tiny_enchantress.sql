ALTER TABLE "cart_items" ADD COLUMN "unit_price_snapshot_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "session_id" text;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "converted_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_cart_product_unique" ON "cart_items" USING btree ("cart_id","product_id");--> statement-breakpoint
CREATE INDEX "cart_items_cart_id_idx" ON "cart_items" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "carts_user_status_idx" ON "carts" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "carts_guest_status_idx" ON "carts" USING btree ("guest_token","status");--> statement-breakpoint
CREATE INDEX "carts_session_status_idx" ON "carts" USING btree ("session_id","status");