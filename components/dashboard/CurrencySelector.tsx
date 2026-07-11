"use client";

import { useRouter } from "next/navigation";
import { CURRENCIES, CURRENCY_COOKIE } from "@/lib/currencies";

export function CurrencySelector({ currency }: { currency: string }) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    document.cookie = `${CURRENCY_COOKIE}=${value}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <select
      value={currency}
      onChange={handleChange}
      aria-label="Currency"
      className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
    >
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} — {c.name}
        </option>
      ))}
    </select>
  );
}
