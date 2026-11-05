import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const buildStyles = (fontSize, theme) => `
  /* Replace line 8 */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --fs-base: ${fontSize}px;
    ${theme === "dark" ? `
    --bg: #181715;              /* surface-dark */
    --surface: #181715;
    --surface2: #1f1e1b;        /* surface-dark-soft */
    --surface3: #252320;        /* surface-dark-elevated */
    --border: #2f2d29;
    --accent: #cc785c;          /* coral stays constant across themes */
    --accent2: #5db8a6;
    --text: #faf9f5;            /* on-dark */
    --muted: #a09d96;           /* on-dark-soft */
    --user-bubble: #2a2521;
    --bot-bubble: #1f1e1b;
    --danger: #d97a7a;          /* lightened for dark-bg contrast */
    --success: #6dd18f;
    --search-hl: rgba(204,120,92,0.3);
    --search-hl-active: rgba(204,120,92,0.6);
    --quote-bg: rgba(93,184,166,0.1);
    --quote-border: #5db8a6;
    ` : `
    --bg: #faf9f5;              /* canvas */
    --surface: #faf9f5;         /* flat panels: sidebar, header, input bar */
    --surface2: #efe9de;        /* surface-card: tabs, summary box, stats, inputs */
    --surface3: #e8e0d2;        /* surface-cream-strong: hover/active states */
    --border: #e6dfd8;          /* hairline */
    --accent: #cc785c;          /* coral primary */
    --accent2: #5db8a6;         /* accent teal — replaces the cool blue */
    --text: #141413;            /* ink */
    --muted: #6c6a64;
    --user-bubble: #f0e6df;     /* warm coral-tinted, not blue */
    --bot-bubble: #ffffff;
    --danger: #c64545;
    --success: #5db872;
    --search-hl: rgba(204,120,92,0.22);
    --search-hl-active: rgba(204,120,92,0.5);
    --quote-bg: rgba(93,184,166,0.08);
    --quote-border: #5db8a6;
    `}
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: var(--fs-base);
    height: 100vh;
    overflow: hidden;
    transition: background 0.25s, color 0.25s;
  }

  .app { display: flex; height: 100vh; position: relative; }

  /* LEFT PANEL */
  .left {
    width: 300px; min-width: 240px; background: var(--surface);
    border-right: 1px solid var(--border); display: flex; flex-direction: column;
    position: relative; overflow: hidden; transition: background 0.25s, border-color 0.25s;
  }
  .left::before {
    content: ''; position: absolute; top: -80px; left: -80px; width: 260px; height: 260px;
    background: radial-gradient(circle, rgba(200,169,126,0.07) 0%, transparent 70%); pointer-events: none;
  }
  .left-header { padding: 22px 20px 16px; border-bottom: 1px solid var(--border); }
  .left-header .label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); margin-bottom: 5px; }
  .left-header h1 { font-family: 'Lora', serif; font-size: 20px; font-weight: 600; color: var(--text); line-height: 1.2; }
  .left-body {
    padding: 18px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px;
    scrollbar-width: thin; scrollbar-color: var(--border) transparent;
  }
  .left-body::-webkit-scrollbar { width: 3px; }
  .left-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* FILE TABS */
  .file-tabs-section .section-label,
  .doc-history .section-label,
  .doc-stats .section-label,
  .suggested-qs .section-label,
  .summary-section .section-label {
    font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px;
  }
  .file-tabs { display: flex; flex-direction: column; gap: 5px; }
  .file-tab {
    display: flex; align-items: center; gap: 8px; padding: 8px 10px;
    background: var(--surface2); border: 1px solid var(--border); border-radius: 7px; cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }
  .file-tab:hover { border-color: rgba(200,169,126,0.4); background: var(--surface3); }
  .file-tab.active { border-color: var(--accent); background: rgba(200,169,126,0.08); }
  .file-tab-icon { font-size: 13px; flex-shrink: 0; }
  .file-tab-meta { flex: 1; min-width: 0; }
  .file-tab-name { font-size: 11px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 1px; }
  .file-tab-size { font-size: 9px; color: var(--muted); }
  .file-tab-del {
    background: none; border: none; color: var(--muted); cursor: pointer;
    font-size: 13px; padding: 2px 4px; border-radius: 4px; transition: color 0.15s; line-height: 1;
  }
  .file-tab-del:hover { color: var(--danger); }

  /* UPLOAD ZONE */
  .upload-zone {
    border: 1.5px dashed var(--border); border-radius: 10px; padding: 20px 14px;
    text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s;
    position: relative; overflow: hidden;
  }
  .upload-zone:hover, .upload-zone.drag-over { border-color: var(--accent); background: rgba(200,169,126,0.04); }
  .upload-zone input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .upload-icon { font-size: 24px; margin-bottom: 8px; display: block; line-height: 1; }
  .upload-zone .upload-label { font-size: 11px; color: var(--muted); line-height: 1.6; }
  .upload-zone .file-name { font-size: 11px; color: var(--accent); margin-top: 8px; font-weight: 500; word-break: break-all; }

  .btn-upload {
    width: 100%; padding: 11px; background: var(--accent); color: #fff; border: none;
    border-radius: 8px; font-family: 'Inter', monospace; font-size: 11px; font-weight: 500;
    letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; transition: opacity 0.2s, transform 0.1s;
  }
  .btn-upload:hover { opacity: 0.88; }
  .btn-upload:active { transform: scale(0.98); }
  .btn-upload:disabled { opacity: 0.35; cursor: not-allowed; }

  /* SUMMARY */
  .summary-box {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 14px;
    font-family: 'Lora', serif; font-size: calc(var(--fs-base) - 1px);
    line-height: 1.75; color: var(--text); min-height: 70px; transition: background 0.25s;
  }
  .summary-box.empty { color: var(--muted); font-style: italic; }

  /* DOC STATS */
  .doc-stats { background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 13px; }
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
  .stat-item { display: flex; flex-direction: column; gap: 2px; }
  .stat-value { font-size: 15px; font-weight: 500; color: var(--accent); line-height: 1; }
  .stat-key { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }

  /* DOCUMENT HISTORY */
  .history-list { display: flex; flex-direction: column; gap: 5px; }
  .history-item {
    display: flex; align-items: center; gap: 9px; padding: 8px 10px;
    background: var(--surface2); border: 1px solid var(--border); border-radius: 7px;
    cursor: pointer; transition: border-color 0.15s, background 0.15s;
  }
  .history-item:hover { border-color: rgba(200,169,126,0.35); background: var(--surface3); }
  .history-item.active { border-color: var(--accent); background: rgba(200,169,126,0.07); }
  .history-icon { font-size: 13px; flex-shrink: 0; }
  .history-meta { flex: 1; min-width: 0; }
  .history-name { font-size: 11px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
  .history-date { font-size: 9px; color: var(--muted); }
  .history-del {
    background: none; border: none; color: var(--muted); cursor: pointer;
    font-size: 13px; padding: 2px 4px; border-radius: 4px; transition: color 0.15s; flex-shrink: 0; line-height: 1;
  }
  .history-del:hover { color: var(--danger); }

  /* SUGGESTED QUESTIONS */
  .sq-list { display: flex; flex-direction: column; gap: 5px; }
  .sq-btn {
    text-align: left; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 7px; padding: 9px 11px; cursor: pointer;
    font-family: 'Inter', monospace; font-size: 11px; color: var(--muted);
    transition: border-color 0.15s, color 0.15s, background 0.15s; line-height: 1.45;
  }
  .sq-btn:hover { border-color: var(--accent2); color: var(--text); background: var(--surface3); }
  .sq-btn::before { content: '→ '; color: var(--accent2); }
  .sq-loading { font-size: 11px; color: var(--muted); font-style: italic; padding: 4px 0; }

  /* RIGHT PANEL */
  .right {
    flex: 1; display: flex; flex-direction: column; background: var(--bg);
    position: relative; overflow: hidden; transition: background 0.25s;
  }
  .right::before {
    content: ''; position: absolute; right: -120px; width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(126,159,200,0.05) 0%, transparent 70%); pointer-events: none;
  }

  /* CHAT HEADER */
  .chat-header {
    padding: 12px 22px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    background: var(--surface); transition: background 0.25s;
  }
  .chat-header .dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--accent2); box-shadow: 0 0 7px var(--accent2); flex-shrink: 0;
  }
  .chat-header .title { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); flex: 1; }
  .header-actions { display: flex; gap: 5px; align-items: center; flex-wrap: wrap; }
  .icon-btn {
    background: none; border: 1px solid transparent; border-radius: 6px; color: var(--muted);
    cursor: pointer; padding: 5px 8px; font-family: 'Inter', monospace; font-size: 10px;
    letter-spacing: 0.07em; transition: color 0.15s, border-color 0.15s, background 0.15s;
    display: flex; align-items: center; gap: 4px; line-height: 1; white-space: nowrap;
  }
  .icon-btn:hover { color: var(--text); border-color: var(--border); background: var(--surface2); }
  .icon-btn.active { color: var(--accent); border-color: var(--accent); background: rgba(200,169,126,0.08); }
  .icon-btn.danger:hover { color: var(--danger); border-color: rgba(200,126,126,0.3); background: rgba(200,126,126,0.07); }

  /* SEARCH BAR */
  .search-bar {
    padding: 9px 22px; border-bottom: 1px solid var(--border);
    background: var(--surface); display: flex; align-items: center; gap: 9px;
  }
  .search-bar input {
    flex: 1; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 7px; padding: 7px 12px; color: var(--text);
    font-family: 'Inter', monospace; font-size: 12px; outline: none; transition: border-color 0.2s;
  }
  .search-bar input:focus { border-color: rgba(200,169,126,0.5); }
  .search-bar input::placeholder { color: var(--muted); }
  .search-nav { display: flex; gap: 4px; }
  .search-nav button {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 5px;
    color: var(--muted); cursor: pointer; padding: 4px 8px; font-size: 12px;
    transition: color 0.15s, background 0.15s;
  }
  .search-nav button:hover { color: var(--text); background: var(--surface3); }
  .search-count { font-size: 10px; color: var(--muted); white-space: nowrap; min-width: 54px; }

  /* MESSAGES */
  .messages {
    flex: 1; overflow-y: auto; padding: 24px 24px 16px;
    display: flex; flex-direction: column; gap: 14px;
    scrollbar-width: thin; scrollbar-color: var(--border) transparent;
  }
  .messages::-webkit-scrollbar { width: 4px; }
  .messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  .empty-state {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: var(--muted); gap: 10px; font-family: 'Lora', serif; font-style: italic;
  }
  .empty-state .big-icon { font-size: 44px; opacity: 0.3; }
  .empty-state p { font-size: 13px; }

  .message-row { display: flex; animation: fadeUp 0.22s ease; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
  .message-row.user { justify-content: flex-end; }
  .message-row.bot  { justify-content: flex-start; }

  .bubble-wrap { max-width: 70%; display: flex; flex-direction: column; gap: 4px; }
  .message-row.user .bubble-wrap { align-items: flex-end; }
  .message-row.bot  .bubble-wrap { align-items: flex-start; }

  .bubble { padding: 12px 15px; border-radius: 12px; font-size: var(--fs-base); line-height: 1.65; width: 100%; }
  .message-row.user .bubble {
    background: var(--user-bubble); border: 1px solid rgba(126,159,200,0.2);
    border-bottom-right-radius: 3px; color: var(--text); font-family: 'Inter', monospace;
  }
  .message-row.bot .bubble {
    background: var(--bot-bubble); border: 1px solid var(--border);
    border-bottom-left-radius: 3px; color: var(--text); font-family: 'Lora', serif; transition: background 0.25s;
  }
  .bubble-label { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin-bottom: 5px; font-family: 'Inter', monospace; }
  .bubble-timestamp { font-size: 9px; color: var(--muted); font-family: 'DM Mono', monospace; letter-spacing: 0.05em; margin-top: 6px; }

  /* Document quote highlight */
  .doc-quote {
    display: block; margin: 7px 0 3px;
    background: var(--quote-bg); border-left: 2px solid var(--quote-border);
    padding: 6px 10px; border-radius: 0 6px 6px 0;
    font-size: calc(var(--fs-base) - 1px); color: var(--accent2);
    font-style: italic; font-family: 'Lora', serif; line-height: 1.6;
  }

  /* Search highlights */
  mark.hl { background: var(--search-hl); border-radius: 2px; padding: 0 1px; color: inherit; }
  mark.hl.active { background: var(--search-hl-active); }

  /* Bubble action row */
  .bubble-actions { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }
  .copy-btn, .regen-btn, .fb-btn {
    background: none; border: none; cursor: pointer; color: var(--muted); font-size: 10px;
    padding: 3px 6px; border-radius: 5px; font-family: 'DM Mono', monospace; letter-spacing: 0.06em;
    transition: color 0.15s, background 0.15s; line-height: 1; display: flex; align-items: center; gap: 3px;
  }
  .copy-btn:hover { color: var(--accent); background: rgba(200,169,126,0.09); }
  .copy-btn.copied { color: var(--success); }
  .regen-btn:hover { color: var(--accent2); background: rgba(126,159,200,0.09); }
  .regen-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .fb-btn.up:hover, .fb-btn.up.active   { color: var(--success); background: rgba(126,200,160,0.1); }
  .fb-btn.down:hover, .fb-btn.down.active { color: var(--danger); background: rgba(200,126,126,0.1); }
  .fb-sep { color: var(--border); font-size: 10px; user-select: none; padding: 0 1px; }

  /* TYPING */
  .typing {
    display: flex; gap: 5px; padding: 14px 15px; background: var(--bot-bubble);
    border: 1px solid var(--border); border-radius: 12px; border-bottom-left-radius: 3px; width: fit-content;
  }
  .typing span { width: 5px; height: 5px; border-radius: 50%; background: var(--muted); animation: bounce 1.2s infinite; }
  .typing span:nth-child(2) { animation-delay: 0.2s; }
  .typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
    30% { transform: translateY(-5px); opacity: 1; }
  }

  /* INPUT AREA */
  .input-area {
    padding: 12px 22px 16px; border-top: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 6px;
    background: var(--surface); transition: background 0.25s;
  }
  .input-row { display: flex; gap: 9px; align-items: flex-end; }
  .input-wrapper {
    flex: 1; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 10px; transition: border-color 0.2s; overflow: hidden;
  }
  .input-wrapper:focus-within { border-color: rgba(200,169,126,0.5); }
  .input-wrapper textarea {
    width: 100%; background: transparent; border: none; outline: none;
    padding: 11px 14px; color: var(--text); font-family: 'Inter', monospace;
    font-size: var(--fs-base); resize: none; max-height: 110px; line-height: 1.5;
  }
  .input-wrapper textarea::placeholder { color: var(--muted); }
  .input-meta { display: flex; justify-content: flex-end; padding: 0 2px; }
  .char-count { font-size: 10px; color: var(--muted); font-family: 'Inter', monospace; letter-spacing: 0.05em; transition: color 0.15s; }
  .char-count.warn { color: #c8a030; }
  .char-count.over { color: var(--danger); }

  .btn-send {
    width: 42px; height: 42px; border-radius: 10px; background: var(--accent); border: none;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: opacity 0.2s, transform 0.1s;
  }
  .btn-send:hover { opacity: 0.85; }
  .btn-send:active { transform: scale(0.95); }
  .btn-send:disabled { opacity: 0.3; cursor: not-allowed; }
  .btn-send svg { width: 17px; height: 17px; color: #fff; }

  /* LOADING BAR */
  .loading-bar {
    position: absolute; top: 0; left: 0; right: 0; height: 2px; z-index: 10;
    background: linear-gradient(90deg, transparent, var(--accent), var(--accent2), transparent);
    background-size: 200% 100%; animation: shimmer 1.2s infinite;
  }
  @keyframes shimmer { 0% { background-position: -100% 0; } 100% { background-position: 200% 0; } }

  /* MODALS */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.55);
    backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;
    z-index: 100; animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
    padding: 26px; width: 480px; max-width: 92vw; max-height: 82vh;
    overflow-y: auto; animation: slideUp 0.18s ease;
  }
  @keyframes slideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  .modal-title { font-family: 'Lora', serif; font-size: 16px; font-weight: 600; color: var(--text); }
  .modal-close { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 20px; line-height: 1; padding: 2px 6px; border-radius: 5px; transition: color 0.15s; }
  .modal-close:hover { color: var(--text); }

  .shortcuts-table { width: 100%; border-collapse: collapse; }
  .shortcuts-table tr { border-bottom: 1px solid var(--border); }
  .shortcuts-table tr:last-child { border-bottom: none; }
  .shortcuts-table td { padding: 9px 4px; font-size: 12px; color: var(--muted); }
  .shortcuts-table td:first-child { color: var(--text); }
  .kbd { display: inline-block; background: var(--surface2); border: 1px solid var(--border); border-radius: 4px; padding: 1px 6px; font-size: 10px; color: var(--accent); font-family: 'Inter', monospace; margin: 0 1px; }

  .export-options { display: flex; flex-direction: column; gap: 9px; }
  .export-btn {
    display: flex; align-items: center; gap: 12px; padding: 13px 15px;
    background: var(--surface2); border: 1px solid var(--border); border-radius: 9px;
    cursor: pointer; transition: border-color 0.15s, background 0.15s; text-align: left; width: 100%;
  }
  .export-btn:hover { border-color: var(--accent); background: var(--surface3); }
  .export-btn-icon { font-size: 20px; }
  .export-btn-meta { display: flex; flex-direction: column; gap: 2px; }
  .export-btn-title { font-size: 12px; color: var(--text); font-family: 'Inter', monospace; font-weight: 500; }
  .export-btn-desc { font-size: 10px; color: var(--muted); font-family: 'Inter', monospace; }

  .confirm-body { font-size: 13px; color: var(--muted); margin-bottom: 20px; line-height: 1.65; font-family: 'Lora', serif; font-style: italic; }
  .confirm-actions { display: flex; gap: 9px; justify-content: flex-end; }
  .btn-sm { padding: 8px 16px; border-radius: 7px; font-family: 'Inter', monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: opacity 0.15s; border: none; }
  .btn-sm:hover { opacity: 0.8; }
  .btn-ghost { background: var(--surface2); border: 1px solid var(--border) !important; color: var(--muted); }
  .btn-danger { background: var(--danger); color: #fff; }

  /* SETTINGS */
  .settings-section { margin-bottom: 22px; }
  .settings-section:last-child { margin-bottom: 0; }
  .settings-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
  .theme-toggle { display: flex; gap: 6px; }
  .theme-opt {
    flex: 1; padding: 9px 10px; border-radius: 7px; cursor: pointer;
    font-family: 'Inter', monospace; font-size: 11px; letter-spacing: 0.06em;
    background: var(--surface2); border: 1px solid var(--border); color: var(--muted);
    transition: all 0.15s; text-align: center;
  }
  .theme-opt.active { border-color: var(--accent); color: var(--accent); background: rgba(200,169,126,0.08); }
  .fs-row { display: flex; align-items: center; gap: 12px; }
  .fs-slider { -webkit-appearance: none; appearance: none; flex: 1; height: 4px; border-radius: 2px; background: var(--border); outline: none; }
  .fs-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--accent); cursor: pointer; }
  .fs-value { font-size: 12px; color: var(--accent); min-width: 30px; text-align: right; }

  /* TOAST */
  .toast {
    position: fixed; bottom: 24px; right: 24px; background: var(--surface);
    border: 1px solid var(--accent); border-radius: 8px; padding: 10px 16px;
    font-size: 11px; color: var(--accent); font-family: 'Inter', monospace;
    letter-spacing: 0.06em; z-index: 200; animation: toastIn 0.18s ease;
    display: flex; align-items: center; gap: 7px;
  }
  @keyframes toastIn { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
`;

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
function formatFileSize(b) {
  if (!b) return "—";
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}
function formatDate(ts) {
  return new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
function getFileIcon(name) {
  if (!name) return "📄";
  const ext = name.split(".").pop().toLowerCase();
  return { pdf: "📕", txt: "📃", doc: "📘", docx: "📘" }[ext] || "📄";
}
function computeStats(text) {
  if (!text) return null;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const sentences = (text.match(/[.!?]+/g) || []).length || 1;
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length || 1;
  const readTimeSec = Math.round((words / 200) * 60);
  const readTime = readTimeSec < 60 ? `${readTimeSec}s` : `${Math.round(readTimeSec / 60)}m`;
  return { words, chars, sentences, paragraphs, readTime };
}

// Render bot text: detect >-prefixed quote lines and long inline "quoted" strings
function renderBotText(text) {
  const lines = text.split("\n");
  const parts = [];
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith(">")) {
      parts.push(<span key={`q${i}`} className="doc-quote">{trimmed.slice(1).trim()}</span>);
    } else {
      const segments = line.split(/("(?:[^"]{12,})")/g);
      if (segments.length > 1) {
        segments.forEach((seg, j) => {
          if (seg.startsWith('"') && seg.endsWith('"') && seg.length > 14) {
            parts.push(<span key={`${i}-${j}`} className="doc-quote">{seg.slice(1, -1)}</span>);
          } else if (seg) {
            parts.push(<span key={`${i}-${j}`}>{seg}</span>);
          }
        });
      } else {
        parts.push(<span key={`t${i}`}>{line}</span>);
      }
      if (i < lines.length - 1) parts.push(<br key={`br${i}`} />);
    }
  });
  return parts;
}

// Highlight search query inside text node
function highlightText(text, query, activeGlobalIdx, msgMatchOffsets) {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = [];
  let last = 0, localIdx = 0;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={last}>{text.slice(last, m.index)}</span>);
    const globalIdx = msgMatchOffsets?.[localIdx] ?? localIdx;
    parts.push(
      <mark key={m.index} className={`hl${globalIdx === activeGlobalIdx ? " active" : ""}`}>{m[0]}</mark>
    );
    localIdx++;
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={`end${last}`}>{text.slice(last)}</span>);
  return parts;
}

const CHAR_LIMIT = 2000;

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast">✓ {msg}</div>;
}

function ShortcutsModal({ onClose }) {
  const rows = [
    ["Send message",       [["Enter"]]],
    ["New line",           [["Shift","Enter"]]],
    ["Search chat",        [["Ctrl","F"]]],
    ["Clear chat",         [["Ctrl","Shift","K"]]],
    ["Export chat",        [["Ctrl","Shift","E"]]],
    ["Keyboard shortcuts", [["Ctrl","/"]]],
    ["Settings",           [["Ctrl",","]]],
    ["Focus input",        [["Ctrl","L"]]],
    ["Copy last reply",    [["Ctrl","Shift","C"]]],
  ];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Keyboard Shortcuts</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <table className="shortcuts-table"><tbody>
          {rows.map(([action, keys]) => (
            <tr key={action}>
              <td>{action}</td>
              <td style={{ textAlign:"right" }}>
                {keys.map((combo, i) => (
                  <span key={i}>
                    {combo.map((k, j) => (
                      <span key={j}>
                        <span className="kbd">{k}</span>
                        {j < combo.length-1 && <span style={{fontSize:9,color:"var(--muted)"}}>+</span>}
                      </span>
                    ))}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}

function ExportModal({ chat, onClose, onToast }) {
  const exportText = () => {
    const lines = chat.map(m =>
      `[${m.role === "user" ? "You" : "Assistant"} — ${formatTime(m.ts)}]\n${m.text}`
    ).join("\n\n---\n\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines], { type: "text/plain" }));
    a.download = `docreader-${Date.now()}.txt`; a.click();
    onToast("Exported as plain text"); onClose();
  };
  const exportHTML = () => {
    const rows = chat.map(m => `
      <div class="msg">
        <div class="role ${m.role}">${m.role === "user" ? "You" : "Assistant"} · ${formatTime(m.ts)}</div>
        <div class="text">${m.text.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br>")}</div>
      </div><hr>`).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
      body{font-family:Georgia,serif;max-width:700px;margin:40px auto;color:#222;line-height:1.7}
      h1{font-size:20px;margin-bottom:4px}.meta{color:#888;font-size:12px;margin-bottom:28px}
      .msg{margin-bottom:20px}.role{font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:#999;margin-bottom:4px}
      .role.user{color:#3a6fa0}.role.bot{color:#a0783a}.text{font-size:14px}
      hr{border:none;border-top:1px solid #eee;margin:16px 0}
    </style></head><body>
    <h1>DocReader — Chat Export</h1>
    <div class="meta">Exported ${new Date().toLocaleString()}</div>${rows}</body></html>`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = `docreader-${Date.now()}.html`; a.click();
    onToast("Exported — open in browser, print to PDF"); onClose();
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Export Chat</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="export-options">
          <button className="export-btn" onClick={exportText}>
            <span className="export-btn-icon">📄</span>
            <div className="export-btn-meta">
              <span className="export-btn-title">Plain Text (.txt)</span>
              <span className="export-btn-desc">Clean readable transcript with timestamps</span>
            </div>
          </button>
          <button className="export-btn" onClick={exportHTML}>
            <span className="export-btn-icon">🖨️</span>
            <div className="export-btn-meta">
              <span className="export-btn-title">HTML / Print as PDF</span>
              <span className="export-btn-desc">Styled document — open in browser, print to PDF</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmClearModal({ onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width:360 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Clear Chat</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="confirm-body">This will permanently delete all messages. This cannot be undone.</div>
        <div className="confirm-actions">
          <button className="btn-sm btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-sm btn-danger" onClick={onConfirm}>Clear All</button>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({ fontSize, setFontSize, theme, setTheme, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width:380 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Settings</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="settings-section">
          <div className="settings-label">Theme</div>
          <div className="theme-toggle">
            <button className={`theme-opt ${theme==="dark"?"active":""}`} onClick={()=>setTheme("dark")}>🌙 Dark</button>
            <button className={`theme-opt ${theme==="light"?"active":""}`} onClick={()=>setTheme("light")}>☀️ Light</button>
          </div>
        </div>
        <div className="settings-section">
          <div className="settings-label">Font Size</div>
          <div className="fs-row">
            <input className="fs-slider" type="range" min={11} max={18} step={1}
              value={fontSize} onChange={e => setFontSize(Number(e.target.value))} />
            <span className="fs-value">{fontSize}px</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [pendingFile, setPendingFile]   = useState(null);
  const [openFiles, setOpenFiles]       = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [question, setQuestion]         = useState("");
  const [chat, setChat]                 = useState([]);
  const [loading, setLoading]           = useState(false);
  const [typing, setTyping]             = useState(false);
  const [dragOver, setDragOver]         = useState(false);

  const [docHistory, setDocHistory]     = useState([]);
  const [suggestedQs, setSuggestedQs]   = useState([]);
  const [sqLoading, setSqLoading]       = useState(false);
  const [copiedId, setCopiedId]         = useState(null);
  const [toast, setToast]               = useState(null);
  const [modal, setModal]               = useState(null);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [searchActive, setSearchActive] = useState(0);
  const [fontSize, setFontSize]         = useState(13);
  const [theme, setTheme]               = useState("dark");

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);
  const searchRef      = useRef(null);
  const msgRefs        = useRef({});

  const activeFile = openFiles.find(f => f.id === activeFileId) || null;
  const summary    = activeFile?.summary || "";
  const docStats   = activeFile?.stats   || null;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chat, typing]);

  useEffect(() => {
    const ta = textareaRef.current; if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 110) + "px";
  }, [question]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  // ── Search results ────────────────────────
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    const matches = [];
    chat.forEach((msg, msgIdx) => {
      let pos = 0, text = msg.text.toLowerCase();
      while ((pos = text.indexOf(q, pos)) !== -1) { matches.push({ msgIdx, charPos: pos }); pos += q.length; }
    });
    return matches;
  }, [chat, searchQuery]);

  useEffect(() => {
    if (!searchResults.length) return;
    const r = searchResults[searchActive % searchResults.length];
    if (r) msgRefs.current[r.msgIdx]?.scrollIntoView({ behavior:"smooth", block:"center" });
  }, [searchActive, searchResults]);

  // Per-message global match offset map
  const msgMatchMap = useMemo(() => {
    if (!searchQuery.trim()) return {};
    const map = {}; let g = 0;
    const q = searchQuery.trim().toLowerCase();
    chat.forEach((msg, msgIdx) => {
      let pos = 0, text = msg.text.toLowerCase(), offsets = [];
      while ((pos = text.indexOf(q, pos)) !== -1) { offsets.push(g++); pos += q.length; }
      if (offsets.length) map[msgIdx] = offsets;
    });
    return map;
  }, [chat, searchQuery]);

  // ── Keyboard shortcuts ────────────────────
  useEffect(() => {
    const h = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key.toLowerCase() === "f")                          { e.preventDefault(); setSearchOpen(v => !v); }
      if (ctrl && e.shiftKey && e.key.toLowerCase() === "k")           { e.preventDefault(); setModal("clear"); }
      if (ctrl && e.shiftKey && e.key.toLowerCase() === "e")           { e.preventDefault(); if (chat.length > 0) setModal("export"); }
      if (ctrl && e.key === "/")                                        { e.preventDefault(); setModal("shortcuts"); }
      if (ctrl && e.key === ",")                                        { e.preventDefault(); setModal("settings"); }
      if (ctrl && e.key.toLowerCase() === "l")                         { e.preventDefault(); textareaRef.current?.focus(); }
      if (ctrl && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        const last = [...chat].reverse().find(m => m.role === "bot");
        if (last) { navigator.clipboard.writeText(last.text); showToast("Copied last reply"); }
      }
      if (e.key === "Escape") { setSearchOpen(false); setModal(null); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [chat]);

  const showToast = (msg) => setToast(msg);

  // ── File upload ───────────────────────────
  const handlePendingFile = (f) => { if (f) setPendingFile(f); };

  const uploadFile = async () => {
    if (!pendingFile) return;
    const formData = new FormData();
    formData.append("file", pendingFile);
    try {
      setLoading(true);
      const res = await axios.post("http://127.0.0.1:8000/upload/", formData);
      const newSummary = res.data.summary;
      const stats = computeStats(newSummary);
      const entry = { id: Date.now(), name: pendingFile.name, size: pendingFile.size, summary: newSummary, stats };
      setOpenFiles(prev => {
        const dupe = prev.find(f => f.name === entry.name);
        return dupe ? prev.map(f => f.name === entry.name ? { ...entry, id: f.id } : f) : [...prev, entry];
      });
      setActiveFileId(entry.id);
      setDocHistory(prev => [{ ...entry, date: Date.now() }, ...prev.slice(0, 9)]);
      setPendingFile(null);
      fetchSuggestions(newSummary);
    } catch { alert("Upload failed"); }
    finally { setLoading(false); }
  };

  const fetchSuggestions = async (summaryText) => {
    setSqLoading(true); setSuggestedQs([]);
    try {
      const res = await axios.post("http://127.0.0.1:8000/suggest/", { summary: summaryText });
      setSuggestedQs(res.data.questions || []);
    } catch {
      setSuggestedQs([
        "What is the main topic of this document?",
        "What are the key conclusions or findings?",
        "Can you summarise the most important points?",
        "Are there any notable data or statistics mentioned?",
      ]);
    } finally { setSqLoading(false); }
  };

  const closeFile = (id, e) => {
    e.stopPropagation();
    setOpenFiles(prev => prev.filter(f => f.id !== id));
    if (activeFileId === id) setActiveFileId(openFiles.find(f => f.id !== id)?.id || null);
  };

  const loadFromHistory = (entry) => {
    const existing = openFiles.find(f => f.name === entry.name);
    if (existing) { setActiveFileId(existing.id); return; }
    setOpenFiles(prev => [...prev, entry]);
    setActiveFileId(entry.id);
    fetchSuggestions(entry.summary);
  };

  // ── Chat ──────────────────────────────────
  const sendQuestion = async (text) => {
    const q = (text || question).trim();
    if (!q) return;
    setChat(p => [...p, { id: Date.now(), role:"user", text:q, ts:Date.now() }]);
    setQuestion("");
    setTyping(true);
    try {
      setLoading(true);
      const res = await axios.post("http://127.0.0.1:8000/chat/", q, { headers:{ "Content-Type":"application/json" } });
      setTyping(false);
      setChat(p => [...p, { id: Date.now(), role:"bot", text:res.data.answer, ts:Date.now(), feedback:null }]);
    } catch {
      setTyping(false);
      setChat(p => [...p, { id: Date.now(), role:"bot", text:"Something went wrong. Please try again.", ts:Date.now(), feedback:null }]);
    } finally { setLoading(false); }
  };

  const regenerate = async (botMsgId) => {
    const botIdx = chat.findIndex(m => m.id === botMsgId);
    if (botIdx <= 0) return;
    const userMsg = [...chat.slice(0, botIdx)].reverse().find(m => m.role === "user");
    if (!userMsg) return;
    setChat(p => p.filter(m => m.id !== botMsgId));
    await sendQuestion(userMsg.text);
  };

  const setFeedback = (msgId, value) => {
    setChat(p => p.map(m => m.id === msgId ? { ...m, feedback: m.feedback === value ? null : value } : m));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendQuestion(); }
  };

  const copyMessage = useCallback((text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id); setTimeout(() => setCopiedId(null), 1800);
    });
  }, []);

  const clearChat = () => { setChat([]); setModal(null); showToast("Chat cleared"); };

  const charCount = question.length;
  const charClass = charCount > CHAR_LIMIT ? "over" : charCount > CHAR_LIMIT * 0.85 ? "warn" : "";
  const activeResultIdx = searchResults.length > 0 ? searchActive % searchResults.length : 0;

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <>
      <style>{buildStyles(fontSize, theme)}</style>
      <div className="app">
        {loading && <div className="loading-bar" />}

        {/* ── LEFT ── */}
        <div className="left">
          <div className="left-header">
            <div className="label">DocReader</div>
            <h1>Document<br />Assistant</h1>
          </div>

          <div className="left-body">

            {/* Open File Tabs */}
            {openFiles.length > 0 && (
              <div className="file-tabs-section">
                <div className="section-label">Open Files</div>
                <div className="file-tabs">
                  {openFiles.map(f => (
                    <div key={f.id}
                      className={`file-tab ${activeFileId === f.id ? "active" : ""}`}
                      onClick={() => { setActiveFileId(f.id); fetchSuggestions(f.summary); }}
                    >
                      <span className="file-tab-icon">{getFileIcon(f.name)}</span>
                      <div className="file-tab-meta">
                        <div className="file-tab-name">{f.name}</div>
                        <div className="file-tab-size">{formatFileSize(f.size)}</div>
                      </div>
                      <button className="file-tab-del" onClick={(e) => closeFile(f.id, e)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload */}
            <div
              className={`upload-zone ${dragOver ? "drag-over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handlePendingFile(e.dataTransfer.files[0]); }}
            >
              <input type="file" onChange={(e) => handlePendingFile(e.target.files[0])} accept=".pdf,.txt,.doc,.docx" />
              <span className="upload-icon">📂</span>
              <div className="upload-label">Drop file here or click to browse</div>
              {pendingFile && <div className="file-name">↳ {pendingFile.name}</div>}
            </div>
            <button className="btn-upload" onClick={uploadFile} disabled={!pendingFile || loading}>
              {loading ? "Processing…" : "Upload & Analyse"}
            </button>

            {/* Stats */}
            {docStats && (
              <div className="doc-stats">
                <div className="section-label">Stats · {activeFile?.name}</div>
                <div className="stats-grid">
                  {[["Words", docStats.words?.toLocaleString()], ["Chars", docStats.chars?.toLocaleString()],
                    ["Sentences", docStats.sentences], ["Paragraphs", docStats.paragraphs],
                    ["Read time", docStats.readTime], ["Size", formatFileSize(activeFile?.size)]].map(([k, v]) => (
                    <div className="stat-item" key={k}>
                      <span className="stat-value">{v ?? "—"}</span>
                      <span className="stat-key">{k}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="summary-section">
              <div className="section-label">Summary</div>
              <div className={`summary-box ${!summary ? "empty" : ""}`}>
                {summary || "Upload a document to see its summary here."}
              </div>
            </div>

            {/* Suggested Questions */}
            {(sqLoading || suggestedQs.length > 0) && (
              <div className="suggested-qs">
                <div className="section-label">Suggested Questions</div>
                {sqLoading
                  ? <div className="sq-loading">Generating suggestions…</div>
                  : <div className="sq-list">
                      {suggestedQs.map((q, i) => (
                        <button key={i} className="sq-btn" onClick={() => sendQuestion(q)}>{q}</button>
                      ))}
                    </div>
                }
              </div>
            )}

            {/* Document History */}
            {docHistory.length > 0 && (
              <div className="doc-history">
                <div className="section-label">History</div>
                <div className="history-list">
                  {docHistory.map(entry => (
                    <div key={entry.id}
                      className={`history-item ${activeFileId === entry.id ? "active" : ""}`}
                      onClick={() => loadFromHistory(entry)}
                    >
                      <span className="history-icon">{getFileIcon(entry.name)}</span>
                      <div className="history-meta">
                        <div className="history-name">{entry.name}</div>
                        <div className="history-date">{formatDate(entry.date)}</div>
                      </div>
                      <button className="history-del"
                        onClick={(e) => { e.stopPropagation(); setDocHistory(p => p.filter(h => h.id !== entry.id)); }}
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="right">

          {/* Header */}
          <div className="chat-header">
            <div className="dot" />
            <span className="title">{activeFile ? `Chatting · ${activeFile.name}` : "Chat with document"}</span>
            <div className="header-actions">
              <button className={`icon-btn ${searchOpen ? "active" : ""}`}
                onClick={() => setSearchOpen(v => !v)} title="Search (Ctrl+F)">🔍 Search</button>
              <button className="icon-btn" onClick={() => setModal("shortcuts")} title="Shortcuts (Ctrl+/)">⌨ Keys</button>
              <button className="icon-btn" onClick={() => setModal("settings")} title="Settings (Ctrl+,)">⚙ Settings</button>
              <button className="icon-btn" onClick={() => chat.length > 0 && setModal("export")}
                style={{ opacity: chat.length === 0 ? 0.35 : 1 }} title="Export (Ctrl+Shift+E)">↓ Export</button>
              <button className="icon-btn danger" onClick={() => chat.length > 0 && setModal("clear")}
                style={{ opacity: chat.length === 0 ? 0.35 : 1 }} title="Clear (Ctrl+Shift+K)">⌫ Clear</button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="search-bar">
              <input
                ref={searchRef}
                placeholder="Search messages…"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchActive(0); }}
                onKeyDown={e => {
                  if (e.key === "Enter") setSearchActive(v => (v + 1) % Math.max(searchResults.length, 1));
                  if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
                }}
              />
              <div className="search-nav">
                <button onClick={() => setSearchActive(v => (v - 1 + Math.max(searchResults.length, 1)) % Math.max(searchResults.length, 1))}>↑</button>
                <button onClick={() => setSearchActive(v => (v + 1) % Math.max(searchResults.length, 1))}>↓</button>
              </div>
              <span className="search-count">
                {searchQuery
                  ? searchResults.length > 0 ? `${activeResultIdx + 1} / ${searchResults.length}` : "0 results"
                  : ""}
              </span>
              <button className="icon-btn" onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>✕</button>
            </div>
          )}

          {/* Messages */}
          <div className="messages">
            {chat.length === 0 && !typing ? (
              <div className="empty-state">
                <span className="big-icon">💬</span>
                <p>Upload a document, then ask anything about it.</p>
              </div>
            ) : (
              <>
                {chat.map((msg, i) => {
                  const matchOffsets = msgMatchMap[i] || [];
                  const renderedText = searchQuery.trim()
                    ? highlightText(msg.text, searchQuery, activeResultIdx, matchOffsets)
                    : (msg.role === "bot" ? renderBotText(msg.text) : msg.text);

                  return (
                    <div key={msg.id} className={`message-row ${msg.role}`}
                      ref={el => msgRefs.current[i] = el}>
                      <div className="bubble-wrap">
                        <div className="bubble">
                          <div className="bubble-label">{msg.role === "user" ? "You" : "Assistant"}</div>
                          {renderedText}
                          <div className="bubble-timestamp">{formatTime(msg.ts)}</div>
                        </div>

                        <div className="bubble-actions">
                          <button
                            className={`copy-btn ${copiedId === msg.id ? "copied" : ""}`}
                            onClick={() => copyMessage(msg.text, msg.id)}
                          >{copiedId === msg.id ? "✓ copied" : "⎘ copy"}</button>

                          {msg.role === "bot" && (
                            <>
                              <span className="fb-sep">·</span>
                              <button
                                className={`fb-btn up ${msg.feedback === "up" ? "active" : ""}`}
                                onClick={() => setFeedback(msg.id, "up")} title="Good response">👍</button>
                              <button
                                className={`fb-btn down ${msg.feedback === "down" ? "active" : ""}`}
                                onClick={() => setFeedback(msg.id, "down")} title="Poor response">👎</button>
                              <span className="fb-sep">·</span>
                              <button
                                className="regen-btn" onClick={() => regenerate(msg.id)}
                                disabled={loading} title="Regenerate">↺ regen</button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {typing && (
                  <div className="message-row bot">
                    <div className="typing"><span /><span /><span /></div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="input-area">
            <div className="input-row">
              <div className="input-wrapper">
                <textarea
                  ref={textareaRef} rows={1} value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about the document… (Enter to send)"
                  maxLength={CHAR_LIMIT + 200}
                />
              </div>
              <button className="btn-send" onClick={() => sendQuestion()} disabled={!question.trim() || loading}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <div className="input-meta">
              <span className={`char-count ${charClass}`}>
                {charCount > 0 ? `${charCount} / ${CHAR_LIMIT}` : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {modal === "shortcuts" && <ShortcutsModal onClose={() => setModal(null)} />}
      {modal === "export"    && <ExportModal chat={chat} onClose={() => setModal(null)} onToast={showToast} />}
      {modal === "clear"     && <ConfirmClearModal onConfirm={clearChat} onClose={() => setModal(null)} />}
      {modal === "settings"  && (
        <SettingsModal fontSize={fontSize} setFontSize={setFontSize}
          theme={theme} setTheme={setTheme} onClose={() => setModal(null)} />
      )}

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </>
  );
}