// script.js (ES module)
// IMPORTANT: replace FIREBASE CONFIG placeholder with your Firebase project's config
// Create Firebase project -> Add Web app -> copy firebaseConfig here:
const FIREBASE_CONFIG = /* 🔥 PASTE FIREBASE CONFIG HERE */ {
  // Example:
  // apiKey: "AIzaSy...yourkey...",
  // authDomain: "your-project.firebaseapp.com",
  // projectId: "your-project",
  // storageBucket: "your-project.appspot.com",
  // messagingSenderId: "...",
  // appId: "1:...:web:..."
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

if (!FIREBASE_CONFIG || !FIREBASE_CONFIG.apiKey) {
  alert('Firebase config missing! মাস্টি: script.js ফাইলে FIREBASE_CONFIG যোগ করো (Firebase Console থেকে কপি) ।');
}

// init
const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

// DOM refs
const splash = document.getElementById('splash');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

const heroName = document.getElementById('heroName');
const heroRole = document.getElementById('heroRole');
const heroPhoto = document.getElementById('heroPhoto');

const createSection = document.getElementById('createSection');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const uploadStatus = document.getElementById('uploadStatus');
const historyGrid = document.getElementById('historyGrid');

const captionForm = document.getElementById('captionForm');
const newCaptionBtn = document.getElementById('newCaptionBtn');
const saveCaption = document.getElementById('saveCaption');
const cancelCaption = document.getElementById('cancelCaption');
const captionInput = document.getElementById('captionInput');
const captionsList = document.getElementById('captionsList');

const portfolioGrid = document.getElementById('portfolioGrid');

// NAV
document.getElementById('navHome').addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
document.getElementById('navAbout').addEventListener('click', ()=> document.getElementById('aboutSection').scrollIntoView({behavior:'smooth'}));
document.getElementById('navBlog').addEventListener('click', ()=> document.getElementById('blogSection').scrollIntoView({behavior:'smooth'}));
document.getElementById('navPortfolio').addEventListener('click', ()=> document.getElementById('portfolioSection').scrollIntoView({behavior:'smooth'}));
document.getElementById('navContact').addEventListener('click', ()=> document.getElementById('contactSection').scrollIntoView({behavior:'smooth'}));

// Splash hide after ready
window.addEventListener('load', () => {
  setTimeout(()=> { splash.classList.add('hidden'); }, 900);
});

// AUTH actions
loginBtn.addEventListener('click', async () => {
  try { await signInWithPopup(auth, provider); } catch(e){ alert('Login failed: '+e.message); }
});
logoutBtn.addEventListener('click', async () => { await signOut(auth); });

// Auth state change
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // show user UI
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    createSection.classList.remove('hidden');

    heroName.textContent = user.displayName || 'User';
    heroRole.textContent = user.email || 'Member';
    heroPhoto.src = user.photoURL || heroPhoto.src;

    // load history & captions & portfolio (user-specific)
    await loadUploads(user.uid);
    await loadCaptions(user.uid);
    await loadPortfolio();
  } else {
    // guest UI
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    createSection.classList.add('hidden');

    heroName.textContent = 'ANIK MIA';
    heroRole.textContent = 'Designer • Developer • Storyteller';
    heroPhoto.src = 'https://via.placeholder.com/180x180.png?text=ZX';
    captionsList.innerHTML = '';
  }
});

// UPLOAD image
uploadBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return alert('Please login first');
  const file = fileInput.files[0];
  if (!file) return alert('Choose an image');

  uploadStatus.textContent = 'Uploading...';
  const path = `users/${user.uid}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  // save metadata
  await addDoc(collection(db, 'images'), { uid: user.uid, url, name: file.name, createdAt: Date.now() });
  uploadStatus.textContent = 'Uploaded ✅';
  fileInput.value = '';
  await loadUploads(user.uid);
});

// DEMO generate (creates a placeholder image blob)
document.getElementById('generateDemo').addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return alert('Please login first to generate demo image');

  // create a simple canvas image
  const canvas = document.createElement('canvas');
  canvas.width = 800; canvas.height = 450;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#10b981'; ctx.font = 'bold 48px sans-serif';
  ctx.fillText('ZX Anikvai Demo', 40, 120);
  ctx.fillStyle = '#e2e8f0'; ctx.font = '20px sans-serif';
  ctx.fillText(new Date().toLocaleString(), 40, 160);

  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], `demo_${Date.now()}.png`, {type:'image/png'});
    const path = `users/${user.uid}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await addDoc(collection(db, 'images'), { uid: user.uid, url, name: file.name, createdAt: Date.now() });
    uploadStatus.textContent = 'Demo generated & uploaded ✅';
    await loadUploads(user.uid);
  });
});

// Load uploads for user
async function loadUploads(uid) {
  historyGrid.innerHTML = 'Loading...';
  const q = query(collection(db, 'images'), where('uid', '==', uid), orderBy('createdAt','desc'));
  const snap = await getDocs(q);
  historyGrid.innerHTML = '';
  if (snap.empty) historyGrid.innerHTML = '<div class="text-slate-400">কোনো আপলোড নেই</div>';
  snap.forEach(doc => {
    const data = doc.data();
    const el = document.createElement('div');
    el.className = 'port-item';
    el.innerHTML = `<img src="${data.url}" alt="${data.name}"><div class="p-2 text-sm text-slate-300">${new Date(data.createdAt).toLocaleString()}</div>`;
    historyGrid.appendChild(el);
  });
}

// CAPTIONS (simple user-managed posts)
// new caption toggle
newCaptionBtn.addEventListener('click', ()=> captionForm.classList.toggle('hidden'));
cancelCaption.addEventListener('click', ()=> { captionForm.classList.add('hidden'); captionInput.value = ''; });

// save caption to Firestore
saveCaption.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return alert('Please login first to save caption');
  const text = captionInput.value.trim();
  if (!text) return alert('কিছু লিখো');

  await addDoc(collection(db, 'captions'), { uid: user.uid, text, createdAt: Date.now(), author: user.displayName || user.email });
  captionInput.value = '';
  captionForm.classList.add('hidden');
  await loadCaptions(user.uid);
});

// load captions (user's + public recent)
async function loadCaptions(uid) {
  captionsList.innerHTML = 'Loading...';
  // show recent global 10 captions
  const q = query(collection(db, 'captions'), orderBy('createdAt','desc'));
  const snap = await getDocs(q);
  captionsList.innerHTML = '';
  snap.forEach(doc => {
    const d = doc.data();
    const card = document.createElement('div');
    card.className = 'caption-card';
    card.innerHTML = `<div class="flex justify-between items-start">
      <div>
        <div class="text-slate-200 font-semibold">${d.author || 'Anonymous'}</div>
        <div class="text-slate-300 text-sm mt-1">${escapeHtml(d.text)}</div>
      </div>
      <div class="text-xs text-slate-400">${new Date(d.createdAt).toLocaleString()}</div>
    </div>`;
    captionsList.appendChild(card);
  });
}

// portfolio demo items (static, can be replaced with Firestore-driven later)
async function loadPortfolio() {
  portfolioGrid.innerHTML = '';
  const demo = [
    {title:'Personal Brand', img:'https://via.placeholder.com/600x400.png?text=Project+1', note:'Branding & identity'},
    {title:'Landing Page', img:'https://via.placeholder.com/600x400.png?text=Project+2', note:'Responsive website'},
    {title:'Emotion Series', img:'https://via.placeholder.com/600x400.png?text=Project+3', note:'Short stories & covers'},
  ];
  demo.forEach(item => {
    const node = document.createElement('div');
    node.className = 'port-item';
    node.innerHTML = `<img src="${item.img}" alt="${item.title}"><div class="p-3"><div class="font-semibold text-slate-100">${item.title}</div><div class="text-sm text-slate-300 mt-1">${item.note}</div></div>`;
    portfolioGrid.appendChild(node);
  });
}

/* Utility: very small sanitizer */
function escapeHtml(text) {
  return text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}
