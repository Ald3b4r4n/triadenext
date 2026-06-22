import type { ShippingManualRule } from "../types";

const fixtureDate = new Date("2026-01-10T12:00:00.000Z");

export const devShippingRules: ShippingManualRule[] = [
  {
    id: "shipping-dev-1",
    name: "Sudeste econômico",
    provider: "manual",
    ruleType: "uf",
    uf: "SP",
    postalCodeStart: null,
    postalCodeEnd: null,
    priceCents: 1290,
    estimatedDays: 5,
    priority: 20,
    isActive: true,
    createdAt: fixtureDate,
    updatedAt: fixtureDate
  },
  {
    id: "shipping-dev-2",
    name: "Capital paulista expresso",
    provider: "manual",
    ruleType: "postal_range",
    uf: null,
    postalCodeStart: "01000000",
    postalCodeEnd: "05999999",
    priceCents: 1590,
    estimatedDays: 3,
    priority: 40,
    isActive: true,
    createdAt: fixtureDate,
    updatedAt: fixtureDate
  },
  {
    id: "shipping-dev-disabled",
    name: "Regra inativa",
    provider: "manual",
    ruleType: "uf",
    uf: "RJ",
    postalCodeStart: null,
    postalCodeEnd: null,
    priceCents: 1990,
    estimatedDays: 4,
    priority: 10,
    isActive: false,
    createdAt: fixtureDate,
    updatedAt: fixtureDate
  }
];
