const $ = (id) => document.getElementById(id);

const FIELDS = [
  'startWithBrowser', 'notifyOnCapture', 'intervalMinutes',
  'captureMode', 'onlyActiveTab', 'skipPinnedTabs',
  'fullPageOverlap', 'fullPageMaxHeight',
  'format', 'jpegQuality', 'savePath', 'fileNamePattern'
];

async function load() {
  const { config } = await chrome.runtime.sendMessage({ action: 'getConfig' });
  for (const k of FIELDS) {
    const el = $(k);
    if (!el) continue;
    if (el.type === 'checkbox') el.checked = !!config[k];
    else el.value = config[k];
  }
}

async function save() {
  const cfg = {};
  for (const k of FIELDS) {
    const el = $(k);
    if (!el) continue;
    if (el.type === 'checkbox') cfg[k] = el.checked;
    else if (el.type === 'number') cfg[k] = parseInt(el.value, 10) || 0;
    else cfg[k] = el.value;
  }
  cfg.intervalMinutes = Math.max(1, cfg.intervalMinutes || 5);
  const { config: current } = await chrome.runtime.sendMessage({ action: 'getConfig' });
  await chrome.runtime.sendMessage({
    action: 'saveConfig',
    config: { ...current, ...cfg }
  });
  toast(msg('savedSettings'));
}

async function reset() {
  if (!confirm(msg('confirmReset'))) return;
  const defaults = {
    enabled: false, intervalMinutes: 5,
    captureMode: 'visible', format: 'png', jpegQuality: 92,
    fileNamePattern: '{domain}_{date}_{time}', savePath: '',
    onlyActiveTab: true, skipPinnedTabs: false,
    notifyOnCapture: false, startWithBrowser: false,
    fullPageOverlap: 0, fullPageMaxHeight: 30000,
    lastCaptureTime: 0
  };
  const { config: current } = await chrome.runtime.sendMessage({ action: 'getConfig' });
  await chrome.runtime.sendMessage({
    action: 'saveConfig',
    config: { ...current, ...defaults }
  });
  await load();
  toast(msg('restoredDefaults'));
}

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1600);
}

$('save').addEventListener('click', save);
$('reset').addEventListener('click', reset);
load();
