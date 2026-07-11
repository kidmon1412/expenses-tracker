import { cookies } from "next/headers";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY, isValidCurrency } from "@/lib/currencies";

export async function getPreferredCurrency(): Promise<string> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CURRENCY_COOKIE)?.value;
  return value && isValidCurrency(value) ? value : DEFAULT_CURRENCY;
}
