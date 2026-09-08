/**
 * Shared responsive navigation behavior.
 * Plain JS, no dependencies.
 */
(function () {
  "use strict";

  var popupTimer = null;
  var drawer = document.getElementById("site-drawer");
  var popup = document.getElementById("premium-popup");
  var gooStage = document.querySelector(".goo-stage");
  var gooBlob = document.querySelector(".goo-blob");
  var siteHeader = document.querySelector(".site-header");
  var desktopBreakpoint = window.matchMedia("(min-width: 1024px)");
  var lastScrollY = window.scrollY;
  var lastScrollAt = Date.now();
  var lastScrollDirection = "stationary";
  var upwardBurstActive = false;
  var upwardBurstCount = 0;
  var upwardBurstStartedAt = 0;
  var upwardBurstResetTimer = null;
  var subscriberBottomRevealTimer = null;

  function qsa(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function setBodyLock(locked) {
    document.body.classList.toggle("is-locked", locked);
  }

  function buildIcons() {
    var icons = {
      crown: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 7l5.5 3L12 5l3.5 5L21 7l-2 9H5zm2-2h10l.7-3.1-2.4 1.4L12 8.5 9.7 12.3 7.3 10.9 7 14z"></path><path d="M7 18h10v2H7z"></path></svg>',
      home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
      mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line><line x1="8" y1="22" x2="16" y2="22"></line></svg>',
      menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',
      search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
      user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle><path d="M2.5 11.5c.9.2 1.8.9 2.4 1.8"></path></svg>',
      close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
      arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
      paper: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"></path><path d="M9 6h6"></path><path d="M9 10h6"></path><path d="M9 14h4"></path></svg>',
      book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
      map: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 4.5l-6 2.1-4-1.6A1 1 0 004 5.9v13.2a1 1 0 00.62.92l4.38 1.75 6-2.1 4 1.6a1 1 0 001.38-.92V7.16a1 1 0 00-.62-.92L15 4.5zm-5 15.1l-4-1.5V7.4l4 1.5v10.7zm1-10.7l4-1.4v10.7l-4 1.4V8.9zm9 9.7l-4-1.5V6.4l4 1.5v10.7z"></path></svg>',
      megaphone: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4.5a1 1 0 00-1.56-.83L13.7 7H6a2 2 0 00-2 2v3.5a2 2 0 001.6 1.96l.92 4.6A2 2 0 008.48 21h1.12a2 2 0 001.96-2.39l-.72-3.61h2.86l4.74 3.33A1 1 0 0020 17.5v-13zm-9.76 14.29a.5.5 0 01-.49.61H8.48a.5.5 0 01-.49-.4l-.8-4h2.24l.81 4.05zM18.5 15.57L14 12.4V9.6l4.5-3.17v9.14z"></path></svg>'
    };

    qsa("[data-icon]").forEach(function (element) {
      var iconName = element.getAttribute("data-icon");

      if (iconName === "book" || iconName === "map") {
        element.classList.add("magazine-icon");
        element.innerHTML = "";
        return;
      }

      if (iconName === "paper") {
        element.classList.add("epaper-icon");
        element.innerHTML = "";
        return;
      }

      if (iconName === "crown") {
        var isProfileBadge =
          element.classList.contains("site-header__profile-badge") ||
          element.classList.contains("drawer__profile-badge");

        if (document.body.classList.contains("is-subscriber-view") && isProfileBadge) {
          element.classList.remove("premium-icon");
          element.classList.remove("premium-profile-icon");
          element.innerHTML = "";
        } else if (!isProfileBadge) {
          element.classList.add("premium-icon");
          element.innerHTML = "";
        } else {
          element.classList.remove("premium-icon");
          element.classList.remove("premium-profile-icon");
          element.innerHTML = icons.crown;
        }
        return;
      }

      var icon = icons[iconName];
      if (icon) {
        element.innerHTML = icon;
      }
    });
  }

  function positionGooNear(trigger) {
    if (!gooBlob) {
      return;
    }

    var rect = trigger.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2;
    var centerY = rect.top + rect.height / 2;

    gooBlob.style.left = centerX - 60 + "px";
    gooBlob.style.top = centerY - 60 + "px";
  }

  function openPremiumPopup(trigger) {
    if (!popup || !gooStage) {
      return;
    }

    positionGooNear(trigger);
    gooStage.classList.remove("is-retract");
    gooStage.classList.add("is-active");

    window.clearTimeout(popupTimer);
    popupTimer = window.setTimeout(function () {
      popup.classList.add("is-open");
      gooStage.classList.add("is-retract");
      setBodyLock(true);
    }, 350);
  }

  function closePremiumPopup() {
    if (!popup || !gooStage) {
      return;
    }

    popup.classList.remove("is-open");
    window.clearTimeout(popupTimer);
    popupTimer = window.setTimeout(function () {
      gooStage.classList.remove("is-active");
      gooStage.classList.remove("is-retract");
      if (!drawer.classList.contains("is-open")) {
        setBodyLock(false);
      }
    }, 220);
  }

  function openDrawer() {
    if (!drawer) {
      return;
    }

    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    setBodyLock(true);
  }

  function closeDrawer() {
    if (!drawer) {
      return;
    }

    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");

    if (!popup.classList.contains("is-open")) {
      setBodyLock(false);
    }
  }

  function closeAllSubmenus() {
    qsa("[data-toggle-submenu]").forEach(function (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    });

    qsa(".drawer-card__submenu", drawer).forEach(function (submenu) {
      submenu.classList.remove("is-expanded");
    });
  }

  function toggleSubmenu(toggle) {
    var submenuId = toggle.getAttribute("aria-controls");
    var submenu = submenuId ? document.getElementById(submenuId) : null;
    var expanded = toggle.getAttribute("aria-expanded") === "true";

    if (!submenu) {
      return;
    }

    qsa("[data-toggle-submenu]", drawer).forEach(function (button) {
      if (button !== toggle) {
        button.setAttribute("aria-expanded", "false");
      }
    });

    qsa(".drawer-card__submenu", drawer).forEach(function (panel) {
      if (panel !== submenu) {
        panel.classList.remove("is-expanded");
      }
    });

    toggle.setAttribute("aria-expanded", String(!expanded));
    submenu.classList.toggle("is-expanded", !expanded);
  }

  function preventSearchSubmit() {
    qsa('form[role="search"]').forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
      });
    });
  }

  function updateCompactHeader() {
    if (!siteHeader || desktopBreakpoint.matches) {
      return;
    }

    var currentScrollY = window.scrollY;
    var currentScrollAt = Date.now();
    var subscriberView = document.body.classList.contains("is-subscriber-view");
    var movingDown = currentScrollY > lastScrollY;
    var movingUp = currentScrollY < lastScrollY;
    var scrollingDown = currentScrollY > lastScrollY + 4;
    var scrollingUp = currentScrollY < lastScrollY - 4;
    var fastUpwardGesture = false;

    if (movingDown || currentScrollY <= 8) {
      upwardBurstActive = false;
      upwardBurstCount = 0;
      upwardBurstStartedAt = 0;
      window.clearTimeout(upwardBurstResetTimer);
    } else if (movingUp) {
      if (!upwardBurstActive) {
        if (!upwardBurstStartedAt || currentScrollAt - upwardBurstStartedAt > 600) {
          upwardBurstCount = 0;
          upwardBurstStartedAt = currentScrollAt;
        }

        upwardBurstCount += 1;
        upwardBurstActive = true;

        if (upwardBurstCount >= 2) {
          fastUpwardGesture = true;
          upwardBurstCount = 0;
          upwardBurstStartedAt = 0;
        }
      }

      window.clearTimeout(upwardBurstResetTimer);
      upwardBurstResetTimer = window.setTimeout(function () {
        upwardBurstActive = false;
      }, 100);
    }

    if (subscriberView) {
      if (currentScrollY <= 8) {
        window.clearTimeout(subscriberBottomRevealTimer);
        siteHeader.classList.remove("is-compact");
        siteHeader.classList.remove("is-menu-hidden");
        siteHeader.classList.remove("is-utility-hidden");
        document.body.classList.remove("is-subscriber-bottom-hidden");
      } else if (fastUpwardGesture) {
        window.clearTimeout(subscriberBottomRevealTimer);
        siteHeader.classList.remove("is-compact");
        siteHeader.classList.remove("is-menu-hidden");
        siteHeader.classList.remove("is-utility-hidden");
        document.body.classList.remove("is-subscriber-bottom-hidden");
      } else if (scrollingDown) {
        window.clearTimeout(subscriberBottomRevealTimer);
        siteHeader.classList.add("is-compact");
        siteHeader.classList.remove("is-menu-hidden");
        siteHeader.classList.add("is-utility-hidden");
        document.body.classList.add("is-subscriber-bottom-hidden");
      } else if (scrollingUp) {
        window.clearTimeout(subscriberBottomRevealTimer);
        siteHeader.classList.add("is-compact");
        siteHeader.classList.remove("is-menu-hidden");
        siteHeader.classList.add("is-utility-hidden");
        document.body.classList.remove("is-subscriber-bottom-hidden");
      }

      if (currentScrollY > 8) {
        window.clearTimeout(subscriberBottomRevealTimer);
        subscriberBottomRevealTimer = window.setTimeout(function () {
          document.body.classList.remove("is-subscriber-bottom-hidden");
        }, 3000);
      }
    } else if (currentScrollY <= 8 || scrollingUp) {
      siteHeader.classList.remove("is-compact");
      document.body.classList.remove("is-subscriber-bottom-hidden");
      document.body.classList.remove("is-nonsubscriber-bottom-hidden");
    } else if (scrollingDown) {
      siteHeader.classList.add("is-compact");
      document.body.classList.remove("is-subscriber-bottom-hidden");
      document.body.classList.add("is-nonsubscriber-bottom-hidden");
    }

    lastScrollY = currentScrollY;
    lastScrollAt = currentScrollAt;
    if (scrollingUp) {
      lastScrollDirection = "up";
    } else if (scrollingDown) {
      lastScrollDirection = "down";
    }
  }

  function bindScrollBehavior() {
    window.addEventListener("scroll", updateCompactHeader, { passive: true });
  }

  function bindEvents() {
    document.body.addEventListener("click", function (event) {
      var premiumTrigger = event.target.closest("[data-premium-badge]");
      var drawerTrigger = event.target.closest("[data-open-drawer]");
      var closeDrawerTrigger = event.target.closest("[data-close-drawer]");
      var closePopupTrigger = event.target.closest("[data-close-popup]");
      var submenuToggle = event.target.closest("[data-toggle-submenu]");
      var subscriberToggle = event.target.closest("[data-subscriber-toggle]");

      if (premiumTrigger) {
        event.preventDefault();
        openPremiumPopup(premiumTrigger);
        return;
      }

      if (subscriberToggle) {
        event.preventDefault();
        var isSubscriberView = subscriberToggle.getAttribute("aria-pressed") === "true";
        subscriberToggle.setAttribute("aria-pressed", String(!isSubscriberView));
        document.body.classList.toggle("is-subscriber-view", !isSubscriberView);
        buildIcons();
        document.body.classList.remove("is-subscriber-bottom-hidden");
        document.body.classList.remove("is-nonsubscriber-bottom-hidden");
        window.clearTimeout(subscriberBottomRevealTimer);
        siteHeader.classList.remove("is-compact");
        siteHeader.classList.remove("is-menu-hidden");
        siteHeader.classList.remove("is-utility-hidden");
        return;
      }

      if (drawerTrigger) {
        event.preventDefault();
        openDrawer();
        return;
      }

      if (closeDrawerTrigger) {
        event.preventDefault();
        closeDrawer();
        return;
      }

      if (closePopupTrigger) {
        event.preventDefault();
        closePremiumPopup();
        return;
      }

      if (submenuToggle) {
        event.preventDefault();
        toggleSubmenu(submenuToggle);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeDrawer();
        closePremiumPopup();
      }
    });

    desktopBreakpoint.addEventListener("change", function () {
      closeDrawer();
      closeAllSubmenus();
      siteHeader.classList.remove("is-compact");
      siteHeader.classList.remove("is-menu-hidden");
      siteHeader.classList.remove("is-utility-hidden");
      document.body.classList.remove("is-subscriber-bottom-hidden");
      document.body.classList.remove("is-nonsubscriber-bottom-hidden");
    });
  }

  function init() {
    buildIcons();
    preventSearchSubmit();
    bindEvents();
    bindScrollBehavior();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
