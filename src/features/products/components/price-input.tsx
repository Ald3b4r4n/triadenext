type PriceInputProps = {
  name: string;
  label: string;
  defaultValueCents?: number | null;
  required?: boolean;
};

export function PriceInput({ name, label, defaultValueCents, required = false }: PriceInputProps) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        name={name}
        inputMode="decimal"
        defaultValue={defaultValueCents ? (defaultValueCents / 100).toFixed(2) : ""}
        placeholder="0,00"
        required={required}
      />
    </label>
  );
}
