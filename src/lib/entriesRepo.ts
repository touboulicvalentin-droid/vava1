import { supabase } from "@/lib/supabase";
import type { Entry, NewEntry } from "@/types";

const TABLE = "portfolio_entries";

type EntryPatch = Partial<NewEntry>;

function toRow(e: EntryPatch): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (e.nom !== undefined) row.nom = e.nom;
  if (e.type !== undefined) row.type = e.type;
  if (e.projet !== undefined) row.projet = e.projet;
  if (e.date !== undefined) row.date = e.date;
  if (e.montant !== undefined) row.montant = e.montant;
  if (e.gains !== undefined) row.gains = e.gains;
  if (e.valeur !== undefined) row.valeur = e.valeur;
  if (e.statut !== undefined) row.statut = e.statut;
  if (e.quantite !== undefined) row.quantite = e.quantite;
  if (e.prix_achat !== undefined) row.prix_achat = e.prix_achat;
  if (e.prix_vente !== undefined) row.prix_vente = e.prix_vente;
  return row;
}

export async function loadEntries(): Promise<Entry[]> {
  const { data, error } = await supabase.from(TABLE).select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return (data as Entry[]) ?? [];
}

export async function insertEntry(e: NewEntry): Promise<Entry | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(toRow(e as EntryPatch))
    .select("*")
    .single();
  if (error) throw error;
  return data as Entry;
}

export async function updateEntry(id: string, patch: EntryPatch): Promise<Entry | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(toRow(patch))
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Entry;
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
