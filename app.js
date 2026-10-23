'use strict';

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function closeMenu() {
  navigation?.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}
menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  navigation?.classList.toggle('open', !expanded);
});
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => {
  if (navigation && !navigation.contains(event.target) && !menuButton?.contains(event.target)) closeMenu();
});

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const projectCards = [...document.querySelectorAll('.project[data-category]')];
filterButtons.forEach(button => button.addEventListener('click', () => {
  const selected = button.dataset.filter;
  filterButtons.forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  let visible = 0;
  projectCards.forEach(card => {
    const matches = selected === 'all' || card.dataset.category === selected;
    card.hidden = !matches;
    if (matches) visible++;
  });
  document.querySelector('#filter-status').textContent = `${visible} ${visible === 1 ? 'project' : 'projects'} shown.`;
}));

const dialog = document.querySelector('#project-dialog');
const content = document.querySelector('#dialog-content');
let activeOpener;
document.querySelectorAll('a[data-project]').forEach(link => {
  link.addEventListener('click', async event => {
    if (!dialog || typeof dialog.showModal !== 'function' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    try {
      const response = await fetch(link.href);
      if (!response.ok) throw new Error('Project could not be loaded');
      const parsed = new DOMParser().parseFromString(await response.text(), 'text/html');
      const article = parsed.querySelector('.case-inner');
      if (!article) throw new Error('Project not found');
      article.querySelectorAll('[src], [href]').forEach(element => {
        for (const attribute of ['src', 'href']) {
          if (element.hasAttribute(attribute)) element.setAttribute(attribute, new URL(element.getAttribute(attribute), link.href).href);
        }
      });
      const title = article.querySelector('h1');
      const heading = document.createElement('h2');
      heading.id = 'dialog-title';
      heading.textContent = title.textContent;
      title.replaceWith(heading);
      content.replaceChildren(article);
      activeOpener = link;
      dialog.showModal();
      dialog.scrollTop = 0;
      document.body.classList.add('dialog-open');
    } catch {
      window.location.assign(link.href);
    }
  });
});
document.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
dialog?.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  activeOpener?.focus();
});

document.querySelector('.copy-email')?.addEventListener('click', async () => {
  const status = document.querySelector('.copy-status');
  try {
    if (!navigator.clipboard) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText('rajulu@kth.se');
    status.textContent = 'Copied to clipboard';
  } catch {
    status.textContent = 'Email: rajulu@kth.se';
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('.email-link'));
    selection.removeAllRanges();
    selection.addRange(range);
  }
});
