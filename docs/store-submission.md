# Chrome Web Store 提交清单

## 1. 隐私权标签页(Privacy practices)怎么填

Chrome Web Store 对"收集(collected)"的定义是**数据离开用户设备传给开发者**。本扩展所有处理均在本地完成、零网络上传,因此:

| 申报项 | 选择 |
|---|---|
| 收集用户数据? | **否**(可全部勾选"不收集") |
| 出售数据给第三方? | 否 |
| 数据用于与核心功能无关的用途? | 否 |
| 数据用于信贷评估? | 否 |
| 数据被传输给第三方? | 否 |

> 注:设置存于 `chrome.storage.sync`,经由用户自己的 Chrome 同步流转,不属于"开发者收集"。截图直接写入用户下载目录,不上传。

- **隐私政策 URL**:填 `docs/privacy-policy.html` 发布后的公开地址(见下)
- **单一致用途(single purpose)声明**:"按用户设定的时间间隔自动截取网页截图,或由用户手动截取,并保存到本地下载目录。"(Automate webpage screenshot capture on a schedule or on demand and save it locally.)

## 2. 权限审核备注(提交时的 Justification 文本)

```
<all_urls> + scripting: Full-page capture requires reading page
  geometry (scrollHeight/viewport) and programmatic scrolling on
  arbitrary sites. Screenshots are processed locally only; nothing
  is transmitted off-device.
tabs: Enumerate tabs for the optional "capture all tabs" mode; URL
  and title are used locally to name the output file only.
downloads: Save the captured image into a subfolder of the user's
  Downloads directory. Nothing is downloaded from the internet.
notifications: Optional, user-opt-in notification when a capture
  completes.
alarms: Drives the user-configured recurring capture schedule.
storage: Persists user settings only (interval, format, filename
  pattern).
activeTab: Captures the visible area of the current tab.
```

## 3. 隐私政策托管(已选定:仓库公开 + GitHub Pages)

仓库已开源,GitHub Pages 已开启,隐私政策地址:

```
https://cacinep.github.io/screenshot-auto-saver/docs/privacy-policy.html
```

## 4. 打包上传

```bash
zip -r screenshot-auto-saver-v1.0.1.zip . \
  -x ".git/*" ".gitignore" "push-to-github.sh" "docs/*" "README.md" ".DS_Store"
```

(zip 里只需:manifest.json、background.js、content.js、popup.*、options.*、_locales/、icons/)

## 5. 商店素材

- [ ] 1280×800 截图 1–5 张(popup 面板、长图效果、options 页)
- [ ] 440×280 宣传图(可选)
- [ ] 简短描述(<132 字符)与详细描述:主打"定时自动截屏 + 全本地零上传"
- [ ] 类目:生产力工具(Productivity)
