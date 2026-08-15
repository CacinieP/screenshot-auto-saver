const $ = (id) => document.getElementById(id);

const enabledEl  = $('enabled');
const dot        = $('dot');
const intervalEl = $('interval');
const modeEl     = $('mode');
const formatEl   = $('format');
const stateText  = $('stateText');
const lastTime   = $('lastTime');
const captureBtn = $('captureNow');
const optsBtn    = $('openOptions');
const folderLink = $('openFolder');

let currentConfig = {};

async function load() {
  const r = await chrome.runtime.sendMessage({ action: 'getConfig' });
  if (!r || !r.ok || !r.config) return;
  const config = r.config;
  currentConfig = config;
  applyUI(config);
  updateStatus(config);
}
function applyUI(cfg) {
  enabledEl.classList.toggle('on', !!cfg.enabled);
  enabledEl.setAttribute('aria-checked', String(!!cfg.enabled));
  dot.classList.toggle('on', !!cfg.enabled);
  intervalEl.value = cfg.intervalMinutes;
  modeEl.value = cfg.captureMode;
  formatEl.value = cfg.format;
}
function updateStatus(cfg) {
  stateText.textContent = cfg.enabled ? msg('running') : msg('notStarted');
  lastTime.textContent = cfg.lastCaptureTime
    ? new Date(cfg.lastCaptureTime).toLocaleString(chrome.i18n.getUILanguage())
    : msg('never');
}
async function pushChange() {
  const cfg = {
    ...currentConfig,
    enabled: enabledEl.classList.contains('on'),
    intervalMinutes: Math.max(1, parseInt(intervalEl.value, 10) || 5),
    captureMode: modeEl.value,
    format: formatEl.value
  };
  await chrome.runtime.sendMessage({ action: 'saveConfig', config: cfg });
  currentConfig = cfg;
  applyUI(cfg);
  updateStatus(cfg);
}

function toggleEnabled() {
  enabledEl.classList.toggle('on');
  dot.classList.toggle('on');
  pushChange();
}

enabledEl.addEventListener('click', toggleEnabled);
enabledEl.addEventListener('keydown', (event) => {
  if (event.key !== ' ' && event.key !== 'Enter') return;
  event.preventDefault();
  toggleEnabled();
});
intervalEl.addEventListener('change', pushChange);
modeEl.addEventListener('change', pushChange);
formatEl.addEventListener('change', pushChange);

captureBtn.addEventListener('click', async () => {
  captureBtn.disabled = true;
  const isFull = modeEl.value === 'fullpage';
  const originalText = captureBtn.textContent;
  captureBtn.textContent = isFull ? msg('fullPageCapturing') : msg('capturing');
  try {
    const r = await chrome.runtime.sendMessage({ action: 'captureNow' });
    if (r && !r.ok) throw new Error(r.error || msg('unknownError'));
    currentConfig.lastCaptureTime = Date.now();
    updateStatus(currentConfig);
    captureBtn.textContent = msg('saved');
    setTimeout(() => { captureBtn.textContent = originalText; }, 1500);
  } catch (e) {
    alert(msg('captureFailed', e.message));
    captureBtn.textContent = originalText;
  } finally {
    captureBtn.disabled = false;
  }
});

optsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());
folderLink.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.downloads.showDefaultFolder();
});
load();
