import { useState } from "react";

const C = {
  bg:"#0D0F1A", surface:"#13162A", card:"#1C2040",
  border:"rgba(255,255,255,0.07)", accent:"#7C6FFF", accentSoft:"rgba(124,111,255,0.15)",
  green:"#34D399", greenSoft:"rgba(52,211,153,0.13)", amber:"#FBBF24",
  amberSoft:"rgba(251,191,36,0.13)", red:"#F87171", redSoft:"rgba(248,113,113,0.12)",
  t1:"#F1F0FF", t2:"rgba(241,240,255,0.52)", t3:"rgba(241,240,255,0.3)",
};
const fmt = (n: number) => n.toLocaleString("sv-SE");

function CatBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ height:4, borderRadius:999, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
      <div style={{ width:pct+"%", height:"100%", borderRadius:999, background:color }} />
    </div>
  );
}

function Row({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
      <span style={{ fontSize:13, color:C.t2 }}>{label}</span>
      <div style={{ textAlign:"right" }}>
        <div style={{ fontSize:13, fontWeight:600, color: color || C.t1 }}>{value}</div>
        {sub && <div style={{ fontSize:11, color:C.t3, marginTop:1 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function MonthlySummary({
  members, expenseData, buffer, childFund, loans, onBack,
}: {
  members: any[]; expenseData: Record<string, any>;
  buffer: any; childFund: any; loans: any[];
  onBack?: () => void;
}) {
  const months = Object.keys(expenseData);
  const [sel, setSel] = useState(months[0]);

  const data     = expenseData[sel];
  const prevKey  = months[months.indexOf(sel) + 1];
  const prevData = prevKey ? expenseData[prevKey] : null;
  const delta    = prevData ? data.total - prevData.total : null;
  const maxCat   = Math.max(...data.categories.map((c: any) => c.amount));
  const topCat   = data.categories.reduce((a: any, b: any) => a.amount > b.amount ? a : b);

  // Savings totals
  const goalsSaved  = members.reduce((s: number, m: any) => s + (m.savingsGoal?.saved || 0), 0);
  const totalSaved  = goalsSaved + (buffer?.balance || 0) + (childFund?.balance || 0);
  const totalMonthlyToSavings = members.reduce((s: number, m: any) => s + (m.savingsGoal?.monthly || 0), 0)
    + (buffer?.monthly || 0) + (childFund?.monthly || 0);

  // Loans totals
  const totalLoanRemaining = loans.reduce((s: number, l: any) => s + (l.amount - l.paid), 0);
  const totalLoanMonthly   = loans.reduce((s: number, l: any) => s + l.monthly, 0);

  // Hero
  const heroGood   = delta !== null && delta < 0;
  const heroColor  = heroGood ? C.green : delta !== null && delta > 0 ? C.red : C.accent;
  const heroBg     = heroGood ? C.greenSoft : delta !== null && delta > 0 ? C.redSoft : C.accentSoft;
  const heroBorder = heroGood ? "rgba(52,211,153,0.3)" : delta !== null && delta > 0 ? "rgba(248,113,113,0.3)" : "rgba(124,111,255,0.3)";

  // Tips — max 3, short and clean
  const tips: { icon: string; color: string; title: string; body: string }[] = [];

  if (prevData) {
    const biggest = data.categories
      .map((cat: any) => {
        const prev = prevData.categories.find((c: any) => c.name === cat.name);
        return { ...cat, diff: prev ? cat.amount - prev.amount : 0 };
      })
      .filter((c: any) => c.diff > 200)
      .sort((a: any, b: any) => b.diff - a.diff)[0];

    if (biggest) {
      tips.push({
        icon: biggest.icon, color: biggest.color,
        title: `Cut back on ${biggest.name.toLowerCase()} next month`,
        body: `Up ${fmt(biggest.diff)} kr vs ${prevKey}. Aiming for ${fmt(Math.round(biggest.amount * 0.85))} kr could save ~${fmt(Math.round(biggest.amount * 0.15))} kr.`,
      });
    }
  }

  const atRisk = members.find((m: any) => (m.spendMonth / m.spendLimit) >= 0.7);
  if (atRisk) {
    const pct = Math.round((atRisk.spendMonth / atRisk.spendLimit) * 100);
    tips.push({
      icon: "⚠️", color: C.amber,
      title: `Review ${atRisk.name.split(" ")[0]}'s limit`,
      body: `${atRisk.name.split(" ")[0]} used ${pct}% this month (${fmt(atRisk.spendMonth)} of ${fmt(atRisk.spendLimit)} kr). ${fmt(atRisk.spendLimit - atRisk.spendMonth)} kr remaining.`,
    });
  }

  const closestGoal = members
    .filter((m: any) => m.savingsGoal?.target)
    .sort((a: any, b: any) => (b.savingsGoal.saved / b.savingsGoal.target) - (a.savingsGoal.saved / a.savingsGoal.target))[0];
  if (closestGoal) {
    const g   = closestGoal.savingsGoal;
    const pct = Math.round((g.saved / g.target) * 100);
    const mo  = Math.ceil((g.target - g.saved) / g.monthly);
    tips.push({
      icon: g.emoji || "🎯", color: closestGoal.color,
      title: `${closestGoal.name.split(" ")[0]}'s "${g.name}" — ${pct}% done`,
      body: `${fmt(g.target - g.saved)} kr to go at ${fmt(g.monthly)} kr/month. On track to finish in ~${mo} month${mo !== 1 ? "s" : ""}.`,
    });
  }

  return (
    <div style={{ background:C.bg, minHeight:"100%", color:C.t1, fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {/* Month tabs */}
      <div style={{ background:C.surface, borderBottom:"1px solid "+C.border }}>
        <div style={{ display:"flex", gap:8, padding:"14px 20px", overflowX:"auto", scrollbarWidth:"none" }}>
          {months.map(m => (
            <button key={m} onClick={() => setSel(m)} style={{
              flexShrink:0, padding:"7px 16px", borderRadius:999,
              background: sel===m ? C.accent : "transparent",
              border:"1px solid "+(sel===m ? C.accent : C.border),
              color: sel===m ? "#fff" : C.t2,
              fontSize:13, fontWeight: sel===m ? 600 : 400, cursor:"pointer",
            }}>{m}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:"16px 20px 48px", display:"flex", flexDirection:"column", gap:12 }}>

        {/* ── HERO INSIGHT ───────────────────────────────── */}
        <div style={{ background:heroBg, borderRadius:18, border:"1px solid "+heroBorder, padding:"16px 18px", display:"flex", gap:12, alignItems:"center" }}>
          <div style={{ fontSize:28, flexShrink:0 }}>
            {heroGood ? "🎉" : delta !== null && delta > 0 ? "📈" : "✦"}
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:600, color:heroColor, marginBottom:3 }}>
              {heroGood ? "Great job this month!" : delta !== null && delta > 0 ? "Spending went up this month" : "Your spending overview"}
            </div>
            <div style={{ fontSize:12, color:C.t2, lineHeight:1.5 }}>
              {delta !== null && delta < 0
                ? `${fmt(Math.abs(delta))} kr less than ${prevKey}. ${topCat.name} was your top category at ${fmt(topCat.amount)} kr.`
                : delta !== null && delta > 0
                ? `Up ${fmt(delta)} kr vs ${prevKey}. ${topCat.name} drove the most at ${fmt(topCat.amount)} kr (${Math.round((topCat.amount / data.total) * 100)}%).`
                : `${topCat.name} was your biggest category at ${fmt(topCat.amount)} kr — ${Math.round((topCat.amount / data.total) * 100)}% of total.`
              }
            </div>
          </div>
        </div>

        {/* ── OVERVIEW: spending + savings + loans ───────── */}
        <div style={{ background:C.card, borderRadius:18, border:"1px solid "+C.border, padding:"18px 20px" }}>

          {/* Spending */}
          <div style={{ fontSize:11, color:C.t3, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Spending</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:12, marginBottom:12 }}>
            <div style={{ fontSize:32, fontWeight:500, lineHeight:1 }}>
              {fmt(data.total)}<span style={{ fontSize:15, color:C.t2 }}> kr</span>
            </div>
            {delta !== null && (
              <div style={{ fontSize:12, fontWeight:600, marginBottom:3, padding:"2px 9px", borderRadius:999, background: delta < 0 ? C.greenSoft : C.redSoft, color: delta < 0 ? C.green : C.red }}>
                {delta < 0 ? "▼" : "▲"} {fmt(Math.abs(delta))} kr
              </div>
            )}
          </div>
          <div style={{ height:7, borderRadius:999, display:"flex", gap:2, overflow:"hidden", marginBottom:10 }}>
            {data.members.map((m: any, i: number) => (
              <div key={i} style={{ flex:m.amount, background:m.color, borderRadius:999 }} />
            ))}
          </div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:18 }}>
            {data.members.map((m: any, i: number) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:m.color }} />
                <span style={{ fontSize:11, color:C.t2 }}>{m.name.split(" ")[0]}</span>
                <span style={{ fontSize:11, fontWeight:600, color:C.t1 }}>{fmt(m.amount)} kr</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", marginBottom:4 }} />

          {/* Savings */}
          <div style={{ fontSize:11, color:C.t3, textTransform:"uppercase", letterSpacing:1, margin:"12px 0 4px" }}>Savings</div>
          <Row label="Total saved across all goals" value={fmt(totalSaved) + " kr"} color={C.green} />
          <Row label="Going to savings this month" value={"+" + fmt(totalMonthlyToSavings) + " kr"} sub="Goals + buffer + Maja's fund" />

          {/* Divider */}
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", marginBottom:4 }} />

          {/* Loans */}
          <div style={{ fontSize:11, color:C.t3, textTransform:"uppercase", letterSpacing:1, margin:"12px 0 4px" }}>Loans</div>
          <Row label="Outstanding balance" value={fmt(totalLoanRemaining) + " kr"} color={C.amber} />
          <Row
            label="Monthly repayments"
            value={fmt(totalLoanMonthly) + " kr / mo"}
            sub={loans.map((l: any) => l.name.split("—")[0].trim()).join(" · ")}
          />
        </div>

        {/* ── CATEGORIES ─────────────────────────────────── */}
        <div style={{ background:C.card, borderRadius:18, border:"1px solid "+C.border, padding:"18px 20px" }}>
          <div style={{ fontSize:11, color:C.t3, textTransform:"uppercase", letterSpacing:1, marginBottom:14 }}>By category</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {data.categories.map((cat: any, i: number) => {
              const pct = Math.round((cat.amount / data.total) * 100);
              return (
                <div key={i}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:16 }}>{cat.icon}</span>
                      <span style={{ fontSize:13, color:C.t2 }}>{cat.name}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:11, color:C.t3 }}>{pct}%</span>
                      <span style={{ fontSize:13, fontWeight:600, color:C.t1 }}>{fmt(cat.amount)} kr</span>
                    </div>
                  </div>
                  <CatBar value={cat.amount} max={maxCat} color={cat.color} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── VS PREVIOUS MONTH ──────────────────────────── */}
        {prevData && (
          <div style={{ background:C.card, borderRadius:18, border:"1px solid "+C.border, padding:"18px 20px" }}>
            <div style={{ fontSize:11, color:C.t3, textTransform:"uppercase", letterSpacing:1, marginBottom:14 }}>vs {prevKey}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {data.categories.map((cat: any, i: number) => {
                const prev = prevData.categories.find((c: any) => c.name === cat.name);
                if (!prev) return null;
                const diff    = cat.amount - prev.amount;
                const diffPct = Math.round((diff / prev.amount) * 100);
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:15, width:22 }}>{cat.icon}</span>
                    <span style={{ flex:1, fontSize:12, color:C.t2 }}>{cat.name}</span>
                    <span style={{ fontSize:12, fontWeight:600, color: diff < 0 ? C.green : diff > 0 ? C.red : C.t3 }}>
                      {diff === 0 ? "—" : (diff > 0 ? "+" : "") + fmt(diff) + " kr"}
                    </span>
                    {diff !== 0 && (
                      <span style={{ fontSize:10, color: diff < 0 ? C.green : C.red, width:34, textAlign:"right" }}>
                        {(diffPct > 0 ? "+" : "") + diffPct + "%"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TIPS FOR NEXT MONTH ────────────────────────── */}
        {tips.length > 0 && (
          <div style={{ background:C.card, borderRadius:18, border:"1px solid "+C.border, padding:"18px 20px" }}>
            <div style={{ fontSize:11, color:C.t3, textTransform:"uppercase", letterSpacing:1, marginBottom:14 }}>Tips for next month</div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {tips.map((tip, i) => (
                <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:tip.color+"18", border:"1.5px solid "+tip.color+"44", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                    {tip.icon}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:500, color:C.t1, marginBottom:3 }}>{tip.title}</div>
                    <div style={{ fontSize:12, color:C.t2, lineHeight:1.5 }}>{tip.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
