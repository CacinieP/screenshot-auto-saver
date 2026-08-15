# Chrome Web Store 1.1.0 合规自检

检查日期：2026-08-15

本清单用于降低审核和知识产权投诉风险，但任何自检都不能保证扩展永不被下架；平台仍可能先限制展示或下架再处理申诉。

## 知识产权与商店信息

- [x] 图标、截图和宣传图均有本地可编辑源文件及 SHA-256 记录。
- [x] 视觉来自开发者本人控制的品牌资产，没有复制竞品设计元素。
- [x] 商店文案不提及竞品名称，不暗示关联、授权、官方身份或排名。
- [x] 中英文名称都使用第一方 `LWT` 前缀，避免仅用通用功能词造成产品混淆。
- [x] 截图只展示扩展真实功能和原创示例内容，没有第三方 Logo、人物或网站素材。
- [x] 名称、图标、简短描述和截图与扩展实际行为一致。
- [x] 不使用用户数、评分、奖项、促销价格或无法验证的安全徽章。

## 单一用途与权限

- [x] 单一用途是按计划或按需截取网页并保存到本地。
- [x] `alarms` 仅用于用户设置的定时任务。
- [x] `downloads` 仅用于保存生成的图片。
- [x] `storage` 仅用于保存用户设置。
- [x] `notifications` 仅在用户开启通知后报告截屏结果。
- [x] `tabs`、`activeTab`、`scripting` 与 `<all_urls>` 用于用户选择的网页截取、页面滚动和可选多标签模式。
- [x] 商店权限说明解释了每项权限与核心功能的对应关系。

`<all_urls>` 属于高敏感度权限，也是整页截屏和可选多标签定时截屏在任意普通网页运行所必需。若未来移除“全部标签页”功能，可重新评估是否改为 `activeTab` 加可选主机权限；当前版本不应在没有功能重构和回归测试的情况下缩减权限。

## 隐私与行为一致性

- [x] 代码未引入外部服务器、统计 SDK、广告 SDK 或远程代码。
- [x] 截图在浏览器内处理并写入用户下载目录。
- [x] 设置使用 `chrome.storage.sync`，开发者不接收同步数据。
- [x] 隐私政策、商店数据申报和代码行为一致。
- [x] 对受保护页面和超长页面的限制在文档中说明。

## 参考政策

- Chrome Web Store：Impersonation and Intellectual Property
  https://developer.chrome.com/docs/webstore/program-policies/impersonation-and-intellectual-property
- Chrome Web Store：Listing Requirements
  https://developer.chrome.com/docs/webstore/program-policies/listing-requirements
- Chrome Web Store：Permissions
  https://developer.chrome.com/docs/webstore/program-policies/permissions
- Chrome Web Store：Best Practices for Your Store Listing
  https://developer.chrome.com/docs/webstore/best-listing

## 事件响应

1. 保存平台通知全文、时间、案件编号和相关截图。
2. 记录被指出的具体图形、文案、代码或功能，不猜测争议范围。
3. 导出当时线上版本的 ZIP、商店素材、清单与哈希。
4. 用 Git 历史、SVG/HTML/CSS 源文件和品牌仓库历史证明独立创作。
5. 仅针对明确争议点提交解释或替换方案，确保新版本、文案和证据相互一致。
