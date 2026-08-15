const params = new URLSearchParams(location.search);
const locale = params.get('locale') === 'en' ? 'en' : 'zh_CN';
const view = ['popup', 'options', 'result'].includes(params.get('view')) ? params.get('view') : 'popup';

const pageCopy = {
  zh_CN: {
    localBadge: '全程本地 · 零上传',
    popup: {
      eyebrow: 'SCHEDULED WEB CAPTURE',
      headline: '网页会变化，记录按时留下。',
      lede: '按你的节奏自动截屏，直接保存到本地下载目录。',
      featureOne: '定时自动截屏',
      featureTwo: '整页滚动拼接',
      featureThree: 'PNG · JPEG · WebP',
      privacyNote: 'NO ACCOUNT / NO CLOUD / NO TRACKING'
    },
    options: {
      eyebrow: 'CONTROL THE CAPTURE',
      headline: '每一次截取，都按你的规则。',
      lede: '范围、格式、命名、目录与长图参数，一处设置。',
      featureOne: '灵活命名与目录',
      featureTwo: '长图高度与重叠可调',
      featureThree: '当前标签或多标签',
      privacyNote: 'SETTINGS SYNC / SCREENSHOTS STAY LOCAL'
    },
    result: {
      eyebrow: 'FULL-PAGE ARCHIVE',
      headline: '从页首到页尾，一张图完整保存。',
      lede: '自动滚动、分段截取并本地拼接，完成后恢复页面状态。',
      featureOne: '清晰长图输出',
      featureTwo: '自动恢复滚动位置',
      featureThree: '本地下载，无中转',
      privacyNote: 'CAPTURE / STITCH / SAVE — ON DEVICE',
      savedToast: '整页长图已保存到本地'
    }
  },
  en: {
    localBadge: 'LOCAL ONLY · ZERO UPLOADS',
    popup: {
      eyebrow: 'SCHEDULED WEB CAPTURE',
      headline: 'Pages change. Your record stays.',
      lede: 'Capture on your schedule and save directly to your local Downloads folder.',
      featureOne: 'Scheduled screenshots',
      featureTwo: 'Full-page scroll and stitch',
      featureThree: 'PNG · JPEG · WebP',
      privacyNote: 'NO ACCOUNT / NO CLOUD / NO TRACKING'
    },
    options: {
      eyebrow: 'CONTROL THE CAPTURE',
      headline: 'Every capture, on your terms.',
      lede: 'Control scope, format, naming, folders, and full-page behavior in one place.',
      featureOne: 'Flexible names and folders',
      featureTwo: 'Adjustable full-page limits',
      featureThree: 'One tab or multiple tabs',
      privacyNote: 'SETTINGS SYNC / SCREENSHOTS STAY LOCAL'
    },
    result: {
      eyebrow: 'FULL-PAGE ARCHIVE',
      headline: 'Top to bottom. One complete image.',
      lede: 'Automatically scroll, capture, and stitch on-device—then restore the page.',
      featureOne: 'Crisp full-page output',
      featureTwo: 'Scroll position restored',
      featureThree: 'Local download, no relay',
      privacyNote: 'CAPTURE / STITCH / SAVE — ON DEVICE',
      savedToast: 'Full-page image saved locally'
    }
  }
};

const uiCopy = {
  zh_CN: {
    extensionName: '网页自动截屏助手',
    enableScheduledCapture: '启用定时截屏',
    intervalMinutes: '间隔（分钟）',
    captureIntervalMinutes: '截屏间隔（分钟）',
    captureScope: '截屏范围',
    fullPage: '整页滚动',
    fullPageScrolling: '整页长图（滚动拼接）',
    imageFormat: '图片格式',
    captureNow: '立即截取当前页',
    advancedSettings: '高级设置',
    statusLabel: '状态：',
    running: '运行中',
    lastCaptureLabel: '上次截屏：',
    todayTime: '今天 14:30',
    openDownloadFolder: '打开下载文件夹',
    optionsIntro: '配置网页自动截屏助手的所有选项。修改后请点击保存。',
    basicSection: '基本',
    startWithBrowser: '启动浏览器时自动开始',
    notifyOnCapture: '截屏后显示通知',
    scopeSection: '范围',
    fullPageHint: '整页长图会自动滚动并拼成一张图，适合长文章与聊天记录。',
    onlyActiveTab: '仅截取当前激活标签',
    skipPinnedTabs: '跳过已固定的标签页',
    fullPageParameters: '长图参数',
    overlapPixels: '分段重叠像素',
    overlapHint: '相邻两段重叠的像素数（0–500）。建议 50–200。',
    maxHeightPixels: '最大高度（像素）',
    maxHeightHint: '超过此高度只截顶部，避免超大图导致内存不足。',
    outputSection: '输出'
  },
  en: {
    extensionName: 'Auto Screenshot Saver',
    enableScheduledCapture: 'Enable scheduled capture',
    intervalMinutes: 'Interval (minutes)',
    captureIntervalMinutes: 'Capture interval (minutes)',
    captureScope: 'Capture scope',
    fullPage: 'Full page',
    fullPageScrolling: 'Full page (scroll and stitch)',
    imageFormat: 'Image format',
    captureNow: 'Capture current page now',
    advancedSettings: 'Advanced settings',
    statusLabel: 'Status:',
    running: 'Running',
    lastCaptureLabel: 'Last capture:',
    todayTime: 'Today, 14:30',
    openDownloadFolder: 'Open Downloads folder',
    optionsIntro: 'Configure every Auto Screenshot Saver option. Select Save when you are finished.',
    basicSection: 'Basics',
    startWithBrowser: 'Start automatically with Chrome',
    notifyOnCapture: 'Show a notification after capture',
    scopeSection: 'Scope',
    fullPageHint: 'Full-page mode scrolls and stitches the page into one image—ideal for long articles and chat logs.',
    onlyActiveTab: 'Capture the active tab only',
    skipPinnedTabs: 'Skip pinned tabs',
    fullPageParameters: 'Full-page options',
    overlapPixels: 'Segment overlap (pixels)',
    overlapHint: 'Overlap between adjacent segments (0–500). Recommended: 50–200.',
    maxHeightPixels: 'Maximum height (pixels)',
    maxHeightHint: 'Pages taller than this are captured from the top to limit memory use.',
    outputSection: 'Output'
  }
};

document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN';
const canvas = document.querySelector('.canvas');
canvas.dataset.view = view;

const activeCopy = { ...pageCopy[locale], ...pageCopy[locale][view] };
for (const element of document.querySelectorAll('[data-copy]')) {
  const text = activeCopy[element.dataset.copy];
  if (text) element.textContent = text;
}

for (const element of document.querySelectorAll('[data-ui]')) {
  const text = uiCopy[locale][element.dataset.ui];
  if (text) element.textContent = text;
}

document.body.dataset.ready = 'true';
