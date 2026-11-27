// Client-side viewing mask. It keeps casual visitors out; it is not access control,
// because the page source is still public. Only a salted SHA-256 of the code is stored.
(() => {
  const HASH = '625d793b94c30a05641bfd5bbc9c4acf1207326c357c5dc3019a2e7fc4ace33b';
  const SALT = 'dennis-tw:';
  const KEY = 'dennis-gate';
  const root = document.documentElement;

  try {
    if (localStorage.getItem(KEY) === HASH) return;
  } catch {}

  root.setAttribute('data-gated', '');
  const style = document.createElement('style');
  style.textContent = `
html[data-gated] body > *:not(#dennis-gate) { visibility: hidden !important; }
html[data-gated], html[data-gated] body { overflow: hidden !important; }
#dennis-gate { position: fixed; inset: 0; z-index: 2147483647; display: grid; place-items: center;
  background: radial-gradient(circle at 50% 40%, #1b201d 0%, #0b0d0c 70%); color: #eef1ec;
  font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif; }
#dennis-gate form { width: min(360px, 86vw); text-align: center; }
#dennis-gate .g-mark { font: 800 15px/1 ui-monospace, Consolas, monospace; letter-spacing: .32em; color: #7fe0c8; }
#dennis-gate h1 { font-size: 30px; font-weight: 800; margin: 18px 0 8px; }
#dennis-gate p { margin: 0 0 28px; color: #8d9792; font-size: 15px; }
#dennis-gate input { width: 100%; box-sizing: border-box; padding: 16px 18px; border-radius: 10px;
  border: 1px solid rgba(238,241,236,.18); background: rgba(255,255,255,.04); color: inherit;
  font: 600 24px/1 ui-monospace, Consolas, monospace; letter-spacing: .5em; text-align: center; outline: none; }
#dennis-gate input:focus { border-color: #7fe0c8; box-shadow: 0 0 0 4px rgba(127,224,200,.15); }
#dennis-gate button { margin-top: 14px; width: 100%; padding: 14px; border: 0; border-radius: 10px;
  background: #7fe0c8; color: #0b0d0c; font: 800 16px/1 inherit; letter-spacing: .08em; cursor: pointer; }
#dennis-gate .g-err { min-height: 20px; margin-top: 12px; color: #ff8a7a; font-size: 14px; }
#dennis-gate.g-shake form { animation: g-shake .4s; }
@keyframes g-shake { 20%,60% { transform: translateX(-8px); } 40%,80% { transform: translateX(8px); } }
@media (prefers-reduced-motion: reduce) { #dennis-gate.g-shake form { animation: none; } }`;
  document.head.appendChild(style);

  const sha256 = async (text) => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
  };

  const mount = () => {
    const gate = document.createElement('div');
    gate.id = 'dennis-gate';
    gate.innerHTML = `<form autocomplete="off">
  <div class="g-mark">DENNIS-TW</div>
  <h1>請輸入密碼</h1>
  <p>Enter the password to continue</p>
  <input type="password" inputmode="numeric" aria-label="密碼 Password" autofocus>
  <button type="submit">進入 Enter</button>
  <div class="g-err" role="alert"></div>
</form>`;
    document.body.appendChild(gate);
    const form = gate.querySelector('form');
    const input = gate.querySelector('input');
    const err = gate.querySelector('.g-err');
    input.focus();
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if ((await sha256(SALT + input.value.trim())) === HASH) {
        try {
          localStorage.setItem(KEY, HASH);
        } catch {}
        root.removeAttribute('data-gated');
        gate.remove();
        style.remove();
        window.dispatchEvent(new Event('resize'));
        return;
      }
      err.textContent = '密碼錯誤 Incorrect password';
      input.value = '';
      gate.classList.remove('g-shake');
      void gate.offsetWidth;
      gate.classList.add('g-shake');
    });
  };

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
