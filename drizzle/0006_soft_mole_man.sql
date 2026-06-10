CREATE UNIQUE INDEX "payment_events_event_id_unique" ON "payment_events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "payment_events_payment_intent_id_idx" ON "payment_events" USING btree ("payment_intent_id");--> statement-breakpoint
CREATE INDEX "payment_events_order_id_idx" ON "payment_events" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_intents_provider_reference_unique" ON "payment_intents" USING btree ("provider_reference");--> statement-breakpoint
CREATE INDEX "payment_intents_order_status_idx" ON "payment_intents" USING btree ("order_id","status");