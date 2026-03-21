/**
 * VIKRAMA MEDIA — admin.js v4.0
 * Fully working CRUD: Gallery, Video (incl. TikTok), About, Social, Messages
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, setDoc, getDoc, query, orderBy, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
apiKey: "AIzaSyB9UJrsDK-Tk3w56v1KCA7a1yfe6HuN8Ig",
  authDomain: "vikrama-media.firebaseapp.com",
  projectId: "vikrama-media",
  storageBucket: "vikrama-media.firebasestorage.app",
  messagingSenderId: "979460829994",
  appId: "1:979460829994:web:1c4d31607439fc614f2453"
};

const app     = initializeApp(firebaseConfig);
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);
const DEMO    = firebaseConfig.apiKey === "YOUR_API_KEY";

/* ── In-memory demo store ── */
const DS = {
  gallery: [
    {id:"g1",url:"https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400",caption:"Golden Hour Portrait",category:"photo",description:"Demo photo",year:"2024",client:"Private",order:1},
    {id:"g2",url:"https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400",caption:"Landscape Series",category:"photo",description:"Demo photo",year:"2024",client:"Tourism",order:2},
  ],
  videos: [
    {id:"v1",title:"Brand Story Reel",description:"Cinematic showreel",type:"youtube",embedId:"LXb3EKWsInQ",order:1},
    {id:"v2",title:"TikTok Highlight",description:"Best TikTok moments",type:"tiktok",tiktokUrl:"https://www.tiktok.com/@khaby.lame/video/7051344801968219397",order:2},
  ],
  about:{title:"About Vikrama Media",content:"We are a creative studio.\n\nFounded with passion.",image:""},
  social:{
    whatsapp: {handle:"+62 812 3456 7890",url:"https://wa.me/6281234567890"},
    discord:  {handle:"discord.gg/vikrama",url:"https://discord.gg/vikramamedia"},
    instagram:{handle:"@vikramamedia",url:"https://instagram.com/vikramamedia"},
    tiktok:   {handle:"@vikramamedia",url:"https://tiktok.com/@vikramamedia"},
    youtube:  {handle:"@vikramamedia",url:"https://youtube.com/@vikramamedia"},
  },
  messages:[
    {id:"m1",name:"John Doe",email:"john@email.com",service:"Photography",message:"Hello, interested in a shoot.",createdAt:{toDate:()=>new Date()}},
  ],
};

/* ── Helpers ── */
function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function setBL(btn,on){btn.disabled=on;btn.querySelector(".bt").style.display=on?"none":"inline";btn.querySelector(".bl").style.display=on?"inline":"none"}
function showProg(wid,fid,pid,pct){const w=document.getElementById(wid);w.classList.remove("hidden");document.getElementById(fid).style.width=pct+"%";document.getElementById(pid).textContent=pct+"%";if(pct>=100)setTimeout(()=>w.classList.add("hidden"),1500)}
function openM(id){document.getElementById(id).classList.remove("hidden");document.body.style.overflow="hidden"}
function closeM(id){document.getElementById(id).classList.add("hidden");document.body.style.overflow=""}
function showMsg(id,text,ok){const el=document.getElementById(id);el.textContent=text;el.className="smsg "+(ok?"ok":"er");el.classList.remove("hidden");setTimeout(()=>el.classList.add("hidden"),4000)}
function uploadFile(file,path,onProg){
  return new Promise((res,rej)=>{
    const storageRef = ref(storage,path);
    const task = uploadBytesResumable(storageRef,file);
    task.on(
      "state_changed",
      snap => {
        const pct = Math.round(snap.bytesTransferred/snap.totalBytes*100);
        onProg(pct);
      },
      err => {
        // Provide a more actionable error message
        let msg = err.message || "Upload failed.";
        if (err.code === "storage/unauthorized") {
          msg = "Storage permission denied. In Firebase Console → Storage → Rules, set: allow read, write: if request.auth != null;";
        } else if (err.code === "storage/unknown" || msg.includes("CORS")) {
          msg = "CORS error: In Firebase Console → Storage → Rules, allow uploads for authenticated users.";
        }
        rej(new Error(msg));
      },
      async () => res(await getDownloadURL(task.snapshot.ref))
    );
  });
}

/* Close modals via data-m attribute */
document.querySelectorAll(".mcls, .btn-cancel").forEach(btn=>{
  const target=btn.dataset.m||btn.closest(".moverlay")?.id;
  if(target) btn.addEventListener("click",()=>closeM(target));
});
document.querySelectorAll(".moverlay").forEach(ov=>
  ov.addEventListener("click",e=>{if(e.target===ov)closeM(ov.id)})
);

/* ── Auth ── */
onAuthStateChanged(auth, user => { if(user||DEMO) showDash(); else showLogin(); });

function showLogin(){document.getElementById("loginScreen").classList.remove("hidden");document.getElementById("dashboard").classList.add("hidden")}
function showDash(){
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  loadGallery(); loadVideos(); loadAbout(); loadSocial(); loadMessages();
}

document.getElementById("loginForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const email=document.getElementById("lEmail").value.trim();
  const pass =document.getElementById("lPass").value;
  const btn  =document.getElementById("lBtn");
  const err  =document.getElementById("lErr");
  err.classList.add("hidden");
  setBL(btn,true);
  try {
    if(DEMO){
      if(email==="admin@demo.id"&&pass==="demo1234") showDash();
      else throw new Error("Demo mode: use admin@demo.id / demo1234");
    } else {
      await signInWithEmailAndPassword(auth,email,pass);
    }
  } catch(e){
    const map={"auth/wrong-password":"Incorrect password.","auth/user-not-found":"Email not found.","auth/invalid-email":"Invalid email.","auth/too-many-requests":"Too many attempts.","auth/invalid-credential":"Wrong email or password."};
    err.textContent=map[e.code]||e.message||"Login failed.";
    err.classList.remove("hidden");
  } finally{setBL(btn,false)}
});

document.getElementById("logoutBtn").addEventListener("click", async()=>{
  if(DEMO){showLogin();return;}
  await signOut(auth);
});

/* ── Sidebar tabs ── */
document.querySelectorAll(".sb-lnk[data-tab]").forEach(lnk=>{
  lnk.addEventListener("click",()=>{
    document.querySelectorAll(".sb-lnk").forEach(l=>l.classList.remove("active"));
    lnk.classList.add("active");
    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
    document.getElementById("tab-"+lnk.dataset.tab).classList.add("active");
    document.getElementById("barTitle").textContent=lnk.textContent.trim().slice(2).trim();
    document.getElementById("sidebar").classList.remove("open");
  });
});
document.getElementById("sbToggle").addEventListener("click",()=>
  document.getElementById("sidebar").classList.toggle("open")
);

/* ══════════════════════════════════
   GALLERY
══════════════════════════════════ */
let gData=[];

async function loadGallery(){
  const load=document.getElementById("gLoad"),wrap=document.getElementById("gWrap");
  load.classList.remove("hidden");wrap.classList.add("hidden");
  if(DEMO){gData=[...DS.gallery];}
  else{
    try{const snap=await getDocs(query(collection(db,"gallery"),orderBy("order","asc")));gData=snap.docs.map(d=>({id:d.id,...d.data()}));}
    catch{gData=[];}
  }
  load.classList.add("hidden");wrap.classList.remove("hidden");
  renderGT();
}

function renderGT(){
  const tbody=document.getElementById("gBody"),empty=document.getElementById("gEmpty");
  if(!gData.length){tbody.innerHTML="";empty.classList.remove("hidden");return;}
  empty.classList.add("hidden");
  tbody.innerHTML=gData.map(it=>`<tr>
    <td><img src="${esc(it.url)}" class="tthumb" alt=""/></td>
    <td>${esc(it.caption)}</td>
    <td>${esc(it.category)}</td>
    <td>${it.order??""}</td>
    <td><div class="abts">
      <button class="bsm bedit" onclick="editG('${it.id}')">Edit</button>
      <button class="bsm bdel"  onclick="askDel('gallery','${it.id}','${esc(it.storagePath||"")}')">Delete</button>
    </div></td>
  </tr>`).join("");
}

document.getElementById("openGM").addEventListener("click",()=>{
  document.getElementById("gMT").textContent="Add Photo";
  document.getElementById("gEditId").value="";
  ["gUrl","gCap","gDesc","gYear","gClient"].forEach(id=>document.getElementById(id).value="");
  document.getElementById("gCat").value="photo";
  document.getElementById("gOrd").value=gData.length+1;
  document.getElementById("gPrev").classList.add("hidden");
  document.getElementById("gFile").value="";
  openM("galleryModal");
});

window.editG=id=>{
  const it=gData.find(g=>g.id===id);if(!it)return;
  document.getElementById("gMT").textContent="Edit Photo";
  document.getElementById("gEditId").value=id;
  document.getElementById("gUrl").value=it.url||"";
  document.getElementById("gCap").value=it.caption||"";
  document.getElementById("gCat").value=it.category||"photo";
  document.getElementById("gDesc").value=it.description||"";
  document.getElementById("gYear").value=it.year||"";
  document.getElementById("gClient").value=it.client||"";
  document.getElementById("gOrd").value=it.order??1;
  if(it.url){document.getElementById("gPI").src=it.url;document.getElementById("gPrev").classList.remove("hidden");}
  openM("galleryModal");
};

document.getElementById("gFile").addEventListener("change",e=>{
  const f=e.target.files[0];if(!f)return;
  document.getElementById("gPI").src=URL.createObjectURL(f);
  document.getElementById("gPrev").classList.remove("hidden");
});

document.getElementById("saveGallery").addEventListener("click",async()=>{
  const btn=document.getElementById("saveGallery");
  const eid=document.getElementById("gEditId").value;
  const file=document.getElementById("gFile").files[0];
  const urlV=document.getElementById("gUrl").value.trim();
  const data={caption:document.getElementById("gCap").value.trim(),category:document.getElementById("gCat").value,
    description:document.getElementById("gDesc").value.trim(),year:document.getElementById("gYear").value.trim(),
    client:document.getElementById("gClient").value.trim(),order:parseInt(document.getElementById("gOrd").value)||1};
  setBL(btn,true);
  try{
    let imgUrl=urlV, spath=null;
    if(file){
      if(DEMO){imgUrl=URL.createObjectURL(file);}
      else{spath=`gallery/${Date.now()}_${file.name}`;imgUrl=await uploadFile(file,spath,p=>showProg("gProg","gFill","gPct",p));}
    }
    if(!imgUrl){alert("Please upload a photo or enter a URL.");return;}
    data.url=imgUrl; if(spath)data.storagePath=spath;
    if(DEMO){
      if(eid){const i=DS.gallery.findIndex(g=>g.id===eid);if(i!==-1)DS.gallery[i]={...DS.gallery[i],...data};}
      else DS.gallery.push({id:"g"+Date.now(),...data});
    } else {
      if(eid)await updateDoc(doc(db,"gallery",eid),data);
      else await addDoc(collection(db,"gallery"),{...data,createdAt:serverTimestamp()});
    }
    closeM("galleryModal"); await loadGallery();
  } catch(e){
    console.error(e);
    // Show error inside modal instead of alert
    const errMsg = e.message || "Unknown error";
    const errEl = document.createElement("p");
    errEl.style.cssText = "color:#f08080;font-size:.82rem;padding:.65rem .9rem;background:rgba(240,85,85,.08);border:1px solid rgba(240,85,85,.2);border-radius:3px;margin-top:.75rem;";
    errEl.textContent = "✕ " + errMsg;
    const mft = document.querySelector("#galleryModal .mft");
    const existing = document.getElementById("gSaveErr");
    if(existing) existing.remove();
    errEl.id = "gSaveErr";
    mft.parentNode.insertBefore(errEl, mft);
    setTimeout(()=>errEl.remove(), 8000);
  }
  finally{setBL(btn,false);}
});

/* ══════════════════════════════════
   VIDEO
══════════════════════════════════ */
let vData=[];

async function loadVideos(){
  const load=document.getElementById("vLoad"),wrap=document.getElementById("vWrap");
  load.classList.remove("hidden");wrap.classList.add("hidden");
  if(DEMO){vData=[...DS.videos];}
  else{
    try{const snap=await getDocs(query(collection(db,"videos"),orderBy("order","asc")));vData=snap.docs.map(d=>({id:d.id,...d.data()}));}
    catch{vData=[];}
  }
  load.classList.add("hidden");wrap.classList.remove("hidden");
  renderVT();
}

function renderVT(){
  const tbody=document.getElementById("vBody"),empty=document.getElementById("vEmpty");
  if(!vData.length){tbody.innerHTML="";empty.classList.remove("hidden");return;}
  empty.classList.add("hidden");
  tbody.innerHTML=vData.map(it=>`<tr>
    <td>${esc(it.title)}</td>
    <td><span style="font-size:.7rem;padding:2px 8px;border:1px solid rgba(255,255,255,.15);border-radius:3px;">${esc(it.type)}</span></td>
    <td>${esc(it.description)}</td>
    <td>${it.order??""}</td>
    <td><div class="abts">
      <button class="bsm bedit" onclick="editV('${it.id}')">Edit</button>
      <button class="bsm bdel"  onclick="askDel('videos','${it.id}','${esc(it.storagePath||"")}')">Delete</button>
    </div></td>
  </tr>`).join("");
}

function switchVType(t){
  document.getElementById("fYT").classList.toggle("hidden",t!=="youtube");
  document.getElementById("fTK").classList.toggle("hidden",t!=="tiktok");
  document.getElementById("fST").classList.toggle("hidden",t!=="storage");
  document.getElementById("fEM").classList.toggle("hidden",t!=="embed");
}

document.getElementById("vType").addEventListener("change",e=>switchVType(e.target.value));

document.getElementById("openVM").addEventListener("click",()=>{
  document.getElementById("vMT").textContent="Add Video";
  document.getElementById("vEditId").value="";
  document.getElementById("vTitle").value="";
  document.getElementById("vDesc").value="";
  document.getElementById("vType").value="youtube";
  document.getElementById("vYTId").value="";
  document.getElementById("vTKUrl").value="";
  document.getElementById("vEmbedUrl").value="";
  document.getElementById("vOrd").value=vData.length+1;
  switchVType("youtube");
  openM("videoModal");
});

window.editV=id=>{
  const it=vData.find(v=>v.id===id);if(!it)return;
  document.getElementById("vMT").textContent="Edit Video";
  document.getElementById("vEditId").value=id;
  document.getElementById("vTitle").value=it.title||"";
  document.getElementById("vDesc").value=it.description||"";
  document.getElementById("vType").value=it.type||"youtube";
  document.getElementById("vYTId").value=it.embedId||"";
  document.getElementById("vTKUrl").value=it.tiktokUrl||"";
  document.getElementById("vEmbedUrl").value=it.url||"";
  document.getElementById("vThumb").value=it.thumbnail||"";
  document.getElementById("vOrd").value=it.order??1;
  switchVType(it.type||"youtube");
  openM("videoModal");
};

document.getElementById("saveVideo").addEventListener("click",async()=>{
  const btn=document.getElementById("saveVideo");
  const eid=document.getElementById("vEditId").value;
  const type=document.getElementById("vType").value;
  const title=document.getElementById("vTitle").value.trim();
  if(!title){alert("Please enter a title.");return;}
  const data={title,type,description:document.getElementById("vDesc").value.trim(),order:parseInt(document.getElementById("vOrd").value)||1};
  setBL(btn,true);
  try{
    if(type==="youtube") data.embedId=document.getElementById("vYTId").value.trim();
    else if(type==="tiktok") data.tiktokUrl=document.getElementById("vTKUrl").value.trim();
    else if(type==="storage"){
      const f=document.getElementById("vFile").files[0];
      if(f&&!DEMO){const p=`videos/${Date.now()}_${f.name}`;data.url=await uploadFile(f,p,pct=>showProg("vProg","vFill","vPct",pct));data.storagePath=p;}
      else if(f&&DEMO) data.url=URL.createObjectURL(f);
      data.thumbnail=document.getElementById("vThumb").value.trim();
    } else if(type==="embed") data.url=document.getElementById("vEmbedUrl").value.trim();
    if(DEMO){
      if(eid){const i=DS.videos.findIndex(v=>v.id===eid);if(i!==-1)DS.videos[i]={...DS.videos[i],...data};}
      else DS.videos.push({id:"v"+Date.now(),...data});
    } else {
      if(eid)await updateDoc(doc(db,"videos",eid),data);
      else await addDoc(collection(db,"videos"),{...data,createdAt:serverTimestamp()});
    }
    closeM("videoModal"); await loadVideos();
  } catch(e){console.error(e);alert("Error: "+e.message);}
  finally{setBL(btn,false);}
});

/* ══════════════════════════════════
   DELETE
══════════════════════════════════ */
let pendDel=null;
window.askDel=(col,id,sp)=>{pendDel={col,id,sp};openM("delModal");};
document.getElementById("confirmDel").addEventListener("click",async()=>{
  if(!pendDel)return;
  const{col,id,sp}=pendDel; pendDel=null; closeM("delModal");
  try{
    if(DEMO){
      if(col==="gallery")DS.gallery=DS.gallery.filter(g=>g.id!==id);
      if(col==="videos") DS.videos =DS.videos.filter(v=>v.id!==id);
    } else {
      await deleteDoc(doc(db,col,id));
      if(sp){try{await deleteObject(ref(storage,sp));}catch{}}
    }
    if(col==="gallery")await loadGallery();
    if(col==="videos") await loadVideos();
  } catch(e){alert("Delete failed: "+e.message);}
});

/* ══════════════════════════════════
   ABOUT
══════════════════════════════════ */
async function loadAbout(){
  try{
    let d;
    if(DEMO){d=DS.about;}
    else{const snap=await getDocs(collection(db,"about"));d=snap.empty?{}:snap.docs[0].data();}
    document.getElementById("abTitle").value=d.title||"";
    document.getElementById("abContent").value=d.content||"";
    document.getElementById("abImage").value=d.image||"";
  }catch{}
}
document.getElementById("abFile").addEventListener("change",async e=>{
  const f=e.target.files[0];if(!f||DEMO)return;
  try{const p=`about/profile_${Date.now()}_${f.name}`;const u=await uploadFile(f,p,pct=>showProg("abProg","abFill","abPct",pct));document.getElementById("abImage").value=u;}
  catch(e){alert("Upload failed: "+e.message);}
});
document.getElementById("saveAbout").addEventListener("click",async()=>{
  const btn=document.getElementById("saveAbout");
  const data={title:document.getElementById("abTitle").value.trim(),content:document.getElementById("abContent").value.trim(),image:document.getElementById("abImage").value.trim()};
  setBL(btn,true);
  try{
    if(DEMO){Object.assign(DS.about,data);}
    else{const snap=await getDocs(collection(db,"about"));if(snap.empty)await addDoc(collection(db,"about"),{...data,updatedAt:serverTimestamp()});else await updateDoc(doc(db,"about",snap.docs[0].id),{...data,updatedAt:serverTimestamp()});}
    showMsg("abMsg","✓ Changes saved!",true);
  }catch(e){showMsg("abMsg","✕ Failed: "+e.message,false);}
  finally{setBL(btn,false);}
});

/* ══════════════════════════════════
   SOCIAL MEDIA
══════════════════════════════════ */
async function loadSocial(){
  try{
    let d;
    if(DEMO){d=DS.social;}
    else{const snap=await getDoc(doc(db,"settings","social"));d=snap.exists()?{...DS.social,...snap.data()}:DS.social;}
    document.getElementById("sWaH").value=d.whatsapp?.handle||"";
    document.getElementById("sWaU").value=d.whatsapp?.url||"";
    document.getElementById("sDcH").value=d.discord?.handle||"";
    document.getElementById("sDcU").value=d.discord?.url||"";
    document.getElementById("sIgH").value=d.instagram?.handle||"";
    document.getElementById("sIgU").value=d.instagram?.url||"";
    document.getElementById("sTkH").value=d.tiktok?.handle||"";
    document.getElementById("sTkU").value=d.tiktok?.url||"";
    document.getElementById("sYtH").value=d.youtube?.handle||"";
    document.getElementById("sYtU").value=d.youtube?.url||"";
  }catch{}
}
document.getElementById("saveSocial").addEventListener("click",async()=>{
  const btn=document.getElementById("saveSocial");
  const data={
    whatsapp: {handle:document.getElementById("sWaH").value.trim(),url:document.getElementById("sWaU").value.trim()},
    discord:  {handle:document.getElementById("sDcH").value.trim(),url:document.getElementById("sDcU").value.trim()},
    instagram:{handle:document.getElementById("sIgH").value.trim(),url:document.getElementById("sIgU").value.trim()},
    tiktok:   {handle:document.getElementById("sTkH").value.trim(),url:document.getElementById("sTkU").value.trim()},
    youtube:  {handle:document.getElementById("sYtH").value.trim(),url:document.getElementById("sYtU").value.trim()},
  };
  setBL(btn,true);
  try{
    if(DEMO){Object.assign(DS.social,data);}
    else{await setDoc(doc(db,"settings","social"),{...data,updatedAt:serverTimestamp()},{merge:true});}
    showMsg("socMsg","✓ Social links saved!",true);
  }catch(e){showMsg("socMsg","✕ Failed: "+e.message,false);}
  finally{setBL(btn,false);}
});

/* ══════════════════════════════════
   MESSAGES
══════════════════════════════════ */
async function loadMessages(){
  const load=document.getElementById("mLoad"),wrap=document.getElementById("mWrap");
  load.classList.remove("hidden");wrap.classList.add("hidden");
  let msgs;
  try{
    if(DEMO){msgs=DS.messages;}
    else{const snap=await getDocs(query(collection(db,"messages"),orderBy("createdAt","desc")));msgs=snap.docs.map(d=>({id:d.id,...d.data()}));}
  }catch{msgs=[];}
  load.classList.add("hidden");wrap.classList.remove("hidden");
  const tbody=document.getElementById("mBody"),empty=document.getElementById("mEmpty");
  if(!msgs.length){tbody.innerHTML="";empty.classList.remove("hidden");return;}
  empty.classList.add("hidden");
  tbody.innerHTML=msgs.map(m=>{
    const dt=m.createdAt?.toDate?m.createdAt.toDate().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):"—";
    return `<tr><td>${esc(m.name)}</td><td>${esc(m.email)}</td><td>${esc(m.service||"—")}</td><td style="max-width:240px;white-space:pre-wrap;font-size:.82rem;">${esc(m.message)}</td><td style="white-space:nowrap;font-size:.8rem;">${dt}</td></tr>`;
  }).join("");
}
