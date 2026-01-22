// lib/wallet.ts
import { supabase } from "./supabase";

export type WalletRow = {
  user_id: string;
  balance: number | null;
  updated_at?: string | null;
  created_at?: string | null;
};

export async function getOrCreateWallet(userId: string): Promise<WalletRow> {
  // 1) Try fetch
  const { data: existing, error: fetchErr } = await supabase
    .from("wallets")
    .select("user_id,balance,created_at,updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchErr) throw fetchErr;

  if (existing) {
    return {
      user_id: existing.user_id,
      balance: Number(existing.balance ?? 0),
      created_at: existing.created_at ?? null,
      updated_at: existing.updated_at ?? null,
    };
  }

  // 2) Create
  const { data: created, error: createErr } = await supabase
    .from("wallets")
    .insert([{ user_id: userId, balance: 0 }])
    .select("user_id,balance,created_at,updated_at")
    .single();

  if (createErr) throw createErr;

  return {
    user_id: created.user_id,
    balance: Number(created.balance ?? 0),
    created_at: created.created_at ?? null,
    updated_at: created.updated_at ?? null,
  };
}

export async function getWalletBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return Number(data?.balance ?? 0);
}

export async function setWalletBalance(userId: string, newBalance: number) {
  const { error } = await supabase
    .from("wallets")
    .update({ balance: newBalance })
    .eq("user_id", userId);

  if (error) throw error;
}
