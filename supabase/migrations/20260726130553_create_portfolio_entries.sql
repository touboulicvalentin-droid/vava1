/*
# Create portfolio_entries table (single-tenant, no auth)

1. New Tables
- `portfolio_entries`: stores the user's investment holdings across all asset
  classes (stocks, crypto, crowdfunding, real estate, other).
  - id (uuid, primary key)
  - nom (text, asset name or ticker, e.g. "AAPL" or a crowdfunding project label)
  - type (text, asset class: Action / Crypto / Crowdfunding / Immobilier / Autre)
  - projet (text, crowdfunding project label, defaults to '')
  - date (date, nullable, investment / purchase date)
  - montant (numeric, invested amount in original currency, default 0)
  - gains (numeric, realized or earned gains, default 0)
  - valeur (numeric, current or sale value, default 0)
  - statut (text, lifecycle status: En cours / Remboursé / En portefeuille / Vendu)
  - quantite (numeric, nullable, number of shares / coins for tradable lots)
  - prix_achat (numeric, nullable, average buy price for tradable lots)
  - prix_vente (numeric, nullable, per-unit sale price for sold lots)
  - created_at (timestamptz, default now())

2. Security
- Enable RLS on portfolio_entries.
- This is a single-tenant app with no sign-in screen. Per the design decision the
  data is intentionally shared/public for the single user, so all CRUD policies
  are scoped TO anon, authenticated with USING (true) / WITH CHECK (true). This
  lets the anon-key frontend read and write its own portfolio without a session.

3. Notes
- Stocks and crypto amounts are stored in USD (the original currency of the
  purchase price); the frontend converts to EUR for display using a live rate.
- Crowdfunding / Immobilier / Autre amounts are stored directly in EUR.
*/

CREATE TABLE IF NOT EXISTS portfolio_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  type text NOT NULL DEFAULT 'Autre',
  projet text NOT NULL DEFAULT '',
  date date,
  montant numeric NOT NULL DEFAULT 0,
  gains numeric NOT NULL DEFAULT 0,
  valeur numeric NOT NULL DEFAULT 0,
  statut text NOT NULL DEFAULT 'En cours',
  quantite numeric,
  prix_achat numeric,
  prix_vente numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_entries" ON portfolio_entries;
CREATE POLICY "anon_select_entries" ON portfolio_entries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_entries" ON portfolio_entries;
CREATE POLICY "anon_insert_entries" ON portfolio_entries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_entries" ON portfolio_entries;
CREATE POLICY "anon_update_entries" ON portfolio_entries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_entries" ON portfolio_entries;
CREATE POLICY "anon_delete_entries" ON portfolio_entries FOR DELETE
  TO anon, authenticated USING (true);
