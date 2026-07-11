export const STAGING_MIGRATION_CATALOG = [
  ["0000_shallow_shinko_yamashiro.sql", "base-comercial", "alto"],
  ["0001_curvy_blink.sql", "better-auth", "medio"],
  ["0002_tiny_enchantress.sql", "carrinho", "baixo"],
  ["0003_elite_titanium_man.sql", "cupons", "baixo"],
  ["0004_mute_ghost_rider.sql", "frete", "medio"],
  ["0005_glossy_talisman.sql", "pedidos", "medio"],
  ["0006_soft_mole_man.sql", "pagamentos", "medio"],
  ["0007_outstanding_midnight.sql", "outbox", "baixo"]
] as const;

export function listStagingMigrations() {
  return STAGING_MIGRATION_CATALOG.map(([file, area, risk], order) => ({
    order: order + 1,
    file,
    area,
    risk
  }));
}
