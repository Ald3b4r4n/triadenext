import "server-only";

export type PostalCodeAddress = {
  postalCode: string;
  state: string;
  city: string;
  district: string;
  street: string;
};

type ViaCepResponse = {
  cep?: unknown;
  uf?: unknown;
  localidade?: unknown;
  bairro?: unknown;
  logradouro?: unknown;
  erro?: unknown;
};

export async function lookupPostalCode(
  input: string,
  options: { fetcher?: typeof fetch; timeoutMs?: number } = {}
): Promise<PostalCodeAddress | null> {
  const postalCode = input.replace(/\D/g, "");
  if (!/^\d{8}$/.test(postalCode)) return null;

  const fetcher = options.fetcher ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 5000);

  try {
    const response = await fetcher(`https://viacep.com.br/ws/${postalCode}/json/`, {
      headers: { accept: "application/json" },
      signal: controller.signal,
      next: { revalidate: 60 * 60 * 24 }
    });
    if (!response.ok) return null;

    const data = (await response.json()) as ViaCepResponse;
    if (data.erro === true) return null;

    const state = readText(data.uf).toUpperCase();
    const city = readText(data.localidade);
    if (!state || !city) return null;

    return {
      postalCode,
      state,
      city,
      district: readText(data.bairro),
      street: readText(data.logradouro)
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
