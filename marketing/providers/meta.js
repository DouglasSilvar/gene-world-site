/**
 * Meta Pixel provider — único ponto que fala com fbq().
 * Não usar fora de marketing/providers/.
 */
(function (window) {
  'use strict';

  var PIXEL_ID = '2462649234147181';

  var STANDARD_EVENTS = {
    PageView: true,
    ViewContent: true,
    Lead: true,
    CompleteRegistration: true,
    Contact: true,
    Search: true,
    AddToCart: true,
    AddToWishlist: true,
    InitiateCheckout: true,
    AddPaymentInfo: true,
    Purchase: true,
    Schedule: true,
    StartTrial: true,
    SubmitApplication: true,
    Subscribe: true,
  };

  function ensureFbq() {
    if (typeof window.fbq === 'function') return;

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
  }

  function send(eventName, params) {
    if (typeof window.fbq !== 'function') return;

    var isStandard = !!STANDARD_EVENTS[eventName];
    if (isStandard) {
      if (params) window.fbq('track', eventName, params);
      else window.fbq('track', eventName);
      return;
    }

    if (params) window.fbq('trackCustom', eventName, params);
    else window.fbq('trackCustom', eventName);
  }

  window.GeneWorldProviders = window.GeneWorldProviders || {};

  window.GeneWorldProviders.meta = {
    name: 'meta',
    enabled: true,

    init: function () {
      ensureFbq();
      window.fbq('init', PIXEL_ID);
    },

    /**
     * @param {string} eventName
     * @param {object} [params]
     */
    track: function (eventName, params) {
      send(eventName, params);
    },
  };
})(window);
