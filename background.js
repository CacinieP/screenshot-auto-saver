/**
 * 网页自动截屏助手 - Background Service Worker
 *
 * 职责:
 *   - 调度定时截屏(基于 chrome.alarms)
 *   - 截屏:可见区域 / 全页面长图(滚动拼接)
 *   - 把图像保存为文件(chrome.downloads.download)
 *
 * 长图拼接实现:
 *   1. 让 content script 把页面滚动到不同 Y
 *   2. 每次用 chrome.tabs.captureVisibleTab 拿到该区域的 PNG
 *   3. 用 fetch(dataURL) -> createImageBitmap 解码
 *   4. 用 OffscreenCanvas 拼成一张大图
 *   5. blob -> FileReader.readAsDataURL(dataURL) -> chrome.downloads.download
 *      (不能用 URL.createObjectURL,SW 关闭时 URL 会失效)
 */

// =================== 配置 ===================

const DEFAULT_CONFIG = {
  enabled: false,
  intervalMinutes: 5,
  captureMode: 'visible',   // visible | fullpage
  format: 'png',            // png | jpeg | webp
  jpegQuality: 92,
  fileNamePattern: '{domain}_{date}_{time}',
  savePath: '',
  onlyActiveTab: true,
  skipPinnedTabs: false,
  notifyOnCapture: false,
  startWithBrowser: false,
  // 长图相关
  fullPageOverlap: 0,        // 片段重叠像素(0-200),用于对抗 fixed 元素
  fullPageMaxHeight: 30000,  // 单张最大像素高度,超出截顶部 30000
  lastCaptureTime: 0
};

async function getConfig() {
  const result = await chrome.storage.sync.get(DEFAULT_CONFIG);
  return { ...DEFAULT_CONFIG, ...result };
}
async function saveConfig(cfg) { await chrome.storage.sync.set(cfg); }

// =================== 定时器 ===================

async function setupAlarm() {
  const cfg = await getConfig();
  await chrome.alarms.clear('auto-capture');
  if (cfg.enabled) {
    const period = Math.max(cfg.intervalMinutes, 1);
    chrome.alarms.create('auto-capture', {
      delayInMinutes: period,
      periodInMinutes: period
    });
    console.log(`[AutoCapture] 定时器已启动,每 ${period} 分钟`);
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await setupAlarm();
});

chrome.runtime.onStartup.addListener(async () => {
  const cfg = await getConfig();
  if (cfg.startWithBrowser && cfg.enabled) setupAlarm();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'auto-capture') {
    await captureAllTargets();
  }
});

// =================== 调度入口 ===================

async function captureAllTargets() {
  const cfg = await getConfig();
  const tabs = await chrome.tabs.query({});
  const targets = tabs.filter(tab => {
    if (!tab.url || !tab.url.startsWith('http')) return false;
    if (cfg.onlyActiveTab) return tab.active;
    if (cfg.skipPinnedTabs && tab.pinned) return false;
    return true;
  });

  for (const tab of targets) {
    try {
      await captureTab(tab, cfg);
    } catch (err) {
      console.error(`[AutoCapture] 截取 ${tab.url} 失败:`, err);
    }
  }
  await saveConfig({ ...cfg, lastCaptureTime: Date.now() });
}

// =================== 截屏主流程 ===================

async function captureTab(tab, cfg) {
  // 确保 content script 已注入
  await ensureContentScript(tab.id);

  // 切到目标 tab(若不激活)
  if (!tab.active) {
    await chrome.tabs.update(tab.id, { active: true });
    await sleep(300);
  }

  if (cfg.captureMode === 'fullpage') {
    await captureFullPage(tab, cfg);
  } else {
    await captureVisible(tab, cfg);
  }

  if (cfg.notifyOnCapture) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '截屏已保存',
      message: tab.title || tab.url
    });
  }
}

/**
 * 确保 content script 已注入到 tab
 */
async function ensureContentScript(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { action: 'ping' });
  } catch {
    // 没注入就手动注入
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
    await sleep(100);
  }
}

/**
 * 可见区域截屏
 */
async function captureVisible(tab, cfg) {
  const dataUrl = await captureThrottle.exec(
    tab.windowId,
    {
      format: cfg.format,
      quality: cfg.format === 'jpeg' ? cfg.jpegQuality : undefined
    }
  );
  const fileName = buildFileName(tab, cfg, 'visible');
  const id = await chrome.downloads.download({
    url: dataUrl,
    filename: joinPath(cfg.savePath, fileName),
    conflictAction: 'uniquify',
    saveAs: false
  });
  await watchDownload(id, fileName);
  console.log(`[AutoCapture] 已保存可见区域: ${fileName}`);
}

/**
 * chrome.tabs.captureVisibleTab 限流器
 * Chrome 限制:每秒最多 2 次调用。实际测试 ~600ms 间隔最稳。
 * 这是长图保存失败最常见的原因。
 *
 * 工作方式:每次调用前等够 minInterval,触发限流时自动等 1.2s 重试。
 */
const captureThrottle = {
  minInterval: 600,
  lastCallAt: 0,

  async wait() {
    const now = Date.now();
    const wait = Math.max(0, this.lastCallAt + this.minInterval - now);
    if (wait > 0) await sleep(wait);
  },

  async exec(windowId, opts) {
    await this.wait();
    try {
      const dataUrl = await chrome.tabs.captureVisibleTab(windowId, opts);
      this.lastCallAt = Date.now();
      return dataUrl;
    } catch (err) {
      if (err && err.message && err.message.includes('MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND')) {
        console.warn('[AutoCapture] 触发截屏限流,等待 1.2s 后重试...');
        await sleep(1200);
        const dataUrl = await chrome.tabs.captureVisibleTab(windowId, opts);
        this.lastCallAt = Date.now();
        return dataUrl;
      }
      throw err;
    }
  }
};

/**
 * 整页长图:滚动分片截屏 + OffscreenCanvas 拼接
 */
async function captureFullPage(tab, cfg) {
  console.log(`[AutoCapture] 开始截取长图: ${tab.url}`);

  // 1. 准备 + 获取页面几何
  const { metrics } = await sendToTab(tab.id, { action: 'prepareCapture' });
  if (!metrics || !metrics.scrollHeight) {
    throw new Error('无法获取页面尺寸');
  }

  try {
    const overlap = clamp(cfg.fullPageOverlap, 0, 500);
    const stepY = Math.max(1, metrics.viewportHeight - overlap);
    const totalH = Math.min(metrics.scrollHeight, cfg.fullPageMaxHeight || 30000);
    const totalW = metrics.viewportWidth;

    console.log(`[AutoCapture] 页面 ${totalW}x${totalH}, 步长 ${stepY}, 段数 ≈ ${Math.ceil(totalH / stepY)}`);

    // 2. 分片滚动截屏(节流模式,避免触发 Chrome 限流)
    const segments = [];
    let y = 0;
    while (y < totalH) {
      // 把 content script 滚动到目标位置
      const r = await sendToTab(tab.id, { action: 'scrollTo', x: 0, y });
      if (!r.ok) throw new Error('滚动失败: ' + (r.error || 'unknown'));
      await sleep(150);  // 等待滚动 + 重排完成

      // 受限流器保护的截屏(每秒最多 ~1.6 次)
      const dataUrl = await captureThrottle.exec(tab.windowId, { format: 'png' });
      if (!dataUrl) throw new Error('captureVisibleTab 返回空');

      const realH = Math.min(metrics.viewportHeight, totalH - y);
      segments.push({ dataUrl, y, h: realH });
      console.log(`[AutoCapture] 切片 y=${y}, h=${realH}, 累计 ${segments.length}`);

      y += stepY;
      if (segments.length > 300) {
        console.warn('[AutoCapture] 段数过多,提前终止');
        break;
      }
    }

    if (segments.length === 0) {
      throw new Error('未截到任何分段');
    }

    // 3. 拼接
    console.log(`[AutoCapture] 开始拼接 ${segments.length} 段为 ${totalW}x${totalH} 的图...`);
    const blob = await stitchSegments(segments, totalW, totalH, cfg);
    console.log(`[AutoCapture] 拼接完成,blob 大小 ${(blob.size / 1024).toFixed(1)} KB`);

    // 4. 转 base64 dataURL(SW 内最稳妥的下载方式,避免 object URL 被回收)
    const dataUrl = await blobToDataURL(blob);
    console.log(`[AutoCapture] dataURL 长度 ${dataUrl.length} 字符`);

    // 5. 下载
    const fileName = buildFileName(tab, cfg, 'fullpage');
    const downloadId = await chrome.downloads.download({
      url: dataUrl,
      filename: joinPath(cfg.savePath, fileName),
      conflictAction: 'uniquify',
      saveAs: false
    });
    await watchDownload(downloadId, fileName);
    console.log(`[AutoCapture] 长图已保存: ${fileName}`);
  } finally {
    // 6. 还原
    try {
      await sendToTab(tab.id, { action: 'restoreCapture' });
    } catch (e) {
      console.warn('[AutoCapture] 还原失败(可忽略):', e.message);
    }
  }
}

/**
 * 监听下载完成事件,捕获失败
 */
function watchDownload(downloadId, fileName) {
  return new Promise((resolve, reject) => {
    const onChange = (delta) => {
      if (delta.id !== downloadId) return;
      if (delta.state && delta.state.current === 'complete') {
        chrome.downloads.onChanged.removeListener(onChange);
        resolve();
      } else if (delta.state && delta.state.current === 'interrupted') {
        chrome.downloads.onChanged.removeListener(onChange);
        reject(new Error(
          `下载被中断: ${delta.error && delta.error.current}, 文件: ${fileName}`
        ));
      }
    };
    chrome.downloads.onChanged.addListener(onChange);
    // 安全超时 30s
    setTimeout(() => {
      chrome.downloads.onChanged.removeListener(onChange);
      resolve();  // 超时不视为失败,可能只是监听丢了
    }, 30000);
  });
}

/**
 * Blob -> base64 dataURL
 */
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('FileReader 读取失败: ' + reader.error));
    reader.readAsDataURL(blob);
  });
}

/**
 * 把 segments 拼成一张大图
 */
async function stitchSegments(segments, totalW, totalH, cfg) {
  if (typeof OffscreenCanvas === 'undefined') {
    throw new Error('当前 Chrome 不支持 OffscreenCanvas,无法拼接长图');
  }

  // 限制最大尺寸,避免超出 Chrome convertToBlob 限制(约 16384 或 250MB)
  const MAX_DIM = 16384;
  if (totalW > MAX_DIM || totalH > MAX_DIM) {
    throw new Error(
      `拼接尺寸 ${totalW}x${totalH} 超过 ${MAX_DIM} 限制,请在高级设置中调小"最大高度",或缩小浏览器窗口宽度`
    );
  }

  const canvas = new OffscreenCanvas(totalW, totalH);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, totalW, totalH);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    try {
      const blob = await (await fetch(seg.dataUrl)).blob();
      const bitmap = await createImageBitmap(blob);
      ctx.drawImage(bitmap, 0, seg.y, totalW, seg.h);
      bitmap.close && bitmap.close();
      console.log(`[AutoCapture] 拼接段 ${i + 1}/${segments.length}`);
    } catch (err) {
      throw new Error(`第 ${i + 1} 段拼接失败: ${err.message}`);
    }
  }

  let outType = 'image/png';
  let quality;
  if (cfg.format === 'jpeg') {
    outType = 'image/jpeg';
    quality = cfg.jpegQuality / 100;
  } else if (cfg.format === 'webp') {
    outType = 'image/webp';
    quality = cfg.jpegQuality / 100;
  }

  const blob = await canvas.convertToBlob({ type: outType, quality });
  if (!blob || blob.size === 0) {
    throw new Error('convertToBlob 返回空,可能是图片太大或格式不支持');
  }
  return blob;
}

// =================== 工具 ===================

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function joinPath(base, name) {
  return base ? `${base.replace(/\/$/, '')}/${name}` : name;
}
function buildFileName(tab, cfg, suffix) {
  const url = new URL(tab.url);
  const domain = url.hostname.replace(/[^a-z0-9.-]/gi, '_');
  const titleSafe = (tab.title || 'page')
    .replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '_').slice(0, 40);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8).replace(/:/g, '-');
  const ext = cfg.format === 'jpeg' ? 'jpg' : cfg.format;
  return (cfg.fileNamePattern || '{domain}_{date}_{time}')
    .replace('{domain}', domain)
    .replace('{title}', titleSafe)
    .replace('{date}', date)
    .replace('{time}', time)
    .replace('{path}', (url.pathname.replace(/\//g, '_').slice(0, 30) || 'root'))
    + (suffix ? `_${suffix}` : '')
    + '.' + ext;
}

/**
 * 向 content script 发消息(带注入保障)
 */
async function sendToTab(tabId, msg) {
  await ensureContentScript(tabId);
  return await chrome.tabs.sendMessage(tabId, msg);
}

// =================== 消息桥(来自 popup / options) ===================

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      const cfg = await getConfig();
      switch (msg.action) {
        case 'getConfig':
          sendResponse({ ok: true, config: cfg });
          break;
        case 'saveConfig':
          await saveConfig(msg.config);
          await setupAlarm();
          sendResponse({ ok: true });
          break;
        case 'captureNow': {
          const tab = sender.tab || (await getActiveTab());
          await captureTab(tab, cfg);
          sendResponse({ ok: true });
          break;
        }
        case 'startTimer':
          await saveConfig({ ...cfg, enabled: true });
          await setupAlarm();
          sendResponse({ ok: true });
          break;
        case 'stopTimer':
          await saveConfig({ ...cfg, enabled: false });
          await setupAlarm();
          sendResponse({ ok: true });
          break;
        default:
          sendResponse({ ok: false, error: 'unknown action' });
      }
    } catch (err) {
      console.error('[AutoCapture]', err);
      sendResponse({ ok: false, error: err.message });
    }
  })();
  return true;
});

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}
