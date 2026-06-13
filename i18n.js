(function () {
  var SUPPORTED = ["pt-BR", "en", "es-ES"];
  var DEFAULT_LANG = "pt-BR";
  var STORAGE_KEY = "geneworld.lang";

  var META = {
    "pt-BR": {
      title: "Gene World — RPG 2D procedural",
      description: "Gene World — RPG 2D com mapa procedural, 9 biomas e sistemas de armas, crafting e NPCs com IA.",
      ogLocale: "pt_BR",
      url: "https://geneworld.com.br/",
    },
    en: {
      title: "Gene World — Procedural 2D RPG",
      description: "Gene World — a 2D RPG with a procedural map, 9 biomes, and weapon, crafting, and AI-driven NPC systems.",
      ogLocale: "en_US",
      url: "https://geneworld.com.br/?lang=en",
    },
    "es-ES": {
      title: "Gene World — RPG 2D procedural",
      description: "Gene World — RPG 2D con mapa procedural, 9 biomas y sistemas de armas, crafting y NPC con IA.",
      ogLocale: "es_ES",
      url: "https://geneworld.com.br/?lang=es-ES",
    },
  };

  function normalizeLang(lang) {
    if (!lang) return DEFAULT_LANG;
    var lower = lang.toLowerCase();
    if (lower === "pt" || lower === "pt-br") return "pt-BR";
    if (lower === "en" || lower === "en-us" || lower === "en-gb") return "en";
    if (lower === "es" || lower === "es-es") return "es-ES";
    return DEFAULT_LANG;
  }

  function selectedLang() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("lang")) return normalizeLang(params.get("lang"));
    var stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return normalizeLang(stored);
    return normalizeLang(navigator.language || DEFAULT_LANG);
  }

  function persistLang(lang) {
    window.localStorage.setItem(STORAGE_KEY, lang);
    var url = new URL(window.location.href);
    if (lang === DEFAULT_LANG) url.searchParams.delete("lang");
    else url.searchParams.set("lang", lang);
    window.history.replaceState({}, "", url.toString());
  }

  function updateMetadata(lang) {
    var meta = META[lang] || META[DEFAULT_LANG];
    document.documentElement.lang = lang;
    document.title = meta.title;

    var ids = ["meta-description", "meta-og-description", "meta-twitter-description"];
    for (var i = 0; i < ids.length; i++) {
      var descEl = document.getElementById(ids[i]);
      if (descEl) descEl.setAttribute("content", meta.description);
    }

    var titleIds = ["meta-og-title", "meta-twitter-title"];
    for (var j = 0; j < titleIds.length; j++) {
      var t = document.getElementById(titleIds[j]);
      if (t) t.setAttribute("content", meta.title);
    }

    var ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute("content", meta.ogLocale);
    var ogUrl = document.getElementById("meta-og-url");
    if (ogUrl) ogUrl.setAttribute("content", meta.url);
  }

  function normalizeTextNodeValue(value) {
    var lead = value.match(/^\s*/);
    var tail = value.match(/\s*$/);
    return {
      lead: lead ? lead[0] : "",
      core: value.trim(),
      tail: tail ? tail[0] : "",
    };
  }

  function translateTextNodes(dictionary) {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      if (!node.parentElement) continue;
      var tag = node.parentElement.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") continue;

      var parts = normalizeTextNodeValue(node.nodeValue);
      if (!parts.core) continue;
      if (!Object.prototype.hasOwnProperty.call(dictionary, parts.core)) continue;
      node.nodeValue = parts.lead + dictionary[parts.core] + parts.tail;
    }
  }

  function translateAttributes(dictionary) {
    var all = document.querySelectorAll("[title],[aria-label]");
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.hasAttribute("title")) {
        var title = el.getAttribute("title");
        if (title && Object.prototype.hasOwnProperty.call(dictionary, title)) {
          el.setAttribute("title", dictionary[title]);
        }
      }
      if (el.hasAttribute("aria-label")) {
        var aria = el.getAttribute("aria-label");
        if (aria && Object.prototype.hasOwnProperty.call(dictionary, aria)) {
          el.setAttribute("aria-label", dictionary[aria]);
        }
      }
    }
  }

  function localizeLanguageOptions(lang) {
    var select = document.getElementById("lang-select");
    if (!select) return;
    // Mantém nomes nativos para facilitar a escolha do idioma em qualquer língua.
    var optionMap = {
      "pt-BR": "🇧🇷 Português (BR)",
      en: "🇺🇸 English",
      "es-ES": "🇪🇸 Español (ES)",
    };
    for (var i = 0; i < select.options.length; i++) {
      var option = select.options[i];
      if (optionMap[option.value]) option.textContent = optionMap[option.value];
    }
  }

  function bindSelector(lang) {
    var select = document.getElementById("lang-select");
    if (!select) return;
    select.value = lang;
    select.addEventListener("change", function () {
      var next = normalizeLang(select.value);
      persistLang(next);
      window.location.reload();
    });
  }

  function mergeCriticalOverrides(lang, dictionary) {
    if (lang === "en") {
      dictionary.Steam = "Steam";
      dictionary.GeneWorld = "GeneWorld";
    }
    if (lang === "es-ES") {
      dictionary.Steam = "Steam";
      dictionary.GeneWorld = "GeneWorld";
      dictionary["NPCs"] = "NPCs";
    }
    return dictionary;
  }

  function loadLocaleDictionary(lang) {
    if (lang === DEFAULT_LANG) return Promise.resolve({});
    return fetch("locales/" + lang + ".json", { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("Locale fetch failed: " + lang);
        return res.json();
      })
      .then(function (data) {
        return mergeCriticalOverrides(lang, data || {});
      })
      .catch(function () {
        return {};
      });
  }

  var lang = selectedLang();
  if (SUPPORTED.indexOf(lang) < 0) lang = DEFAULT_LANG;
  persistLang(lang);
  updateMetadata(lang);

  loadLocaleDictionary(lang).then(function (dictionary) {
    translateTextNodes(dictionary);
    translateAttributes(dictionary);
    localizeLanguageOptions(lang);
    bindSelector(lang);
  });
})();
