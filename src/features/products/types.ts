export type ProductStatus = "draft" | "published" | "inactive";

export type ProductGender = "feminino" | "masculino" | "unissex" | "nao_informado";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductImage = {
  id: string;
  productId: string;
  blobUrl: string;
  pathname: string;
  altText?: string | null;
  sortOrder: number;
  isCover: boolean;
  width?: number | null;
  height?: number | null;
  sizeBytes?: number | null;
  contentType?: string | null;
  createdAt: Date;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  brand?: string | null;
  inspirationName?: string | null;
  gender?: ProductGender | null;
  concentration?: string | null;
  volumeMl?: number | null;
  sku: string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  costPriceCents?: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  status: ProductStatus;
  isFeatured: boolean;
  publishedAt?: Date | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  categories: Category[];
  images: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
};

export type PublicProduct = Product & {
  coverImage: ProductImage | null;
};
