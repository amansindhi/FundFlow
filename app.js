/* ===================== FundFlow ===================== */
const CAT = { Food: 'utensils', Transport: 'car', Shopping: 'shopping-bag', Health: 'heart-pulse', Entertainment: 'gamepad-2', Housing: 'house', Bills: 'receipt', Salary: 'briefcase', Gift: 'gift', Education: 'graduation-cap', Travel: 'plane', Repair: 'wrench', Other: 'circle-dollar-sign' };
const gi = k => CAT[k] || 'circle-dollar-sign';
const CAT_COLORS = ['#FF6B5B', '#00C896', '#FFC94D', '#7C6FF0', '#4FC3E8', '#FF8FB3', '#8BD450', '#F0946B'];

let txns = JSON.parse(localStorage.getItem('ff-txns') || '[]');
let budgets = JSON.parse(localStorage.getItem('ff-bgt') || '{}');
let recurs = JSON.parse(localStorage.getItem('ff-recur') || '[]');
let goals = JSON.parse(localStorage.getItem('ff-goals') || '[]');
let cT = 'expense', sMth = null, bgtToDelete = null, delTarget = null, isRecur = false;

document.getElementById('inp-date').value = todayStr();
function todayStr() { return new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]; }

const sT = localStorage.getItem('ff-theme') || 'light';
applyTheme(sT);
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : '');
  const icon = document.getElementById('t-icon');
  if (icon) icon.setAttribute('data-lucide', t === 'dark' ? 'sun' : 'moon');
  localStorage.setItem('ff-theme', t);
  const m = document.getElementById('tcmeta'); if (m) m.content = t === 'dark' ? '#241E33' : '#FFF8F0';
  ic();
}
function toggleTheme() { applyTheme(localStorage.getItem('ff-theme') === 'dark' ? 'light' : 'dark'); }

const fmt = n => Number(n).toLocaleString('en-IN');
function ic() { if (window.lucide) lucide.createIcons(); }
document.addEventListener('DOMContentLoaded', ic);

function showToast(msg, kind) {
  const t = document.getElementById('toast');
  t.innerHTML = '<i data-lucide="' + (kind === 'error' ? 'alert-circle' : 'check-circle') + '"></i><span>' + msg + '</span>';
  t.className = kind === 'error' ? 'err' : '';
  ic();
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(window._tt);
  window._tt = setTimeout(() => t.classList.remove('show'), 2600);
}

function sv(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  document.getElementById('nav-' + view).classList.add('active');
  if (view === 'analytics') renderAnalytics();
  if (view === 'budget') renderBudgets();
  if (view === 'goals') renderGoals();
}

/* ---------- Recurring auto-apply on load ---------- */
function processRecurring() {
  const today = new Date(todayStr());
  let changed = false;
  recurs.forEach(r => {
    let next = new Date(r.next);
    while (next <= today) {
      txns.unshift({ id: Date.now() + Math.random(), name: r.name, amt: r.amt, catKey: r.catKey, catDisplay: r.catDisplay, date: next.toISOString().split('T')[0], type: r.type, fromRecur: r.id });
      if (r.freq === 'weekly') next.setDate(next.getDate() + 7);
      else next.setMonth(next.getMonth() + 1);
      changed = true;
    }
    r.next = next.toISOString().split('T')[0];
  });
  if (changed) { save(); }
}

function toggleRecurChk() {
  isRecur = !isRecur;
  document.getElementById('recur-chk').classList.toggle('checked', isRecur);
  document.getElementById('recur-freq-wrap').classList.toggle('show', isRecur);
}

/* ---------- Form helpers ---------- */
function setType(t) {
  cT = t;
  document.getElementById('btn-exp').className = 'type-btn' + (t === 'expense' ? ' ae' : '');
  document.getElementById('btn-inc').className = 'type-btn' + (t === 'income' ? ' ai' : '');
  ic();
}
function checkOther() {
  const v = document.getElementById('inp-cat').value;
  const w = document.getElementById('other-wrap');
  if (v === 'Other') { w.classList.add('show'); document.getElementById('inp-other').focus(); }
  else { w.classList.remove('show'); document.getElementById('inp-other').value = ''; }
}
function checkEditOther() {
  const v = document.getElementById('edit-cat').value;
  document.getElementById('edit-other-wrap').classList[v === 'Other' ? 'add' : 'remove']('show');
}

function addTxn() {
  const n = document.getElementById('inp-name').value.trim();
  const a = parseFloat(document.getElementById('inp-amt').value);
  const rc = document.getElementById('inp-cat').value;
  const d = document.getElementById('inp-date').value;
  if (!a || a <= 0) { flashErr('inp-amt'); return; }
  const sel = document.getElementById('inp-cat');
  let ck = rc, cd = sel.options[sel.selectedIndex].text;
  if (rc === 'Other') {
    const c = document.getElementById('inp-other').value.trim();
    if (!c) { flashErr('inp-other'); return; }
    ck = 'Other'; cd = '\u{1F4B0} ' + c;
  }
  const nm = n || cd.replace(/^\S+\s/, '') || 'Transaction';

  if (isRecur) {
    const freq = document.getElementById('inp-recur-freq').value;
    let next = new Date(d);
    recurs.push({ id: Date.now(), name: nm, amt: a, catKey: ck, catDisplay: cd, type: cT, freq: freq, next: next.toISOString().split('T')[0] });
  }

  txns.unshift({ id: Date.now(), name: nm, amt: a, catKey: ck, catDisplay: cd, date: d, type: cT });
  save(); render();
  document.getElementById('inp-name').value = '';
  document.getElementById('inp-amt').value = '';
  document.getElementById('inp-other').value = '';
  document.getElementById('other-wrap').classList.remove('show');
  sel.selectedIndex = 0;
  isRecur = false;
  document.getElementById('recur-chk').classList.remove('checked');
  document.getElementById('recur-freq-wrap').classList.remove('show');
  showToast(isRecur ? 'Recurring transaction added' : 'Transaction added', 'success');
}

function flashErr(id) {
  const el = document.getElementById(id);
  el.style.borderColor = 'var(--coral)'; el.focus();
  setTimeout(() => el.style.borderColor = '', 1400);
}

function delTxn(id) { txns = txns.filter(t => t.id !== id); save(); render(); showToast('Transaction deleted', 'success'); }

function delRecur(id) {
  recurs = recurs.filter(r => r.id !== id);
  save(); render();
  showToast('Recurring transaction removed', 'success');
}

function save() {
  localStorage.setItem('ff-txns', JSON.stringify(txns));
  localStorage.setItem('ff-bgt', JSON.stringify(budgets));
  localStorage.setItem('ff-recur', JSON.stringify(recurs));
  localStorage.setItem('ff-goals', JSON.stringify(goals));
}

/* ---------- Render: transaction card ---------- */
function tCard(t) {
  const ln = gi(t.catKey);
  const bg = t.type === 'expense' ? 'rgba(255,107,91,.14)' : 'rgba(0,200,150,.14)';
  const col = t.type === 'expense' ? 'var(--coral-dk)' : 'var(--teal-dk)';
  const d = t.date ? new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '';
  const dp = (t.catDisplay || t.catKey || 'Other').replace(/^\S+\s/, '');
  const recurBadge = t.fromRecur ? '<span class="recur-badge">Auto</span>' : '';
  return `<div class="txn-item"><div class="txn-icon" style="background:${bg}"><i data-lucide="${ln}" style="color:${col}"></i></div><div class="txn-info"><div class="txn-name">${escapeHtml(t.name)}</div><div class="txn-meta"><i data-lucide="tag"></i>${dp} &middot; ${d} ${recurBadge}</div></div><div class="txn-amt ${t.type === 'expense' ? 'neg' : 'pos'}">${t.type === 'expense' ? '\u2212' : '+'}\u20B9${fmt(t.amt)}</div><button class="txn-edit" onclick="editTxn(${t.id})" title="Edit"><i data-lucide="pencil"></i></button><button class="txn-del" onclick="delTxn(${t.id})" title="Delete"><i data-lucide="trash-2"></i></button></div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function rCard(r) {
  const ln = gi(r.catKey);
  const dp = (r.catDisplay || r.catKey || 'Other').replace(/^\S+\s/, '');
  const freqLabel = r.freq === 'weekly' ? 'Weekly' : 'Monthly';
  return `<div class="txn-item"><div class="txn-icon" style="background:rgba(255,201,77,.2)"><i data-lucide="${ln}" style="color:var(--yellow-dk)"></i></div><div class="txn-info"><div class="txn-name">${escapeHtml(r.name)}</div><div class="txn-meta"><i data-lucide="repeat"></i>${freqLabel} &middot; ${dp} &middot; next ${new Date(r.next).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</div></div><div class="txn-amt ${r.type === 'expense' ? 'neg' : 'pos'}">${r.type === 'expense' ? '\u2212' : '+'}\u20B9${fmt(r.amt)}</div><button class="txn-del" onclick="delRecur(${r.id})" title="Remove"><i data-lucide="trash-2"></i></button></div>`;
}

function filterTxns() {
  const q = (document.getElementById('txn-search').value || '').trim().toLowerCase();
  const list = document.getElementById('txn-list');
  const filtered = q ? txns.filter(t => (t.name + ' ' + (t.catDisplay || '')).toLowerCase().includes(q)) : txns;
  if (!filtered.length) {
    list.innerHTML = '<div class="empty"><div class="ei"><i data-lucide="receipt"></i></div><p>' + (q ? 'No matching transactions' : 'No transactions yet.<br>Add your first one above!') + '</p></div>';
  } else {
    list.innerHTML = filtered.slice(0, 60).map(tCard).join('');
  }
  ic();
}

/* ---------- Main render ---------- */
function render() {
  const inc = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amt, 0);
  const exp = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amt, 0);
  const bal = inc - exp;
  const balEl = document.getElementById('bal');
  balEl.textContent = (bal < 0 ? '\u2212' : '') + fmt(Math.abs(bal));
  balEl.parentElement.style.color = bal < 0 ? '#FF9A8A' : '#fff';
  document.getElementById('tot-inc').textContent = fmt(inc);
  document.getElementById('tot-exp').textContent = fmt(exp);
  document.getElementById('tot-recur').textContent = recurs.length;
  const countEl = document.getElementById('txn-count');
  if (!txns.length) {
    countEl.textContent = 'No transactions yet';
  } else if (bal < 0) {
    countEl.textContent = txns.length + ' transaction' + (txns.length !== 1 ? 's' : '') + ' \u2022 spending more than logged income';
  } else {
    countEl.textContent = txns.length + ' transaction' + (txns.length !== 1 ? 's' : '');
  }

  filterTxns();

  const rl = document.getElementById('recur-list');
  rl.innerHTML = recurs.length ? recurs.map(rCard).join('') : '<div class="empty"><div class="ei"><i data-lucide="repeat"></i></div><p>No recurring transactions.<br>Tick the box above to add one, like monthly rent or allowance.</p></div>';

  ic();
}

/* ---------- Edit transaction ---------- */
function editTxn(id) {
  const t = txns.find(x => x.id === id);
  if (!t) return;
  document.getElementById('edit-id').value = id;
  document.getElementById('edit-name').value = t.name;
  document.getElementById('edit-amt').value = t.amt;
  document.getElementById('edit-date').value = t.date || '';
  document.getElementById('edit-type').value = t.type;
  const sel = document.getElementById('edit-cat');
  for (let i = 0; i < sel.options.length; i++) if (sel.options[i].value === t.catKey) { sel.selectedIndex = i; break; }
  if (t.catKey === 'Other') {
    document.getElementById('edit-other-wrap').classList.add('show');
    document.getElementById('edit-other').value = (t.catDisplay || '').replace(/^\S+\s/, '');
  } else {
    document.getElementById('edit-other-wrap').classList.remove('show');
    document.getElementById('edit-other').value = '';
  }
  document.getElementById('edit-modal').classList.add('show');
  ic();
}
function saveEditTxn() {
  const id = parseFloat(document.getElementById('edit-id').value);
  const idx = txns.findIndex(x => x.id === id);
  if (idx === -1) return;
  const amt = parseFloat(document.getElementById('edit-amt').value);
  if (!amt || amt <= 0) { flashErr('edit-amt'); return; }
  const sel = document.getElementById('edit-cat');
  let ck = sel.value, cd = sel.options[sel.selectedIndex].text;
  if (ck === 'Other') {
    const desc = document.getElementById('edit-other').value.trim();
    if (!desc) { flashErr('edit-other'); return; }
    cd = '\u{1F4B0} ' + desc;
  }
  txns[idx].name = document.getElementById('edit-name').value.trim() || cd.replace(/^\S+\s/, '') || 'Transaction';
  txns[idx].amt = amt;
  txns[idx].date = document.getElementById('edit-date').value;
  txns[idx].type = document.getElementById('edit-type').value;
  txns[idx].catKey = ck;
  txns[idx].catDisplay = cd;
  save(); render();
  document.getElementById('edit-modal').classList.remove('show');
  showToast('Transaction updated', 'success');
}
function closeEditModal() { document.getElementById('edit-modal').classList.remove('show'); }

/* ---------- CSV export ---------- */
function exportCSV() {
  if (!txns.length) { showToast('No transactions to export', 'error'); return; }
  const rows = [['Date', 'Description', 'Category', 'Type', 'Amount (INR)']];
  txns.forEach(t => {
    const d = t.date || '';
    const name = (t.name || '').replace(/,/g, ' ');
    const cat = ((t.catDisplay || t.catKey || 'Other').replace(/^\S+\s/, '')).replace(/,/g, ' ');
    rows.push([d, name, cat, t.type, t.amt]);
  });
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'fundflow_' + todayStr() + '.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('Exported ' + txns.length + ' transactions', 'success');
}

/* ---------- Analytics ---------- */
function getMonthKey(d) { const dt = new Date(d); return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0'); }
function monthLabel(key) {
  const [y, m] = key.split('-');
  const now = new Date();
  const d = new Date(y, m - 1);
  // show year suffix when the month isn't in the current calendar year
  return d.getFullYear() === now.getFullYear()
    ? d.toLocaleDateString('en-IN', { month: 'short' })
    : d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

function renderAnalytics() {
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
  }
  const byMonth = {};
  months.forEach(m => byMonth[m] = { exp: 0, inc: 0 });
  txns.forEach(t => { if (!t.date) return; const k = getMonthKey(t.date); if (byMonth[k]) byMonth[k][t.type === 'expense' ? 'exp' : 'inc'] += t.amt; });

  const maxVal = Math.max(1, ...months.map(m => Math.max(byMonth[m].exp, byMonth[m].inc)));
  document.getElementById('bar-chart').innerHTML = months.map(m => {
    const h = Math.round((byMonth[m].exp / maxVal) * 100);
    const sel = m === sMth ? ' sel' : '';
    return `<div class="bar-col${sel}" onclick="selectMonth('${m}')"><div class="bar-track"><div class="bar-fill" style="height:${Math.max(h,3)}%"></div></div><div class="bar-lbl">${monthLabel(m)}</div></div>`;
  }).join('');

  document.getElementById('mpills').innerHTML = months.slice().reverse().map(m =>
    `<button class="mpill${m === sMth ? ' active' : ''}" onclick="selectMonth('${m}')">${monthLabel(m)}</button>`
  ).join('');

  if (sMth) renderMonthDetail(sMth); else document.getElementById('mdetail').style.display = 'none';

  const catTotals = {};
  txns.filter(t => t.type === 'expense').forEach(t => {
    const name = (t.catDisplay || t.catKey || 'Other').replace(/^\S+\s/, '');
    catTotals[name] = (catTotals[name] || 0) + t.amt;
  });
  const catChart = document.getElementById('cat-chart');
  const entries = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    catChart.innerHTML = '<div class="empty"><div class="ei"><i data-lucide="pie-chart"></i></div><p>Add transactions to see analytics</p></div>';
  } else {
    const total = entries.reduce((s, e) => s + e[1], 0);
    catChart.innerHTML = '<div class="chart-title"><i data-lucide="pie-chart"></i> Spending by Category</div>' +
      entries.map((e, i) => {
        const pct = Math.round((e[1] / total) * 100);
        return `<div class="cat-row"><div class="cat-dot" style="background:${CAT_COLORS[i % CAT_COLORS.length]}"></div><div class="cat-name">${e[0]}</div><div class="cat-pct">${pct}%</div><div class="cat-amt">\u20B9${fmt(e[1])}</div></div>`;
      }).join('');
  }
  ic();
}

function selectMonth(m) { sMth = (sMth === m) ? null : m; renderAnalytics(); }
function closeMd() { sMth = null; renderAnalytics(); }

function renderMonthDetail(m) {
  const list = txns.filter(t => t.date && getMonthKey(t.date) === m);
  const exp = list.filter(t => t.type === 'expense').reduce((s, t) => s + t.amt, 0);
  const inc = list.filter(t => t.type === 'income').reduce((s, t) => s + t.amt, 0);
  document.getElementById('mdetail').style.display = 'block';
  document.getElementById('md-name').textContent = new Date(m + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  document.getElementById('md-exp').textContent = '\u20B9' + fmt(exp);
  document.getElementById('md-inc').textContent = '\u20B9' + fmt(inc);
  document.getElementById('md-net').textContent = '\u20B9' + fmt(inc - exp);
  document.getElementById('md-list').innerHTML = list.length ? list.map(tCard).join('') : '<div class="empty"><p>No transactions this month</p></div>';
  ic();
}

/* ---------- Budgets ---------- */
function showBM() { document.getElementById('bm').classList.add('show'); document.getElementById('bm-amt').value = ''; ic(); }
function closeBM() { document.getElementById('bm').classList.remove('show'); }
function onBmPeriodChange() {
  document.getElementById('bm-custom-dates').style.display = document.getElementById('bm-period').value === 'custom' ? 'flex' : 'none';
}
function saveBudget() {
  const cat = document.getElementById('bm-cat').value;
  const amt = parseFloat(document.getElementById('bm-amt').value);
  if (!amt || amt <= 0) { flashErr('bm-amt'); return; }
  const period = document.getElementById('bm-period').value;
  let from, to;
  const now = new Date();
  if (period === 'custom') {
    from = document.getElementById('bm-from').value;
    to = document.getElementById('bm-to').value;
    if (!from || !to) { showToast('Pick both dates', 'error'); return; }
  } else {
    from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  }
  budgets[cat] = { amt, from, to, period };
  save(); renderBudgets();
  closeBM();
  showToast('Budget saved', 'success');
}
function renderBudgets() {
  const el = document.getElementById('bgt-list');
  const keys = Object.keys(budgets);
  if (!keys.length) { el.innerHTML = '<div class="empty"><div class="ei"><i data-lucide="target"></i></div><p>No budgets set.<br>Tap "Set a Budget" to add one!</p></div>'; return; }
  el.innerHTML = keys.map(cat => {
    const b = budgets[cat];
    const spent = txns.filter(t => t.type === 'expense' && t.date >= b.from && t.date <= b.to && (t.catDisplay || t.catKey || '').replace(/^\S+\s/, '') === cat).reduce((s, t) => s + t.amt, 0);
    const pct = Math.min(100, Math.round((spent / b.amt) * 100));
    const over = spent > b.amt;
    const barColor = over ? 'var(--coral)' : (pct > 80 ? 'var(--yellow)' : 'var(--teal)');
    return `<div class="bgt-item"><div class="bgt-hdr"><div class="bgt-cat"><i data-lucide="tag"></i>${cat}</div><button class="txn-del" onclick="delBgt(event,'${cat}')" title="Delete"><i data-lucide="trash-2"></i></button></div><div class="bgt-amts">\u20B9${fmt(spent)} of \u20B9${fmt(b.amt)}</div><div class="bar-bg"><div class="bar-prog" style="width:${pct}%;background:${barColor}"></div></div><div class="bgt-pct" style="color:${over ? 'var(--coral-dk)' : 'var(--plum-soft)'}">${over ? 'Over budget!' : pct + '% used'}</div></div>`;
  }).join('');
  ic();
}
function delBgt(e, cat) {
  e.stopPropagation();
  delTarget = { kind: 'budget', key: cat };
  document.getElementById('del-cat-name').innerHTML = 'Delete the <b>' + cat + '</b> budget?';
  document.getElementById('del-cm').classList.add('show');
  ic();
}

/* ---------- Savings Goals ---------- */
function showGoalModal(id) {
  document.getElementById('goal-id').value = id || '';
  if (id) {
    const g = goals.find(x => x.id === id);
    document.getElementById('goal-modal-title').textContent = 'Edit Goal';
    document.getElementById('goal-name').value = g.name;
    document.getElementById('goal-target').value = g.target;
    document.getElementById('goal-saved').value = g.saved;
  } else {
    document.getElementById('goal-modal-title').textContent = 'New Savings Goal';
    document.getElementById('goal-name').value = '';
    document.getElementById('goal-target').value = '';
    document.getElementById('goal-saved').value = '';
  }
  document.getElementById('goal-modal').classList.add('show');
  ic();
}
function closeGoalModal() { document.getElementById('goal-modal').classList.remove('show'); }
function saveGoal() {
  const id = document.getElementById('goal-id').value;
  const name = document.getElementById('goal-name').value.trim();
  const target = parseFloat(document.getElementById('goal-target').value);
  const saved = parseFloat(document.getElementById('goal-saved').value) || 0;
  if (!name) { flashErr('goal-name'); return; }
  if (!target || target <= 0) { flashErr('goal-target'); return; }
  if (id) {
    const g = goals.find(x => x.id === parseFloat(id));
    if (g) { g.name = name; g.target = target; g.saved = saved; }
  } else {
    goals.push({ id: Date.now(), name, target, saved });
  }
  save(); renderGoals(); closeGoalModal();
  showToast('Goal saved', 'success');
}
function renderGoals() {
  const el = document.getElementById('goal-list');
  if (!goals.length) { el.innerHTML = '<div class="empty"><div class="ei"><i data-lucide="piggy-bank"></i></div><p>No goals yet.<br>Try saving for a trip, laptop, or gadget!</p></div>'; return; }
  el.innerHTML = goals.map(g => {
    const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
    const ring = svgRing(pct);
    return `<div class="goal-item" onclick="showGoalModal(${g.id})"><div class="goal-hdr"><div class="goal-name"><i data-lucide="piggy-bank"></i>${escapeHtml(g.name)}</div><button class="txn-del" onclick="delGoal(event,${g.id})" title="Delete"><i data-lucide="trash-2"></i></button></div><div class="goal-progress-wrap"><div class="goal-ring">${ring}</div><div class="goal-info"><div class="goal-pct-label">${pct}%</div><div class="goal-target">\u20B9${fmt(g.saved)} of \u20B9${fmt(g.target)}</div><button class="btn-ok" style="margin-top:8px;padding:8px;font-size:12px" onclick="event.stopPropagation();showGoalAddModal(${g.id})"><i data-lucide="plus"></i> Add Funds</button></div></div></div>`;
  }).join('');
  ic();
}
function svgRing(pct) {
  const r = 26, c = 2 * Math.PI * r, off = c - (pct / 100) * c;
  const color = pct >= 100 ? 'var(--teal)' : 'var(--coral)';
  return `<svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--line)" stroke-width="7"/><circle cx="32" cy="32" r="${r}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 32 32)"/></svg>`;
}
function delGoal(e, id) {
  e.stopPropagation();
  delTarget = { kind: 'goal', key: id };
  const g = goals.find(x => x.id === id);
  document.getElementById('del-cat-name').innerHTML = 'Delete the <b>' + escapeHtml(g ? g.name : 'goal') + '</b> goal?';
  document.getElementById('del-cm').classList.add('show');
  ic();
}
function showGoalAddModal(id) {
  document.getElementById('goal-add-id').value = id;
  document.getElementById('goal-add-amt').value = '';
  document.getElementById('goal-add-modal').classList.add('show');
  ic();
}
function closeGoalAddModal() { document.getElementById('goal-add-modal').classList.remove('show'); }
function confirmGoalAdd() {
  const id = parseFloat(document.getElementById('goal-add-id').value);
  const amt = parseFloat(document.getElementById('goal-add-amt').value);
  if (!amt || amt <= 0) { flashErr('goal-add-amt'); return; }
  const g = goals.find(x => x.id === id);
  if (g) { g.saved += amt; save(); renderGoals(); }
  closeGoalAddModal();
  showToast('Added to goal!', 'success');
}

/* ---------- Shared delete confirm ---------- */
function closeDelCm() { document.getElementById('del-cm').classList.remove('show'); delTarget = null; }
function confirmDelete() {
  if (!delTarget) return;
  if (delTarget.kind === 'budget') { delete budgets[delTarget.key]; renderBudgets(); showToast('Budget deleted', 'success'); }
  if (delTarget.kind === 'goal') { goals = goals.filter(g => g.id !== delTarget.key); renderGoals(); showToast('Goal deleted', 'success'); }
  save();
  closeDelCm();
}

/* ---------- Clear records ---------- */
function showClearModal() { document.getElementById('clear-modal').classList.add('show'); onClearRangeChange(); ic(); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
function onClearRangeChange() {
  const v = document.getElementById('clear-range').value;
  document.getElementById('clear-custom-dates').style.display = v === 'custom' ? 'flex' : 'none';
  updateClearPreview();
}
function getClearRange() {
  const v = document.getElementById('clear-range').value;
  const now = new Date();
  if (v === 'all') return null;
  if (v === 'thismonth') return [new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 0)];
  if (v === 'last3') return [new Date(now.getFullYear(), now.getMonth() - 2, 1), now];
  if (v === 'last6') return [new Date(now.getFullYear(), now.getMonth() - 5, 1), now];
  if (v === 'thisyear') return [new Date(now.getFullYear(), 0, 1), new Date(now.getFullYear(), 11, 31)];
  if (v === 'custom') {
    const f = document.getElementById('clear-from').value, t = document.getElementById('clear-to').value;
    if (!f || !t) return undefined;
    return [new Date(f), new Date(t)];
  }
  return null;
}
function updateClearPreview() {
  const range = getClearRange();
  const prev = document.getElementById('clear-preview');
  const txt = document.getElementById('clear-preview-text');
  if (range === undefined) { prev.style.display = 'none'; return; }
  let count;
  if (range === null) count = txns.length;
  else count = txns.filter(t => t.date && new Date(t.date) >= range[0] && new Date(t.date) <= range[1]).length;
  prev.style.display = 'block';
  txt.textContent = count + ' transaction' + (count !== 1 ? 's' : '') + ' will be deleted.';
}
function confirmClear() {
  const range = getClearRange();
  if (range === undefined) { showToast('Pick both dates', 'error'); return; }
  let count;
  if (range === null) { count = txns.length; txns = []; }
  else { const keep = []; count = 0; txns.forEach(t => { if (t.date && new Date(t.date) >= range[0] && new Date(t.date) <= range[1]) count++; else keep.push(t); }); txns = keep; }
  save(); render();
  closeModal('clear-modal');
  showToast(count + ' transaction' + (count !== 1 ? 's' : '') + ' deleted', 'success');
}

/* ---------- Init ---------- */
processRecurring();
render();
setTimeout(ic, 200);

/* PWA install prompt */
let dp = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); dp = e; });
function doInstall() { if (!dp) return; dp.prompt(); dp.userChoice.then(() => { dp = null; }); }

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
