function msg(key, substitutions) {
  const value = chrome.i18n.getMessage(key, substitutions);
  return value || key;
}

function localizeDocument() {
  const locale = chrome.i18n.getUILanguage();
  document.documentElement.lang = locale.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';

  const titleKey = document.documentElement.dataset.i18nDocumentTitle;
  if (titleKey) document.title = msg(titleKey);

  for (const el of document.querySelectorAll('[data-i18n]')) {
    el.textContent = msg(el.dataset.i18n);
  }
  for (const el of document.querySelectorAll('[data-i18n-placeholder]')) {
    el.placeholder = msg(el.dataset.i18nPlaceholder);
  }
  for (const el of document.querySelectorAll('[data-i18n-aria-label]')) {
    el.setAttribute('aria-label', msg(el.dataset.i18nAriaLabel));
  }
}

localizeDocument();
