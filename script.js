/**
 * VIKRAMA MEDIA — script.js v4.0
 * No form, social from Firestore, TikTok video support
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc,
  doc, getDoc, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9UJrsDK-Tk3w56v1KCA7a1yfe6HuN8Ig",
  authDomain: "vikrama-media.firebaseapp.com",
  projectId: "vikrama-media",
  storageBucket: "vikrama-media.firebasestorage.app",
  messagingSenderId: "979460829994",
  appId: "1:979460829994:web:1c4d31607439fc614f2453"
};

let db; let fbOK = false;
try { const a = initializeApp(firebaseConfig); db = getFirestore(a); fbOK = true; } catch(e){}
const DEMO = !fbOK || firebaseConfig.apiKey === "YOUR_API_KEY";

/* ── Demo Data ── */
const DG = [
  {id:"d1",url:"https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",caption:"Golden Hour Portrait",category:"photo",description:"Exclusive golden hour session with dramatic natural lighting.",year:"2024",client:"Private Client"},
  {id:"d2",url:"https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",caption:"Landscape Series I",category:"photo",description:"Premium landscape series showcasing Indonesia's natural beauty.",year:"2024",client:"Tourism Board"},
  {id:"d3",url:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",caption:"Mountain Light",category:"event",description:"Mountain photography expedition with long exposure techniques.",year:"2023",client:"Adventure Co."},
  {id:"d4",url:"https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80",caption:"Forest Mist",category:"photo",description:"Editorial forest session in tropical morning mist.",year:"2024",client:"Editorial Magazine"},
  {id:"d5",url:"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",caption:"Coastal Dawn",category:"photo",description:"Minimalist sunrise photography along the coast.",year:"2024",client:"Luxury Resort"},
  {id:"d6",url:"https://images.unsplash.com/photo-1526958097901-5e6d742d3371?w=800&q=80",caption:"Urban Geometry",category:"product",description:"Architectural photography focused on urban geometry.",year:"2023",client:"Architecture Firm"},
  {id:"d7",url:"https://images.unsplash.com/photo-1542038374602-5a46e6bda2e5?w=800&q=80",caption:"Product Premium",category:"product",description:"Premium studio product photography setup.",year:"2024",client:"Luxury Brand"},
  {id:"d8",url:"https://images.unsplash.com/photo-1448932223592-d1fc686e76ea?w=800&q=80",caption:"Tropical Wilderness",category:"event",description:"Exclusive outdoor event documentation.",year:"2024",client:"Event Organizer"},
];
const DV = [
  {id:"v1",title:"Brand Story — 2024 Reel",description:"Vikrama Media's latest cinematic showreel",type:"youtube",embedId:"LXb3EKWsInQ",order:1},
  {id:"v2",title:"Product Launch Film",description:"Commercial production highlight",type:"youtube",embedId:"aqz-KE-bpKQ",order:2},
  {id:"v3",title:"TikTok Highlight Reel",description:"Best moments from TikTok",type:"tiktok",tiktokUrl:"https://www.tiktok.com/@khaby.lame/video/7051344801968219397",order:3},
];
const DS = {
  whatsapp: {handle:"+62 812 3456 7890",url:"https://wa.me/6281234567890"},
  discord:  {handle:"discord.gg/vikrama",url:"https://discord.gg/vikramamedia"},
  instagram:{handle:"@vikramamedia",url:"https://instagram.com/vikramamedia"},
  tiktok:   {handle:"@vikramamedia",url:"https://tiktok.com/@vikramamedia"},
  youtube:  {handle:"@vikramamedia",url:"https://youtube.com/@vikramamedia"},
};

const ICONS = {
  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.858L.057 23.998l6.305-1.655A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.943 0-3.772-.524-5.35-1.437l-.383-.226-3.742.982.998-3.648-.249-.396A9.93 9.93 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>`,
  discord:  `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`,
  instagram:`<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
  tiktok:   `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.73a8.19 8.19 0 004.79 1.52V6.79a4.85 4.85 0 01-1.02-.1z"/></svg>`,
  youtube:  `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
};

/* ── Navbar ── */
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => navbar.classList.toggle("scrolled", window.scrollY > 40));

document.querySelectorAll("section[id], .about-sec, .sec-wrap").forEach(s => {
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting)
      document.querySelectorAll(".nav-link").forEach(l =>
        l.classList.toggle("active", l.getAttribute("href") === `#${s.id}`)
      );
  }, {threshold:0.3}).observe(s);
});

const toggle = document.getElementById("navToggle");
const links  = document.getElementById("navLinks");
toggle.addEventListener("click", () => {
  links.classList.toggle("open");
  toggle.classList.toggle("open");
});
document.querySelectorAll(".nav-link").forEach(l => l.addEventListener("click", () => {
  links.classList.remove("open"); toggle.classList.remove("open");
}));

/* ── Reveal ── */
function observeReveal() {
  document.querySelectorAll(".reveal:not(.visible)").forEach(el =>
    new IntersectionObserver(([e], o) => {
      if (e.isIntersecting) { el.classList.add("visible"); o.disconnect(); }
    }, {threshold:.08, rootMargin:"0px 0px -40px 0px"}).observe(el)
  );
}
document.querySelectorAll(".sec-head,.about-left,.about-right,.srv-card,.contact-social,.gal-filter").forEach(el => el.classList.add("reveal"));

/* ── Gallery ── */
let allG = [];
async function loadGallery() {
  if (DEMO) return DG;
  try {
    const snap = await getDocs(query(collection(db,"gallery"), orderBy("order","asc")));
    return snap.docs.map(d => ({id:d.id,...d.data()}));
  } catch { return DG; }
}
async function renderGallery(filter = "all") {
  const load = document.getElementById("galleryLoading");
  const grid = document.getElementById("galleryGrid");
  const empty= document.getElementById("galleryEmpty");
  if (!allG.length) { load.classList.remove("hidden"); allG = await loadGallery(); load.classList.add("hidden"); }
  const items = filter === "all" ? allG : allG.filter(i => i.category === filter);
  if (!items.length) { grid.innerHTML=""; empty.classList.remove("hidden"); return; }
  empty.classList.add("hidden");
  grid.innerHTML = items.map(item => {
    const idx = allG.indexOf(item);
    return `<div class="gal-item reveal" data-idx="${idx}" role="button" tabindex="0">
      <img src="${item.url}" alt="${item.caption||""}" loading="lazy"/>
      <div class="gal-ov">
        <div class="gal-meta"><span class="gal-cat">${item.category||"Photo"}</span><span class="gal-cap">${item.caption||""}</span></div>
        <div class="gal-zoom">&#8599;</div>
      </div>
    </div>`;
  }).join("");
  grid.querySelectorAll(".gal-item").forEach(el => {
    const open = () => openLb(+el.dataset.idx);
    el.addEventListener("click", open);
    el.addEventListener("keydown", e => (e.key==="Enter"||e.key===" ") && open());
  });
  requestAnimationFrame(observeReveal);
}
document.querySelectorAll(".fbtn").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".fbtn").forEach(x => x.classList.remove("active"));
  b.classList.add("active"); renderGallery(b.dataset.filter);
}));

/* ── Lightbox ── */
let lbIdx = 0;
function openLb(idx) { lbIdx = Math.max(0, Math.min(idx, allG.length-1)); refreshLb(); document.getElementById("lightbox").classList.add("open"); document.body.style.overflow="hidden"; }
function refreshLb() {
  const it = allG[lbIdx]; if (!it) return;
  const img = document.getElementById("lbImg");
  img.style.opacity="0"; img.onload = () => img.style.opacity="1"; img.src=it.url; img.alt=it.caption||"";
  document.getElementById("lbCat").textContent       = it.category||"Photography";
  document.getElementById("lbTitle").textContent     = it.caption||"Untitled";
  document.getElementById("lbDesc").textContent      = it.description||"Exclusive work by Vikrama Media.";
  document.getElementById("lbMetaCat").textContent   = it.category||"—";
  document.getElementById("lbMetaYear").textContent  = it.year||"2024";
  document.getElementById("lbMetaClient").textContent= it.client||"—";
  document.getElementById("lbCur").textContent       = lbIdx+1;
  document.getElementById("lbTot").textContent       = allG.length;
}
function closeLb() { document.getElementById("lightbox").classList.remove("open"); document.body.style.overflow=""; }
document.getElementById("lbClose").addEventListener("click", closeLb);
document.getElementById("lbBack").addEventListener("click", closeLb);
document.getElementById("lbPrev").addEventListener("click", () => { lbIdx=(lbIdx-1+allG.length)%allG.length; refreshLb(); });
document.getElementById("lbNext").addEventListener("click", () => { lbIdx=(lbIdx+1)%allG.length; refreshLb(); });
document.addEventListener("keydown", e => {
  if (!document.getElementById("lightbox").classList.contains("open")) return;
  if (e.key==="Escape") closeLb();
  if (e.key==="ArrowLeft")  { lbIdx=(lbIdx-1+allG.length)%allG.length; refreshLb(); }
  if (e.key==="ArrowRight") { lbIdx=(lbIdx+1)%allG.length; refreshLb(); }
});
let tsx=0;
document.getElementById("lightbox").addEventListener("touchstart", e => tsx=e.touches[0].clientX, {passive:true});
document.getElementById("lightbox").addEventListener("touchend", e => {
  const d=tsx-e.changedTouches[0].clientX;
  if (Math.abs(d)>50) { lbIdx=(lbIdx+(d>0?1:-1)+allG.length)%allG.length; refreshLb(); }
}, {passive:true});

/* ── Videos ── */
/* Returns {html, isTikTok} */
function buildVideoCard(v) {
  const isTikTok = v.type === "tiktok";

  if (isTikTok && v.tiktokUrl) {
    const match = v.tiktokUrl.match(/video\/(\d+)/);
    const vid   = match ? match[1] : "";
    // Use TikTok's official iframe embed — portrait 9:16
    const iframeId = `tk-iframe-${vid}`;
    const embedHtml = vid
    ? `<iframe id="${iframeId}" data-vid="${vid}" src="https://www.tiktok.com/embed/v2/${vid}" allow="autoplay" allowfullscreen loading="lazy" scrolling="no" style="width:100%;height:100%;border:none;"></iframe>`
      // ? `<iframe src="https://www.tiktok.com/embed/v2/${vid}" allow="autoplay" allowfullscreen loading="lazy" scrolling="no" style="width:100%;height:100%;border:none;"></iframe>`
      : `<a href="${v.tiktokUrl}" target="_blank" class="tk-fallback">
          <svg viewBox="0 0 24 24" fill="white" width="40" height="40"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.73a8.19 8.19 0 004.79 1.52V6.79a4.85 4.85 0 01-1.02-.1z"/></svg>
          <span>Watch on TikTok ↗</span>
        </a>`;

    return {
      isTikTok: true,
      html: `<div class="vid-card vid-card-tiktok reveal">
        <div class="vid-media-portrait">${embedHtml}</div>
        <div class="vid-meta">
          <h3 class="vid-title">${v.title||"Untitled"}</h3>
          <p class="vid-desc">${v.description||""}</p>
        </div>
      </div>`
    };
  }

  let media = "";
  if (v.type === "youtube" && v.embedId) {
    // Use youtube-nocookie for fewer errors, add origin param
    media = `<iframe
      src="https://www.youtube-nocookie.com/embed/${v.embedId}?rel=0&modestbranding=1&playsinline=1"
      title="${v.title||""}"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen loading="lazy"></iframe>`;
  } else if (v.url) {
    media = `<video controls preload="metadata" poster="${v.thumbnail||""}">
      <source src="${v.url}" type="video/mp4"/></video>`;
  }

  return {
    isTikTok: false,
    html: `<div class="vid-card reveal">
      <div class="vid-media">${media}</div>
      <div class="vid-meta">
        <h3 class="vid-title">${v.title||"Untitled"}</h3>
        <p class="vid-desc">${v.description||""}</p>
      </div>
    </div>`
  };
}

function initTikTokLoop() {
  window.addEventListener('message', function(e) {
    try {
      const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;

      // Deteksi video selesai dari TikTok postMessage
      const isEnded =
        (data?.type === 'onStateChange' && data?.value === 'ended') ||
        (data?.type === 'player:ended') ||
        (data?.event === 'stateChange' && data?.info === 0);

      if (isEnded) {
        // Reload semua TikTok iframe agar loop dari awal
        document.querySelectorAll('.vid-card-tiktok iframe').forEach(iframe => {
          const src = iframe.src;
          iframe.src = '';
          setTimeout(() => { iframe.src = src; }, 300);
        });
      }
    } catch (_) {}
  });
}

async function renderVideos() {
  const load = document.getElementById("videoLoading");
  const grid = document.getElementById("videoGrid");
  const empty= document.getElementById("videoEmpty");
  load.classList.remove("hidden");
  let items;
  try {
    if (DEMO) { items=DV; }
    else {
      const snap = await getDocs(query(collection(db,"videos"), orderBy("order","asc")));
      items = snap.docs.map(d => ({id:d.id,...d.data()}));
      if (!items.length) items=DV;
    }
  } catch { items=DV; }
  load.classList.add("hidden");
  if (!items.length) { empty.classList.remove("hidden"); return; }
  const cards = items.map(v => buildVideoCard(v));
  grid.innerHTML = cards.map(c => c.html).join("");
  // Loop TikTok iframes when video ends
  initTikTokLoop();
  requestAnimationFrame(observeReveal);
}

/* ── About ── */
async function renderAbout() {
  if (DEMO) return;
  try {
    const snap = await getDocs(collection(db,"about"));
    if (snap.empty) return;
    const d = snap.docs[0].data();
    if (d.title)   document.getElementById("aboutTitle").textContent = d.title;
    if (d.image)   document.getElementById("aboutImage").src = d.image;
    if (d.content) document.getElementById("aboutText").innerHTML =
      d.content.split("\n\n").map(p=>`<p>${p}</p>`).join("");
  } catch {}
}

/* ── Social Links ── */
async function renderSocials() {
  let s = DS;
  if (!DEMO) {
    try {
      const snap = await getDoc(doc(db,"settings","social"));
      if (snap.exists()) s = {...DS,...snap.data()};
    } catch {}
  }
  const keys = ["whatsapp","discord","instagram","tiktok","youtube"];
  const labels = {whatsapp:"WhatsApp",discord:"Discord",instagram:"Instagram",tiktok:"TikTok",youtube:"YouTube"};
  const abbr   = {whatsapp:"WA",discord:"DC",instagram:"IG",tiktok:"TK",youtube:"YT"};

  // Contact section
  const cont = document.getElementById("socialChannels");
  cont.innerHTML = keys.map(k => {
    const d = s[k]; if (!d||!d.url) return "";
    return `<a href="${d.url}" target="_blank" rel="noopener" class="soc-big-card" data-type="${k}">
      <span class="sbc-icon">${ICONS[k]}</span>
      <div class="sbc-info"><span class="sbc-name">${labels[k]}</span><span class="sbc-handle">${d.handle||""}</span></div>
      <span class="sbc-arrow">&#8599;</span>
    </a>`;
  }).join("");

  // Footer social icons
  const footer = document.getElementById("footerSocials");
  footer.innerHTML = keys.map(k => {
    const d = s[k]; if (!d||!d.url) return "";
    return `<a href="${d.url}" target="_blank" rel="noopener" class="fsoc" aria-label="${labels[k]}" data-type="${k}">${ICONS[k]}</a>`;
  }).join("");
}

/* ── Init ── */
(async () => {
  await Promise.all([renderGallery(), renderVideos(), renderAbout(), renderSocials()]);
  observeReveal();
})();
