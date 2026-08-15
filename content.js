/**
 * 网页自动截屏助手 - Content Script
 *
 * 负责:
 *   - 提供"获取页面尺寸"接口
 *   - 提供"滚动到指定位置并等待渲染稳定"接口
 *   - 配合 background 完成"整页长图"截取
 */

(() => {
  if (window.__autoScreenshotInjected) return;
  window.__autoScreenshotInjected = true;

  let scrollState = null;

  /**
   * 获取页面几何信息
   */
  function getPageMetrics() {
    const doc = document.documentElement;
    return {
      scrollHeight: Math.max(
        doc.scrollHeight,
        document.body ? document.body.scrollHeight : 0
      ),
      scrollWidth: Math.max(
        doc.scrollWidth,
        document.body ? document.body.scrollWidth : 0
      ),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
      scrollX: window.scrollX || window.pageXOffset || 0,
      scrollY: window.scrollY || window.pageYOffset || 0
    };
  }

  /**
   * 滚动到指定位置
   */
  function scrollTo(x, y) {
    window.scrollTo({
      left: Math.max(0, Math.floor(x)),
      top: Math.max(0, Math.floor(y)),
      behavior: 'auto'
    });
  }

  /**
   * 准备截屏:暂停动画、记录原始状态
   */
  function prepareCapture() {
    scrollState = {
      x: window.scrollX,
      y: window.scrollY,
      overflow: document.documentElement.style.overflow,
      overflowBody: document.body ? document.body.style.overflow : ''
    };
    const style = document.createElement('style');
    style.id = '__autoScreenshot_style';
    style.textContent = `
      html, body {
        scroll-behavior: auto !important;
      }
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        caret-color: transparent !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  /**
   * 还原截屏前状态
   */
  function restoreCapture() {
    const s = document.getElementById('__autoScreenshot_style');
    if (s) s.remove();
    if (scrollState) {
      window.scrollTo(scrollState.x, scrollState.y);
      document.documentElement.style.overflow = scrollState.overflow;
      if (document.body) document.body.style.overflow = scrollState.overflowBody;
      scrollState = null;
    }
  }

  /**
   * 把页面所有图片(包括懒加载的)都强制加载完
   */
  async function preloadImages(timeoutMs = 5000) {
    const imgs = Array.from(document.images || []);
    const all = Promise.all(imgs.map(img => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise(res => {
        img.addEventListener('load', res, { once: true });
        img.addEventListener('error', res, { once: true });
        // 触发懒加载:把不可见的图先滚到视口
        const r = img.getBoundingClientRect();
        if (r.bottom < -100 || r.top > window.innerHeight + 100) {
          try { img.scrollIntoView({ block: 'center' }); } catch {}
        }
      });
    }));
    // 个别图片可能永远加载不完,整体设置超时,避免截屏流程卡死
    await Promise.race([all, new Promise(res => setTimeout(res, timeoutMs))]);
  }

  /**
   * 等 layout 稳定(scrollHeight 连续 3 帧不变化)
   */
  function waitForStable(timeout = 2000) {
    return new Promise(res => {
      let lastH = document.documentElement.scrollHeight;
      let stableCount = 0;
      const start = Date.now();
      const tick = () => {
        const h = document.documentElement.scrollHeight;
        if (h === lastH) {
          stableCount++;
          if (stableCount >= 3) return res();
        } else {
          stableCount = 0;
          lastH = h;
        }
        if (Date.now() - start > timeout) return res();
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /**
   * 等滚动完成 + 渲染稳定(两帧 + 一次延时)
   */
  function settle() {
    return new Promise(res => requestAnimationFrame(() =>
      requestAnimationFrame(() => setTimeout(res, 150))
    ));
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    (async () => {
      try {
        switch (msg.action) {
          case 'prepareCapture': {
            prepareCapture();
            await preloadImages();
            await waitForStable();
            const m = getPageMetrics();
            sendResponse({ ok: true, metrics: m });
            break;
          }
          case 'getMetrics':
            sendResponse({ ok: true, metrics: getPageMetrics() });
            break;
          case 'scrollTo': {
            scrollTo(msg.x, msg.y);
            await settle();
            sendResponse({ ok: true, metrics: getPageMetrics() });
            break;
          }
          case 'restoreCapture': {
            restoreCapture();
            sendResponse({ ok: true });
            break;
          }
          case 'ping':
            sendResponse({ ok: true, ready: true });
            break;
          default:
            sendResponse({ ok: false, error: 'unknown action' });
        }
      } catch (err) {
        console.error('[AutoCapture content]', err);
        sendResponse({ ok: false, error: err.message });
      }
    })();
    return true;
  });
})();
