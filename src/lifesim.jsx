import React, { useState, useEffect, useRef, useCallback } from 'react';
import { tick, buildInitialState, fmt, fmtCompact, monthLabel, tradeKey, pushLog } from './engine/index.js';
import { COMPANIES, WORK_MODES, AFTER_WORK, ASSETS, GOALS, SKILL_META, TRAIT_META, FOOD_TIERS, TRANSPORT_TIERS, INSURANCE_PLANS } from './content.js';
import { storage } from './storage.js';

// ============================================================
// Theme — CSS custom properties, one place to change colors
// ============================================================

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');

:root {
  --c-bg:  #1a1209;
  --c-sf:  #2a1f0e;
  --c-sf2: #3d2e18;
  --c-bd:  #6b4c2a;
  --c-ac:  #e8a838;
  --c-gr:  #7bc47f;
  --c-tx:  #f0e6d3;
  --c-dm:  #9c7d5a;
  --c-rd:  #e05252;
  --c-bl:  #5b9bd5;
}

.ls-root, .ls-root * { box-sizing: border-box; }
.ls-root {
  font-family: 'Noto Sans Thai', system-ui, -apple-system, sans-serif;
  color: var(--c-tx);
  background: var(--c-bg);
  min-height: 100vh;
  letter-spacing: 0.005em;
  font-size: 14px;
  line-height: 1.5;
  background-image:
    radial-gradient(circle at 10% 20%, rgba(232,168,56,0.04) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(91,155,213,0.03) 0%, transparent 40%);
}

.ls-card {
  background: var(--c-sf);
  border: 1px solid var(--c-bd);
  border-radius: 8px;
  padding: 14px;
}
.ls-card-tight {
  background: var(--c-sf);
  border: 1px solid var(--c-bd);
  border-radius: 8px;
  padding: 10px;
}

.ls-h1 { font-size: 28px; font-weight: 700; color: var(--c-ac); letter-spacing: 0.5px; }
.ls-h2 { font-size: 18px; font-weight: 600; color: var(--c-ac); margin-bottom: 8px; }
.ls-h3 { font-size: 14px; font-weight: 600; color: var(--c-dm); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
.ls-muted { color: var(--c-dm); font-size: 12px; }

.ls-btn {
  background: var(--c-sf2);
  border: 1px solid var(--c-bd);
  color: var(--c-tx);
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ls-btn:hover:not(:disabled) { background: var(--c-bd); transform: translateY(-1px); }
.ls-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ls-btn-primary { background: var(--c-ac); color: var(--c-bg); border-color: var(--c-ac); font-weight: 600; }
.ls-btn-primary:hover:not(:disabled) { background: #f0b848; }
.ls-btn-danger  { background: var(--c-rd); color: var(--c-tx); border-color: var(--c-rd); }
.ls-btn-active  { background: var(--c-ac) !important; color: var(--c-bg) !important; border-color: var(--c-ac) !important; font-weight: 600; }
.ls-btn-ghost   { background: transparent; border-color: var(--c-bd); }

.ls-input {
  background: var(--c-bg);
  border: 1px solid var(--c-bd);
  color: var(--c-tx);
  padding: 8px 12px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  width: 100%;
}
.ls-input:focus { outline: none; border-color: var(--c-ac); }

.ls-slider {
  -webkit-appearance: none;
  width: 100%; height: 6px;
  border-radius: 3px;
  background: var(--c-sf2);
  outline: none;
}
.ls-slider::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: var(--c-ac);
  cursor: pointer;
  border: 2px solid var(--c-bg);
}
.ls-slider::-moz-range-thumb {
  width: 18px; height: 18px;
  border-radius: 50%;
  background: var(--c-ac);
  cursor: pointer;
  border: 2px solid var(--c-bg);
}

.ls-scene {
  background: linear-gradient(180deg, #4a3520 0%, #2a1f0e 60%, #1a1209 100%);
  border: 1px solid var(--c-bd);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  height: 150px;
  display: flex;
}
.ls-scene-half {
  flex: 1;
  position: relative;
  border-right: 1px dashed var(--c-bd);
}
.ls-scene-half:last-child { border-right: none; }
.ls-scene-label {
  position: absolute;
  top: 6px; left: 8px;
  font-size: 11px;
  color: var(--c-dm);
  text-transform: uppercase;
  letter-spacing: 1px;
}
.ls-pixel-ground {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 24px;
  background: repeating-linear-gradient(
    90deg, #5a3f1d 0px, #5a3f1d 6px, #4a3015 6px, #4a3015 12px
  );
  border-top: 2px solid var(--c-bd);
}
.ls-char {
  position: absolute;
  bottom: 28px; left: 50%;
  transform: translateX(-50%);
  font-size: 48px;
  filter: drop-shadow(0 4px 0 rgba(0,0,0,0.4));
  user-select: none;
}

@keyframes bob      { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-4px)} }
@keyframes fast-bob { 0%,100%{transform:translateX(-50%) translateY(0) rotate(-2deg)} 50%{transform:translateX(-50%) translateY(-6px) rotate(2deg)} }
@keyframes nod      { 0%,100%{transform:translateX(-50%) rotate(-3deg)} 50%{transform:translateX(-50%) rotate(3deg)} }
@keyframes zzz      { 0%,100%{transform:translateX(-50%) scale(1)} 50%{transform:translateX(-50%) scale(1.04)} }
@keyframes dance    { 0%,100%{transform:translateX(-50%) translateY(0) rotate(-5deg)} 25%{transform:translateX(-50%) translateY(-4px) rotate(0deg)} 75%{transform:translateX(-50%) translateY(-4px) rotate(5deg)} }

.a-serious       { animation: fast-bob .5s  infinite ease-in-out; }
.a-normal        { animation: bob     1.5s  infinite ease-in-out; }
.a-social        { animation: nod     1s    infinite ease-in-out; }
.a-slack         { animation: zzz     2s    infinite ease-in-out; }
.a-rest          { animation: zzz     3s    infinite ease-in-out; }
.a-study         { animation: bob     2s    infinite ease-in-out; }
.a-freelance     { animation: fast-bob .7s  infinite ease-in-out; }
.a-invest        { animation: nod     1.5s  infinite ease-in-out; }
.a-entertainment { animation: dance   1.5s  infinite ease-in-out; }
.a-socialize     { animation: dance   .8s   infinite ease-in-out; }

.ls-bar { background: var(--c-bg); border: 1px solid var(--c-bd); border-radius: 999px; overflow: hidden; height: 10px; position: relative; }
.ls-bar-fill { height: 100%; transition: width 0.3s ease; }

@keyframes ls-tick-bar { from { width: 0% } to { width: 100% } }
.ls-tick-bar-fill { height: 100%; background: var(--c-ac); border-radius: 2px; }

.ls-stat-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed var(--c-sf2); }
.ls-stat-row:last-child { border-bottom: none; }
.ls-stat-label { color: var(--c-dm); font-size: 13px; }
.ls-stat-value { font-weight: 600; }

.ls-log-entry {
  padding: 6px 10px;
  border-left: 3px solid;
  border-radius: 0 4px 4px 0;
  margin-bottom: 4px;
  background: rgba(0,0,0,0.2);
  font-size: 12.5px;
  display: flex;
  gap: 8px;
}
.ls-log-time  { color: var(--c-dm); font-size: 11px; font-variant-numeric: tabular-nums; min-width: 64px; }
.ls-log-good  { border-color: var(--c-gr); }
.ls-log-bad   { border-color: var(--c-rd); }
.ls-log-event { border-color: var(--c-ac); }
.ls-log-info  { border-color: var(--c-bd); }

.ls-tab {
  background: transparent;
  border: none;
  color: var(--c-dm);
  padding: 8px 14px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}
.ls-tab:hover { color: var(--c-tx); }
.ls-tab.active { color: var(--c-ac); border-bottom-color: var(--c-ac); }

.ls-modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.ls-modal {
  background: var(--c-sf);
  border: 1px solid var(--c-ac);
  border-radius: 12px;
  padding: 24px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.ls-banner {
  background: linear-gradient(90deg, rgba(232,168,56,0.13), transparent);
  border: 1px solid var(--c-ac);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.ls-banner-danger {
  background: linear-gradient(90deg, rgba(224,82,82,0.13), transparent);
  border-color: var(--c-rd);
}

.ls-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.ls-scroll {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--c-bd) var(--c-bg);
}
.ls-scroll::-webkit-scrollbar { width: 8px; }
.ls-scroll::-webkit-scrollbar-track { background: var(--c-bg); }
.ls-scroll::-webkit-scrollbar-thumb { background: var(--c-bd); border-radius: 4px; }

.ls-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ls-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.ls-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }

/* selected button state via data attr — avoids inline style duplication */
.ls-btn[data-sel="true"]  { background: var(--c-ac); color: var(--c-bg); border-color: var(--c-ac); font-weight: 600; }
.ls-btn[data-locked="true"] { opacity: 0.4; }

@media (max-width: 900px) {
  .ls-main-layout { grid-template-columns: 1fr !important; }
}
`;

// ============================================================
// Setup screen
// ============================================================

function SetupScreen({ onStart }) {
  const [step, setStep]         = useState(0);
  const [name, setName]         = useState('');
  const [traits, setTraits]     = useState({ diligence: 3, extravagance: 3, socialStatus: 3 });
  const SKILL_POOL               = 70;
  const [skills, setSkills]     = useState({ tech: 10, finance: 10, creative: 10 });
  const [companyId, setCompanyId] = useState('');
  const [debtFlags, setDebtFlags] = useState({ student: false, car: false, home: false, family: false });
  const [lifeGoal, setLifeGoal] = useState('millionaire');

  const skillUsed      = skills.tech + skills.finance + skills.creative - 30;
  const skillRemaining = SKILL_POOL - skillUsed;

  const setSkill = (k, v) => {
    const others     = Object.entries(skills).filter(([key]) => key !== k).reduce((a, [, val]) => a + val, 0);
    const maxAllowed = SKILL_POOL + 30 - others;
    const next       = Math.min(100, Math.max(10, Math.min(maxAllowed, v)));
    setSkills({ ...skills, [k]: next });
  };

  const eligibleCompanies = COMPANIES.map(co => {
    const failed = [];
    for (const [k, req] of Object.entries(co.requires)) {
      if (skills[k] < req) failed.push(`${SKILL_META[k].label} ${skills[k]}/${req}`);
    }
    return { ...co, _failed: failed };
  });

  const selectedCompany   = COMPANIES.find(c => c.id === companyId);
  const estimatedSalary   = selectedCompany
    ? selectedCompany.type === 'freelance'
      ? `${fmtCompact(selectedCompany.salaryMin)}–${fmtCompact(selectedCompany.salaryMax)}/เดือน (variable)`
      : fmt(calcEmployedGrossUI(selectedCompany, skills, traits)) + '/เดือน'
    : '';

  const buildDebts = () => {
    const arr = [];
    const uid_ = () => Math.random().toString(36).slice(2, 9);
    if (debtFlags.student) arr.push({ id: uid_(), name: 'กยศ.',       type: 'loan',  remaining: 200_000,   rate: 0.01, monthly: 2200 });
    if (debtFlags.car)     arr.push({ id: uid_(), name: 'รถยนต์',      type: 'loan',  remaining: 600_000,   rate: 0.04, monthly: 11500 });
    if (debtFlags.home)    arr.push({ id: uid_(), name: 'บ้าน',        type: 'loan',  remaining: 2_500_000, rate: 0.03, monthly: 14500 });
    if (debtFlags.family)  arr.push({ id: uid_(), name: 'ส่งเงินบ้าน', type: 'fixed', remaining: Infinity,  rate: 0,    monthly: 5000 });
    if (!debtFlags.home)   arr.push({ id: uid_(), name: 'ค่าเช่า',     type: 'fixed', remaining: Infinity,  rate: 0,    monthly: 7000 });
    return arr;
  };

  const canProceed = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 3) {
      const elig = eligibleCompanies.find(c => c.id === companyId);
      return Boolean(elig && elig._failed.length === 0);
    }
    return true;
  };

  const start = () => onStart({ name: name.trim(), traits, skills, company: selectedCompany, debts: buildDebts(), lifeGoal });

  const stepTitles = ['ชื่อ', 'ลักษณะนิสัย', 'ทักษะ', 'งาน', 'หนี้สิน + เป้าหมาย'];

  return (
    <div className="ls-root" style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ maxWidth:720, width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div className="ls-h1">🌾 LifeSim</div>
          <div className="ls-muted">เกมจำลองชีวิตการเงิน — เริ่มต้นที่อายุ 22 ฿50,000</div>
        </div>

        <div style={{ display:'flex', gap:4, marginBottom:16 }}>
          {stepTitles.map((_, i) => (
            <div key={i} style={{
              flex:1, height:6, borderRadius:3,
              background: i <= step ? 'var(--c-ac)' : 'var(--c-sf2)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        <div className="ls-card" style={{ minHeight:420 }}>
          <div className="ls-h3">Step {step + 1} / 5 — {stepTitles[step]}</div>

          {step === 0 && (
            <div>
              <div className="ls-h2">ชื่อตัวละครของคุณ</div>
              <div className="ls-muted" style={{ marginBottom:12 }}>ใส่ชื่อจริงก็ได้ — เกมนี้คือคุณ</div>
              <input className="ls-input" value={name} onChange={e => setName(e.target.value)} placeholder="ชื่อ..." maxLength={20} autoFocus />
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="ls-h2">ลักษณะนิสัย</div>
              <div className="ls-muted" style={{ marginBottom:16 }}>ตั้งค่านิสัย 1–5 — มีผลต่อรายรับ รายจ่าย และความสุข</div>
              {Object.entries(TRAIT_META).map(([k, meta]) => (
                <div key={k} style={{ marginBottom:18 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <div><span style={{ marginRight:6 }}>{meta.emoji}</span><span style={{ fontWeight:600 }}>{meta.label}</span></div>
                    <span style={{ color:'var(--c-ac)', fontWeight:700 }}>{traits[k]}</span>
                  </div>
                  <input type="range" min={1} max={5} step={1} value={traits[k]}
                    onChange={e => setTraits({ ...traits, [k]: +e.target.value })} className="ls-slider" />
                  <div className="ls-muted" style={{ marginTop:4 }}>{meta.desc}</div>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="ls-h2">ทักษะ</div>
              <div className="ls-muted" style={{ marginBottom:8 }}>
                แจกแต้ม 70 แต้ม (เริ่มต้นแต่ละทักษะที่ 10) — เหลือ{' '}
                <span style={{ color: skillRemaining < 0 ? 'var(--c-rd)' : 'var(--c-ac)', fontWeight:700 }}>{skillRemaining}</span> แต้ม
              </div>
              {Object.entries(SKILL_META).map(([k, meta]) => (
                <div key={k} style={{ marginBottom:18 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <div><span style={{ marginRight:6 }}>{meta.emoji}</span><span style={{ fontWeight:600 }}>{meta.label}</span></div>
                    <span style={{ color: meta.color, fontWeight:700 }}>{skills[k]}</span>
                  </div>
                  <input type="range" min={10} max={100} step={1} value={skills[k]}
                    onChange={e => setSkill(k, +e.target.value)} className="ls-slider" />
                </div>
              ))}
              {skillRemaining < 0 && <div style={{ color:'var(--c-rd)', fontSize:12, marginTop:8 }}>⚠️ ใช้แต้มเกินไป โปรดลด</div>}
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="ls-h2">เลือกบริษัท</div>
              <div className="ls-muted" style={{ marginBottom:12 }}>บริษัทที่ skill ไม่ถึงจะ grey out</div>
              <div className="ls-scroll" style={{ maxHeight:320, paddingRight:4 }}>
                {eligibleCompanies.map(co => {
                  const locked   = co._failed.length > 0;
                  const selected = co.id === companyId;
                  return (
                    <button key={co.id} disabled={locked} onClick={() => setCompanyId(co.id)}
                      className="ls-btn" data-sel={selected} data-locked={locked}
                      style={{ width:'100%', display:'flex', justifyContent:'flex-start', marginBottom:6, padding:'10px 12px' }}
                    >
                      <span style={{ fontSize:22, marginRight:10 }}>{co.emoji}</span>
                      <div style={{ flex:1, textAlign:'left' }}>
                        <div style={{ fontWeight:600 }}>{co.name}</div>
                        <div style={{ fontSize:11, opacity:0.8 }}>
                          {co.type} • {fmtCompact(co.salaryMin)}–{fmtCompact(co.salaryMax)} • stability {(co.stability * 100).toFixed(0)}%
                        </div>
                      </div>
                      {locked && <div style={{ fontSize:11, color:'var(--c-rd)' }}>ขาด {co._failed.join(', ')}</div>}
                    </button>
                  );
                })}
              </div>
              {selectedCompany && (
                <div className="ls-card-tight" style={{ marginTop:10, background:'var(--c-sf2)' }}>
                  <div className="ls-h3" style={{ marginBottom:4 }}>คาดการณ์รายได้</div>
                  <div style={{ color:'var(--c-ac)', fontWeight:600 }}>{estimatedSalary}</div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="ls-h2">หนี้สิน & รายจ่ายประจำ</div>
              <div className="ls-muted" style={{ marginBottom:12 }}>เลือกที่มีอยู่จริง</div>
              {[
                { k:'student', label:'🎓 กยศ.',        detail:'฿200,000 @ 1% (฿2,200/mo)' },
                { k:'car',     label:'🚗 ผ่อนรถ',       detail:'฿600,000 @ 4% (฿11,500/mo)' },
                { k:'home',    label:'🏠 ผ่อนบ้าน',     detail:'฿2.5M @ 3% (฿14,500/mo)' },
                { k:'family',  label:'👨‍👩‍👧 ส่งเงินบ้าน', detail:'฿5,000/mo (ตลอดไป)' },
              ].map(item => (
                <label key={item.k} style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:10, marginBottom:6,
                  background: debtFlags[item.k] ? 'var(--c-sf2)' : 'var(--c-bg)',
                  border: `1px solid ${debtFlags[item.k] ? 'var(--c-ac)' : 'var(--c-bd)'}`,
                  borderRadius:6, cursor:'pointer',
                }}>
                  <input type="checkbox" checked={debtFlags[item.k]}
                    onChange={e => setDebtFlags({ ...debtFlags, [item.k]: e.target.checked })}
                    style={{ accentColor:'var(--c-ac)', width:16, height:16 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600 }}>{item.label}</div>
                    <div className="ls-muted">{item.detail}</div>
                  </div>
                </label>
              ))}
              {!debtFlags.home && <div className="ls-muted" style={{ marginBottom:12, marginTop:6 }}>💡 ไม่มีบ้าน → auto-add ค่าเช่า ฿7,000/เดือน</div>}

              <div className="ls-h2" style={{ marginTop:16 }}>เป้าหมายชีวิต</div>
              <div className="ls-grid-2">
                {Object.entries(GOALS).map(([k, g]) => (
                  <button key={k} onClick={() => setLifeGoal(k)} className="ls-btn" data-sel={lifeGoal === k}
                    style={{ flexDirection:'column', alignItems:'flex-start', padding:12, height:'auto' }}
                  >
                    <div style={{ fontSize:18 }}>{g.emoji} {g.label}</div>
                    <div style={{ fontSize:11, opacity:0.85, marginTop:4, textAlign:'left' }}>{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', marginTop:16 }}>
          <button className="ls-btn ls-btn-ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← Back</button>
          {step < 4
            ? <button className="ls-btn ls-btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canProceed() || (step === 2 && skillRemaining < 0)}>Next →</button>
            : <button className="ls-btn ls-btn-primary" onClick={start} disabled={!selectedCompany}>เริ่มเล่น 🎮</button>
          }
        </div>
      </div>
    </div>
  );
}

// Thin wrapper so SetupScreen can estimate salary without importing from engine
function calcEmployedGrossUI(company, skills, traits) {
  const dom = Math.max(skills.tech, skills.finance, skills.creative);
  let gross = company.salaryMin + (dom / 100) * (company.salaryMax - company.salaryMin);
  gross *= 1 + ((traits.diligence - 1) / 4) * 0.25;
  return gross;
}

// ============================================================
// Event modal
// ============================================================

function EventModal({ event, onChoice }) {
  useEffect(() => {
    const block = (e) => { if (e.key === 'Escape') e.preventDefault(); };
    window.addEventListener('keydown', block, true);
    return () => window.removeEventListener('keydown', block, true);
  }, []);

  return (
    <div className="ls-modal-backdrop">
      <div className="ls-modal">
        <div className="ls-h2" style={{ marginBottom:8 }}>{event.title}</div>
        <div style={{ marginBottom:16 }}>{event.desc}</div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {event.choices.map((c, i) => (
            <button key={i} className="ls-btn" style={{ justifyContent:'flex-start', padding:'10px 14px' }} onClick={() => onChoice(c)}>
              <div style={{ flex:1, textAlign:'left' }}>
                <div style={{ fontWeight:600 }}>{c.label}</div>
                {c.hint && <div className="ls-muted" style={{ marginTop:2 }}>{c.hint}</div>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Top bar
// ============================================================

function TopBar({ state }) {
  const happyColor     = state.happiness  > 60 ? 'var(--c-gr)' : state.happiness  > 30 ? 'var(--c-ac)' : 'var(--c-rd)';
  const energyColor    = state.energy     > 60 ? 'var(--c-gr)' : state.energy     > 30 ? 'var(--c-ac)' : 'var(--c-rd)';
  const exhaustion     = state.exhaustion || 0;
  const exhaustColor   = exhaustion < 40 ? 'var(--c-gr)' : exhaustion < 70 ? 'var(--c-ac)' : 'var(--c-rd)';
  const cashColor      = state.cash < 0 ? 'var(--c-rd)' : 'var(--c-tx)';
  const nwColor        = state.netWorth < 0 ? 'var(--c-rd)' : 'var(--c-gr)';

  return (
    <div className="ls-card" style={{ display:'flex', alignItems:'center', gap:16, padding:12, marginBottom:12, flexWrap:'wrap' }}>
      <div>
        <div className="ls-muted" style={{ fontSize:10 }}>ตัวละคร</div>
        <div style={{ fontWeight:700 }}>{state.name} <span style={{ color:'var(--c-dm)', fontWeight:400 }}>(อายุ {state.age})</span></div>
      </div>
      <div style={{ width:1, height:28, background:'var(--c-bd)' }} />
      <div>
        <div className="ls-muted" style={{ fontSize:10 }}>วันที่</div>
        <div style={{ fontVariantNumeric:'tabular-nums' }}>{state.day} {monthLabel(state.month)} {state.year + 543}</div>
      </div>
      <div style={{ width:1, height:28, background:'var(--c-bd)' }} />
      <div>
        <div className="ls-muted" style={{ fontSize:10 }}>💰 เงินสด</div>
        <div style={{ fontWeight:700, color:cashColor }}>{fmt(state.cash)}</div>
      </div>
      <div>
        <div className="ls-muted" style={{ fontSize:10 }}>📈 Net Worth</div>
        <div style={{ fontWeight:700, color:nwColor }}>{fmtCompact(state.netWorth)}</div>
      </div>
      <div style={{ flex:1 }} />
      <div style={{ minWidth:110 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
          <span>⚡ Energy</span><span style={{ color:energyColor, fontVariantNumeric:'tabular-nums' }}>{Math.round(state.energy)}</span>
        </div>
        <div className="ls-bar"><div className="ls-bar-fill" style={{ width:state.energy+'%', background:energyColor }} /></div>
      </div>
      <div style={{ minWidth:110 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
          <span>❤️ Happy</span><span style={{ color:happyColor, fontVariantNumeric:'tabular-nums' }}>{Math.round(state.happiness)}</span>
        </div>
        <div className="ls-bar"><div className="ls-bar-fill" style={{ width:state.happiness+'%', background:happyColor }} /></div>
      </div>
      <div style={{ minWidth:110 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
          <span>😮‍💨 Exhaust</span><span style={{ color:exhaustColor, fontVariantNumeric:'tabular-nums' }}>{Math.round(exhaustion)}</span>
        </div>
        <div className="ls-bar"><div className="ls-bar-fill" style={{ width:exhaustion+'%', background:exhaustColor }} /></div>
      </div>
    </div>
  );
}

// ============================================================
// Character scene
// ============================================================

function CharacterScene({ state }) {
  const workAnim  = WORK_MODES[state.workMode].anim;
  const afterAnim = AFTER_WORK[state.afterWorkActivity].anim;
  const afterEmoji = { rest:'😴', entertainment:'🎮', study:'📚', freelance:'💻', invest:'📊', socialize:'🍻' };
  return (
    <div className="ls-scene">
      <div className="ls-scene-half">
        <div className="ls-scene-label">☀️ Work</div>
        <div className="ls-pixel-ground" />
        <div className={`ls-char ${workAnim}`}>{state.unemployed ? '😔' : '🧑‍💼'}</div>
      </div>
      <div className="ls-scene-half">
        <div className="ls-scene-label">🌙 Evening</div>
        <div className="ls-pixel-ground" />
        <div className={`ls-char ${afterAnim}`}>{afterEmoji[state.afterWorkActivity]}</div>
      </div>
    </div>
  );
}

// ============================================================
// Stats panel
// ============================================================

function StatsPanel({ state }) {
  const totalLoanRemaining = state.debts.filter(d => d.type === 'loan').reduce((a, d) => a + d.remaining, 0);
  const fixedMonthly       = state.debts.filter(d => d.type === 'fixed').reduce((a, d) => a + d.monthly, 0);
  const loanMonthly        = state.debts.filter(d => d.type === 'loan' && d.remaining > 0).reduce((a, d) => a + d.monthly, 0);

  return (
    <div>
      <div className="ls-card-tight" style={{ marginBottom:10 }}>
        <div className="ls-h3">การเงิน</div>
        <div className="ls-stat-row"><span className="ls-stat-label">เงินสด</span><span className="ls-stat-value">{fmt(state.cash)}</span></div>
        <div className="ls-stat-row"><span className="ls-stat-label">มูลค่าพอร์ต</span><span className="ls-stat-value">{fmtCompact(state.portfolioValue)}</span></div>
        <div className="ls-stat-row"><span className="ls-stat-label">หนี้คงเหลือ</span><span className="ls-stat-value" style={{ color:'var(--c-rd)' }}>{fmtCompact(totalLoanRemaining)}</span></div>
        <div className="ls-stat-row"><span className="ls-stat-label">Net Worth</span><span className="ls-stat-value" style={{ color: state.netWorth < 0 ? 'var(--c-rd)' : 'var(--c-gr)' }}>{fmtCompact(state.netWorth)}</span></div>
      </div>

      <div className="ls-card-tight" style={{ marginBottom:10 }}>
        <div className="ls-h3">รายเดือน</div>
        <div className="ls-stat-row"><span className="ls-stat-label">เงินเดือน (gross)</span><span className="ls-stat-value">{fmtCompact(state.currentSalary)}</span></div>
        <div className="ls-stat-row"><span className="ls-stat-label">Passive income</span><span className="ls-stat-value" style={{ color:'var(--c-gr)' }}>+{fmtCompact(state.passiveIncome)}</span></div>
        <div className="ls-stat-row"><span className="ls-stat-label">ค่าใช้จ่ายเดือนล่าสุด</span><span className="ls-stat-value" style={{ color:'var(--c-rd)' }}>{fmtCompact(state.monthlyExpenses)}</span></div>
        <div className="ls-stat-row"><span className="ls-stat-label">ภาษีจ่ายสะสม</span><span className="ls-stat-value">{fmtCompact(state.totalTaxPaid)}</span></div>
      </div>

      <div className="ls-card-tight" style={{ marginBottom:10 }}>
        <div className="ls-h3">ทักษะ</div>
        {Object.entries(SKILL_META).map(([k, m]) => (
          <div key={k} style={{ marginBottom:6 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
              <span>{m.emoji} {m.label}</span><span style={{ color:m.color, fontWeight:600 }}>{state.skills[k].toFixed(1)}</span>
            </div>
            <div className="ls-bar"><div className="ls-bar-fill" style={{ width:state.skills[k]+'%', background:m.color }} /></div>
          </div>
        ))}
      </div>

      <div className="ls-card-tight" style={{ marginBottom:10 }}>
        <div className="ls-h3">หนี้สิน ({state.debts.length} รายการ)</div>
        {state.debts.length === 0 && <div className="ls-muted">ไม่มีหนี้สิน 🎉</div>}
        {state.debts.map(d => (
          <div key={d.id} className="ls-stat-row">
            <span className="ls-stat-label">
              {d.name} <span style={{ fontSize:10, color:'var(--c-dm)' }}>({d.type === 'loan' ? `${(d.rate*100).toFixed(1)}%` : 'fixed'})</span>
            </span>
            <span className="ls-stat-value" style={{ fontSize:12 }}>
              {d.type === 'fixed' ? '∞' : fmtCompact(d.remaining)}
              <span style={{ color:'var(--c-dm)', fontWeight:400, fontSize:11 }}> / {fmtCompact(d.monthly)}/m</span>
            </span>
          </div>
        ))}
        <div className="ls-stat-row" style={{ marginTop:6, borderTop:'1px solid var(--c-bd)', paddingTop:6 }}>
          <span className="ls-stat-label">รวม fixed ต่อเดือน</span>
          <span className="ls-stat-value">{fmtCompact(fixedMonthly + loanMonthly)}</span>
        </div>
      </div>

      {state.contacts.length > 0 && (
        <div className="ls-card-tight" style={{ marginBottom:10 }}>
          <div className="ls-h3">Contacts ({state.contacts.length})</div>
          {state.contacts.map(c => (
            <div key={c.id} className="ls-stat-row">
              <span className="ls-stat-label">{c.name}</span>
              <span className="ls-tag" style={{
                background: c.kind === 'mentor' ? 'var(--c-gr)' : c.kind === 'peer' ? 'var(--c-bl)' : 'var(--c-rd)',
                color: 'var(--c-bg)',
              }}>{c.kind}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Portfolio panel
// ============================================================

function PortfolioPanel({ state, setState }) {
  const [selected, setSelected]   = useState('gold');
  const [bahtAmount, setBahtAmount] = useState(1000);

  const todayKey = tradeKey(state);
  const canTrade = state.lastTradeKey !== todayKey;

  const meta         = ASSETS[selected];
  const price        = state.assetPrices[selected];
  const holding      = state.portfolio[selected] || 0;
  const holdingValue = holding * price;
  const buyUnits     = bahtAmount / price;
  const sellUnits    = bahtAmount / price;

  const buy = () => {
    if (!canTrade || state.cash < bahtAmount) return;
    setState(s => {
      const units = bahtAmount / s.assetPrices[selected];
      return {
        ...s,
        cash: s.cash - bahtAmount,
        portfolio: { ...s.portfolio, [selected]: (s.portfolio[selected] || 0) + units },
        portfolioCost: { ...s.portfolioCost, [selected]: (s.portfolioCost?.[selected] || 0) + bahtAmount },
        lastTradeKey: todayKey,
        log: pushLog(s, `ซื้อ ${meta.label} ${fmtCompact(bahtAmount)} (${units.toFixed(4)} ${meta.unitLabel})`, 'info'),
      };
    });
  };

  const sell = () => {
    if (!canTrade || holding < sellUnits) return;
    setState(s => {
      const units      = bahtAmount / s.assetPrices[selected];
      const costBasis  = s.portfolioCost?.[selected] || 0;
      const costReduce = holding > 0 ? (units / holding) * costBasis : 0;
      return {
        ...s,
        cash: s.cash + bahtAmount,
        portfolio: { ...s.portfolio, [selected]: holding - units },
        portfolioCost: { ...s.portfolioCost, [selected]: Math.max(0, costBasis - costReduce) },
        lastTradeKey: todayKey,
        log: pushLog(s, `ขาย ${meta.label} ${fmtCompact(bahtAmount)}`, 'info'),
      };
    });
  };

  const dcaSettings = state.dcaSettings || {};

  return (
    <div>
      <div className="ls-card-tight" style={{ marginBottom:10 }}>
        <div className="ls-h3">ราคาตลาดวันนี้</div>
        {Object.entries(ASSETS).map(([k, m]) => {
          const p    = state.assetPrices[k];
          const prev = (state.prevAssetPrices || state.assetPrices)[k];
          const change = ((p - prev) / prev) * 100;
          return (
            <button key={k} onClick={() => setSelected(k)} className="ls-btn" data-sel={k === selected}
              style={{ width:'100%', justifyContent:'space-between', marginBottom:4, padding:'8px 10px' }}
            >
              <span>{m.emoji} {m.label}</span>
              <span style={{ display:'flex', gap:10, alignItems:'center' }}>
                <span style={{ fontWeight:600 }}>{fmtCompact(p)}</span>
                <span style={{ fontSize:11, color: change >= 0 ? 'var(--c-gr)' : 'var(--c-rd)', minWidth:50, textAlign:'right' }}>
                  {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="ls-card-tight" style={{ marginBottom:10 }}>
        <div className="ls-h3">ซื้อขาย {meta.emoji} {meta.label}</div>
        <div className="ls-stat-row"><span className="ls-stat-label">ราคา</span><span className="ls-stat-value">{fmt(price)}</span></div>
        <div className="ls-stat-row">
          <span className="ls-stat-label">ถืออยู่</span>
          <span className="ls-stat-value">{holding.toFixed(4)} <span style={{ color:'var(--c-dm)', fontWeight:400 }}>= {fmtCompact(holdingValue)}</span></span>
        </div>
        {!canTrade && (
          <div className="ls-muted" style={{ fontSize:11, marginTop:6, padding:'6px 8px', background:'var(--c-sf2)', borderRadius:4 }}>
            ⏰ เทรดได้วันละ 1 ครั้ง — รอพรุ่งนี้
          </div>
        )}
        <div style={{ display:'flex', gap:6, alignItems:'center', marginTop:8 }}>
          <span className="ls-muted" style={{ whiteSpace:'nowrap' }}>จำนวน (฿):</span>
          <input type="number" min="100" step="100" className="ls-input" style={{ width:110 }}
            value={bahtAmount} onChange={e => setBahtAmount(Math.max(100, +e.target.value))} />
          <span className="ls-muted" style={{ fontSize:11, whiteSpace:'nowrap' }}>≈ {buyUnits.toFixed(4)} {meta.unitLabel}</span>
        </div>
        <div style={{ display:'flex', gap:6, marginTop:8 }}>
          <button className="ls-btn ls-btn-primary" disabled={!canTrade || state.cash < bahtAmount} onClick={buy} style={{ flex:1 }}>ซื้อ</button>
          <button className="ls-btn" disabled={!canTrade || holding < sellUnits} onClick={sell} style={{ flex:1 }}>ขาย</button>
        </div>
      </div>

      <div className="ls-card-tight" style={{ marginBottom:10 }}>
        <div className="ls-h3">💰 DCA รายเดือน (ตั้งค่าได้ตลอด)</div>
        {Object.entries(ASSETS).map(([k, m]) => (
          <div key={k} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
            <span style={{ minWidth:90, fontSize:12 }}>{m.emoji} {m.label}</span>
            <input type="number" min="0" step="100" className="ls-input" style={{ width:100 }}
              value={dcaSettings[k] || 0}
              onChange={e => setState(s => ({ ...s, dcaSettings: { ...(s.dcaSettings || {}), [k]: Math.max(0, +e.target.value) } }))}
            />
            <span className="ls-muted" style={{ fontSize:11 }}>/เดือน</span>
          </div>
        ))}
        <div className="ls-muted" style={{ fontSize:11 }}>
          รวม: {fmtCompact(Object.values(dcaSettings).reduce((a, v) => a + (v || 0), 0))}/เดือน
        </div>
      </div>

      <div className="ls-card-tight">
        <div className="ls-h3">พอร์ตของฉัน</div>
        {Object.entries(state.portfolio).filter(([, v]) => v > 0).length === 0 && <div className="ls-muted">ยังไม่มีสินทรัพย์</div>}
        {Object.entries(state.portfolio).filter(([, v]) => v > 0).map(([k, v]) => {
          const m        = ASSETS[k];
          const value    = v * state.assetPrices[k];
          const cost     = state.portfolioCost?.[k] || 0;
          const pnl      = value - cost;
          const pnlPct   = cost > 0 ? (pnl / cost) * 100 : 0;
          const pnlColor = pnl >= 0 ? 'var(--c-gr)' : 'var(--c-rd)';
          return (
            <div key={k} style={{ paddingBottom:8, marginBottom:6, borderBottom:'1px dashed var(--c-sf2)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <span className="ls-stat-label">{m.emoji} {m.label}</span>
                <span className="ls-stat-value" style={{ fontSize:12 }}>{fmtCompact(value)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginTop:3 }}>
                <span className="ls-muted">{v.toFixed(4)} {m.unitLabel} · ต้นทุน {cost > 0 ? fmtCompact(cost) : '—'}</span>
                {cost > 0 && (
                  <span style={{ color: pnlColor, fontWeight:600 }}>
                    {pnl >= 0 ? '+' : ''}{fmtCompact(pnl)} ({pnl >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {(() => {
          const held = Object.entries(state.portfolio).filter(([, v]) => v > 0);
          if (held.length === 0) return null;
          const totalCost  = held.reduce((a, [k]) => a + (state.portfolioCost?.[k] || 0), 0);
          const totalValue = state.portfolioValue;
          const totalPnl   = totalValue - totalCost;
          const totalPct   = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
          const pnlColor   = totalPnl >= 0 ? 'var(--c-gr)' : 'var(--c-rd)';
          return (
            <div style={{ marginTop:4, borderTop:'1px solid var(--c-bd)', paddingTop:8 }}>
              <div className="ls-stat-row">
                <span className="ls-stat-label">มูลค่ารวม</span>
                <span className="ls-stat-value" style={{ color:'var(--c-ac)' }}>{fmtCompact(totalValue)}</span>
              </div>
              {totalCost > 0 && (
                <div className="ls-stat-row">
                  <span className="ls-stat-label">ต้นทุนรวม</span>
                  <span className="ls-stat-value">{fmtCompact(totalCost)}</span>
                </div>
              )}
              {totalCost > 0 && (
                <div className="ls-stat-row">
                  <span className="ls-stat-label">กำไร/ขาดทุน</span>
                  <span className="ls-stat-value" style={{ color: pnlColor, fontWeight:700 }}>
                    {totalPnl >= 0 ? '+' : ''}{fmtCompact(totalPnl)}{' '}
                    <span style={{ fontSize:11 }}>({totalPnl >= 0 ? '+' : ''}{totalPct.toFixed(1)}%)</span>
                  </span>
                </div>
              )}
            </div>
          );
        })()}
        <div className="ls-stat-row" style={{ borderTop:'1px solid var(--c-sf2)', paddingTop:6, marginTop:4 }}>
          <span className="ls-stat-label">Passive income / เดือน</span>
          <span className="ls-stat-value" style={{ color:'var(--c-gr)' }}>+{fmtCompact(state.passiveIncome)}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Log panel
// ============================================================

function LogPanel({ state }) {
  const logEnd = useRef(null);
  useEffect(() => { logEnd.current?.scrollIntoView({ behavior:'smooth', block:'end' }); }, [state.log.length]);
  return (
    <div className="ls-card-tight ls-scroll" style={{ maxHeight:500, padding:8 }}>
      {state.log.length === 0 && <div className="ls-muted">ยังไม่มี events</div>}
      {state.log.map((e, i) => (
        <div key={i} className={`ls-log-entry ls-log-${e.kind}`}>
          <span className="ls-log-time">{e.day}/{e.month}/{(e.year+543).toString().slice(-2)}</span>
          <span>{e.text}</span>
        </div>
      ))}
      <div ref={logEnd} />
    </div>
  );
}

// ============================================================
// Performance badge
// ============================================================

function PerformanceBadge({ state }) {
  if (state.company.type === 'freelance' || state.unemployed) return null;
  const perf = state.performance;
  const [label, color] =
    perf > 20  ? ['หัวหน้าประทับใจ ⭐',    'var(--c-gr)'] :
    perf > 5   ? ['หัวหน้าพอใจ ✓',          'var(--c-gr)'] :
    perf > -5  ? ['หัวหน้าเฉยๆ',             'var(--c-dm)'] :
    perf > -20 ? ['หัวหน้าไม่ค่อยพอใจ ⚠️',  'var(--c-ac)'] :
                 ['หัวหน้าโกรธมาก 🔥',       'var(--c-rd)'];
  return (
    <div className="ls-card-tight" style={{ borderColor:color, marginTop:8 }}>
      <div className="ls-h3" style={{ marginBottom:2 }}>ผลงาน (จาก review ครั้งล่าสุด)</div>
      <div style={{ color, fontWeight:600 }}>{label}</div>
    </div>
  );
}

// ============================================================
// Game screen
// ============================================================

function GameScreen({ state, setState, speed, setSpeed, paused, setPaused, onResetSave }) {
  const [tab, setTab] = useState('stats');
  const goalDef = GOALS[state.lifeGoal];

  return (
    <div className="ls-root" style={{ padding:12 }}>
      {state.goalAchieved && (
        <div className="ls-banner">
          <span style={{ fontSize:24 }}>{goalDef.emoji}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, color:'var(--c-ac)' }}>บรรลุเป้าหมาย: {goalDef.label}</div>
            <div className="ls-muted" style={{ fontSize:12 }}>บรรลุเมื่ออายุ {state.goalAchievedAt?.age} • เล่นต่อได้จนถึงอายุ 80</div>
          </div>
        </div>
      )}
      {state.unemployed && (
        <div className="ls-banner ls-banner-danger">
          <span style={{ fontSize:24 }}>😔</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, color:'var(--c-rd)' }}>ตอนนี้คุณว่างงาน</div>
            <div className="ls-muted" style={{ fontSize:12 }}>เดือนถัดไปจะมี event ให้สมัครงาน</div>
          </div>
        </div>
      )}

      <TopBar state={state} />

      {/* Day progress bar */}
      <div style={{ position:'relative', height:4, background:'var(--c-sf2)', borderRadius:2, marginBottom:12, overflow:'hidden' }}
           title="แถบเวลา — เต็มแล้ว = ผ่าน 1 วัน">
        <div
          key={`${state.day}-${state.month}-${state.year}`}
          className="ls-tick-bar-fill"
          style={{
            animation: `ls-tick-bar ${Math.round(8000 / speed)}ms linear`,
            animationPlayState: paused || state.pendingEvent ? 'paused' : 'running',
          }}
        />
      </div>

      <div className="ls-main-layout" style={{ display:'grid', gridTemplateColumns:'340px 1fr', gap:12 }}>
        {/* LEFT */}
        <div>
          <CharacterScene state={state} />

          <div className="ls-card-tight" style={{ marginTop:10 }}>
            <div className="ls-h3">☀️ Work mode</div>
            <div className="ls-grid-2">
              {Object.entries(WORK_MODES).map(([k, m]) => (
                <button key={k} className="ls-btn" data-sel={state.workMode === k}
                  onClick={() => setState(s => ({ ...s, workMode: k }))}
                  style={{ flexDirection:'column', padding:8, gap:2 }}
                  title={m.desc}
                >
                  <div style={{ fontSize:18 }}>{m.emoji}</div>
                  <div style={{ fontSize:11, fontWeight:600 }}>{m.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="ls-card-tight" style={{ marginTop:10 }}>
            <div className="ls-h3">🌙 After-work</div>
            <div className="ls-grid-3">
              {Object.entries(AFTER_WORK).map(([k, a]) => (
                <button key={k} className="ls-btn" data-sel={state.afterWorkActivity === k}
                  onClick={() => setState(s => ({ ...s, afterWorkActivity: k, afterWorkSubOption: a.options[0].id }))}
                  style={{ flexDirection:'column', padding:8, gap:2 }}
                >
                  <div style={{ fontSize:18 }}>{a.emoji}</div>
                  <div style={{ fontSize:10, fontWeight:600 }}>{a.label}</div>
                </button>
              ))}
            </div>
            <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:3 }}>
              {AFTER_WORK[state.afterWorkActivity].options.map(opt => (
                <button key={opt.id} className="ls-btn" data-sel={state.afterWorkSubOption === opt.id}
                  onClick={() => setState(s => ({ ...s, afterWorkSubOption: opt.id }))}
                  style={{ justifyContent:'flex-start', padding:'5px 10px', fontSize:12 }}
                >
                  <span>{opt.emoji} {opt.label}</span>
                  <span className="ls-muted" style={{ marginLeft:'auto', fontSize:11 }}>
                    {opt.cost > 0 ? `-฿${opt.cost} ` : ''}{opt.desc}
                  </span>
                </button>
              ))}
            </div>
            {state.afterWorkActivity === 'study' && (
              <div style={{ marginTop:6 }}>
                <div className="ls-muted" style={{ fontSize:11, marginBottom:4 }}>เรียน skill ไหน</div>
                <div style={{ display:'flex', gap:3 }}>
                  <button className="ls-btn" data-sel={state.studySkill === null}
                    onClick={() => setState(s => ({ ...s, studySkill: null }))}
                    style={{ flex:1, padding:'4px 6px', fontSize:11 }}
                  >อัตโนมัติ</button>
                  {Object.entries(SKILL_META).map(([k, m]) => (
                    <button key={k} className="ls-btn" data-sel={state.studySkill === k}
                      onClick={() => setState(s => ({ ...s, studySkill: k }))}
                      style={{ flex:1, padding:'4px 6px', fontSize:11 }}
                    >{m.emoji} {m.label}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="ls-card-tight" style={{ marginTop:10 }}>
            <div className="ls-h3">🍜 ค่าครองชีพรายวัน</div>
            <div style={{ marginBottom:6 }}>
              <div className="ls-muted" style={{ fontSize:11, marginBottom:4 }}>อาหาร</div>
              <div style={{ display:'flex', gap:4 }}>
                {FOOD_TIERS.map((t, i) => (
                  <button key={i} className="ls-btn" data-sel={state.foodTier === i}
                    onClick={() => setState(s => ({ ...s, foodTier: i }))}
                    style={{ flex:1, flexDirection:'column', padding:6, gap:1 }}
                    title={t.desc}
                  >
                    <div>{t.emoji}</div>
                    <div style={{ fontSize:10 }}>{t.label}</div>
                    <div style={{ fontSize:10, color:'var(--c-dm)' }}>฿{t.cost}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="ls-muted" style={{ fontSize:11, marginBottom:4 }}>เดินทาง</div>
              <div style={{ display:'flex', gap:4 }}>
                {TRANSPORT_TIERS.map((t, i) => (
                  <button key={i} className="ls-btn" data-sel={state.transportTier === i}
                    onClick={() => setState(s => ({ ...s, transportTier: i }))}
                    style={{ flex:1, flexDirection:'column', padding:6, gap:1 }}
                    title={t.desc}
                  >
                    <div>{t.emoji}</div>
                    <div style={{ fontSize:10 }}>{t.label}</div>
                    <div style={{ fontSize:10, color:'var(--c-dm)' }}>฿{t.cost}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="ls-muted" style={{ fontSize:11, marginTop:6 }}>
              รวม ≈ ฿{((FOOD_TIERS[state.foodTier]?.cost || 0) + (TRANSPORT_TIERS[state.transportTier]?.cost || 0)) * 30}/เดือน
            </div>
          </div>

          <div className="ls-card-tight" style={{ marginTop:10 }}>
            <div className="ls-h3">🛡️ ประกันสุขภาพ</div>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {Object.entries(INSURANCE_PLANS).map(([k, plan]) => (
                <button key={k} className="ls-btn" data-sel={state.insurance === k}
                  onClick={() => setState(s => ({ ...s, insurance: k }))}
                  style={{ justifyContent:'flex-start', padding:'6px 10px', fontSize:12 }}
                >
                  <span>{plan.emoji} {plan.label}</span>
                  <span className="ls-muted" style={{ marginLeft:'auto', fontSize:11 }}>
                    {plan.premium > 0 ? `฿${plan.premium}/เดือน` : 'ฟรี'}
                  </span>
                </button>
              ))}
            </div>
            <div className="ls-muted" style={{ fontSize:11, marginTop:6 }}>
              {INSURANCE_PLANS[state.insurance]?.desc}
            </div>
          </div>

          <PerformanceBadge state={state} />

          <div className="ls-card-tight" style={{ marginTop:10 }}>
            <div className="ls-h3">เป้าหมาย: {goalDef.emoji} {goalDef.label}</div>
            <div className="ls-muted" style={{ fontSize:12 }}>{goalDef.desc}</div>
            {state.goalAchieved && <div style={{ color:'var(--c-gr)', marginTop:4, fontSize:12 }}>✓ บรรลุแล้ว</div>}
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div style={{ display:'flex', gap:4, borderBottom:'1px solid var(--c-bd)', marginBottom:10 }}>
            {[['stats','📊 สถิติ'],['portfolio','💹 พอร์ต'],['log','📝 Log']].map(([t, label]) => (
              <button key={t} className={`ls-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{label}</button>
            ))}
          </div>
          {tab === 'stats'     && <StatsPanel state={state} />}
          {tab === 'portfolio' && <PortfolioPanel state={state} setState={setState} />}
          {tab === 'log'       && <LogPanel state={state} />}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="ls-card" style={{ display:'flex', alignItems:'center', gap:12, marginTop:12, padding:10, flexWrap:'wrap' }}>
        <div>
          <div className="ls-muted" style={{ fontSize:10 }}>บริษัท</div>
          <div style={{ fontWeight:600 }}>{state.company.emoji} {state.company.name}</div>
        </div>
        <div style={{ width:1, height:28, background:'var(--c-bd)' }} />
        <div>
          <div className="ls-muted" style={{ fontSize:10 }}>Speed</div>
          <div style={{ display:'flex', gap:4 }}>
            {[1, 2, 4].map(sp => (
              <button key={sp} className={`ls-btn ${speed === sp && !paused ? 'ls-btn-active' : ''}`}
                style={{ padding:'4px 10px', fontSize:12 }}
                onClick={() => { setSpeed(sp); setPaused(false); }}
              >{sp}x</button>
            ))}
            <button className={`ls-btn ${paused ? 'ls-btn-active' : ''}`}
              style={{ padding:'4px 10px', fontSize:12 }}
              onClick={() => setPaused(p => !p)}
            >⏸ {paused ? 'Resume' : 'Pause'}</button>
          </div>
        </div>
        <div style={{ flex:1 }} />
        <button className="ls-btn ls-btn-ghost" onClick={onResetSave} style={{ fontSize:12 }}>🗑️ ล้าง save + เริ่มใหม่</button>
      </div>
    </div>
  );
}

// ============================================================
// End screen
// ============================================================

function EndScreen({ state, onRestart }) {
  const goalDef    = GOALS[state.lifeGoal];
  const yearsLived = state.year - 2024;
  const totalSaved = state.totalEarned - state.totalTaxPaid;
  const goodCount  = state.log.filter(l => l.kind === 'good').length;
  const badCount   = state.log.filter(l => l.kind === 'bad').length;
  const eventCount = state.log.filter(l => l.kind === 'event').length;

  return (
    <div className="ls-root" style={{ minHeight:'100vh', padding:24, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ maxWidth:720, width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:64 }}>{state.endReason === 'bankruptcy' ? '💀' : state.goalAchieved ? '🏆' : '🌅'}</div>
          <div className="ls-h1">{state.endReason === 'bankruptcy' ? 'ล้มละลาย' : state.goalAchieved ? goalDef.label : 'จบชีวิตการทำงาน'}</div>
          <div className="ls-muted">{state.name} • อายุ {state.age} • เล่นมา {yearsLived} ปีในเกม</div>
        </div>

        <div className="ls-card" style={{ marginBottom:16 }}>
          <div className="ls-h2">สรุปการเงิน</div>
          <div className="ls-stat-row"><span className="ls-stat-label">Net Worth สุดท้าย</span><span className="ls-stat-value" style={{ color: state.netWorth < 0 ? 'var(--c-rd)' : 'var(--c-gr)' }}>{fmt(state.netWorth)}</span></div>
          <div className="ls-stat-row"><span className="ls-stat-label">เงินสด</span><span className="ls-stat-value">{fmt(state.cash)}</span></div>
          <div className="ls-stat-row"><span className="ls-stat-label">มูลค่าพอร์ตลงทุน</span><span className="ls-stat-value">{fmt(state.portfolioValue)}</span></div>
          <div className="ls-stat-row"><span className="ls-stat-label">หนี้คงเหลือ</span><span className="ls-stat-value" style={{ color:'var(--c-rd)' }}>{fmt(state.debts.filter(d => d.type === 'loan').reduce((a, d) => a + d.remaining, 0))}</span></div>
          <div className="ls-stat-row"><span className="ls-stat-label">รายได้รวมตลอดชีวิต</span><span className="ls-stat-value">{fmt(state.totalEarned)}</span></div>
          <div className="ls-stat-row"><span className="ls-stat-label">ภาษีจ่ายสะสม</span><span className="ls-stat-value">{fmt(state.totalTaxPaid)}</span></div>
          <div className="ls-stat-row"><span className="ls-stat-label">รายได้หลังภาษี</span><span className="ls-stat-value">{fmt(totalSaved)}</span></div>
        </div>

        <div className="ls-card" style={{ marginBottom:16 }}>
          <div className="ls-h2">ทักษะปลายเกม</div>
          {Object.entries(SKILL_META).map(([k, m]) => (
            <div key={k} style={{ marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                <span>{m.emoji} {m.label}</span>
                <span style={{ color:m.color, fontWeight:600 }}>{state.skills[k].toFixed(0)}/100</span>
              </div>
              <div className="ls-bar"><div className="ls-bar-fill" style={{ width:state.skills[k]+'%', background:m.color }} /></div>
            </div>
          ))}
        </div>

        <div className="ls-card" style={{ marginBottom:16 }}>
          <div className="ls-h2">เหตุการณ์ในชีวิต</div>
          <div className="ls-grid-3" style={{ marginBottom:12 }}>
            {[
              { count:goodCount,  color:'var(--c-gr)', label:'ดีๆ' },
              { count:badCount,   color:'var(--c-rd)', label:'แย่ๆ' },
              { count:eventCount, color:'var(--c-ac)', label:'events' },
            ].map(({ count, color, label }) => (
              <div key={label} className="ls-card-tight" style={{ textAlign:'center', background:'var(--c-sf2)' }}>
                <div style={{ fontSize:24, color }}>{count}</div>
                <div className="ls-muted">{label}</div>
              </div>
            ))}
          </div>
          <div className="ls-scroll" style={{ maxHeight:220, padding:4 }}>
            {state.log.slice(-30).map((e, i) => (
              <div key={i} className={`ls-log-entry ls-log-${e.kind}`}>
                <span className="ls-log-time">{e.day}/{e.month}/{(e.year+543).toString().slice(-2)}</span>
                <span>{e.text}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="ls-btn ls-btn-primary" style={{ width:'100%', padding:12, fontSize:16 }} onClick={onRestart}>
          🔄 เริ่มชีวิตใหม่
        </button>
      </div>
    </div>
  );
}

// ============================================================
// App + game loop + storage
// ============================================================

const SAVE_KEY = 'lifesim_save_v2';

export default function App() {
  const [gameState, setGameState] = useState(null);
  const [speed, setSpeed]         = useState(1);
  const [paused, setPaused]       = useState(false);
  const [loaded, setLoaded]       = useState(false);

  // Load save on mount
  useEffect(() => {
    (async () => {
      try {
        const r = await storage.get(SAVE_KEY);
        if (r?.value) {
          const parsed = JSON.parse(r.value);
          parsed.pendingEvent = null; // functions can't serialize
          setGameState(parsed);
        }
      } catch {}
      finally { setLoaded(true); }
    })();
  }, []);

  // Persist on state change (debounced)
  useEffect(() => {
    if (!loaded || !gameState) return;
    const t = setTimeout(async () => {
      try {
        const { pendingEvent, ...rest } = gameState;
        await storage.set(SAVE_KEY, JSON.stringify(rest));
      } catch {}
    }, 500);
    return () => clearTimeout(t);
  }, [gameState, loaded]);

  // Game loop
  useEffect(() => {
    if (!gameState || gameState.phase !== 'game' || paused || gameState.pendingEvent) return;
    const interval = Math.round(8000 / speed);
    const timer = setInterval(() => {
      setGameState(prev => (prev && prev.phase === 'game' && !prev.pendingEvent) ? tick(prev) : prev);
    }, interval);
    return () => clearInterval(timer);
  }, [speed, paused, gameState?.phase, gameState?.pendingEvent]);

  const handleStart = useCallback((setup) => {
    setGameState(buildInitialState(setup));
    setPaused(false);
  }, []);

  const handleRestart = useCallback(async () => {
    try { await storage.delete(SAVE_KEY); } catch {}
    setGameState(null);
    setSpeed(1);
    setPaused(false);
  }, []);

  const handleResetSave = useCallback(async () => {
    if (!window.confirm('ล้าง save แล้วเริ่มใหม่?')) return;
    try { await storage.delete(SAVE_KEY); } catch {}
    setGameState(null);
    setSpeed(1);
    setPaused(false);
  }, []);

  const handleChoice = useCallback((choice) => {
    setGameState(prev => {
      if (!prev || !prev.pendingEvent) return prev;
      // Pass state with pendingEvent cleared so choice.apply can optionally set a new one
      const applied = choice.apply({ ...prev, pendingEvent: null });
      return applied;
    });
  }, []);

  return (
    <>
      <style>{CSS}</style>
      {!loaded && (
        <div className="ls-root" style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="ls-muted">กำลังโหลด...</div>
        </div>
      )}
      {loaded && !gameState && <SetupScreen onStart={handleStart} />}
      {loaded && gameState?.phase === 'game' && (
        <>
          <GameScreen state={gameState} setState={setGameState} speed={speed} setSpeed={setSpeed} paused={paused} setPaused={setPaused} onResetSave={handleResetSave} />
          {gameState.pendingEvent && <EventModal event={gameState.pendingEvent} onChoice={handleChoice} />}
        </>
      )}
      {loaded && gameState?.phase === 'end' && <EndScreen state={gameState} onRestart={handleRestart} />}
    </>
  );
}
