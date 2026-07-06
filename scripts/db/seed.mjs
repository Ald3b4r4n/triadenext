import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
const seedDate = "2026-06-08T12:00:00.000Z";

const categories = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Dev Florais",
    slug: "dev-florais",
    description: "Categoria ficticia de desenvolvimento.",
    isActive: true,
    sortOrder: 10
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Dev Arquivada",
    slug: "dev-arquivada",
    description: "Categoria ficticia inativa de desenvolvimento.",
    isActive: false,
    sortOrder: 20
  }
];

const products = [
  [
    "33333333-3333-4333-8333-333333333333",
    categories[0].id,
    "Dev Produto Publicado",
    "dev-produto-publicado",
    "DEV-SEED-PUB-001",
    "published",
    15990,
    "159.90",
    8,
    seedDate
  ],
  [
    "44444444-4444-4444-8444-444444444444",
    categories[0].id,
    "Dev Produto Rascunho",
    "dev-produto-rascunho",
    "DEV-SEED-DRAFT-001",
    "draft",
    9900,
    "99.00",
    4,
    null
  ],
  [
    "55555555-5555-4555-8555-555555555555",
    categories[0].id,
    "Dev Produto Futuro",
    "dev-produto-futuro",
    "DEV-SEED-FUTURE-001",
    "published",
    12000,
    "120.00",
    3,
    "2099-01-10T12:00:00.000Z"
  ],
  [
    "66666666-6666-4666-8666-666666666666",
    categories[0].id,
    "Dev Produto Sem Estoque",
    "dev-produto-sem-estoque",
    "DEV-SEED-OOS-001",
    "published",
    11000,
    "110.00",
    0,
    seedDate
  ],
  [
    "77777777-7777-4777-8777-777777777777",
    categories[1].id,
    "Dev Produto Inativo",
    "dev-produto-inativo",
    "DEV-SEED-INACTIVE-001",
    "inactive",
    8000,
    "80.00",
    5,
    seedDate
  ]
];

if (!databaseUrl) {
  console.error(
    "DATABASE_URL ausente. Seed bloqueado sem conectar banco real."
  );
  process.exit(1);
}

const sql = neon(databaseUrl);

await sql`begin`;

try {
  for (const category of categories) {
    await sql`
      insert into categories (id, name, slug, description, is_active, sort_order, updated_at)
      values (${category.id}, ${category.name}, ${category.slug}, ${category.description}, ${category.isActive}, ${category.sortOrder}, ${seedDate})
      on conflict (slug) do update set
        name = excluded.name,
        description = excluded.description,
        is_active = excluded.is_active,
        sort_order = excluded.sort_order,
        updated_at = excluded.updated_at
    `;
  }

  for (const product of products) {
    const [
      id,
      categoryId,
      name,
      slug,
      sku,
      status,
      priceCents,
      price,
      stockQuantity,
      publishedAt
    ] = product;

    await sql`
      insert into products (
        id, category_id, name, slug, sku, short_description, description, brand, gender,
        concentration, volume_ml, price, price_cents, status, stock_quantity,
        low_stock_threshold, is_featured, published_at, seo_title, seo_description, updated_at
      )
      values (
        ${id}, ${categoryId}, ${name}, ${slug}, ${sku},
        'Produto ficticio de desenvolvimento.', 'Produto placeholder usado somente para validar persistencia local.',
        'Dev Brand', 'unissex', 'Dev EDP', 100, ${price}, ${priceCents}, ${status}, ${stockQuantity},
        1, ${slug === "dev-produto-publicado"}, ${publishedAt}, ${name}, 'Seed fictício de desenvolvimento.', ${seedDate}
      )
      on conflict (slug) do update set
        name = excluded.name,
        sku = excluded.sku,
        status = excluded.status,
        price = excluded.price,
        price_cents = excluded.price_cents,
        stock_quantity = excluded.stock_quantity,
        published_at = excluded.published_at,
        updated_at = excluded.updated_at
    `;

    await sql`delete from product_categories where product_id = ${id}`;
    await sql`insert into product_categories (product_id, category_id) values (${id}, ${categoryId})`;
  }

  await sql`delete from product_images where product_id = ${products[0][0]}`;
  await sql`
    insert into product_images (
      product_id, blob_url, pathname, alt_text, sort_order, is_cover, width, height, size_bytes, content_type
    )
    values (
      ${products[0][0]},
      'https://placehold.co/900x1100/png?text=Dev+Produto',
      'dev-seed/products/dev-produto-publicado/cover.png',
      'Imagem placeholder ficticia de desenvolvimento',
      10,
      true,
      900,
      1100,
      120000,
      'image/png'
    )
  `;

  await sql`commit`;
  console.log("Seed de desenvolvimento concluido com dados ficticios.");
} catch (error) {
  await sql`rollback`;
  throw error;
}
