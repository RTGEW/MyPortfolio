import { useState, useEffect, useRef, useCallback, memo } from "react";

// ── INJECT GLOBAL CSS ─────────────────────────────────────────────────────────
const globalStyle = document.createElement("style");
globalStyle.textContent = `
  @font-face { font-family: 'CyberpunkFont'; src: url('/Fonts/Cyberpunk-Regular.ttf') format('truetype'); }
  @font-face { font-family: 'Orbitron'; src: url('/Fonts/Orbitron.ttf') format('truetype'); }
  @font-face { font-family: 'ValoraxFont'; src: url('/Fonts/Valorax.otf') format('opentype'); }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { margin: 0; background: #0a0a12; color: #cde; font-family: 'Orbitron', Arial, sans-serif; cursor: none; }
  a, button, input[type=range] { cursor: none; }

  .glitch { position: relative; }
  .glitch::before, .glitch::after {
    content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; overflow: hidden; pointer-events: none;
  }
  .glitch::before { color: #00f5ff; animation: glitch1 3s infinite; clip-path: polygon(0 0,100% 0,100% 33%,0 33%); transform: translateX(-2px); }
  .glitch::after  { color: #ff2d78; animation: glitch2 3s infinite; clip-path: polygon(0 66%,100% 66%,100% 100%,0 100%); transform: translateX(2px); }
  @keyframes glitch1 { 0%,94%,100%{opacity:0} 95%,97%{opacity:1;transform:translateX(-4px) skewX(-2deg)} 96%{transform:translateX(3px)} }
  @keyframes glitch2 { 0%,91%,100%{opacity:0} 92%,94%{opacity:1;transform:translateX(4px) skewX(2deg)} 93%{transform:translateX(-3px)} }

  .page-section {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.88rem;
    line-height: 1.9;
    padding: 32px 36px;
    max-width: 960px;
    margin: 24px auto;
    background: rgba(10,10,24,0.82);
    border: 1px solid rgba(0,245,255,0.2);
    border-radius: 4px;
    box-shadow: 0 0 30px rgba(180,0,255,0.12), 0 4px 40px rgba(0,0,0,0.5);
    position: relative;
    z-index: 1;
    backdrop-filter: blur(6px);
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .page-section.revealed {
    opacity: 1;
    transform: translateY(0);
  }
  .page-section::before {
    content: ''; position: absolute; top: -1px; left: -1px;
    width: 20px; height: 20px;
    border-top: 2px solid #00f5ff; border-left: 2px solid #00f5ff;
    border-radius: 3px 0 0 0; opacity: 0.7;
  }
  .page-section::after {
    content: ''; position: absolute; bottom: -1px; right: -1px;
    width: 20px; height: 20px;
    border-bottom: 2px solid #00f5ff; border-right: 2px solid #00f5ff;
    border-radius: 0 0 3px 0; opacity: 0.7;
  }

  .section-h2 {
    font-family: 'CyberpunkFont', sans-serif;
    font-size: 1.6rem;
    letter-spacing: 2px;
    color: #00f5ff;
    text-shadow: 0 0 8px #00f5ff, 0 0 20px rgba(0,245,255,0.3);
    border-bottom: 1px solid rgba(0,245,255,0.3);
    padding-bottom: 8px;
    margin-bottom: 16px;
    min-height: 2.2rem;
  }

  .scanline-fixed {
    pointer-events: none; position: fixed; inset: 0; z-index: 9999;
    background: repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px);
  }

  .social-icon { width: 80px; filter: drop-shadow(0 0 6px rgba(0,245,255,0.5)); transition: filter .3s, transform .3s; }
  .social-icon:hover { filter: drop-shadow(0 0 14px #00f5ff); transform: scale(1.08) rotate(-2deg); }

  .exp-card:hover { box-shadow: 0 0 20px rgba(0,245,255,0.25); }
  .quick-link:hover { box-shadow: 0 0 16px rgba(0,245,255,0.3); }

  .nav-link { font-family: 'ValoraxFont', sans-serif; color: #ffe600; text-decoration: none; margin: 0 14px; font-size: 0.9rem; font-weight: bold; letter-spacing: 1.5px; padding: 4px 0; border-bottom: 2px solid transparent; transition: color .25s, border-color .25s, text-shadow .25s; }
  .nav-link:hover, .nav-link.active { color: #00f5ff; text-shadow: 0 0 8px #00f5ff; border-bottom-color: #00f5ff; }

  footer {
    text-align: center;
    background: rgba(5,5,15,0.9);
    border-top: 1px solid rgba(0,245,255,0.25);
    color: #8ab;
    padding: 24px 20px;
    margin-top: 40px;
    position: relative;
    z-index: 1;
    font-size: 0.8rem;
    letter-spacing: 1px;
    line-height: 2;
  }
`;
if (!document.getElementById("app-global-style")) {
  globalStyle.id = "app-global-style";
  document.head.appendChild(globalStyle);
}

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const TRACKS = {
  track1: { src: "/Audio/japanese.mp3",   genre: "Japanese / Pop",           label: "♪ HARU - YORUSHIKA" },
  track2: { src: "/Audio/cyberpunk.mp3",  genre: "Cyberpunk / Synth",        label: "♪ I REALLY WANT TO STAY AT YOUR HOUSE" },
  track3: { src: "/Audio/chill.mp3",      genre: "Chill / Ambient",          label: "♪ CHILL MODE" },
  track4: { src: "/Audio/dystopian.mp3",  genre: "Dystopian / Dark",         label: "♪ DYSTOPIAN MODE" },
  track5: { src: "/Audio/life.mp3",       genre: "Life / Sentimental",       label: "♪ I HAVE NO ENEMIES MODE" },
  track6: { src: "/Audio/reggaestep.mp3", genre: "ReggaeStep / Dub",         label: "♪ MAKE IT BUN DEM" },
  track7: { src: "/Audio/eurobeat.mp3",   genre: "Eurobeat / Racing",        label: "♪ GAS GAS GAS!" },
  track8: { src: "/Audio/phonk.mp3",      genre: "Phonk / Drift",            label: "♪ PHONK MODE" },
  track9: { src: "/Audio/rock.mp3",       genre: "Cyber Rock / Alternative", label: "♪ WHO'S READY FOR TOMORROW" },
};
const MUSIC_LABELS = ["Japanese","Cyberpunk","Chill","Dystopian","Life","ReggaeStep","Eurobeat","Phonk","Cyber Rock"];
const PAGES = ["HOME","ABOUT ME","ACHIEVEMENTS","EXPERIENCES"];
const C = {
  yellow: "#ffe600", cyan: "#00f5ff", pink: "#ff2d78",
  dark: "#0a0a12",
  glowY: "0 0 8px #ffe600, 0 0 20px rgba(255,230,0,0.3)",
  glowC: "0 0 8px #00f5ff, 0 0 20px rgba(0,245,255,0.3)",
};

// ── CLOCK HOOK ────────────────────────────────────────────────────────────────
function useClock() {
  const [time, setTime] = useState({ hms: "00:00:00", date: "MON, JAN 01 2026" });
  useEffect(() => {
    const tick = () => {
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
      const pad = n => String(n).padStart(2,"0");
      const DAYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
      const MONS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
      setTime({
        hms: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
        date: `${DAYS[now.getDay()]}, ${MONS[now.getMonth()]} ${pad(now.getDate())} ${now.getFullYear()}`
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// ── TYPEWRITER ────────────────────────────────────────────────────────────────
function TypeWriter({ text, speed = 55 }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return <>{displayed}</>;
}

// ── REVEAL SECTION ────────────────────────────────────────────────────────────
function RevealSection({ children }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("revealed"); obs.disconnect(); }
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className="page-section">{children}</div>;
}

// ── COUNTER ───────────────────────────────────────────────────────────────────
function Counter({ target }) {
  const [val, setVal] = useState(0);
  const ref = useRef();
  const ran = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ran.current) {
        ran.current = true;
        let cur = 0;
        const step = target / (1200 / 16);
        const id = setInterval(() => {
          cur += step;
          if (cur >= target) { setVal(target); clearInterval(id); return; }
          setVal(Math.floor(cur));
        }, 16);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}</span>;
}

// ── MUSIC HEADER (memoized — only re-renders when its own props change) ────────
const MusicHeader = memo(function MusicHeader({ title, page, setPage, currentTrack, isMuted, volume, genreLabel, onTrackChange, onMute, onVolume, zoom, setZoom }) {
  return (
    <header style={{
      textAlign: "center", background: "rgba(10,10,20,0.7)",
      borderBottom: `2px solid ${C.cyan}`, color: C.yellow,
      padding: "20px 16px 30px", position: "relative", overflow: "hidden", zIndex: 2,
      boxShadow: "0 4px 40px rgba(0,245,255,0.15)",
    }}>
      {/* Genre label */}
      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.75rem", letterSpacing:2, color:C.yellow, marginBottom:8, position:"relative", zIndex:1, transition:"opacity 0.3s" }}>
        {genreLabel}
      </div>

      {/* H1 glitch title */}
      <h1 className="glitch" data-text={title} style={{
        fontFamily:"'CyberpunkFont',sans-serif", fontSize:"clamp(2rem,8vw,5.5rem)",
        letterSpacing:4, textTransform:"uppercase", color:C.yellow,
        textShadow:C.glowY, margin:"10px 0", position:"relative", zIndex:1,
      }}>{title}</h1>

      {/* Profile image + zoom */}
      <div style={{ position:"relative", zIndex:1, display:"inline-block", marginTop:8 }}>
        <img src="/Images/Abanador_Image.jpg" alt="Angelo Ace Williard"
          style={{ width:"min(340px,80vw)", borderRadius:10, marginTop:16, display:"block",
            border:`2px solid ${C.cyan}`, boxShadow:`0 0 24px rgba(0,245,255,0.35)`,
            transform:`scale(${zoom})`, transition:"transform .3s" }}
        />
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:8 }}>
          {[["＋", () => setZoom(z => Math.min(2.5, z+0.15))],
            ["－", () => setZoom(z => Math.max(0.5, z-0.15))],
            ["⟳", () => setZoom(1.0)]].map(([label, fn]) => (
            <button key={label} onClick={fn} style={{
              background:"rgba(0,0,0,0.65)", border:`1px solid ${C.cyan}`, color:C.cyan,
              padding:"4px 12px", borderRadius:3, fontFamily:"monospace", fontSize:"1rem", boxShadow:C.glowC,
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Music picker */}
      <div style={{
        display:"inline-block", margin:"18px auto 0", padding:"12px 20px",
        background:"rgba(0,0,0,0.65)", border:`1px solid ${C.yellow}`,
        borderRadius:4, boxShadow:C.glowY, backdropFilter:"blur(4px)", position:"relative", zIndex:1,
      }}>
        <p style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.75rem", letterSpacing:2, marginBottom:10, color:C.yellow, textShadow:C.glowY }}>
          ⚡ SELECT BACKGROUND MUSIC
        </p>
        <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"4px 8px" }}>
          {MUSIC_LABELS.map((lbl, i) => {
            const val = `track${i+1}`;
            const checked = currentTrack === val;
            return (
              <label key={val} style={{ margin:"0 4px", fontFamily:"'Orbitron',sans-serif", fontSize:"0.75rem", fontWeight:"bold", color:"#aaddee", display:"inline-flex", alignItems:"center", gap:5 }}>
                <input type="radio" name="music" value={val} checked={checked} onChange={() => onTrackChange(val)} style={{ display:"none" }} />
                <span style={{ width:12, height:12, border:`2px solid ${C.yellow}`, borderRadius:"50%", display:"inline-block", flexShrink:0, background: checked ? C.yellow : "transparent", boxShadow: checked ? C.glowY : "none" }} />
                {lbl}
              </label>
            );
          })}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10 }}>
          <button onClick={onMute} style={{ background:"none", border:"none", fontSize:"1.2rem", color:C.cyan, padding:0 }}>{isMuted ? "🔇" : "🔊"}</button>
          <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.7rem", color:C.cyan, letterSpacing:1 }}>VOL</span>
          <input type="range" min="0" max="100" value={volume} onChange={onVolume} style={{ flex:1, accentColor:C.cyan }} />
          <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"0.7rem", color:C.cyan, minWidth:38 }}>{volume}%</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ marginTop:18, position:"relative", zIndex:1 }}>
        {PAGES.map(p => (
          <a key={p} href="#top" className={`nav-link${page===p?" active":""}`}
            onClick={e => { e.preventDefault(); setPage(p); window.scrollTo(0,0); }}>
            {p}
          </a>
        ))}
      </nav>
    </header>
  );
});

// ── PAGE COMPONENTS (defined outside App — no re-render on clock tick) ─────────
const HomePage = memo(function HomePage({ headerProps }) {
  return (
    <>
      <MusicHeader title="MY PORTFOLIO" {...headerProps} />
      <RevealSection>
        <h2 className="section-h2"><TypeWriter text="WELCOME, NETRUNNER" /></h2>
        <p>I am <strong>Angelo Ace Williard O. Abanador</strong> — a 3rd year BS Information Technology student, Content Creator, and Aspiring Musician from STI College San Jose Del Monte.</p>
        <p style={{marginTop:12}}>Navigate through the pages above to explore my story, achievements, and experiences. Select a music track to set the vibe, and let the neon grid guide your journey.</p>
        <div style={{ display:"flex", gap:16, marginTop:24, flexWrap:"wrap" }}>
          {[{icon:"👤",label:"ABOUT ME",p:"ABOUT ME"},{icon:"🏆",label:"ACHIEVEMENTS",p:"ACHIEVEMENTS"},{icon:"⚙",label:"EXPERIENCES",p:"EXPERIENCES"}].map(q => (
            <a key={q.p} href="#" className="quick-link"
              onClick={e => { e.preventDefault(); headerProps.setPage(q.p); window.scrollTo(0,0); }}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", textDecoration:"none", padding:"14px 24px", background:"rgba(0,245,255,0.06)", border:`1px solid rgba(0,245,255,0.3)`, borderRadius:4, transition:"box-shadow .2s" }}>
              <span style={{ fontSize:"1.6rem" }}>{q.icon}</span>
              <span style={{ color:C.yellow, fontSize:"0.75rem", fontWeight:"bold", letterSpacing:1.5, marginTop:6 }}>{q.label}</span>
            </a>
          ))}
        </div>
      </RevealSection>
    </>
  );
});

const AboutPage = memo(function AboutPage({ headerProps }) {
  return (
    <>
      <MusicHeader title="ABOUT ME" {...headerProps} />
      <RevealSection>
        <h2 className="section-h2"><TypeWriter text="WHO I AM" /></h2>
        <p>My name is <strong>Angelo Ace Williard O. Abanador</strong>. I am a 3rd year BS Information Technology student at STI College San Jose Del Monte.</p>
        <p style={{marginTop:12}}>I am currently learning advanced web development, programming concepts, and cybersecurity fundamentals. I'm also a Content Creator and an Aspiring Musician — blending tech passion with creative expression.</p>
      </RevealSection>
      <RevealSection>
        <h2 className="section-h2"><TypeWriter text="CHARACTERIZATION" /></h2>
        <p>I am a hardworking and curious student who is deeply interested in technology. I prefer learning through practice and problem-solving rather than memorizing concepts.</p>
        <p style={{marginTop:12}}>I am experienced in both following commands and stepping up to leadership roles. I believe I have an adaptable sense of humor that fits any working environment — professional when needed, fun when allowed.</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:16 }}>
          {["🧠 Problem Solver","🎮 Gamer","🎸 Musician","📹 Content Creator","💻 Developer","🛡 Ethical Hacker"].map(t => (
            <span key={t} style={{ background:"rgba(0,245,255,0.08)", border:`1px solid rgba(0,245,255,0.4)`, color:C.cyan, padding:"6px 14px", borderRadius:3, fontSize:"0.8rem", letterSpacing:1 }}>{t}</span>
          ))}
        </div>
      </RevealSection>
      <RevealSection>
        <h2 className="section-h2"><TypeWriter text="SOCIAL LINKS" /></h2>
        <p><strong>Connect with me across the grid:</strong></p>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginTop:12 }}>
          {[
            { href:"https://www.facebook.com/angelo.abanador.2025", src:"/Images/facebook-icon.png", alt:"Facebook" },
            { href:"https://www.youtube.com/@ARtjooew",             src:"/Images/youtube-icon.png",  alt:"YouTube" },
            { href:"https://www.twitch.tv/rtgewerp",                src:"/Images/twitch-icon.png",   alt:"Twitch" },
            { href:"https://www.tiktok.com/@rtgew_wegtr",           src:"/Images/tiktok-icon.png",   alt:"TikTok" },
          ].map(s => (
            <a key={s.alt} href={s.href} target="_blank" rel="noreferrer">
              <img src={s.src} alt={s.alt} className="social-icon" />
            </a>
          ))}
        </div>
      </RevealSection>
    </>
  );
});

const AchievementsPage = memo(function AchievementsPage({ headerProps }) {
  return (
    <>
      <MusicHeader title="ACHIEVEMENTS" {...headerProps} />
      <RevealSection>
        <h2 className="section-h2"><TypeWriter text="UNLOCKED ACHIEVEMENTS" /></h2>
        <ul style={{ listStyle:"none", padding:0, lineHeight:2 }}>
          {[
            ["🎓","Graduated STEM strand at STI Senior High School"],
            ["🏅","Passed STI Scholarship"],
            ["💻","Passed basic programming subjects"],
            ["🌐","Created simple HTML projects"],
            ["☕","Created simple Java projects"],
            ["🎮","Created a 2D Hack and Slash Platformer game"],
            ["🔧","Successfully served 10 customers on PC Building"],
            ["📋","Completed academic requirements on time"],
            ["💧","Drinks 1 Gallon of Water Consistently"],
            ["⚔","Adventure Rank 60 in Genshin Impact"],
          ].map(([icon,text]) => (
            <li key={text} style={{ paddingLeft:28, marginBottom:4, position:"relative" }}>
              <span style={{ position:"absolute", left:0 }}>{icon}</span>{text}
            </li>
          ))}
        </ul>
      </RevealSection>
      <RevealSection>
        <h2 className="section-h2"><TypeWriter text="STAT BOARD" /></h2>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginTop:16 }}>
          {[{target:60,label:"AR IN GENSHIN"},{target:10,label:"PCS BUILT"},{target:3,label:"YEARS CODING"},{target:1,label:"GAME RELEASED"}].map(s => (
            <div key={s.label} style={{ background:"rgba(0,0,0,0.5)", border:`1px solid rgba(0,245,255,0.3)`, borderRadius:4, padding:"20px 28px", textAlign:"center", minWidth:100 }}>
              <div style={{ fontSize:"2.5rem", fontWeight:"bold", color:C.cyan, textShadow:C.glowC }}><Counter target={s.target} /></div>
              <div style={{ fontSize:"0.55rem", letterSpacing:1.5, color:"#7ab", marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </RevealSection>
    </>
  );
});

const ExperiencesPage = memo(function ExperiencesPage({ headerProps }) {
  return (
    <>
      <MusicHeader title="EXPERIENCES" {...headerProps} />
      <RevealSection>
        <h2 className="section-h2"><TypeWriter text="FIELD EXPERIENCE" /></h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16, marginTop:16 }}>
          {[
            ["📹","Content Creation","YouTube & Twitch streaming, video editing, community engagement"],
            ["🌐","Web Development","Student projects using HTML, CSS & JavaScript — including this portfolio"],
            ["☕","Java & JFrame","Basic programming exercises and JFrame GUI application development"],
            ["🛡","Ethical Hacking","EC-COUNCIL Ethical Hacking Courses — cybersecurity fundamentals"],
            ["🎮","Game Development","GameMaker Studio 2 — built a 2D Hack & Slash Platformer game from scratch"],
            ["👑","Project Management","Project Manager for a 3D Game Development Capstone project"],
            ["🤝","Group Academics","Group academic activities — leadership and team collaboration"],
            ["🎸","Music","Basic Guitar, Kalimba, Drums, and Flute aiming to become a musician"],
          ].map(([icon,title,desc]) => (
            <div key={title} className="exp-card" style={{ background:"rgba(0,0,0,0.5)", border:`1px solid rgba(0,245,255,0.25)`, borderRadius:4, padding:"18px 16px", textAlign:"center", transition:"box-shadow .2s" }}>
              <div style={{ fontSize:"2rem", marginBottom:8 }}>{icon}</div>
              <div style={{ color:C.cyan, fontWeight:"bold", fontSize:"0.85rem", letterSpacing:1, marginBottom:6 }}>{title}</div>
              <div style={{ fontSize:"0.75rem", color:"#9bc", lineHeight:1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
      </RevealSection>
    </>
  );
});

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const clock = useClock();
  const [page, setPage] = useState("HOME");

  // Boot
  const [booted, setBooted] = useState(false);
  const [bootDone, setBootDone] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootLines, setBootLines] = useState([]);

  // Audio
  const audioRef = useRef(new Audio());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(40);
  const lastVolRef = useRef(0.4);
  const fadeRef = useRef(null);

  // Toast
  const [badge, setBadge] = useState({ text:"", visible:false });
  const badgeTimerRef = useRef();

  // Zoom
  const [zoom, setZoom] = useState(1.0);

  // Genre label
  const [genreLabel, setGenreLabel] = useState("◈ SELECT A TRACK ◈");

  // Body glitch
  const [glitch, setGlitch] = useState(false);

  // ── BOOT ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (sessionStorage.getItem("cp_booted")) { setBooted(true); setBootDone(true); return; }
    sessionStorage.setItem("cp_booted","1");
    const msgs = [
      "> Initializing ABANADOR OS v2.0.77...",
      "> Loading cyberpunk core modules...",
      "> Calibrating neural interface...",
      "> Syncing Philippine Standard Time...",
      "> Decrypting portfolio data...",
      "> Welcome, Netrunner.",
    ];
    let i = 0;
    const print = () => {
      if (i >= msgs.length) {
        setBootProgress(100);
        setTimeout(() => { setBooted(true); setTimeout(() => setBootDone(true), 600); }, 400);
        return;
      }
      const msg = msgs[i++];
      setBootLines(prev => [...prev, msg]);
      setBootProgress(Math.round((i / msgs.length) * 100));
      setTimeout(print, 320 + Math.random() * 200);
    };
    setTimeout(print, 300);
  }, []);

  // ── GLITCH ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let timeout;
    const trigger = () => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120);
      timeout = setTimeout(trigger, 3000 + Math.random() * 7000);
    };
    timeout = setTimeout(trigger, 4000);
    return () => clearTimeout(timeout);
  }, []);

  // ── CURSOR TRAIL ──────────────────────────────────────────────────────────
  useEffect(() => {
    const dots = [];
    for (let i = 0; i < 10; i++) {
      const el = document.createElement("div");
      el.style.cssText = `position:fixed;width:${10-i*0.7}px;height:${10-i*0.7}px;border-radius:50%;background:#00f5ff;pointer-events:none;z-index:99998;transform:translate(-50%,-50%);mix-blend-mode:screen;box-shadow:0 0 6px #00f5ff;opacity:${(1-i/10)*0.7};left:-100px;top:-100px;`;
      document.body.appendChild(el);
      dots.push({ el, x:0, y:0 });
    }
    let mx = 0, my = 0;
    const onMove = e => { mx = e.clientX; my = e.clientY; };
    document.addEventListener("mousemove", onMove);
    let raf;
    const animate = () => {
      let px = mx, py = my;
      dots.forEach((t, i) => {
        t.x += (px-t.x)*(0.35-i*0.025);
        t.y += (py-t.y)*(0.35-i*0.025);
        t.el.style.left = t.x+"px"; t.el.style.top = t.y+"px";
        px = t.x; py = t.y;
      });
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => { document.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); dots.forEach(d => d.el.remove()); };
  }, []);

  // ── AUDIO HELPERS ─────────────────────────────────────────────────────────
  const showBadge = useCallback((text) => {
    setBadge({ text, visible:true });
    clearTimeout(badgeTimerRef.current);
    badgeTimerRef.current = setTimeout(() => setBadge(b => ({...b,visible:false})), 2800);
  }, []);

  const fadeAudio = useCallback((from, to, duration, cb) => {
    const audio = audioRef.current;
    if (fadeRef.current) clearInterval(fadeRef.current);
    const steps = 40, interval = duration/steps, delta = (to-from)/steps;
    let cur = from, count = 0;
    fadeRef.current = setInterval(() => {
      cur += delta; count++;
      audio.volume = Math.min(1, Math.max(0, cur));
      if (count >= steps) { clearInterval(fadeRef.current); fadeRef.current = null; if(cb) cb(); }
    }, interval);
  }, []);

  const switchTrack = useCallback((val) => {
    const track = TRACKS[val];
    if (!track) return;
    const audio = audioRef.current;
    const doSwitch = () => {
      setCurrentTrack(val);
      audio.src = track.src;
      audio.loop = true;
      audio.load();
      audio.currentTime = 0;
      if (!isMuted) {
        audio.volume = 0;
        audio.play().then(() => fadeAudio(0, lastVolRef.current, 800)).catch(() => showBadge("⚠ Click anywhere to enable audio"));
      }
      setGenreLabel("◈ " + track.genre.toUpperCase() + " ◈");
      showBadge(track.label);
    };
    if (currentTrack && !audio.paused) { fadeAudio(audio.volume, 0, 600, doSwitch); } else { doSwitch(); }
  }, [currentTrack, isMuted, fadeAudio, showBadge]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!isMuted) {
      lastVolRef.current = audio.volume > 0 ? audio.volume : lastVolRef.current;
      fadeAudio(audio.volume, 0, 400, () => { audio.muted = true; });
      setIsMuted(true);
    } else {
      audio.muted = false;
      if (currentTrack) { audio.play().catch(()=>{}); fadeAudio(0, lastVolRef.current, 400); }
      setIsMuted(false);
    }
  }, [isMuted, currentTrack, fadeAudio]);

  const handleVolume = useCallback((e) => {
    const pct = parseInt(e.target.value);
    setVolume(pct);
    lastVolRef.current = pct/100;
    const audio = audioRef.current;
    if (!isMuted) { audio.volume = pct/100; audio.muted = false; }
  }, [isMuted]);

  // ── SHARED HEADER PROPS ───────────────────────────────────────────────────
  const headerProps = {
    page, setPage, currentTrack, isMuted, volume, genreLabel, zoom, setZoom,
    onTrackChange: switchTrack, onMute: toggleMute, onVolume: handleVolume,
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div id="top" style={{
      background: C.dark, minHeight:"100vh",
      filter: glitch ? "hue-rotate(30deg) brightness(1.15)" : "none",
      transform: glitch ? "skewX(0.4deg)" : "none",
    }}>
      {/* Scanline */}
      <div className="scanline-fixed" />

      {/* Clock */}
      <div style={{ position:"fixed", top:18, right:18, zIndex:1000, background:"rgba(0,0,0,.72)", border:`1px solid ${C.yellow}`, borderRadius:4, padding:"10px 16px", textAlign:"right", boxShadow:C.glowY, backdropFilter:"blur(6px)" }}>
        <div style={{ fontFamily:"'CyberpunkFont',sans-serif", fontSize:"1.8rem", color:C.yellow, textShadow:C.glowY, letterSpacing:3 }}>{clock.hms}</div>
        <div style={{ fontSize:".58rem", color:"#aac", letterSpacing:1.5, marginTop:2 }}>{clock.date}</div>
        <div style={{ fontSize:".5rem", color:"#556", letterSpacing:1, marginTop:1 }}>PHILIPPINE STANDARD TIME</div>
      </div>

      {/* Toast badge */}
      <div style={{ position:"fixed", bottom:30, left:"50%", transform:"translateX(-50%)", background:"rgba(0,0,0,0.85)", color:C.yellow, fontFamily:"'Orbitron',sans-serif", fontSize:"0.85rem", letterSpacing:2, padding:"10px 24px", border:`1px solid ${C.yellow}`, borderRadius:3, boxShadow:C.glowY, zIndex:9998, pointerEvents:"none", transition:"opacity 0.6s ease", opacity:badge.visible?1:0, whiteSpace:"nowrap" }}>
        {badge.text}
      </div>

      {/* Boot splash */}
      {!booted && (
        <div style={{ position:"fixed", inset:0, background:"#000", zIndex:99999, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:520, maxWidth:"90vw", fontFamily:"'Courier New',monospace", fontSize:"0.78rem", color:C.cyan, padding:30, border:`1px solid ${C.cyan}`, boxShadow:C.glowC }}>
            <div style={{ fontFamily:"'CyberpunkFont',sans-serif", fontSize:"2rem", color:C.yellow, textShadow:C.glowY, marginBottom:20, letterSpacing:4 }}>A.B.A.N.A.D.O.R OS v2.0</div>
            {bootLines.map((line,i) => <div key={i} style={{ margin:"4px 0" }}>{line}</div>)}
            <div style={{ marginTop:20, height:4, background:"rgba(0,245,255,0.15)", border:`1px solid ${C.cyan}` }}>
              <div style={{ height:"100%", background:C.cyan, width:bootProgress+"%", transition:"width 0.3s ease", boxShadow:C.glowC }} />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ opacity:bootDone?1:0, transition:"opacity 0.6s ease" }}>
        {page==="HOME"         && <HomePage         headerProps={headerProps} />}
        {page==="ABOUT ME"     && <AboutPage        headerProps={headerProps} />}
        {page==="ACHIEVEMENTS" && <AchievementsPage headerProps={headerProps} />}
        {page==="EXPERIENCES"  && <ExperiencesPage  headerProps={headerProps} />}

        <footer>
          <p>
            <strong style={{ color:C.yellow, fontFamily:"'CyberpunkFont',sans-serif", fontSize:"1rem", textShadow:C.glowY }}>My Portfolio</strong><br />
            Angelo Ace Williard O. Abanador<br />
            BS Information Technology – 3rd Year<br />
            STI College San Jose Del Monte<br /><br />
            © 2026 All Rights Reserved
          </p>
        </footer>
      </div>
    </div>
  );
}
