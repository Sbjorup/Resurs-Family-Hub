import { useState } from "react";

const C = {
  bg:"#0D0F1A", surface:"#13162A", card:"#1C2040", cardHover:"#222648",
  border:"rgba(255,255,255,0.07)", accent:"#7C6FFF", accentSoft:"rgba(124,111,255,0.15)",
  green:"#34D399", greenSoft:"rgba(52,211,153,0.13)", amber:"#FBBF24",
  amberSoft:"rgba(251,191,36,0.13)", red:"#F87171", redSoft:"rgba(248,113,113,0.12)",
  t1:"#F1F0FF", t2:"rgba(241,240,255,0.52)", t3:"rgba(241,240,255,0.3)",
};
const fmt = (n: number) => n.toLocaleString("sv-SE");

const CATEGORIES = [
  { name:"Housing",    icon:"🏠", color:"#7C6FFF" },
  { name:"Utilities",  icon:"⚡", color:"#60A5FA" },
  { name:"Insurance",  icon:"🛡", color:"#34D399" },
  { name:"Transport",  icon:"🚗", color:"#FBBF24" },
  { name:"Subscriptions", icon:"🔄", color:"#F472B6" },
  { name:"Health",     icon:"💪", color:"#F87171" },
  { name:"Food",       icon:"🛒", color:"#FB923C" },
  { name:"Other",      icon:"📦", color:"#94A3B8" },
];

const DEFAULT_ITEMS = [
  { id:1,  name:"Rent",            amount:12000, category:"Housing",       icon:"🏠", day:1,  member:"Family",  memberColor:"#7C6FFF", active:true },
  { id:2,  name:"Home insurance",  amount:450,   category:"Insurance",     icon:"🛡", day:1,  member:"Family",  memberColor:"#7C6FFF", active:true },
  { id:3,  name:"Electricity",     amount:680,   category:"Utilities",     icon:"⚡", day:25, member:"Family",  memberColor:"#7C6FFF", active:true },
  { id:4,  name:"Internet",        amount:399,   category:"Utilities",     icon:"📡", day:10, member:"Family",  memberColor:"#7C6FFF", active:true },
  { id:5,  name:"Spotify Family",  amount:179,   category:"Subscriptions", icon:"🎵", day:15, member:"Family",  memberColor:"#7C6FFF", active:true },
  { id:6,  name:"Netflix",         amount:169,   category:"Subscriptions", icon:"🎬", day:8,  member:"Anna K.", memberColor:"#7C6FFF", active:true },
  { id:7,  name:"Car insurance",   amount:890,   category:"Insurance",     icon:"🚗", day:1,  member:"Erik K.", memberColor:"#34D399", active:true },
  { id:8,  name:"Phone — Anna",    amount:249,   category:"Utilities",     icon:"📱", day:20, member:"Anna K.", memberColor:"#7C6FFF", active:true },
  { id:9,  name:"Phone — Erik",    amount:249,   category:"Utilities",     icon:"📱", day:20, member:"Erik K.", memberColor:"#34D399", active:true },
  { id:10, name:"Gym membership",  amount:499,   category:"Health",        icon:"💪", day:1,  member:"Anna K.", memberColor:"#7C6FFF", active:true },
  { id:11, name:"Groceries budget", amount:4500, category:"Food",          icon:"🛒", day:1,  member:"Family",  memberColor:"#7C6FFF", active:true },
];

type Item = typeof DEFAULT_ITEMS[0];

function MemberDot({ color }: { color: string }) {
  return <div style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0 }} />;
}

function AddEditModal({ item, onSave, onClose, members }: {
  item: Partial<Item> | null;
  onSave: (item: Omit<Item, "id">) => void;
  onClose: () => void;
  members: any[];
}) {
  const [name, setName]     = useState(item?.name || "");
  const [amount, setAmount] = useState(item?.amount?.toString() || "");
  const [cat, setCat]       = useState(item?.category || "Housing");
  const [day, setDay]       = useState(item?.day?.toString() || "1");
  const [member, setMember] = useState(item?.member || "Family");

  const catObj = CATEGORIES.find(c => c.name === cat)!;
  const memberColor = member === "Family" ? "#7C6FFF"
    : members.find(m => m.name === member)?.color || "#7C6FFF";

  const isValid = name.trim() && Number(amount) > 0;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:390, background:C.surface, borderRadius:"24px 24px 0 0", padding:"24px 20px 40px", border:"1px solid "+C.border }}>
        <div style={{ width:36, height:4, borderRadius:999, background:"rgba(255,255,255,0.2)", margin:"0 auto 20px" }} />
        <div style={{ fontSize:17, fontWeight:600, color:C.t1, marginBottom:20 }}>
          {item?.id ? "Edit expense" : "Add fixed expense"}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Name */}
          <div>
            <div style={{ fontSize:11, color:C.t3, marginBottom:6 }}>NAME</div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Netflix, Rent…"
              style={{ width:"100%", boxSizing:"border-box", background:C.card, border:"1px solid "+C.border, borderRadius:12, padding:"11px 14px", fontSize:14, color:C.t1, outline:"none" }} />
          </div>

          {/* Amount + Day */}
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:2 }}>
              <div style={{ fontSize:11, color:C.t3, marginBottom:6 }}>AMOUNT (KR)</div>
              <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0" type="number"
                style={{ width:"100%", boxSizing:"border-box", background:C.card, border:"1px solid "+C.border, borderRadius:12, padding:"11px 14px", fontSize:14, color:C.t1, outline:"none" }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:C.t3, marginBottom:6 }}>DUE DAY</div>
              <input value={day} onChange={e=>setDay(e.target.value)} placeholder="1" type="number" min="1" max="31"
                style={{ width:"100%", boxSizing:"border-box", background:C.card, border:"1px solid "+C.border, borderRadius:12, padding:"11px 14px", fontSize:14, color:C.t1, outline:"none" }} />
            </div>
          </div>

          {/* Category */}
          <div>
            <div style={{ fontSize:11, color:C.t3, marginBottom:8 }}>CATEGORY</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {CATEGORIES.map(c => (
                <button key={c.name} onClick={() => setCat(c.name)} style={{
                  padding:"6px 12px", borderRadius:999, fontSize:12, cursor:"pointer",
                  background: cat===c.name ? c.color+"33" : "transparent",
                  border: "1px solid " + (cat===c.name ? c.color+"88" : C.border),
                  color: cat===c.name ? c.color : C.t2,
                  display:"flex", alignItems:"center", gap:5,
                }}>
                  <span>{c.icon}</span> {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Member */}
          <div>
            <div style={{ fontSize:11, color:C.t3, marginBottom:8 }}>ASSIGNED TO</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {["Family", ...members.map(m => m.name)].map(mn => {
                const mc = mn === "Family" ? "#7C6FFF" : members.find(m=>m.name===mn)?.color || "#7C6FFF";
                return (
                  <button key={mn} onClick={() => setMember(mn)} style={{
                    padding:"6px 12px", borderRadius:999, fontSize:12, cursor:"pointer",
                    background: member===mn ? mc+"33" : "transparent",
                    border: "1px solid " + (member===mn ? mc+"88" : C.border),
                    color: member===mn ? mc : C.t2,
                  }}>{mn === "Family" ? "👨‍👩‍👧 Family" : mn.split(" ")[0]}</button>
                );
              })}
            </div>
          </div>

          <button onClick={() => {
            if (!isValid) return;
            onSave({ name: name.trim(), amount: Number(amount), category: cat, icon: catObj.icon, day: Number(day)||1, member, memberColor, active: true });
          }} style={{
            marginTop:4, padding:"14px", borderRadius:14, fontSize:15, fontWeight:600,
            background: isValid ? C.accent : "rgba(255,255,255,0.08)",
            border:"none", color: isValid ? "#fff" : C.t3, cursor: isValid ? "pointer" : "default",
          }}>
            {item?.id ? "Save changes" : "Add expense"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FixedExpenses({ members, onBack }: { members: any[]; onBack?: () => void }) {
  const [items, setItems]     = useState<Item[]>(DEFAULT_ITEMS);
  const [editing, setEditing] = useState<Partial<Item> | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter]   = useState<string | null>(null);

  const active = items.filter(i => i.active);
  const total  = active.reduce((s, i) => s + i.amount, 0);

  // Per-category totals
  const catTotals = CATEGORIES.map(c => ({
    ...c,
    total: active.filter(i => i.category === c.name).reduce((s, i) => s + i.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const visible = filter ? active.filter(i => i.category === filter) : active;
  const sortedVisible = [...visible].sort((a, b) => b.amount - a.amount);

  // Days in current month upcoming
  const today = new Date().getDate();
  const upcoming = [...active].filter(i => i.day >= today).sort((a, b) => a.day - b.day).slice(0, 3);

  function removeItem(id: number) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function saveItem(data: Omit<Item, "id">) {
    if (editing?.id) {
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...data } : i));
    } else {
      const newId = Math.max(0, ...items.map(i => i.id)) + 1;
      setItems(prev => [...prev, { ...data, id: newId }]);
    }
    setEditing(null);
    setShowAdd(false);
  }

  return (
    <div style={{ background:C.bg, minHeight:"100%", color:C.t1, fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {/* ── HERO ── */}
      <div style={{ background:"linear-gradient(160deg,#1A0A4A 0%,#0D0F1A 65%)", padding:"20px 20px 24px", borderBottom:"1px solid "+C.border }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ fontSize:11, color:C.t3, letterSpacing:1, textTransform:"uppercase" }}>Fixed monthly costs</div>
          <button onClick={() => setShowAdd(true)} style={{ width:32, height:32, borderRadius:"50%", background:C.accent, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:20, lineHeight:1, flexShrink:0 }}>+</button>
        </div>

        <div style={{ display:"flex", alignItems:"flex-end", gap:14, marginBottom:16 }}>
          <div>
            <div style={{ fontSize:34, fontWeight:500, lineHeight:1 }}>
              {fmt(total)}<span style={{ fontSize:16, color:C.t2 }}> kr</span>
            </div>
            <div style={{ fontSize:12, color:C.t2, marginTop:4 }}>per month · {active.length} expenses</div>
          </div>
        </div>

        {/* Stacked bar */}
        <div style={{ height:10, borderRadius:999, display:"flex", gap:2, overflow:"hidden", marginBottom:12 }}>
          {catTotals.map(c => (
            <div key={c.name} style={{ flex: c.total, background: c.color, borderRadius:999 }} />
          ))}
        </div>

        {/* Legend */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {catTotals.map(c => (
            <button key={c.name} onClick={() => setFilter(filter === c.name ? null : c.name)} style={{
              display:"flex", alignItems:"center", gap:5, border:"none",
              cursor:"pointer", padding:"3px 8px", borderRadius:999,
              background: filter===c.name ? c.color+"22" : "transparent",
              outline: filter===c.name ? "1px solid "+c.color+"55" : "none",
            }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:c.color }} />
              <span style={{ fontSize:11, color:filter===null||filter===c.name ? C.t2 : C.t3 }}>{c.name}</span>
              <span style={{ fontSize:11, fontWeight:600, color:filter===null||filter===c.name ? C.t1 : C.t3 }}>{fmt(c.total)}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"16px 20px 80px", display:"flex", flexDirection:"column", gap:12 }}>

        {/* ── UPCOMING DUE ── */}
        {upcoming.length > 0 && !filter && (
          <div style={{ background:C.card, borderRadius:18, border:"1px solid "+C.border, padding:"16px 18px" }}>
            <div style={{ fontSize:11, color:C.t3, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Coming up this month</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {upcoming.map(item => (
                <div key={item.id} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{item.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:C.t1 }}>{item.name}</div>
                    <div style={{ fontSize:11, color:C.t3, marginTop:1 }}>Due on the {item.day}{ordinal(item.day)}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <MemberDot color={item.memberColor} />
                    <span style={{ fontSize:13, fontWeight:600, color:C.t1 }}>{fmt(item.amount)} kr</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ITEM LIST ── */}
        <div style={{ background:C.card, borderRadius:18, border:"1px solid "+C.border, padding:"16px 18px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:11, color:C.t3, textTransform:"uppercase", letterSpacing:1 }}>
              {filter ? filter : "All expenses"}
              {filter && <span style={{ fontSize:10, marginLeft:6, color:C.accent, cursor:"pointer" }} onClick={()=>setFilter(null)}>✕ clear</span>}
            </div>
            <span style={{ fontSize:12, color:C.t2 }}>{fmt(sortedVisible.reduce((s,i)=>s+i.amount,0))} kr</span>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {sortedVisible.map((item, idx) => {
              const catColor = CATEGORIES.find(c => c.name === item.category)?.color || "#94A3B8";
              return (
                <div key={item.id} style={{ borderBottom: idx < sortedVisible.length-1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0" }}>
                    <div style={{ width:38, height:38, borderRadius:11, background:catColor+"22", border:"1.5px solid "+catColor+"44", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>{item.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:500, color:C.t1 }}>{item.name}</div>
                      <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                        <MemberDot color={item.memberColor} />
                        <span style={{ fontSize:11, color:C.t3 }}>{item.member === "Family" ? "Family" : item.member.split(" ")[0]}</span>
                        <span style={{ fontSize:11, color:"rgba(255,255,255,0.15)" }}>·</span>
                        <span style={{ fontSize:11, color:C.t3 }}>day {item.day}</span>
                        <span style={{ fontSize:10, color:catColor, background:catColor+"18", borderRadius:999, padding:"1px 6px", marginLeft:2 }}>{item.category}</span>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:C.t1 }}>{fmt(item.amount)} kr</span>
                      <button onClick={() => setEditing(item)} style={{ width:28, height:28, borderRadius:8, background:"rgba(255,255,255,0.06)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.t3, fontSize:13 }}>✎</button>
                      <button onClick={() => removeItem(item.id)} style={{ width:28, height:28, borderRadius:8, background:"rgba(248,113,113,0.08)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.red, fontSize:13 }}>✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── PER MEMBER BREAKDOWN ── */}
        {!filter && (
          <div style={{ background:C.card, borderRadius:18, border:"1px solid "+C.border, padding:"16px 18px" }}>
            <div style={{ fontSize:11, color:C.t3, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>By member</div>
            {[
              { label:"👨‍👩‍👧 Family (shared)", color:"#7C6FFF", total: active.filter(i=>i.member==="Family").reduce((s,i)=>s+i.amount,0) },
              ...members.map(m => ({ label:m.name, color:m.color, total: active.filter(i=>i.member===m.name).reduce((s,i)=>s+i.amount,0) })).filter(m=>m.total>0),
            ].map((row, i, arr) => (
              <div key={row.label} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom: i<arr.length-1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <MemberDot color={row.color} />
                <span style={{ flex:1, fontSize:13, color:C.t2 }}>{row.label}</span>
                <span style={{ fontSize:13, fontWeight:600, color:C.t1 }}>{fmt(row.total)} kr / mo</span>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── MODAL ── */}
      {(showAdd || editing) && (
        <AddEditModal
          item={editing || {}}
          members={members}
          onSave={saveItem}
          onClose={() => { setEditing(null); setShowAdd(false); }}
        />
      )}
    </div>
  );
}

function ordinal(n: number) {
  const s = ["th","st","nd","rd"], v = n % 100;
  return s[(v-20)%10] || s[v] || s[0];
}
