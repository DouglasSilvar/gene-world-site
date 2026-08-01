/**
 * GeneWorld Analytics — camada única de marketing.
 *
 * Hoje: Meta Pixel
 * Futuro: GA4, TikTok Pixel, etc. — adicionar provedores sem tocar no HTML.
 *
 * Eventos atuais (somente ações confirmadas):
 *   PageView, ViewContent,
 *   SteamWishlistClick, SteamDemoClick,
 *   YouTubeClick, DiscordClick, InstagramClick, TikTokClick,
 *   SpotifyClick, RedditClick, MediaKitClick
 */
(function (window, document) {
  'use strict';

  var PIXEL_ID = '2462649234147181';
  var STEAM_APP_ID = '4717910';

  var VIEW_CONTENT_PARAMS = {
    content_name: 'Gene World',
    content_ids: [STEAM_APP_ID],
    content_type: 'product',
    content_category: 'game',
  };

  /** @type {Array<{name: string, track: Function, trackCustom: Function}>} */
  var providers = [];

  var ready = false;

  function ensureFbq() {
    if (window.fbq) return;
    /* eslint-disable */
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
  }

  function createMetaProvider() {
    ensureFbq();
    window.fbq('init', PIXEL_ID);

    return {
      name: 'meta',
      track: function (eventName, params) {
        if (typeof window.fbq !== 'function') return;
        if (params) window.fbq('track', eventName, params);
        else window.fbq('track', eventName);
      },
      trackCustom: function (eventName, params) {
        if (typeof window.fbq !== 'function') return;
        if (params) window.fbq('trackCustom', eventName, params);
        else window.fbq('trackCustom', eventName);
      },
    };
  }

  function dispatchStandard(eventName, params) {
    for (var i = 0; i < providers.length; i++) {
      providers[i].track(eventName, params);
    }
  }

  function dispatchCustom(eventName, params) {
    for (var i = 0; i < providers.length; i++) {
      providers[i].trackCustom(eventName, params);
    }
  }

  function isHomePage() {
    var path = (window.location.pathname || '/').toLowerCase();
    return path.indexOf('/mediakit') === -1;
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

  /**
   * Infere o evento a partir do destino do link (sem data-gw-event).
   * Só retorna eventos de ação confirmada (clique).
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
      host === 'youtube.com' ||
      host === 'www.youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'youtu.be' ||
      host === 'music.youtube.com'
    ) {
      return 'YouTubeClick';
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

    // PageView / ViewContent não são disparados por clique.
    if (eventName === 'PageView' || eventName === 'ViewContent') return;

    GeneWorldAnalytics.trackCustom(eventName);
  }

  function bindClickTracking() {
    document.addEventListener('click', onDocumentClick, true);
  }

  var GeneWorldAnalytics = {
    /**
     * Registra um provedor adicional (GA4, TikTok, …) no futuro.
     * Espera { name, track(standardEvent, params), trackCustom(name, params) }.
     */
    registerProvider: function (provider) {
      if (!provider || typeof provider.track !== 'function' || typeof provider.trackCustom !== 'function') {
        return;
      }
      providers.push(provider);
    },

    track: function (eventName, params) {
      dispatchStandard(eventName, params);
    },

    trackCustom: function (eventName, params) {
      dispatchCustom(eventName, params);
    },

    pageView: function () {
      dispatchStandard('PageView');
    },

    viewContent: function (params) {
      dispatchStandard('ViewContent', params || VIEW_CONTENT_PARAMS);
    },

    steamWishlistClick: function () {
      dispatchCustom('SteamWishlistClick');
    },

    steamDemoClick: function () {
      dispatchCustom('SteamDemoClick');
    },

    youtubeClick: function () {
      dispatchCustom('YouTubeClick');
    },

    discordClick: function () {
      dispatchCustom('DiscordClick');
    },

    instagramClick: function () {
      dispatchCustom('InstagramClick');
    },

    tiktokClick: function () {
      dispatchCustom('TikTokClick');
    },

    spotifyClick: function () {
      dispatchCustom('SpotifyClick');
    },

    redditClick: function () {
      dispatchCustom('RedditClick');
    },

    mediaKitClick: function () {
      dispatchCustom('MediaKitClick');
    },

    /** @private — preparado; só usar com player próprio no futuro. */
    // trailerPlay / gameplayPlay intencionalmente ausentes nesta versão.

    init: function () {
      if (ready) return;
      ready = true;

      providers.push(createMetaProvider());
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

  window.GeneWorldAnalytics = GeneWorldAnalytics;
  GeneWorldAnalytics.init();
})(window, document);
