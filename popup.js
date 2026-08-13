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
  const { config } = await chrome.runtime.sendMessage({ action: 'getConfig' });
  currentConfig = config;
  applyUI(config);
  updateStatus(config);
}
function applyUI(cfg) {
  enabledEl.classList.toggle('on', !!cfg.enabled);
  dot.classList.toggle('on', !!cfg.enabled);
  intervalEl.value = cfg.intervalMinutes;
  modeEl.value = cfg.captureMode;
  formatEl.value = cfg.format;
}
function updateStatus(cfg) {
  stateText.textContent = cfg.enabled ? '✅ 运行中' : '⏸  未启动';
  lastTime.textContent = cfg.lastCaptureTime
    ? new Date(cfg.lastCaptureTime).toLocaleString('zh-CN')
    : '从未';
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

enabledEl.addEventListener('click', () => {
  enabledEl.classList.toggle('on');
  dot.classList.toggle('on');
  pushChange();
});
intervalEl.addEventListener('change', pushChange);
modeEl.addEventListener('change', pushChange);
formatEl.addEventListener('change', pushChange);

captureBtn.addEventListener('click', async () => {
  captureBtn.disabled = true;
  const isFull = modeEl.value === 'fullpage';
  const originalText = captureBtn.textContent;
  captureBtn.textContent = isFull ? '🖼  长图截取中...' : '截取中...';
  try {
    const r = await chrome.runtime.sendMessage({ action: 'captureNow' });
    if (r && !r.ok) throw new Error(r.error || '未知错误');
    currentConfig.lastCaptureTime = Date.now();
    updateStatus(currentConfig);
    captureBtn.textContent = '✓ 已保存';
    setTimeout(() => { captureBtn.textContent = originalText; }, 1500);
  } catch (e) {
    alert('❌ 截屏失败: ' + e.message + '\n\n请打开扩展页查看详细日志(chrome://extensions → 详情 → 检查视图)');
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
