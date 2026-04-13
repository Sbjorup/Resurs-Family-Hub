import { useState, useRef, useEffect, useCallback } from "react";
import MonthlySummary from "./MonthlySummary";
import FixedExpenses from "./FixedExpenses";

function useDragScroll() {
  const ref = useRef(null);
  const state = useRef({ isDown: false, startX: 0, scrollLeft: 0, dragged: false });
  const onMouseDown = useCallback((e) => {
    const el = ref.current; if (!el) return;
    state.current = { isDown: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, dragged: false };
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  }, []);
  const onMouseMove = useCallback((e) => {
    const s = state.current, el = ref.current; if (!s.isDown || !el) return;
    e.preventDefault();
    const walk = (e.pageX - el.offsetLeft - s.startX) * 1.5;
    if (Math.abs(walk) > 3) s.dragged = true;
    el.scrollLeft = s.scrollLeft - walk;
  }, []);
  const onMouseUp = useCallback(() => {
    const el = ref.current; if (!el) return;
    state.current.isDown = false;
    el.style.cursor = "grab";
    el.style.userSelect = "";
  }, []);
  const onMouseLeave = useCallback(() => { onMouseUp(); }, [onMouseUp]);
  const props = { ref, onMouseDown, onMouseMove, onMouseUp, onMouseLeave, style: { cursor: "grab" } };
  return props;
}

function ScrollRow({ children, style, scrollRef, ...rest }) {
  const drag = useDragScroll();
  const mergedRef = useCallback((node) => { drag.ref.current = node; if (scrollRef) scrollRef.current = node; }, [scrollRef]);
  return <div {...rest} ref={mergedRef} onMouseDown={drag.onMouseDown} onMouseMove={drag.onMouseMove} onMouseUp={drag.onMouseUp} onMouseLeave={drag.onMouseLeave} style={{...style, cursor: drag.style.cursor, overflowX: "auto", scrollbarWidth: "none"}}>{children}</div>;
}

const C = {
  bg:"#0D0F1A", surface:"#13162A", card:"#1C2040", cardHover:"#222648",
  border:"rgba(255,255,255,0.07)", accent:"#7C6FFF", accentSoft:"rgba(124,111,255,0.15)",
  green:"#34D399", greenSoft:"rgba(52,211,153,0.13)", amber:"#FBBF24",
  amberSoft:"rgba(251,191,36,0.13)", red:"#F87171", redSoft:"rgba(248,113,113,0.12)",
  t1:"#F1F0FF", t2:"rgba(241,240,255,0.52)", t3:"rgba(241,240,255,0.3)",
};

function SvgFace({ seed, size=40 }) {
  const faces = [
    <svg key="a" width={size} height={size} viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#F4C5A0"/><ellipse cx="20" cy="28" rx="11" ry="8" fill="#E8A882"/><circle cx="20" cy="17" r="9" fill="#F4C5A0"/><ellipse cx="20" cy="10" rx="10" ry="7" fill="#6C3A1F"/><ellipse cx="11" cy="16" rx="3" ry="6" fill="#6C3A1F"/><ellipse cx="29" cy="16" rx="3" ry="6" fill="#6C3A1F"/><circle cx="16.5" cy="16.5" r="2" fill="#3B2314"/><circle cx="23.5" cy="16.5" r="2" fill="#3B2314"/><path d="M17 21 Q20 23 23 21" stroke="#C07860" strokeWidth="1" fill="none" strokeLinecap="round"/></svg>,
    <svg key="b" width={size} height={size} viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#D4956A"/><ellipse cx="20" cy="29" rx="12" ry="8" fill="#B07050"/><circle cx="20" cy="17" r="9" fill="#D4956A"/><ellipse cx="20" cy="9" rx="9" ry="5" fill="#2C1A0E"/><rect x="11" y="9" width="18" height="5" rx="2" fill="#2C1A0E"/><circle cx="16.5" cy="16.5" r="2.1" fill="#1A0E08"/><circle cx="23.5" cy="16.5" r="2.1" fill="#1A0E08"/><path d="M17.5 21.5 Q20 23 22.5 21.5" stroke="#A06040" strokeWidth="1.2" fill="none" strokeLinecap="round"/></svg>,
    <svg key="c" width={size} height={size} viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#FDDBB4"/><ellipse cx="20" cy="29" rx="11" ry="8" fill="#F0B87A"/><circle cx="20" cy="17" r="9" fill="#FDDBB4"/><ellipse cx="20" cy="10" rx="9" ry="6" fill="#C0781A"/><ellipse cx="29" cy="13" rx="2.5" ry="5" fill="#C0781A"/><circle cx="16.5" cy="16.5" r="1.9" fill="#3B2314"/><circle cx="23.5" cy="16.5" r="1.9" fill="#3B2314"/><path d="M17 21.5 Q20 24 23 21.5" stroke="#D0886A" strokeWidth="1" fill="none" strokeLinecap="round"/></svg>,
  ];
  return faces[seed % faces.length];
}

const GOAL_EMOJIS = ["🏖","💻","🚲","🏠","🎓","✈️","🎮","⭐"];
const GOAL_COLORS = ["#7C6FFF","#34D399","#F472B6","#FBBF24","#60A5FA","#F87171"];
const CAT_ICONS = { Groceries:"🛒", Gaming:"🎮", Shopping:"🛍", Food:"🍔", Electronics:"💻", Subscriptions:"🔄" };
const fmt = n => n.toLocaleString("sv-SE");

const initBuffer = { balance:18500, monthly:2000, members:[1,2], transactions:[
  {desc:"Anna deposited",amount:1200,date:"Today"},
  {desc:"Erik deposited",amount:800,date:"Mar 22"},
  {desc:"Emergency withdrawal",amount:-3500,date:"Mar 10"},
]};
const initChildFund = { balance:9200, startYear:2010, endYear:2028, monthly:500, members:[1,2], transactions:[
  {desc:"Anna deposited",amount:500,date:"Today"},
  {desc:"Erik deposited",amount:500,date:"Mar 1"},
  {desc:"Birthday bonus",amount:1000,date:"Feb 14"},
]};
const initMembers = [
  { id:1, name:"Anna K.", fullName:"Anna Karlsson", age:38, email:"anna.karlsson@gmail.com", phone:"+46 70 123 45 67", joined:"Jan 2021", initials:"AK", avatarSeed:0, photo:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face&q=80", color:"#7C6FFF", colorSoft:"rgba(124,111,255,0.18)", role:"Account owner", spendMonth:4820, spendLimit:8000, cards:2, goals:1, status:"Within limit", statusColor:C.green, statusBg:C.greenSoft,
    transactions:[{merchant:"ICA Maxi",amount:-642,date:"Today",cat:"Groceries"},{merchant:"Spotify",amount:-99,date:"Yesterday",cat:"Subscriptions"},{merchant:"H&M Online",amount:-1190,date:"Mar 22",cat:"Shopping"}],
    savingsGoal:{name:"Summer holiday",desc:"Family trip to Greece this summer!",emoji:"🏖",color:"#7C6FFF",saved:12400,target:20000,monthly:1200,autoSave:true,completion:"Aug 2025",photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=250&fit=crop&q=80"} },
  { id:2, name:"Erik K.", fullName:"Erik Karlsson", age:40, email:"erik.karlsson@gmail.com", phone:"+46 70 987 65 43", joined:"Jan 2021", initials:"EK", avatarSeed:1, photo:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face&q=80", color:"#34D399", colorSoft:"rgba(52,211,153,0.18)", role:"Member", spendMonth:2310, spendLimit:3000, cards:1, goals:2, status:"Close to limit", statusColor:C.amber, statusBg:C.amberSoft,
    transactions:[{merchant:"Steam",amount:-399,date:"Today",cat:"Gaming"},{merchant:"McDonald's",amount:-89,date:"Mar 23",cat:"Food"},{merchant:"Elgiganten",amount:-1299,date:"Mar 20",cat:"Electronics"}],
    savingsGoal:{name:"New laptop",desc:"Saving up for a MacBook Pro for school and music production.",emoji:"💻",color:"#34D399",saved:4800,target:12000,monthly:685,autoSave:false,completion:"Oct 2026",photo:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=250&fit=crop&q=80"} },
  { id:3, name:"Maja K.", fullName:"Maja Karlsson", age:16, email:"maja.karlsson@gmail.com", phone:"+46 73 555 12 34", joined:"Mar 2022", initials:"MK", avatarSeed:2, photo:"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=face&q=80", color:"#F472B6", colorSoft:"rgba(244,114,182,0.18)", role:"Child", spendMonth:410, spendLimit:1000, cards:1, goals:1, status:"Within limit", statusColor:C.green, statusBg:C.greenSoft,
    transactions:[{merchant:"Hemköp",amount:-112,date:"Mar 23",cat:"Groceries"},{merchant:"Willys",amount:-298,date:"Mar 21",cat:"Groceries"}],
    savingsGoal:{name:"New bike",desc:"A shiny red bike for adventures in the neighbourhood!",emoji:"🚲",color:"#F472B6",saved:1200,target:2500,monthly:300,autoSave:true,completion:"Jun 2025",photo:"https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&h=250&fit=crop&q=80"} },
];
const EXPENSE_DATA = {
  "Mar 2026":{ total:7540, categories:[{name:"Groceries",amount:2340,color:"#F472B6",icon:"🛒"},{name:"Food & dining",amount:1100,color:"#FBBF24",icon:"🍔"},{name:"Shopping",amount:1290,color:"#7C6FFF",icon:"🛍"},{name:"Gaming",amount:399,color:"#34D399",icon:"🎮"},{name:"Subscriptions",amount:99,color:"#60A5FA",icon:"🔄"},{name:"Electronics",amount:1299,color:"#F87171",icon:"💻"},{name:"Other",amount:1013,color:"#94A3B8",icon:"📦"}], members:[{name:"Anna K.",color:"#7C6FFF",amount:4820},{name:"Erik K.",color:"#34D399",amount:2310},{name:"Maja K.",color:"#F472B6",amount:410}]},
  "Feb 2026":{ total:6820, categories:[{name:"Groceries",amount:2100,color:"#F472B6",icon:"🛒"},{name:"Food & dining",amount:950,color:"#FBBF24",icon:"🍔"},{name:"Shopping",amount:1800,color:"#7C6FFF",icon:"🛍"},{name:"Gaming",amount:299,color:"#34D399",icon:"🎮"},{name:"Subscriptions",amount:99,color:"#60A5FA",icon:"🔄"},{name:"Electronics",amount:890,color:"#F87171",icon:"💻"},{name:"Other",amount:682,color:"#94A3B8",icon:"📦"}], members:[{name:"Anna K.",color:"#7C6FFF",amount:4200},{name:"Erik K.",color:"#34D399",amount:2100},{name:"Maja K.",color:"#F472B6",amount:520}]},
  "Jan 2026":{ total:8100, categories:[{name:"Groceries",amount:2500,color:"#F472B6",icon:"🛒"},{name:"Food & dining",amount:1400,color:"#FBBF24",icon:"🍔"},{name:"Shopping",amount:2200,color:"#7C6FFF",icon:"🛍"},{name:"Gaming",amount:450,color:"#34D399",icon:"🎮"},{name:"Subscriptions",amount:198,color:"#60A5FA",icon:"🔄"},{name:"Electronics",amount:650,color:"#F87171",icon:"💻"},{name:"Other",amount:702,color:"#94A3B8",icon:"📦"}], members:[{name:"Anna K.",color:"#7C6FFF",amount:5100},{name:"Erik K.",color:"#34D399",amount:2600},{name:"Maja K.",color:"#F472B6",amount:400}]},
};
const CATEGORY_TXS = {
  "Groceries":[{member:"Anna K.",color:"#7C6FFF",merchant:"ICA Maxi",amount:-642,date:"Today"},{member:"Maja K.",color:"#F472B6",merchant:"Hemköp",amount:-112,date:"Mar 23"},{member:"Maja K.",color:"#F472B6",merchant:"Willys",amount:-298,date:"Mar 21"},{member:"Anna K.",color:"#7C6FFF",merchant:"Coop",amount:-534,date:"Mar 18"},{member:"Anna K.",color:"#7C6FFF",merchant:"ICA Nära",amount:-754,date:"Mar 12"}],
  "Food & dining":[{member:"Erik K.",color:"#34D399",merchant:"McDonald's",amount:-89,date:"Mar 23"},{member:"Anna K.",color:"#7C6FFF",merchant:"Espresso House",amount:-68,date:"Mar 20"},{member:"Erik K.",color:"#34D399",merchant:"Burger King",amount:-112,date:"Mar 15"},{member:"Anna K.",color:"#7C6FFF",merchant:"Sushi Bar",amount:-831,date:"Mar 10"}],
  "Shopping":[{member:"Anna K.",color:"#7C6FFF",merchant:"H&M Online",amount:-1190,date:"Mar 22"},{member:"Anna K.",color:"#7C6FFF",merchant:"Zara",amount:-100,date:"Mar 14"}],
  "Gaming":[{member:"Erik K.",color:"#34D399",merchant:"Steam",amount:-399,date:"Today"}],
  "Subscriptions":[{member:"Anna K.",color:"#7C6FFF",merchant:"Spotify",amount:-99,date:"Yesterday"}],
  "Electronics":[{member:"Erik K.",color:"#34D399",merchant:"Elgiganten",amount:-1299,date:"Mar 20"}],
  "Other":[{member:"Anna K.",color:"#7C6FFF",merchant:"Parking",amount:-45,date:"Mar 22"},{member:"Erik K.",color:"#34D399",merchant:"Pharmacy",amount:-312,date:"Mar 19"},{member:"Anna K.",color:"#7C6FFF",merchant:"Post office",amount:-89,date:"Mar 15"},{member:"Anna K.",color:"#7C6FFF",merchant:"Misc",amount:-567,date:"Mar 8"}],
};
const DEALS = [
  { id:1, partner:"ICA", logo:"🛒", category:"Groceries", tag:"Based on your spending", tagColor:"#F472B6", title:"10% cashback on groceries", desc:"Shop at ICA this week and get 10% back on all grocery purchases.", saving:"Save ~320 kr/mo", color:"#F472B6", colorSoft:"rgba(244,114,182,0.15)", photo:"https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=160&fit=crop&q=80" },
  { id:2, partner:"Elgiganten", logo:"💻", category:"Electronics", tag:"Erik's laptop goal", tagColor:"#34D399", title:"0% interest on electronics", desc:"Finance your next tech purchase with 0% interest for 12 months.", saving:"Save up to 1 800 kr", color:"#34D399", colorSoft:"rgba(52,211,153,0.15)", photo:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=160&fit=crop&q=80" },
  { id:3, partner:"Booking.com", logo:"✈️", category:"Travel", tag:"Anna's holiday goal", tagColor:"#7C6FFF", title:"Up to 20% off hotels", desc:"Exclusive family rates on summer destinations. Book before April 30.", saving:"Save ~2 400 kr", color:"#7C6FFF", colorSoft:"rgba(124,111,255,0.15)", photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=160&fit=crop&q=80" },
  { id:4, partner:"Foodora", logo:"🍔", category:"Food & dining", tag:"Based on your spending", tagColor:"#FBBF24", title:"Free delivery all month", desc:"No delivery fees on all orders over 150 kr through Foodora.", saving:"Save ~180 kr/mo", color:"#FBBF24", colorSoft:"rgba(251,191,36,0.15)", photo:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=160&fit=crop&q=80" },
  { id:5, partner:"Stadium", logo:"🚲", category:"Sports", tag:"Maja's bike goal", tagColor:"#F472B6", title:"15% off bikes & accessories", desc:"Get closer to Maja's goal.", saving:"Save ~375 kr", color:"#F472B6", colorSoft:"rgba(244,114,182,0.15)", photo:"https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=300&h=160&fit=crop&q=80" },
  { id:6, partner:"Spotify", logo:"🎵", category:"Subscriptions", tag:"Based on your spending", tagColor:"#60A5FA", title:"Family plan — save 40%", desc:"Switch to the Spotify Family plan and save.", saving:"Save ~80 kr/mo", color:"#60A5FA", colorSoft:"rgba(96,165,250,0.15)", photo:"https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=300&h=160&fit=crop&q=80" },
];
const NOTIFICATIONS = [
  { id:1, icon:"⚠️", color:C.amber, bg:C.amberSoft, title:"Erik is close to his limit", body:"Erik has used 77% of his monthly spending limit.", time:"Just now", unread:true },
  { id:2, icon:"🎯", color:C.green, bg:C.greenSoft, title:"Maja's bike goal: 48%", body:"Maja reached 48% of her savings goal for the new bike!", time:"2h ago", unread:true },
  { id:3, icon:"💡", color:C.accent, bg:C.accentSoft, title:"New partner deal for you", body:"Booking.com: up to 20% off hotels.", time:"Yesterday", unread:false },
  { id:4, icon:"🛟", color:"#7C6FFF", bg:"rgba(124,111,255,0.15)", title:"Buffer account topped up", body:"Anna deposited 1 200 kr to the shared buffer account.", time:"Yesterday", unread:false },
  { id:5, icon:"📊", color:"#60A5FA", bg:"rgba(96,165,250,0.15)", title:"March report is ready", body:"Your family spent 7 540 kr in March. Tap to view your full monthly summary.", time:"Apr 1", unread:true, action:"monthly" },
];
const ALL_PARTNERS = [
  { id:"ica", name:"ICA Maxi", desc:"Matvaror och livsmedelsprodukter", cat:"Food", color:"#e2001a", icon:"🛒" },
  { id:"bauhaus", name:"BAUHAUS", desc:"Bygg och renovering", cat:"Construction", color:"#e63012", icon:"🏠" },
  { id:"netonnet", name:"NetOnNet", desc:"Elektronik och vitvaror", cat:"Electronics", color:"#f5820a", icon:"📱" },
  { id:"stadium", name:"Stadium", desc:"Sport och fritid", cat:"Sports", color:"#1a1a2e", icon:"🏃" },
  { id:"zalando", name:"Zalando", desc:"Mode och accessoarer", cat:"Fashion", color:"#ff6900", icon:"👟" },
  { id:"hm", name:"H&M", desc:"Kläder och mode", cat:"Fashion", color:"#e50010", icon:"👗" },
  { id:"elgiganten", name:"Elgiganten", desc:"Elektronik och vitvaror", cat:"Electronics", color:"#0057b8", icon:"💻" },
  { id:"clas", name:"Clas Ohlson", desc:"Verktyg och hemartiklar", cat:"Construction", color:"#0057a8", icon:"🔧" },
];
const NEARBY_STORES = [
  { id:"ica", name:"ICA Maxi", dist:"600 m", cat:"Food", color:"#e2001a", icon:"🛒", lat:59.4045, lng:17.9465 },
  { id:"clas", name:"Clas Ohlson", dist:"850 m", cat:"Construction", color:"#0057a8", icon:"🔧", lat:59.4020, lng:17.9510 },
  { id:"stadium", name:"Stadium", dist:"1.2 km", cat:"Sports", color:"#1a1a2e", icon:"🏃", lat:59.4070, lng:17.9540 },
];
const USER_LOCATION = { lat:59.4035, lng:17.9490 };
const RECOMMENDED = [
  { id:"bauhaus", name:"BAUHAUS", reason:"Eftersom du gillar inredning: 10% extra poäng", color:"#e63012" },
  { id:"zalando", name:"Zalando", reason:"Dina favoriter på rea", color:"#ff6900" },
  { id:"netonnet", name:"NetOnNet", reason:"Baserat på Erik's laptop-mål", color:"#f5820a" },
  { id:"stad2", name:"Stadium", reason:"Maja's bike goal — 15% rabatt", color:"#7C6FFF" },
];

const buildCtx = (members, buffer, childFund) =>
  "You are a helpful AI financial assistant in the Resurs Family app for the Karlsson family. Keep answers concise (2-4 sentences). Be warm and practical.\n" +
  "MEMBERS: " + members.map(m => m.name + " spent " + m.spendMonth + "/" + m.spendLimit + " kr").join("; ") + "\n" +
  "SAVINGS: " + members.map(m => m.name + ": " + m.savingsGoal.name + " " + m.savingsGoal.saved + "/" + m.savingsGoal.target + " kr").join("; ") + "\n" +
  "Buffer: " + buffer.balance + " kr. Maja fund: " + childFund.balance + " kr. Only answer finance questions.";

function Avatar({ m, size=40 }) {
  return <div style={{width:size,height:size,borderRadius:"50%",border:"2px solid "+m.color,overflow:"hidden",flexShrink:0,background:m.colorSoft}}>
    {m.photo ? <img src={m.photo} alt={m.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <SvgFace seed={m.avatarSeed} size={size}/>}
  </div>;
}
function Bar({ value, max, color, height=3 }) {
  const pct = Math.min(100, Math.round((value/max)*100));
  const fill = pct>=85?C.red:pct>=70?C.amber:color;
  return <div style={{height,borderRadius:999,background:"rgba(255,255,255,0.07)",overflow:"hidden"}}><div style={{width:pct+"%",height:"100%",borderRadius:999,background:fill}}/></div>;
}
function Badge({ label, color, bg }) {
  return <span style={{fontSize:10,fontWeight:500,color,background:bg,borderRadius:999,padding:"2px 7px",whiteSpace:"nowrap"}}>{label}</span>;
}
function BackBtn({ onClick, style: s }) {
  return <button onClick={onClick} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:"50%",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,...s}}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.t1} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
  </button>;
}
function Tile({ children, style, onClick }) {
  const [hov, setHov] = useState(false);
  return <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{background:hov&&onClick?C.cardHover:C.card,borderRadius:18,border:"1px solid "+C.border,padding:16,cursor:onClick?"pointer":"default",...style}}>{children}</div>;
}
function TileLabel({ children }) {
  return <div style={{fontSize:11,fontWeight:500,color:C.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{children}</div>;
}

function LockIcon({ locked }) {
  return locked
    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>;
}

// ── NEARBY MAP ────────────────────────────────────────────────────────────────
function NearbyMapView({ stores, onClose, onAdd, added }) {
  const [tiles, setTiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ w: 390, h: 780 });
  const zoom = 15;

  useEffect(() => {
    const el = containerRef.current;
    if (el) setSize({ w: el.offsetWidth, h: el.offsetHeight });
  }, []);

  const lngToX = (lng) => ((lng + 180) / 360) * Math.pow(2, zoom) * 256;
  const latToY = (lat) => {
    const rad = (lat * Math.PI) / 180;
    return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, zoom) * 256;
  };

  const centerX = lngToX(USER_LOCATION.lng);
  const centerY = latToY(USER_LOCATION.lat);
  const MAP_H = Math.round(size.h * 0.65);

  useEffect(() => {
    const tileSize = 256;
    const startTileX = Math.floor((centerX - size.w / 2) / tileSize);
    const startTileY = Math.floor((centerY - MAP_H / 2) / tileSize);
    const endTileX = Math.ceil((centerX + size.w / 2) / tileSize);
    const endTileY = Math.ceil((centerY + MAP_H / 2) / tileSize);
    const t = [];
    for (let tx = startTileX; tx <= endTileX; tx++) {
      for (let ty = startTileY; ty <= endTileY; ty++) {
        t.push({
          x: tx, y: ty,
          px: tx * tileSize - (centerX - size.w / 2),
          py: ty * tileSize - (centerY - MAP_H / 2),
          url: `https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`,
        });
      }
    }
    setTiles(t);
  }, [centerX, centerY, size.w, MAP_H]);

  const toScreen = (lat, lng) => ({
    x: lngToX(lng) - (centerX - size.w / 2),
    y: latToY(lat) - (centerY - MAP_H / 2),
  });

  const userPos = toScreen(USER_LOCATION.lat, USER_LOCATION.lng);

  return (
    <div ref={containerRef} style={{position:"absolute",inset:0,zIndex:50,display:"flex",flexDirection:"column",background:C.bg}}>
      {/* Map area */}
      <div style={{position:"relative",width:"100%",height:MAP_H,overflow:"hidden",background:"#1a1c2e",flexShrink:0}}>
        {tiles.map((t,i) => (
          <img key={i} src={t.url} alt="" style={{position:"absolute",left:t.px,top:t.py,width:256,height:256,filter:"brightness(0.25) saturate(0.3) hue-rotate(200deg)"}} draggable={false}/>
        ))}
        <div style={{position:"absolute",left:userPos.x,top:userPos.y,transform:"translate(-50%,-50%)",zIndex:5}}>
          <div style={{width:14,height:14,borderRadius:"50%",background:C.accent,border:"3px solid #fff",boxShadow:"0 0 0 6px rgba(124,111,255,0.25)"}}/>
        </div>
        {stores.map((s) => {
          const pos = toScreen(s.lat, s.lng);
          const isSel = selected === s.id;
          return (
            <div key={s.id} onClick={()=>setSelected(prev=>prev===s.id?null:s.id)} style={{position:"absolute",left:pos.x,top:pos.y,transform:"translate(-50%,-100%)",zIndex:isSel?10:4,cursor:"pointer"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                {isSel && (
                  <div style={{background:C.surface,border:"1px solid "+C.border,borderRadius:10,padding:"6px 10px",marginBottom:4,whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(0,0,0,0.5)"}}>
                    <div style={{fontSize:11,fontWeight:600,color:C.t1}}>{s.name}</div>
                    <div style={{fontSize:10,color:C.t3}}>{"📍 "+s.dist}</div>
                  </div>
                )}
                <div style={{width:isSel?38:30,height:isSel?38:30,borderRadius:"50%",background:s.color,border:"2.5px solid #fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:isSel?18:14,boxShadow:"0 2px 8px rgba(0,0,0,0.4)",transition:"all 0.2s"}}>{s.icon}</div>
              </div>
            </div>
          );
        })}
        <button onClick={onClose} style={{position:"absolute",top:12,left:12,zIndex:12,width:34,height:34,borderRadius:"50%",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.15)",color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div style={{position:"absolute",bottom:4,right:6,fontSize:8,color:"rgba(255,255,255,0.3)"}}>© OpenStreetMap</div>
      </div>
      {/* Bottom sheet */}
      <div style={{flex:1,background:C.surface,borderRadius:"20px 20px 0 0",marginTop:-16,position:"relative",zIndex:10,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"10px 0 6px"}}><div style={{width:36,height:4,borderRadius:999,background:"rgba(255,255,255,0.15)"}}/></div>
        <div style={{padding:"4px 20px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:15,fontWeight:600,color:C.t1}}>Nearby partners</div>
          <div style={{fontSize:11,color:C.t3}}>{stores.length+" found"}</div>
        </div>
        <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none",padding:"0 16px 20px"}}>
          {stores.map(s=>(
            <div key={s.id} onClick={()=>setSelected(prev=>prev===s.id?null:s.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:selected===s.id?C.cardHover:C.card,borderRadius:14,marginBottom:8,border:"1px solid "+(selected===s.id?C.accent+"44":C.border),cursor:"pointer",transition:"all 0.2s"}}>
              <div style={{width:42,height:42,borderRadius:12,background:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{s.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:C.t1}}>{s.name}</div>
                <div style={{fontSize:11,color:C.t3,marginTop:2}}>{"📍 "+s.dist}</div>
              </div>
              <button onClick={(e)=>{e.stopPropagation();onAdd(s.id);}} style={{background:added.includes(s.id)?"rgba(52,211,153,0.15)":C.accent,border:added.includes(s.id)?"1.5px solid "+C.green:"none",borderRadius:20,padding:"7px 16px",fontSize:12,fontWeight:600,color:added.includes(s.id)?C.green:"#fff",cursor:"pointer",flexShrink:0}}>
                {added.includes(s.id)?"Added":"Add"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ADD MEMBERSHIP ─────────────────────────────────────────────────────────────
function AddMembership({ onBack }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [added, setAdded] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [popupSearch, setPopupSearch] = useState("");
  const [showMap, setShowMap] = useState(false);
  const filters = ["All","Food","Electronics","Construction","Sports","Fashion"];
  const toggle = id => setAdded(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);
  const filtered = ALL_PARTNERS.filter(p => {
    const mc = activeFilter==="All" || p.cat===activeFilter;
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });
  const popupFiltered = ALL_PARTNERS.filter(p => {
    if (!popupSearch) return true;
    const q = popupSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q);
  });
  const PR = ({ p, showDist }) => (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:C.card,borderRadius:16,marginBottom:10,border:"1px solid "+C.border}}>
      <div style={{width:52,height:52,borderRadius:14,background:p.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{p.icon}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:600,color:C.t1}}>{p.name}</div>
        {showDist ? <div style={{fontSize:11,color:C.t3,marginTop:2}}>{"📍 "+p.dist}</div> : <div><div style={{fontSize:12,color:C.t2,marginTop:1}}>{p.desc}</div><span style={{display:"inline-block",marginTop:4,fontSize:10,color:C.t3,background:"rgba(255,255,255,0.07)",borderRadius:20,padding:"2px 8px"}}>{p.cat}</span></div>}
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
        <button onClick={()=>toggle(p.id)} style={{background:added.includes(p.id)?"rgba(52,211,153,0.15)":C.accent,border:added.includes(p.id)?"1.5px solid "+C.green:"none",borderRadius:20,padding:"7px 18px",fontSize:13,fontWeight:600,color:added.includes(p.id)?C.green:"#fff",cursor:"pointer",minWidth:64}}>
          {added.includes(p.id)?"Added":"Add"}
        </button>
      </div>
    </div>
  );
  if (showAll) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"14px 20px 12px",background:C.surface,borderBottom:"1px solid "+C.border,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <BackBtn onClick={()=>setShowAll(false)}/>
          <div style={{fontSize:18,fontWeight:700,color:C.t1}}>All Partners</div>
          <div style={{marginLeft:"auto",fontSize:12,color:C.t3}}>{popupFiltered.length+" partners"}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:"10px 14px"}}>
          <input value={popupSearch} onChange={e=>setPopupSearch(e.target.value)} placeholder="Search partners…" style={{flex:1,background:"none",border:"none",color:C.t1,fontSize:13,outline:"none"}}/>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none",padding:"12px 16px 32px"}}>
        {popupFiltered.map(p=><PR key={p.id} p={p} showDist={false}/>)}
      </div>
    </div>
  );
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"14px 20px 12px",background:C.surface,borderBottom:"1px solid "+C.border,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <BackBtn onClick={onBack}/>
          <div><div style={{fontSize:18,fontWeight:700,color:C.t1}}>Add Membership</div><div style={{fontSize:12,color:C.t2}}>Discover new partners and offers</div></div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none",padding:"16px 16px 32px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:"10px 14px",marginBottom:16}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search stores, categories..." style={{flex:1,background:"none",border:"none",color:C.t1,fontSize:13,outline:"none"}}/>
        </div>
        <ScrollRow style={{display:"flex",gap:8,marginBottom:20,paddingBottom:2}}>
          {filters.map(f=><button key={f} onClick={()=>setActiveFilter(f)} style={{flexShrink:0,background:activeFilter===f?C.accent:"rgba(255,255,255,0.06)",border:"none",borderRadius:20,padding:"6px 16px",fontSize:12,fontWeight:activeFilter===f?600:400,color:activeFilter===f?"#fff":C.t2,cursor:"pointer"}}>{f}</button>)}
        </ScrollRow>
        {!search && activeFilter==="All" && (
          <div style={{marginBottom:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:16,fontWeight:700,color:C.t1}}>Nearby right now</div>
              <button onClick={()=>setShowMap(true)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid "+C.border,borderRadius:20,padding:"5px 12px",fontSize:11,fontWeight:500,color:C.t2,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                View map
              </button>
            </div>
            {NEARBY_STORES.map(p=><PR key={p.id} p={p} showDist={true}/>)}
          </div>
        )}
        {!search && activeFilter==="All" && (
          <div style={{marginBottom:24}}>
            <div style={{fontSize:16,fontWeight:700,color:C.t1,marginBottom:12}}>Recommended for you</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {RECOMMENDED.map(r=>(
                <div key={r.id} onClick={()=>toggle(r.id)} style={{borderRadius:16,overflow:"hidden",cursor:"pointer",border:"1px solid "+C.border,position:"relative",height:130,background:"linear-gradient(160deg,"+r.color+"cc,"+r.color+"44)",display:"flex",alignItems:"flex-end",padding:10}}>
                  <div><div style={{display:"inline-block",background:r.color,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,color:"#fff",marginBottom:5}}>{r.name}</div><div style={{fontSize:11,fontWeight:500,color:"#fff",lineHeight:1.3}}>{r.reason}</div></div>
                  {added.includes(r.id)&&<div style={{position:"absolute",top:8,right:8,width:22,height:22,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",fontWeight:700}}>{"+"}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:16,fontWeight:700,color:C.t1}}>{search?"Results":"All Partners"}</span>
            {!search&&<button onClick={()=>{setPopupSearch("");setShowAll(true);}} style={{background:"none",border:"none",color:C.accent,fontSize:12,cursor:"pointer"}}>View all</button>}
          </div>
          {filtered.slice(0,search?filtered.length:5).map(p=><PR key={p.id} p={p} showDist={false}/>)}
        </div>
      </div>
      {showMap && <NearbyMapView stores={NEARBY_STORES} onClose={()=>setShowMap(false)} onAdd={toggle} added={added}/>}
    </div>
  );
}

// ── NOTIFICATIONS ──────────────────────────────────────────────────────────────
function NotificationsPanel({ onClose, onAction }) {
  const [items, setItems] = useState(NOTIFICATIONS);
  const unread = items.filter(n=>n.unread).length;
  return (
    <div style={{position:"absolute",inset:0,zIndex:50,display:"flex",flexDirection:"column",background:C.bg}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",background:C.surface,borderBottom:"1px solid "+C.border,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.t2,fontSize:22,cursor:"pointer",padding:0}}>{"<"}</button>
          <span style={{fontSize:16,fontWeight:500,color:C.t1}}>Notifications</span>
          {unread>0&&<span style={{background:C.red,borderRadius:999,fontSize:10,fontWeight:600,color:"#fff",padding:"2px 7px"}}>{unread+" new"}</span>}
        </div>
        {unread>0&&<button onClick={()=>setItems(ns=>ns.map(n=>({...n,unread:false})))} style={{background:"none",border:"none",color:C.accent,fontSize:12,cursor:"pointer"}}>Mark all read</button>}
      </div>
      <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none",padding:"12px 16px 24px"}}>
        {items.map(n=>(
          <div key={n.id} onClick={()=>{setItems(ns=>ns.map(x=>x.id===n.id?{...x,unread:false}:x));if(n.action&&onAction)onAction(n.action);}} style={{display:"flex",gap:12,padding:14,borderRadius:16,background:n.unread?"rgba(124,111,255,0.07)":C.card,border:"1px solid "+(n.unread?"rgba(124,111,255,0.2)":C.border),marginBottom:10,cursor:"pointer",position:"relative"}}>
            <div style={{width:42,height:42,borderRadius:12,background:n.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{n.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:8,marginBottom:3}}><div style={{fontSize:13,fontWeight:500,color:C.t1,lineHeight:1.3}}>{n.title}</div><div style={{fontSize:10,color:C.t3,whiteSpace:"nowrap",flexShrink:0}}>{n.time}</div></div>
              <div style={{fontSize:12,color:C.t2,lineHeight:1.5}}>{n.body}</div>
            </div>
            {n.unread&&<div style={{position:"absolute",top:14,right:14,width:8,height:8,borderRadius:"50%",background:C.accent}}/>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AI CHAT ────────────────────────────────────────────────────────────────────
function AIChat({ members, buffer, childFund, onClose }) {
  const [messages, setMessages] = useState([{ role:"assistant", content:"Hi Karlsson family! 👋 I'm your Resurs financial assistant. What would you like to know?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,loading]);
  const send = async text => {
    const msg = text||input.trim();
    if (!msg||loading) return;
    setInput("");
    const next = [...messages,{role:"user",content:msg}];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:buildCtx(members,buffer,childFund),messages:next.map(m=>({role:m.role,content:m.content}))})});
      const data = await res.json();
      setMessages(p=>[...p,{role:"assistant",content:data.content?.find(b=>b.type==="text")?.text||"Sorry, try again."}]);
    } catch(e) { setMessages(p=>[...p,{role:"assistant",content:"Something went wrong."}]); }
    setLoading(false);
  };
  const suggested = ["How are we doing on savings?","Is Erik close to his limit?","When will Maja reach her bike goal?","How can we save more?"];
  return (
    <div style={{position:"absolute",inset:0,zIndex:50,display:"flex",flexDirection:"column",background:C.bg}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px",background:C.surface,borderBottom:"1px solid "+C.border,flexShrink:0}}>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.t2,fontSize:22,cursor:"pointer",padding:0}}>{"<"}</button>
        <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#7C6FFF,#34D399)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{"~"}</div>
        <div style={{flex:1}}><div style={{fontSize:15,fontWeight:500,color:C.t1}}>Resurs AI Assistant</div><div style={{fontSize:11,color:C.green,display:"flex",alignItems:"center",gap:4}}><div style={{width:6,height:6,borderRadius:"50%",background:C.green}}/>Online</div></div>
      </div>
      <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none",padding:"16px 16px 8px"}}>
        {messages.map((msg,i)=>(
          <div key={i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start",marginBottom:12,gap:8,alignItems:"flex-end"}}>
            {msg.role==="assistant"&&<div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#7C6FFF,#34D399)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{"~"}</div>}
            <div style={{maxWidth:"78%",background:msg.role==="user"?"linear-gradient(135deg,#7C6FFF,#6055ee)":"rgba(255,255,255,0.06)",border:msg.role==="user"?"none":"1px solid "+C.border,borderRadius:msg.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"11px 14px",fontSize:13,color:C.t1,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{msg.content}</div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:12}}><div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#7C6FFF,#34D399)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>{"~"}</div><div style={{background:"rgba(255,255,255,0.06)",border:"1px solid "+C.border,borderRadius:"18px 18px 18px 4px",padding:"13px 16px",display:"flex",gap:5,alignItems:"center"}}>{[0,1,2].map(j=><div key={j} style={{width:7,height:7,borderRadius:"50%",background:C.accent,opacity:0.7}}/>)}</div></div>}
        {messages.length===1&&<div style={{marginTop:8}}><div style={{fontSize:11,color:C.t3,marginBottom:10,textAlign:"center"}}>Suggested questions</div><div style={{display:"flex",flexDirection:"column",gap:8}}>{suggested.map((s,i)=><button key={i} onClick={()=>send(s)} style={{background:"rgba(124,111,255,0.08)",border:"1px solid rgba(124,111,255,0.25)",borderRadius:12,padding:"10px 14px",fontSize:12,color:C.accent,cursor:"pointer",textAlign:"left"}}>{s}</button>)}</div></div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:"12px 16px 16px",background:C.surface,borderTop:"1px solid "+C.border,flexShrink:0}}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{flex:1,background:C.card,border:"1px solid "+C.border,borderRadius:16,padding:"10px 14px"}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();send();}}} placeholder="Ask about your family's finances…" style={{width:"100%",background:"none",border:"none",color:C.t1,fontSize:13,outline:"none"}}/>
          </div>
          <button onClick={()=>send()} disabled={!input.trim()||loading} style={{width:42,height:42,borderRadius:14,background:input.trim()&&!loading?"linear-gradient(135deg,#7C6FFF,#6055ee)":"rgba(255,255,255,0.07)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:input.trim()&&!loading?"pointer":"default",flexShrink:0}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:input.trim()&&!loading?1:0.4}}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <div style={{fontSize:10,color:C.t3,textAlign:"center",marginTop:8}}>Powered by Claude</div>
      </div>
    </div>
  );
}

// ── AI INSIGHTS ────────────────────────────────────────────────────────────────
function InsightsOnly({ members, buffer, childFund, onOpenChat }) {
  const fallback = [
    {emoji:"💡",title:"Grocery savings",body:"Switch to ICA cashback — save ~320 kr/mo",color:"#F472B6"},
    {emoji:"⚠️",title:"Erik near limit",body:"77% of monthly budget used",color:"#FBBF24"},
    {emoji:"🏖",title:"Holiday goal on track",body:"Anna needs 7 600 kr more by August",color:"#7C6FFF"},
  ];
  const [insights, setInsights] = useState(fallback);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,system:buildCtx(members,buffer,childFund),messages:[{role:"user",content:'Give exactly 3 short financial insights as JSON array only, no markdown. Each: {"emoji":"...","title":"...","body":"...","color":"..."}. Colors: #7C6FFF #34D399 #F472B6 #FBBF24. Body under 60 chars.'}]})})
    .then(r=>r.json())
    .then(d=>{const t=d.content?.find(b=>b.type==="text")?.text||"[]";const parsed=JSON.parse(t.replace(/```json|```/g,"").trim());if(parsed.length)setInsights(parsed);})
    .catch(()=>{})
    .finally(()=>setLoading(false));
  },[]);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {insights.map((ins,i)=>(
        <div key={i} onClick={onOpenChat} style={{display:"flex",alignItems:"flex-start",gap:12,background:C.card,borderRadius:14,padding:"12px 14px",cursor:"pointer",border:"1px solid "+C.border,opacity:loading?0.6:1,transition:"opacity 0.4s"}} onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background=C.card}>
          <div style={{width:36,height:36,borderRadius:10,background:ins.color+"22",border:"1px solid "+ins.color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{ins.emoji}</div>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:C.t1,marginBottom:3}}>{ins.title}</div><div style={{fontSize:12,color:C.t2,lineHeight:1.4}}>{ins.body}</div></div>
          <div style={{color:C.t3,fontSize:14,alignSelf:"center"}}>›</div>
        </div>
      ))}
      <button onClick={onOpenChat} style={{marginTop:4,width:"100%",background:C.accentSoft,border:"1px solid rgba(124,111,255,0.3)",borderRadius:12,padding:"11px 0",fontSize:13,fontWeight:500,color:C.accent,cursor:"pointer"}}>Ask AI assistant</button>
    </div>
  );
}

// ── HEADER / FOOTER ────────────────────────────────────────────────────────────
function Header({ title, showBack, onBack, onNotifications, unreadCount }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",background:C.surface,borderBottom:"1px solid "+C.border,flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {showBack&&<BackBtn onClick={onBack} style={{width:30,height:30,marginRight:2}}/>}
        <span style={{fontSize:16,fontWeight:500,color:C.t1}}>{title}</span>
      </div>
      <button onClick={onNotifications} style={{position:"relative",background:"none",border:"none",padding:0,cursor:"pointer"}}>
        <div style={{width:34,height:34,borderRadius:"50%",background:C.card,border:"1px solid "+C.border,display:"flex",alignItems:"center",justifyContent:"center",color:C.t2}}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </div>
        {unreadCount>0&&<div style={{position:"absolute",top:-3,right:-3,background:C.red,borderRadius:"50%",width:15,height:15,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:600,color:"#fff",border:"1.5px solid "+C.surface}}>{unreadCount}</div>}
      </button>
    </div>
  );
}
function Footer({ activeTab, onTab }) {
  const tabs = [
    {id:"payments",label:"Payments",icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>},
    {id:"services",label:"Services",icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>},
    {id:"merchants",label:"Merchants",icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>},
    {id:"myresurs",label:"My Resurs",icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>},
  ];
  return (
    <div style={{display:"flex",borderTop:"1px solid "+C.border,background:C.surface,padding:"8px 0 12px"}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onTab(t.id)} style={{flex:1,background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",color:activeTab===t.id?C.accent:C.t3,padding:"4px 0"}}>
          {t.icon}
          <span style={{fontSize:11,fontWeight:activeTab===t.id?500:400}}>{t.label}</span>
          {activeTab===t.id&&<div style={{width:4,height:4,borderRadius:"50%",background:C.accent,marginTop:1}}/>}
        </button>
      ))}
    </div>
  );
}

// ── SAVINGS IN SERVICES ───────────────────────────────────────────────────────
function SavingsInServices() {
  const buffer = { balance:18500, monthly:2000 };
  const childFund = { balance:9200, monthly:500 };
  const goals = [
    { name:"Summer holiday", emoji:"🏖", color:"#7C6FFF", saved:12400, target:20000, monthly:1200, who:"Anna K." },
    { name:"New laptop", emoji:"💻", color:"#34D399", saved:4800, target:12000, monthly:685, who:"Erik K." },
    { name:"New bike", emoji:"🚲", color:"#F472B6", saved:1200, target:2500, monthly:300, who:"Maja K." },
  ];
  const totalSaved = buffer.balance + childFund.balance + goals.reduce((s,g)=>s+g.saved,0);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:"linear-gradient(135deg,rgba(124,111,255,0.15),rgba(52,211,153,0.08))",borderRadius:16,border:"1px solid rgba(124,111,255,0.25)",padding:"16px 18px"}}>
        <div style={{fontSize:11,color:C.t3,marginBottom:4}}>Total family savings</div>
        <div style={{fontSize:28,fontWeight:500,color:C.t1}}>{fmt(totalSaved)+" "}<span style={{fontSize:14,color:C.t2}}>kr</span></div>
        <div style={{fontSize:12,color:C.t2,marginTop:2}}>{"+"+fmt(buffer.monthly+childFund.monthly+goals.reduce((s,g)=>s+g.monthly,0))+" kr / month"}</div>
      </div>
      <div style={{background:C.card,borderRadius:16,border:"1px solid rgba(124,111,255,0.3)",padding:"14px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(124,111,255,0.2)",border:"2px solid #7C6FFF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🛟</div>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:C.t1}}>Buffer account</div>        <div style={{fontSize:11,color:C.t3}}>Joint - Anna and Erik</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:500,color:"#7C6FFF"}}>{fmt(buffer.balance)+" kr"}</div><div style={{fontSize:11,color:C.t3}}>{"+"+fmt(buffer.monthly)+" kr/mo"}</div></div>
        </div>
        <div style={{height:4,borderRadius:999,background:"rgba(124,111,255,0.15)",overflow:"hidden"}}><div style={{width:"74%",height:"100%",borderRadius:999,background:"#7C6FFF"}}/></div>
      </div>
      <div style={{background:C.card,borderRadius:16,border:"1px solid rgba(244,114,182,0.3)",padding:"14px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(244,114,182,0.2)",border:"2px solid #F472B6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🌱</div>
          <div style={{flex:1}}>          <div style={{fontSize:14,fontWeight:500,color:C.t1}}>{"Maja's 0-18 fund"}</div>        <div style={{fontSize:11,color:C.t3}}>Long-term - Adults manage</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:500,color:"#F472B6"}}>{fmt(childFund.balance)+" kr"}</div><div style={{fontSize:11,color:C.t3}}>{"+"+fmt(childFund.monthly)+" kr/mo"}</div></div>
        </div>
        <div style={{height:4,borderRadius:999,background:"rgba(244,114,182,0.15)",overflow:"hidden"}}><div style={{width:"51%",height:"100%",borderRadius:999,background:"#F472B6"}}/></div>
      </div>
      <div style={{fontSize:11,fontWeight:500,color:C.t3,textTransform:"uppercase",letterSpacing:1,marginTop:4}}>Individual goals</div>
      {goals.map((g,i)=>{
        const pct=Math.round((g.saved/g.target)*100);
        return (
          <div key={i} style={{background:C.card,borderRadius:16,border:"1px solid "+C.border,padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
              <div style={{width:40,height:40,borderRadius:12,background:g.color+"22",border:"1.5px solid "+g.color+"55",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,overflow:"hidden"}}>{g.photo?<img src={g.photo} alt={g.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:g.emoji}</div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:C.t1}}>{g.name}</div><div style={{fontSize:11,color:C.t3}}>{g.who}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:500,color:g.color}}>{pct+"%"}</div><div style={{fontSize:11,color:C.t3}}>{fmt(g.saved)+" / "+fmt(g.target)}</div></div>
            </div>
            <div style={{height:4,borderRadius:999,background:"rgba(255,255,255,0.07)",overflow:"hidden"}}><div style={{width:pct+"%",height:"100%",borderRadius:999,background:g.color}}/></div>
          </div>
        );
      })}
    </div>
  );
}

// ── LOAN DETAIL ───────────────────────────────────────────────────────────────
function LoanDetail({ loan, onBack }) {
  const pct = Math.round((loan.paid / loan.amount) * 100);
  const remaining = loan.amount - loan.paid;
  const monthsLeft = Math.ceil(remaining / loan.monthly);
  const estEnd = loan.ends;
  const rows = [
    { emoji:"💰", label:"Total loan amount", value: fmt(loan.amount)+" kr" },
    { emoji:"✅", label:"Amount paid", value: fmt(loan.paid)+" kr", color: C.green },
    { emoji:"⏳", label:"Remaining balance", value: fmt(remaining)+" kr", color: loan.color },
    { emoji:"📅", label:"Monthly payment", value: fmt(loan.monthly)+" kr/mo" },
    { emoji:"📈", label:"Interest rate", value: loan.rate },
    { emoji:"🏁", label:"End date", value: estEnd },
  ];
  return (
    <div style={{background:C.bg,minHeight:"100%",color:C.t1}}>
      <div style={{position:"relative",height:160,background:"linear-gradient(160deg,"+loan.color+"44 0%,"+C.bg+" 80%)",overflow:"hidden"}}>
        <div style={{position:"absolute",bottom:20,left:20,right:20,zIndex:2}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:52,height:52,borderRadius:14,background:loan.color+"22",border:"2px solid "+loan.color+"55",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{loan.icon}</div>
            <div>
              <div style={{fontSize:20,fontWeight:600,color:C.t1}}>{loan.name}</div>
              <div style={{fontSize:12,color:C.t2,marginTop:2}}>{loan.rate+" interest · Ends "+loan.ends}</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{padding:"20px 20px 40px"}}>
        <div style={{background:C.card,borderRadius:18,border:"1px solid "+C.border,padding:"18px 20px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
            <div>
              <div style={{fontSize:11,color:C.t3,marginBottom:4}}>Remaining</div>
              <div style={{fontSize:30,fontWeight:500}}>{fmt(remaining)+" "}<span style={{fontSize:14,color:C.t2}}>kr</span></div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:C.t3,marginBottom:4}}>Total</div>
              <div style={{fontSize:18,fontWeight:500,color:C.t2}}>{fmt(loan.amount)+" kr"}</div>
            </div>
          </div>
          <Bar value={loan.paid} max={loan.amount} color={loan.color} height={7}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:12,color:C.t3}}>
            <span>{"0%"}</span>
            <span style={{color:loan.color,fontWeight:500}}>{pct+"% paid off"}</span>
          </div>
        </div>
        <div style={{background:C.card,borderRadius:16,border:"1px solid "+C.border,overflow:"hidden",marginBottom:16}}>
          {rows.map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 16px",borderBottom:i<rows.length-1?"1px solid "+C.border:"none"}}>
              <span style={{fontSize:20,width:28,textAlign:"center",flexShrink:0}}>{r.emoji}</span>
              <span style={{flex:1,fontSize:13,color:C.t2}}>{r.label}</span>
              <span style={{fontSize:13,fontWeight:500,color:r.color||C.t1}}>{r.value}</span>
            </div>
          ))}
        </div>
        <div style={{background:"rgba(251,191,36,0.08)",borderRadius:16,border:"1px solid rgba(251,191,36,0.25)",padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
          <span style={{fontSize:20,flexShrink:0}}>💡</span>
          <div style={{fontSize:13,color:C.t2,lineHeight:1.6}}>{"At your current pace you have ~"+monthsLeft+" months remaining. Making extra payments reduces your interest costs."}</div>
        </div>
      </div>
    </div>
  );
}

// ── SERVICES ──────────────────────────────────────────────────────────────────
function ServicesPage({ onFamilyClick }) {
  const [sel, setSel] = useState("Cards");
  const [sheet, setSheet] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const cats = [
    {id:"Cards",color:"#7C6FFF",icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>},
    {id:"Savings",color:"#34D399",icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 8c0-2.8-2.2-5-5-5H9C6.2 3 4 5.2 4 8c0 2.1 1.3 4 3.2 4.8V17a1 1 0 0 0 1 1h7.6a1 1 0 0 0 1-1v-4.2C18.7 12 19 10.1 19 8z"/><path d="M9 17v1a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1"/><line x1="12" y1="7" x2="12" y2="11"/><line x1="10" y1="9" x2="14" y2="9"/></svg>},
    {id:"Loans",color:"#FBBF24",icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>},
  ];
  if (selectedLoan) return <LoanDetail loan={selectedLoan} onBack={()=>setSelectedLoan(null)}/>;
  return (
    <div style={{flex:1,overflowY:"auto",padding:20,position:"relative"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div style={{fontSize:13,color:C.t2}}>Your banking solutions</div>
        <button onClick={()=>setSheet(true)} style={{width:36,height:36,borderRadius:"50%",background:C.accent,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",fontSize:22}}>+</button>
      </div>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:13,fontWeight:500,color:C.t3,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Categories</div>
        <div style={{display:"flex",gap:12}}>
          {cats.map(cat=>(
            <button key={cat.id} onClick={()=>setSel(cat.id)} style={{flex:1,background:sel===cat.id?cat.color+"18":C.card,border:"1.5px solid "+(sel===cat.id?cat.color:C.border),borderRadius:16,padding:"16px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:10,cursor:"pointer"}}>
              <div style={{color:sel===cat.id?cat.color:C.t3}}>{cat.icon}</div>
              <span style={{fontSize:13,fontWeight:500,color:sel===cat.id?cat.color:C.t2}}>{cat.id}</span>
            </button>
          ))}
        </div>
      </div>
      {sel==="Cards"&&[{name:"Resurs Family",sub:"Available Credit",amount:"42 460 SEK",icon:"💜",color:"#7C6FFF",isFamily:true},{name:"Resurs Travel",sub:"Available Credit",amount:"25 000 SEK",icon:"✈️",color:"#34D399",isFamily:false}].map((card,i)=>(
        <div key={i} onClick={card.isFamily?onFamilyClick:undefined} onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background=C.card} style={{background:C.card,borderRadius:16,border:"1px solid "+(card.isFamily?card.color+"44":C.border),padding:"16px 18px",display:"flex",alignItems:"center",gap:14,cursor:card.isFamily?"pointer":"default",marginBottom:10}}>
          <div style={{width:44,height:44,borderRadius:12,background:card.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{card.icon}</div>
          <div style={{flex:1}}><div style={{fontSize:15,fontWeight:500,color:C.t1}}>{card.name}</div><div style={{fontSize:12,color:C.t3,marginTop:2}}>{card.sub}</div></div>
          <div style={{fontSize:15,fontWeight:500,color:C.t1}}>{card.amount}</div>
        </div>
      ))}
      {sel==="Savings"&&<SavingsInServices/>}
      {sel==="Loans"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"linear-gradient(135deg,rgba(251,191,36,0.12),rgba(251,191,36,0.05))",borderRadius:16,border:"1px solid rgba(251,191,36,0.25)",padding:"16px 18px"}}>
            <div style={{fontSize:11,color:C.t3,marginBottom:4}}>Total outstanding</div>
            <div style={{fontSize:28,fontWeight:500,color:C.t1}}>{"42 500 "}<span style={{fontSize:14,color:C.t2}}>kr</span></div>
            <div style={{fontSize:12,color:C.t2,marginTop:2}}>2 active loans</div>
          </div>
          {[
            {name:"Home renovation loan",amount:35000,monthly:1200,paid:8500,color:"#FBBF24",icon:"🏠",rate:"4.9%",ends:"Dec 2027"},
            {name:"Electronics — Elgiganten",amount:7500,monthly:685,paid:2500,color:"#60A5FA",icon:"💻",rate:"0%",ends:"Oct 2025"},
          ].map((loan,i)=>{
            const pct=Math.round((loan.paid/loan.amount)*100);
            return (
              <div key={i} onClick={()=>setSelectedLoan(loan)} onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background=C.card} style={{background:C.card,borderRadius:16,border:"1px solid "+C.border,padding:"14px 16px",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                  <div style={{width:44,height:44,borderRadius:12,background:loan.color+"22",border:"1.5px solid "+loan.color+"55",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{loan.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:500,color:C.t1}}>{loan.name}</div>
                    <div style={{fontSize:11,color:C.t3,marginTop:2}}>{"Ends "+loan.ends+" · "+loan.rate+" interest"}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:14,fontWeight:500,color:loan.color}}>{fmt(loan.amount-loan.paid)+" kr"}</div>
                    <div style={{fontSize:11,color:C.t3}}>remaining</div>
                  </div>
                </div>
                <Bar value={loan.paid} max={loan.amount} color={loan.color} height={5}/>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:11,color:C.t3}}>
                  <span>{pct+"% paid off"}</span>
                  <span>{fmt(loan.monthly)+" kr/mo"}</span>
                </div>
              </div>
            );
          })}
          <div onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background=C.card} style={{background:C.card,borderRadius:16,border:"1px dashed rgba(251,191,36,0.4)",padding:"16px 18px",display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}>
            <div style={{width:44,height:44,borderRadius:12,background:"rgba(251,191,36,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:C.amber,flexShrink:0}}>+</div>
            <div><div style={{fontSize:14,fontWeight:500,color:C.t1}}>Apply for a new loan</div><div style={{fontSize:12,color:C.t3,marginTop:2}}>Quick approval · Flexible terms</div></div>
          </div>
        </div>
      )}
      {sheet&&(
        <div onClick={()=>setSheet(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.55)",zIndex:10,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#13162A",borderRadius:"20px 20px 0 0",padding:"16px 20px 32px"}}>
            <div style={{width:40,height:4,borderRadius:999,background:"rgba(255,255,255,0.2)",margin:"0 auto 20px"}}/>
            <div style={{fontSize:18,fontWeight:500,color:C.t1,marginBottom:20}}>Apply for new service</div>
            {[{color:"#7C6FFF",label:"Apply for a new card",sub:"Get a card that suits your lifestyle"},{color:"#34D399",label:"Start saving",sub:"Open a savings account today"},{color:"#FBBF24",label:"Apply for loan",sub:"Get money for your projects"}].map((item,i)=>(
              <div key={i} onClick={()=>setSheet(false)} style={{display:"flex",alignItems:"center",gap:14,background:C.card,borderRadius:14,padding:"14px 16px",marginBottom:12,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background=C.card}>
                <div style={{width:44,height:44,borderRadius:12,background:item.color+"22",display:"flex",alignItems:"center",justifyContent:"center",color:item.color,flexShrink:0,fontSize:20}}>+</div>
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:C.t1}}>{item.label}</div><div style={{fontSize:12,color:C.t3,marginTop:2}}>{item.sub}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── PAYMENTS ──────────────────────────────────────────────────────────────────
function PaymentsPage() {
  const txs = [{merchant:"ICA Maxi",amount:-642,date:"Today",cat:"Groceries"},{merchant:"Spotify",amount:-99,date:"Yesterday",cat:"Subscriptions"},{merchant:"Steam",amount:-399,date:"Mar 23",cat:"Gaming"},{merchant:"H&M Online",amount:-1190,date:"Mar 22",cat:"Shopping"},{merchant:"McDonald's",amount:-89,date:"Mar 21",cat:"Food"}];
  return (
    <div style={{flex:1,overflowY:"auto",padding:"24px 20px 20px"}}>
      <div style={{fontSize:28,fontWeight:500,color:C.t1,marginBottom:4}}>Payments</div>
                <div style={{fontSize:14,color:C.t2,marginBottom:24}}>Your transactions</div>
      {txs.map((tx,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:12,background:C.card,borderRadius:14,padding:"14px 16px",marginBottom:10,border:"1px solid "+C.border}}>
          <div style={{width:40,height:40,borderRadius:11,background:"rgba(124,111,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{CAT_ICONS[tx.cat]||"💳"}</div>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:C.t1}}>{tx.merchant}</div>          <div style={{fontSize:12,color:C.t3}}>{tx.cat+" - "+tx.date}</div></div>
          <div style={{fontSize:14,fontWeight:500,color:C.red}}>{tx.amount.toLocaleString("sv-SE")+" kr"}</div>
        </div>
      ))}
    </div>
  );
}

// ── MERCHANTS ─────────────────────────────────────────────────────────────────
function MerchantsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [showAllRec, setShowAllRec] = useState(false);
  const [activeStory, setActiveStory] = useState(null);
  const [storySlide, setStorySlide] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const [activeOffer, setActiveOffer] = useState(null);
  const [hotspot, setHotspot] = useState(null);
  const [showInsight, setShowInsight] = useState(false);
  const [insightSlide, setInsightSlide] = useState(0);
  const [insightProgress, setInsightProgress] = useState(0);
  const insightTimerRef = useRef(null);
  const timerRef = useRef(null);
  const offersRef = useRef(null);
  const [activeOfferIdx, setActiveOfferIdx] = useState(0);
  const onOffersScroll = useCallback(() => {
    const el = offersRef.current; if (!el) return;
    const idx = Math.round(el.scrollLeft / 190);
    setActiveOfferIdx(Math.min(idx, currentOffers.length - 1));
  }, []);
  const SLIDE_DUR = 5000;
  const stories = [
    {id:1,partner:"BAUHAUS",tag:"Home improvement",accent:"#34D399",slides:[
      {title:"Transform your living room",sub:"Explore this season's top picks",img:"🛋",bg:"#c8b89a",photo:"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=700&fit=crop&q=80",hotspots:[{x:28,y:52,label:"Nordic Sofa",price:"8 990 kr",monthly:"748 kr/mo",partner:"BAUHAUS"},{x:68,y:38,label:"Floor lamp",price:"1 490 kr",monthly:"124 kr/mo",partner:"BAUHAUS"}]},
      {title:"Garden season is here",sub:"Get your outdoor space ready",img:"🌿",bg:"#87CEEB",photo:"https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=700&fit=crop&q=80",hotspots:[{x:50,y:42,label:"Garden furniture set",price:"12 990 kr",monthly:"1 082 kr/mo",partner:"BAUHAUS"}]},
    ]},
    {id:2,partner:"NetOnNet",tag:"Electronics",accent:"#7C6FFF",slides:[
      {title:"You spent 780 kr on cafés last month",sub:"An espresso machine could save you long-term",img:"☕",bg:"#1a0e08",photo:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=700&fit=crop&q=80",hotspots:[{x:38,y:55,label:"Sage Barista Express",price:"7 990 kr",monthly:"666 kr/mo",partner:"NetOnNet"},{x:63,y:60,label:"Nespresso Vertuo",price:"1 990 kr",monthly:"166 kr/mo",partner:"NetOnNet"}]},
    ]},
    {id:3,partner:"Stadium",tag:"Sports & outdoors",accent:"#F472B6",slides:[
      {title:"Gear up for summer",sub:"Top picks for outdoor adventures",img:"🚴",bg:"#1a2a4a",photo:"https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&h=700&fit=crop&q=80",hotspots:[{x:38,y:62,label:"Trek FX3 Bike",price:"11 990 kr",monthly:"999 kr/mo",partner:"Stadium"},{x:65,y:50,label:"Helmet Pro",price:"990 kr",monthly:"83 kr/mo",partner:"Stadium"}]},
    ]},
  ];
  const currentOffers = [
    {id:1,tag:"Seasonal",title:"Spring Garden Week",sub:"Everything for your outdoor space",color:"#34D399",colorSoft:"rgba(52,211,153,0.15)",icon:"🌱",monthly:"From 299 kr/mo",photo:"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=360&h=220&fit=crop&q=80"},
    {id:2,tag:"Campaign",title:"BAUHAUS: 25% off + 6 months interest-free",sub:"Valid until April 30",color:"#7C6FFF",colorSoft:"rgba(124,111,255,0.15)",icon:"🏠",monthly:"From 499 kr/mo",photo:"https://images.unsplash.com/photo-1513694203232-719a280e022f?w=360&h=220&fit=crop&q=80"},
    {id:3,tag:"Holiday",title:"Easter family deals",sub:"Gifts, garden & home",color:"#FBBF24",colorSoft:"rgba(251,191,36,0.15)",icon:"🐣",monthly:"From 199 kr/mo",photo:"https://images.unsplash.com/photo-1457530378978-8bac673b8062?w=360&h=220&fit=crop&q=80"},
  ];
  const recommended = [
    {id:1,partner:"ICA",icon:"🛒",color:"#F472B6",colorSoft:"rgba(244,114,182,0.15)",reason:"Based on your grocery spending",title:"Extra points every Tuesday",saving:"Up to 5% back",photo:"https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=260&fit=crop"},
    {id:2,partner:"Elgiganten",icon:"💻",color:"#60A5FA",colorSoft:"rgba(96,165,250,0.15)",reason:"Erik's laptop goal",title:"0% interest — 12 months",saving:"Save ~1 800 kr",photo:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=260&fit=crop"},
    {id:3,partner:"Booking.com",icon:"✈️",color:"#7C6FFF",colorSoft:"rgba(124,111,255,0.15)",reason:"Anna's holiday goal",title:"Up to 20% off hotels",saving:"Save ~2 400 kr",photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=260&fit=crop"},
    {id:4,partner:"Stadium",icon:"🚲",color:"#F472B6",colorSoft:"rgba(244,114,182,0.15)",reason:"Maja's bike goal",title:"15% off all bikes",saving:"Save ~375 kr",photo:"https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400&h=260&fit=crop"},
  ];
  const memberships = [
    {name:"ICA",icon:"🛒",bg:"#e2001a",textColor:"#fff",points:"2 340 pts"},
    {name:"BAUHAUS",icon:"🏠",bg:"#fff",textColor:"#000",points:"Member"},
    {name:"Stadium",icon:"🏃",bg:"#1a1a2e",textColor:"#7C6FFF",points:"Active"},
  ];
  const nearby = [
    {name:"ICA Maxi",dist:"0.6 km",icon:"🛒",color:"#F472B6",membership:true},
    {name:"BAUHAUS Barkarby",dist:"1.2 km",icon:"🏠",color:"#34D399",membership:true},
    {name:"Stadium Täby",dist:"2.8 km",icon:"🏃",color:"#F472B6",membership:false},
  ];
  useEffect(()=>{
    if(activeStory===null||hotspot) return;
    const s=stories[activeStory];setStoryProgress(0);
    const t0=Date.now();
    const tick=()=>{
      const pct=Math.min((Date.now()-t0)/SLIDE_DUR,1);setStoryProgress(pct);
      if(pct<1){timerRef.current=requestAnimationFrame(tick);}
      else if(storySlide<s.slides.length-1){setStorySlide(v=>v+1);}
      else if(activeStory<stories.length-1){setActiveStory(v=>v+1);setStorySlide(0);}
      else{setActiveStory(null);setStorySlide(0);}
    };
    timerRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(timerRef.current);
  },[activeStory,storySlide,hotspot]);
  const closeStory=()=>{cancelAnimationFrame(timerRef.current);setActiveStory(null);setHotspot(null);setStorySlide(0);setStoryProgress(0);};
  const goNext=()=>{cancelAnimationFrame(timerRef.current);const s=stories[activeStory];if(storySlide<s.slides.length-1){setStorySlide(v=>v+1);}else if(activeStory<stories.length-1){setActiveStory(v=>v+1);setStorySlide(0);}else{closeStory();}};
  const goPrev=()=>{cancelAnimationFrame(timerRef.current);if(storySlide>0){setStorySlide(v=>v-1);}else if(activeStory>0){setActiveStory(v=>v-1);setStorySlide(0);}};

  const insightSlides = [
    { bg:"linear-gradient(160deg,#7C6FFF 0%,#1a1040 100%)", title:"March spending overview", sub:"Your family spent 7 540 kr this month", items:[
      {label:"Anna K.",value:"4 820 kr",pct:64,color:"#7C6FFF"},{label:"Erik K.",value:"2 310 kr",pct:31,color:"#34D399"},{label:"Maja K.",value:"410 kr",pct:5,color:"#F472B6"}
    ]},
    { bg:"linear-gradient(160deg,#34D399 0%,#0a2a1a 100%)", title:"You're saving well!", sub:"Total savings progress across all goals", items:[
      {label:"Summer holiday",value:"12 400 / 20 000 kr",pct:62,color:"#7C6FFF"},{label:"New laptop",value:"4 800 / 12 000 kr",pct:40,color:"#34D399"},{label:"New bike",value:"1 200 / 2 500 kr",pct:48,color:"#F472B6"}
    ]},
    { bg:"linear-gradient(160deg,#FBBF24 0%,#2a1a00 100%)", title:"Smart tip", sub:"Erik is at 77% of his spending limit", tip:"Consider adjusting Erik's limit or reviewing subscriptions to stay on track this month." },
    { bg:"linear-gradient(160deg,#F472B6 0%,#2a0a1a 100%)", title:"Top spending category", sub:"Groceries: 2 340 kr this month", tip:"You spent 11% more on groceries than last month. Check out ICA's 10% cashback deal to save ~320 kr/mo." },
  ];
  const INSIGHT_DUR = 6000;
  useEffect(()=>{
    if(!showInsight) return;
    setInsightProgress(0);
    const t0=Date.now();
    const tick=()=>{
      const pct=Math.min((Date.now()-t0)/INSIGHT_DUR,1);setInsightProgress(pct);
      if(pct<1){insightTimerRef.current=requestAnimationFrame(tick);}
      else if(insightSlide<insightSlides.length-1){setInsightSlide(v=>v+1);}
      else{setShowInsight(false);setInsightSlide(0);}
    };
    insightTimerRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(insightTimerRef.current);
  },[showInsight,insightSlide]);
  const closeInsight=()=>{cancelAnimationFrame(insightTimerRef.current);setShowInsight(false);setInsightSlide(0);setInsightProgress(0);};
  const insightNext=()=>{cancelAnimationFrame(insightTimerRef.current);if(insightSlide<insightSlides.length-1){setInsightSlide(v=>v+1);}else{closeInsight();}};
  const insightPrev=()=>{cancelAnimationFrame(insightTimerRef.current);if(insightSlide>0){setInsightSlide(v=>v-1);}};

  if(showAdd) return <AddMembership onBack={()=>setShowAdd(false)} added={[]} onAdd={()=>{}}/>;
  if(showInsight){
    const slide=insightSlides[insightSlide];
    return(
      <div style={{flex:1,background:"#000",position:"relative",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Progress bars */}
        <div style={{display:"flex",gap:3,padding:"12px 16px 8px",zIndex:10}}>
          {insightSlides.map((_,i)=>{const done=i<insightSlide,active=i===insightSlide;return <div key={i} style={{flex:1,height:3,borderRadius:999,background:"rgba(255,255,255,0.25)",overflow:"hidden"}}><div style={{height:"100%",background:"#fff",width:done?"100%":active?(insightProgress*100)+"%":"0%"}}/></div>;})}
        </div>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 16px 12px",zIndex:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:C.accentSoft,border:"2px solid "+C.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>💡</div>
            <div><div style={{fontSize:13,fontWeight:600,color:"#fff"}}>Smart Insight</div><div style={{fontSize:10,color:"rgba(255,255,255,0.55)"}}>Karlsson family</div></div>
          </div>
          <button onClick={closeInsight} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:30,height:30,color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>X</button>
        </div>
        {/* Content */}
        <div style={{flex:1,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,background:slide.bg}}/>
          <div onClick={insightPrev} style={{position:"absolute",left:0,top:0,width:"35%",height:"100%",zIndex:5,cursor:"pointer"}}/>
          <div onClick={insightNext} style={{position:"absolute",right:0,top:0,width:"35%",height:"100%",zIndex:5,cursor:"pointer"}}/>
          <div style={{position:"relative",zIndex:6,padding:"32px 24px",height:"100%",display:"flex",flexDirection:"column"}}>
            <div style={{fontSize:24,fontWeight:700,color:"#fff",marginBottom:8,lineHeight:1.2}}>{slide.title}</div>
            <div style={{fontSize:14,color:"rgba(255,255,255,0.7)",marginBottom:28}}>{slide.sub}</div>
            {slide.items && (
              <div style={{display:"flex",flexDirection:"column",gap:16,flex:1}}>
                {slide.items.map((item,i)=>(
                  <div key={i}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <span style={{fontSize:13,fontWeight:500,color:"#fff"}}>{item.label}</span>
                      <span style={{fontSize:13,fontWeight:600,color:item.color}}>{item.value}</span>
                    </div>
                    <div style={{height:6,borderRadius:999,background:"rgba(255,255,255,0.12)",overflow:"hidden"}}>
                      <div style={{width:item.pct+"%",height:"100%",borderRadius:999,background:item.color,transition:"width 0.8s ease"}}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {slide.tip && (
              <div style={{flex:1,display:"flex",alignItems:"center"}}>
                <div style={{background:"rgba(255,255,255,0.1)",backdropFilter:"blur(10px)",borderRadius:18,padding:"20px 22px",border:"1px solid rgba(255,255,255,0.15)"}}>
                  <div style={{fontSize:14,color:"#fff",lineHeight:1.5}}>{slide.tip}</div>
                </div>
              </div>
            )}
            <button onClick={insightNext} style={{width:"100%",background:"rgba(255,255,255,0.2)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:14,padding:"13px 0",fontSize:14,fontWeight:600,color:"#fff",cursor:"pointer",marginTop:"auto"}}>
              {insightSlide<insightSlides.length-1?"Next insight":"Done"}
            </button>
          </div>
        </div>
      </div>
    );
  }
  if(activeStory!==null){
    const s=stories[activeStory],slide=s.slides[storySlide];
    return(
      <div style={{flex:1,background:"#000",position:"relative",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{display:"flex",gap:3,padding:"12px 16px 8px",zIndex:10}}>
          {stories.flatMap((st,si)=>st.slides.map((_,sli)=>{const done=si<activeStory||(si===activeStory&&sli<storySlide),active=si===activeStory&&sli===storySlide;return <div key={si+"-"+sli} style={{flex:1,height:3,borderRadius:999,background:"rgba(255,255,255,0.25)",overflow:"hidden"}}><div style={{height:"100%",background:"#fff",width:done?"100%":active?(storyProgress*100)+"%":"0%"}}/></div>;})) }
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 16px 12px",zIndex:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:s.accent+"33",border:"2px solid "+s.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{slide.img}</div>
            <div><div style={{fontSize:13,fontWeight:600,color:"#fff"}}>{s.partner}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.55)"}}>{s.tag}</div></div>
          </div>
          <button onClick={closeStory} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"50%",width:30,height:30,color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>X</button>
        </div>
        <div style={{flex:1,position:"relative",overflow:"hidden",background:slide.bg||"#111"}}>
          {slide.photo ? <img src={slide.photo} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/> : <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-60%)",fontSize:120,opacity:0.12}}>{slide.img}</div>}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.85) 100%)"}}/>
          <div onClick={goPrev} style={{position:"absolute",left:0,top:0,width:"35%",height:"100%",zIndex:5,cursor:"pointer"}}/>
          <div onClick={goNext} style={{position:"absolute",right:0,top:0,width:"35%",height:"100%",zIndex:5,cursor:"pointer"}}/>
          {slide.hotspots.map((hs,i)=>(
            <button key={i} onClick={e=>{e.stopPropagation();cancelAnimationFrame(timerRef.current);setHotspot(hs);}} style={{position:"absolute",left:hs.x+"%",top:hs.y+"%",zIndex:8,width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.95)",border:"2.5px solid "+s.accent,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transform:"translate(-50%,-50%)",boxShadow:"0 0 0 8px "+s.accent+"30"}}>
              <span style={{fontSize:13,fontWeight:700,color:s.accent}}>+</span>
            </button>
          ))}
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 20px 28px",zIndex:6}}>
            <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
              {slide.hotspots.map((hs,i)=>(
                <div key={i} onClick={e=>{e.stopPropagation();cancelAnimationFrame(timerRef.current);setHotspot(hs);}} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.12)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:20,padding:"5px 10px",cursor:"pointer",zIndex:7}}>
                  <span style={{width:16,height:16,borderRadius:"50%",background:s.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff"}}>+</span>
                  <span style={{fontSize:11,fontWeight:500,color:"#fff"}}>{hs.label}</span>
                  <span style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>{hs.price}</span>
                </div>
              ))}
            </div>
            <div style={{fontSize:22,fontWeight:600,color:"#fff",marginBottom:6,lineHeight:1.3}}>{slide.title}</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.75)",marginBottom:18}}>{slide.sub}</div>
            <button onClick={e=>{e.stopPropagation();goNext();}} style={{width:"100%",background:s.accent,border:"none",borderRadius:14,padding:"13px 0",fontSize:14,fontWeight:600,color:"#fff",cursor:"pointer",position:"relative",zIndex:7}}>
              {storySlide<s.slides.length-1?"Next":activeStory<stories.length-1?"Next story":"Explore partner"}
            </button>
          </div>
        </div>
        {hotspot&&(
          <div onClick={()=>setHotspot(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",zIndex:20,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
            <div onClick={e=>e.stopPropagation()} style={{background:C.surface,borderRadius:"24px 24px 0 0",padding:"6px 20px 32px"}}>
              <div style={{width:40,height:4,borderRadius:999,background:"rgba(255,255,255,0.15)",margin:"10px auto 20px"}}/>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
                <div style={{width:48,height:48,borderRadius:14,background:s.accent+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{slide.img}</div>
                <div><div style={{fontSize:17,fontWeight:600,color:C.t1}}>{hotspot.label}</div><div style={{fontSize:12,color:C.t3}}>{hotspot.partner}</div></div>
              </div>
              <div style={{display:"flex",gap:10,marginBottom:18}}>
                <div style={{flex:1,background:C.card,borderRadius:14,padding:14,border:"1px solid "+C.border,textAlign:"center"}}><div style={{fontSize:10,color:C.t3,marginBottom:4}}>Full price</div><div style={{fontSize:18,fontWeight:600,color:C.t1}}>{hotspot.price}</div></div>
                <div style={{flex:1,background:s.accent+"14",borderRadius:14,padding:14,border:"1px solid "+s.accent+"33",textAlign:"center"}}><div style={{fontSize:10,color:s.accent,marginBottom:4}}>With Resurs</div><div style={{fontSize:18,fontWeight:600,color:s.accent}}>{hotspot.monthly}</div></div>
              </div>
              <button style={{width:"100%",background:s.accent,border:"none",borderRadius:14,padding:14,fontSize:14,fontWeight:600,color:"#fff",cursor:"pointer",marginBottom:10}}>{"Shop now at "+hotspot.partner}</button>
              <button onClick={()=>setHotspot(null)} style={{width:"100%",background:"transparent",border:"none",color:C.t3,fontSize:13,cursor:"pointer"}}>Continue watching</button>
            </div>
          </div>
        )}
      </div>
    );
  }
  if(activeOffer){
    const o=activeOffer;
    return(
      <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none"}}>
        <div style={{background:"linear-gradient(160deg,"+o.color+"44 0%,"+C.bg+" 60%)",padding:"20px 20px 28px"}}>
          <BackBtn onClick={()=>setActiveOffer(null)} style={{marginBottom:20}}/>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
            <div style={{width:70,height:70,borderRadius:"50%",background:o.colorSoft,border:"3px solid "+o.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>{o.icon}</div>
            <Badge label={o.tag} color={o.color} bg={o.colorSoft}/>
            <div style={{fontSize:20,fontWeight:500,color:C.t1,textAlign:"center"}}>{o.title}</div>
          </div>
        </div>
        <div style={{padding:"20px 20px 40px"}}>
          <div style={{background:C.card,borderRadius:16,border:"1px solid "+C.border,padding:16,marginBottom:16}}>
            <div style={{fontSize:22,fontWeight:500,color:o.color,marginBottom:4}}>{o.monthly}</div>
            <div style={{fontSize:13,color:C.t2}}>Interest-free - No hidden fees - Flexible terms</div>
          </div>
          <button style={{width:"100%",background:o.color,border:"none",borderRadius:12,padding:13,fontSize:14,fontWeight:500,color:"#fff",cursor:"pointer",marginBottom:10}}>View offer</button>
          <button onClick={()=>setActiveOffer(null)} style={{width:"100%",background:"transparent",border:"none",color:C.t3,fontSize:13,cursor:"pointer"}}>Back</button>
        </div>
      </div>
    );
  }
  return(
    <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none",background:C.bg}}>
      <div style={{background:"linear-gradient(160deg,rgba(124,111,255,0.15) 0%,transparent 60%)",padding:"20px 20px 0"}}>
        <div style={{fontSize:24,fontWeight:500,color:C.t1,marginBottom:2}}>Partners & Deals</div>
        <div style={{fontSize:13,color:C.t2,marginBottom:16}}>Exclusive offers for the Karlsson family</div>
      </div>
      <div style={{padding:"0 16px 16px"}}>
        <ScrollRow style={{display:"flex",gap:12,paddingBottom:4}}>
          {[{label:"Smart insight",icon:"💡",color:C.accent,isInsight:true},...stories.map((s,idx)=>({label:s.partner,icon:s.slides[0].img,photo:s.slides[0].photo,color:s.accent,idx}))].map((item,i)=>(
            <div key={i} onClick={()=>{if(item.isInsight){setShowInsight(true);setInsightSlide(0);setInsightProgress(0);}else if(item.idx!==undefined){setActiveStory(item.idx);setStorySlide(0);setStoryProgress(0);}}} style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer",width:68}}>
              <div style={{width:60,height:60,borderRadius:"50%",border:"2.5px solid "+item.color,padding:2}}>
                {item.photo
                  ? <img src={item.photo} alt={item.label} style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}}/>
                  : <div style={{width:"100%",height:"100%",borderRadius:"50%",background:"linear-gradient(135deg,"+item.color+"33,"+item.color+"11)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{item.icon}</div>
                }
              </div>
              <div style={{fontSize:10,color:C.t2,textAlign:"center"}}>{item.label}</div>
            </div>
          ))}
        </ScrollRow>
      </div>
      <div style={{padding:"0 16px 20px"}}>
        <div style={{fontSize:16,fontWeight:500,color:C.t1,marginBottom:12}}>Current Offers</div>
        <ScrollRow scrollRef={offersRef} onScroll={onOffersScroll} style={{display:"flex",gap:10,paddingBottom:4,scrollSnapType:"x mandatory"}}>
          {currentOffers.map(o=>(
            <div key={o.id} onClick={()=>setActiveOffer(o)} style={{flexShrink:0,width:180,borderRadius:16,overflow:"hidden",cursor:"pointer",border:"1px solid rgba(255,255,255,0.08)",scrollSnapAlign:"start"}}>
              <div style={{height:110,background:"linear-gradient(160deg,"+o.color+"55 0%,#0a0a14 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,position:"relative",overflow:"hidden"}}>
                {o.photo ? <><img src={o.photo} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/><div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,"+o.color+"88 0%,rgba(10,10,20,0.7) 100%)"}}/></> : o.icon}
                <div style={{position:"absolute",top:8,left:8,background:"rgba(0,0,0,0.5)",borderRadius:6,padding:"2px 7px",zIndex:1}}><span style={{fontSize:10,fontWeight:500,color:o.color}}>{o.tag}</span></div>
              </div>
              <div style={{background:"#16192a",padding:"10px 12px 12px"}}>
                <div style={{fontSize:12,fontWeight:500,color:C.t1,marginBottom:3,lineHeight:1.3}}>{o.title}</div>
                <div style={{fontSize:11,fontWeight:500,color:o.color,marginTop:4}}>{o.monthly}</div>
              </div>
            </div>
          ))}
        </ScrollRow>
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:12,marginTop:10}}>
          <button onClick={()=>{if(offersRef.current) offersRef.current.scrollBy({left:-190,behavior:"smooth"});}} style={{width:32,height:32,borderRadius:"50%",background:C.card,border:"1px solid "+C.border,color:C.t2,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {currentOffers.map((_,i)=>(
              <div key={i} onClick={()=>{if(offersRef.current) offersRef.current.scrollTo({left:i*190,behavior:"smooth"});}} style={{width:activeOfferIdx===i?16:7,height:7,borderRadius:999,background:activeOfferIdx===i?C.accent:"rgba(255,255,255,0.15)",transition:"all 0.3s",cursor:"pointer"}}/>
            ))}
          </div>
          <button onClick={()=>{if(offersRef.current) offersRef.current.scrollBy({left:190,behavior:"smooth"});}} style={{width:32,height:32,borderRadius:"50%",background:C.card,border:"1px solid "+C.border,color:C.t2,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
      <div style={{padding:"0 16px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:16,fontWeight:500,color:C.t1}}>My Memberships</div>
          <button onClick={()=>setShowAdd(true)} style={{background:"none",border:"none",color:C.accent,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:4,padding:0}}>+ Add</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {memberships.map((card,i)=>(
            <div key={i} style={{height:76,borderRadius:14,background:card.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer"}}>
              <div style={{fontSize:22}}>{card.icon}</div>
              <div style={{fontSize:11,fontWeight:600,color:card.textColor}}>{card.name}</div>
              <div style={{fontSize:9,color:card.textColor,opacity:0.7}}>{card.points}</div>
            </div>
          ))}
          <div onClick={()=>setShowAdd(true)} style={{height:76,borderRadius:14,background:C.accentSoft,border:"1.5px dashed rgba(124,111,255,0.4)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,cursor:"pointer"}}>
            <span style={{fontSize:18,lineHeight:1,color:C.accent}}>+</span>
            <span style={{fontSize:10,fontWeight:600,color:C.accent}}>Earn rewards</span>
            <span style={{fontSize:9,color:C.t2}}>Join a partner today</span>
          </div>
        </div>
      </div>
      <div style={{padding:"0 16px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div style={{fontSize:16,fontWeight:500,color:C.t1}}>Recommended for you</div>
          <button onClick={()=>setShowAllRec(true)} style={{background:"none",border:"none",color:C.accent,fontSize:12,cursor:"pointer"}}>View all</button>
        </div>
        <div style={{fontSize:11,color:C.t3,marginBottom:12}}>Based on your spending habits and savings goals</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {recommended.map(r=>(
            <div key={r.id} style={{borderRadius:16,overflow:"hidden",cursor:"pointer",border:"1px solid "+C.border,background:C.card}}>
              <div style={{position:"relative",height:100,overflow:"hidden"}}>
                <img src={r.photo} alt={r.partner} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 20%,rgba(0,0,0,0.75) 100%)"}}/>
                <div style={{position:"absolute",top:8,left:8}}>
                  <div style={{background:r.color,borderRadius:6,padding:"2px 8px",fontSize:9,fontWeight:700,color:"#fff"}}>{r.reason}</div>
                </div>
                <div style={{position:"absolute",bottom:8,left:10,right:10,display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:28,height:28,borderRadius:8,background:"rgba(255,255,255,0.15)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{r.icon}</div>
                  <div style={{fontSize:15,fontWeight:700,color:"#fff",textShadow:"0 1px 3px rgba(0,0,0,0.5)"}}>{r.partner}</div>
                </div>
              </div>
              <div style={{padding:"10px 10px 12px"}}>
                <div style={{fontSize:12,fontWeight:500,color:C.t1,lineHeight:1.3,marginBottom:8}}>{r.title}</div>
                <div style={{background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.25)",borderRadius:8,padding:"4px 8px",display:"inline-flex",alignItems:"center",gap:4}}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  <span style={{fontSize:10,fontWeight:600,color:C.green}}>{r.saving}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"0 16px 28px"}}>
        <div style={{fontSize:16,fontWeight:500,color:C.t1,marginBottom:10}}>Nearby partners</div>
        {nearby.map((p,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<nearby.length-1?"1px solid "+C.border:"none"}}>
            <div style={{width:36,height:36,borderRadius:10,background:p.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{p.icon}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:C.t1}}>{p.name}</div><div style={{fontSize:11,color:C.t3,marginTop:1}}>{p.dist+" away"}</div></div>
            {p.membership?<Badge label="Member" color={C.green} bg={C.greenSoft}/>:<button onClick={()=>setShowAdd(true)} style={{background:C.accentSoft,border:"1px solid rgba(124,111,255,0.3)",borderRadius:8,padding:"5px 10px",fontSize:11,color:C.accent,cursor:"pointer"}}>+ Add</button>}
          </div>
        ))}
      </div>
      {showAllRec&&<div style={{position:"absolute",inset:0,zIndex:50,display:"flex",flexDirection:"column",background:C.bg}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 20px",background:C.surface,borderBottom:"1px solid "+C.border,flexShrink:0}}>
          <BackBtn onClick={()=>setShowAllRec(false)}/>
          <div style={{fontSize:16,fontWeight:500,color:C.t1}}>Recommended for you</div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:16}}>
          <div style={{fontSize:12,color:C.t3,marginBottom:16}}>Based on your spending habits and savings goals</div>
          {recommended.map(r=>(
            <div key={r.id} style={{display:"flex",gap:12,background:C.card,borderRadius:16,border:"1px solid "+C.border,overflow:"hidden",marginBottom:12,cursor:"pointer"}}>
              <div style={{width:100,minHeight:100,position:"relative",flexShrink:0}}>
                <img src={r.photo} alt={r.partner} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,transparent 50%,"+C.card+" 100%)"}}/>
              </div>
              <div style={{flex:1,padding:"12px 14px 12px 0",display:"flex",flexDirection:"column",justifyContent:"center",gap:6}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:16}}>{r.icon}</span>
                  <span style={{fontSize:14,fontWeight:600,color:C.t1}}>{r.partner}</span>
                </div>
                <div style={{fontSize:12,color:C.t1,fontWeight:500,lineHeight:1.3}}>{r.title}</div>
                <div style={{background:r.color+"22",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:600,color:r.color,alignSelf:"flex-start"}}>{r.reason}</div>
                <div style={{display:"inline-flex",alignItems:"center",gap:4}}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  <span style={{fontSize:11,fontWeight:600,color:C.green}}>{r.saving}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>}
    </div>
  );
}

// ── MY RESURS ──────────────────────────────────────────────────────────────────
function MyResursPage() {
  return (
    <div style={{flex:1,overflowY:"auto",padding:"24px 20px 20px"}}>
      <div style={{fontSize:28,fontWeight:500,color:C.t1,marginBottom:4}}>My Resurs</div>
      <div style={{fontSize:14,color:C.t2,marginBottom:24}}>Account & settings</div>
                {[{icon:"👤",label:"Profile",sub:"Anna Karlsson"},{icon:"🔔",label:"Notifications",sub:"2 unread"},{icon:"🔒",label:"Security",sub:"2-factor enabled"},{icon:"📄",label:"Documents",sub:"Statements and agreements"},{icon:"💬",label:"Support",sub:"Chat with us"},{icon:"⚙️",label:"Settings",sub:"App preferences"}].map((item,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:14,background:C.card,borderRadius:14,padding:"14px 16px",marginBottom:10,border:"1px solid "+C.border,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background=C.card}>
          <div style={{width:40,height:40,borderRadius:11,background:"rgba(124,111,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{item.icon}</div>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:C.t1}}>{item.label}</div><div style={{fontSize:12,color:C.t3}}>{item.sub}</div></div>
          <div style={{color:C.t3,fontSize:16}}>{">"}</div>
        </div>
      ))}
    </div>
  );
}

// ── DONUT ─────────────────────────────────────────────────────────────────────
function SavingsCalculator({ members, buffer, childFund, onBack }) {
  const allGoals=[
    {name:"Buffer account",color:"#7C6FFF",saved:buffer.balance,monthly:buffer.monthly,target:null,emoji:"🛟"},
    {name:"Maja's 0–18 fund",color:"#F472B6",saved:childFund.balance,monthly:childFund.monthly,target:null,emoji:"🌱"},
    ...members.map(m=>({name:m.savingsGoal.name,color:m.savingsGoal.color,saved:m.savingsGoal.saved,monthly:m.savingsGoal.monthly,target:m.savingsGoal.target,emoji:m.savingsGoal.emoji}))
  ];
  const totalSaved=allGoals.reduce((s,g)=>s+g.saved,0);
  const totalMonthly=allGoals.reduce((s,g)=>s+g.monthly,0);
  const [months,setMonths]=useState(12);
  const [selIdx,setSelIdx]=useState(null);
  const [rate,setRate]=useState(2);
  const [extraMonthly,setExtraMonthly]=useState(0);
  const scenarios=[
    {label:"Current",monthly:totalMonthly,color:"#34D399",active:true},
    ...(extraMonthly>0?[{label:fmt(totalMonthly+extraMonthly)+" kr/mo",monthly:totalMonthly+extraMonthly,color:"#7C6FFF",active:true}]:[]),
  ];
  const calcPts=(mo)=>{const arr=[];for(let i=0;i<=months;i++){let tot=totalSaved;const r=rate/100/12;for(let m=0;m<i;m++){tot+=mo;tot*=(1+r);}arr.push(tot);}return arr;};
  const pts=calcPts(totalMonthly);
  const ptsExtra=extraMonthly>0?calcPts(totalMonthly+extraMonthly):null;
  const projectedTotal=pts[pts.length-1];
  const projectedExtra=ptsExtra?ptsExtra[ptsExtra.length-1]:null;
  const growth=projectedTotal-totalSaved;
  const interestEarned=projectedTotal-totalSaved-totalMonthly*months;
  const allMax=Math.max(...pts,...(ptsExtra||[0]));
  const maxVal=allMax;
  const chartW=320,chartH=200,padL=50,padR=10,padT=16,padB=28;
  const drawW=chartW-padL-padR,drawH=chartH-padT-padB;
  const mkPath=(arr)=>{const pp=arr.map((v,i)=>({x:padL+(i/months)*drawW,y:padT+drawH-(v/maxVal)*drawH}));const line=pp.map((p,i)=>(i===0?"M":"L")+p.x.toFixed(1)+","+p.y.toFixed(1)).join(" ");const area=line+" L"+pp[pp.length-1].x.toFixed(1)+","+(padT+drawH)+" L"+padL+","+(padT+drawH)+" Z";return{pp,line,area};};
  const main=mkPath(pts);
  const extra=ptsExtra?mkPath(ptsExtra):null;
  const ticks=[0,Math.round(maxVal/3),Math.round(maxVal*2/3),Math.round(maxVal)];
  const goalBreakdown=allGoals.map((g,gi)=>{const mo=g.monthly+(extraMonthly>0?Math.round(extraMonthly*(g.monthly/totalMonthly)):0);let bal=g.saved;for(let m=0;m<months;m++){bal+=mo;bal*=(1+rate/100/12);}return{...g,monthly:mo,projected:Math.round(bal),growth:Math.round(bal-g.saved),interest:Math.round(bal-g.saved-mo*months)};});
  const timeOptions=[{label:"6 mo",val:6},{label:"1 yr",val:12},{label:"2 yr",val:24},{label:"5 yr",val:60},{label:"10 yr",val:120}];
  const extraSteps=[0,200,500,1000,2000,5000];
  return (
    <div style={{background:C.bg,minHeight:"100%",color:C.t1}}>
      <div style={{background:"linear-gradient(160deg,rgba(52,211,153,0.12) 0%,"+C.bg+" 60%)",padding:"20px 20px 24px",borderBottom:"1px solid "+C.border}}>
        <div style={{fontSize:20,fontWeight:500,marginBottom:4}}>Savings Calculator</div>
        <div style={{fontSize:12,color:C.t3}}>See how your family savings grow over time</div>
      </div>
      <div style={{padding:"20px 20px 40px"}}>
        <div style={{background:C.card,borderRadius:18,border:"1px solid "+C.border,padding:"18px 20px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div>
              <div style={{fontSize:11,color:C.t3,marginBottom:4}}>Current savings</div>
              <div style={{fontSize:28,fontWeight:500,color:C.t1}}>{fmt(totalSaved)+" kr"}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:C.t3,marginBottom:4}}>Monthly contributions</div>
              <div style={{fontSize:18,fontWeight:500,color:C.green}}>{"+ "+fmt(totalMonthly)+" kr"}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            {timeOptions.map(t=>(
              <button key={t.val} onClick={()=>setMonths(t.val)} style={{flex:1,background:months===t.val?C.accent:"rgba(255,255,255,0.06)",border:months===t.val?"none":"1px solid "+C.border,borderRadius:10,padding:"7px 0",fontSize:11,fontWeight:months===t.val?600:400,color:months===t.val?"#fff":C.t2,cursor:"pointer"}}>{t.label}</button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{fontSize:11,color:C.t3,flexShrink:0}}>Interest rate</div>
            <input type="range" min="0" max="8" step="0.5" value={rate} onChange={e=>setRate(Number(e.target.value))} style={{flex:1,accentColor:C.green}}/>
            <div style={{fontSize:13,fontWeight:600,color:C.green,minWidth:36,textAlign:"right"}}>{rate+"%"}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{fontSize:11,color:C.t3,flexShrink:0}}>Extra / month</div>
            <input type="range" min="0" max="5000" step="100" value={extraMonthly} onChange={e=>setExtraMonthly(Number(e.target.value))} style={{flex:1,accentColor:"#7C6FFF"}}/>
            <div style={{fontSize:13,fontWeight:600,color:extraMonthly>0?"#7C6FFF":C.t3,minWidth:60,textAlign:"right"}}>{extraMonthly>0?"+"+fmt(extraMonthly)+" kr":"0 kr"}</div>
          </div>
          <svg width="100%" viewBox={"0 0 "+chartW+" "+chartH} style={{display:"block"}}>
            {ticks.map((t,i)=>{const y=padT+drawH-(t/maxVal)*drawH;return <g key={i}><line x1={padL} y1={y} x2={chartW-padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/><text x={padL-6} y={y+3} textAnchor="end" fill={C.t3} fontSize="8">{t>=1000?Math.round(t/1000)+"k":t}</text></g>;})}
            <defs>
              <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34D399" stopOpacity="0.25"/><stop offset="100%" stopColor="#34D399" stopOpacity="0.02"/></linearGradient>
              <linearGradient id="savGradExtra" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C6FFF" stopOpacity="0.2"/><stop offset="100%" stopColor="#7C6FFF" stopOpacity="0.02"/></linearGradient>
            </defs>
            {extra&&<><path d={extra.area} fill="url(#savGradExtra)"/><path d={extra.line} fill="none" stroke="#7C6FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 3"/>{extra.pp.filter((_,i)=>i===months).map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="4" fill="#7C6FFF" stroke={C.bg} strokeWidth="2"/>)}</>}
            <path d={main.area} fill="url(#savGrad)"/>
            <path d={main.line} fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            {main.pp.filter((_,i)=>i===0||i===months).map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="4" fill="#34D399" stroke={C.bg} strokeWidth="2"/>)}
            <line x1={padL} y1={padT+(drawH-(totalSaved/maxVal)*drawH)} x2={chartW-padR} y2={padT+(drawH-(totalSaved/maxVal)*drawH)} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 3"/>
            <text x={padL+4} y={padT+(drawH-(totalSaved/maxVal)*drawH)-5} textAnchor="start" fill={C.t3} fontSize="7">{"Today "+fmt(totalSaved)+" kr"}</text>
            {[0,Math.round(months/2),months].map(i=>{const x=padL+(i/months)*drawW;return <text key={i} x={x} y={chartH-4} textAnchor="middle" fill={C.t3} fontSize="8">{i===0?"Now":i>=12?(i/12)+(i%12===0?" yr":" yr"):i+" mo"}</text>;})}
          </svg>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12,padding:"10px 0",borderTop:"1px solid "+C.border}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:12,height:3,borderRadius:2,background:"#34D399"}}/>
              <span style={{fontSize:11,color:C.t2}}>{fmt(totalMonthly)+" kr/mo"}</span>
            </div>
            <div style={{fontSize:15,fontWeight:600,color:"#34D399"}}>{fmt(Math.round(projectedTotal))+" kr"}</div>
          </div>
          {extra&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderTop:"1px solid "+C.border}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:12,height:3,borderRadius:2,background:"#7C6FFF",borderTop:"1px dashed #7C6FFF"}}/>
              <span style={{fontSize:11,color:C.t2}}>{fmt(totalMonthly+extraMonthly)+" kr/mo"}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:15,fontWeight:600,color:"#7C6FFF"}}>{fmt(Math.round(projectedExtra))+" kr"}</span>
              <span style={{fontSize:11,fontWeight:600,color:C.green,background:C.greenSoft,borderRadius:6,padding:"1px 6px"}}>{"+"+fmt(Math.round(projectedExtra-projectedTotal))}</span>
            </div>
          </div>}
        </div>

        {extra&&<div style={{background:"linear-gradient(135deg,rgba(124,111,255,0.12),rgba(52,211,153,0.08))",border:"1px solid rgba(124,111,255,0.3)",borderRadius:16,padding:"16px 18px",marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:600,color:C.t1,marginBottom:10}}>{"Saving "+fmt(extraMonthly)+" kr more per month"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><div style={{fontSize:10,color:C.t3,marginBottom:2}}>Extra total</div><div style={{fontSize:16,fontWeight:600,color:"#7C6FFF"}}>{"+"+fmt(Math.round(projectedExtra-projectedTotal))+" kr"}</div></div>
            <div><div style={{fontSize:10,color:C.t3,marginBottom:2}}>New projected</div><div style={{fontSize:16,fontWeight:600,color:C.green}}>{fmt(Math.round(projectedExtra))+" kr"}</div></div>
            <div><div style={{fontSize:10,color:C.t3,marginBottom:2}}>Extra interest</div><div style={{fontSize:16,fontWeight:600,color:C.amber}}>{"+"+fmt(Math.max(0,Math.round((projectedExtra-totalSaved-(totalMonthly+extraMonthly)*months)-(interestEarned))))+" kr"}</div></div>
            <div><div style={{fontSize:10,color:C.t3,marginBottom:2}}>Total vs current</div><div style={{fontSize:16,fontWeight:600,color:C.t1}}>{Math.round((projectedExtra/projectedTotal-1)*100)+"% more"}</div></div>
          </div>
        </div>}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
          <div style={{background:C.card,borderRadius:14,border:"1px solid "+C.border,padding:"14px 12px",textAlign:"center"}}>
            <div style={{fontSize:10,color:C.t3,marginBottom:4}}>Projected total</div>
            <div style={{fontSize:16,fontWeight:600,color:C.green}}>{fmt(Math.round(projectedTotal))}</div>
            <div style={{fontSize:10,color:C.t3}}>kr</div>
          </div>
          <div style={{background:C.card,borderRadius:14,border:"1px solid "+C.border,padding:"14px 12px",textAlign:"center"}}>
            <div style={{fontSize:10,color:C.t3,marginBottom:4}}>Total growth</div>
            <div style={{fontSize:16,fontWeight:600,color:C.accent}}>{"+"+fmt(Math.round(growth))}</div>
            <div style={{fontSize:10,color:C.t3}}>kr</div>
          </div>
          <div style={{background:C.card,borderRadius:14,border:"1px solid "+C.border,padding:"14px 12px",textAlign:"center"}}>
            <div style={{fontSize:10,color:C.t3,marginBottom:4}}>Interest earned</div>
            <div style={{fontSize:16,fontWeight:600,color:C.amber}}>{"+"+fmt(Math.max(0,Math.round(interestEarned)))}</div>
            <div style={{fontSize:10,color:C.t3}}>kr</div>
          </div>
        </div>

        <div style={{background:C.card,borderRadius:18,border:"1px solid "+C.border,padding:"18px 20px",marginBottom:16}}>
          <div style={{fontSize:14,fontWeight:500,color:C.t1,marginBottom:16}}>Goal breakdown</div>
          {goalBreakdown.map((g,i)=>{const pctGrowth=g.saved>0?Math.round((g.projected/g.saved-1)*100):0;return(
            <div key={i} onClick={()=>setSelIdx(selIdx===i?null:i)} style={{marginBottom:i<goalBreakdown.length-1?16:0,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:g.color+"22",border:"2px solid "+g.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{g.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:C.t1}}>{g.name}</div>
                  <div style={{fontSize:11,color:C.t3}}>{fmt(g.saved)+" kr now"}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:14,fontWeight:600,color:g.color}}>{fmt(g.projected)+" kr"}</div>
                  <div style={{fontSize:10,color:C.green}}>{"+ "+pctGrowth+"%"}</div>
                </div>
              </div>
              {selIdx===i&&<div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"10px 12px",marginTop:4}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.t2,marginBottom:6}}><span>Monthly deposit</span><span style={{color:C.t1,fontWeight:500}}>{fmt(g.monthly)+" kr"}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.t2,marginBottom:6}}><span>Contributions ({months} mo)</span><span style={{color:C.t1,fontWeight:500}}>{fmt(g.monthly*months)+" kr"}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.t2,marginBottom:6}}><span>Interest earned</span><span style={{color:C.amber,fontWeight:500}}>{"+"+fmt(Math.max(0,g.interest))+" kr"}</span></div>
                {g.target&&<div style={{marginTop:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.t2,marginBottom:4}}><span>Goal progress</span><span style={{color:g.color,fontWeight:500}}>{Math.min(100,Math.round((g.projected/g.target)*100))+"%"}</span></div>
                  <Bar value={Math.min(g.projected,g.target)} max={g.target} color={g.color}/>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.t3,marginTop:3}}><span>{fmt(g.projected)+" kr"}</span><span>{fmt(g.target)+" kr"}</span></div>
                  {g.projected>=g.target&&<div style={{marginTop:6,background:C.greenSoft,border:"1px solid "+C.green+"44",borderRadius:8,padding:"4px 10px",fontSize:11,color:C.green,fontWeight:500,textAlign:"center"}}>{"🎉 Goal reached in "+months+" months!"}</div>}
                  {g.projected<g.target&&<div style={{marginTop:6,fontSize:10,color:C.t3,textAlign:"center"}}>{"~"+Math.ceil((g.target-g.saved)/g.monthly)+" months to reach goal"}</div>}
                </div>}
              </div>}
              {i<goalBreakdown.length-1&&<div style={{borderBottom:"1px solid "+C.border,marginTop:12}}/>}
            </div>
          );})}
        </div>

        <div style={{background:C.card,borderRadius:18,border:"1px solid "+C.border,padding:"18px 20px"}}>
          <div style={{fontSize:14,fontWeight:500,color:C.t1,marginBottom:12}}>Savings distribution</div>
          <div style={{position:"relative",width:160,height:160,margin:"0 auto 16px"}}>
            <svg width="160" height="160" viewBox="0 0 160 160" style={{transform:"rotate(-90deg)"}}>
              <circle cx="80" cy="80" r="58" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="22"/>
              {(()=>{const circ=2*Math.PI*58;let cum=0;const tot=goalBreakdown.reduce((s,g)=>s+g.projected,0);return goalBreakdown.map((g,i)=>{const frac=g.projected/tot,dash=frac*circ,offset=circ-cum*circ;cum+=frac;return <circle key={i} cx="80" cy="80" r="58" fill="none" stroke={g.color} strokeWidth={selIdx===i?28:22} strokeDasharray={dash+" "+(circ-dash)} strokeDashoffset={offset} strokeLinecap="butt" style={{cursor:"pointer",opacity:selIdx!==null&&selIdx!==i?0.4:1,transition:"all 0.15s"}} onClick={()=>setSelIdx(selIdx===i?null:i)}/>;});})()}
            </svg>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none"}}>
              <div style={{fontSize:10,color:C.t3,marginBottom:2}}>Projected</div>
              <div style={{fontSize:15,fontWeight:500,color:C.t1}}>{fmt(Math.round(projectedTotal))}</div>
              <div style={{fontSize:11,color:C.t2}}>kr</div>
            </div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center"}}>
            {goalBreakdown.map((g,i)=>{const tot=goalBreakdown.reduce((s,gg)=>s+gg.projected,0);return(
              <div key={i} onClick={()=>setSelIdx(selIdx===i?null:i)} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",opacity:selIdx!==null&&selIdx!==i?0.45:1}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:g.color}}/><span style={{fontSize:10,color:C.t2}}>{g.name}</span><span style={{fontSize:10,fontWeight:500,color:C.t1}}>{Math.round(g.projected/tot*100)+"%"}</span>
              </div>
            );})}
          </div>
        </div>
      </div>
    </div>
  );
}

function DonutChart({ categories, total, onSliceClick, activeIdx }) {
  const size=160,cx=80,cy=80,r=58,stroke=22,circ=2*Math.PI*r;
  let cum=0;
  const slices=categories.map((cat,i)=>{const frac=cat.amount/total,dash=frac*circ,offset=circ-cum*circ;cum+=frac;return {...cat,dash,offset,i};});
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} viewBox="0 0 160 160" style={{transform:"rotate(-90deg)"}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}/>
        {slices.map((s,i)=><circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={activeIdx===i?stroke+6:stroke} strokeDasharray={s.dash+" "+(circ-s.dash)} strokeDashoffset={s.offset} strokeLinecap="butt" style={{cursor:"pointer",opacity:activeIdx!==null&&activeIdx!==i?0.4:1,transition:"all 0.15s"}} onClick={()=>onSliceClick(i)}/>)}
      </svg>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none"}}>
        <div style={{fontSize:10,color:C.t3,marginBottom:2}}>Total</div>
        <div style={{fontSize:15,fontWeight:500,color:C.t1}}>{fmt(total)}</div>
        <div style={{fontSize:11,color:C.t2}}>kr</div>
      </div>
    </div>
  );
}

function ExpenseReport({ onBack }) {
  const months=Object.keys(EXPENSE_DATA);
  const [selMonth,setSelMonth]=useState(months[0]);
  const [selCat,setSelCat]=useState(null);
  const [activeIdx,setActiveIdx]=useState(null);
  const data=EXPENSE_DATA[selMonth];
  const maxTotal=Math.max(...Object.values(EXPENSE_DATA).map(d=>d.total));
  const handleSlice=i=>{setActiveIdx(i);setTimeout(()=>setSelCat(data.categories[i]),180);};
  if(selCat){
    const txs=CATEGORY_TXS[selCat.name]||[];
    return (
      <div style={{background:C.bg,minHeight:"100%",color:C.t1}}>
        <div style={{background:"linear-gradient(160deg,"+selCat.color+"33 0%,"+C.bg+" 60%)",padding:"20px 20px 28px"}}>
          <BackBtn onClick={()=>{setSelCat(null);setActiveIdx(null);}} style={{marginBottom:20}}/>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
            <div style={{width:70,height:70,borderRadius:"50%",background:selCat.color+"22",border:"3px solid "+selCat.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>{selCat.icon}</div>
            <div style={{fontSize:22,fontWeight:500}}>{selCat.name}</div>
          </div>
        </div>
        <div style={{padding:"20px 20px 40px"}}>
          <div style={{background:C.card,borderRadius:16,border:"1px solid "+C.border,overflow:"hidden"}}>
            {txs.map((tx,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:i<txs.length-1?"1px solid "+C.border:"none"}}>
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:C.t1}}>{tx.merchant}</div>              <div style={{fontSize:11,color:C.t3}}>{tx.member+" - "+tx.date}</div></div>
                <div style={{fontSize:14,fontWeight:500,color:C.red}}>{tx.amount.toLocaleString("sv-SE")+" kr"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{background:C.bg,minHeight:"100%",color:C.t1}}>
      <div style={{background:C.surface,padding:"20px 20px 24px",borderBottom:"1px solid "+C.border}}>
        <div style={{fontSize:20,fontWeight:500}}>Expense Wheel</div>
      </div>
      <div style={{padding:"20px 20px 40px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,background:C.card,borderRadius:12,border:"1px solid "+C.border,padding:"10px 16px"}}>
          <button onClick={()=>{const i=months.indexOf(selMonth);if(i<months.length-1)setSelMonth(months[i+1]);}} style={{background:"none",border:"none",color:C.t1,fontSize:18,cursor:"pointer",padding:"0 4px"}}>‹</button>
          <span style={{fontSize:14,fontWeight:500,color:C.t1}}>{selMonth}</span>
          <button onClick={()=>{const i=months.indexOf(selMonth);if(i>0)setSelMonth(months[i-1]);}} style={{background:"none",border:"none",color:C.t1,fontSize:18,cursor:"pointer",padding:"0 4px"}}>›</button>
        </div>
        <div style={{background:C.card,borderRadius:18,border:"1px solid "+C.border,padding:20,marginBottom:16,display:"flex",alignItems:"center",gap:20}}>
          <DonutChart categories={data.categories} total={data.total} onSliceClick={handleSlice} activeIdx={activeIdx}/>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
            {data.categories.map((cat,i)=>(
              <div key={i} onClick={()=>handleSlice(i)} onMouseEnter={()=>setActiveIdx(i)} onMouseLeave={()=>setActiveIdx(null)} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",opacity:activeIdx!==null&&activeIdx!==i?0.45:1}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:cat.color,flexShrink:0}}/><span style={{fontSize:11,color:C.t2,flex:1}}>{cat.name}</span><span style={{fontSize:11,fontWeight:500,color:C.t1}}>{fmt(cat.amount)}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:C.card,borderRadius:18,border:"1px solid "+C.border,padding:"18px 20px"}}>
          <div style={{fontSize:11,color:C.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>3-month trend</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:12,height:110}}>
            {Object.entries(EXPENSE_DATA).map(([month,d])=>{const barH=Math.round((d.total/maxTotal)*80),active=month===selMonth;return(
              <div key={month} onClick={()=>setSelMonth(month)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer"}}>
                <div style={{fontSize:11,color:active?C.accent:C.t3}}>{fmt(d.total)}</div>
                <div style={{width:"100%",height:barH,borderRadius:"6px 6px 0 0",background:active?C.accent:"rgba(124,111,255,0.25)"}}/>
                <div style={{fontSize:11,color:active?C.accent:C.t3}}>{month.split(" ")[0]}</div>
              </div>
            );})}
          </div>
        </div>
      </div>
    </div>
  );
}

function ManageLimits({ members, totalCredit, onBack }) {
  const [limits,setLimits]=useState(()=>{
    const init=members.reduce((acc,m)=>({...acc,[m.id]:m.spendLimit}),{});
    const sum=Object.values(init).reduce((a:number,b:number)=>a+b,0);
    if(sum!==totalCredit){const ratio=totalCredit/sum;const fixed={};let running=0;members.forEach((m,i)=>{if(i===members.length-1){fixed[m.id]=totalCredit-running;}else{const v=Math.round(init[m.id]*ratio/500)*500;fixed[m.id]=v;running+=v;}});return fixed;}
    return init;
  });
  const [locked,setLocked]=useState(()=>members.reduce((acc,m)=>({...acc,[m.id]:false}),{}));
  const [saved,setSaved]=useState(false);
  const totalAssigned=Object.values(limits).reduce((a:number,b:number)=>a+b,0);
  const upd=(id,val)=>{
    const others=members.filter(m=>m.id!==id&&!locked[m.id]);
    if(!others.length)return;
    const lockedSum=members.filter(m=>m.id!==id&&locked[m.id]).reduce((s,m)=>s+limits[m.id],0);
    const maxForThis=totalCredit-lockedSum;
    const c=Math.round(Math.min(maxForThis,Math.max(0,val))/500)*500;
    const rem=totalCredit-c-lockedSum;
    const oT=others.reduce((s,m)=>s+limits[m.id],0);
    const next={...limits,[id]:c};
    if(oT===0){let running=0;others.forEach((m,i)=>{if(i===others.length-1){next[m.id]=rem-running;}else{const v=Math.round((rem/others.length)/500)*500;next[m.id]=v;running+=v;}});}
    else{let running=0;others.forEach((m,i)=>{if(i===others.length-1){next[m.id]=rem-running;}else{const v=Math.round((limits[m.id]/oT*rem)/500)*500;next[m.id]=Math.max(0,v);running+=next[m.id];}});}
    setSplitLimits(next);
  };
  const setSplitLimits=(next)=>{setLimits(next);setSaved(false);};
  return (
    <div style={{background:C.bg,minHeight:"100%",color:C.t1}}>
      <div style={{background:C.surface,padding:"20px 20px 24px",borderBottom:"1px solid "+C.border}}>
        <div style={{fontSize:20,fontWeight:500}}>Manage limits</div>
      </div>
      <div style={{padding:"20px 20px 40px"}}>
        <div style={{background:C.card,borderRadius:18,border:"1px solid "+C.border,padding:"18px 20px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:28,fontWeight:500,color:C.t1}}>{fmt(totalCredit)+" kr"}</div>
            <div style={{fontSize:13,fontWeight:600,color:totalAssigned===totalCredit?C.green:C.amber}}>{fmt(totalAssigned)+" / "+fmt(totalCredit)}{totalAssigned===totalCredit?" ✓":""}</div>
          </div>
          <div style={{display:"flex",height:8,borderRadius:999,overflow:"hidden",marginBottom:10}}>
            {members.map(m=><div key={m.id} style={{width:Math.round((limits[m.id]/totalCredit)*100)+"%",background:m.color,transition:"width 0.3s"}}/>)}
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:6}}>{members.map(m=><div key={m.id} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.t3}}><div style={{width:8,height:8,borderRadius:"50%",background:m.color}}/>{m.name.split(" ")[0]+" "+Math.round(limits[m.id]/totalCredit*100)+"%"}</div>)}</div>
        </div>
        <div style={{background:C.card,borderRadius:18,border:"1px solid "+C.border,padding:"18px 20px",marginBottom:16}}>
          {members.map((m,i)=>{const pct=limits[m.id]>0?Math.round((m.spendMonth/limits[m.id])*100):0;return(
            <div key={m.id} style={{marginBottom:i<members.length-1?24:0}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <Avatar m={m} size={36}/>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:C.t1}}>{m.name}</div><div style={{fontSize:11,color:C.t3}}>{pct+"% used"}</div></div>
                <div style={{fontSize:18,fontWeight:500,color:m.color}}>{fmt(limits[m.id])+" kr"}</div>
                <button onClick={()=>{setLocked(l=>({...l,[m.id]:!l[m.id]}));}} style={{background:locked[m.id]?"rgba(251,191,36,0.15)":"rgba(255,255,255,0.05)",border:"1px solid "+(locked[m.id]?C.amber+"55":C.border),borderRadius:8,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                  <LockIcon locked={locked[m.id]}/>
                </button>
              </div>
              <input type="range" min="0" max={totalCredit} step="500" value={limits[m.id]} onChange={e=>{if(!locked[m.id])upd(m.id,Number(e.target.value));}} disabled={locked[m.id]} style={{width:"100%",accentColor:m.color,opacity:locked[m.id]?0.4:1}}/>
            </div>
          );})}
        </div>
        <button onClick={()=>setSaved(true)} style={{width:"100%",background:saved?C.greenSoft:C.accent,border:saved?"1px solid "+C.green+"55":"none",borderRadius:12,padding:14,fontSize:14,fontWeight:500,color:saved?C.green:"#fff",cursor:"pointer"}}>{saved?"Limits saved":"Save limits"}</button>
      </div>
    </div>
  );
}

function AutoSaveSettings({ members, buffer, childFund, onBack }) {
  const bufEntry={id:"buffer",name:"Buffer account",color:"#7C6FFF",colorSoft:"rgba(124,111,255,0.18)",role:"buffer"};
  const cgEntry={id:"cg",name:"Maja's 0-18 fund",color:"#F472B6",colorSoft:"rgba(244,114,182,0.18)",role:"cg"};
  const allT=[bufEntry,cgEntry,...members];
  const [pct,setPct]=useState(5);
  const [saved,setSaved]=useState(false);
  const [splits,setSplits]=useState(()=>{const eq=Math.floor(100/allT.length),rem=100-eq*allT.length;return allT.reduce((acc,m,i)=>({...acc,[m.id]:eq+(i===0?rem:0)}),{});});
  const [locked,setLocked]=useState(()=>allT.reduce((acc,m)=>({...acc,[m.id]:false}),{}));
  const total=Object.values(splits).reduce((a,b)=>a+b,0);
  const upd=(id,val)=>{
    const others=allT.filter(m=>m.id!==id&&!locked[m.id]);
    if(!others.length)return;
    const lT=allT.filter(m=>m.id!==id&&locked[m.id]).reduce((s,m)=>s+splits[m.id],0);
    const maxVal=100-lT;
    const c=Math.min(maxVal,Math.max(0,val)),rem=Math.max(0,100-c-lT),oT=others.reduce((s,m)=>s+splits[m.id],0),next={...splits,[id]:c};
    if(oT===0){const each=Math.floor(rem/others.length);others.forEach((m,i)=>{next[m.id]=each+(i===0?rem-each*others.length:0);});}
    else{others.forEach(m=>{next[m.id]=Math.round((splits[m.id]/oT)*rem);});}
    const diff=100-Object.values(next).reduce((a,b)=>a+b,0);
    if(diff!==0){const adj=others.sort((a,b)=>next[b.id]-next[a.id]);adj[0]&&(next[adj[0].id]+=diff);}
    setSplits(next);setSaved(false);
  };
  const recentTxs=[{merchant:"ICA Maxi",amount:642,icon:"🛒"},{merchant:"Steam",amount:399,icon:"🎮"},{merchant:"H&M Online",amount:1190,icon:"🛍"}];
  return (
    <div style={{background:C.bg,minHeight:"100%",color:C.t1}}>
      <div style={{background:C.surface,padding:"20px 20px 24px",borderBottom:"1px solid "+C.border}}>
        <div style={{fontSize:20,fontWeight:500}}>Auto-save settings</div>
      </div>
      <div style={{padding:"20px 20px 40px"}}>
        <div style={{background:C.accentSoft,border:"1px solid rgba(124,111,255,0.25)",borderRadius:14,padding:"12px 14px",marginBottom:16}}>
          <div style={{fontSize:13,color:C.t2,lineHeight:1.6}}>Every time a purchase is made, a percentage of the amount is automatically saved and split across your savings goals according to the distribution you set below.</div>
        </div>
        <div style={{background:C.card,borderRadius:18,border:"1px solid "+C.border,padding:"18px 20px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:2}}>
            <div style={{fontSize:36,fontWeight:500,color:C.accent}}>{pct+"%"}</div>
            <div style={{fontSize:12,color:C.t3,marginBottom:6}}>per purchase</div>
          </div>
          <input type="range" min="1" max="20" step="1" value={pct} onChange={e=>{setPct(Number(e.target.value));setSaved(false);}} style={{width:"100%",accentColor:C.accent,marginBottom:16}}/>
          <div style={{fontSize:11,fontWeight:500,color:C.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Recent purchases</div>
          {recentTxs.map((tx,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<recentTxs.length-1?"1px solid "+C.border:"none"}}>
              <div style={{width:32,height:32,borderRadius:9,background:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{tx.icon}</div>
              <div style={{flex:1}}><div style={{fontSize:13,color:C.t1}}>{tx.merchant}</div><div style={{fontSize:11,color:C.t3}}>{tx.amount+" kr"}</div></div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,fontWeight:500,color:C.green}}>{"+"+String(Math.round(tx.amount*pct/100))+" kr"}</div>
                <div style={{fontSize:10,color:C.t3}}>saved</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:C.card,borderRadius:18,border:"1px solid "+C.border,padding:"18px 20px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:500,color:C.t1}}>Split between goals</div>
            <div style={{fontSize:13,fontWeight:600,color:total===100?C.green:C.amber}}>{total+"%"}{total===100?" ✓":""}</div>
          </div>
          <div style={{display:"flex",height:10,borderRadius:999,overflow:"hidden",marginBottom:18}}>{allT.map(m=><div key={m.id} style={{width:splits[m.id]+"%",background:m.color,transition:"width 0.2s"}}/>)}</div>
          {allT.map(m=>(
            <div key={m.id} style={{marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                {m.id==="buffer"
                  ? <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(124,111,255,0.2)",border:"2px solid #7C6FFF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🛟</div>
                  : m.id==="cg"
                  ? <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(244,114,182,0.2)",border:"2px solid #F472B6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🌱</div>
                  : <Avatar m={m} size={32}/>
                }
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:C.t1}}>{m.name}</div></div>
                <div style={{fontSize:18,fontWeight:500,color:m.color,marginRight:8}}>{splits[m.id]+"%"}</div>
                <button onClick={()=>{setLocked(l=>({...l,[m.id]:!l[m.id]}));setSaved(false);}} style={{background:locked[m.id]?"rgba(251,191,36,0.15)":"rgba(255,255,255,0.05)",border:"1px solid "+(locked[m.id]?C.amber+"55":C.border),borderRadius:8,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                  <LockIcon locked={locked[m.id]}/>
                </button>
              </div>
              <input type="range" min="0" max="100" step="1" value={splits[m.id]} onChange={e=>{if(!locked[m.id])upd(m.id,Number(e.target.value));}} disabled={locked[m.id]} style={{width:"100%",accentColor:m.color,opacity:locked[m.id]?0.4:1}}/>
            </div>
          ))}
          {total!==100&&<div style={{background:C.amberSoft,border:"1px solid "+C.amber+"44",borderRadius:10,padding:"8px 12px",fontSize:12,color:C.amber}}>{"Total is "+total+"% — adjust to reach 100%"}</div>}
        </div>
        <button onClick={()=>{if(total===100)setSaved(true);}} disabled={total!==100} style={{width:"100%",background:saved?C.greenSoft:total!==100?"rgba(255,255,255,0.08)":C.accent,border:saved?"1px solid "+C.green+"55":"none",borderRadius:12,padding:14,fontSize:14,fontWeight:500,color:saved?C.green:total!==100?C.t3:"#fff",cursor:total===100?"pointer":"not-allowed",opacity:total!==100?0.6:1}}>{saved?"Saved":total!==100?"Total must be 100% (now "+total+"%)":"Save settings"}</button>
      </div>
    </div>
  );
}

function ChildFund({ members, fund, onBack, onDeposit }) {
  const adults=members.filter(m=>fund.members.includes(m.id));
  const maja=members.find(m=>m.role==="Child");
  const ageNow=new Date().getFullYear()-fund.startYear;
  const yearsLeft=fund.endYear-new Date().getFullYear();
  const [tab,setTab]=useState("overview");
  const [showDep,setShowDep]=useState(false);
  const [amt,setAmt]=useState("");
  const [depM,setDepM]=useState(adults[0]?.id);
  const handleDep=()=>{const a=parseInt(amt,10);if(!a||a<=0)return;onDeposit(a);setAmt("");setShowDep(false);};
  return (
    <div style={{background:C.bg,minHeight:"100%",color:C.t1}}>
      <div style={{position:"relative",overflow:"hidden"}}>
        <div style={{height:180,position:"relative"}}>
          <img src={(maja?.photo||"").replace(/w=\d+&h=\d+/,"w=800&h=400")} alt="Maja" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(13,15,26,0.3) 0%,rgba(13,15,26,0.95) 100%)"}}/>
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 20px 20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <span style={{fontSize:28}}>🌱</span>
            <div style={{fontSize:22,fontWeight:600,color:C.t1}}>{"Maja's 0–18 fund"}</div>
          </div>
          <div style={{fontSize:11,color:C.t3}}>{"Long-term savings - Age "+ageNow+" of 18"}</div>
        </div>
      </div>
      <div style={{padding:"0 20px 40px"}}>
        <div style={{background:C.card,borderRadius:18,border:"1px solid "+C.border,padding:"18px 20px",marginBottom:16}}>
          <div style={{fontSize:32,fontWeight:500}}>{fmt(fund.balance)+" "}<span style={{fontSize:14,color:C.t2}}>kr</span></div>
          <div style={{fontSize:12,color:C.t2,marginTop:4}}>{"+"+fmt(fund.monthly)+" kr / month"}</div>
          <div style={{display:"flex",gap:10,marginTop:16}}>
            <button onClick={()=>setShowDep(v=>!v)} style={{flex:1,background:"rgba(244,114,182,0.15)",border:"1px solid rgba(244,114,182,0.35)",borderRadius:12,padding:"11px 0",fontSize:14,fontWeight:500,color:"#F472B6",cursor:"pointer"}}>+ Deposit</button>
            <button style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid "+C.border,borderRadius:12,padding:"11px 0",fontSize:14,fontWeight:500,color:C.t2,cursor:"pointer"}}>Statement</button>
          </div>
          {showDep&&(<div style={{marginTop:12}}><div style={{display:"flex",gap:8,marginBottom:8}}>{adults.map(m=><button key={m.id} onClick={()=>setDepM(m.id)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:depM===m.id?"rgba(244,114,182,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(depM===m.id?"rgba(244,114,182,0.4)":C.border),borderRadius:10,padding:"8px 0",cursor:"pointer"}}><Avatar m={m} size={20}/><span style={{fontSize:12,color:depM===m.id?"#F472B6":C.t2}}>{m.name}</span></button>)}</div><div style={{display:"flex",gap:8}}><input value={amt} onChange={e=>setAmt(e.target.value)} placeholder="Amount (kr)" type="number" style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid "+C.border,borderRadius:10,padding:"9px 12px",fontSize:14,color:C.t1,outline:"none"}}/><button onClick={handleDep} style={{background:"#F472B6",border:"none",borderRadius:10,padding:"9px 16px",fontSize:14,fontWeight:500,color:"#fff",cursor:"pointer"}}>Add</button></div></div>)}
        </div>
        <div style={{background:C.card,borderRadius:16,border:"1px solid "+C.border}}>
          <div style={{display:"flex",borderBottom:"1px solid "+C.border}}>{["overview","history"].map(t=><button key={t} onClick={()=>setTab(t)} style={{flex:1,background:"none",border:"none",color:tab===t?"#F472B6":C.t3,borderBottom:tab===t?"2px solid #F472B6":"2px solid transparent",padding:"12px 0",fontSize:13,fontWeight:tab===t?500:400,cursor:"pointer",textTransform:"capitalize"}}>{t}</button>)}</div>
          {tab==="overview"&&[{icon:"📅",label:"Monthly contribution",sub:"From both parents",val:fmt(fund.monthly)+" kr"},{icon:"🎂",label:"Estimated at 18",sub:"Year "+fund.endYear,val:"~"+fmt(Math.round(fund.balance+fund.monthly*12*yearsLeft))+" kr"},{icon:"📈",label:"Years remaining",sub:"Until payout",val:yearsLeft+" yrs"}].map((row,i,arr)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderBottom:i<arr.length-1?"1px solid "+C.border:"none"}}><span style={{fontSize:20,width:32,textAlign:"center"}}>{row.icon}</span><span style={{flex:1}}><span style={{display:"block",fontSize:13,fontWeight:500,color:C.t1}}>{row.label}</span><span style={{display:"block",fontSize:11,color:C.t3}}>{row.sub}</span></span><span style={{fontSize:13,fontWeight:500,color:C.t1}}>{row.val}</span></div>
          ))}
          {tab==="history"&&fund.transactions.map((tx,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:i<fund.transactions.length-1?"1px solid "+C.border:"none"}}><div><div style={{fontSize:13,fontWeight:500,color:C.t1}}>{tx.desc}</div><div style={{fontSize:11,color:C.t3}}>{tx.date}</div></div><span style={{fontSize:14,fontWeight:500,color:tx.amount>0?C.green:C.red}}>{(tx.amount>0?"+":"")+fmt(tx.amount)+" kr"}</span></div>)}
        </div>
      </div>
    </div>
  );
}

function BufferAccount({ members, buffer, onBack, onDeposit, onWithdraw }) {
  const adults=members.filter(m=>buffer.members.includes(m.id));
  const [tab,setTab]=useState("overview");
  const [showDep,setShowDep]=useState(false);
  const [showWith,setShowWith]=useState(false);
  const [depAmt,setDepAmt]=useState("");
  const [withAmt,setWithAmt]=useState("");
  const [depM,setDepM]=useState(adults[0]?.id);
  const hDep=()=>{const a=parseInt(depAmt,10);if(!a||a<=0)return;onDeposit(a);setDepAmt("");setShowDep(false);};
  const hWith=()=>{const a=parseInt(withAmt,10);if(!a||a<=0)return;onWithdraw(a);setWithAmt("");setShowWith(false);};
  return (
    <div style={{background:C.bg,minHeight:"100%",color:C.t1}}>
      <div style={{position:"relative",overflow:"hidden"}}>
        <div style={{height:180,position:"relative"}}>
          <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=400&fit=crop&q=80" alt="Buffer" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(13,15,26,0.3) 0%,rgba(13,15,26,0.95) 100%)"}}/>
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 20px 20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <span style={{fontSize:28}}>🛟</span>
            <div style={{fontSize:22,fontWeight:600,color:C.t1}}>Buffer account</div>
          </div>
          <div style={{fontSize:11,color:C.t3}}>{"Shared by "+adults.map(m=>m.name).join(" and ")}</div>
        </div>
      </div>
      <div style={{padding:"0 20px 40px"}}>
        <div style={{background:C.card,borderRadius:18,border:"1px solid "+C.border,padding:"18px 20px",marginBottom:16}}>
          <div style={{fontSize:32,fontWeight:500}}>{fmt(buffer.balance)+" "}<span style={{fontSize:14,color:C.t2}}>kr</span></div>
          <div style={{fontSize:12,color:C.t2,marginTop:4}}>{"+"+fmt(buffer.monthly)+" kr / month"}</div>
          <div style={{display:"flex",gap:10,marginTop:16}}>
            <button onClick={()=>{setShowDep(v=>!v);setShowWith(false);}} style={{flex:1,background:"rgba(124,111,255,0.15)",border:"1px solid rgba(124,111,255,0.35)",borderRadius:12,padding:"11px 0",fontSize:14,fontWeight:500,color:"#7C6FFF",cursor:"pointer"}}>+ Deposit</button>
            <button onClick={()=>{setShowWith(v=>!v);setShowDep(false);}} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid "+C.border,borderRadius:12,padding:"11px 0",fontSize:14,fontWeight:500,color:C.t2,cursor:"pointer"}}>- Withdraw</button>
          </div>
          {showDep&&(<div style={{marginTop:12}}><div style={{display:"flex",gap:8,marginBottom:8}}>{adults.map(m=><button key={m.id} onClick={()=>setDepM(m.id)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:depM===m.id?"rgba(124,111,255,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(depM===m.id?"rgba(124,111,255,0.4)":C.border),borderRadius:10,padding:"8px 0",cursor:"pointer"}}><Avatar m={m} size={20}/><span style={{fontSize:12,color:depM===m.id?"#7C6FFF":C.t2}}>{m.name}</span></button>)}</div><div style={{display:"flex",gap:8}}><input value={depAmt} onChange={e=>setDepAmt(e.target.value)} placeholder="Amount (kr)" type="number" style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid "+C.border,borderRadius:10,padding:"9px 12px",fontSize:14,color:C.t1,outline:"none"}}/><button onClick={hDep} style={{background:"#7C6FFF",border:"none",borderRadius:10,padding:"9px 16px",fontSize:14,fontWeight:500,color:"#fff",cursor:"pointer"}}>Add</button></div></div>)}
          {showWith&&(<div style={{marginTop:12,display:"flex",gap:8}}><input value={withAmt} onChange={e=>setWithAmt(e.target.value)} placeholder="Amount (kr)" type="number" style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid "+C.border,borderRadius:10,padding:"9px 12px",fontSize:14,color:C.t1,outline:"none"}}/><button onClick={hWith} style={{background:"rgba(255,255,255,0.1)",border:"1px solid "+C.border,borderRadius:10,padding:"9px 16px",fontSize:14,fontWeight:500,color:C.t2,cursor:"pointer"}}>Withdraw</button></div>)}
        </div>
        <div style={{background:C.card,borderRadius:16,border:"1px solid "+C.border}}>
          <div style={{display:"flex",borderBottom:"1px solid "+C.border}}>{["overview","history"].map(t=><button key={t} onClick={()=>setTab(t)} style={{flex:1,background:"none",border:"none",color:tab===t?"#7C6FFF":C.t3,borderBottom:tab===t?"2px solid #7C6FFF":"2px solid transparent",padding:"12px 0",fontSize:13,fontWeight:tab===t?500:400,cursor:"pointer",textTransform:"capitalize"}}>{t}</button>)}</div>
          {tab==="overview"&&[{icon:"📅",label:"Monthly contribution",sub:"Per adult",val:fmt(buffer.monthly)+" kr"},{icon:"👥",label:"Account holders",sub:"Both can deposit & withdraw",val:adults.length+" adults"},{icon:"📈",label:"Saved this year",sub:"Jan–Mar 2026",val:fmt(buffer.monthly*3)+" kr"}].map((row,i,arr)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderBottom:i<arr.length-1?"1px solid "+C.border:"none"}}><span style={{fontSize:20,width:32,textAlign:"center"}}>{row.icon}</span><span style={{flex:1}}><span style={{display:"block",fontSize:13,fontWeight:500,color:C.t1}}>{row.label}</span><span style={{display:"block",fontSize:11,color:C.t3}}>{row.sub}</span></span><span style={{fontSize:13,fontWeight:500,color:C.t1}}>{row.val}</span></div>
          ))}
          {tab==="history"&&buffer.transactions.map((tx,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:i<buffer.transactions.length-1?"1px solid "+C.border:"none"}}><div><div style={{fontSize:13,fontWeight:500,color:C.t1}}>{tx.desc}</div><div style={{fontSize:11,color:C.t3}}>{tx.date}</div></div><span style={{fontSize:14,fontWeight:500,color:tx.amount>0?C.green:C.red}}>{(tx.amount>0?"+":"")+fmt(tx.amount)+" kr"}</span></div>)}
        </div>
      </div>
    </div>
  );
}

function SavingsGoalDetail({ member, onBack, onUpdate, onAutoSaveSettings }) {
  const g=member.savingsGoal,pct=Math.round((g.saved/g.target)*100),isChild=member.role==="Child";
  const [editing,setEditing]=useState(false);
  const [name,setName]=useState(g.name);
  const [desc,setDesc]=useState(g.desc);
  const [emoji,setEmoji]=useState(g.emoji);
  const [gc,setGc]=useState(g.color);
  const [showDep,setShowDep]=useState(false);
  const [depAmt,setDepAmt]=useState("");
  const [showWith,setShowWith]=useState(false);
  const [withAmt,setWithAmt]=useState("");
  const [sliderMonthly,setSliderMonthly]=useState(g.monthly);
  const monthly=g.monthly;
  const remaining=g.target-g.saved;
  const calcMonths=Math.max(1,Math.ceil(remaining/monthly));
  const calcDate=(()=>{const d=new Date();d.setMonth(d.getMonth()+calcMonths);return d.toLocaleDateString("en-SE",{month:"short",year:"numeric"});})();
  const sliderMonths=Math.max(1,Math.ceil(remaining/sliderMonthly));
  const sliderDate=(()=>{const d=new Date();d.setMonth(d.getMonth()+sliderMonths);return d.toLocaleDateString("en-SE",{month:"short",year:"numeric"});})();
  const monthDiff=calcMonths-sliderMonths;
  const sliderMax=Math.max(monthly*3,3000);
  const hDep=()=>{const a=parseInt(depAmt,10);if(!a||a<=0)return;onUpdate(member.id,{...g,saved:g.saved+a});setDepAmt("");setShowDep(false);};
  const hWith=()=>{const a=parseInt(withAmt,10);if(!a||a<=0)return;onUpdate(member.id,{...g,saved:Math.max(0,g.saved-a)});setWithAmt("");setShowWith(false);};
  const hSave=()=>{onUpdate(member.id,{...g,name,desc,emoji,color:gc});setEditing(false);};
  return (
    <div style={{background:C.bg,color:C.t1}}>
      <div style={{position:"relative",overflow:"hidden"}}>
        {g.photo
          ? <div style={{height:180,position:"relative"}}>
              <img src={g.photo} alt={g.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(13,15,26,0.3) 0%,rgba(13,15,26,0.95) 100%)"}}/>
            </div>
          : <div style={{height:180,background:"linear-gradient(160deg,"+gc+"44 0%,"+C.bg+" 70%)"}}/>
        }
        <div style={{position:"absolute",top:12,right:16,zIndex:2}}>
          <button onClick={()=>setEditing(v=>!v)} style={{background:"rgba(0,0,0,0.4)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"50%",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,cursor:"pointer",color:"#fff"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 20px 20px",zIndex:2}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <span style={{fontSize:28}}>{emoji}</span>
            {editing?<input value={name} onChange={e=>setName(e.target.value)} style={{background:"transparent",border:"none",borderBottom:"2px solid "+gc,color:C.t1,fontSize:22,fontWeight:500,outline:"none",width:200}}/>:<div style={{fontSize:22,fontWeight:600}}>{g.name}</div>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}><Avatar m={member} size={20}/><span style={{fontSize:12,color:C.t2}}>{member.name}</span></div>
        </div>
      </div>
      {editing&&(<div style={{padding:"16px 20px 0"}}><div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>{GOAL_EMOJIS.map(e=><button key={e} onClick={()=>setEmoji(e)} style={{fontSize:22,background:emoji===e?gc+"33":"rgba(255,255,255,0.05)",border:"1px solid "+(emoji===e?gc:"transparent"),borderRadius:10,width:42,height:42,cursor:"pointer"}}>{e}</button>)}</div><div style={{display:"flex",justifyContent:"center",gap:10,marginTop:12}}>{GOAL_COLORS.map(col=><button key={col} onClick={()=>setGc(col)} style={{width:28,height:28,borderRadius:"50%",background:col,border:gc===col?"3px solid white":"3px solid transparent",cursor:"pointer"}}/>)}</div></div>)}
      <div style={{padding:"0 20px 40px"}}>
        <div style={{background:C.card,borderRadius:18,border:"1px solid "+C.border,padding:"18px 20px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><div><div style={{fontSize:11,color:C.t3,marginBottom:4}}>Saved</div><div style={{fontSize:30,fontWeight:500}}>{fmt(g.saved)+" "}<span style={{fontSize:14,color:C.t2}}>SEK</span></div></div><div style={{textAlign:"right"}}><div style={{fontSize:11,color:C.t3,marginBottom:4}}>Target</div><div style={{fontSize:18,fontWeight:500,color:C.t2}}>{fmt(g.target)+" SEK"}</div></div></div>
          <Bar value={g.saved} max={g.target} color={gc} height={6}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:12,color:C.t3}}><span>0%</span><span style={{color:gc,fontWeight:500}}>{pct+"% collected"}</span></div>
          <div style={{display:"flex",gap:10,marginTop:16}}>
            <button onClick={()=>{setShowDep(v=>!v);setShowWith(false);}} style={{flex:1,background:gc+"22",border:"1px solid "+gc+"55",borderRadius:12,padding:"11px 0",fontSize:14,fontWeight:500,color:gc,cursor:"pointer"}}>+ Deposit</button>
            <button onClick={()=>{setShowWith(v=>!v);setShowDep(false);}} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid "+C.border,borderRadius:12,padding:"11px 0",fontSize:14,fontWeight:500,color:C.t2,cursor:"pointer"}}>- Withdraw</button>
          </div>
          {showDep&&<div style={{marginTop:12,display:"flex",gap:8}}><input value={depAmt} onChange={e=>setDepAmt(e.target.value)} placeholder="Amount (SEK)" type="number" style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid "+C.border,borderRadius:10,padding:"9px 12px",fontSize:14,color:C.t1,outline:"none"}}/><button onClick={hDep} style={{background:gc,border:"none",borderRadius:10,padding:"9px 16px",fontSize:14,fontWeight:500,color:"#fff",cursor:"pointer"}}>Add</button></div>}
          {showWith&&<div style={{marginTop:12,display:"flex",gap:8}}><input value={withAmt} onChange={e=>setWithAmt(e.target.value)} placeholder="Amount (SEK)" type="number" style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid "+C.border,borderRadius:10,padding:"9px 12px",fontSize:14,color:C.t1,outline:"none"}}/><button onClick={hWith} style={{background:"rgba(255,255,255,0.1)",border:"1px solid "+C.border,borderRadius:10,padding:"9px 16px",fontSize:14,fontWeight:500,color:C.t2,cursor:"pointer"}}>Withdraw</button></div>}
        </div>
        <div style={{background:C.card,borderRadius:16,border:"1px solid "+C.border,padding:16,marginBottom:16}}><div style={{fontSize:14,fontWeight:500,marginBottom:8}}>About this goal</div>{editing?<textarea value={desc} onChange={e=>setDesc(e.target.value)} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid "+gc+"44",borderRadius:10,padding:"10px 12px",fontSize:13,color:C.t1,resize:"none",outline:"none",lineHeight:1.6,boxSizing:"border-box",minHeight:80}}/>:<div style={{fontSize:13,color:C.t2,lineHeight:1.7}}>{g.desc}</div>}</div>
        <div style={{background:C.card,borderRadius:16,border:"1px solid "+C.border,padding:"16px 18px",marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:500,color:C.t1,marginBottom:14}}>Adjust monthly savings</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:10}}>
            <div>
              <div style={{fontSize:28,fontWeight:500,color:gc,lineHeight:1}}>{fmt(sliderMonthly)}<span style={{fontSize:13,color:C.t2}}> kr/mo</span></div>
              {sliderMonthly!==monthly&&<div style={{fontSize:11,color:C.t3,marginTop:3}}>Current: {fmt(monthly)} kr/mo</div>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:13,fontWeight:600,color:monthDiff>0?C.green:monthDiff<0?C.red:C.t3}}>
                {monthDiff===0?"No change":monthDiff>0?`${monthDiff} month${monthDiff!==1?"s":""} faster`:`${Math.abs(monthDiff)} month${Math.abs(monthDiff)!==1?"s":""} slower`}
              </div>
              <div style={{fontSize:11,color:C.t3,marginTop:2}}>Done by {sliderDate}</div>
            </div>
          </div>
          <input type="range" min={100} max={sliderMax} step={50} value={sliderMonthly} onChange={e=>setSliderMonthly(Number(e.target.value))}
            style={{width:"100%",accentColor:gc,cursor:"pointer",height:4}}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:10,color:C.t3}}>
            <span>100 kr</span><span>{fmt(sliderMax)} kr</span>
          </div>
          {sliderMonthly!==monthly&&(
            <button onClick={()=>onUpdate(member.id,{...g,monthly:sliderMonthly})} style={{marginTop:14,width:"100%",background:gc+"22",border:"1px solid "+gc+"55",borderRadius:10,padding:"10px 0",fontSize:13,fontWeight:500,color:gc,cursor:"pointer"}}>
              Save {fmt(sliderMonthly)} kr/mo as new monthly goal
            </button>
          )}
        </div>
        {editing&&<button onClick={hSave} style={{width:"100%",background:gc,border:"none",borderRadius:12,padding:13,fontSize:14,fontWeight:500,color:"#fff",cursor:"pointer",marginBottom:16}}>Save changes</button>}
        <div style={{background:C.card,borderRadius:16,border:"1px solid "+C.border}}>
          <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderBottom:"1px solid "+C.border}}>          <span style={{fontSize:20,width:32,textAlign:"center"}}>{"📈"}</span><span style={{flex:1}}><span style={{display:"block",fontSize:13,fontWeight:500,color:C.t1}}>Monthly growth</span></span><span style={{fontSize:13,fontWeight:500,color:C.green}}>{"+"+fmt(g.monthly)+" SEK"}</span></div>
          <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderBottom:"1px solid "+C.border}}><span style={{fontSize:20,width:32,textAlign:"center"}}>{"📅"}</span><span style={{flex:1}}><span style={{display:"block",fontSize:13,fontWeight:500,color:C.t1}}>Est. completion</span><span style={{display:"block",fontSize:11,color:C.t3}}>{calcDate}</span></span></div>
          <button onClick={isChild?undefined:onAutoSaveSettings} style={{width:"100%",background:"none",border:"none",display:"flex",alignItems:"center",gap:14,padding:"14px 16px",cursor:isChild?"default":"pointer",textAlign:"left"}}><span style={{fontSize:20,width:32,textAlign:"center",flexShrink:0}}>{"🔄"}</span><span style={{flex:1}}><span style={{display:"block",fontSize:13,fontWeight:500,color:C.t1}}>Auto-save</span><span style={{display:"block",fontSize:11,color:C.t3}}>{isChild?"Not available for child accounts":"Active on every purchase"}</span></span>{isChild?<span style={{fontSize:11,color:C.t3,background:"rgba(255,255,255,0.05)",borderRadius:20,padding:"4px 10px"}}>Locked</span>:<span style={{fontSize:13,color:C.t3}}>{">"}</span>}</button>
        </div>
      </div>
    </div>
  );
}

function TxDetail({ tx, member, onBack }) {
  return (
    <div style={{background:C.bg,minHeight:"100%",color:C.t1}}>
      <div style={{background:C.surface,padding:"20px 20px 28px",borderBottom:"1px solid "+C.border}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
          <div style={{width:60,height:60,borderRadius:18,background:member.colorSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{CAT_ICONS[tx.cat]||"💳"}</div>
          <div style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:500}}>{tx.merchant}</div>          <div style={{fontSize:13,color:C.t2,marginTop:2}}>{tx.cat+" - "+tx.date}</div></div>
          <div style={{fontSize:36,fontWeight:500,color:C.red}}>{fmt(tx.amount)+" kr"}</div>
          <Badge label="Completed" color={C.green} bg={C.greenSoft}/>
        </div>
      </div>
      <div style={{padding:20}}>
        <div style={{background:C.card,borderRadius:16,border:"1px solid "+C.border,overflow:"hidden",marginBottom:16}}>
                    {[{label:"Paid by",val:member.name,av:true},{label:"Category",val:tx.cat},{label:"Card used",val:"Card ending "+(3700+(member.id-1)*13)},{label:"Date",val:tx.date}].map((row,i,arr)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",borderBottom:i<arr.length-1?"1px solid "+C.border:"none"}}><span style={{fontSize:13,color:C.t2}}>{row.label}</span><div style={{display:"flex",alignItems:"center",gap:8}}>{row.av&&<Avatar m={member} size={22}/>}<span style={{fontSize:14,fontWeight:500,color:C.t1}}>{row.val}</span></div></div>
          ))}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button style={{flex:1,background:C.accentSoft,border:"1px solid rgba(124,111,255,0.27)",borderRadius:12,padding:12,fontSize:13,fontWeight:500,color:C.accent,cursor:"pointer"}}>Dispute</button>
          <button style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid "+C.border,borderRadius:12,padding:12,fontSize:13,fontWeight:500,color:C.t2,cursor:"pointer"}}>Download receipt</button>
        </div>
      </div>
    </div>
  );
}

function MemberDetail({ m, onBack, onTx, onGoal, onChildFund, childFund }) {
  const [tab,setTab]=useState("activity");
  const [expanded,setExpanded]=useState(false);
  const g=m.savingsGoal,goalPct=Math.round((g.saved/g.target)*100);
  return (
    <div style={{background:C.bg,minHeight:"100%",color:C.t1}}>
      <div style={{background:C.surface,padding:"20px 20px 24px",borderBottom:"1px solid "+C.border}}>
        <div style={{background:C.card,border:"1.5px solid "+(expanded?m.color+"66":C.border),borderRadius:16,marginBottom:16,overflow:"hidden"}}>
          <div onClick={()=>setExpanded(v=>!v)} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",cursor:"pointer"}}>
            <Avatar m={m} size={52}/>
            <div style={{flex:1}}>
              <div style={{fontSize:18,fontWeight:500,color:C.t1}}>{m.fullName}</div>
              <div style={{fontSize:12,color:C.t2,marginTop:1}}>{m.age+" years old · "+m.role}</div>
              <div style={{marginTop:5}}><Badge label={m.status} color={m.statusColor} bg={m.statusBg}/></div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flexShrink:0}}>
              <span style={{fontSize:10,color:m.color,fontWeight:500}}>{expanded?"Less":"Info"}</span>
              <span style={{color:m.color,fontSize:14,display:"block",transform:expanded?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s"}}>v</span>
            </div>
          </div>
          {expanded&&<div style={{borderTop:"1px solid "+C.border,padding:"12px 14px",display:"flex",flexDirection:"column",gap:10,background:m.colorSoft}}>
            {[{icon:"📧",val:m.email},{icon:"📱",val:m.phone},{icon:"📅",val:"Member since "+m.joined}].map((row,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:14,width:20,textAlign:"center",flexShrink:0}}>{row.icon}</span>
                <span style={{fontSize:12,color:C.t2}}>{row.val}</span>
              </div>
            ))}
          </div>}
        </div>
        <div style={{display:"flex",gap:10}}>{[{label:"Spent",val:fmt(m.spendMonth)+" kr"},{label:"Limit",val:fmt(m.spendLimit)+" kr"},{label:"Cards",val:m.cards}].map(s=><div key={s.label} style={{flex:1,background:C.card,borderRadius:12,padding:"10px 12px",border:"1px solid "+C.border}}><div style={{fontSize:11,color:C.t3,marginBottom:4}}>{s.label}</div><div style={{fontSize:16,fontWeight:500}}>{s.val}</div></div>)}</div>
      </div>
      <div style={{display:"flex",background:C.surface,borderBottom:"1px solid "+C.border}}>{["activity","savings","cards"].map(t=><button key={t} onClick={()=>setTab(t)} style={{flex:1,background:"none",border:"none",color:tab===t?m.color:C.t2,borderBottom:tab===t?"2px solid "+m.color:"2px solid transparent",padding:"12px 0",fontSize:13,fontWeight:tab===t?500:400,cursor:"pointer",textTransform:"capitalize"}}>{t}</button>)}</div>
      <div style={{padding:20}}>
        {tab==="activity"&&m.transactions.map((tx,i)=>                <div key={i} onClick={()=>onTx(tx,m)} onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background=C.card} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:C.card,borderRadius:12,marginBottom:8,border:"1px solid "+C.border,cursor:"pointer"}}><div><div style={{fontSize:14,fontWeight:500}}>{tx.merchant}</div><div style={{fontSize:12,color:C.t3}}>{tx.cat+" - "+tx.date}</div></div><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{fontSize:15,fontWeight:500,color:C.red}}>{fmt(tx.amount)+" kr"}</div><div style={{color:C.t3}}>{">"}</div></div></div>)}
        {tab==="savings"&&(<div>
          <div onClick={()=>onGoal(m)} onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background=C.card} style={{background:C.card,borderRadius:16,border:"1px solid "+C.border,padding:16,cursor:"pointer",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}><div style={{width:46,height:46,borderRadius:14,background:g.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,overflow:"hidden"}}>{g.photo?<img src={g.photo} alt={g.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:g.emoji}</div><div style={{flex:1}}><div style={{fontSize:15,fontWeight:500,color:C.t1}}>{g.name}</div><div style={{fontSize:12,color:C.t3,marginTop:2}}>{g.desc.slice(0,48)+"..."}</div></div><div style={{color:C.t3,fontSize:18}}>{">"}</div></div>
            <Bar value={g.saved} max={g.target} color={g.color} height={5}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:13,color:C.t2}}><span>{fmt(g.saved)+" kr saved"}</span><span style={{color:g.color,fontWeight:500}}>{goalPct+"%"}</span></div>
          </div>
          {m.role==="Child"&&childFund&&<div onClick={onChildFund} onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background=C.card} style={{background:C.card,borderRadius:16,border:"1px solid rgba(244,114,182,0.3)",padding:16,cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}><div style={{width:46,height:46,borderRadius:14,background:"rgba(244,114,182,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{"🌱"}</div><div style={{flex:1}}><div style={{fontSize:15,fontWeight:500,color:C.t1}}>{"Maja's 0-18 fund"}</div></div><div style={{color:C.t3,fontSize:18}}>{">"}</div></div><Bar value={childFund.balance} max={childFund.balance+childFund.monthly*12} color="#F472B6" height={5}/></div>}
        </div>)}
        {tab==="cards"&&Array.from({length:m.cards}).map((_,i)=><div key={i} style={{background:m.colorSoft,border:"1px solid "+m.color+"44",borderRadius:14,padding:16,marginBottom:10}}><div style={{fontSize:12,color:C.t3,marginBottom:6}}>Resurs Family Card</div><div style={{fontSize:15,fontWeight:500,letterSpacing:2}}>{"**** **** **** "+(3700+i*13)}</div><div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:12,color:C.t2}}><span>{"Expires 12/"+(26+i)}</span><Badge label="Active" color={m.color} bg={m.colorSoft}/></div></div>)}
      </div>
    </div>
  );
}

function ManageMembers({ members, onBack, onSelect, onRemove, onFreeze }) {
  const [showInvite,setShowInvite]=useState(false);
  const [inviteRole,setInviteRole]=useState("Member");
  return (
    <div style={{background:C.bg,minHeight:"100%",color:C.t1}}>
      <div style={{background:C.surface,padding:"20px 20px 20px",borderBottom:"1px solid "+C.border}}>
        <div style={{fontSize:20,fontWeight:500}}>Manage members</div>
      </div>
      <div style={{padding:20}}>
        <div style={{background:C.card,borderRadius:16,border:"1px solid "+C.border,overflow:"hidden",marginBottom:16}}>
          {members.map((m,i)=>(
            <div key={m.id} style={{padding:"14px 16px",borderBottom:i<members.length-1?"1px solid "+C.border:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}><Avatar m={m} size={40}/><div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:C.t1}}>{m.name}</div><div style={{fontSize:12,color:C.t3}}>{m.role}</div></div><Badge label={m.status} color={m.statusColor} bg={m.statusBg}/></div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>onSelect(m)} style={{flex:1,background:C.accentSoft,border:"1px solid rgba(124,111,255,0.27)",borderRadius:10,padding:"8px 0",fontSize:12,fontWeight:500,color:C.accent,cursor:"pointer"}}>View</button>
                <button onClick={()=>onFreeze(m.id)} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid "+C.border,borderRadius:10,padding:"8px 0",fontSize:12,fontWeight:500,color:C.t2,cursor:"pointer"}}>Freeze</button>
                {m.role!=="Account owner"&&<button onClick={()=>onRemove(m.id)} style={{background:C.redSoft,border:"1px solid rgba(248,113,113,0.2)",borderRadius:10,padding:"8px 12px",fontSize:12,fontWeight:500,color:C.red,cursor:"pointer"}}>Remove</button>}
              </div>
            </div>
          ))}
        </div>
        <button onClick={()=>setShowInvite(v=>!v)} style={{width:"100%",background:C.accentSoft,border:"1px dashed rgba(124,111,255,0.4)",borderRadius:14,padding:14,fontSize:14,fontWeight:500,color:C.accent,cursor:"pointer"}}>+ Invite a family member</button>
        {showInvite&&(<div style={{background:C.card,borderRadius:14,border:"1px solid "+C.border,padding:16,marginTop:12}}><div style={{display:"flex",gap:8,marginBottom:12}}>{["Member","Child"].map(r=><button key={r} onClick={()=>setInviteRole(r)} style={{flex:1,background:inviteRole===r?C.accentSoft:"rgba(255,255,255,0.04)",border:"1px solid "+(inviteRole===r?"rgba(124,111,255,0.4)":C.border),borderRadius:10,padding:"8px 0",fontSize:13,color:inviteRole===r?C.accent:C.t2,cursor:"pointer",fontWeight:inviteRole===r?500:400}}>{r}</button>)}</div><button onClick={()=>setShowInvite(false)} style={{width:"100%",background:C.accent,border:"none",borderRadius:10,padding:11,fontSize:14,fontWeight:500,color:"#fff",cursor:"pointer"}}>Send invite link</button></div>)}
      </div>
    </div>
  );
}

function SavingsManage({ members, buffer, childFund, onBack, onAutoSave, onGoal, onBuffer, onChildFund }) {
  return (
    <div style={{background:C.bg,minHeight:"100%",color:C.t1}}>
      <div style={{background:C.surface,padding:"20px 20px 24px",borderBottom:"1px solid "+C.border}}>
        <div style={{fontSize:20,fontWeight:500}}>Savings & goals</div>
      </div>
      <div style={{padding:"20px 20px 40px"}}>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:500,color:C.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Auto-save</div>
          <div style={{background:C.card,borderRadius:16,border:"1px solid "+C.border,overflow:"hidden"}}>
            <button onClick={onAutoSave} style={{width:"100%",background:"none",border:"none",display:"flex",alignItems:"center",gap:14,padding:"14px 16px",cursor:"pointer",textAlign:"left"}}>
              <span style={{fontSize:22,width:36,textAlign:"center"}}>🔄</span>
              <span style={{flex:1}}><span style={{display:"block",fontSize:14,fontWeight:500,color:C.t1}}>Auto-save settings</span><span style={{display:"block",fontSize:12,color:C.t3}}>Adjust rate and split</span></span>
              <span style={{fontSize:13,color:C.t3}}>›</span>
            </button>
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:500,color:C.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Joint accounts</div>
          <div style={{background:C.card,borderRadius:16,border:"1px solid "+C.border,overflow:"hidden"}}>
            <button onClick={onBuffer} style={{width:"100%",background:"none",border:"none",display:"flex",alignItems:"center",gap:14,padding:"14px 16px",cursor:"pointer",textAlign:"left",borderBottom:"1px solid "+C.border}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(124,111,255,0.2)",border:"2px solid #7C6FFF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🛟</div>
              <span style={{flex:1}}><span style={{display:"block",fontSize:14,fontWeight:500,color:C.t1}}>Buffer account</span><span style={{display:"block",fontSize:12,color:C.t3}}>{fmt(buffer.balance)+" kr"}</span></span>
              <span style={{fontSize:13,color:C.t3}}>{">"}</span>
            </button>
            <button onClick={onChildFund} style={{width:"100%",background:"none",border:"none",display:"flex",alignItems:"center",gap:14,padding:"14px 16px",cursor:"pointer",textAlign:"left"}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(244,114,182,0.2)",border:"2px solid #F472B6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🌱</div>
              <span style={{flex:1}}><span style={{display:"block",fontSize:14,fontWeight:500,color:C.t1}}>{"Maja's 0–18 fund"}</span><span style={{display:"block",fontSize:12,color:C.t3}}>{fmt(childFund.balance)+" kr"}</span></span>
              <span style={{fontSize:13,color:C.t3}}>{">"}</span>
            </button>
          </div>
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:500,color:C.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Individual goals</div>
          <div style={{background:C.card,borderRadius:16,border:"1px solid "+C.border,overflow:"hidden"}}>
            {members.map((m,i)=>{const g=m.savingsGoal,pct=Math.round((g.saved/g.target)*100);return(
              <button key={m.id} onClick={()=>onGoal(m)} style={{width:"100%",background:"none",border:"none",display:"flex",alignItems:"center",gap:14,padding:"14px 16px",cursor:"pointer",textAlign:"left",borderBottom:i<members.length-1?"1px solid "+C.border:"none"}}>
                <div style={{width:36,height:36,borderRadius:12,background:g.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,overflow:"hidden"}}>{g.photo?<img src={g.photo} alt={g.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:g.emoji}</div>
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:C.t1}}>{g.name}</div><div style={{fontSize:12,color:C.t3,marginBottom:4}}>{m.name+" - "+fmt(g.saved)+" / "+fmt(g.target)+" kr"}</div><Bar value={g.saved} max={g.target} color={g.color} height={3}/></div>
                <span style={{fontSize:12,fontWeight:500,color:g.color,marginLeft:8,flexShrink:0}}>{pct+"%"}</span>
                <span style={{fontSize:13,color:C.t3}}>{">"}</span>
              </button>
            );})}
          </div>
        </div>
      </div>
    </div>
  );
}

function DealsPage({ onBack, deals }) {
  const [sel,setSel]=useState("All");
  const cats=["All",...Array.from(new Set(deals.map(d=>d.category)))];
  const filtered=sel==="All"?deals:deals.filter(d=>d.category===sel);
  return (
    <div style={{background:C.bg,minHeight:"100%",color:C.t1}}>
      <div style={{background:C.surface,padding:"20px 20px 20px",borderBottom:"1px solid "+C.border}}>
        <div style={{fontSize:20,fontWeight:500}}>Partner deals</div>
      </div>
      <ScrollRow style={{padding:"12px 16px",display:"flex",gap:8}}>
        {cats.map(cat=><button key={cat} onClick={()=>setSel(cat)} style={{flexShrink:0,background:sel===cat?C.accentSoft:"rgba(255,255,255,0.05)",border:"1px solid "+(sel===cat?"rgba(124,111,255,0.5)":C.border),borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:sel===cat?500:400,color:sel===cat?C.accent:C.t2,cursor:"pointer"}}>{cat}</button>)}
      </ScrollRow>
      <div style={{padding:"8px 20px 40px",display:"flex",flexDirection:"column",gap:12}}>
        {filtered.map(deal=>(
          <div key={deal.id} style={{background:C.card,borderRadius:18,border:"1px solid "+C.border,overflow:"hidden"}}>
            <div style={{background:deal.color+"18",padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:deal.colorSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{deal.logo}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:C.t1}}>{deal.partner}</div><span style={{fontSize:10,fontWeight:500,color:deal.tagColor,background:deal.tagColor+"18",borderRadius:999,padding:"2px 7px"}}>{deal.tag}</span></div>
              <div style={{fontSize:13,fontWeight:500,color:deal.color}}>{deal.saving}</div>
            </div>
            <div style={{padding:"14px 16px"}}>
              <div style={{fontSize:15,fontWeight:500,color:C.t1,marginBottom:6}}>{deal.title}</div>
              <div style={{fontSize:13,color:C.t2,lineHeight:1.6,marginBottom:14}}>{deal.desc}</div>
              <button style={{width:"100%",background:deal.colorSoft,border:"1px solid "+deal.color+"44",borderRadius:12,padding:"11px 0",fontSize:13,fontWeight:500,color:deal.color,cursor:"pointer"}}>Activate offer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SUBSCRIPTIONS ─────────────────────────────────────────────────────────────
const initSubs = [
  {id:1,name:"Netflix",emoji:"🎬",color:"#E50914",category:"Streaming",amount:169,cycle:"monthly",member:"family",active:true,nextBill:"Apr 15"},
  {id:2,name:"Spotify",emoji:"🎵",color:"#1DB954",category:"Music",amount:99,cycle:"monthly",member:2,active:true,nextBill:"Apr 18"},
  {id:3,name:"Disney+",emoji:"✨",color:"#113CCF",category:"Streaming",amount:89,cycle:"monthly",member:"family",active:true,nextBill:"Apr 22"},
  {id:4,name:"YouTube Premium",emoji:"▶️",color:"#FF0000",category:"Streaming",amount:119,cycle:"monthly",member:2,active:false,nextBill:"Apr 30"},
  {id:5,name:"iCloud+",emoji:"☁️",color:"#6E9BF7",category:"Apps",amount:39,cycle:"monthly",member:1,active:true,nextBill:"Apr 10"},
  {id:6,name:"Duolingo",emoji:"🦉",color:"#58CC02",category:"Kids",amount:79,cycle:"monthly",member:3,active:true,nextBill:"Apr 12"},
  {id:7,name:"Headspace",emoji:"🧘",color:"#F47D31",category:"Fitness",amount:89,cycle:"monthly",member:1,active:true,nextBill:"May 1"},
  {id:8,name:"Storytel",emoji:"📚",color:"#E8344A",category:"Kids",amount:149,cycle:"monthly",member:3,active:true,nextBill:"Apr 20"},
];

function SubscriptionsPage({ members, onBack }) {
  const [subs,setSubs]=useState(initSubs);
  const [filter,setFilter]=useState("All");
  const [expanded,setExpanded]=useState(null);
  const [showStats,setShowStats]=useState(false);
  const [showAdd,setShowAdd]=useState(false);
  const [newName,setNewName]=useState("");
  const [newAmt,setNewAmt]=useState("");
  const [newCat,setNewCat]=useState("Streaming");
  const [newMember,setNewMember]=useState("family");

  const cats=["All","Streaming","Music","Apps","Kids","Fitness"];
  const filtered=filter==="All"?subs:subs.filter(s=>s.category===filter);
  const activeSubs=subs.filter(s=>s.active);
  const totalMonthly=activeSubs.reduce((sum,s)=>sum+s.amount,0);
  const paused=subs.filter(s=>!s.active).length;

  const toggle=(id)=>setSubs(ss=>ss.map(s=>s.id===id?{...s,active:!s.active}:s));
  const remove=(id)=>setSubs(ss=>ss.filter(s=>s.id!==id));
  const addSub=()=>{
    if(!newName||!newAmt) return;
    const colors=["#7C6FFF","#34D399","#F472B6","#FBBF24","#60A5FA","#F97316"];
    setSubs(ss=>[...ss,{id:Date.now(),name:newName,emoji:"📦",color:colors[ss.length%colors.length],category:newCat,amount:parseInt(newAmt)||0,cycle:"monthly",member:newMember==="family"?"family":parseInt(newMember),active:true,nextBill:"Next month"}]);
    setNewName("");setNewAmt("");setShowAdd(false);
  };

  const getMemberName=(m)=>{
    if(m==="family") return "Family";
    return members.find(mb=>mb.id===m)?.name||"Unknown";
  };
  const getMemberColor=(m)=>{
    if(m==="family") return C.accent;
    return members.find(mb=>mb.id===m)?.color||C.t3;
  };

  const totalYearly = totalMonthly * 12;
  const pausedSaving = subs.filter(s=>!s.active).reduce((a,s)=>a+s.amount,0);
  const topSub = activeSubs.length ? activeSubs.reduce((a,b)=>a.amount>b.amount?a:b) : null;
  const memberTotals = members.map(m=>({
    ...m,
    total: activeSubs.filter(s=>s.member===m.id).reduce((a,s)=>a+s.amount,0)
  }));
  const familyTotal = activeSubs.filter(s=>s.member==="family").reduce((a,s)=>a+s.amount,0);
  const streamingSubs = activeSubs.filter(s=>s.category==="Streaming");
  const tips = [
    { emoji:"💡", color:"#7C6FFF", bg:"rgba(124,111,255,0.12)", border:"rgba(124,111,255,0.3)",
      title:"You're spending "+fmt(totalYearly)+" kr / year",
      body:"That's "+fmt(Math.round(totalYearly/12))+" kr every month across "+activeSubs.length+" services. Small cuts add up fast." },
    ...(streamingSubs.length>=2?[{ emoji:"📺", color:"#F472B6", bg:"rgba(244,114,182,0.1)", border:"rgba(244,114,182,0.3)",
      title:"You have "+streamingSubs.length+" streaming services",
      body:"Rotating between "+streamingSubs.map(s=>s.name).join(", ")+" instead of running them all saves "+fmt(streamingSubs.slice(1).reduce((a,s)=>a+s.amount,0))+" kr/mo." }]:[]),
    ...(topSub?[{ emoji:"🔍", color:"#FBBF24", bg:"rgba(251,191,36,0.1)", border:"rgba(251,191,36,0.3)",
      title:topSub.name+" is your biggest cost",
      body:"At "+fmt(topSub.amount)+" kr/mo it accounts for "+Math.round((topSub.amount/totalMonthly)*100)+"% of your subscription spend. Worth keeping?" }]:[]),
    ...(pausedSaving>0?[{ emoji:"✅", color:"#34D399", bg:"rgba(52,211,153,0.1)", border:"rgba(52,211,153,0.3)",
      title:"Pausing saves you "+fmt(pausedSaving)+" kr this month",
      body:"That's "+fmt(pausedSaving*12)+" kr over a full year. Resume anytime when you need it again." }]:[]),
    { emoji:"🔄", color:"#60A5FA", bg:"rgba(96,165,250,0.1)", border:"rgba(96,165,250,0.3)",
      title:"Switch to yearly plans",
      body:"Many services offer 2 months free on annual billing. On "+fmt(totalMonthly)+" kr/mo that could save ~"+fmt(Math.round(totalMonthly*2))+" kr." },
  ];
  const [tipIdx,setTipIdx]=useState(0);
  const tip=tips[tipIdx];

  return (
    <div style={{background:C.bg,minHeight:"100%",color:C.t1}}>
      <div style={{background:"linear-gradient(160deg,rgba(124,111,255,0.2) 0%,#0D0F1A 70%)",padding:"20px 20px 24px",borderBottom:"1px solid "+C.border}}>
        {/* Tip card */}
        <div style={{background:tip.bg,borderRadius:18,border:"1px solid "+tip.border,padding:"16px 18px",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
            <div style={{width:40,height:40,borderRadius:12,background:tip.color+"22",border:"1px solid "+tip.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{tip.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:C.t1,marginBottom:4}}>{tip.title}</div>
              <div style={{fontSize:12,color:C.t2,lineHeight:1.6}}>{tip.body}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:14}}>
            <div style={{display:"flex",gap:6}}>
              {tips.map((_,i)=><div key={i} onClick={()=>setTipIdx(i)} style={{width:i===tipIdx?18:6,height:6,borderRadius:999,background:i===tipIdx?tip.color:"rgba(255,255,255,0.15)",cursor:"pointer",transition:"all 0.2s"}}/>)}
            </div>
            <button onClick={()=>setTipIdx(i=>(i+1)%tips.length)} style={{background:"none",border:"none",color:tip.color,fontSize:12,fontWeight:500,cursor:"pointer",padding:0}}>Next tip →</button>
          </div>
        </div>
        {/* Summary row */}
        <div onClick={()=>setShowStats(v=>!v)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"2px 0"}}>
          <div style={{flex:1,display:"flex",gap:10}}>
            <div style={{fontSize:13,color:C.t2}}><span style={{fontWeight:600,color:C.t1}}>{fmt(totalMonthly)+" kr"}</span> / month</div>
            <div style={{fontSize:13,color:C.t3}}>·</div>
            <div style={{fontSize:13,color:C.t3}}>{activeSubs.length+" active"}{paused>0?" · "+paused+" paused":""}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transform:showStats?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s",flexShrink:0}}><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        {/* Expandable details */}
        {showStats&&(
          <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:10}}>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,border:"1px solid "+C.border,padding:"12px 14px"}}>
              <div style={{fontSize:11,color:C.t3,marginBottom:10}}>Cost per member</div>
              {[...memberTotals.map(m=>({name:m.name,color:m.color,total:m.total})),{name:"Family shared",color:C.accent,total:familyTotal}].filter(r=>r.total>0).map((row,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{fontSize:12,color:C.t2,width:90,flexShrink:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{row.name}</div>
                  <div style={{flex:1,height:5,borderRadius:999,background:"rgba(255,255,255,0.07)",overflow:"hidden"}}>
                    <div style={{width:Math.round((row.total/totalMonthly)*100)+"%",height:"100%",borderRadius:999,background:row.color}}/>
                  </div>
                  <div style={{fontSize:12,fontWeight:500,color:row.color,width:56,textAlign:"right",flexShrink:0}}>{fmt(row.total)+" kr"}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              {topSub&&<div style={{flex:1,background:"rgba(255,255,255,0.04)",borderRadius:12,border:"1px solid "+C.border,padding:"10px 12px"}}>
                <div style={{fontSize:10,color:C.t3,marginBottom:3}}>Most expensive</div>
                <div style={{fontSize:13,fontWeight:500,color:C.t1}}>{topSub.emoji+" "+topSub.name}</div>
                <div style={{fontSize:11,color:C.t3}}>{fmt(topSub.amount)+" kr / mo"}</div>
              </div>}
              {pausedSaving>0&&<div style={{flex:1,background:"rgba(52,211,153,0.07)",borderRadius:12,border:"1px solid rgba(52,211,153,0.2)",padding:"10px 12px"}}>
                <div style={{fontSize:10,color:C.t3,marginBottom:3}}>Saved by pausing</div>
                <div style={{fontSize:13,fontWeight:500,color:C.green}}>{fmt(pausedSaving)+" kr"}</div>
                <div style={{fontSize:11,color:C.t3}}>this month</div>
              </div>}
            </div>
          </div>
        )}
      </div>

      <ScrollRow style={{display:"flex",gap:8,padding:"12px 16px",paddingBottom:4}}>
        {cats.map(cat=>(
          <button key={cat} onClick={()=>setFilter(cat)} style={{flexShrink:0,background:filter===cat?C.accentSoft:"rgba(255,255,255,0.05)",border:"1px solid "+(filter===cat?"rgba(124,111,255,0.5)":C.border),borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:filter===cat?500:400,color:filter===cat?C.accent:C.t2,cursor:"pointer"}}>{cat}</button>
        ))}
      </ScrollRow>

      <div style={{padding:"8px 16px 100px",display:"flex",flexDirection:"column",gap:2}}>
        {filtered.map((sub,i)=>{
          const isOpen = expanded===sub.id;
          const isLast = i===filtered.length-1;
          return (
            <div key={sub.id}>
              <div onClick={()=>setExpanded(isOpen?null:sub.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:isOpen?C.cardHover:C.card,borderRadius:isOpen?12:0,borderTopLeftRadius:(i===0||isOpen)?12:0,borderTopRightRadius:(i===0||isOpen)?12:0,borderBottomLeftRadius:(isLast||isOpen)?12:0,borderBottomRightRadius:(isLast||isOpen)?12:0,borderTop:i===0||isOpen?"1px solid "+C.border:"none",borderLeft:"1px solid "+C.border,borderRight:"1px solid "+C.border,borderBottom:isOpen||isLast?"1px solid "+C.border:"none",cursor:"pointer",opacity:sub.active?1:0.55,marginBottom:isOpen?6:0}}>
                <div style={{width:34,height:34,borderRadius:10,background:sub.color+"22",border:"1.5px solid "+sub.color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{sub.emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,color:C.t1}}>{sub.name}</div>
                  <div style={{fontSize:11,color:C.t3,marginTop:1}}>{getMemberName(sub.member)+" · "+(sub.active?"Next: "+sub.nextBill:"Paused")}</div>
                </div>
                <div style={{fontSize:13,fontWeight:500,color:sub.active?C.t1:C.t3,marginRight:6}}>{fmt(sub.amount)+" kr"}</div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transform:isOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s",flexShrink:0}}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {isOpen&&(
                <div style={{background:"rgba(255,255,255,0.02)",borderRadius:"0 0 12px 12px",border:"1px solid "+C.border,borderTop:"none",padding:"12px 14px",marginBottom:6}}>
                  <div style={{display:"flex",gap:8,marginBottom:10}}>
                    <div style={{flex:1,fontSize:11,color:C.t3}}>Category</div>
                    <div style={{fontSize:11,color:C.t2}}>{sub.category}</div>
                  </div>
                  <div style={{display:"flex",gap:8,marginBottom:14}}>
                    <div style={{flex:1,fontSize:11,color:C.t3}}>Member</div>
                    <span style={{fontSize:11,color:getMemberColor(sub.member),background:getMemberColor(sub.member)+"18",borderRadius:999,padding:"2px 8px"}}>{getMemberName(sub.member)}</span>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={e=>{e.stopPropagation();toggle(sub.id);}} style={{flex:1,background:sub.active?"rgba(251,191,36,0.1)":"rgba(52,211,153,0.1)",border:"1px solid "+(sub.active?"rgba(251,191,36,0.3)":"rgba(52,211,153,0.3)"),borderRadius:10,padding:"8px 0",fontSize:12,fontWeight:500,color:sub.active?C.amber:C.green,cursor:"pointer"}}>{sub.active?"Pause":"Resume"}</button>
                    <button onClick={e=>{e.stopPropagation();remove(sub.id);}} style={{flex:1,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,padding:"8px 0",fontSize:12,fontWeight:500,color:"#EF4444",cursor:"pointer"}}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div onClick={()=>setShowAdd(v=>!v)} style={{background:C.card,borderRadius:16,border:"1px dashed rgba(124,111,255,0.4)",padding:"14px 18px",display:"flex",alignItems:"center",gap:14,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background=C.card}>
          <div style={{width:44,height:44,borderRadius:12,background:"rgba(124,111,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:C.accent,flexShrink:0}}>+</div>
          <div><div style={{fontSize:14,fontWeight:500,color:C.t1}}>Add subscription</div><div style={{fontSize:12,color:C.t3,marginTop:2}}>Track a new service</div></div>
        </div>

        {showAdd&&(
          <div style={{background:C.card,borderRadius:16,border:"1px solid rgba(124,111,255,0.3)",padding:"16px"}}>
            <div style={{fontSize:14,fontWeight:500,color:C.t1,marginBottom:14}}>New subscription</div>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Service name (e.g. Netflix)" style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid "+C.border,borderRadius:10,padding:"10px 12px",fontSize:13,color:C.t1,outline:"none",marginBottom:10,boxSizing:"border-box"}}/>
            <input value={newAmt} onChange={e=>setNewAmt(e.target.value)} placeholder="Monthly cost (kr)" type="number" style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid "+C.border,borderRadius:10,padding:"10px 12px",fontSize:13,color:C.t1,outline:"none",marginBottom:10,boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
              {["Streaming","Music","Apps","Kids","Fitness"].map(cat=>(
                <button key={cat} onClick={()=>setNewCat(cat)} style={{background:newCat===cat?C.accentSoft:"rgba(255,255,255,0.05)",border:"1px solid "+(newCat===cat?"rgba(124,111,255,0.5)":C.border),borderRadius:20,padding:"5px 12px",fontSize:11,color:newCat===cat?C.accent:C.t2,cursor:"pointer"}}>{cat}</button>
              ))}
            </div>
            <select value={newMember} onChange={e=>setNewMember(e.target.value)} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid "+C.border,borderRadius:10,padding:"10px 12px",fontSize:13,color:C.t1,outline:"none",marginBottom:14,boxSizing:"border-box"}}>
              <option value="family">Whole family</option>
              {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <div style={{display:"flex",gap:8}}>
              <button onClick={addSub} style={{flex:1,background:C.accent,border:"none",borderRadius:10,padding:"10px 0",fontSize:13,fontWeight:500,color:"#fff",cursor:"pointer"}}>Add</button>
              <button onClick={()=>setShowAdd(false)} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid "+C.border,borderRadius:10,padding:"10px 0",fontSize:13,color:C.t2,cursor:"pointer"}}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── FAMILY HUB ────────────────────────────────────────────────────────────────
function FamilyHub({ members, setMembers, buffer, setBuffer, childFund, setChildFund, onBack, onOpenChat, onOpenInsights, onSubPage, openMonthlyTrigger }) {
  const [selMember,setSelMember]=useState(null);
  const [selTx,setSelTx]=useState(null);
  const [selTxM,setSelTxM]=useState(null);
  const [selGoal,setSelGoal]=useState(null);
  const [showManage,setShowManage]=useState(false);
  const [showAutoSave,setShowAutoSave]=useState(false);
  const [showBuf,setShowBuf]=useState(false);
  const [showCF,setShowCF]=useState(false);
  const [showSav,setShowSav]=useState(false);
  const [showExp,setShowExp]=useState(false);
  const [showSavCalc,setShowSavCalc]=useState(false);
  const [showDeals,setShowDeals]=useState(false);
  const [showLimits,setShowLimits]=useState(false);
  const [showSubs,setShowSubs]=useState(false);
  const [showMonthly,setShowMonthly]=useState(false);
  const [showFixed,setShowFixed]=useState(false);
  useEffect(()=>{if(openMonthlyTrigger>0)setShowMonthly(true);},[openMonthlyTrigger]);
  const [selLoan,setSelLoan]=useState(null);
  const familyLoans=[
    {name:"Home renovation loan",amount:35000,monthly:1200,paid:8500,color:"#FBBF24",icon:"🏠",rate:"4.9%",ends:"Dec 2027"},
    {name:"Electronics — Elgiganten",amount:7500,monthly:685,paid:2500,color:"#60A5FA",icon:"💻",rate:"0%",ends:"Oct 2025"},
  ];
  const totalCredit=50000,totalUsed=members.reduce((s,m)=>s+m.spendMonth,0),usedPct=Math.round((totalUsed/totalCredit)*100);
  const fm={fontFamily:"inherit",background:C.bg,height:"100%",color:C.t1,overflowY:"auto",scrollbarWidth:"none"};
  const updGoal=(id,g)=>{setMembers(ms=>ms.map(m=>m.id===id?{...m,savingsGoal:g}:m));setSelGoal(p=>p?{...p,savingsGoal:g}:p);};
  const liveM=selMember?members.find(m=>m.id===selMember.id)||selMember:null;
  const liveG=selGoal?members.find(m=>m.id===selGoal.id)||selGoal:null;
  const getSubPage=()=>{
    if(showSavCalc) return {title:"Savings Calculator",back:()=>setShowSavCalc(false)};
    if(showExp) return {title:"Expense Report",back:()=>setShowExp(false)};
    if(showDeals) return {title:"Partner Deals",back:()=>setShowDeals(false)};
    if(showMonthly) return {title:"Monthly Report",back:()=>setShowMonthly(false)};
    if(showFixed) return {title:"Fixed Expenses",back:()=>setShowFixed(false)};
    if(showSubs) return {title:"Subscriptions",back:()=>setShowSubs(false)};
    if(showLimits) return {title:"Manage Limits",back:()=>setShowLimits(false)};
    if(showBuf) return {title:"Buffer Account",back:()=>setShowBuf(false)};
    if(showCF) return {title:"Maja's Fund",back:()=>setShowCF(false)};
    if(showAutoSave) return {title:"Auto-Save",back:()=>setShowAutoSave(false)};
    if(showSav) return {title:"Savings",back:()=>setShowSav(false)};
    if(liveG) return {title:liveG.savingsGoal.name,back:()=>setSelGoal(null)};
    if(selTx&&selTxM) return {title:"Transaction",back:()=>{setSelTx(null);setSelTxM(null);}};
    if(liveM) return {title:liveM.name,back:()=>setSelMember(null)};
    if(showManage) return {title:"Manage Members",back:()=>setShowManage(false)};
    if(selLoan) return {title:selLoan.name,back:()=>setSelLoan(null)};
    return null;
  };
  const subPage=getSubPage();
  useEffect(()=>{if(onSubPage) onSubPage(subPage);},[showSavCalc,showExp,showDeals,showLimits,showBuf,showCF,showAutoSave,showSav,selGoal,selTx,selMember,showManage,liveM,liveG,selLoan,showSubs,showMonthly,showFixed]);
  if(showFixed) return <div style={fm}><FixedExpenses members={members} onBack={()=>setShowFixed(false)}/></div>;
  if(showMonthly) return <div style={fm}><MonthlySummary members={members} expenseData={EXPENSE_DATA} buffer={buffer} childFund={childFund} loans={familyLoans} onBack={()=>setShowMonthly(false)}/></div>;
  if(showSubs) return <div style={fm}><SubscriptionsPage members={members} onBack={()=>setShowSubs(false)}/></div>;
  if(showSavCalc) return <div style={fm}><SavingsCalculator members={members} buffer={buffer} childFund={childFund} onBack={()=>setShowSavCalc(false)}/></div>;
  if(showExp) return <div style={fm}><ExpenseReport onBack={()=>setShowExp(false)}/></div>;
  if(showDeals) return <div style={fm}><DealsPage onBack={()=>setShowDeals(false)} deals={DEALS}/></div>;
  if(showLimits) return <div style={fm}><ManageLimits members={members} totalCredit={totalCredit} onBack={()=>setShowLimits(false)}/></div>;
  if(showBuf) return <div style={fm}><BufferAccount members={members} buffer={buffer} onDeposit={a=>setBuffer(b=>({...b,balance:b.balance+a}))} onWithdraw={a=>setBuffer(b=>({...b,balance:Math.max(0,b.balance-a)}))} onBack={()=>setShowBuf(false)}/></div>;
  if(showCF) return <div style={fm}><ChildFund members={members} fund={childFund} onDeposit={a=>setChildFund(f=>({...f,balance:f.balance+a}))} onBack={()=>setShowCF(false)}/></div>;
  if(showAutoSave) return <div style={fm}><AutoSaveSettings members={members} buffer={buffer} childFund={childFund} onBack={()=>setShowAutoSave(false)}/></div>;
  if(showSav) return <div style={fm}><SavingsManage members={members} buffer={buffer} childFund={childFund} onBack={()=>setShowSav(false)} onAutoSave={()=>{setShowSav(false);setShowAutoSave(true);}} onGoal={m=>{setShowSav(false);setSelGoal(m);}} onBuffer={()=>{setShowSav(false);setShowBuf(true);}} onChildFund={()=>{setShowSav(false);setShowCF(true);}}/></div>;
  if(liveG) return <div style={fm}><SavingsGoalDetail member={liveG} onBack={()=>setSelGoal(null)} onUpdate={updGoal} onAutoSaveSettings={()=>setShowAutoSave(true)}/></div>;
  if(selTx&&selTxM) return <div style={fm}><TxDetail tx={selTx} member={selTxM} onBack={()=>{setSelTx(null);setSelTxM(null);}}/></div>;
  if(liveM) return <div style={fm}><MemberDetail m={liveM} onBack={()=>setSelMember(null)} onTx={(tx,m)=>{setSelTx(tx);setSelTxM(m);}} onGoal={m=>setSelGoal(m)} onChildFund={()=>setShowCF(true)} childFund={childFund}/></div>;
  if(selLoan) return <div style={fm}><LoanDetail loan={selLoan} onBack={()=>setSelLoan(null)}/></div>;
  if(showManage) return <div style={fm}><ManageMembers members={members} onBack={()=>setShowManage(false)} onSelect={m=>{setShowManage(false);setSelMember(m);}} onRemove={id=>setMembers(ms=>ms.filter(m=>m.id!==id))} onFreeze={id=>setMembers(ms=>ms.map(m=>m.id===id?{...m,status:m.status==="Frozen"?"Within limit":"Frozen",statusColor:m.status==="Frozen"?C.green:C.red,statusBg:m.status==="Frozen"?C.greenSoft:C.redSoft}:m))}/></div>;
  const recent=members.flatMap(m=>m.transactions.slice(0,1).map(tx=>({...tx,member:m}))).slice(0,3);
  return (
    <div style={{background:C.bg,color:C.t1}}>
      <div style={{background:"linear-gradient(160deg,#1A1060 0%,#0D0F1A 60%)",padding:"20px 20px 20px",borderBottom:"1px solid "+C.border}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div><div style={{fontSize:11,color:C.t3,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Resurs Family</div><div style={{fontSize:26,fontWeight:500,color:C.t1,lineHeight:1.2}}>Good morning,<br/>Karlsson family</div></div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8,marginTop:4}}>
            <div style={{display:"flex"}}>{members.map((m,i)=><div key={m.id} style={{marginLeft:i>0?-10:0,border:"2px solid "+C.bg,borderRadius:"50%"}}><Avatar m={m} size={32}/></div>)}</div>
            <button onClick={onOpenInsights} style={{display:"flex",alignItems:"center",gap:5,background:"linear-gradient(135deg,rgba(124,111,255,0.25),rgba(52,211,153,0.15))",border:"1px solid rgba(124,111,255,0.4)",borderRadius:20,padding:"5px 10px",cursor:"pointer"}}>
              <span style={{fontSize:11,color:C.accent,fontWeight:600}}>✦ AI Insights</span>
            </button>
          </div>
        </div>
        <div style={{background:"rgba(124,111,255,0.12)",border:"1px solid rgba(124,111,255,0.25)",borderRadius:20,padding:"18px 20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div><div style={{fontSize:11,color:C.t3,marginBottom:4}}>Available credit</div><div style={{fontSize:30,fontWeight:500,color:C.t1}}>{fmt(totalCredit-totalUsed)+" "}<span style={{fontSize:15,color:C.t2}}>kr</span></div><div style={{fontSize:12,color:C.t2,marginTop:2}}>{"of "+fmt(totalCredit)+" kr total"}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:11,color:C.t3,marginBottom:4}}>Used</div><div style={{fontSize:18,fontWeight:500,color:C.amber}}>{usedPct+"%"}</div></div>
          </div>
          <Bar value={totalUsed} max={totalCredit} color={C.accent}/>
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button style={{flex:1,background:C.accent,border:"none",borderRadius:10,padding:"9px 0",fontSize:13,fontWeight:500,color:"#fff",cursor:"pointer"}}>Make payment</button>
            <button onClick={()=>setShowLimits(true)} style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1px solid "+C.border,borderRadius:10,padding:"9px 0",fontSize:13,fontWeight:500,color:C.t2,cursor:"pointer"}}>Split limits</button>
          </div>
        </div>
      </div>
      <div style={{padding:"20px 20px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontSize:14,fontWeight:500,color:C.t1}}>Family members</div><button onClick={()=>setShowManage(true)} style={{background:"none",border:"none",color:C.accent,fontSize:12,cursor:"pointer",padding:0}}>Manage</button></div>
        <ScrollRow style={{display:"flex",gap:10,paddingBottom:4}}>
          {members.map(m=>{const p=Math.round((m.spendMonth/m.spendLimit)*100);return(
            <div key={m.id} onClick={()=>setSelMember(m)} style={{flexShrink:0,width:110,background:C.card,borderRadius:16,padding:"14px 12px",border:"1px solid "+C.border,cursor:"pointer",textAlign:"center"}} onMouseEnter={e=>e.currentTarget.style.background=C.cardHover} onMouseLeave={e=>e.currentTarget.style.background=C.card}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><Avatar m={m} size={44}/></div>
              <div style={{fontSize:13,fontWeight:500,color:C.t1,marginBottom:2}}>{m.name}</div>
              <div style={{fontSize:10,color:C.t3,marginBottom:8}}>{m.role}</div>
              <Bar value={m.spendMonth} max={m.spendLimit} color={m.color}/>
              <div style={{fontSize:10,color:m.statusColor,marginTop:5}}>{p+"% used"}</div>
            </div>
          );})}
        </ScrollRow>
      </div>
      <div style={{padding:"16px 20px 0",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Tile style={{gridColumn:"1 / -1"}}>
          <TileLabel>Recent activity</TileLabel>
          {recent.map((item,i)=>(
            <div key={i} onClick={()=>{setSelTx(item);setSelTxM(item.member);}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<recent.length-1?"1px solid "+C.border:"none",cursor:"pointer",borderRadius:8}}>
              <Avatar m={item.member} size={30}/>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,color:C.t1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.merchant}</div>              <div style={{fontSize:11,color:C.t3}}>{item.member.name+" - "+item.date}</div></div>
              <div style={{fontSize:13,fontWeight:500,color:C.red,whiteSpace:"nowrap"}}>{fmt(item.amount)+" kr"}</div>
            </div>
          ))}
        </Tile>
        <Tile style={{gridColumn:"1 / -1"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><TileLabel>Savings & goals</TileLabel><button onClick={()=>setShowSav(true)} style={{background:"none",border:"none",color:C.accent,fontSize:12,cursor:"pointer",padding:0,marginBottom:10}}>Manage</button></div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div onClick={()=>setShowBuf(true)} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid "+C.border,paddingBottom:12,marginBottom:4}} onMouseEnter={e=>e.currentTarget.style.opacity="0.75"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              <span style={{fontSize:18}}>🛟</span>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:C.t1}}>Buffer account</div><div style={{fontSize:11,color:C.t3,marginTop:2}}>Joint · Adults</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:500,color:"#7C6FFF"}}>{fmt(buffer.balance)+" kr"}</div><div style={{fontSize:11,color:C.t3}}>{"+"+fmt(buffer.monthly)+" kr/mo"}</div></div>
            </div>
            <div onClick={()=>setShowCF(true)} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid "+C.border,paddingBottom:12,marginBottom:4}} onMouseEnter={e=>e.currentTarget.style.opacity="0.75"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              <span style={{fontSize:18}}>🌱</span>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:C.t1}}>{"Maja's 0–18 fund"}</div><div style={{fontSize:11,color:C.t3,marginTop:2}}>Long-term · Adults manage</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:500,color:"#F472B6"}}>{fmt(childFund.balance)+" kr"}</div><div style={{fontSize:11,color:C.t3}}>{"+"+fmt(childFund.monthly)+" kr/mo"}</div></div>
            </div>
            {members.map(m=>{const g=m.savingsGoal,p=Math.round((g.saved/g.target)*100);return(
              <div key={m.id} onClick={()=>setSelGoal(m)} style={{cursor:"pointer",padding:"4px 0"}} onMouseEnter={e=>e.currentTarget.style.opacity="0.75"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:22,height:22,borderRadius:6,background:g.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,overflow:"hidden",flexShrink:0}}>{g.photo?<img src={g.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:g.emoji}</div><Avatar m={m} size={22}/><span style={{fontSize:13,color:C.t1}}>{g.name}</span></div><span style={{fontSize:12,color:g.color,fontWeight:500}}>{p+"%"}</span></div>
                <Bar value={g.saved} max={g.target} color={g.color}/>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:11,color:C.t3}}><span>{fmt(g.saved)+" kr"}</span><span>{fmt(g.target)+" kr"}</span></div>
              </div>
            );})}
          </div>
        </Tile>
        <Tile style={{gridColumn:"1 / -1"}} onClick={()=>setShowDeals(true)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><TileLabel>Partner deals</TileLabel><span style={{fontSize:12,color:C.accent,marginBottom:10}}>See all</span></div>
          <ScrollRow style={{display:"flex",gap:10,paddingBottom:4}}>
            {DEALS.slice(0,4).map(deal=>(
              <div key={deal.id} style={{flexShrink:0,width:150,background:deal.color+"10",border:"1px solid "+deal.color+"33",borderRadius:14,overflow:"hidden"}}>
                <div style={{position:"relative",height:80}}>
                  <img src={deal.photo} alt={deal.partner} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.55) 100%)"}}/>
                  <div style={{position:"absolute",bottom:6,left:8,display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:20,height:20,borderRadius:6,background:deal.colorSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>{deal.logo}</div>
                    <span style={{fontSize:11,fontWeight:600,color:"#fff"}}>{deal.partner}</span>
                  </div>
                </div>
                <div style={{padding:"10px 10px 10px"}}>
                  <div style={{fontSize:12,fontWeight:500,color:C.t1,marginBottom:6,lineHeight:1.3}}>{deal.title}</div>
                  <span style={{fontSize:10,fontWeight:500,color:deal.color,background:deal.colorSoft,borderRadius:999,padding:"2px 7px"}}>{deal.saving}</span>
                </div>
              </div>
            ))}
          </ScrollRow>
        </Tile>
        <Tile style={{gridColumn:"1 / -1"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <TileLabel>Loans</TileLabel>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {familyLoans.map((loan,i)=>{
              const pct=Math.round((loan.paid/loan.amount)*100);
              return (
                <div key={i} onClick={()=>setSelLoan(loan)} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{display:"flex",alignItems:"center",gap:12,padding:"8px",borderRadius:12,cursor:"pointer",transition:"background 0.15s"}}>
                  <div style={{width:42,height:42,borderRadius:12,background:loan.color+"22",border:"1.5px solid "+loan.color+"55",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{loan.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:500,color:C.t1}}>{loan.name}</div>
                    <div style={{fontSize:11,color:C.t3,marginTop:2,marginBottom:6}}>{loan.rate+" interest - Ends "+loan.ends}</div>
                    <Bar value={loan.paid} max={loan.amount} color={loan.color} height={4}/>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:11,color:C.t3}}>
                      <span>{fmt(loan.paid)+" kr paid"}</span>
                      <span>{fmt(loan.amount-loan.paid)+" kr remaining"}</span>
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>
                    <div style={{fontSize:13,fontWeight:500,color:loan.color}}>{fmt(loan.monthly)+" kr"}</div>
                    <div style={{fontSize:10,color:C.t3}}>per month</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Tile>
        <Tile style={{gridColumn:"1 / -1"}} onClick={()=>setShowSubs(true)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <TileLabel>Subscriptions</TileLabel>
            <span style={{fontSize:12,color:C.accent}}>Manage</span>
          </div>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            {initSubs.filter(s=>s.active).slice(0,5).map((s,i)=>(
              <div key={s.id} title={s.name} style={{width:36,height:36,borderRadius:10,background:s.color+"22",border:"1.5px solid "+s.color+"55",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{s.emoji}</div>
            ))}
            {initSubs.filter(s=>s.active).length>5&&<div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.06)",border:"1px solid "+C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:C.t3}}>+{initSubs.filter(s=>s.active).length-5}</div>}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.t3}}>
            <span>{initSubs.filter(s=>s.active).length+" active"}</span>
            <span style={{fontWeight:500,color:C.t2}}>{fmt(initSubs.filter(s=>s.active).reduce((a,s)=>a+s.amount,0))+" kr / mo"}</span>
          </div>
        </Tile>
        <Tile style={{gridColumn:"1 / -1"}} onClick={()=>setShowFixed(true)}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:42,height:42,borderRadius:12,background:"rgba(124,111,255,0.15)",border:"1.5px solid rgba(124,111,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🏠</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:500,color:C.t1}}>Fixed Expenses</div>
              <div style={{fontSize:11,color:C.t3,marginTop:2}}>Rent, insurance, subscriptions & more</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </Tile>
        <Tile style={{gridColumn:"1 / -1"}} onClick={()=>setShowMonthly(true)}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:42,height:42,borderRadius:12,background:"rgba(96,165,250,0.15)",border:"1.5px solid rgba(96,165,250,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>📅</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:500,color:C.t1}}>Monthly Report</div>
              <div style={{fontSize:11,color:C.t3,marginTop:2}}>March 2026 · 7 540 kr spent · View full summary</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </Tile>
        <Tile><TileLabel>Benefits</TileLabel><div style={{display:"flex",flexDirection:"column",gap:10}}>{[{icon:"🛡",label:"Purchase protection"},{icon:"✈️",label:"Travel insurance"},{icon:"📱",label:"Mobile protection"}].map((b,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>{b.icon}</span><span style={{fontSize:12,color:C.t2}}>{b.label}</span></div>)}</div></Tile>
        <Tile><TileLabel>Quick actions</TileLabel><div style={{display:"flex",flexDirection:"column",gap:10}}>{[{icon:"📊",label:"Expense Wheel",action:()=>setShowExp(true)},{icon:"📈",label:"Savings Calculator",action:()=>setShowSavCalc(true)},{icon:"✦",label:"Ask AI",action:onOpenChat},{icon:"💬",label:"Support",action:null},{icon:"⚙️",label:"Settings",action:null}].map((item,i)=><div key={i} onClick={item.action||undefined} style={{display:"flex",alignItems:"center",gap:8,cursor:item.action?"pointer":"default"}} onMouseEnter={e=>{if(item.action)e.currentTarget.style.opacity="0.7";}} onMouseLeave={e=>e.currentTarget.style.opacity="1"}><span style={{fontSize:16}}>{item.icon}</span><span style={{fontSize:12,color:item.action?C.accent:C.t2}}>{item.label}</span></div>)}</div></Tile>
      </div>
      <div style={{height:28}}/>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("services");
  const [showFamily, setShowFamily] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [members, setMembers] = useState(initMembers);
  const [buffer, setBuffer] = useState(initBuffer);
  const [childFund, setChildFund] = useState(initChildFund);
  const [readNotifs, setReadNotifs] = useState(false);
  const [monthlyTrigger, setMonthlyTrigger] = useState(0);
  const [familySubPage, setFamilySubPage] = useState(null);
  const unread = readNotifs ? 0 : NOTIFICATIONS.filter(n=>n.unread).length;
  const openChat = () => { setShowChat(true); setShowFamily(false); };
  const tabTitles = {services:"Services",payments:"Payments",merchants:"Merchants",myresurs:"My Resurs"};
  const headerTitle = showFamily ? (familySubPage ? familySubPage.title : "Resurs Family") : tabTitles[activeTab];
  const headerBack = showFamily ? (familySubPage ? familySubPage.back : ()=>setShowFamily(false)) : null;
  return (
    <div style={{width:390,height:780,margin:"0 auto",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:C.bg,borderRadius:36,overflow:"hidden",border:"1px solid "+C.border,display:"flex",flexDirection:"column",position:"relative"}}>
      {showInsights&&(
        <div onClick={()=>setShowInsights(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",flexDirection:"column",justifyContent:"flex-end",borderRadius:36}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.surface,borderRadius:"24px 24px 0 0",padding:"8px 20px 36px",borderTop:"1px solid "+C.border}}>
            <div style={{width:40,height:4,borderRadius:999,background:"rgba(255,255,255,0.15)",margin:"10px auto 20px"}}/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#7C6FFF,#34D399)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>✦</div>
                <div><div style={{fontSize:14,fontWeight:500,color:C.t1}}>AI Insights</div><div style={{fontSize:10,color:C.t3}}>Updated just now</div></div>
              </div>
          <button onClick={()=>setShowInsights(false)} style={{background:"rgba(255,255,255,0.07)",border:"1px solid "+C.border,borderRadius:"50%",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.t2,fontSize:14}}>x</button>
            </div>
            <InsightsOnly members={members} buffer={buffer} childFund={childFund} onOpenChat={()=>{setShowInsights(false);openChat();}}/>
          </div>
        </div>
      )}
      {showNotifs&&<NotificationsPanel onClose={()=>{setShowNotifs(false);setReadNotifs(true);}} onAction={a=>{if(a==="monthly"){setShowNotifs(false);setShowFamily(true);setMonthlyTrigger(t=>t+1);}}}/>}
      {showChat&&<AIChat members={members} buffer={buffer} childFund={childFund} onClose={()=>setShowChat(false)}/>}
      <Header title={headerTitle} showBack={showFamily} onBack={headerBack} onNotifications={()=>setShowNotifs(true)} unreadCount={unread}/>
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",scrollbarWidth:"none"}}>
        {showFamily
          ? <FamilyHub members={members} setMembers={setMembers} buffer={buffer} setBuffer={setBuffer} childFund={childFund} setChildFund={setChildFund} onBack={()=>setShowFamily(false)} onOpenChat={openChat} onOpenInsights={()=>setShowInsights(true)} onSubPage={setFamilySubPage} openMonthlyTrigger={monthlyTrigger}/>
          : activeTab==="services"  ? <ServicesPage onFamilyClick={()=>setShowFamily(true)}/>
          : activeTab==="payments"  ? <PaymentsPage/>
          : activeTab==="merchants" ? <MerchantsPage/>
          : <MyResursPage/>
        }
      </div>
      <Footer activeTab={activeTab} onTab={tab=>{setActiveTab(tab);setShowFamily(false);setShowChat(false);}}/>
    </div>
  );
}
