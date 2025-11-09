// --------- Data & LocalStorage Keys ---------
const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'fast', label: 'Fast Food' },
  { key: 'drinks', label: 'Drinks' },
  { key: 'desserts', label: 'Desserts' },
  { key: 'healthy', label: 'Healthy' },
];

const ITEMS = [
  { id:'b1', title:'Classic Burger', price:220, category:'fast', img:'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop' },
  { id:'d1', title:'Iced Latte', price:150, category:'drinks', img:'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?q=80&w=1200&auto=format&fit=crop' },
  { id:'s1', title:'Chocolate Sundae', price:160, category:'desserts', img:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop' },
  { id:'s2', title:'Cheesecake', price:200, category:'desserts', img:'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=1200&auto=format&fit=crop' },
  { id:'h1', title:'Grilled Chicken Salad', price:260, category:'healthy', img:'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1200&auto=format&fit=crop' },
  { id:'h2', title:'Avocado Toast', price:240, category:'healthy', img:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop' },
];

const LS = {
  CART: 'budget-foodget.cart',
  REVIEWS: 'budget-foodget.reviews'
};

// --------- App State ---------
const state = {
  category: 'all',
  sort: 'lh',
  maxPrice: 400,
  search: '',
  cart: [],
  reviews: [],
};

// --------- Elements ---------
const yearEl = document.getElementById('year');
const categoryStrip = document.getElementById('categoryStrip');
const menuGrid = document.getElementById('menu');
const cartCount = document.getElementById('cartCount');
const openCartBtn = document.getElementById('openCartBtn');

const cartDrawer = document.getElementById('cartDrawer');
const cartBackdrop = document.getElementById('cartBackdrop');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItems = document.getElementById('cartItems');
const cartSummary = document.getElementById('cartSummary');
const emptyCart = document.getElementById('emptyCart');
const subtotalEl = document.getElementById('subtotal');
const deliveryEl = document.getElementById('delivery');
const totalEl = document.getElementById('total');
const clearCartBtn = document.getElementById('clearCart');
const checkoutBtn = document.getElementById('checkoutBtn');

const successModal = document.getElementById('successModal');
const closeSuccess = document.getElementById('closeSuccess');

const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const priceRange = document.getElementById('priceRange');
const priceView = document.getElementById('priceView');

const reviewForm = document.getElementById('reviewForm');
const revName = document.getElementById('revName');
const revRating = document.getElementById('revRating');
const revText = document.getElementById('revText');
const clearReviews = document.getElementById('clearReviews');
const reviewsList = document.getElementById('reviewsList');

// --------- Helpers ---------
const saveLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const loadLS = (k, def) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? def; } catch { return def; } };

function formatBDT(n){ return `৳${n}`; }

function filteredItems(){
  let list = ITEMS.slice();
  if(state.category !== 'all') list = list.filter(i => i.category === state.category);
  list = list.filter(i => i.price <= state.maxPrice);
  if(state.search.trim()) list = list.filter(i => i.title.toLowerCase().includes(state.search.toLowerCase()));
  list.sort((a,b)=> state.sort==='lh' ? a.price-b.price : b.price-a.price);
  return list;
}

function renderCategories(){
  categoryStrip.innerHTML = '';
  CATEGORIES.forEach(c => {
    const btn = document.createElement('button');
    btn.textContent = c.label;
    btn.className = 'whitespace-nowrap px-4 py-2 rounded-full border transition';
    if(state.category === c.key){
      btn.className += ' bg-orange-500 text-white border-orange-500';
    } else {
      btn.className += ' bg-white text-slate-700 border-slate-200 hover:bg-slate-50';
    }
    btn.addEventListener('click', ()=>{ state.category = c.key; renderCategories(); renderMenu(); });
    categoryStrip.appendChild(btn);
  });
}

function renderMenu(){
  const items = filteredItems();
  menuGrid.innerHTML = '';
  items.forEach(it => {
    const card = document.createElement('div');
    card.className = 'rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition bg-white';
    card.innerHTML = `
      <img src="${it.img}" alt="${it.title}" class="h-44 w-full object-cover"/>
      <div class="p-4">
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-semibold text-slate-800">${it.title}</h3>
          <span class="font-bold text-orange-500">${formatBDT(it.price)}</span>
        </div>
        <div class="mt-3 flex items-center justify-between">
          <span class="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 border border-slate-200">${cLabel(it.category)}</span>
          <button class="px-4 py-2 rounded-2xl bg-orange-500 text-white hover:bg-orange-600">Add to cart</button>
        </div>
      </div>`;
    card.querySelector('button').addEventListener('click', ()=> addToCart(it));
    menuGrid.appendChild(card);
  });
}

function cLabel(key){ return (CATEGORIES.find(c=>c.key===key)||{}).label || key; }

// Cart logic
function loadCart(){ state.cart = loadLS(LS.CART, []); updateCartUI(); }
function saveCart(){ saveLS(LS.CART, state.cart); updateCartUI(); }
function addToCart(item){
  const found = state.cart.find(p=>p.id===item.id);
  if(found) found.qty += 1; else state.cart.push({...item, qty:1});
  saveCart(); openCart();
}
function changeQty(id, delta){
  state.cart = state.cart.map(p => p.id===id ? {...p, qty: Math.max(1, p.qty + delta)} : p).filter(p=>p.qty>0);
  saveCart();
}
function removeItem(id){ state.cart = state.cart.filter(p=>p.id!==id); saveCart(); }
function clearCart(){ state.cart = []; saveCart(); }

function updateCartUI(){
  cartCount.textContent = state.cart.reduce((n,i)=>n+i.qty,0);
  cartItems.innerHTML='';
  if(state.cart.length===0){
    cartSummary.classList.add('hidden');
    emptyCart.classList.remove('hidden');
  } else {
    cartSummary.classList.remove('hidden');
    emptyCart.classList.add('hidden');
  }
  let subtotal = 0;
  state.cart.forEach(i=>{ subtotal += i.price * i.qty; });
  const delivery = subtotal>0 && subtotal<299 ? 40 : 0;
  const total = subtotal + delivery;
  subtotalEl.textContent = formatBDT(subtotal);
  deliveryEl.textContent = delivery ? formatBDT(delivery) : 'Free';
  totalEl.textContent = formatBDT(total);

  state.cart.forEach(i=>{
    const row = document.createElement('div');
    row.className = 'flex items-center gap-3 border rounded-xl p-3';
    row.innerHTML = `
      <img src="${i.img}" alt="${i.title}" class="w-16 h-16 rounded-lg object-cover"/>
      <div class="flex-1">
        <p class="font-semibold">${i.title}</p>
        <p class="text-sm text-slate-500">${formatBDT(i.price)} × ${i.qty}</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-3 py-2 rounded-2xl border">-</button>
        <span class="w-6 text-center">${i.qty}</span>
        <button class="px-3 py-2 rounded-2xl border">+</button>
      </div>
      <button class="px-3 py-2 rounded-2xl border">🗑️</button>`;
    const [minus, , plus] = row.querySelectorAll('button');
    const delBtn = row.querySelectorAll('button')[3];
    minus.addEventListener('click', ()=> changeQty(i.id,-1));
    plus.addEventListener('click', ()=> changeQty(i.id,+1));
    delBtn.addEventListener('click', ()=> removeItem(i.id));
    cartItems.appendChild(row);
  });
}

// Drawer controls
function openCart(){
  cartDrawer.classList.remove('pointer-events-none');
  const panel = cartDrawer.children[1];
  cartBackdrop.classList.remove('opacity-0');
  panel.classList.remove('translate-x-full');
}
function closeCart(){
  const panel = cartDrawer.children[1];
  cartBackdrop.classList.add('opacity-0');
  panel.classList.add('translate-x-full');
  setTimeout(()=> cartDrawer.classList.add('pointer-events-none'), 200);
}

// Success modal
function showSuccess(){ successModal.classList.remove('hidden'); }
function hideSuccess(){ successModal.classList.add('hidden'); }

// Reviews
function loadReviews(){ state.reviews = loadLS(LS.REVIEWS, []); renderReviews(); }
function saveReviews(){ saveLS(LS.REVIEWS, state.reviews); renderReviews(); }
function renderReviews(){
  reviewsList.innerHTML='';
  if(state.reviews.length===0){
    reviewsList.innerHTML = `
      <div class="col-span-full flex justify-center mt-6">
        <p class="text-slate-600 text-center">No reviews yet. Be the first to leave one!</p>
      </div>`;
    return;
  }

  state.reviews.forEach(r=>{
    const card = document.createElement('div');
    card.className = 'rounded-2xl border border-slate-200 p-4 bg-white';
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <p class="font-semibold">${r.name}</p>
        <p class="text-sm text-slate-500">${new Date(r.date).toLocaleString()}</p>
      </div>
      <p class="mt-1">${'⭐'.repeat(r.rating)}</p>
      <p class="mt-2 text-slate-700">${r.text}</p>`;
    reviewsList.appendChild(card);
  });
}

// --------- Events & Init ---------
yearEl.textContent = new Date().getFullYear();

// Filter controls
searchInput.addEventListener('input', (e)=>{ state.search = e.target.value; renderMenu(); });
sortSelect.addEventListener('change', (e)=>{ state.sort = e.target.value; renderMenu(); });
priceRange.addEventListener('input', (e)=>{ state.maxPrice = Number(e.target.value); priceView.textContent = e.target.value; renderMenu(); });

// Drawer bindings
openCartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartBackdrop.addEventListener('click', closeCart);

clearCartBtn.addEventListener('click', clearCart);
checkoutBtn.addEventListener('click', ()=>{ clearCart(); closeCart(); showSuccess(); });

closeSuccess.addEventListener('click', hideSuccess);

// Review form
reviewForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const entry = { id: crypto.randomUUID(), name: revName.value.trim(), rating: Number(revRating.value), text: revText.value.trim(), date: new Date().toISOString() };
  if(!entry.name || !entry.text) return;
  state.reviews = [entry, ...state.reviews];
  saveReviews();
  reviewForm.reset();
});
clearReviews.addEventListener('click', ()=>{ state.reviews = []; saveReviews(); });

// Newsletter/Contact demo handlers (existence guard)
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit',(e)=>{e.preventDefault(); alert('Subscribed! Check your inbox for a welcome email.'); e.target.reset();});
}
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit',(e)=>{e.preventDefault(); alert("Thanks! We'll get back to you soon."); e.target.reset();});
}

// Load persisted data & initial render
state.cart = loadLS(LS.CART, []);
state.reviews = loadLS(LS.REVIEWS, []);
renderCategories();
renderMenu();
updateCartUI();
renderReviews();

// Persist on changes across tabs
window.addEventListener('storage', ()=>{ loadCart(); loadReviews(); });
