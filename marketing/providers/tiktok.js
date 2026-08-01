/**
 * TikTok Pixel — stub preparado para ativação futura.
 * Não carregar no HTML até a integração real.
 */
(function (window) {
  'use strict';

  window.GeneWorldProviders = window.GeneWorldProviders || {};

  window.GeneWorldProviders.tiktok = {
    name: 'tiktok',
    enabled: false,

    init: function () {
      // TODO: ttq.load(PIXEL_ID)
    },

    track: function (eventName, params) {
      if (!this.enabled) return;
      // TODO: ttq.track(eventName, params)
      void eventName;
      void params;
    },
  };
})(window);
