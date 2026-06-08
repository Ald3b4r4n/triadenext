import type { ProductAdminVisualStatus, ProductStatus } from "../types";

type ProductStatusSelectProps = {
  defaultValue?: ProductStatus;
};

const options: Array<{ value: ProductStatus; visual: ProductAdminVisualStatus; label: string }> = [
  { value: "draft", visual: "draft", label: "Rascunho" },
  { value: "published", visual: "published", label: "Publicado" },
  { value: "inactive", visual: "inactive", label: "Inativo / arquivado" },
  { value: "inactive", visual: "archived", label: "Arquivado visualmente" }
];

export function ProductStatusSelect({ defaultValue = "draft" }: ProductStatusSelectProps) {
  return (
    <label className="form-field">
      <span>Status</span>
      <select name="status" defaultValue={defaultValue}>
        {options.map((option) => (
          <option key={`${option.visual}-${option.label}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
