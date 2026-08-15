# Chrome Web Store 提交清单

## 1. 隐私权标签页

Chrome Web Store 对“收集”的判断重点是数据是否传给开发者或第三方。本扩展的截图和设置处理均在本地完成，不包含开发者服务器、统计 SDK 或广告代码。

| 申报项 | 选择 |
|---|---|
| 收集用户数据？ | 否 |
| 出售数据给第三方？ | 否 |
| 数据用于与核心功能无关的用途？ | 否 |
| 数据用于信贷评估？ | 否 |
| 数据被传输给第三方？ | 否 |

设置存于 `chrome.storage.sync`，可能通过用户自己的 Chrome 同步账号流转；扩展开发者不接收这些设置。截图直接写入用户的下载目录。

- 隐私政策：`https://github.com/CacinieP/screenshot-auto-saver/blob/main/docs/privacy-policy.md`
- 单一用途：`按用户设定的时间间隔或用户请求截取网页，并将截图保存到本地下载目录。`
- Single purpose: `Capture webpages on a user-defined schedule or on demand and save the screenshots to the local Downloads folder.`

## 2. 权限审核说明

```text
<all_urls> and scripting: Full-page capture needs page dimensions and
programmatic scrolling on websites selected by the user. Screenshots are
processed locally and are not transmitted off-device.

tabs: Supports the optional capture-all-tabs mode. A page URL and title are
used locally only when constructing the output filename.

downloads: Saves the generated image to the user's Downloads folder. It does
not download content from an external server.

notifications: Shows an optional, user-controlled completion notification.

alarms: Runs the recurring capture interval configured by the user.

storage: Stores user preferences such as interval, image format, and filename
pattern.

activeTab: Captures the visible area of the current user-selected tab.
```

## 3. 上传包

在仓库根目录运行：

```bash
./scripts/package-extension.sh
```

生成 `screenshot-auto-saver-v1.1.0.zip`。压缩包只包含扩展运行所需文件，不包含文档、商店宣传素材、SVG 设计源文件或开发脚本。

本次已验证上传包：

```text
e9fa5cda80964c65d9f9e00acb7f508a10eb62e14ff656639434cb9fcd288d6b  screenshot-auto-saver-v1.1.0.zip
```

重新打包会更新 ZIP 内文件时间，因此提交前若再次运行脚本，应重新计算并保存 SHA-256。

## 4. 商店素材

- [x] 128×128 商店图标：`icons/icon128.png`
- [x] 三张 1280×800 中文截图
- [x] 三张 1280×800 English 截图
- [x] 440×280 小型宣传图：`store-assets/promo-tile.png`
- [x] 中英文简短描述与详细描述：`docs/store-listing.md`
- [x] 原创与来源记录：`docs/asset-provenance.md`
- [x] 合规自检：`docs/compliance-review.md`

## 5. 提交前最后检查

- 商店名称必须与清单一致，不添加竞品名、排名、官方徽章或关键词后缀。
- 图标、截图、宣传图不出现第三方 Logo、网站内容、人物、商标或界面。
- 截图必须与当前 1.1.0 版本的实际功能和文案一致。
- 不承诺无法验证的效果，不使用“最安全”“第一”“官方”等绝对化表述。
- 保存一份本次上传的 ZIP、PNG、SVG、提交文案和 SHA-256 清单。
- 发布后若收到知识产权通知，先保全通知、源文件、Git 历史和哈希，不要在未确认争议点前替换证据文件。
