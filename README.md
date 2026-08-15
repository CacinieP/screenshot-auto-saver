# 网页自动截屏助手 (Chrome 扩展,含整页长图)

Manifest V3 Chrome 扩展,定时自动截取网页,支持**整页长图**(滚动拼接)。

## ✨ 功能

- ⏱ **定时截屏** — `chrome.alarms` 驱动,默认 5 分钟一次
- 📷 **手动截屏** — 弹出面板一键截取
- 📜 **整页长图** — 自动滚动 + 分片截图 + OffscreenCanvas 拼接
- 🖼 **三种格式** — PNG / JPEG / WebP,可设质量
- 📂 **自定义路径** — Chrome 下载目录下的子目录
- � **文件命名模板** — `{domain} {title} {date} {time} {path}`
- 🔔 **截屏通知** — 可选系统通知
- 🪟 **多标签控制** — 仅当前 / 全部 / 跳过固定标签
- 🎬 **动画暂停** — 长图模式下临时禁用 CSS 动画,避免拼接错位
- 🧹 **状态还原** — 长图模式下截屏后恢复原滚动位置
- 🌐 **完整双语界面** — 根据 Chrome 语言自动显示简体中文或 English
- 🎨 **Linguist Wants Tech 品牌视觉** — 第一方 C 形捕捉符号与青绿/珊瑚配色

## 📦 安装

打开 `chrome://extensions`,开启右上角 **开发者模式**,点击 **加载已解压的扩展程序**,选择 `screenshot-auto-saver/` 文件夹。

## 🚀 使用

1. 点击工具栏图标打开弹出面板
2. 打开 **启用定时截屏** 开关
3. 选择 **截屏范围**(可见区域 / 整页长图)
4. 设置间隔与格式
5. 点 **立即截取当前页** 测试

**长图模式**:会暂时禁用页面动画,滚动整页并拼接为单张 PNG/JPEG/WebP,完成后自动恢复原始状态。长图最长 30000 像素(可在高级设置中调整)。

## ⚙️ 高级设置

| 选项 | 默认 | 说明 |
|---|---|---|
| 启动浏览器时自动开始 | 关 | Chrome 启动后自动启用定时 |
| 截屏后显示通知 | 关 | 系统通知提醒 |
| 截屏间隔 | 5 分钟 | 最小 1 分钟 |
| 截取范围 | 可见区域 | 可见区域 / 整页长图 |
| 仅截取当前标签 | 开 | 关闭则截所有标签 |
| 跳过固定标签 | 关 | - |
| **分段重叠像素** | 0 | 长图模式:相邻片段重叠,推荐 50-200 |
| **最大高度(像素)** | 30000 | 长图模式:超过只截顶部,避免内存爆 |
| 图片格式 | PNG | - |
| JPEG 质量 | 92 | 范围 1-100 |
| 保存子目录 | 空 | 默认下载目录下的子目录 |
| 文件命名规则 | `{domain}_{date}_{time}` | 见下 |

### 文件名变量

`{domain}` 域名 · `{title}` 标题 · `{date}` 日期 · `{time}` 时间 · `{path}` 路径

## 🧠 长图实现原理

1. content script 注入页面 → 暂停 CSS 动画、锁定滚动、记录原始状态
2. content script 返回页面几何(`scrollHeight / viewportHeight`)
3. background 按 `viewportHeight - overlap` 步长,逐段 `scrollTo`
4. 每段用 `chrome.tabs.captureVisibleTab` 截屏
5. 用 `fetch(dataURL) → createImageBitmap → OffscreenCanvas.drawImage` 拼接
6. `convertToBlob` 得到最终图片 → 转 base64 dataURL → `chrome.downloads.download` 保存
   (不能用 `URL.createObjectURL`,SW 休眠时该 URL 会失效)
7. 截完后 content script 恢复原滚动位置与样式

## 📁 文件结构

```
screenshot-auto-saver/
├── manifest.json          # MV3 清单(注册 content script)
├── background.js          # Service Worker:定时 + 截图 + 拼接 + 下载
├── content.js             # Content Script:页面几何/滚动/动画暂停
├── i18n.js                # 弹窗与设置页本地化辅助
├── popup.html / popup.js  # 弹出面板
├── options.html / options.js  # 高级设置
├── _locales/{zh_CN,en}/messages.json
├── icons/icon.svg         # 可编辑品牌图标源文件
├── icons/{16,32,48,128}.png
├── store-assets/          # 中英文商店截图与宣传图
└── README.md
```

## ⚠️ 限制

- Chrome 限制下载根目录,只能保存到默认下载目录及其子目录
- 长图高度超过 30000 像素(可调)只截顶部,避免内存不足
- 极长页面拼接可能因 fixed 元素重复出现,可调高"分段重叠"
- 受保护页面(`chrome://`、PDF 预览)无法截取
- Service Worker 空闲 30 秒后会休眠,定时由 `chrome.alarms` 保证触发

## 📜 权限说明

| 权限 | 用途 |
|---|---|
| `tabs` | 查询标签页信息 |
| `activeTab` | 截取当前可见标签 |
| `storage` | 保存配置 |
| `alarms` | 定时截屏 |
| `downloads` | 保存截图 |
| `notifications` | 系统通知 |
| `scripting` | 注入 content script |
| `<all_urls>` | 截取所有网站 |

## 📄 开源协议与隐私

本项目基于 [MIT](LICENSE) 协议开源,可自由使用、修改和分发。

**隐私承诺**:扩展零收集、零上传——所有截图直接保存到你的本地下载目录,不包含任何统计/广告/追踪代码。详见[隐私政策](docs/privacy-policy.md)。

## 版本

- 1.1.0 — 新增 Linguist Wants Tech 品牌图标、完整中英文界面及原创商店图形素材；补充知识产权来源记录与提交合规清单
- 1.0.1 — 修复:长图末段压扁/错位、文件名日期时区不一致、多标签截屏后焦点不还原、长图输出未按 retina 分辨率拼接、画布尺寸限制误判导致高页截取失败、图片预加载可能卡死、非法保存路径未过滤
- 1.0.0 — 初始发布(支持整页长图)
