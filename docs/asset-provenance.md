# 品牌与商店素材来源记录

记录日期：2026-08-15

## 设计来源

本扩展的 1.1.0 视觉系统是为该项目制作的第一方原创设计，没有复制 GoFullPage 或其他浏览器扩展的图标、截图、商标、人物、网页内容或宣传素材。

品牌语言来自开发者本人控制的 `CacinieP/caciniep.github.io` 品牌仓库：纸张色、深墨色、青绿色与珊瑚色取自该站的 `styles.css`；字母 C 的视觉母题与状态圆点取自该站的 `favicon.svg`。本项目在独立的 512×512 SVG 网格中重新组合这些第一方元素，加入页面取景框，表达“Cace + capture + 自动运行状态”。

商店截图和宣传图由本仓库中的 HTML/CSS/JavaScript 源文件确定性生成。示例页面为虚构的 `field-notes.local`，界面内容对应本扩展 1.1.0 的真实弹窗、设置与长图流程。未加载网络图片、第三方字体或第三方品牌资产。

## 可编辑源文件

- 扩展图标：`icons/icon.svg`
- 商店宣传图：`store-assets/promo-tile.svg`
- 商店截图场景：`store-assets/showcase.html`
- 商店截图样式：`store-assets/showcase.css`
- 商店截图状态：`store-assets/showcase.js`

## 发布文件 SHA-256

```text
3b4f484b945d19d5e7e5fa149540257a2503c69948eebfb2a4c516c2b69d1bb2  icons/icon.svg
1f4c9bffef5e54cc0fae6d4efc153f51b09e10ff69f78b6b382caa4e89633286  icons/icon16.png
32551bc8932c7ec4115e3246c244623fde93e11b528a155825cf2000798ca33a  icons/icon32.png
76d4e674c87bc377fb02aacf9ed423d920a1d90f854e7e1c7df09edcae74d1ad  icons/icon48.png
73a85dd92e8994b902a51b26372d5138807c034789af3ad92da407b66e174cbb  icons/icon128.png
c0894dedc4dcffd3e6e9caed715b7f1058fd818e32780eea42b6200be006af12  store-assets/zh-01-scheduled-capture.png
6738051dc45922dcb03faaddb0ac1e76b23d7739d8dcf66582e253fec3c3bf9f  store-assets/zh-02-full-page-options.png
80d87853d5d58e664652a0e598bee09b862799d45ea8e9c40dd303157f686e0d  store-assets/zh-03-full-page-result.png
970e0d687da8f7c0c7084a5ce0f538945a958ef3eb556ee9d4f829d715df1e44  store-assets/en-01-scheduled-capture.png
5c562a18df145486d719d5e3f6d28ef80dc145d4e3b58c216ede34529125e5ee  store-assets/en-02-full-page-options.png
1f9af6471485430492c7221e0e0e9640b8c7457f856d9d5db7090079c35672cd  store-assets/en-03-full-page-result.png
05f41a860e1c514ba4fad154121db003c8a11b19b63fb8270ab3e51cf29947df  store-assets/promo-tile.svg
c2b0fa88f977239cf2e21f146bda832360c85c38f78f7d8de3646ac8034e025b  store-assets/promo-tile.png
```

## 证据保全建议

每次提交 Chrome Web Store 前，保留下列内容：对应 Git commit、上传 ZIP、商店文案导出、所有 PNG/SVG 及其哈希、审核邮件与后台截图。发生争议时以原始源文件和 Git 历史说明独立创作过程，不修改旧版本的证据文件。
