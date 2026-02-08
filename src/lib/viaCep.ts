export interface ViaCepResult {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function lookupViaCep(cep8: string): Promise<ViaCepResult | null> {
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep8}/json/`, { cache: "no-store" });
    const data = await res.json();
    if (data.erro) return null;
    return data as ViaCepResult;
  } catch {
    return null;
  }
}
