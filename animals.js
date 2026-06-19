// Музей леса — страница "Все обитатели": добавление карточек админом
(function () {
  "use strict";

  var ADMIN_CODE = "musey";
  var STORAGE_KEY = "museyLesa_extraAnimals";
  var MAX_IMAGE_WIDTH = 900;
  var JPEG_QUALITY = 0.72;

  var overlay = document.getElementById("addModalOverlay");
  var openBtn = document.getElementById("openAddModal");
  var closeBtn = document.getElementById("closeAddModal");
  var cancelBtn = document.getElementById("cancelAddModal");
  var form = document.getElementById("addAnimalForm");
  var errorEl = document.getElementById("formError");
  var grid = document.getElementById("animalGrid");
  var ctaCard = grid ? grid.querySelector(".animal-cta") : null;

  function showToast(message) {
    var toast = document.getElementById("copyToast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  function openModal() {
    overlay.classList.add("is-open");
    errorEl.textContent = "";
    var firstField = document.getElementById("animalPhoto");
    if (firstField) firstField.focus();
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    form.reset();
    errorEl.textContent = "";
    if (openBtn) openBtn.focus();
  }

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  function readSavedCards() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCards(cards) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
      return true;
    } catch (e) {
      return false;
    }
  }

  function buildCardEl(card) {
    var fig = document.createElement("figure");
    fig.className = "animal-card local-card";
    fig.setAttribute("data-id", card.id);

    var img = document.createElement("img");
    img.src = card.image;
    img.alt = card.name;
    img.loading = "lazy";

    var del = document.createElement("button");
    del.type = "button";
    del.className = "local-card-delete";
    del.setAttribute("aria-label", "Удалить карточку");
    del.textContent = "✕";
    del.addEventListener("click", function () {
      var code = window.prompt("Введите код доступа, чтобы удалить карточку «" + card.name + "»:");
      if (code === null) return;
      if (code.trim().toLowerCase() !== ADMIN_CODE) {
        alert("Неверный код. Карточка не удалена.");
        return;
      }
      if (confirm("Удалить карточку «" + card.name + "»? Это действие необратимо.")) {
        removeCard(card.id);
        fig.remove();
      }
    });

    var figcaption = document.createElement("figcaption");
    var tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = "Новый житель";
    var strong = document.createElement("strong");
    strong.textContent = card.name;
    var p = document.createElement("p");
    p.textContent = card.description;

    figcaption.appendChild(tag);
    figcaption.appendChild(strong);
    figcaption.appendChild(p);

    fig.appendChild(img);
    fig.appendChild(del);
    fig.appendChild(figcaption);
    return fig;
  }

  function renderSavedCards() {
    if (!grid) return;
    var cards = readSavedCards();
    cards.forEach(function (card) {
      var el = buildCardEl(card);
      if (ctaCard) {
        grid.insertBefore(el, ctaCard);
      } else {
        grid.appendChild(el);
      }
    });
  }

  function removeCard(id) {
    var cards = readSavedCards().filter(function (c) {
      return String(c.id) !== String(id);
    });
    saveCards(cards);
  }

  function resizeImage(file, callback) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, MAX_IMAGE_WIDTH / img.width);
        var w = Math.round(img.width * scale);
        var h = Math.round(img.height * scale);
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.onerror = function () {
        callback(null);
      };
      img.src = e.target.result;
    };
    reader.onerror = function () {
      callback(null);
    };
    reader.readAsDataURL(file);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      errorEl.textContent = "";

      var photoInput = document.getElementById("animalPhoto");
      var nameInput = document.getElementById("animalName");
      var descInput = document.getElementById("animalDesc");
      var codeInput = document.getElementById("adminCode");

      var code = (codeInput.value || "").trim().toLowerCase();
      if (code !== ADMIN_CODE) {
        errorEl.textContent = "Неверный код доступа.";
        codeInput.focus();
        return;
      }

      var file = photoInput.files && photoInput.files[0];
      if (!file) {
        errorEl.textContent = "Выберите фото животного.";
        return;
      }
      var name = (nameInput.value || "").trim();
      var description = (descInput.value || "").trim();
      if (!name || !description) {
        errorEl.textContent = "Заполните название и описание.";
        return;
      }

      resizeImage(file, function (dataUrl) {
        if (!dataUrl) {
          errorEl.textContent = "Не получилось обработать фото. Попробуйте другой файл.";
          return;
        }
        var card = {
          id: Date.now(),
          name: name,
          description: description,
          image: dataUrl
        };
        var cards = readSavedCards();
        cards.push(card);
        var ok = saveCards(cards);
        var el = buildCardEl(card);
        if (ctaCard) {
          grid.insertBefore(el, ctaCard);
        } else if (grid) {
          grid.appendChild(el);
        }
        closeModal();
        if (ok) {
          showToast("Карточка добавлена в этом браузере");
        } else {
          showToast("Карточка показана, но не сохранилась (нет места в хранилище браузера)");
        }
      });
    });
  }

  renderSavedCards();
})();
