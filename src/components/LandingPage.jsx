import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LANDING_CSS = `
  :root {
    --ink:#14261F; --primary:#1F6F5C; --primary-deep:#123A30;
    --income:#2F9E6E; --expense:#B8483A; --gold:#C9A227;
    --paper:#F3F5F1; --card:#FFFFFF; --border:#E4E7E1; --muted:#6B7A72;
    --amber:#D98B3F; --blue:#3F7FBF; --purple:#8B5FBF; --pink:#BF3F7F; --cyan:#3FA8BF; --indigo:#5F6FBF;
    --font-display:'Space Grotesk',sans-serif; --font-body:'Inter',sans-serif; --font-mono:'IBM Plex Mono',monospace;
    --container:1120px;
  }
  .landing-page * {box-sizing:border-box; margin:0; padding:0;}
  .landing-page {scroll-behavior:smooth; color-scheme:light;}
  .landing-page {font-family:var(--font-body); color:var(--ink); background:var(--paper); line-height:1.5; -webkit-font-smoothing:antialiased; color-scheme:light;}
  .landing-page img, .landing-page svg {display:block; max-width:100%;}
  .landing-page a {color:inherit; text-decoration:none;}
  .landing-page button {font-family:inherit; cursor:pointer; border:none; background:none;}
  .landing-page ul {list-style:none;}
  .landing-page .container {max-width:var(--container); margin:0 auto; padding:0 24px;}
  .landing-page section {padding:96px 0;}@media (max-width:720px){ .landing-page section {padding:64px 0;} }

  .landing-page h1, .landing-page h2, .landing-page h3 {font-family:var(--font-display); font-weight:700; letter-spacing:-0.02em; color:var(--ink);}
  .landing-page .eyebrow {display:inline-flex; align-items:center; gap:8px; font-family:var(--font-mono); font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:var(--primary); font-weight:500; margin-bottom:16px;}
  .landing-page .eyebrow::before {content:''; width:6px; height:6px; border-radius:50%; background:var(--primary);}
  .landing-page .eyebrow.on-dark {color:#8FE3C6;}
  .landing-page .eyebrow.on-dark::before {background:#8FE3C6;}

  .landing-page /* ---------- Reveal on scroll (progressive enhancement) ---------- */
  .reveal {opacity:1; transform:none;}
  .landing-page.js-ready .reveal {opacity:0; transform:translateY(24px); transition:opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1);}
  .landing-page.js-ready .reveal.in {opacity:1; transform:translateY(0);}@media (prefers-reduced-motion: reduce){
    .landing-page.js-ready .reveal {opacity:1; transform:none; transition:none;}
  }

  .landing-page /* ---------- Buttons ---------- */
  .btn {display:inline-flex; align-items:center; justify-content:center; gap:8px; font-weight:600; font-size:15px; padding:14px 26px; border-radius:999px; transition:transform .2s ease, box-shadow .2s ease, background .2s ease; white-space:nowrap;}
  .landing-page .btn-primary {background:var(--primary); color:#fff; box-shadow:0 8px 20px rgba(31,111,92,0.25);}
  .landing-page .btn-primary:hover {transform:translateY(-2px); box-shadow:0 12px 28px rgba(31,111,92,0.32); background:var(--primary-deep);}
  .landing-page .btn-ghost {background:transparent; color:var(--ink); border:1.5px solid var(--border);}
  .landing-page .btn-ghost:hover {border-color:var(--primary); color:var(--primary);}
  .landing-page .btn-on-dark {background:#fff; color:var(--ink);}
  .landing-page .btn-on-dark:hover {transform:translateY(-2px); box-shadow:0 12px 28px rgba(0,0,0,0.25);}
  .landing-page a:focus-visible, .landing-page button:focus-visible {outline:2.5px solid var(--primary); outline-offset:3px; border-radius:6px;}

  .landing-page /* ================= NAV ================= */
  header {position:sticky; top:0; z-index:100; background:rgba(243,245,241,0.82); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border-bottom:1px solid transparent; transition:border-color .3s ease, box-shadow .3s ease;}
  .landing-page header.scrolled {border-color:var(--border); box-shadow:0 4px 20px rgba(20,38,31,0.05);}
  .landing-page .nav {display:flex; align-items:center; justify-content:space-between; height:76px;}
  .landing-page .logo {display:flex; align-items:center; gap:10px; font-family:var(--font-display); font-weight:700; font-size:18px;}
  .landing-page .logo-mark {width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg,var(--primary),var(--primary-deep)); color:#fff; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:700;}
  .landing-page .nav-links {display:flex; align-items:center; gap:36px; font-size:14px; font-weight:500;}
  .landing-page .nav-links a {color:var(--muted); transition:color .2s ease;}
  .landing-page .nav-links a:hover {color:var(--ink);}
  .landing-page .nav-cta {display:flex; align-items:center; gap:14px;}
  .landing-page .menu-toggle {display:none; width:40px; height:40px; align-items:center; justify-content:center;}
  .landing-page .menu-toggle span, .landing-page .menu-toggle span::before, .landing-page .menu-toggle span::after {content:''; display:block; width:20px; height:2px; background:var(--ink); position:relative; transition:transform .25s ease, opacity .25s ease;}
  .landing-page .menu-toggle span::before {position:absolute; top:-6px;}
  .landing-page .menu-toggle span::after {position:absolute; top:6px;}
  .landing-page .menu-toggle.open span {background:transparent;}
  .landing-page .menu-toggle.open span::before {transform:translateY(6px) rotate(45deg);}
  .landing-page .menu-toggle.open span::after {transform:translateY(-6px) rotate(-45deg);}
  .landing-page .mobile-panel {display:none; position:fixed; inset:76px 0 0 0; background:var(--paper); z-index:90; padding:32px 24px; flex-direction:column; gap:24px;}
  .landing-page .mobile-panel.open {display:flex;}
  .landing-page .mobile-panel a {font-family:var(--font-display); font-size:22px; font-weight:600;}@media (max-width:900px){
    .landing-page .nav-links {display:none;}
    .landing-page .nav-cta .btn-ghost {display:none;}
    .landing-page .menu-toggle {display:flex;}
  }

  .landing-page /* ================= HERO ================= */
  .hero {position:relative; padding:64px 0 40px; overflow:hidden;}
  .landing-page .hero-grid {display:grid; grid-template-columns:1fr; gap:56px; align-items:center;}@media (min-width:960px){ .landing-page .hero-grid {grid-template-columns:1.05fr 0.95fr; gap:40px;} }
  .landing-page .hero-copy h1 {font-size:44px; line-height:1.06; margin-bottom:20px;}@media (min-width:640px){ .landing-page .hero-copy h1 {font-size:56px;} }@media (min-width:960px){ .landing-page .hero-copy h1 {font-size:60px;} }
  .landing-page .hero-copy p.lead {font-size:18px; color:var(--muted); max-width:460px; margin-bottom:32px;}
  .landing-page .hero-ctas {display:flex; flex-wrap:wrap; gap:14px; margin-bottom:28px;}
  .landing-page .trust-row {display:flex; flex-wrap:wrap; gap:20px; font-size:13px; color:var(--muted); font-weight:500;}
  .landing-page .trust-row span {display:flex; align-items:center; gap:6px;}
  .landing-page .trust-row svg {width:14px; height:14px; color:var(--income); flex-shrink:0;}

  .landing-page /* Hero visual: phone + chaos chips */
  .hero-visual {position:relative; display:flex; justify-content:center; min-height:520px;}
  .landing-page .phone {width:280px; border:7px solid #161616; border-radius:38px; background:var(--card); box-shadow:0 30px 70px -20px rgba(20,38,31,0.35); position:relative; overflow:hidden; z-index:5;}
  .landing-page .phone-notch {position:absolute; top:0; left:50%; transform:translateX(-50%); width:88px; height:16px; background:#161616; border-radius:0 0 14px 14px; z-index:2;}
  .landing-page .phone-status {display:flex; justify-content:space-between; font-size:10px; font-weight:600; padding:14px 20px 4px; color:var(--ink);}
  .landing-page .phone-screen {padding:8px 16px 20px;}
  .landing-page .balance-card {border-radius:22px; padding:18px; background:linear-gradient(135deg,var(--primary),var(--primary-deep)); position:relative; overflow:hidden; margin-bottom:16px;}
  .landing-page .balance-card::before {content:''; position:absolute; inset:0; background-image:radial-gradient(circle, #fff 1px, transparent 1px); background-size:12px 12px; opacity:.08;}
  .landing-page .balance-label {font-size:10px; color:rgba(255,255,255,.7); text-transform:uppercase; letter-spacing:.05em; position:relative;}
  .landing-page .balance-value {font-family:var(--font-display); font-size:26px; font-weight:700; color:#fff; margin-top:4px; position:relative;}
  .landing-page .balance-sub {display:flex; justify-content:space-between; margin-top:14px; padding-top:14px; border-top:1px solid rgba(255,255,255,.15); position:relative;}
  .landing-page .balance-sub div p:first-child {font-size:9px; color:rgba(255,255,255,.7);}
  .landing-page .balance-sub div p:last-child {font-size:12px; color:#fff; font-weight:600; font-family:var(--font-mono); margin-top:2px;}
  .landing-page .mini-donut {width:76px; height:76px; border-radius:50%; background:conic-gradient(var(--amber) 0% 30%, var(--blue) 30% 48%, var(--purple) 48% 70%, var(--pink) 70% 100%); margin:8px auto; position:relative;}
  .landing-page .mini-donut::after {content:''; position:absolute; inset:14px; background:var(--card); border-radius:50%;}
  .landing-page .mini-row {display:flex; align-items:center; justify-content:space-between; padding:8px 0; font-size:11px;}
  .landing-page .mini-dot {width:8px; height:8px; border-radius:50%; display:inline-block; margin-right:8px;}
  .landing-page .mini-row span:first-child {display:flex; align-items:center; color:var(--muted);}
  .landing-page .mini-row span:last-child {font-family:var(--font-mono); font-weight:600;}

  .landing-page .chip {position:absolute; display:flex; align-items:center; gap:8px; background:var(--card); border:1px solid var(--border); border-radius:14px; padding:9px 13px; font-size:12px; font-weight:600; box-shadow:0 12px 24px -8px rgba(20,38,31,.18); z-index:3; opacity:0;}
  .landing-page.js-ready .chip {transition:opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1); transition-delay:var(--d);}
  .landing-page .chip .mini-dot {margin-right:0;}
  .landing-page .chip b {font-family:var(--font-mono); font-weight:600;}
  .landing-page .hero-visual.loaded .chip {opacity:1;}@media (prefers-reduced-motion: no-preference){
    .landing-page .hero-visual.loaded .chip {animation:chipfloat 5s ease-in-out infinite; animation-delay:var(--d);}
  }@keyframes chipfloat{ 0%,100%{transform:translate(var(--tx),var(--ty)) rotate(var(--tr));} 50%{transform:translate(var(--tx), calc(var(--ty) - 7px)) rotate(var(--tr));} }
  .landing-page.js-ready .chip {transform:translate(var(--sx),var(--sy)) rotate(var(--sr)) scale(.82);}
  .landing-page.js-ready .hero-visual.loaded .chip {transform:translate(var(--tx),var(--ty)) rotate(var(--tr)) scale(1);}

  .landing-page .toast-float {position:absolute; bottom:34px; left:50%; background:var(--ink); color:#fff; font-size:12px; font-weight:600; padding:10px 18px; border-radius:999px; box-shadow:0 14px 30px rgba(20,38,31,.3); z-index:6; opacity:0; transform:translate(-50%,10px);}
  .landing-page.js-ready .toast-float {transition:opacity .5s ease, transform .5s ease;}
  .landing-page .toast-float.show {opacity:1; transform:translate(-50%,0);}

  .landing-page /* ================= QUICK STATS ================= */
  .stat-strip {background:var(--ink); padding:56px 0;}
  .landing-page .stat-grid {display:grid; grid-template-columns:repeat(2,1fr); gap:32px; text-align:center;}@media (min-width:720px){ .landing-page .stat-grid {grid-template-columns:repeat(4,1fr);} }
  .landing-page .stat-num {font-family:var(--font-display); font-size:34px; font-weight:700; color:#fff;}
  .landing-page .stat-label {font-size:12px; color:#9EB0A6; margin-top:6px;}

  .landing-page /* ================= PROBLEM ================= */
  .problem {background:var(--ink); color:#fff;}
  .landing-page .problem h2 {color:#fff; font-size:32px; max-width:640px; margin-bottom:56px;}@media (min-width:720px){ .landing-page .problem h2 {font-size:40px;} }
  .landing-page .pain-grid {display:grid; grid-template-columns:1fr; gap:24px;}@media (min-width:720px){ .landing-page .pain-grid {grid-template-columns:repeat(3,1fr);} }
  .landing-page .pain-card {background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); border-radius:18px; padding:28px; border-left:3px solid var(--expense);}
  .landing-page .pain-card h3 {color:#fff; font-size:17px; margin-bottom:10px;}
  .landing-page .pain-card p {color:#9EB0A6; font-size:14px; line-height:1.6;}

  .landing-page /* ================= FEATURES ================= */
  .section-head {max-width:600px; margin-bottom:56px;}
  .landing-page .section-head h2 {font-size:32px; color:var(--ink);}@media (min-width:720px){ .landing-page .section-head h2 {font-size:40px;} }
  .landing-page .feature-grid {display:grid; grid-template-columns:1fr; gap:20px;}@media (min-width:640px){ .landing-page .feature-grid {grid-template-columns:1fr 1fr;} }@media (min-width:960px){ .landing-page .feature-grid {grid-template-columns:repeat(3,1fr);} }
  .landing-page .feature-card {background:var(--card); border:1px solid var(--border); border-radius:20px; padding:28px; transition:transform .25s ease, box-shadow .25s ease;}
  .landing-page .feature-card:hover {transform:translateY(-4px); box-shadow:0 20px 40px -16px rgba(20,38,31,.18);}
  .landing-page .ring {width:48px; height:48px; border-radius:50%; margin-bottom:18px; background:conic-gradient(var(--rc) 0% var(--rp), var(--border) var(--rp) 100%); display:flex; align-items:center; justify-content:center;}
  .landing-page .ring::after {content:''; width:32px; height:32px; border-radius:50%; background:var(--card);}
  .landing-page .feature-card h3 {font-size:16px; margin-bottom:8px;}
  .landing-page .feature-card p {font-size:14px; color:var(--muted); line-height:1.6;}

  .landing-page /* ================= HOW IT WORKS ================= */
  .steps {display:grid; grid-template-columns:1fr; gap:40px; position:relative;}@media (min-width:820px){ .landing-page .steps {grid-template-columns:repeat(3,1fr);} }
  .landing-page .steps::before {content:''; display:none;}@media (min-width:820px){
    .landing-page .steps::before {content:''; display:block; position:absolute; top:26px; left:16%; right:16%; height:1px; background:repeating-linear-gradient(to right, var(--border) 0 8px, transparent 8px 16px); z-index:0;}
  }
  .landing-page .step {position:relative; z-index:1;}
  .landing-page .step-num {font-family:var(--font-display); font-size:15px; font-weight:700; color:var(--primary); width:52px; height:52px; border-radius:50%; background:var(--card); border:1.5px solid var(--primary); display:flex; align-items:center; justify-content:center; margin-bottom:20px;}
  .landing-page .step h3 {font-size:18px; margin-bottom:10px;}
  .landing-page .step p {font-size:14px; color:var(--muted); line-height:1.6; max-width:280px;}

  .landing-page /* ================= SHOWCASE ================= */
  .showcase-strip {display:flex; gap:24px; overflow-x:auto; padding:12px 0 20px; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch;}
  .landing-page .showcase-strip::-webkit-scrollbar {display:none;}
  .landing-page .showcase-item {scroll-snap-align:center; flex:0 0 auto; text-align:center;}
  .landing-page .phone-mini {width:220px; border:6px solid #161616; border-radius:32px; background:var(--card); overflow:hidden; box-shadow:0 24px 50px -16px rgba(20,38,31,.28);}
  .landing-page .phone-mini .ms {font-size:9px; display:flex; justify-content:space-between; padding:10px 16px 2px; font-weight:600;}
  .landing-page .phone-mini .msc {padding:6px 14px 16px;}
  .landing-page .showcase-caption {margin-top:16px; font-weight:600; font-size:14px; color:var(--ink);}
  .landing-page .cat-chip {display:flex; align-items:center; justify-content:space-between; background:var(--paper); border-radius:12px; padding:8px 10px; margin-bottom:6px; font-size:10px;}
  .landing-page .cat-chip .l {display:flex; align-items:center; gap:6px; color:var(--muted);}
  .landing-page .cat-chip b {font-family:var(--font-mono);}
  .landing-page .progress-row {margin-bottom:14px;}
  .landing-page .progress-row .top {display:flex; justify-content:space-between; font-size:9px; color:var(--muted); margin-bottom:4px;}
  .landing-page .progress-track {height:6px; border-radius:99px; background:var(--paper); overflow:hidden;}
  .landing-page .progress-fill {height:100%; border-radius:99px;}
  .landing-page .keypad-mini {display:grid; grid-template-columns:repeat(3,1fr); gap:5px; margin-top:10px;}
  .landing-page .keypad-mini div {background:var(--paper); border-radius:8px; text-align:center; padding:8px 0; font-size:11px; font-weight:600; color:var(--ink);}
  .landing-page .amount-mini {text-align:center; font-family:var(--font-display); font-size:20px; font-weight:700; color:var(--expense); margin:10px 0;}

  .landing-page /* ================= TESTIMONIALS ================= */
  .testi-wrap {position:relative;}
  .landing-page .testi-strip {display:flex; gap:20px; overflow-x:auto; scroll-snap-type:x mandatory; padding:6px 6px 20px; -webkit-overflow-scrolling:touch;}
  .landing-page .testi-strip::-webkit-scrollbar {display:none;}
  .landing-page .testi-card {scroll-snap-align:start; flex:0 0 300px; background:var(--card); border:1px solid var(--border); border-radius:20px; padding:26px;}
  .landing-page .stars {display:flex; gap:3px; margin-bottom:14px;}
  .landing-page .stars svg {width:15px; height:15px; color:var(--gold);}
  .landing-page .testi-quote {font-size:14px; line-height:1.65; color:var(--ink); margin-bottom:20px; min-height:105px;}
  .landing-page .testi-person {display:flex; align-items:center; gap:10px;}
  .landing-page .testi-avatar {width:38px; height:38px; border-radius:50%; background:var(--primary); color:#fff; font-family:var(--font-display); font-weight:600; font-size:14px; display:flex; align-items:center; justify-content:center;}
  .landing-page .testi-name {font-size:13px; font-weight:600;}
  .landing-page .testi-role {font-size:11px; color:var(--muted);}
  .landing-page .testi-nav {display:flex; gap:10px; justify-content:center; margin-top:8px;}
  .landing-page .testi-arrow {width:40px; height:40px; border-radius:50%; border:1.5px solid var(--border); display:flex; align-items:center; justify-content:center; transition:border-color .2s, transform .2s;}
  .landing-page .testi-arrow:hover {border-color:var(--primary); transform:translateY(-2px);}
  .landing-page .testi-arrow svg {width:16px; height:16px;}
  .landing-page .testi-disclaimer {text-align:center; font-size:11px; color:var(--muted); margin-top:18px;}

  .landing-page /* ================= TRUST ================= */
  .trust-grid {display:grid; grid-template-columns:1fr; gap:48px; align-items:center;}@media (min-width:900px){ .landing-page .trust-grid {grid-template-columns:1fr 1fr;} }
  .landing-page .trust-list {display:flex; flex-direction:column; gap:22px; margin-top:24px;}
  .landing-page .trust-list li {display:flex; gap:14px;}
  .landing-page .trust-icon {width:36px; height:36px; border-radius:10px; background:rgba(31,111,92,.1); color:var(--primary); display:flex; align-items:center; justify-content:center; flex-shrink:0;}
  .landing-page .trust-icon svg {width:18px; height:18px;}
  .landing-page .trust-item h3 {font-size:15px; margin-bottom:4px;}
  .landing-page .trust-item p {font-size:13px; color:var(--muted); line-height:1.55;}
  .landing-page .trust-visual {background:var(--ink); border-radius:24px; padding:36px; color:#fff; position:relative; overflow:hidden;}
  .landing-page .trust-visual::before {content:''; position:absolute; inset:0; background-image:radial-gradient(circle, #fff 1px, transparent 1px); background-size:16px 16px; opacity:.05;}
  .landing-page .trust-code {position:relative; font-family:var(--font-mono); font-size:12px; line-height:1.9; color:#9EB0A6;}
  .landing-page .trust-code .k {color:#8FE3C6;}
  .landing-page .trust-code .s {color:#E8B4A0;}

  .landing-page /* ================= COMPARISON ================= */
  .compare-wrap {overflow-x:auto; border-radius:20px; border:1px solid var(--border);}
  .landing-page table.compare {width:100%; border-collapse:collapse; min-width:560px; background:var(--card);}
  .landing-page table.compare th, .landing-page table.compare td {padding:18px 20px; text-align:left; font-size:13px; border-bottom:1px solid var(--border);}
  .landing-page table.compare th {font-family:var(--font-display); font-size:14px; color:var(--muted); font-weight:600;}
  .landing-page table.compare th.hl, .landing-page table.compare td.hl {background:rgba(31,111,92,.05);}
  .landing-page table.compare th.hl {color:var(--primary);}
  .landing-page table.compare tr:last-child td {border-bottom:none;}
  .landing-page .ok {color:var(--income); font-weight:700;}
  .landing-page .no {color:var(--expense); font-weight:700;}

  .landing-page /* ================= FAQ ================= */
  .faq-list {max-width:720px; margin:0 auto;}
  .landing-page .faq-item {border-bottom:1px solid var(--border);}
  .landing-page .faq-q {width:100%; display:flex; align-items:center; justify-content:space-between; padding:22px 4px; text-align:left; font-family:var(--font-display); font-size:16px; font-weight:600; color:var(--ink);}
  .landing-page .faq-q svg {width:16px; height:16px; flex-shrink:0; margin-left:16px; transition:transform .3s ease; color:var(--primary);}
  .landing-page .faq-item.open .faq-q svg {transform:rotate(180deg);}
  .landing-page .faq-a-wrap {display:grid; grid-template-rows:0fr; transition:grid-template-rows .35s ease;}
  .landing-page .faq-item.open .faq-a-wrap {grid-template-rows:1fr;}
  .landing-page .faq-a-inner {overflow:hidden;}
  .landing-page .faq-a {padding:0 4px 22px; font-size:14px; color:var(--muted); line-height:1.65; max-width:600px;}

  .landing-page /* ================= FINAL CTA ================= */
  .final-cta {background:linear-gradient(135deg,var(--primary),var(--primary-deep)); border-radius:32px; padding:64px 32px; text-align:center; position:relative; overflow:hidden; margin:0 24px;}
  .landing-page .final-cta::before {content:''; position:absolute; inset:0; background-image:radial-gradient(circle, #fff 1px, transparent 1px); background-size:16px 16px; opacity:.08;}
  .landing-page .final-cta h2 {color:#fff; font-size:32px; max-width:520px; margin:0 auto 14px; position:relative;}@media (min-width:720px){ .landing-page .final-cta h2 {font-size:40px;} }
  .landing-page .final-cta p {color:#BFE8D6; font-size:16px; margin-bottom:32px; position:relative;}
  .landing-page .final-cta .btn {position:relative;}

  .landing-page /* ================= FOOTER ================= */
  footer {padding:56px 0 32px;}
  .landing-page .foot-top {display:flex; flex-direction:column; gap:32px; padding-bottom:32px; border-bottom:1px solid var(--border); margin-bottom:24px;}@media (min-width:720px){ .landing-page .foot-top {flex-direction:row; justify-content:space-between; align-items:flex-start;} }
  .landing-page .foot-tag {font-size:13px; color:var(--muted); max-width:280px; margin-top:10px;}
  .landing-page .foot-links {display:flex; gap:48px; flex-wrap:wrap;}
  .landing-page .foot-col h4 {font-family:var(--font-display); font-size:13px; margin-bottom:14px; color:var(--ink);}
  .landing-page .foot-col a {display:block; font-size:13px; color:var(--muted); margin-bottom:10px;}
  .landing-page .foot-col a:hover {color:var(--primary);}
  .landing-page .foot-bottom {display:flex; flex-direction:column; gap:8px; font-size:12px; color:var(--muted);}@media (min-width:720px){ .landing-page .foot-bottom {flex-direction:row; justify-content:space-between;} }
`;

const FEATURES = [
  { color: "var(--primary)", pct: "92%", title: "Registro em segundos", text: "Toque, digite o valor, escolha a categoria. Registrar um gasto leva menos tempo do que pedir o iFood." },
  { color: "var(--purple)", pct: "70%", title: "Categorias visuais", text: "Cada gasto com sua cor. Você entende o mês inteiro num piscar de olho, sem ler número nenhum." },
  { color: "var(--gold)", pct: "78%", title: "Orçamento com alerta", text: "Defina um limite por categoria e receba um aviso visual antes de estourar — não depois, quando já era tarde." },
  { color: "var(--pink)", pct: "55%", title: "Metas que você acompanha", text: "Separe dinheiro pra viagem, reserva, o que for — e veja a barra de progresso crescer semana a semana." },
  { color: "var(--blue)", pct: "85%", title: "Histórico por mês", text: "Navegue entre meses de calendário reais e compare janeiro com fevereiro sem abrir uma única fórmula." },
  { color: "var(--income)", pct: "100%", title: "Funciona offline", text: "Sem internet, sem problema. Seus dados sincronizam sozinhos assim que você reconectar." },
];

const STEPS = [
  { num: "01", title: "Crie sua conta", text: "Email e senha. Sem cartão de crédito, sem formulário gigante." },
  { num: "02", title: "Registre seus gastos", text: "Toque, digite o valor, escolha a categoria. Pronto — já está no seu painel." },
  { num: "03", title: "Veja tudo fazer sentido", text: "Gráficos, orçamento e metas se atualizam sozinhos, mês após mês." },
];

const TESTIMONIALS = [
  { initial: "M", name: "Marina T.", role: "Usuária desde o lançamento", quote: "Descobri que gastava R$ 280 por mês só em delivery sem perceber. Cortei pela metade já no primeiro mês só de ver o número." },
  { initial: "R", name: "Rafael S.", role: "Ex-usuário de planilha", quote: "Uso desde que saí da planilha. Levo uns 10 segundos pra registrar um gasto agora — por isso eu realmente uso todo dia." },
  { initial: "C", name: "Camila A.", role: "Usuária mensal", quote: "O alerta de orçamento me salvou de estourar o cartão em dezembro. Simples assim." },
  { initial: "B", name: "Bruno L.", role: "Freelancer", quote: "Testei uns 4 apps de finanças antes. Esse foi o primeiro que não parecia banco corporativo — parecia feito pra mim." },
  { initial: "J", name: "Juliana P.", role: "Planejando uma viagem", quote: "Consegui juntar dinheiro pra viagem acompanhando a meta toda semana. Ver a barra andar motiva de verdade." },
  { initial: "D", name: "Diego M.", role: "Usuário diário", quote: "Funciona offline no metrô e sincroniza quando chego em casa. Detalhe que faz toda diferença no meu dia a dia." },
];

const FAQS = [
  { q: "O FinanceIA é realmente gratuito?", a: "Sim. Sem mensalidade, sem plano pago escondido, sem cartão de crédito pra criar conta.", openByDefault: true },
  { q: "Meus dados financeiros ficam seguros?", a: "Sim. A autenticação e o banco de dados rodam sobre PostgreSQL com Row Level Security — uma regra que garante que cada conta só acessa os próprios dados, no nível técnico do banco." },
  { q: "Funciona no Android e no iPhone?", a: "Funciona em qualquer aparelho com um navegador moderno. Você instala direto do navegador, sem precisar de loja de aplicativo." },
  { q: "Preciso de internet o tempo todo?", a: "Não. Você pode registrar gastos offline; tudo sincroniza sozinho assim que a internet voltar." },
  { q: "Dá pra exportar meus dados?", a: "Sim, exportação em CSV a qualquer momento, direto do app." },
  { q: "Posso usar pra dividir contas com alguém?", a: "Hoje cada conta é individual, pensada pra controle pessoal. Divisão de contas é algo que pode vir no futuro." },
];

const CHECK_ICON = (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" />
  </svg>
);

function useRevealOnScroll(containerRef, deps) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const els = container.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function useAnimatedCounters(containerRef) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const counters = container.querySelectorAll(".count");
    if (!("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target, 10);
            const duration = 1200;
            const start = performance.now();
            function tick(now) {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              el.textContent = String(Math.round(eased * target));
              if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [containerRef]);
}

export default function LandingPage() {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const testiStripRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroVisualLoaded, setHeroVisualLoaded] = useState(false);
  const [toastShown, setToastShown] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(() => FAQS.findIndex((f) => f.openByDefault));

  useRevealOnScroll(rootRef, []);
  useAnimatedCounters(rootRef);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setHeroVisualLoaded(true), 150);
    const t2 = setTimeout(() => setToastShown(true), 1700);
    const t3 = setTimeout(() => setToastShown(false), 4200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  function scrollTesti(dir) {
    if (testiStripRef.current) {
      testiStripRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
    }
  }

  function goSignup(e) {
    if (e) e.preventDefault();
    setMenuOpen(false);
    navigate("/app?mode=signup");
  }

  function closeMenuAnd(fn) {
    return (e) => {
      setMenuOpen(false);
      if (fn) fn(e);
    };
  }

  return (
    <div className="landing-page js-ready" ref={rootRef}>
      <style>{LANDING_CSS}</style>

      <header className={scrolled ? "scrolled" : ""}>
        <div className="container nav">
          <a href="#top" className="logo">
            <span className="logo-mark">F</span>FinanceIA
          </a>
          <nav className="nav-links">
            <a href="#recursos">Recursos</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#depoimentos">Depoimentos</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="nav-cta">
            <Link to="/app" className="btn btn-ghost">
              Entrar
            </Link>
            <a href="#cta-final" className="btn btn-primary" onClick={goSignup}>
              Instalar grátis
            </a>
          </div>
          <button
            className={`menu-toggle${menuOpen ? " open" : ""}`}
            aria-label="Abrir menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
      </header>

      <div className={`mobile-panel${menuOpen ? " open" : ""}`}>
        <a href="#recursos" onClick={closeMenuAnd()}>
          Recursos
        </a>
        <a href="#como-funciona" onClick={closeMenuAnd()}>
          Como funciona
        </a>
        <a href="#depoimentos" onClick={closeMenuAnd()}>
          Depoimentos
        </a>
        <a href="#faq" onClick={closeMenuAnd()}>
          FAQ
        </a>
        <a href="#cta-final" className="btn btn-primary" style={{ marginTop: 12, width: "fit-content" }} onClick={goSignup}>
          Instalar grátis
        </a>
      </div>

      <main id="top">
        {/* ================= HERO ================= */}
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Gestão financeira pessoal</p>
              <h1>
                Suas finanças,
                <br />
                finalmente claras.
              </h1>
              <p className="lead">
                Chega de planilha esquecida no dia 5 e app que parece extrato de banco. Registre um gasto em segundos e
                veja pra onde seu dinheiro realmente vai.
              </p>
              <div className="hero-ctas">
                <a href="#cta-final" className="btn btn-primary" onClick={goSignup}>
                  Criar conta grátis
                </a>
                <a href="#como-funciona" className="btn btn-ghost">
                  Ver como funciona
                </a>
              </div>
              <div className="trust-row">
                <span>{CHECK_ICON}Grátis para sempre</span>
                <span>{CHECK_ICON}Funciona offline</span>
                <span>{CHECK_ICON}Seus dados, só seus</span>
              </div>
            </div>

            <div className={`hero-visual${heroVisualLoaded ? " loaded" : ""}`}>
              <div className="phone">
                <div className="phone-notch" />
                <div className="phone-status">
                  <span>9:41</span>
                  <span>••••</span>
                </div>
                <div className="phone-screen">
                  <div className="balance-card">
                    <p className="balance-label">Saldo disponível</p>
                    <p className="balance-value">R$ 4.286,50</p>
                    <div className="balance-sub">
                      <div>
                        <p>Receitas (mês)</p>
                        <p>+ R$ 5.050,00</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p>Despesas (mês)</p>
                        <p>− R$ 2.960,40</p>
                      </div>
                    </div>
                  </div>
                  <div className="mini-donut" />
                  <div className="mini-row">
                    <span>
                      <span className="mini-dot" style={{ background: "var(--amber)" }} />
                      Alimentação
                    </span>
                    <span>32%</span>
                  </div>
                  <div className="mini-row">
                    <span>
                      <span className="mini-dot" style={{ background: "var(--purple)" }} />
                      Moradia
                    </span>
                    <span>48%</span>
                  </div>
                  <div className="mini-row">
                    <span>
                      <span className="mini-dot" style={{ background: "var(--pink)" }} />
                      Lazer
                    </span>
                    <span>20%</span>
                  </div>
                </div>
              </div>

              <div className="chip" style={{ top: "6%", left: "-4%", "--sx": "-60px", "--sy": "-40px", "--sr": "-14deg", "--tx": "0", "--ty": "0", "--tr": "-7deg", "--d": ".05s" }}>
                <span className="mini-dot" style={{ background: "var(--amber)" }} />
                iFood <b>−R$ 34,90</b>
              </div>
              <div className="chip" style={{ top: "2%", right: "-8%", "--sx": "70px", "--sy": "-30px", "--sr": "10deg", "--tx": "0", "--ty": "0", "--tr": "6deg", "--d": ".15s" }}>
                <span className="mini-dot" style={{ background: "var(--blue)" }} />
                Uber <b>−R$ 18,00</b>
              </div>
              <div className="chip" style={{ top: "42%", left: "-12%", "--sx": "-90px", "--sy": "20px", "--sr": "-8deg", "--tx": "0", "--ty": "0", "--tr": "-5deg", "--d": ".25s" }}>
                <span className="mini-dot" style={{ background: "var(--income)" }} />
                Salário <b>+R$ 4.200</b>
              </div>
              <div className="chip" style={{ bottom: "20%", right: "-10%", "--sx": "80px", "--sy": "40px", "--sr": "12deg", "--tx": "0", "--ty": "0", "--tr": "7deg", "--d": ".35s" }}>
                <span className="mini-dot" style={{ background: "var(--purple)" }} />
                Aluguel <b>−R$ 1.400</b>
              </div>
              <div className="chip" style={{ bottom: "4%", left: "-2%", "--sx": "-50px", "--sy": "60px", "--sr": "-10deg", "--tx": "0", "--ty": "0", "--tr": "-4deg", "--d": ".45s" }}>
                <span className="mini-dot" style={{ background: "var(--pink)" }} />
                Cinema <b>−R$ 89,90</b>
              </div>

              <div className={`toast-float${toastShown ? " show" : ""}`}>✓ Transação adicionada</div>
            </div>
          </div>
        </section>

        {/* ================= STATS ================= */}
        <section className="stat-strip">
          <div className="container stat-grid">
            <div className="reveal">
              <p className="stat-num">R$ 0</p>
              <p className="stat-label">Mensalidade, hoje e sempre</p>
            </div>
            <div className="reveal">
              <p className="stat-num">
                <span className="count" data-target="100">
                  0
                </span>
                %
              </p>
              <p className="stat-label">Dos seus dados, só seus</p>
            </div>
            <div className="reveal">
              <p className="stat-num">&lt; 1 min</p>
              <p className="stat-label">Pra registrar um gasto</p>
            </div>
            <div className="reveal">
              <p className="stat-num">
                <span className="count" data-target="6">
                  0
                </span>{" "}
                meses
              </p>
              <p className="stat-label">De histórico visual automático</p>
            </div>
          </div>
        </section>

        {/* ================= PROBLEM ================= */}
        <section className="problem">
          <div className="container">
            <p className="eyebrow on-dark reveal">O problema</p>
            <h2 className="reveal">
              Você não é ruim com dinheiro.
              <br />
              Só falta um lugar pra ver ele com clareza.
            </h2>
            <div className="pain-grid">
              <div className="pain-card reveal">
                <h3>A planilha que você abandonou</h3>
                <p>Começou organizada em janeiro. Virou uma bagunça de abas esquecidas em fevereiro. Você conhece essa história.</p>
              </div>
              <div className="pain-card reveal">
                <h3>Apps que parecem extrato de banco</h3>
                <p>Cheios de gráfico que ninguém entende e notificação que ninguém lê. Complicado demais pra um uso tão simples.</p>
              </div>
              <div className="pain-card reveal">
                <h3>A sensação de mês infinito</h3>
                <p>Você trabalha o mês inteiro e, no dia 25, não sabe exatamente pra onde foi o dinheiro. De novo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section id="recursos">
          <div className="container">
            <div className="section-head reveal">
              <p className="eyebrow">Recursos</p>
              <h2>
                Tudo que você precisa.
                <br />
                Nada que você não vai usar.
              </h2>
            </div>
            <div className="feature-grid">
              {FEATURES.map((f) => (
                <div className="feature-card reveal" key={f.title}>
                  <div className="ring" style={{ "--rc": f.color, "--rp": f.pct }} />
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section id="como-funciona" style={{ background: "var(--card)" }}>
          <div className="container">
            <div className="section-head reveal">
              <p className="eyebrow">Como funciona</p>
              <h2>Comece em menos de um minuto.</h2>
            </div>
            <div className="steps">
              {STEPS.map((s) => (
                <div className="step reveal" key={s.num}>
                  <div className="step-num">{s.num}</div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= SHOWCASE ================= */}
        <section>
          <div className="container">
            <div className="section-head reveal">
              <p className="eyebrow">Por dentro do app</p>
              <h2>Simples de olhar. Fácil de usar.</h2>
            </div>
          </div>
          <div className="container">
            <div className="showcase-strip">
              <div className="showcase-item reveal">
                <div className="phone-mini">
                  <div className="ms">
                    <span>9:41</span>
                    <span>••••</span>
                  </div>
                  <div className="msc">
                    <div className="balance-card" style={{ padding: 14, borderRadius: 16 }}>
                      <p className="balance-label">Saldo disponível</p>
                      <p className="balance-value" style={{ fontSize: 20 }}>
                        R$ 4.286,50
                      </p>
                    </div>
                    <div className="mini-donut" style={{ width: 64, height: 64 }} />
                    <div className="cat-chip">
                      <span className="l">
                        <span className="mini-dot" style={{ background: "var(--amber)" }} />
                        Alimentação
                      </span>
                      <b>32%</b>
                    </div>
                    <div className="cat-chip">
                      <span className="l">
                        <span className="mini-dot" style={{ background: "var(--purple)" }} />
                        Moradia
                      </span>
                      <b>48%</b>
                    </div>
                  </div>
                </div>
                <p className="showcase-caption">Seu painel do mês</p>
              </div>

              <div className="showcase-item reveal">
                <div className="phone-mini">
                  <div className="ms">
                    <span>9:41</span>
                    <span>••••</span>
                  </div>
                  <div className="msc" style={{ paddingTop: 16 }}>
                    <div className="amount-mini">R$ 34,90</div>
                    <div className="cat-chip" style={{ background: "rgba(217,139,63,.12)", justifyContent: "center", gap: 6 }}>
                      <span className="l" style={{ color: "var(--amber)", fontWeight: 700 }}>
                        🍽 Alimentação
                      </span>
                    </div>
                    <div className="keypad-mini">
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
                        <div key={n}>{n}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="showcase-caption">Adicionar em segundos</p>
              </div>

              <div className="showcase-item reveal">
                <div className="phone-mini">
                  <div className="ms">
                    <span>9:41</span>
                    <span>••••</span>
                  </div>
                  <div className="msc" style={{ paddingTop: 16 }}>
                    {[
                      { label: "Alimentação", pct: 78, color: "var(--gold)" },
                      { label: "Transporte", pct: 45, color: "var(--income)" },
                      { label: "Viagem (meta)", pct: 39, color: "var(--gold)" },
                      { label: "Lazer", pct: 103, color: "var(--expense)", cap: true },
                    ].map((row) => (
                      <div className="progress-row" key={row.label}>
                        <div className="top">
                          <span>{row.label}</span>
                          <span>{row.pct}%</span>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${row.cap ? 100 : row.pct}%`, background: row.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="showcase-caption">Orçamentos e metas</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= TESTIMONIALS ================= */}
        <section id="depoimentos" style={{ background: "var(--card)" }}>
          <div className="container">
            <div className="section-head reveal">
              <p className="eyebrow">Depoimentos</p>
              <h2>Quem usa, não volta pra planilha.</h2>
            </div>
          </div>
          <div className="container testi-wrap">
            <div className="testi-strip" ref={testiStripRef}>
              {TESTIMONIALS.map((t) => (
                <div className="testi-card reveal" key={t.name}>
                  <div className="stars">★★★★★</div>
                  <p className="testi-quote">&quot;{t.quote}&quot;</p>
                  <div className="testi-person">
                    <div className="testi-avatar">{t.initial}</div>
                    <div>
                      <p className="testi-name">{t.name}</p>
                      <p className="testi-role">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="testi-nav">
              <button className="testi-arrow" aria-label="Depoimento anterior" onClick={() => scrollTesti(-1)}>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15l-5-5 5-5" />
                </svg>
              </button>
              <button className="testi-arrow" aria-label="Próximo depoimento" onClick={() => scrollTesti(1)}>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 5l5 5-5 5" />
                </svg>
              </button>
            </div>
            <p className="testi-disclaimer">Depoimentos ilustrativos representando casos de uso reais do produto.</p>
          </div>
        </section>

        {/* ================= TRUST ================= */}
        <section>
          <div className="container trust-grid">
            <div className="reveal">
              <p className="eyebrow">Segurança</p>
              <h2 style={{ fontSize: 32 }}>Dados financeiros são coisa séria. Tratamos assim.</h2>
              <ul className="trust-list">
                <li>
                  <div className="trust-icon">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 1l7 3v5c0 5-3.4 8.4-7 10-3.6-1.6-7-5-7-10V4l7-3z" />
                    </svg>
                  </div>
                  <div className="trust-item">
                    <h3>Cada conta só acessa os próprios dados</h3>
                    <p>Regras de segurança no próprio banco de dados garantem isolamento total entre contas — não é uma promessa, é uma trava técnica.</p>
                  </div>
                </li>
                <li>
                  <div className="trust-icon">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v2H2V4zm0 4h16v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8z" />
                    </svg>
                  </div>
                  <div className="trust-item">
                    <h3>Autenticação criptografada</h3>
                    <p>Login com email e senha protegido de ponta a ponta, sobre a mesma infraestrutura usada por milhares de aplicações.</p>
                  </div>
                </li>
                <li>
                  <div className="trust-icon">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12H9v5l4.3 2.6.9-1.5-3.2-2V6z" />
                    </svg>
                  </div>
                  <div className="trust-item">
                    <h3>Você exporta quando quiser</h3>
                    <p>Seus dados nunca ficam presos. Exporte tudo em CSV a qualquer momento, direto do app.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="trust-visual reveal">
              <div className="trust-code">
                <div>
                  <span className="k">create policy</span> <span className="s">&quot;cada usuário só vê os próprios dados&quot;</span>
                </div>
                <div>
                  <span className="k">on</span> transactions
                </div>
                <div>
                  <span className="k">using</span> (auth.uid() = user_id);
                </div>
                <br />
                <div style={{ color: "#8FE3C6" }}>✓ Row Level Security ativa</div>
                <div style={{ color: "#8FE3C6" }}>✓ Isolamento por usuário</div>
                <div style={{ color: "#8FE3C6" }}>✓ Conexão criptografada</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= COMPARISON ================= */}
        <section>
          <div className="container">
            <div className="section-head reveal">
              <p className="eyebrow">Comparação honesta</p>
              <h2>
                Você já tentou de outros jeitos.
                <br />
                Viu como foi.
              </h2>
            </div>
            <div className="compare-wrap reveal">
              <table className="compare">
                <thead>
                  <tr>
                    <th />
                    <th>Sem controle</th>
                    <th>Planilha</th>
                    <th className="hl">FinanceIA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Tempo pra registrar um gasto</td>
                    <td>—</td>
                    <td>2–3 min</td>
                    <td className="hl">
                      <b>&lt; 10 seg</b>
                    </td>
                  </tr>
                  <tr>
                    <td>Feito pra usar no celular</td>
                    <td>—</td>
                    <td className="no">Mal</td>
                    <td className="hl ok">✓ Sim</td>
                  </tr>
                  <tr>
                    <td>Alerta antes de estourar orçamento</td>
                    <td className="no">✗</td>
                    <td className="no">✗</td>
                    <td className="hl ok">✓</td>
                  </tr>
                  <tr>
                    <td>Gráficos automáticos</td>
                    <td>—</td>
                    <td>Manual</td>
                    <td className="hl ok">✓ Automático</td>
                  </tr>
                  <tr>
                    <td>Custo mensal</td>
                    <td>R$ 0</td>
                    <td>R$ 0</td>
                    <td className="hl">R$ 0</td>
                  </tr>
                  <tr>
                    <td>Você continua usando depois de 1 mês</td>
                    <td>—</td>
                    <td className="no">Raramente</td>
                    <td className="hl ok">É o objetivo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ================= FAQ ================= */}
        <section id="faq" style={{ background: "var(--card)" }}>
          <div className="container">
            <div className="section-head reveal" style={{ marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
              <p className="eyebrow" style={{ justifyContent: "center" }}>
                Perguntas frequentes
              </p>
              <h2>Ainda com dúvida?</h2>
            </div>
            <div className="faq-list reveal">
              {FAQS.map((faq, i) => {
                const open = openFaqIndex === i;
                return (
                  <div className={`faq-item${open ? " open" : ""}`} key={faq.q}>
                    <button className="faq-q" onClick={() => setOpenFaqIndex(open ? -1 : i)}>
                      {faq.q}
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 8l5 5 5-5" />
                      </svg>
                    </button>
                    <div className="faq-a-wrap">
                      <div className="faq-a-inner">
                        <p className="faq-a">{faq.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section id="cta-final">
          <div className="final-cta reveal">
            <h2>Seu eu daqui a 6 meses vai te agradecer.</h2>
            <p>Leva menos de um minuto pra criar sua conta. O resto o FinanceIA cuida com você.</p>
            <a href="#cta-final" className="btn btn-on-dark" onClick={goSignup}>
              Criar minha conta grátis
            </a>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <div className="foot-top">
            <div>
              <a href="#top" className="logo">
                <span className="logo-mark">F</span>FinanceIA
              </a>
              <p className="foot-tag">Clareza financeira, sem complicação. Um projeto independente, feito com atenção aos detalhes.</p>
            </div>
            <div className="foot-links">
              <div className="foot-col">
                <h4>Produto</h4>
                <a href="#recursos">Recursos</a>
                <a href="#como-funciona">Como funciona</a>
                <a href="#depoimentos">Depoimentos</a>
              </div>
              <div className="foot-col">
                <h4>Suporte</h4>
                <a href="#faq">Perguntas frequentes</a>
                <a href="#cta-final" onClick={goSignup}>
                  Criar conta
                </a>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 FinanceIA. Feito com 💚 no Brasil.</span>
            <span>Grátis para sempre — sem letras miúdas.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
