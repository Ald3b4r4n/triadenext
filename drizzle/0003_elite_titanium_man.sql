ALTER TABLE "carts" ADD COLUMN "applied_coupon_id" uuid;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "minimum_subtotal_cents" integer;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_applied_coupon_id_coupons_id_fk" FOREIGN KEY ("applied_coupon_id") REFERENCES "public"."coupons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "carts_applied_coupon_id_idx" ON "carts" USING btree ("applied_coupon_id");--> statement-breakpoint
CREATE UNIQUE INDEX "coupons_code_unique" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX "coupons_active_window_idx" ON "coupons" USING btree ("is_active","starts_at","ends_at");