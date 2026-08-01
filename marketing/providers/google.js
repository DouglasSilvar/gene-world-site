/**
 * Google Analytics 4 — stub preparado para ativação futura.
 * Não carregar no HTML até a integração real.
 */
(function (window) {
  'use strict';

  window.GeneWorldProviders = window.GeneWorldProviders || {};

  window.GeneWorldProviders.google = {
    name: 'google',
    enabled: false,

    init: function () {
      // TODO: gtag('config', MEASUREMENT_ID)
    },

    track: function (eventName, params) {
      if (!this.enabled) return;
      // TODO: gtag('event', eventName, params)
      void eventName;
      void params;
    },
  };
})(window);
