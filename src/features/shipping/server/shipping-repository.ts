import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { shippingRules, shippingQuotes } from "@/db/schema";
import { devShippingRules } from "./shipping-fixtures";
import type { ShippingManualRule, ShippingQuote, ShippingRuleMutationInput } from "../types";

type ShippingRuleRow = typeof shippingRules.$inferSelect;
type ShippingQuoteRow = typeof shippingQuotes.$inferSelect;

export type ShippingRepository = {
  listManualRules(): Promise<ShippingManualRule[]>;
  findManualRuleById(id: string): Promise<ShippingManualRule | null>;
  createManualRule(input: ShippingRuleMutationInput): Promise<ShippingManualRule>;
  updateManualRule(id: string, input: ShippingRuleMutationInput): Promise<ShippingManualRule | null>;
  createQuote(quote: ShippingQuote): Promise<ShippingQuote>;
  findQuoteById(id: string): Promise<ShippingQuote | null>;
  listQuotesForCart(cartId: string): Promise<ShippingQuote[]>;
  selectQuoteOption(quoteId: string, optionId: string): Promise<ShippingQuote | null>;
};

export function createShippingRepository(): ShippingRepository {
  if (!db) {
    return createFallbackShippingRepository();
  }

  return createDrizzleShippingRepository();
}

function createFallbackShippingRepository(): ShippingRepository {
  const rules = new Map(devShippingRules.map((rule) => [rule.id, structuredClone(rule)]));
  const quotes = new Map<string, ShippingQuote>();

  return {
    async listManualRules() {
      return Array.from(rules.values());
    },
    async findManualRuleById(id) {
      return rules.get(id) ?? null;
    },
    async createManualRule(input) {
      const now = new Date();
      const rule: ShippingManualRule = {
        id: `shipping-rule-${rules.size + 1}`,
        name: input.name,
        provider: "manual",
        ruleType: input.uf ? "uf" : "postal_range",
        uf: input.uf,
        postalCodeStart: input.postalCodeStart,
        postalCodeEnd: input.postalCodeEnd,
        priceCents: input.priceCents,
        estimatedDays: input.estimatedDays,
        priority: input.priority,
        isActive: input.isActive,
        createdAt: now,
        updatedAt: now
      };
      rules.set(rule.id, rule);
      return rule;
    },
    async updateManualRule(id, input) {
      const existing = rules.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...input, updatedAt: new Date() };
      rules.set(id, updated);
      return updated;
    },
    async createQuote(quote) {
      quotes.set(quote.id, quote);
      return quote;
    },
    async findQuoteById(id) {
      return quotes.get(id) ?? null;
    },
    async listQuotesForCart(cartId) {
      return Array.from(quotes.values()).filter((quote) => quote.cartId === cartId);
    },
    async selectQuoteOption(quoteId, optionId) {
      const quote = quotes.get(quoteId);
      if (!quote) return null;
      const updated = { ...quote, selectedOptionId: optionId, updatedAt: new Date() };
      quotes.set(quoteId, updated);
      return updated;
    }
  };
}

function createDrizzleShippingRepository(): ShippingRepository {
  if (!db) {
    return createFallbackShippingRepository();
  }

  const database = db;

  return {
    async listManualRules() {
      const rows = await database
        .select()
        .from(shippingRules)
        .where(and(eq(shippingRules.provider, "manual"), eq(shippingRules.isActive, true)))
        .orderBy(desc(shippingRules.priority), asc(shippingRules.priceCents), asc(shippingRules.name));

      return rows.map(mapShippingRuleRow);
    },
    async findManualRuleById(id) {
      const [row] = await database.select().from(shippingRules).where(eq(shippingRules.id, id)).limit(1);
      return row ? mapShippingRuleRow(row) : null;
    },
    async createManualRule(input) {
      const [created] = await database
        .insert(shippingRules)
        .values({
          name: input.name,
          provider: "manual",
          ruleType: input.uf ? "uf" : "postal_range",
          uf: input.uf,
          postalCodeStart: input.postalCodeStart,
          postalCodeEnd: input.postalCodeEnd,
          price: (input.priceCents / 100).toFixed(2),
          priceCents: input.priceCents,
          estimatedDays: input.estimatedDays,
          priority: input.priority,
          isActive: input.isActive
        })
        .returning();
      return mapShippingRuleRow(created);
    },
    async updateManualRule(id, input) {
      const [updated] = await database
        .update(shippingRules)
        .set({
          name: input.name,
          ruleType: input.uf ? "uf" : "postal_range",
          uf: input.uf,
          postalCodeStart: input.postalCodeStart,
          postalCodeEnd: input.postalCodeEnd,
          price: (input.priceCents / 100).toFixed(2),
          priceCents: input.priceCents,
          estimatedDays: input.estimatedDays,
          priority: input.priority,
          isActive: input.isActive,
          updatedAt: new Date()
        })
        .where(eq(shippingRules.id, id))
        .returning();
      return updated ? mapShippingRuleRow(updated) : null;
    },
    async createQuote(quote) {
      const [created] = await database.insert(shippingQuotes).values({
        id: quote.id,
        cartId: quote.cartId,
        postalCode: quote.postalCode,
        cartHash: quote.cartHash,
        provider: quote.provider,
        source: quote.source,
        options: quote.options,
        selectedOptionId: quote.selectedOptionId,
        expiresAt: quote.expiresAt
      }).returning();
      return mapShippingQuoteRow(created);
    },
    async findQuoteById(id) {
      const [row] = await database.select().from(shippingQuotes).where(eq(shippingQuotes.id, id)).limit(1);
      return row ? mapShippingQuoteRow(row) : null;
    },
    async listQuotesForCart(cartId) {
      const rows = await database.select().from(shippingQuotes).where(eq(shippingQuotes.cartId, cartId));
      return rows.map(mapShippingQuoteRow);
    },
    async selectQuoteOption(quoteId, optionId) {
      const [updated] = await database
        .update(shippingQuotes)
        .set({ selectedOptionId: optionId, updatedAt: new Date() })
        .where(eq(shippingQuotes.id, quoteId))
        .returning();
      return updated ? mapShippingQuoteRow(updated) : null;
    }
  };
}

function mapShippingRuleRow(row: ShippingRuleRow): ShippingManualRule {
  return {
    id: row.id,
    name: row.name,
    provider: "manual",
    ruleType: row.ruleType === "postal_range" ? "postal_range" : "uf",
    uf: row.uf ?? null,
    postalCodeStart: row.postalCodeStart ?? null,
    postalCodeEnd: row.postalCodeEnd ?? null,
    priceCents: row.priceCents,
    estimatedDays: row.estimatedDays ?? null,
    priority: row.priority ?? 0,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function mapShippingQuoteRow(row: ShippingQuoteRow): ShippingQuote {
  return {
    id: row.id,
    cartId: row.cartId ?? null,
    postalCode: row.postalCode,
    cartHash: row.cartHash,
    provider: row.provider,
    source: row.source === "fixture" || row.source === "dev_fallback" ? row.source : "manual",
    options: parseShippingOptions(row.options),
    selectedOptionId: row.selectedOptionId ?? null,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function parseShippingOptions(value: unknown): ShippingQuote["options"] {
  return Array.isArray(value) ? (value as ShippingQuote["options"]) : [];
}
