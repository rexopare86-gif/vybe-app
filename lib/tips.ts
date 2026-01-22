// lib/tips.ts
import { supabase } from "./supabase";
import { getOrCreateWallet, getWalletBalance, setWalletBalance } from "./wallet";

export type TipRow = {
  id?: string;
  creator_id: string;
  from_user_id: string;
  amount: number;
  created_at?: string;
};

export async function tipCreator(params: {
  creatorId: string;
  fromUserId: string;
  amount: number;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const { creatorId, fromUserId, amount } = params;

  if (!creatorId || !fromUserId) {
    return { ok: false, message: "Missing creator or user id." };
  }
  if (creatorId === fromUserId) {
    return { ok: false, message: "You cannot tip yourself." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, message: "Invalid tip amount." };
  }

  try {
    // Ensure wallets exist
    await getOrCreateWallet(fromUserId);
    await getOrCreateWallet(creatorId);

    // Load balances
    const payerBalance = await getWalletBalance(fromUserId);

    if (payerBalance < amount) {
      return { ok: false, message: "Insufficient balance." };
    }

    // 1) Insert tip record
    const { error: tipErr } = await supabase.from("tips").insert([
      {
        creator_id: creatorId,
        from_user_id: fromUserId,
        amount,
      } satisfies TipRow,
    ]);

    if (tipErr) throw tipErr;

    // 2) Update balances (simple & safe)
    const newPayer = payerBalance - amount;

    const creatorBalance = await getWalletBalance(creatorId);
    const newCreator = creatorBalance + amount;

    await setWalletBalance(fromUserId, newPayer);
    await setWalletBalance(creatorId, newCreator);

    return { ok: true };
  } catch (err: any) {
    console.error("tipCreator error:", err);
    return { ok: false, message: err?.message ?? "Tip failed." };
  }
}
