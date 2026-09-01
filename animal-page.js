// Музей леса — страница обитателя, добавленного через форму на сайте.
// Данные лежат в localStorage того браузера, где карточку создали.
(function () {
  "use strict";

  var STORAGE_KEY = "museyLesa_extraAnimals";
  var root = document.getElementById("animalRoot");
  if (!root) return;

  function readCards() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function param(name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : null;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function renderMissing() {
    root.textContent = "";
    var section = el("section", "section section-light");
    section.style.paddingTop = "140px";
    var inner = el("div", "section-inner");
    inner.style.paddingLeft = "0";

    var back = el("a", "back-link back-link--dark", "← Все обитатели");
    back.href = "animals.html";

    var h1 = el("h1", null, "Карточка не найдена");
    h1.style.fontSize = "clamp(2rem, 5vw, 3rem)";

    var p = el(
      "p",
      null,
      "Карточки, добавленные через форму на сайте, сохраняются только в том браузере, где их создали. " +
        "На другом устройстве эта страница будет пустой. Чтобы обитатель появился у всех посетителей, " +
        "передайте фото и описание создателю сайта."
    );

    var btn = el("a", "btn btn-amber", "Вернуться к списку");
    btn.href = "animals.html";
    btn.style.marginTop = "1.2em";

    inner.appendChild(back);
    inner.appendChild(h1);
    inner.appendChild(p);
    inner.appendChild(btn);
    section.appendChild(inner);
    root.appendChild(section);
  }

  function renderCard(card) {
    root.textContent = "";
    document.title = card.name + " — Музей леса, Светлогорск";

    /* ---------- Hero ---------- */
    var hero = el("section", "hero hero--animal");
    var media = el("div", "hero-media");
    var img = el("img");
    img.src = card.image;
    img.alt = card.name + " — обитатель Музея леса";
    media.appendChild(img);
    media.appendChild(el("div", "hero-overlay"));

    var heroContent = el("div", "hero-content");
    heroContent.appendChild(el("p", "eyebrow", card.tag || "Новый житель"));
    heroContent.appendChild(el("h1", null, card.name));
    if (card.latin) heroContent.appendChild(el("p", "hero-latin", card.latin));

    hero.appendChild(media);
    hero.appendChild(heroContent);

    /* ---------- Body ---------- */
    var section = el("section", "section section-light");
    var inner = el("div", "section-inner");
    inner.style.paddingLeft = "0";

    var back = el("a", "back-link back-link--dark", "← Все обитатели");
    back.href = "animals.html";
    inner.appendChild(back);

    var layout = el("div", "animal-layout");
    var body = el("div", "animal-detail-body");

    String(card.description || "")
      .split(/\n{2,}|\n/)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean)
      .forEach(function (text) {
        body.appendChild(el("p", null, text));
      });

    var notice = (card.notice || []).filter(function (n) {
      return n && n.trim();
    });
    if (notice.length) {
      var block = el("div", "notice-block");
      block.appendChild(el("h2", "notice-title", "На что посмотреть у вольера"));
      var ul = el("ul", "notice-list");
      notice.forEach(function (n) {
        ul.appendChild(el("li", null, n.trim()));
      });
      block.appendChild(ul);
      body.appendChild(block);
    }
    layout.appendChild(body);

    var facts = [
      ["Группа", card.group],
      ["Чем питается", card.food],
      ["Когда активен", card.active],
      ["Где искать", card.place]
    ].filter(function (row) {
      return row[1] && String(row[1]).trim();
    });

    if (facts.length) {
      var aside = el("aside", "field-card");
      aside.setAttribute("aria-label", "Краткие сведения о виде");
      aside.appendChild(el("p", "field-card-title", "Коротко о виде"));
      var dl = el("dl", "field-list");
      facts.forEach(function (row) {
        var r = el("div", "field-row");
        r.appendChild(el("dt", null, row[0]));
        r.appendChild(el("dd", null, String(row[1]).trim()));
        dl.appendChild(r);
      });
      aside.appendChild(dl);
      layout.appendChild(aside);
    }
    inner.appendChild(layout);

    /* ---------- Actions ---------- */
    var actions = el("div", "animal-detail-actions");
    var a1 = el("a", "btn btn-amber", "Все обитатели");
    a1.href = "animals.html";
    var a2 = el("a", "btn btn-outline", "На главную");
    a2.href = "index.html";
    actions.appendChild(a1);
    actions.appendChild(a2);
    inner.appendChild(actions);

    /* ---------- Local-only notice ---------- */
    var localNote = el("div", "animal-share");
    localNote.appendChild(
      el(
        "span",
        "animal-share-label",
        "Эта карточка сохранена только в текущем браузере"
      )
    );
    localNote.appendChild(
      el(
        "p",
        "note",
        "Чтобы обитатель появился у всех посетителей сайта, передайте фото и описание создателю сайта."
      )
    );
    inner.appendChild(localNote);

    section.appendChild(inner);
    root.appendChild(hero);
    root.appendChild(section);
  }

  var id = param("id");
  if (!id) {
    renderMissing();
    return;
  }
  var found = readCards().filter(function (c) {
    return String(c.id) === String(id);
  })[0];

  if (found) {
    renderCard(found);
  } else {
    renderMissing();
  }
})();
