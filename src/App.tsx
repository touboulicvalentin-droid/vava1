import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Coins,
  Landmark,
  LineChart as LineChartIcon,
  ListChecks,
  Moon,
  PiggyBank,
  PieChart as PieChartIcon,
  Plus,
  RefreshCw,
  Sparkles,
  Sun,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type {
  AssetType,
  CryptoDatum,
  Entry,
  NewEntry,
  StockDatum,
} from "@/types";
import { COLORS, CRYPTOS, STOCKS, TYPES } from "@/lib/constants";
import { fmt, fmtPct } from "@/lib/finance";
import { getTheme, type ThemeName } from "@/lib/theme";
import {
  fetchCryptoData,
  fetchRate,
  fetchSp500,
  fetchStockData,
} from "@/lib/marketApi";
import { useEntries } from "@/hooks/useEntries";
import {
  useAllocation,
  useComparatif,
  useCrowdfunding,
  useEntriesEUR,
  useMonthly,
  usePatrimoine,
  usePatrimoineRealtime,
  useRevenuMensuelMoyen,
  useTotalRealtime,
  useTotals,
} from "@/hooks/computations";
import { GlossyStyles } from "@/components/GlossyStyles";
import { DetailModal } from "@/components/DetailModal";
import { OverviewTab } from "@/components/OverviewTab";
import { AssetTable } from "@/components/AssetTable";
import { CrowdfundingTab } from "@/components/CrowdfundingTab";
import { MonthlyTab } from "@/components/MonthlyTab";
import { DetailTab } from "@/components/DetailTab";

interface AssetFormState {
  nom: string;
  quantite: string;
  prixAchat: string;
  date: string;
}

interface CrowdfundingFormState {
  projet: string;
  date: string;
  montant: string;
  gains: string;
  statut: string;
}

interface DetailFormState {
  nom: string;
  type: AssetType;
  projet: string;
  date: string;
  montant: string;
  gains: string;
  valeur: string;
  statut: string;
}

type TabId = "overview" | "crowdfunding" | "actions" | "crypto" | "monthly" | "detail";

const EMPTY_ASSET_FORM: AssetFormState = { nom: "", quantite: "", prixAchat: "", date: "" };
const EMPTY_CROWDFORM: CrowdfundingFormState = {
  projet: "La première brique",
  date: "",
  montant: "",
  gains: "",
  statut: "En cours",
};
const EMPTY_DETAIL_FORM: DetailFormState = {
  nom: "",
  type: "Crowdfunding",
  projet: "La première brique",
  date: "",
  montant: "",
  gains: "",
  valeur: "",
  statut: "En cours",
};

const tabDefs: { id: TabId; label: string; icon: typeof PieChartIcon }[] = [
  { id: "overview", label: "Vue d'ensemble", icon: PieChartIcon },
  { id: "crowdfunding", label: "Crowdfunding", icon: Landmark },
  { id: "actions", label: "Actions", icon: LineChartIcon },
  { id: "crypto", label: "Crypto", icon: Coins },
  { id: "monthly", label: "Mensuel", icon: CalendarDays },
  { id: "detail", label: "Détail", icon: ListChecks },
];

export default function App() {
  const [theme, setTheme] = useState<ThemeName>("dark");
  const T = getTheme(theme);
  const { entries, loaded, add, update, remove } = useEntries();

  const [tab, setTab] = useState<TabId>("overview");
  const [detailAsset, setDetailAsset] = useState<Entry | null>(null);

  const [actionForm, setActionForm] = useState<AssetFormState>(EMPTY_ASSET_FORM);
  const [cryptoForm, setCryptoForm] = useState<AssetFormState>(EMPTY_ASSET_FORM);
  const [crowdForm, setCrowdForm] = useState<CrowdfundingFormState>(EMPTY_CROWDFORM);
  const [detailForm, setDetailForm] = useState<DetailFormState>(EMPTY_DETAIL_FORM);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [patrimoineTypes, setPatrimoineTypes] = useState<AssetType[]>([...TYPES]);
  const [chartTypes, setChartTypes] = useState<AssetType[]>([...TYPES]);

  function toggleType(
    list: AssetType[],
    setList: (v: AssetType[]) => void,
    t: AssetType,
  ): void {
    setList(list.includes(t) ? list.filter((x) => x !== t) : [...list, t]);
  }

  const [usdRate, setUsdRate] = useState(0.92);
  const [rateUpdated, setRateUpdated] = useState<Date | null>(null);
  const [rateLoading, setRateLoading] = useState(false);

  const [stockData, setStockData] = useState<Record<string, StockDatum>>({});
  const [stocksUpdated, setStocksUpdated] = useState<Date | null>(null);
  const [stocksLoading, setStocksLoading] = useState(false);

  const [cryptoData, setCryptoData] = useState<Record<string, CryptoDatum>>({});
  const [cryptoUpdated, setCryptoUpdated] = useState<Date | null>(null);
  const [cryptoLoading, setCryptoLoading] = useState(false);

  const [sp500, setSp500] = useState<{ mois: string; valeur: number }[]>([]);
  const [sp500Loading, setSp500Loading] = useState(false);

  const [marketError, setMarketError] = useState<string | null>(null);

  async function refreshRate(): Promise<void> {
    setRateLoading(true);
    setMarketError(null);
    try {
      const r = await fetchRate();
      setUsdRate(r);
      setRateUpdated(new Date());
    } catch (e) {
      setMarketError(e instanceof Error ? e.message : "taux indisponible");
    }
    setRateLoading(false);
  }

  async function refreshStocks(): Promise<void> {
    const tickers = [
      ...new Set(entries.filter((e) => e.type === "Action" && e.statut !== "Vendu").map((e) => e.nom)),
    ];
    if (!tickers.length) return;
    setStocksLoading(true);
    setMarketError(null);
    try {
      const d = await fetchStockData(tickers);
      setStockData(d);
      setStocksUpdated(new Date());
      const found = Object.keys(d).length;
      if (found === 0) setMarketError("Aucun cours récupéré — réessaie dans un instant.");
      else if (found < tickers.length)
        setMarketError(`${found}/${tickers.length} cours récupérés. Réessaie pour les autres.`);
    } catch (e) {
      setMarketError(e instanceof Error ? e.message : "données actions indisponibles");
    }
    setStocksLoading(false);
  }

  async function refreshCryptos(): Promise<void> {
    const tickers = [
      ...new Set(entries.filter((e) => e.type === "Crypto" && e.statut !== "Vendu").map((e) => e.nom)),
    ];
    if (!tickers.length) return;
    setCryptoLoading(true);
    setMarketError(null);
    try {
      const d = await fetchCryptoData(tickers);
      setCryptoData(d);
      setCryptoUpdated(new Date());
      const found = Object.keys(d).length;
      if (found === 0) setMarketError("Aucun cours récupéré — réessaie dans un instant.");
    } catch (e) {
      setMarketError(e instanceof Error ? e.message : "données crypto indisponibles");
    }
    setCryptoLoading(false);
  }

  async function refreshSp500(): Promise<void> {
    setSp500Loading(true);
    setMarketError(null);
    try {
      const d = await fetchSp500();
      setSp500(d);
    } catch (e) {
      setMarketError(e instanceof Error ? e.message : "S&P 500 indisponible");
    }
    setSp500Loading(false);
  }

  useEffect(() => {
    void refreshRate();
    void refreshSp500();
  }, []);

  useEffect(() => {
    if (loaded) {
      void refreshStocks();
      void refreshCryptos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, entries.length]);

  const market = useMemo(
    () => ({ stock: stockData, crypto: cryptoData }),
    [stockData, cryptoData],
  );

  const entriesEUR = useEntriesEUR(entries, usdRate);
  const totals = useTotals(entriesEUR);
  const allocation = useAllocation(entriesEUR);
  const monthly = useMonthly(entriesEUR);
  const revenuMensuelMoyen = useRevenuMensuelMoyen(monthly);
  const patrimoine = usePatrimoine(monthly);
  const comparatif = useComparatif(patrimoine, sp500);
  const crowdfunding = useCrowdfunding(entries);
  const realtime = useTotalRealtime(entries, usdRate, market, patrimoineTypes);
  const patrimoineRealtime = usePatrimoineRealtime(entries, usdRate, market, chartTypes);

  async function addCrowdEntry(): Promise<void> {
    const montant = parseFloat(crowdForm.montant);
    const nom = crowdForm.projet.trim();
    if (!nom || isNaN(montant)) return;
    await add({
      nom,
      type: "Crowdfunding",
      projet: crowdForm.projet.trim(),
      date: crowdForm.date || null,
      montant,
      gains: parseFloat(crowdForm.gains) || 0,
      valeur: 0,
      statut: crowdForm.statut as NewEntry["statut"],
    });
    setCrowdForm({ ...EMPTY_CROWDFORM, projet: crowdForm.projet });
  }

  async function addDetailEntry(): Promise<void> {
    const montant = parseFloat(detailForm.montant);
    const nom = detailForm.nom.trim();
    if (!nom || isNaN(montant)) return;
    await add({
      nom,
      type: detailForm.type,
      projet: detailForm.projet.trim(),
      date: detailForm.date || null,
      montant,
      gains: parseFloat(detailForm.gains) || 0,
      valeur: parseFloat(detailForm.valeur) || 0,
      statut: detailForm.statut as NewEntry["statut"],
    });
    setDetailForm({
      ...EMPTY_DETAIL_FORM,
      type: detailForm.type,
      projet: detailForm.projet,
    });
  }

  async function buyLot(
    kind: AssetType,
    f: AssetFormState,
    setF: (f: AssetFormState) => void,
  ): Promise<void> {
    const isAction = kind === "Action";
    const quantite = isAction ? parseInt(f.quantite, 10) : parseFloat(f.quantite);
    const prixAchat = parseFloat(f.prixAchat);
    const nom = f.nom.trim();
    if (!nom || !quantite || isNaN(prixAchat)) return;
    const existing = entries.find(
      (e) =>
        e.type === kind && e.statut !== "Vendu" && e.nom.toLowerCase() === nom.toLowerCase(),
    );
    if (existing && existing.quantite != null && existing.prix_achat != null) {
      const q = existing.quantite + quantite;
      const m = existing.montant + quantite * prixAchat;
      await update(existing.id, {
        quantite: q,
        montant: m,
        prix_achat: m / q,
        date: f.date || existing.date || null,
      });
    } else {
      await add({
        nom,
        type: kind,
        projet: "",
        date: f.date || null,
        quantite,
        prix_achat: prixAchat,
        montant: quantite * prixAchat,
        gains: 0,
        valeur: 0,
        statut: "En portefeuille",
      });
    }
    setF(EMPTY_ASSET_FORM);
  }

  async function sellLot(id: string, prixVente: number): Promise<void> {
    const e = entries.find((x) => x.id === id);
    if (!e) return;
    const q = e.quantite ?? 1;
    await update(id, {
      statut: "Vendu",
      valeur: q * prixVente,
      prix_vente: prixVente,
    });
  }

  const card = `glossy-hover rounded-[24px] ${T.glass} p-4`;

  const heroPctText = useMemo(
    () => (realtime.rendement >= 0 ? T.pos : T.neg),
    [realtime.rendement, T.pos, T.neg],
  );

  if (!loaded) {
    return (
      <div className={`${T.pageBg} min-h-screen p-6 text-sm ${T.textMuted}`}>Chargement...</div>
    );
  }

  return (
    <div
      className={`${T.pageBg} min-h-screen font-sans ${T.text}`}
      style={{
        backgroundImage: `${T.pageMesh}, ${T.wallpaper}`,
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center",
        backgroundAttachment: "fixed, fixed",
      }}
    >
      <GlossyStyles />
      <div className="max-w-5xl mx-auto p-5 space-y-4">
        {/* macOS window bar */}
        <div className={`${card} glossy-enter flex items-center justify-between`}>
          <div className="flex gap-2">
            <span className="glossy-dot w-3 h-3 rounded-full bg-red-500 text-red-500" />
            <span className="glossy-dot w-3 h-3 rounded-full bg-yellow-500 text-yellow-500" />
            <span className="glossy-dot w-3 h-3 rounded-full bg-green-500 text-green-500" />
          </div>
          <div className={`text-xs font-medium ${T.textMuted}`}>Portfolio.app</div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`glossy-btn w-8 h-8 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-gradient-to-b from-white/20 to-white/5" : "bg-gradient-to-b from-white to-black/5"}`}
            style={{ transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}
            aria-label="Toggle theme"
          >
            <span
              style={{
                display: "inline-flex",
                transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                transform: theme === "dark" ? "rotate(0deg)" : "rotate(180deg)",
              }}
            >
              {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
            </span>
          </button>
        </div>

        {/* Hero : patrimoine en temps réel */}
        <div className={`${T.glassStrong} glossy-hover glossy-enter rounded-[28px] p-5`} style={{ animationDelay: "0.05s" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className={`flex items-center gap-2 text-xs mb-1 ${T.textMuted}`}>
                <span className="glossy-live-dot inline-block w-2 h-2 rounded-full bg-emerald-400" />
                Patrimoine en temps réel
              </div>
              <div className="text-4xl font-semibold tracking-tight tabular-nums">
                {fmt(realtime.valeur)}
              </div>
              <div className={`text-sm mt-1 flex items-center gap-1 ${heroPctText}`}>
                {realtime.rendement >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{" "}
                {fmtPct(realtime.rendement)} · {realtime.gains >= 0 ? "+" : ""}
                {fmt(realtime.gains)} latent
              </div>
            </div>
            <div className={`text-right text-xs space-y-1 ${T.textFaint}`}>
              <div className="flex items-center gap-2 justify-end">
                <span>
                  1 $ = {usdRate.toLocaleString("fr-FR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} €
                </span>
                <button onClick={() => void refreshRate()} disabled={rateLoading} className="glossy-ghost rounded-full p-0.5">
                  <RefreshCw size={12} className={rateLoading ? "animate-spin" : ""} />
                </button>
              </div>
              {rateUpdated && (
                <div>
                  maj {rateUpdated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </div>
              )}
            </div>
          </div>
          {/* Sélection des types inclus dans le patrimoine temps réel */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className={`text-xs mr-1 ${T.textFaint}`}>Inclure :</span>
            {TYPES.map((t) => {
              const active = patrimoineTypes.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleType(patrimoineTypes, setPatrimoineTypes, t)}
                  className={`glossy-chip flex items-center gap-1.5 rounded-full pl-2 pr-3 py-1 text-xs border ${
                    active ? T.chipOn : T.chipOff
                  }`}
                  aria-pressed={active}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full transition-opacity"
                    style={{ background: COLORS[t], opacity: active ? 1 : 0.3 }}
                  />
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-3">
          <div className={card} style={{ animation: "glossyFadeUp 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.08s both" }}>
            <div className={`flex items-center gap-1.5 text-xs mb-1 ${T.textFaint}`}>
              <Wallet size={13} /> Total investi
            </div>
            <div className="text-lg font-semibold">{fmt(totals.totalInvesti)}</div>
          </div>
          <div className={card} style={{ animation: "glossyFadeUp 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.14s both" }}>
            <div className={`flex items-center gap-1.5 text-xs mb-1 ${T.textFaint}`}>
              <Landmark size={13} /> Capital bloqué
            </div>
            <div className="text-lg font-semibold">{fmt(totals.capitalBloque)}</div>
          </div>
          <div className={card} style={{ animation: "glossyFadeUp 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.20s both" }}>
            <div className={`flex items-center gap-1.5 text-xs mb-1 ${T.textFaint}`}>
              <PiggyBank size={13} /> Gains totaux
            </div>
            <div className={`text-lg font-semibold ${totals.totalGains >= 0 ? T.pos : T.neg}`}>
              {fmt(totals.totalGains)}
            </div>
          </div>
          <div className={card} style={{ animation: "glossyFadeUp 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.26s both" }}>
            <div className={`flex items-center gap-1.5 text-xs mb-1 ${T.textFaint}`}>
              <Sparkles size={13} /> Revenu mensuel moyen
            </div>
            <div className={`text-lg font-semibold ${revenuMensuelMoyen >= 0 ? T.pos : T.neg}`}>
              {fmt(revenuMensuelMoyen)}
            </div>
          </div>
        </div>

        {/* Market data error banner */}
        {marketError && (
          <div
            className={`glossy-enter flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 border ${theme === "dark" ? "bg-amber-500/10 border-amber-500/25" : "bg-amber-50 border-amber-200"}`}
          >
            <span className={`text-xs ${theme === "dark" ? "text-amber-300" : "text-amber-700"}`}>
              Données de marché : {marketError}
            </span>
            <button
              onClick={() => setMarketError(null)}
              className={`glossy-ghost text-xs ${theme === "dark" ? "text-amber-400/70 hover:text-amber-300" : "text-amber-600/70 hover:text-amber-700"}`}
              aria-label="Fermer"
            >
              ok
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className={`glossy-enter flex gap-1 rounded-2xl p-1 w-fit flex-wrap ${T.glass}`} style={{ animationDelay: "0.1s" }}>
          {tabDefs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`glossy-tab flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl ${tab === id ? T.pillActive : T.pillInactive}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <div key={tab} className="glossy-enter">
          {tab === "overview" && (
            <OverviewTab
              T={T}
              patrimoine={patrimoineRealtime}
              chartTypes={chartTypes}
              onToggleChartType={(t) => toggleType(chartTypes, setChartTypes, t)}
              allocation={allocation}
              monthly={monthly}
              comparatif={comparatif}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              sp500Loading={sp500Loading}
              onRefreshSp500={() => void refreshSp500()}
            />
          )}
          {tab === "actions" && (
            <AssetTable
              kind="Action"
              T={T}
              themeName={theme}
              entries={entries}
              form={actionForm}
              setForm={setActionForm}
              data={stockData}
              dataLoading={stocksLoading}
              dataUpdated={stocksUpdated}
              refresh={() => void refreshStocks()}
              suggestions={STOCKS}
              unit="$"
              usdRate={usdRate}
              onBuy={buyLot}
              onSell={sellLot}
              onShowDetail={setDetailAsset}
            />
          )}
          {tab === "crypto" && (
            <AssetTable
              kind="Crypto"
              T={T}
              themeName={theme}
              entries={entries}
              form={cryptoForm}
              setForm={setCryptoForm}
              data={cryptoData}
              dataLoading={cryptoLoading}
              dataUpdated={cryptoUpdated}
              refresh={() => void refreshCryptos()}
              suggestions={CRYPTOS}
              unit="$"
              usdRate={usdRate}
              onBuy={buyLot}
              onSell={sellLot}
              onShowDetail={setDetailAsset}
            />
          )}
          {tab === "monthly" && <MonthlyTab T={T} monthly={monthly} />}
          {tab === "crowdfunding" && (
            <CrowdfundingTab
              T={T}
              form={crowdForm}
              setForm={setCrowdForm}
              crowdfunding={crowdfunding}
              onAdd={() => void addCrowdEntry()}
            />
          )}
          {tab === "detail" && (
            <DetailTab
              T={T}
              form={detailForm}
              setForm={setDetailForm}
              entries={entries}
              onAdd={() => void addDetailEntry()}
              onRemove={(id) => void remove(id)}
            />
          )}
        </div>
      </div>

      <DetailModal
        asset={detailAsset}
        onClose={() => setDetailAsset(null)}
        data={
          detailAsset
            ? detailAsset.type === "Action"
              ? stockData[detailAsset.nom]
              : cryptoData[detailAsset.nom]
            : undefined
        }
        T={T}
      />
    </div>
  );
}
