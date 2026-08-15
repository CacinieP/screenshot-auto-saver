# Chrome Web Store 商店文案

> 商店名称由 `manifest.json` 的本地化 `name` 字段生成，请勿在开发者后台追加关键词、竞品名称、徽章或排名描述。

## 基本信息

| 字段 | 值 |
|---|---|
| 类别 | 生产力工具（Productivity） |
| 默认语言 | 中文（简体） |
| 支持语言 | 中文（简体）、English |
| 中文名称 | `网页自动截屏助手` |
| English name | `Auto Screenshot Saver` |
| 官方网站 | `https://github.com/CacinieP/screenshot-auto-saver` |
| 支持页面 | `https://github.com/CacinieP/screenshot-auto-saver/issues` |
| 隐私政策 | `https://github.com/CacinieP/screenshot-auto-saver/blob/main/docs/privacy-policy.md` |

## 中文

**简短描述**（与清单一致）：

```text
定时自动截屏保存 Chrome 网页，支持可见区域与整页长图两种模式
```

**详细描述**：

```text
网页自动截屏助手用于按计划或按需截取网页，并将图片直接保存到本地下载目录。

主要功能：
• 定时截屏：可设置最短 1 分钟的截屏间隔。
• 整页长图：自动滚动并拼接长文章、记录页等可滚动内容。
• 手动截屏：从扩展弹窗立即截取当前页面。
• 多种格式：支持 PNG、JPEG、WebP，并可调整有损格式质量。
• 文件命名：支持 {domain}、{title}、{date}、{time}、{path} 模板变量。
• 标签页范围：可选择当前标签页或全部普通网页标签页，并可跳过固定标签页。

隐私说明：
截图处理在浏览器本地完成，文件直接写入用户的下载目录。扩展不含账号、广告、统计或追踪代码，也不会把截图上传给开发者或第三方。

部分浏览器内置页面、扩展商店页面和 PDF 查看器等受保护页面不允许扩展截取。

源代码与问题反馈：
https://github.com/CacinieP/screenshot-auto-saver
```

## English

**Summary** (same as the manifest):

```text
Automatically capture webpages on a schedule. Visible-area or full-page scrolling screenshots, saved locally. No tracking, no uploads.
```

**Detailed description**:

```text
Auto Screenshot Saver captures webpages on a schedule or on demand and saves the images directly to your local Downloads folder.

Features:
• Scheduled capture with intervals starting at one minute.
• Full-page capture that scrolls and stitches long, scrollable pages.
• One-click manual capture from the extension popup.
• PNG, JPEG, and WebP output with adjustable quality for lossy formats.
• Filename templates using {domain}, {title}, {date}, {time}, and {path}.
• Capture the active tab or ordinary webpages across all tabs, with an option to skip pinned tabs.

Privacy:
Screenshot processing happens locally in the browser and files are written directly to the user's Downloads folder. The extension has no account, advertising, analytics, or tracking code, and it does not upload screenshots to the developer or a third party.

Browser-protected pages, Chrome Web Store pages, and some built-in PDF viewers cannot be captured by extensions.

Source code and support:
https://github.com/CacinieP/screenshot-auto-saver
```

## 图形素材

所有图形均为本项目原创或来自开发者本人持有的品牌系统，详见 [`asset-provenance.md`](asset-provenance.md)。

| 用途 | 文件 |
|---|---|
| 商店图标 | `icons/icon128.png`（128×128） |
| 中文截图 | `store-assets/zh-01-scheduled-capture.png`、`zh-02-full-page-options.png`、`zh-03-full-page-result.png` |
| English screenshots | `store-assets/en-01-scheduled-capture.png`、`en-02-full-page-options.png`、`en-03-full-page-result.png` |
| 小型宣传图 | `store-assets/promo-tile.png`（440×280） |

## 提交流程

1. 新建产品并上传 `screenshot-auto-saver-v1.1.0.zip`。
2. 添加中文（简体）和 English 商店信息，分别使用上面的同语言文案及截图。
3. 在隐私权页面填写隐私政策 URL、单一用途说明和 [`store-submission.md`](store-submission.md) 中的权限说明。
4. 选择公开分发，保存草稿并逐项检查预览。
5. 确认名称、图标、截图与实际功能一致后再提交审核。
