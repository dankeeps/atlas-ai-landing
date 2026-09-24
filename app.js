(() => {
  'use strict';

  const platforms = {
    mac: {
      command: 'curl -fsSL https://raw.githubusercontent.com/dankeeps/atlas-editor/main/install.sh | bash',
      label: 'Terminal · macOS',
      note: 'Abra Aplicativos → Utilitários → Terminal e cole o comando. O instalador prepara o ambiente e cria o atalho do Atlas Editor.',
    },
    windows: {
      command: 'irm https://raw.githubusercontent.com/dankeeps/atlas-editor/main/install.ps1 | iex',
      label: 'PowerShell · Windows',
      note: 'Abra o PowerShell pelo menu Iniciar e cole o comando. O instalador verifica as dependências; não é necessário usar WSL.',
    },
    linux: {
      command: 'curl -fsSL https://raw.githubusercontent.com/dankeeps/atlas-editor/main/install.sh | bash',
      label: 'Terminal · Linux',
      note: 'Abra seu terminal e cole o comando. O Atlas precisa de Python 3.12 e FFmpeg; o instalador orienta a preparação do ambiente.',
    },
  };

  const tabs = Array.from(document.querySelectorAll('#platform-tabs [role="tab"][data-platform]'));
  const command = document.getElementById('install-command');
  const terminalLabel = document.getElementById('terminal-label');
  const terminalNote = document.getElementById('terminal-note');
  const panel = document.getElementById('install-panel');
  const copyButton = document.getElementById('copy-command');
  const copyLabel = document.getElementById('copy-label');
  const copyStatus = document.getElementById('copy-status');
  const defaultCopyLabel = copyLabel?.textContent || 'Copiar comando';
  let copyTimer;

  function resetCopyFeedback() {
    window.clearTimeout(copyTimer);
    if (copyLabel) copyLabel.textContent = defaultCopyLabel;
    if (copyStatus) copyStatus.textContent = '';
    copyButton?.classList.remove('copied');
  }

  function activateTab(tab, focus = false) {
    const platform = platforms[tab.dataset.platform];
    if (!platform) return;

    tabs.forEach((item) => {
      const selected = item === tab;
      item.id ||= `install-tab-${item.dataset.platform}`;
      item.setAttribute('aria-selected', String(selected));
      item.setAttribute('aria-controls', 'install-panel');
      item.tabIndex = selected ? 0 : -1;
      item.classList.toggle('active', selected);
    });
    if (command) command.textContent = platform.command;
    if (terminalLabel) terminalLabel.textContent = platform.label;
    if (terminalNote) terminalNote.textContent = platform.note;
    if (panel) panel.setAttribute('aria-labelledby', tab.id);
    resetCopyFeedback();
    if (focus) tab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      activateTab(tabs[next], true);
    });
  });
  const initialTab = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0];
  if (initialTab) activateTab(initialTab);

  copyButton?.addEventListener('click', async () => {
    if (!command) return;
    resetCopyFeedback();
    const text = command.textContent.trim();
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      if (copyLabel) copyLabel.textContent = 'Copiado!';
      if (copyStatus) copyStatus.textContent = 'Comando copiado. Cole no terminal indicado para instalar.';
      copyButton.classList.add('copied');
      copyTimer = window.setTimeout(() => {
        if (copyLabel) copyLabel.textContent = defaultCopyLabel;
        copyButton.classList.remove('copied');
      }, 2400);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(command);
      selection?.removeAllRanges();
      selection?.addRange(range);
      if (copyLabel) copyLabel.textContent = 'Selecione e copie';
      if (copyStatus) {
        copyStatus.textContent = 'Não foi possível copiar automaticamente. O comando está selecionado: use ⌘C no Mac ou Ctrl+C no Windows e Linux.';
      }
    }
  });

  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  function closeMenu(restoreFocus = false) {
    if (!mobileNav || !menuToggle) return;
    mobileNav.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir navegação');
    if (restoreFocus) menuToggle.focus();
  }
  menuToggle?.addEventListener('click', () => {
    if (!mobileNav) return;
    const opening = mobileNav.hidden;
    mobileNav.hidden = !opening;
    menuToggle.setAttribute('aria-expanded', String(opening));
    menuToggle.setAttribute('aria-label', opening ? 'Fechar navegação' : 'Abrir navegação');
  });
  mobileNav?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileNav && !mobileNav.hidden) closeMenu(true);
  });
  const desktopViewport = window.matchMedia('(min-width: 701px)');
  desktopViewport.addEventListener('change', (event) => {
    if (event.matches) closeMenu();
  });

  const previewDialog = document.getElementById('preview-dialog');
  let previewTrigger;
  let moveToInstallation = false;
  let previousBodyOverflow = '';
  document.querySelectorAll('[data-open-preview]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      if (!previewDialog || previewDialog.open) return;
      event.preventDefault();
      previewTrigger = trigger;
      moveToInstallation = false;
      previousBodyOverflow = document.body.style.overflow;
      previewDialog.showModal();
      document.body.style.overflow = 'hidden';
      document.getElementById('close-preview')?.focus();
    });
  });
  document.getElementById('close-preview')?.addEventListener('click', () => previewDialog?.close());
  document.getElementById('preview-install')?.addEventListener('click', (event) => {
    event.preventDefault();
    moveToInstallation = true;
    previewDialog?.close();
  });
  previewDialog?.addEventListener('click', (event) => {
    if (event.target !== previewDialog) return;
    const rect = previewDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      previewDialog.close();
    }
  });
  previewDialog?.addEventListener('close', () => {
    document.body.style.overflow = previousBodyOverflow;
    if (moveToInstallation) {
      window.requestAnimationFrame(() => {
        tabs.find((tab) => tab.getAttribute('aria-selected') === 'true')?.focus({ preventScroll: true });
        document.getElementById('instalar')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      });
    } else if (previewTrigger?.isConnected) {
      previewTrigger.focus();
    }
  });

  const reveals = document.querySelectorAll('.reveal');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.documentElement.classList.add('js-enabled');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    reveals.forEach((element) => element.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    reveals.forEach((element) => observer.observe(element));
    reducedMotion.addEventListener('change', (event) => {
      if (!event.matches) return;
      observer.disconnect();
      reveals.forEach((element) => element.classList.add('is-visible'));
    });
  }

  const header = document.querySelector('.site-header');
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 16);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
})();
