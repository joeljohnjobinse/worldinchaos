import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, update, onValue, push } from "firebase/database";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBT6PSyYzN5-GFgRRXkqZkG4FF5jaYPezg",
  authDomain: "worldinchaos-146d8.firebaseapp.com",
  databaseURL: "https://worldinchaos-146d8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "worldinchaos-146d8",
  storageBucket: "worldinchaos-146d8.firebasestorage.app",
  messagingSenderId: "606160793766",
  appId: "1:606160793766:web:78b9a412433f3a6aff4467",
  measurementId: "G-QL3BL75L4X"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// helpers
const dbGet = async (path) => { const s = await get(ref(db, path)); return s.exists() ? s.val() : null; };
const dbSet = async (path, val) => set(ref(db, path), val);
const dbUpdate = async (path, val) => update(ref(db, path), val);
const dbSub = (path, cb) => { const r = ref(db, path); onValue(r, s => cb(s.exists() ? s.val() : null)); return r; };

function genId() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ── DATA ────────────────────────────────────────────────────

const GOOGLE_FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');`;

const COUNTRIES = {
  USA: { name:"USA", title:"The World's Policeman", subtitle:"(Self-Appointed)", flag:"🇺🇸", tokens:12, stats:{Economy:9,Military:9,Influence:9,Tech:10}, ability:{name:"WORLD POLICE",desc:"Once per round, intervene in ANY conflict at zero cost. Call an emergency Global Vote at any time."}, passive:{name:"EVERYONE NEEDS YOU",desc:"Gain +1 Influence token at the start of each round."}, weakness:"Every war you join costs an extra 2 Economy tokens — win or lose.", roleplay:"Talk loudly. Threaten sanctions every 5 minutes.", color:"#1a3a5c", accent:"#4a9eff" },
  China: { name:"China", title:"Quietly Buying the Planet", subtitle:"", flag:"🇨🇳", tokens:14, stats:{Economy:10,Military:7,Influence:7,Tech:8}, ability:{name:"DEBT TRAP",desc:"Offer any country 3 tokens NOW — they owe you 4 next round."}, passive:{name:"MANUFACTURING GIANT",desc:"Gain +1 Economy token whenever any other country loses Economy tokens."}, weakness:"Cannot spend Influence tokens in the same round you declare war.", roleplay:"Remain mysteriously calm. 'We are simply investing in friendship.'", color:"#8b0000", accent:"#ff6b6b" },
  Russia: { name:"Russia", title:"Chaos is a Feature", subtitle:"Not a Bug", flag:"🇷🇺", tokens:10, stats:{Economy:5,Military:10,Influence:6,Tech:6}, ability:{name:"DESTABILISE",desc:"Secretly name a target. They lose 2 tokens next round — no one is told why."}, passive:{name:"GAS LEVERAGE",desc:"Any ally gains +2 Economy tokens but owes you a favour."}, weakness:"Economy stat capped at 6 forever.", roleplay:"Deny everything. Look personally offended when accused.", color:"#1a1a2e", accent:"#a0c4ff" },
  India: { name:"India", title:"Non-Aligned", subtitle:"& Absolutely Judging Everyone", flag:"🇮🇳", tokens:11, stats:{Economy:7,Military:7,Influence:8,Tech:7}, ability:{name:"STRATEGIC AMBIGUITY",desc:"After any action, announce you were 'neutral all along' and escape all consequences."}, passive:{name:"SWING VOTE",desc:"Vote with the winning side in any Global Vote → gain +1 Influence."}, weakness:"Cannot declare war in Round 1.", roleplay:"Be the 'reasonable one' until you suddenly aren't.", color:"#1a3a1a", accent:"#ff9933" },
  "N. Korea": { name:"N. Korea", title:"Unhinged and Proud of It", subtitle:"", flag:"🇰🇵", tokens:7, stats:{Economy:2,Military:8,Influence:3,Tech:5}, ability:{name:"NUCLEAR BLUFF",desc:"Announce a nuclear strike. Every country pays 1 token OR calls your bluff. 3+ call it → lose 2 Military."}, passive:{name:"SANCTIONS-PROOF",desc:"Sanctions have zero effect on you."}, weakness:"Economy permanently fixed at 2.", roleplay:"Make wild announcements. Refer to yourself in the third person.", color:"#2d1a00", accent:"#ff8c00" },
  "Saudi Arabia": { name:"Saudi Arabia", title:"Has Oil. Has Money.", subtitle:"Has Opinions.", flag:"🇸🇦", tokens:13, stats:{Economy:9,Military:6,Influence:7,Tech:5}, ability:{name:"OIL EMBARGO",desc:"Every non-allied country loses 1 Economy token this round. Usable once every 2 rounds."}, passive:{name:"PETRODOLLAR",desc:"When Oil Shortage fires, gain +2 Economy instead of losing any."}, weakness:"If Tech Revolution fires and Tech beats Economy globally, lose 3 Economy.", roleplay:"You are completely unbothered. You're rich.", color:"#1a1600", accent:"#ffe066" },
  France: { name:"France", title:"Veto-Happy and", subtitle:"Mildly Superior", flag:"🇫🇷", tokens:11, stats:{Economy:7,Military:6,Influence:9,Tech:7}, ability:{name:"C'EST NON",desc:"Once per game: veto any declared action, vote, or resolution after it's announced."}, passive:{name:"CULTURAL SOFT POWER",desc:"Win any Influence contest by +1 automatically."}, weakness:"Cannot spend more than 4 tokens in any single round.", roleplay:"Be culturally smug. Act mildly offended by everything the USA does.", color:"#00005a", accent:"#c0a060" },
};

const OBJECTIVES = [
  { id:"SUPERPOWER", title:"SUPERPOWER", obj:"End with the highest combined stat total.", hint:"Win wars, boost stats every round.", bonus:"+3 pts if no one alliances specifically against you.", bonusPts:3 },
  { id:"PUPPET_MASTER", title:"PUPPET MASTER", obj:"Have at least 2 countries allied with you when the game ends.", hint:"Make friends early. Offer deals they can't refuse.", bonus:"+2 pts if one ally was previously your enemy.", bonusPts:2 },
  { id:"WAR_CRIMINAL", title:"WAR CRIMINAL", obj:"Start AND win at least 2 wars before the game ends.", hint:"Pick fights carefully. Attack when others are weakest.", bonus:"+3 pts if you win against someone with higher Military.", bonusPts:3 },
  { id:"SHADOW_BROKER", title:"SHADOW BROKER", obj:"Secretly sabotage 2 different countries without being publicly identified.", hint:"Be subtle. Deny everything.", bonus:"+2 pts if a sabotaged country blames someone else.", bonusPts:2 },
  { id:"SWITZERLAND", title:"SWITZERLAND MODE", obj:"Never declare war, never get sanctioned, don't lose more than 2 tokens total.", hint:"Be pleasant. Be forgettable.", bonus:"+3 pts if you end with MORE tokens than you started.", bonusPts:3 },
  { id:"RICHEST", title:"RICHEST NATION", obj:"End with highest Economy stat AND at least 10 tokens.", hint:"Trade aggressively. Avoid wars. Hoard everything.", bonus:"+2 pts if you deflect at least 2 wars.", bonusPts:2 },
  { id:"POPULIST", title:"THE POPULIST", obj:"Win at least 3 Global Votes.", hint:"Build coalitions. Count supporters before you move.", bonus:"+2 pts if one win results in another country being sanctioned.", bonusPts:2 },
];

const WORLD_EVENTS = [
  { id:"crash", title:"GLOBAL FINANCIAL CRASH", desc:"Every country loses 2 Economy tokens. The richest loses 3.", effect:"economy_crash" },
  { id:"oil", title:"OIL SHORTAGE", desc:"Non-oil countries lose 1 Economy. Saudi Arabia gains 2.", effect:"oil_shortage" },
  { id:"pandemic", title:"PANDEMIC OUTBREAK", desc:"All military actions cost +1 token this round. No alliances can be broken.", effect:"pandemic" },
  { id:"tech", title:"TECH REVOLUTION", desc:"Highest Tech stat gains 3 tokens. Everyone else gets nothing.", effect:"tech_rev" },
  { id:"leaked", title:"LEAKED DOCUMENTS", desc:"One player must reveal their Secret Objective title to the group.", effect:"leak" },
  { id:"climate", title:"CLIMATE CATASTROPHE", desc:"Spend 1 token on climate aid or lose 1 Influence.", effect:"climate" },
  { id:"arms", title:"ARMS RACE", desc:"Every country gains +1 Military this round. Wars cost 1 fewer token.", effect:"arms_race" },
  { id:"summit", title:"DIPLOMATIC SUMMIT", desc:"All alliances this round are free. All betrayals cost double.", effect:"summit" },
  { id:"espionage", title:"ESPIONAGE SCANDAL", desc:"One random country reveals one current alliance or one action taken this round.", effect:"espionage" },
  { id:"nuclear", title:"ROGUE NUCLEAR THREAT", desc:"North Korea gets a free Nuclear Bluff attempt this round.", effect:"nuclear_threat" },
  { id:"worldbank", title:"WORLD BANK EMERGENCY", desc:"One country may borrow up to 4 tokens. The lender sets repayment terms privately.", effect:"world_bank" },
  { id:"propaganda", title:"PROPAGANDA WAR", desc:"Every player gives a 30-second speech. Best speech earns +1 Influence.", effect:"propaganda" },
  { id:"refugee", title:"REFUGEE CRISIS", desc:"Two random countries negotiate responsibility. The loser loses 1 Influence.", effect:"refugee" },
  { id:"cyber", title:"CYBER ATTACK", desc:"One player secretly names a target. They lose 1 Tech and 1 Economy.", effect:"cyber" },
  { id:"un", title:"UN EMERGENCY SESSION", desc:"A mandatory Global Vote happens this round. France may use their veto.", effect:"un_session" },
];

const DIPLOMATIC_PHRASES = [
  "We strongly condemn this unprovoked aggression and demand immediate withdrawal.",
  "Our nations share deep historical bonds that transcend mere political differences.",
  "We are prepared to consider all options currently on the table.",
  "This is a red line. We are extremely serious. This is very much a red line.",
  "Let me be perfectly clear — we have no comment on that at this time.",
  "Our intelligence strongly suggests otherwise. We cannot reveal the source.",
  "We view this as a strictly bilateral matter, not subject to outside interference.",
  "We call for calm, restraint, and also for them to stop immediately.",
  "This conversation never happened. Please delete my number.",
  "We are monitoring the situation very closely. Very, very closely indeed.",
];

const PHASES = ["WORLD EVENT", "NEGOTIATION", "ACTION", "RESOLUTION", "UPDATE"];
const PHASE_DESCS = [
  "The Moderator reveals this round's global crisis.",
  "Pure unstructured chaos. Form alliances, issue threats, make side deals. Lying is encouraged.",
  "Each player declares their ONE official action for the round.",
  "The Moderator resolves all declared actions. Wars settled. Votes counted.",
  "Update token counts and stats. Moderator announces standings.",
];

// ── STYLES ───────────────────────────────────────────────────

const S = {
  app: { fontFamily:"'Crimson Pro', Georgia, serif", minHeight:"100vh", background:"#0a0a12", color:"#e8e0d0", position:"relative", overflow:"hidden" },
  starfield: { position:"fixed", inset:0, pointerEvents:"none", zIndex:0 },
  page: { position:"relative", zIndex:1, minHeight:"100vh" },
  cinzel: { fontFamily:"'Cinzel', serif" },
  logo: { fontFamily:"'Cinzel', serif", fontSize:28, fontWeight:900, letterSpacing:"0.15em", color:"#c8a96e", textShadow:"0 0 30px rgba(200,169,110,0.4)" },
  card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(200,169,110,0.15)", borderRadius:12, padding:"1.5rem" },
  goldBtn: { fontFamily:"'Cinzel', serif", fontSize:13, letterSpacing:"0.15em", fontWeight:600, background:"linear-gradient(135deg,#c8a96e,#e8c878)", color:"#0a0a12", border:"none", borderRadius:8, padding:"0.75rem 2rem", cursor:"pointer", transition:"all 0.2s", textTransform:"uppercase" },
  ghostBtn: { fontFamily:"'Cinzel', serif", fontSize:12, letterSpacing:"0.1em", fontWeight:600, background:"transparent", color:"#c8a96e", border:"1px solid rgba(200,169,110,0.4)", borderRadius:8, padding:"0.65rem 1.5rem", cursor:"pointer", transition:"all 0.2s", textTransform:"uppercase" },
  input: { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(200,169,110,0.2)", borderRadius:8, padding:"0.75rem 1rem", color:"#e8e0d0", fontSize:15, fontFamily:"'Crimson Pro', serif", width:"100%", outline:"none", boxSizing:"border-box" },
  label: { fontSize:11, letterSpacing:"0.2em", color:"#888", textTransform:"uppercase", display:"block", marginBottom:6, fontFamily:"'Cinzel', serif" },
  badge: { fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", padding:"3px 10px", borderRadius:20, fontFamily:"'Cinzel', serif", fontWeight:600 },
  divider: { border:"none", borderTop:"1px solid rgba(200,169,110,0.15)", margin:"1.5rem 0" },
};

// ── STARFIELD ────────────────────────────────────────────────

function Starfield() {
  const canvasRef = useRef();
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d");
    c.width = window.innerWidth; c.height = window.innerHeight;
    const stars = Array.from({ length: 200 }, () => ({ x:Math.random()*c.width, y:Math.random()*c.height, r:Math.random()*1.5+0.2, a:Math.random() }));
    let raf;
    function draw() {
      ctx.clearRect(0,0,c.width,c.height);
      stars.forEach(s => { s.a += 0.005*(Math.random()-0.5); s.a = Math.max(0.1,Math.min(0.8,s.a)); ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle=`rgba(200,169,110,${s.a})`; ctx.fill(); });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} style={S.starfield} />;
}

// ── NAV ──────────────────────────────────────────────────────

function Nav({ user, onLogout, onNav }) {
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, background:"rgba(10,10,18,0.85)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(200,169,110,0.1)", padding:"0 2rem", display:"flex", alignItems:"center", justifyContent:"space-between", height:60 }}>
      <span style={{ ...S.logo, fontSize:20, cursor:"pointer" }} onClick={() => onNav("home")}>WORLD IN CHAOS</span>
      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
        {user ? (
          <>
            <span style={{ color:"#c8a96e", fontSize:13, fontFamily:"'Cinzel',serif" }}>{user.username}</span>
            <button style={S.ghostBtn} onClick={() => onNav("lobby")}>Rooms</button>
            <button style={S.ghostBtn} onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <button style={S.ghostBtn} onClick={() => onNav("login")}>Sign In</button>
            <button style={S.goldBtn} onClick={() => onNav("register")}>Join the War</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── HOME ─────────────────────────────────────────────────────

function HomePage({ onNav }) {
  return (
    <div style={{ paddingTop:60 }}>
      <div style={{ textAlign:"center", padding:"6rem 2rem 4rem" }}>
        <div style={{ fontSize:11, letterSpacing:"0.4em", color:"#c8a96e", textTransform:"uppercase", marginBottom:"1.5rem", fontFamily:"'Cinzel',serif" }}>The Unofficial, Unhinged, Totally Chaotic Diplomacy Game</div>
        <h1 style={{ ...S.cinzel, fontSize:"clamp(3rem,8vw,7rem)", fontWeight:900, color:"#c8a96e", margin:0, lineHeight:1, textShadow:"0 0 60px rgba(200,169,110,0.3)" }}>WORLD<br/>IN CHAOS</h1>
        <p style={{ fontSize:20, color:"#b0a090", maxWidth:640, margin:"2rem auto 0", lineHeight:1.6, fontStyle:"italic" }}>7 players. 5 rounds. Infinite betrayals.<br/>WARNING: May cause broken friendships and formal accusations of treason.</p>
        <div style={{ display:"flex", gap:"1rem", justifyContent:"center", marginTop:"2.5rem", flexWrap:"wrap" }}>
          <button style={{ ...S.goldBtn, fontSize:15, padding:"1rem 2.5rem" }} onClick={() => onNav("register")}>Enter the Arena</button>
          <button style={{ ...S.ghostBtn, fontSize:15, padding:"1rem 2.5rem" }} onClick={() => onNav("tutorial")}>How to Play</button>
        </div>
        <div style={{ marginTop:"3rem", fontSize:32, letterSpacing:"0.3em" }}>{Object.values(COUNTRIES).map(c=>c.flag).join("  ")}</div>
      </div>
      <div style={{ maxWidth:900, margin:"0 auto", padding:"0 2rem 6rem", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:"1.5rem" }}>
        {[["⚔","Declare War","Spend tokens, roll dice, crush your enemies. Win permanent stat boosts."],["🤝","Form Alliances","Work together for shared gains — then betray them at the right moment."],["🗳","Vote & Scheme","Call global votes, sanction enemies, manipulate outcomes. France counts double."],["🎭","Secret Objectives","Your hidden win condition. No one knows what you're really after."],["🌍","World Events","15 crisis cards that flip the board. Oil shocks. Cyber attacks. Nuclear bluffs."],["🗡","Betrayal Cards","Five special treachery moves. Double crosses, false flags, stabs in the back."]].map(([icon,title,desc])=>(
          <div key={title} style={{ ...S.card, textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:"0.75rem" }}>{icon}</div>
            <div style={{ ...S.cinzel, fontSize:14, letterSpacing:"0.1em", color:"#c8a96e", marginBottom:"0.5rem" }}>{title}</div>
            <div style={{ fontSize:14, color:"#a09080", lineHeight:1.6 }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AUTH ─────────────────────────────────────────────────────

function AuthPage({ mode, onAuth, onSwitch }) {
  const [form, setForm] = useState({ username:"", password:"", confirm:"" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  async function handle() {
    setErr(""); setLoading(true);
    try {
      if (!form.username.trim() || !form.password.trim()) { setErr("All fields required."); return; }
      if (!isLogin && form.password !== form.confirm) { setErr("Passwords do not match."); return; }
      if (!isLogin && form.username.length < 3) { setErr("Username must be at least 3 characters."); return; }
      const key = form.username.toLowerCase().replace(/[^a-z0-9_]/g,"_");
      if (isLogin) {
        const u = await dbGet(`users/${key}`);
        if (!u || u.password !== form.password) { setErr("Invalid username or password."); return; }
        onAuth(u);
      } else {
        const existing = await dbGet(`users/${key}`);
        if (existing) { setErr("Username already taken."); return; }
        const u = { username:form.username, key, id:genId(), password:form.password, wins:0, gamesPlayed:0, createdAt:Date.now() };
        await dbSet(`users/${key}`, u);
        onAuth(u);
      }
    } catch(e) { setErr("Connection error. Try again."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ paddingTop:60, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <div style={{ ...S.card, width:"100%", maxWidth:400, margin:"2rem" }}>
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ ...S.cinzel, fontSize:22, color:"#c8a96e", fontWeight:700 }}>{isLogin ? "Sign In" : "Join the War"}</div>
          <div style={{ fontSize:13, color:"#888", marginTop:6 }}>{isLogin ? "Welcome back, diplomat." : "Register your nation-state."}</div>
        </div>
        <label style={S.label}>Username</label>
        <input style={{ ...S.input, marginBottom:"1rem" }} value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))} placeholder="e.g. ChaosAgent007" onKeyDown={e=>e.key==="Enter"&&handle()} />
        <label style={S.label}>Password</label>
        <input style={{ ...S.input, marginBottom:!isLogin?"1rem":"1.5rem" }} type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handle()} />
        {!isLogin && <>
          <label style={S.label}>Confirm Password</label>
          <input style={{ ...S.input, marginBottom:"1.5rem" }} type="password" value={form.confirm} onChange={e=>setForm(f=>({...f,confirm:e.target.value}))} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handle()} />
        </>}
        {err && <div style={{ color:"#ff6b6b", fontSize:13, marginBottom:"1rem", textAlign:"center" }}>{err}</div>}
        <button style={{ ...S.goldBtn, width:"100%", opacity:loading?0.6:1 }} onClick={handle} disabled={loading}>{loading ? "..." : isLogin ? "Enter" : "Register"}</button>
        <div style={{ textAlign:"center", marginTop:"1rem", fontSize:13, color:"#888" }}>
          {isLogin ? "No account? " : "Already playing? "}
          <span style={{ color:"#c8a96e", cursor:"pointer", textDecoration:"underline" }} onClick={onSwitch}>{isLogin ? "Register" : "Sign In"}</span>
        </div>
      </div>
    </div>
  );
}

// ── TUTORIAL ─────────────────────────────────────────────────

function TutorialPage() {
  const [tab, setTab] = useState(0);
  const tabs = ["Overview","Tokens & Actions","Round Structure","War","Winning","Countries"];
  const content = [
    <div>
      <h2 style={{ ...S.cinzel, color:"#c8a96e" }}>The Idea</h2>
      <p style={{ lineHeight:1.8 }}>Each of the 7 players controls a country with stats, tokens, a unique special ability, and a <b style={{ color:"#c8a96e" }}>Secret Objective</b> — a hidden win condition only you know.</p>
      <p style={{ lineHeight:1.8, marginTop:"1rem" }}>Over <b style={{ color:"#c8a96e" }}>5 rounds</b>, you'll negotiate, lie, form alliances, spectacularly betray those alliances, and cause diplomatic catastrophes.</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12, marginTop:"1.5rem" }}>
        {[["7 Players","One country each"],["1 Moderator","Runs events & resolves disputes"],["5 Rounds","~10–15 min each"],["Secret Objectives","Hidden win conditions"]].map(([t,s])=>(
          <div key={t} style={{ ...S.card, textAlign:"center" }}><div style={{ ...S.cinzel, color:"#c8a96e", fontSize:15, marginBottom:4 }}>{t}</div><div style={{ fontSize:13, color:"#888" }}>{s}</div></div>
        ))}
      </div>
    </div>,
    <div>
      <h2 style={{ ...S.cinzel, color:"#c8a96e", marginBottom:"1rem" }}>Actions & Costs</h2>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
        <thead><tr style={{ borderBottom:"1px solid rgba(200,169,110,0.3)" }}><th style={{ ...S.cinzel, textAlign:"left", padding:"8px 12px", color:"#c8a96e", fontSize:11 }}>Action</th><th style={{ ...S.cinzel, textAlign:"center", padding:"8px 12px", color:"#c8a96e", fontSize:11 }}>Cost</th><th style={{ ...S.cinzel, textAlign:"left", padding:"8px 12px", color:"#c8a96e", fontSize:11 }}>Effect</th></tr></thead>
        <tbody>{[["Form Alliance","Free","Mutual agreement + public announcement"],["Declare War","3 tokens","Dice roll + Military stat"],["Trade Deal","2 tokens","Both gain +1 Economy if within 2 stat pts"],["Sabotage","2 tokens","Target loses tokens next round"],["Global Vote","1 token","Simple majority. France counts double."],["Special Ability","Varies","Check your Country Card"],["Betray Ally","Free*","Need a Betrayal Card from Moderator first"]].map(([a,c,e])=>(
          <tr key={a} style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}><td style={{ padding:"8px 12px", color:"#e8e0d0" }}>{a}</td><td style={{ padding:"8px 12px", textAlign:"center", color:"#c8a96e", fontWeight:600 }}>{c}</td><td style={{ padding:"8px 12px", color:"#a09080", fontSize:13 }}>{e}</td></tr>
        ))}</tbody>
      </table>
      <div style={{ marginTop:"1.5rem", padding:"1rem", background:"rgba(200,100,100,0.08)", borderLeft:"3px solid #c84444", borderRadius:4 }}>
        <b style={{ color:"#ff6b6b" }}>PUPPET STATE:</b> <span style={{ color:"#b0a090" }}>If you reach 0 tokens, you must beg another country for a loan of at least 3 tokens. The lender controls ONE of your actions per round until repaid.</span>
      </div>
    </div>,
    <div>
      <h2 style={{ ...S.cinzel, color:"#c8a96e", marginBottom:"1rem" }}>5 Phases Per Round</h2>
      {PHASES.map((ph,i)=>(
        <div key={ph} style={{ display:"flex", gap:"1rem", marginBottom:"1rem", alignItems:"flex-start" }}>
          <div style={{ ...S.cinzel, fontSize:11, color:"#c8a96e", background:"rgba(200,169,110,0.1)", border:"1px solid rgba(200,169,110,0.3)", borderRadius:6, padding:"4px 10px", whiteSpace:"nowrap", minWidth:80, textAlign:"center", marginTop:2 }}>Phase {i+1}</div>
          <div><div style={{ ...S.cinzel, fontSize:14, color:"#c8a96e", marginBottom:4 }}>{ph}</div><div style={{ fontSize:14, color:"#a09080", lineHeight:1.6 }}>{PHASE_DESCS[i]}</div></div>
        </div>
      ))}
    </div>,
    <div>
      <h2 style={{ ...S.cinzel, color:"#c8a96e", marginBottom:"1rem" }}>War Resolution</h2>
      {["Both sides spend 3 tokens upfront. Attacker pays first.","Each player rolls 2 dice and adds their current Military stat.","Allies may support: each ally adds +2 to your roll by spending 1 token.","Highest total wins. Ties always go to the defender.","Winner gains: +1 Military permanently, +2 tokens from the loser.","Loser loses: the 3 tokens spent plus 2 more. Military drops by 1.","If loser hits 0 tokens — Puppet State rules apply immediately."].map((step,i)=>(
        <div key={i} style={{ display:"flex", gap:"1rem", marginBottom:"1rem" }}><div style={{ ...S.cinzel, color:"#c8a96e", fontSize:18, minWidth:24, fontWeight:700 }}>{i+1}</div><div style={{ fontSize:15, color:"#b0a090", lineHeight:1.6 }}>{step}</div></div>
      ))}
    </div>,
    <div>
      <h2 style={{ ...S.cinzel, color:"#c8a96e", marginBottom:"1rem" }}>Scoring</h2>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
        <thead><tr style={{ borderBottom:"1px solid rgba(200,169,110,0.3)" }}><th style={{ ...S.cinzel, textAlign:"left", padding:"8px 12px", color:"#c8a96e", fontSize:11 }}>Condition</th><th style={{ ...S.cinzel, textAlign:"center", padding:"8px 12px", color:"#c8a96e", fontSize:11 }}>Points</th></tr></thead>
        <tbody>{[["Completed Secret Objective","5 pts"],["Completed bonus condition","+2 or +3 pts"],["Highest combined stat total","3 pts"],["Most tokens remaining","2 pts"],["Won at least 2 wars","1 pt per war"],["Survived all 5 rounds unsanctioned","1 pt"],["Group votes Most Entertaining","2 pts"]].map(([c,p])=>(
          <tr key={c} style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}><td style={{ padding:"8px 12px", color:"#e8e0d0" }}>{c}</td><td style={{ padding:"8px 12px", textAlign:"center", color:"#c8a96e", fontWeight:600 }}>{p}</td></tr>
        ))}</tbody>
      </table>
    </div>,
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:"1rem" }}>
      {Object.values(COUNTRIES).map(c=>(
        <div key={c.name} style={{ ...S.card, borderColor:c.accent+"33" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}><span style={{ fontSize:24 }}>{c.flag}</span><div><div style={{ ...S.cinzel, fontSize:13, color:c.accent }}>{c.name}</div><div style={{ fontSize:11, color:"#888", fontStyle:"italic" }}>{c.title}</div></div></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, marginBottom:8 }}>{Object.entries(c.stats).map(([k,v])=><div key={k} style={{ fontSize:12 }}><span style={{ color:"#888" }}>{k}: </span><span style={{ color:"#c8a96e", fontWeight:600 }}>{v}</span></div>)}</div>
          <div style={{ fontSize:12, color:"#a09080", borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:8 }}>⚡ <b style={{ color:c.accent }}>{c.ability.name}:</b> {c.ability.desc}</div>
        </div>
      ))}
    </div>,
  ];

  return (
    <div style={{ paddingTop:60, maxWidth:900, margin:"0 auto", padding:"80px 2rem 4rem" }}>
      <h1 style={{ ...S.cinzel, color:"#c8a96e", marginBottom:"0.5rem" }}>How to Play</h1>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:"2rem" }}>
        {tabs.map((t,i)=><button key={t} onClick={()=>setTab(i)} style={{ ...S.ghostBtn, fontSize:11, padding:"0.4rem 1rem", borderColor:tab===i?"#c8a96e":"rgba(200,169,110,0.2)", color:tab===i?"#c8a96e":"#888" }}>{t}</button>)}
      </div>
      <div style={{ ...S.card }}>{content[tab]}</div>
    </div>
  );
}

// ── LOBBY ────────────────────────────────────────────────────

function LobbyPage({ user, onJoin }) {
  const [rooms, setRooms] = useState([]);
  const [creating, setCreating] = useState(false);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    const unsub = onValue(ref(db,"rooms"), snap => {
      if (snap.exists()) setRooms(Object.values(snap.val()));
      else setRooms([]);
    });
    return () => unsub();
  }, []);

  async function createRoom() {
    if (!roomName.trim()) return;
    const code = genId();
    const room = { id:code, name:roomName.trim(), host:user.username, players:[{ username:user.username, id:user.id, country:null, ready:false }], status:"waiting", createdAt:Date.now(), chatLog:[], gameState:null };
    await dbSet(`rooms/${code}`, room);
    setCreating(false); setRoomName(""); onJoin(code);
  }

  async function joinRoom(code) {
    const r = await dbGet(`rooms/${code}`);
    if (!r || r.status !== "waiting") return;
    const players = r.players || [];
    if (players.find(p=>p.username===user.username)) { onJoin(code); return; }
    if (players.length >= 8) return;
    players.push({ username:user.username, id:user.id, country:null, ready:false });
    await dbUpdate(`rooms/${code}`, { players });
    onJoin(code);
  }

  return (
    <div style={{ paddingTop:60, maxWidth:900, margin:"0 auto", padding:"80px 2rem 4rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2rem" }}>
        <div><h1 style={{ ...S.cinzel, color:"#c8a96e", margin:0 }}>War Rooms</h1><div style={{ color:"#888", fontSize:13, marginTop:4 }}>Find your battlefield or create one.</div></div>
        <button style={S.goldBtn} onClick={()=>setCreating(true)}>+ Create Room</button>
      </div>
      {creating && (
        <div style={{ ...S.card, marginBottom:"1.5rem", borderColor:"rgba(200,169,110,0.4)" }}>
          <div style={{ ...S.cinzel, color:"#c8a96e", marginBottom:"1rem" }}>New War Room</div>
          <input style={{ ...S.input, marginBottom:"1rem" }} placeholder="Room name..." value={roomName} onChange={e=>setRoomName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createRoom()} />
          <div style={{ display:"flex", gap:8 }}><button style={S.goldBtn} onClick={createRoom}>Create</button><button style={S.ghostBtn} onClick={()=>setCreating(false)}>Cancel</button></div>
        </div>
      )}
      {rooms.length === 0 ? (
        <div style={{ textAlign:"center", padding:"4rem", color:"#888" }}><div style={{ fontSize:40, marginBottom:"1rem" }}>🌍</div><div style={{ ...S.cinzel, color:"#c8a96e", marginBottom:8 }}>No rooms yet</div><div style={{ fontSize:13 }}>Create one and start the chaos.</div></div>
      ) : (
        <div style={{ display:"grid", gap:"1rem" }}>
          {rooms.sort((a,b)=>b.createdAt-a.createdAt).map(r=>(
            <div key={r.id} style={{ ...S.card, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ ...S.cinzel, color:"#e8e0d0", fontSize:16 }}>{r.name}</div>
                <div style={{ fontSize:13, color:"#888", marginTop:4 }}>Host: {r.host} · {(r.players||[]).length}/8 players · Code: <span style={{ color:"#c8a96e" }}>{r.id}</span></div>
                <div style={{ marginTop:6 }}><span style={{ ...S.badge, background:r.status==="waiting"?"rgba(0,180,100,0.1)":"rgba(200,100,0,0.1)", color:r.status==="waiting"?"#00b464":"#c87800" }}>{r.status==="waiting"?"Open":r.status==="active"?"In Progress":"Finished"}</span></div>
              </div>
              {r.status==="waiting" && <button style={(r.players||[]).find(p=>p.username===user.username)?S.goldBtn:S.ghostBtn} onClick={()=>joinRoom(r.id)}>{(r.players||[]).find(p=>p.username===user.username)?"Re-enter":"Join"}</button>}
              {r.status==="active" && (r.players||[]).find(p=>p.username===user.username) && <button style={S.goldBtn} onClick={()=>onJoin(r.id)}>Rejoin</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ROOM PRE-GAME ────────────────────────────────────────────

function RoomPage({ user, roomId, onLeave }) {
  const [room, setRoom] = useState(null);
  const [msg, setMsg] = useState("");
  const chatRef = useRef();

  useEffect(() => {
    const unsub = onValue(ref(db,`rooms/${roomId}`), snap => {
      if (snap.exists()) setRoom(snap.val());
    });
    return () => unsub();
  }, [roomId]);

  useEffect(() => { if(chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [room?.chatLog]);

  if (!room) return <div style={{ paddingTop:80, textAlign:"center", color:"#888" }}>Loading room...</div>;

  if (room.status === "active" && room.gameState) return <GamePage user={user} roomId={roomId} onLeave={onLeave} />;

  const me = (room.players||[]).find(p=>p.username===user.username);
  const isHost = room.host === user.username;
  const countryList = Object.keys(COUNTRIES);
  const taken = (room.players||[]).map(p=>p.country).filter(Boolean);

  async function pickCountry(c) {
    const players = [...(room.players||[])];
    const idx = players.findIndex(p=>p.username===user.username);
    if (idx===-1) return;
    if (taken.includes(c) && players[idx].country !== c) return;
    players[idx] = { ...players[idx], country: players[idx].country===c ? null : c };
    await dbUpdate(`rooms/${roomId}`, { players });
  }

  async function toggleReady() {
    if (!me?.country) return;
    const players = [...(room.players||[])];
    const idx = players.findIndex(p=>p.username===user.username);
    players[idx] = { ...players[idx], ready:!players[idx].ready };
    await dbUpdate(`rooms/${roomId}`, { players });
  }

  async function sendChat() {
    if (!msg.trim()) return;
    const log = [...(room.chatLog||[]), { from:user.username, text:msg.trim(), ts:Date.now() }];
    await dbUpdate(`rooms/${roomId}`, { chatLog:log });
    setMsg("");
  }

  async function startGame() {
    const players = room.players || [];
    if (players.length < 2) return;
    const objs = shuffle(OBJECTIVES).slice(0,players.length);
    const phrases = shuffle(DIPLOMATIC_PHRASES).slice(0,players.length);
    const events = shuffle(WORLD_EVENTS).slice(0,5);
    const gs = {
      round:1, phase:0, status:"active",
      activeEvent: events[0] || null,
      events,
      players: players.map((p,i) => {
        const cn = p.country || countryList[i % 7];
        const cd = COUNTRIES[cn];
        return { username:p.username, country:cn, tokens:cd.tokens, stats:{...cd.stats}, objective:objs[i], phrase:phrases[i], alliances:[], wars_won:0, sanctioned:false, puppet:false, score:0 };
      }),
      diplomacyLog: [{ type:"event", text:`🌍 ROUND 1 — ${events[0]?.title}: ${events[0]?.desc}` }],
    };
    applyEventEffect(gs, gs.activeEvent);
    await dbUpdate(`rooms/${roomId}`, { gameState:gs, status:"active" });
  }

  return (
    <div style={{ paddingTop:60, maxWidth:1100, margin:"0 auto", padding:"80px 2rem 4rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2rem" }}>
        <div><h1 style={{ ...S.cinzel, color:"#c8a96e", margin:0 }}>{room.name}</h1><div style={{ color:"#888", fontSize:13, marginTop:4 }}>Room Code: <span style={{ color:"#c8a96e", fontWeight:600 }}>{roomId}</span> · Share with friends</div></div>
        <button style={S.ghostBtn} onClick={onLeave}>← Leave</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:"1.5rem" }}>
        <div>
          <div style={{ ...S.card, marginBottom:"1.5rem" }}>
            <div style={{ ...S.cinzel, color:"#c8a96e", fontSize:13, marginBottom:"1rem" }}>Players ({(room.players||[]).length}/8)</div>
            <div style={{ display:"grid", gap:8 }}>
              {(room.players||[]).map(p=>(
                <div key={p.username} style={{ display:"flex", alignItems:"center", gap:12, padding:"0.75rem", background:"rgba(255,255,255,0.03)", borderRadius:8, border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(200,169,110,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:600, color:"#c8a96e", fontFamily:"Cinzel,serif" }}>{p.username[0].toUpperCase()}</div>
                  <div style={{ flex:1 }}><div style={{ fontSize:14, color:p.username===user.username?"#c8a96e":"#e8e0d0" }}>{p.username} {room.host===p.username&&"👑"}</div><div style={{ fontSize:12, color:"#888" }}>{p.country?`${COUNTRIES[p.country]?.flag} ${p.country}`:"No country selected"}</div></div>
                  <span style={{ ...S.badge, background:p.ready?"rgba(0,180,100,0.1)":"rgba(200,169,110,0.05)", color:p.ready?"#00b464":"#888" }}>{p.ready?"Ready":"Waiting"}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ ...S.card }}>
            <div style={{ ...S.cinzel, color:"#c8a96e", fontSize:13, marginBottom:"1rem" }}>Pick Your Country</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:8 }}>
              {countryList.map(cn=>{
                const cd=COUNTRIES[cn]; const isMine=me?.country===cn; const isTaken=taken.includes(cn)&&!isMine;
                return <div key={cn} onClick={()=>!isTaken&&pickCountry(cn)} style={{ ...S.card, padding:"1rem", cursor:isTaken?"not-allowed":"pointer", opacity:isTaken?0.4:1, borderColor:isMine?cd.accent:"rgba(200,169,110,0.1)", background:isMine?`${cd.accent}15`:"rgba(255,255,255,0.02)", transition:"all 0.2s" }}>
                  <div style={{ fontSize:28, textAlign:"center" }}>{cd.flag}</div>
                  <div style={{ ...S.cinzel, fontSize:12, textAlign:"center", color:isMine?cd.accent:"#c8a96e", marginTop:6 }}>{cn}</div>
                  <div style={{ fontSize:11, textAlign:"center", color:"#888", marginTop:2 }}>{cd.tokens} tokens</div>
                </div>;
              })}
            </div>
          </div>
          <div style={{ display:"flex", gap:12, marginTop:"1.5rem" }}>
            <button style={{ ...S.goldBtn, opacity:me?.country?1:0.5 }} onClick={toggleReady} disabled={!me?.country}>{me?.ready?"✓ Ready!":"Mark Ready"}</button>
            {isHost && <button style={{ ...S.goldBtn, background:"linear-gradient(135deg,#c84444,#e85050)" }} onClick={startGame}>⚔ Start Game</button>}
          </div>
        </div>
        <div style={{ ...S.card, display:"flex", flexDirection:"column", height:"60vh" }}>
          <div style={{ ...S.cinzel, color:"#c8a96e", fontSize:13, marginBottom:"1rem" }}>Diplomacy Chat</div>
          <div ref={chatRef} style={{ flex:1, overflowY:"auto", marginBottom:"1rem" }}>
            {(room.chatLog||[]).length===0 && <div style={{ color:"#555", fontSize:13, textAlign:"center", marginTop:"2rem" }}>No messages yet...</div>}
            {(room.chatLog||[]).map((m,i)=><div key={i} style={{ marginBottom:8 }}><span style={{ color:"#c8a96e", fontSize:12, fontFamily:"Cinzel,serif" }}>{m.from}: </span><span style={{ fontSize:14, color:"#b0a090" }}>{m.text}</span></div>)}
          </div>
          <div style={{ display:"flex", gap:8 }}><input style={{ ...S.input, fontSize:13 }} placeholder="Message..." value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} /><button style={{ ...S.goldBtn, padding:"0.75rem 1rem", fontSize:12 }} onClick={sendChat}>↑</button></div>
        </div>
      </div>
    </div>
  );
}

// ── EVENT EFFECTS ─────────────────────────────────────────────

function applyEventEffect(gs, ev) {
  if (!ev) return;
  switch(ev.effect) {
    case "economy_crash": { const richest = [...gs.players].sort((a,b)=>b.tokens-a.tokens)[0]; gs.players.forEach(p => { p.tokens = Math.max(0, p.tokens - (p.username===richest.username ? 3 : 2)); }); break; }
    case "oil_shortage": gs.players.forEach(p => { if(p.country!=="Saudi Arabia") p.tokens=Math.max(0,p.tokens-1); else p.tokens+=2; }); break;
    case "arms_race": gs.players.forEach(p => { p.stats.Military=Math.min(12,p.stats.Military+1); }); break;
    case "tech_rev": { const top=[...gs.players].sort((a,b)=>b.stats.Tech-a.stats.Tech)[0]; top.tokens+=3; break; }
    case "climate": gs.players.forEach(p => { if(p.country!=="N. Korea") p.tokens=Math.max(0,p.tokens-1); }); break;
    default: break;
  }
}

// ── GAME PAGE ─────────────────────────────────────────────────

function GamePage({ user, roomId, onLeave }) {
  const [room, setRoom] = useState(null);
  const [tab, setTab] = useState("board");
  const [msg, setMsg] = useState("");
  const chatRef = useRef();

  useEffect(() => {
    const unsub = onValue(ref(db,`rooms/${roomId}`), snap => {
      if (snap.exists()) setRoom(snap.val());
    });
    return () => unsub();
  }, [roomId]);

  useEffect(() => { if(chatRef.current) chatRef.current.scrollTop=chatRef.current.scrollHeight; }, [room?.chatLog]);

  if (!room || !room.gameState) return <div style={{ paddingTop:80, textAlign:"center", color:"#888" }}>Loading game...</div>;

  const gs = room.gameState;
  const me = gs.players.find(p=>p.username===user.username);
  const isHost = room.host === user.username;
  const isFinished = gs.status === "finished" || room.status === "finished";

  async function sendChat() {
    if (!msg.trim()) return;
    const log = [...(room.chatLog||[]), { from:user.username, text:msg.trim(), ts:Date.now() }];
    await dbUpdate(`rooms/${roomId}`, { chatLog:log });
    setMsg("");
  }

  async function advancePhase() {
    const r = await dbGet(`rooms/${roomId}`);
    const g = JSON.parse(JSON.stringify(r.gameState));
    g.diplomacyLog = g.diplomacyLog || [];

    if (g.phase < 4) {
      g.phase++;
    } else {
      if (g.round < 5) {
        g.round++;
        g.phase = 0;
        // passive bonuses at round start
        g.players.forEach(p => { if(p.country==="USA") p.tokens+=1; });
        const nextEv = g.events[g.round-1] || null;
        g.activeEvent = nextEv;
        if (nextEv) {
          g.diplomacyLog.push({ type:"event", text:`🌍 ROUND ${g.round} — ${nextEv.title}: ${nextEv.desc}` });
          applyEventEffect(g, nextEv);
        }
      } else {
        g.status = "finished";
        // final scoring
        const maxStat = Math.max(...g.players.map(p=>Object.values(p.stats).reduce((a,b)=>a+b,0)));
        const maxTok = Math.max(...g.players.map(p=>p.tokens));
        g.players.forEach(p => {
          p.score = (p.wars_won||0) >= 2 ? (p.wars_won||0) : 0;
          const total = Object.values(p.stats).reduce((a,b)=>a+b,0);
          if(total===maxStat) p.score+=3;
          if(p.tokens===maxTok) p.score+=2;
          if(!p.sanctioned) p.score+=1;
        });
        await dbUpdate(`rooms/${roomId}`, { gameState:g, status:"finished" });
        return;
      }
    }
    await dbUpdate(`rooms/${roomId}`, { gameState:g });
  }

  async function declareWar(defenderUsername) {
    const r = await dbGet(`rooms/${roomId}`);
    const g = JSON.parse(JSON.stringify(r.gameState));
    const att = g.players.find(p=>p.username===user.username);
    const def = g.players.find(p=>p.username===defenderUsername);
    if (!att||!def||att.tokens<3) return;
    att.tokens-=3; def.tokens=Math.max(0,def.tokens-3);
    const attRoll = Math.floor(Math.random()*6)+1+Math.floor(Math.random()*6)+1+att.stats.Military;
    const defRoll = Math.floor(Math.random()*6)+1+Math.floor(Math.random()*6)+1+def.stats.Military;
    const attWins = attRoll > defRoll;
    if (attWins) { att.stats.Military=Math.min(12,att.stats.Military+1); att.tokens+=2; def.tokens=Math.max(0,def.tokens-2); def.stats.Military=Math.max(1,def.stats.Military-1); att.wars_won=(att.wars_won||0)+1; }
    else { def.stats.Military=Math.min(12,def.stats.Military+1); def.tokens+=2; att.tokens=Math.max(0,att.tokens-2); att.stats.Military=Math.max(1,att.stats.Military-1); def.wars_won=(def.wars_won||0)+1; }
    if (att.tokens===0) att.puppet=true; if (def.tokens===0) def.puppet=true;
    g.diplomacyLog = g.diplomacyLog||[];
    g.diplomacyLog.push({ type:"war", text:`⚔ WAR: ${att.username} (${attRoll}) vs ${def.username} (${defRoll}) — ${attWins?att.username:def.username} WINS! Attacker rolled ${attRoll}, Defender rolled ${defRoll}.` });
    await dbUpdate(`rooms/${roomId}`, { gameState:g });
  }

  async function formAlliance(targetUsername) {
    const r = await dbGet(`rooms/${roomId}`);
    const g = JSON.parse(JSON.stringify(r.gameState));
    const pa = g.players.find(p=>p.username===user.username);
    const pb = g.players.find(p=>p.username===targetUsername);
    if (!pa||!pb) return;
    if (!pa.alliances) pa.alliances=[];
    if (!pb.alliances) pb.alliances=[];
    if (!pa.alliances.includes(targetUsername)) pa.alliances.push(targetUsername);
    if (!pb.alliances.includes(user.username)) pb.alliances.push(user.username);
    pa.tokens+=1; pb.tokens+=1;
    g.diplomacyLog=g.diplomacyLog||[];
    g.diplomacyLog.push({ type:"alliance", text:`🤝 ALLIANCE: ${user.username} (${pa.country}) and ${targetUsername} (${pb.country}) have formed an alliance! Both gain +1 token.` });
    await dbUpdate(`rooms/${roomId}`, { gameState:g });
  }

  async function doTrade(targetUsername) {
    const r = await dbGet(`rooms/${roomId}`);
    const g = JSON.parse(JSON.stringify(r.gameState));
    const pa = g.players.find(p=>p.username===user.username);
    const pb = g.players.find(p=>p.username===targetUsername);
    if (!pa||!pb||pa.tokens<2) return;
    pa.tokens-=2; pa.tokens+=1; pb.tokens+=1;
    g.diplomacyLog=g.diplomacyLog||[];
    g.diplomacyLog.push({ type:"trade", text:`💱 TRADE DEAL: ${user.username} and ${targetUsername} completed a trade deal. Both gain +1 Economy token.` });
    await dbUpdate(`rooms/${roomId}`, { gameState:g });
  }

  const logColors = { event:"#c8a96e", war:"#ff6b6b", alliance:"#64d48a", trade:"#64b4ff", betrayal:"#ff9966", vote:"#c864ff" };

  if (isFinished) {
    const sorted = [...gs.players].sort((a,b)=>b.score-a.score);
    return (
      <div style={{ paddingTop:60, maxWidth:700, margin:"0 auto", padding:"80px 2rem 4rem", textAlign:"center" }}>
        <h1 style={{ ...S.cinzel, color:"#c8a96e", fontSize:40, marginBottom:8 }}>GAME OVER</h1>
        <p style={{ color:"#888", marginBottom:"3rem", fontStyle:"italic" }}>The dust settles. The world counts its dead.</p>
        {sorted.map((p,i)=>(
          <div key={p.username} style={{ ...S.card, display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1rem", borderColor:i===0?"#c8a96e":"rgba(200,169,110,0.1)" }}>
            <div style={{ ...S.cinzel, fontSize:24, color:i===0?"#c8a96e":"#888", minWidth:36 }}>#{i+1}</div>
            <div style={{ fontSize:28 }}>{COUNTRIES[p.country]?.flag}</div>
            <div style={{ flex:1, textAlign:"left" }}><div style={{ ...S.cinzel, color:i===0?"#c8a96e":"#e8e0d0" }}>{p.username} — {p.country}</div><div style={{ fontSize:12, color:"#888" }}>{p.objective?.title}</div></div>
            <div style={{ ...S.cinzel, fontSize:24, color:"#c8a96e" }}>{p.score} pts</div>
          </div>
        ))}
        <button style={{ ...S.ghostBtn, marginTop:"2rem" }} onClick={onLeave}>Back to Lobby</button>
      </div>
    );
  }

  return (
    <div style={{ paddingTop:60, background:"#0a0a12", minHeight:"100vh" }}>
      {/* Phase bar */}
      <div style={{ background:"rgba(0,0,0,0.4)", borderBottom:"1px solid rgba(200,169,110,0.15)", padding:"0.5rem 1.5rem", display:"flex", alignItems:"center", gap:"1.5rem", flexWrap:"wrap" }}>
        <div style={{ ...S.cinzel, color:"#c8a96e", fontSize:13 }}>Round {gs.round}/5</div>
        <div style={{ display:"flex", gap:4 }}>
          {PHASES.map((ph,i)=><div key={ph} style={{ ...S.cinzel, fontSize:9, letterSpacing:"0.1em", padding:"3px 10px", borderRadius:4, background:gs.phase===i?"rgba(200,169,110,0.2)":"transparent", color:gs.phase===i?"#c8a96e":"#444", border:gs.phase===i?"1px solid rgba(200,169,110,0.4)":"1px solid transparent" }}>{ph}</div>)}
        </div>
        <div style={{ flex:1 }} />
        {gs.activeEvent && <div style={{ fontSize:12, color:"#c8a96e", fontStyle:"italic" }}>⚡ {gs.activeEvent.title}</div>}
        {isHost && <button style={{ ...S.goldBtn, fontSize:11, padding:"0.4rem 1rem" }} onClick={advancePhase}>{gs.phase<4?`Next: ${PHASES[gs.phase+1]}`:gs.round<5?"Next Round →":"End Game"}</button>}
        <button onClick={onLeave} style={{ ...S.ghostBtn, fontSize:11, padding:"0.35rem 0.9rem" }}>Leave</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"240px 1fr 280px", height:"calc(100vh - 120px)" }}>
        {/* Left panel */}
        <div style={{ borderRight:"1px solid rgba(200,169,110,0.1)", overflowY:"auto", padding:"1rem" }}>
          {me && (()=>{
            const cd=COUNTRIES[me.country];
            return <div>
              <div style={{ textAlign:"center", marginBottom:"1rem" }}>
                <div style={{ fontSize:40 }}>{cd?.flag}</div>
                <div style={{ ...S.cinzel, color:cd?.accent||"#c8a96e", fontSize:16, marginTop:4 }}>{me.country}</div>
                <div style={{ fontSize:11, color:"#888" }}>{me.username}</div>
                {me.puppet && <div style={{ ...S.badge, background:"rgba(200,0,0,0.15)", color:"#ff6b6b", display:"inline-block", marginTop:6 }}>PUPPET STATE</div>}
              </div>
              <div style={{ ...S.card, marginBottom:"1rem" }}>
                <div style={{ ...S.cinzel, fontSize:10, color:"#c8a96e", marginBottom:8, letterSpacing:"0.15em" }}>Resources</div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ fontSize:13, color:"#888" }}>Tokens</span><span style={{ ...S.cinzel, color:"#c8a96e", fontSize:18 }}>{me.tokens}</span></div>
                {Object.entries(me.stats).map(([k,v])=>(
                  <div key={k} style={{ marginBottom:6 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:2 }}><span style={{ color:"#888" }}>{k}</span><span style={{ color:"#c8a96e" }}>{v}</span></div>
                    <div style={{ height:3, background:"rgba(255,255,255,0.1)", borderRadius:2 }}><div style={{ height:3, background:cd?.accent||"#c8a96e", borderRadius:2, width:`${(v/12)*100}%`, transition:"width 0.5s" }} /></div>
                  </div>
                ))}
              </div>
              <div style={{ ...S.card, marginBottom:"1rem", borderColor:"rgba(200,169,110,0.3)" }}>
                <div style={{ ...S.cinzel, fontSize:10, color:"#c8a96e", marginBottom:6, letterSpacing:"0.15em" }}>Secret Objective</div>
                <div style={{ ...S.cinzel, fontSize:13, color:"#e8e0d0", marginBottom:6 }}>{me.objective?.title}</div>
                <div style={{ fontSize:12, color:"#a09080", lineHeight:1.6 }}>{me.objective?.obj}</div>
                <div style={{ fontSize:11, color:"#888", marginTop:6, fontStyle:"italic" }}>💡 {me.objective?.hint}</div>
                <div style={{ fontSize:11, color:"#c8a96e", marginTop:6 }}>Bonus: {me.objective?.bonus}</div>
              </div>
              <div style={{ ...S.card, marginBottom:"1rem" }}>
                <div style={{ ...S.cinzel, fontSize:10, color:"#c8a96e", marginBottom:6, letterSpacing:"0.15em" }}>Diplomatic Phrase</div>
                <div style={{ fontSize:12, color:"#a09080", fontStyle:"italic", lineHeight:1.6 }}>"{me.phrase}"</div>
              </div>
              {(me.alliances||[]).length>0 && <div style={{ ...S.card }}><div style={{ ...S.cinzel, fontSize:10, color:"#64d48a", marginBottom:6, letterSpacing:"0.15em" }}>Alliances</div>{me.alliances.map(a=><div key={a} style={{ fontSize:12, color:"#64d48a" }}>🤝 {a}</div>)}</div>}
            </div>;
          })()}
        </div>

        {/* Center board */}
        <div style={{ overflowY:"auto", padding:"1.5rem" }}>
          <div style={{ display:"flex", gap:8, marginBottom:"1.5rem", flexWrap:"wrap" }}>
            {["board","actions","events","objectives"].map(t=><button key={t} onClick={()=>setTab(t)} style={{ ...S.ghostBtn, fontSize:11, padding:"0.35rem 0.9rem", borderColor:tab===t?"#c8a96e":"rgba(200,169,110,0.15)", color:tab===t?"#c8a96e":"#666" }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
          </div>

          {tab==="board" && <div>
            {gs.activeEvent && <div style={{ ...S.card, borderColor:"rgba(200,169,110,0.5)", marginBottom:"1.5rem", background:"rgba(200,169,110,0.05)" }}>
              <div style={{ ...S.cinzel, color:"#c8a96e", fontSize:11, letterSpacing:"0.2em", marginBottom:6 }}>⚡ World Event — Round {gs.round}</div>
              <div style={{ ...S.cinzel, color:"#e8e0d0", fontSize:16, marginBottom:8 }}>{gs.activeEvent.title}</div>
              <div style={{ fontSize:14, color:"#b0a090", lineHeight:1.7 }}>{gs.activeEvent.desc}</div>
            </div>}
            <div style={{ ...S.cinzel, color:"#888", fontSize:11, letterSpacing:"0.2em", marginBottom:"1rem" }}>Nations — Phase {gs.phase+1}: {PHASES[gs.phase]}</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"1rem" }}>
              {gs.players.map(p=>{
                const cd=COUNTRIES[p.country]; const isMe=p.username===user.username;
                return <div key={p.username} style={{ ...S.card, borderColor:isMe?(cd?.accent||"#c8a96e")+"66":"rgba(200,169,110,0.1)", background:isMe?`${cd?.accent||"#c8a96e"}08`:"rgba(255,255,255,0.02)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}><span style={{ fontSize:22 }}>{cd?.flag}</span><div><div style={{ ...S.cinzel, fontSize:12, color:cd?.accent||"#c8a96e" }}>{p.country}</div><div style={{ fontSize:11, color:"#888" }}>{p.username}{isMe&&" (you)"}</div></div>{p.puppet&&<span style={{ ...S.badge, background:"rgba(200,0,0,0.15)", color:"#ff6b6b", marginLeft:"auto" }}>Puppet</span>}</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, fontSize:12, marginBottom:8 }}><div><span style={{ color:"#888" }}>Tokens: </span><span style={{ color:"#c8a96e" }}>{p.tokens}</span></div>{Object.entries(p.stats).map(([k,v])=><div key={k}><span style={{ color:"#888" }}>{k.slice(0,3)}: </span><span style={{ color:"#c8a96e" }}>{v}</span></div>)}</div>
                  {(p.alliances||[]).length>0 && <div style={{ fontSize:11, color:"#64d48a", marginBottom:8 }}>🤝 {p.alliances.join(", ")}</div>}
                  {gs.phase===2 && !isMe && me && <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                    {me.tokens>=3 && <button style={{ ...S.ghostBtn, fontSize:10, padding:"3px 8px", color:"#ff6b6b", borderColor:"rgba(255,107,107,0.3)" }} onClick={()=>declareWar(p.username)}>⚔ War</button>}
                    <button style={{ ...S.ghostBtn, fontSize:10, padding:"3px 8px", color:"#64d48a", borderColor:"rgba(100,212,138,0.3)" }} onClick={()=>formAlliance(p.username)}>🤝 Ally</button>
                    {me.tokens>=2 && <button style={{ ...S.ghostBtn, fontSize:10, padding:"3px 8px", color:"#64b4ff", borderColor:"rgba(100,180,255,0.3)" }} onClick={()=>doTrade(p.username)}>💱 Trade</button>}
                  </div>}
                </div>;
              })}
            </div>
          </div>}

          {tab==="actions" && <div>
            <div style={{ ...S.cinzel, color:"#888", fontSize:11, letterSpacing:"0.2em", marginBottom:"1rem" }}>Available Actions</div>
            {[["🤝","Form Alliance","Free","Mutual agreement + public announcement. Both gain +1 Economy per round."],["⚔","Declare War","3 tokens","Dice roll + Military stat. Winner gets +1 Military & +2 tokens."],["💱","Trade Deal","2 tokens","Both players gain +1 Economy token."],["🗡","Sabotage","2 tokens","Pass the Moderator a secret note. Target loses tokens next round."],["🗳","Global Vote","1 token","Everyone votes. Simple majority wins. France counts double."],["⚡","Special Ability","Varies","Your country's unique power. Check your country card."],["🗡","Betray Ally","Free*","Collect a Betrayal Card from the Moderator first."],["💤","Do Nothing","Free","Sometimes watching is winning."]].map(([icon,name,cost,desc])=>(
              <div key={name} style={{ ...S.card, display:"flex", gap:"1rem", alignItems:"flex-start", marginBottom:"0.75rem" }}>
                <span style={{ fontSize:24 }}>{icon}</span>
                <div style={{ flex:1 }}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><div style={{ ...S.cinzel, color:"#c8a96e", fontSize:13 }}>{name}</div><span style={{ ...S.badge, background:"rgba(200,169,110,0.1)", color:"#c8a96e" }}>{cost}</span></div><div style={{ fontSize:13, color:"#a09080", marginTop:4, lineHeight:1.5 }}>{desc}</div></div>
              </div>
            ))}
          </div>}

          {tab==="events" && <div>
            <div style={{ ...S.cinzel, color:"#888", fontSize:11, letterSpacing:"0.2em", marginBottom:"1rem" }}>World Events</div>
            {WORLD_EVENTS.map(ev=><div key={ev.id} style={{ ...S.card, marginBottom:"0.75rem", borderColor:gs.activeEvent?.id===ev.id?"rgba(200,169,110,0.5)":"rgba(200,169,110,0.08)" }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}><div style={{ ...S.cinzel, color:gs.activeEvent?.id===ev.id?"#c8a96e":"#888", fontSize:13 }}>{ev.title}</div>{gs.activeEvent?.id===ev.id&&<span style={{ ...S.badge, background:"rgba(200,169,110,0.15)", color:"#c8a96e" }}>ACTIVE</span>}</div>
              <div style={{ fontSize:13, color:"#a09080", marginTop:4, lineHeight:1.6 }}>{ev.desc}</div>
            </div>)}
          </div>}

          {tab==="objectives" && <div>
            <div style={{ ...S.cinzel, color:"#888", fontSize:11, letterSpacing:"0.2em", marginBottom:"1rem" }}>Secret Objectives Reference</div>
            {OBJECTIVES.map(o=><div key={o.id} style={{ ...S.card, marginBottom:"0.75rem" }}>
              <div style={{ ...S.cinzel, color:"#c8a96e", fontSize:13, marginBottom:6 }}>{o.title}</div>
              <div style={{ fontSize:13, color:"#a09080", lineHeight:1.6 }}>{o.obj}</div>
              <div style={{ fontSize:12, color:"#888", marginTop:6, fontStyle:"italic" }}>Bonus: {o.bonus}</div>
            </div>)}
          </div>}
        </div>

        {/* Right panel */}
        <div style={{ borderLeft:"1px solid rgba(200,169,110,0.1)", display:"flex", flexDirection:"column" }}>
          <div style={{ flex:1, overflowY:"auto", padding:"1rem" }}>
            <div style={{ ...S.cinzel, color:"#888", fontSize:10, letterSpacing:"0.2em", marginBottom:"1rem" }}>Diplomacy Log</div>
            {(gs.diplomacyLog||[]).length===0 && <div style={{ color:"#444", fontSize:12, textAlign:"center" }}>No events yet...</div>}
            {(gs.diplomacyLog||[]).map((log,i)=><div key={i} style={{ marginBottom:8, padding:"0.5rem", background:"rgba(255,255,255,0.02)", borderRadius:6, borderLeft:`2px solid ${logColors[log.type]||"#555"}` }}><div style={{ fontSize:12, color:"#b0a090", lineHeight:1.5 }}>{log.text}</div></div>)}
          </div>
          <hr style={S.divider} />
          <div style={{ height:200, overflowY:"auto", padding:"0 1rem" }} ref={chatRef}>
            <div style={{ ...S.cinzel, color:"#888", fontSize:10, letterSpacing:"0.2em", marginBottom:"0.5rem" }}>Chat</div>
            {(room.chatLog||[]).slice(-20).map((m,i)=><div key={i} style={{ marginBottom:6 }}><span style={{ color:"#c8a96e", fontSize:11, fontFamily:"Cinzel,serif" }}>{m.from}: </span><span style={{ fontSize:13, color:"#b0a090" }}>{m.text}</span></div>)}
          </div>
          <div style={{ padding:"0.75rem 1rem", borderTop:"1px solid rgba(200,169,110,0.1)", display:"flex", gap:6 }}>
            <input style={{ ...S.input, fontSize:13, flex:1 }} placeholder="Message all players..." value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} />
            <button style={{ ...S.goldBtn, padding:"0.5rem 0.75rem", fontSize:12 }} onClick={sendChat}>↑</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState(null);

  function onAuth(u) { setUser(u); setPage("lobby"); }
  function onLogout() { setUser(null); setPage("home"); }
  function onNav(p) { setPage(p); }
  function onJoin(rid) { setRoomId(rid); setPage("room"); }
  function onLeave() { setRoomId(null); setPage("lobby"); }

  return (
    <>
      <style>{GOOGLE_FONTS}</style>
      <style>{`* { box-sizing:border-box; margin:0; padding:0; } ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:rgba(255,255,255,0.02); } ::-webkit-scrollbar-thumb { background:rgba(200,169,110,0.3); border-radius:2px; } input::placeholder { color:#555; } button:active { transform:scale(0.98); }`}</style>
      <div style={S.app}>
        <Starfield />
        <div style={S.page}>
          <Nav user={user} onLogout={onLogout} onNav={onNav} />
          {page==="home" && <HomePage onNav={onNav} />}
          {page==="tutorial" && <TutorialPage />}
          {(page==="login"||page==="register") && <AuthPage mode={page} onAuth={onAuth} onSwitch={()=>setPage(page==="login"?"register":"login")} />}
          {page==="lobby" && user && <LobbyPage user={user} onJoin={onJoin} />}
          {page==="room" && user && roomId && <RoomPage user={user} roomId={roomId} onLeave={onLeave} />}
        </div>
      </div>
    </>
  );
}
