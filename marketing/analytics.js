/**
 * GeneWorld Analytics — camada de abstração de marketing.
 *
 * O restante do projeto só chama:
 *   Analytics.pageView()
 *   Analytics.viewContent()
 *   Analytics.track("SteamWishlistClick", { ... })
 *
 * Provedores (Meta, GA4, TikTok, …) ficam em marketing/providers/.
 * Nenhum arquivo fora de providers/ deve chamar fbq() / gtag() / ttq().
 */
(function (window, document) {
  'use strict';

  if (typeof Object.assign !== 'function') {
    Object.assign = function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var src = arguments[i];
        if (!src) continue;
        for (var key in src) {
          if (Object.prototype.hasOwnProperty.call(src, key)) target[key] = src[key];
        }
      }
      return target;
    };
  }

  var STEAM_APP_ID = '4717910';
  var STORAGE_KEY = 'geneworld.lang';
  var SUPPORTED_LANGS = { 'pt-BR': true, en: true, 'es-ES': true };

  var STANDARD_EVENT_NAMES = {
    PageView: true,
    ViewContent: true,
  };

  /** @type {Array<{name: string, enabled?: boolean, init?: Function, track: Function}>} */
  var providers = [];
  var ready = false;

  function normalizeLang(lang) {
    if (!lang) return 'pt-BR';
    var lower = String(lang).toLowerCase();
    if (lower === 'pt' || lower === 'pt-br') return 'pt-BR';
    if (lower === 'en' || lower === 'en-us' || lower === 'en-gb') return 'en';
    if (lower === 'es' || lower === 'es-es') return 'es-ES';
    if (SUPPORTED_LANGS[lang]) return lang;
    return 'pt-BR';
  }

  function getLanguage() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get('lang')) return normalizeLang(params.get('lang'));
    } catch (err) {
      /* ignore */
    }

    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) return normalizeLang(stored);
    } catch (err2) {
      /* ignore */
    }

    if (document.documentElement && document.documentElement.lang) {
      return normalizeLang(document.documentElement.lang);
    }

    return normalizeLang(navigator.language || 'pt-BR');
  }

  function getPageName() {
    var path = (window.location.pathname || '/').toLowerCase();
    if (path.indexOf('/mediakit') !== -1) return 'mediakit';
    return 'home';
  }

  function isHomePage() {
    return getPageName() === 'home';
  }

  function mergeParams(extra) {
    var base = {
      language: getLanguage(),
      page: getPageName(),
    };
    if (!extra) return base;
    return Object.assign({}, base, extra);
  }

  function dispatch(eventName, params) {
    var payload = mergeParams(params);
    for (var i = 0; i < providers.length; i++) {
      var provider = providers[i];
      if (provider.enabled === false) continue;
      if (typeof provider.track === 'function') {
        provider.track(eventName, payload);
      }
    }
  }

  function hostnameOf(href) {
    try {
      return new URL(href, window.location.href).hostname.toLowerCase();
    } catch (err) {
      return '';
    }
  }

  function pathOf(href) {
    try {
      return new URL(href, window.location.href).pathname.toLowerCase();
    } catch (err) {
      return '';
    }
  }

  function classListContains(el, token) {
    if (!el || !el.classList) return false;
    return el.classList.contains(token);
  }

  /**
   * Infere evento pelo destino / classes. Só ações confirmadas (clique).
   */
  function inferEventFromAnchor(anchor) {
    var href = anchor.getAttribute('href');
    if (!href || href.charAt(0) === '#') return null;

    var host = hostnameOf(href);
    var path = pathOf(href);

    if (/mediakit/i.test(path) || /\/mediakit\/?$/i.test(href)) {
      return 'MediaKitClick';
    }

    if (
      classListContains(anchor, 'nav-icon-link--youtube-music') ||
      classListContains(anchor, 'discography-link--youtube') ||
      host === 'music.youtube.com' ||
      ((host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com') &&
        path.indexOf('/playlist') === 0)
    ) {
      return 'YouTubeMusicClick';
    }

    if (
      host === 'youtube.com' ||
      host === 'www.youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'youtu.be'
    ) {
      return 'YouTubeClick';
    }

    if (
      classListContains(anchor, 'nav-icon-link--apple') ||
      classListContains(anchor, 'discography-link--apple') ||
      host === 'music.apple.com' ||
      host === 'itunes.apple.com'
    ) {
      return 'AppleMusicClick';
    }

    if (host === 'discord.gg' || host === 'www.discord.gg' || host === 'discord.com' || host === 'www.discord.com') {
      return 'DiscordClick';
    }

    if (host === 'instagram.com' || host === 'www.instagram.com') {
      return 'InstagramClick';
    }

    if (host === 'tiktok.com' || host === 'www.tiktok.com') {
      return 'TikTokClick';
    }

    if (host === 'open.spotify.com' || host === 'spotify.com' || host === 'www.spotify.com') {
      return 'SpotifyClick';
    }

    if (host === 'reddit.com' || host === 'www.reddit.com' || host.indexOf('reddit.com') !== -1) {
      return 'RedditClick';
    }

    return null;
  }

  function resolveEventName(anchor) {
    var explicit = anchor.getAttribute('data-gw-event');
    if (explicit) return explicit;
    return inferEventFromAnchor(anchor);
  }

  function onDocumentClick(event) {
    var anchor = event.target && event.target.closest ? event.target.closest('a') : null;
    if (!anchor || !document.documentElement.contains(anchor)) return;

    var eventName = resolveEventName(anchor);
    if (!eventName) return;
    if (STANDARD_EVENT_NAMES[eventName]) return;

    Analytics.track(eventName);
  }

  function bindClickTracking() {
    document.addEventListener('click', onDocumentClick, true);
  }

  function registerBuiltInProviders() {
    var registry = window.GeneWorldProviders || {};
    var names = ['meta', 'google', 'tiktok'];
    for (var i = 0; i < names.length; i++) {
      var provider = registry[names[i]];
      if (provider && provider.enabled !== false && typeof provider.track === 'function') {
        if (typeof provider.init === 'function') provider.init();
        providers.push(provider);
      }
    }
  }

  var Analytics = {
    /**
     * Registra provedor adicional em runtime.
     * Espera { name, track(eventName, params), init?, enabled? }.
     */
    registerProvider: function (provider) {
      if (!provider || typeof provider.track !== 'function') return;
      if (provider.enabled === false) return;
      if (typeof provider.init === 'function') provider.init();
      providers.push(provider);
    },

    getLanguage: getLanguage,
    getPage: getPageName,

    /**
     * Dispara qualquer evento (padrão ou custom) para todos os provedores ativos.
     * Sempre inclui language e page; params extras são mesclados.
     */
    track: function (eventName, params) {
      if (!eventName) return;
      dispatch(eventName, params);
    },

    pageView: function (params) {
      dispatch('PageView', params);
    },

    viewContent: function (params) {
      var defaults = {
        content_name: 'Gene World',
        content_ids: [STEAM_APP_ID],
        content_type: 'product',
        content_category: 'game',
      };
      dispatch('ViewContent', Object.assign({}, defaults, params || {}));
    },

    init: function () {
      if (ready) return;
      ready = true;

      registerBuiltInProviders();

      this.pageView();

      if (isHomePage()) {
        this.viewContent();
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindClickTracking);
      } else {
        bindClickTracking();
      }
    },
  };

  window.Analytics = Analytics;
  window.GeneWorldAnalytics = Analytics;
  Analytics.init();
})(window, document);
