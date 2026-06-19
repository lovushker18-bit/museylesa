// Музей леса — interactions
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header background on scroll ---------- */
  var header = document.getElementById("siteHeader");
  function updateHeader() {
    if (window.scrollY > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  updateHeader();

  /* ---------- Trail path draw-on-scroll ---------- */
  var path = document.getElementById("trailPath");
  var trailWrap = document.querySelector(".trail-wrap");
  var pathLength = 0;

  function setupTrail() {
    if (!path) return;
    pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength;
    if (reduceMotion) {
      path.style.strokeDashoffset = 0;
    } else {
      path.style.strokeDashoffset = pathLength;
    }
  }

  function updateTrail() {
    if (!path || !trailWrap || reduceMotion) return;
    var rect = trailWrap.getBoundingClientRect();
    var viewportH = window.innerHeight;
    var total = rect.height;
    if (total <= 0) return;
    // progress: how far the trail container has scrolled past the top of viewport
    var scrolled = viewportH - rect.top;
    var progress = scrolled / (total + viewportH * 0.3);
    progress = Math.max(0, Math.min(1, progress));
    var offset = pathLength * (1 - progress);
    path.style.strokeDashoffset = offset;
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Copy to clipboard (phone / email) ---------- */
  var toast = document.getElementById("copyToast");
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2000);
  }

  function fallbackCopy(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
    } catch (e) {
      /* no-op */
    }
    document.body.removeChild(textarea);
  }

  document.querySelectorAll(".copy-value").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy") || "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(
          function () {
            showToast("Скопировано: " + value);
          },
          function () {
            fallbackCopy(value);
            showToast("Скопировано: " + value);
          }
        );
      } else {
        fallbackCopy(value);
        showToast("Скопировано: " + value);
      }
    });
  });

  /* ---------- Scroll listener (throttled via rAF) ---------- */
  var ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateHeader();
        updateTrail();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    setupTrail();
    updateTrail();
  });

  window.addEventListener("load", function () {
    setupTrail();
    updateTrail();
  });

  // In case fonts/images shift layout after initial load
  setTimeout(function () {
    setupTrail();
    updateTrail();
  }, 600);
})();
