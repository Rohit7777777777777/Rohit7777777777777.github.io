/* ==========================================================================
   PromptRoaRs AI — App Logic
   ========================================================================== */

(function(){
const { AI_TOOLS, CATEGORIES, CREATORS, PROMPTS, REVIEWS, NOTIFICATIONS, CURRENT_USER } = window.PR_DATA;

const Store = {
  get(key, fallback){
    try{ const v = localStorage.getItem('pr_'+key); return v ? JSON.parse(v) : fallback; }
    catch(e){ return fallback; }
  },
  set(key, value){
    try{ localStorage.setItem('pr_'+key, JSON.stringify(value)); }catch(e){}
  },
};

function getFavorites(){ return Store.get('favorites', []); }
function toggleFavorite(id){
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if(idx > -1) favs.splice(idx,1); else favs.push(id);
  Store.set('favorites', favs);
  return favs;
}

function getPurchases(){ return Store.get('purchases', ['p5','p11']); }
function purchasePrompt(id){
  const owned = getPurchases();
  if(!owned.includes(id)) owned.push(id);
  Store.set('purchases', owned);
  return owned;
}

function toolMeta(toolId){ return AI_TOOLS.find(t => t.id === toolId) || { name:toolId, icon:'✦' }; }
function creatorMeta(cId){ return CREATORS.find(c => c.id === cId); }
function money(n){ return n === 0 ? 'Free' : `₹${n}`; }
function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

let toastTimer;
function showToast(msg){
  let el = qs('.toast');
  if(!el){
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.innerHTML = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

function initHeader(){
  const toggle = qs('.nav-toggle');
  const nav = qs('.nav');
  if(toggle && nav){
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }
  const yearEl = qs('#footer-year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  const walletEls = qsa('[data-wallet-balance]');
  walletEls.forEach(el => el.textContent = `₹${CURRENT_USER.wallet.toLocaleString('en-IN')}`);

  const unread = NOTIFICATIONS.filter(n => n.unread).length;
  const badge = qs('[data-notif-badge]');
  if(badge){ badge.textContent = unread; badge.style.display = unread ? 'flex' : 'none'; }
}

function promptCardHtml(p){
  const creator = creatorMeta(p.creator);
  const tool = toolMeta(p.tool);
  const isFav = getFavorites().includes(p.id);
  return `
  <article class="prompt-card glass">
    <a class="prompt-card-media" href="prompt-detail.html?id=${p.id}">
      <span>${tool.icon} ${escapeHtml(tool.name)} · ${escapeHtml(p.category)}</span>
    </a>
    <div class="prompt-card-body">
      <div class="prompt-card-top">
        <h4><a href="prompt-detail.html?id=${p.id}">${escapeHtml(p.title)}</a></h4>
        <button class="fav-btn ${isFav?'active':''}" data-fav="${p.id}" aria-label="Save to favorites" aria-pressed="${isFav}">${isFav ? '♥' : '♡'}</button>
      </div>
      <p class="prompt-card-desc">${escapeHtml(p.desc)}</p>
      <div class="prompt-card-tags">
        ${p.tags.slice(0,3).map(t => `<span class="pill">${escapeHtml(t)}</span>`).join('')}
      </div>
      <div class="prompt-card-foot">
        <div class="prompt-creator">
          <span class="creator-avatar"></span>
          <span>${creator ? escapeHtml(creator.name) : 'Creator'}</span>
        </div>
        <span class="prompt-price">${money(p.price)}</span>
      </div>
    </div>
  </article>`;
}

function bindFavButtons(root=document){
  qsa('[data-fav]', root).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-fav');
      const favs = toggleFavorite(id);
      const active = favs.includes(id);
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active);
      btn.textContent = active ? '♥' : '♡';
      showToast(active ? 'Saved to favorites ✨' : 'Removed from favorites');
    });
  });
}

function initMarketplace(){
  const grid = qs('#prompt-grid');
  if(!grid) return;

  const searchInput = qs('#search-input');
  const categorySelect = qs('#category-select');
  const toolSelect = qs('#tool-select');
  const sortSelect = qs('#sort-select');
  const freeChip = qs('#chip-free');
  const emptyState = qs('#empty-state');

  if(categorySelect){
    categorySelect.innerHTML = `<option value="">All categories</option>` +
      CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
  }
  if(toolSelect){
    toolSelect.innerHTML = `<option value="">All tools</option>` +
      AI_TOOLS.map(t => `<option value="${t.id}">${t.icon} ${t.name}</option>`).join('');
  }

  const url = new URL(window.location.href);
  if(categorySelect && url.searchParams.get('category')) categorySelect.value = url.searchParams.get('category');
  if(toolSelect && url.searchParams.get('tool')) toolSelect.value = url.searchParams.get('tool');
  if(searchInput && url.searchParams.get('q')) searchInput.value = url.searchParams.get('q');

  let onlyFree = false;

  function render(){
    const q = (searchInput?.value || '').toLowerCase().trim();
    const cat = categorySelect?.value || '';
    const tool = toolSelect?.value || '';
    const sort = sortSelect?.value || 'popular';

    let list = PROMPTS.filter(p => {
      if(cat && p.category !== cat) return false;
      if(tool && p.tool !== tool) return false;
      if(onlyFree && p.price !== 0) return false;
      if(q && !(p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)))) return false;
      return true;
    });

    if(sort === 'popular') list = list.slice().sort((a,b) => b.sales - a.sales);
    if(sort === 'newest') list = list.slice().reverse();
    if(sort === 'price-low') list = list.slice().sort((a,b) => a.price - b.price);
    if(sort === 'price-high') list = list.slice().sort((a,b) => b.price - a.price);
    if(sort === 'rating') list = list.slice().sort((a,b) => b.rating - a.rating);

    grid.innerHTML = list.map(promptCardHtml).join('');
    bindFavButtons(grid);
    if(emptyState) emptyState.style.display = list.length ? 'none' : 'block';
  }

  [searchInput, categorySelect, toolSelect, sortSelect].forEach(el => {
    if(el) el.addEventListener('input', render);
  });
  if(freeChip){
    freeChip.addEventListener('click', () => {
      onlyFree = !onlyFree;
      freeChip.classList.toggle('active', onlyFree);
      render();
    });
  }

  render();
                                                                                        }
function initPromptDetail(){
  const root = qs('#prompt-detail-root');
  if(!root) return;
  const id = new URL(window.location.href).searchParams.get('id') || PROMPTS[0].id;
  const p = PROMPTS.find(x => x.id === id) || PROMPTS[0];
  const creator = creatorMeta(p.creator);
  const tool = toolMeta(p.tool);
  const owned = getPurchases().includes(p.id);
  const isFav = getFavorites().includes(p.id);
  const promptReviews = REVIEWS.filter(r => r.promptId === p.id);

  document.title = `${p.title} — PromptRoaRs AI`;

  root.innerHTML = `
    <div class="breadcrumb"><a href="marketplace.html">Marketplace</a> / <a href="marketplace.html?category=${encodeURIComponent(p.category)}">${escapeHtml(p.category)}</a> / <span>${escapeHtml(p.title)}</span></div>
    <div class="detail-grid">
      <div>
        <span class="eyebrow">${tool.icon} ${escapeHtml(tool.name)} · ${escapeHtml(p.category)}</span>
        <h1 style="margin-top:8px;font-size:clamp(24px,3vw,34px);">${escapeHtml(p.title)}</h1>
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:18px;flex-wrap:wrap;">
          <span class="pill">★ ${p.rating} (${p.reviews} reviews)</span>
          <span class="pill">${p.sales.toLocaleString('en-IN')} sold</span>
        </div>
        <p>${escapeHtml(p.desc)}</p>
        <div class="prompt-card-tags" style="margin:18px 0;">${p.tags.map(t=>`<span class="pill">${escapeHtml(t)}</span>`).join('')}</div>

        <h3>Prompt preview</h3>
        <div class="prompt-body-box glass">${owned ? escapeHtml(p.body) : escapeHtml(p.body.slice(0, 90)) + '…\n\n🔒 Unlock the full prompt after purchase.'}</div>

        <h3 style="margin-top:32px;">Reviews (${promptReviews.length})</h3>
        ${promptReviews.length ? promptReviews.map(r => `
          <div class="review-row">
            <span class="creator-avatar"></span>
            <div>
              <div style="display:flex;gap:8px;align-items:center;"><strong style="color:var(--text-hi);font-size:13.5px;">${escapeHtml(r.user)}</strong><span class="text-mono" style="font-size:12px;color:var(--amber);">${'★'.repeat(r.rating)}</span></div>
              <p style="font-size:13.5px;margin:4px 0 0;">${escapeHtml(r.text)}</p>
            </div>
          </div>`).join('') : `<p class="text-mute">No reviews yet for this prompt.</p>`}
      </div>

      <aside class="buy-card glass">
        <div class="prompt-price" style="font-size:26px;margin-bottom:14px;">${money(p.price)}</div>
        <button class="btn btn-primary" style="width:100%;margin-bottom:10px;" id="buy-btn">${owned ? '✓ Owned — View Prompt' : (p.price===0 ? 'Get for Free' : 'Buy Prompt')}</button>
        <button class="btn btn-ghost" style="width:100%;" data-fav="${p.id}">${isFav ? '♥ Saved' : '♡ Save to Favorites'}</button>
        <div style="margin:20px 0;border-top:1px solid var(--border);"></div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="creator-avatar" style="width:38px;height:38px;"></span>
          <div>
            <a href="creator-profile.html?id=${p.creator}" style="color:var(--text-hi);font-weight:600;font-size:14px;">${creator ? escapeHtml(creator.name) : 'Creator'}</a>
            <div class="text-mute" style="font-size:12px;">${creator ? escapeHtml(creator.handle) : ''}</div>
          </div>
        </div>
        <p style="font-size:12.5px;margin-top:14px;">${creator ? escapeHtml(creator.bio) : ''}</p>
      </aside>
    </div>
  `;

  bindFavButtons(root);

  qs('#buy-btn').addEventListener('click', () => {
    if(!owned){
      purchasePrompt(p.id);
      showToast(p.price === 0 ? 'Added to your library — it\'s free! 🎉' : `Purchased for ${money(p.price)} 🎉`);
      setTimeout(() => initPromptDetail(), 400);
    } else {
      showToast('You already own this prompt — scroll up to view it.');
    }
  });
}

function toolCardHtml(t){
  return `<a class="tool-card glass" href="marketplace.html?tool=${t.id}">
    <span class="tool-icon">${t.icon}</span>
    <h4>${escapeHtml(t.name)}</h4>
    <p>${escapeHtml(t.category)} prompts</p>
  </a>`;
}
function initToolDirectory(){
  const grid = qs('#tool-grid');
  if(!grid) return;
  grid.innerHTML = AI_TOOLS.map(toolCardHtml).join('');
}

function initGenerator(){
  const form = qs('#generator-form');
  if(!form) return;

  const toolSelect = qs('#gen-tool');
  const catSelect = qs('#gen-category');
  if(toolSelect) toolSelect.innerHTML = AI_TOOLS.map(t => `<option value="${t.id}">${t.icon} ${t.name}</option>`).join('');
  if(catSelect) catSelect.innerHTML = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');

  const resultBox = qs('#generator-result');
  const btn = qs('#generate-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.innerHTML = `<span class="roar-bar" style="height:14px;gap:2px;"><span></span><span></span><span></span><span></span></span> Preparing…`;
    resultBox.innerHTML = '';

    const params = {
      idea: qs('#gen-idea').value,
      tool: toolSelect.value,
      category: catSelect.value,
      tone: qs('#gen-tone').value,
      language: qs('#gen-language').value,
      complexity: qs('#gen-complexity').value,
    };

    const res = await PR_AI.PromptGeneratorService.generate(params);

    btn.disabled = false;
    btn.textContent = 'Generate Prompt';
    renderComingSoon(resultBox, 'AI generation is coming soon 🚀', res.message);
  });
}

function initImprover(){
  const form = qs('#improver-form');
  if(!form) return;
  const resultBox = qs('#improver-result');
  const btn = qs('#improve-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    btn.innerHTML = `<span class="roar-bar" style="height:14px;gap:2px;"><span></span><span></span><span></span><span></span></span> Preparing…`;
    resultBox.innerHTML = '';

    const res = await PR_AI.PromptImproverService.improve({ promptText: qs('#improver-input').value });

    btn.disabled = false;
    btn.textContent = 'Improve Prompt';
    renderComingSoon(resultBox, 'AI Prompt Improver is coming soon 🚀', res.message);
  });
}

function initChat(){
  const form = qs('#chat-form');
  if(!form) return;
  const window_ = qs('#chat-window');
  const input = qs('#chat-input');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if(!text) return;

    window_.insertAdjacentHTML('beforeend', `<div class="chat-msg user">${escapeHtml(text)}</div>`);
    input.value = '';
    window_.scrollTop = window_.scrollHeight;

    window_.insertAdjacentHTML('beforeend', `<div class="chat-msg system" id="typing-indicator"><span class="roar-bar" style="height:12px;gap:2px;"><span></span><span></span><span></span><span></span></span></div>`);
    window_.scrollTop = window_.scrollHeight;

    const res = await PR_AI.ChatService.send({ message: text });

    qs('#typing-indicator')?.remove();
    window_.insertAdjacentHTML('beforeend', `<div class="chat-msg system">${escapeHtml(res.message)}</div>`);
    window_.scrollTop = window_.scrollHeight;
  });
}  
 function renderComingSoon(container, title, message){
  container.innerHTML = `
    <div class="coming-soon-card">
      <div class="roar-bar"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
      <span class="coming-soon-badge">✨ AI Engine Preparing — Powered by PromptRoaRs AI</span>
    </div>`;
}

function initDashboard(){
  const root = qs('#dashboard-root');
  if(!root) return;

  const owned = getPurchases();
  const favs = getFavorites();
  const myPrompts = PROMPTS.filter(p => p.creator === 'c1').slice(0,3);

  qsa('[data-stat="owned"]').forEach(el => el.textContent = owned.length);
  qsa('[data-stat="favorites"]').forEach(el => el.textContent = favs.length);
  qsa('[data-stat="wallet"]').forEach(el => el.textContent = `₹${CURRENT_USER.wallet.toLocaleString('en-IN')}`);
  qsa('[data-stat="referrals"]').forEach(el => el.textContent = '6');

  const notifList = qs('#notif-list');
  if(notifList){
    notifList.innerHTML = NOTIFICATIONS.map(n => `
      <div class="review-row">
        <span class="pill-dot" style="margin-top:6px;background:${n.unread ? 'var(--amber)' : 'var(--text-mute)'}"></span>
        <div><p style="margin:0;font-size:13.5px;">${escapeHtml(n.text)}</p><span class="text-mute" style="font-size:11.5px;">${n.time}</span></div>
      </div>`).join('');
  }

  const ownedGrid = qs('#owned-grid');
  if(ownedGrid){
    const list = PROMPTS.filter(p => owned.includes(p.id));
    ownedGrid.innerHTML = list.length ? list.map(promptCardHtml).join('') : `<p class="text-mute">You haven't purchased any prompts yet. <a href="marketplace.html" style="color:var(--violet);">Browse the marketplace →</a></p>`;
    bindFavButtons(ownedGrid);
  }

  const favGrid = qs('#fav-grid');
  if(favGrid){
    const list = PROMPTS.filter(p => favs.includes(p.id));
    favGrid.innerHTML = list.length ? list.map(promptCardHtml).join('') : `<p class="text-mute">No favorites yet. Tap ♡ on any prompt to save it here.</p>`;
    bindFavButtons(favGrid);
  }

  const salesTable = qs('#sales-table-body');
  if(salesTable){
    salesTable.innerHTML = myPrompts.map(p => `
      <tr>
        <td>${escapeHtml(p.title)}</td>
        <td>${p.sales.toLocaleString('en-IN')}</td>
        <td>${money(p.price)}</td>
        <td>₹${(p.sales * p.price * 0.8).toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
        <td><span class="pill"><span class="pill-dot"></span> Live</span></td>
      </tr>`).join('');
  }

  const refInput = qs('#referral-code');
  if(refInput) refInput.value = CURRENT_USER.referralCode;
  const copyBtn = qs('#copy-referral');
  if(copyBtn){
    copyBtn.addEventListener('click', () => {
      refInput.select();
      try{ document.execCommand('copy'); }catch(e){}
      showToast('Referral code copied 📋');
    });
  }
}

function initAdmin(){
  const root = qs('#admin-root');
  if(!root) return;

  qsa('[data-admin-stat="users"]').forEach(el => el.textContent = '4,812');
  qsa('[data-admin-stat="prompts"]').forEach(el => el.textContent = PROMPTS.length.toLocaleString('en-IN'));
  qsa('[data-admin-stat="gmv"]').forEach(el => el.textContent = `₹18,42,600`);
  qsa('[data-admin-stat="creators"]').forEach(el => el.textContent = CREATORS.length);

  const body = qs('#admin-prompts-body');
  if(body){
    body.innerHTML = PROMPTS.map(p => {
      const c = creatorMeta(p.creator);
      return `<tr>
        <td>${escapeHtml(p.title)}</td>
        <td>${c ? escapeHtml(c.name) : ''}</td>
        <td>${escapeHtml(p.category)}</td>
        <td>${money(p.price)}</td>
        <td>${p.sales.toLocaleString('en-IN')}</td>
        <td><span class="pill"><span class="pill-dot"></span> Approved</span></td>
      </tr>`;
    }).join('');
  }
}

function initCreatorProfile(){
  const root = qs('#creator-root');
  if(!root) return;
  const id = new URL(window.location.href).searchParams.get('id') || CREATORS[0].id;
  const c = CREATORS.find(x => x.id === id) || CREATORS[0];
  const items = PROMPTS.filter(p => p.creator === c.id);

  document.title = `${c.name} — PromptRoaRs AI`;
  qs('#creator-name').textContent = c.name;
  qs('#creator-handle').textContent = c.handle;
  qs('#creator-bio').textContent = c.bio;
  qs('#creator-sales').textContent = c.sales.toLocaleString('en-IN');
  qs('#creator-rating').textContent = c.rating.toFixed(1);
  qs('#creator-count').textContent = items.length;

  const grid = qs('#creator-grid');
  grid.innerHTML = items.map(promptCardHtml).join('');
  bindFavButtons(grid);
}

function initHome(){
  const toolGrid = qs('#tool-grid-home');
  if(toolGrid) toolGrid.innerHTML = AI_TOOLS.slice(0,7).map(toolCardHtml).join('');

  const featuredGrid = qs('#featured-grid');
  if(featuredGrid){
    const featured = PROMPTS.slice().sort((a,b) => b.sales - a.sales).slice(0,4);
    featuredGrid.innerHTML = featured.map(promptCardHtml).join('');
    bindFavButtons(featuredGrid);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHome();
  initMarketplace();
  initPromptDetail();
  initToolDirectory();
  initGenerator();
  initImprover();
  initChat();
  initDashboard();
  initAdmin();
  initCreatorProfile();
});
})();
