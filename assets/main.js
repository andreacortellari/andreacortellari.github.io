// Behaviour for the page. Your text lives in the _data folder, not here.

// 1. Latest translations, read from translations.json (refreshed daily by a GitHub Action)
(function () {
  var list = document.getElementById("translations");
  if (!list) return;
  var d = list.dataset;

  function add(parent, tag, text, cls) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    el.textContent = text;
    parent.appendChild(el);
    return el;
  }

  function link(parent, href, text) {
    var a = document.createElement("a");
    a.href = href;
    a.textContent = text;
    parent.appendChild(a);
    return a;
  }

  fetch(d.src)
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (items) {
      list.textContent = "";
      items.forEach(function (it) {
        var li = document.createElement("li");

        var h = document.createElement("h3");
        h.lang = "it";
        link(h, it.link, it.title);
        li.appendChild(h);

        var meta = d.pair;
        var date = new Date(it.date);
        if (!isNaN(date)) {
          meta += " · " + date.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
        }
        if (it.author) meta += " · " + d.originalBy + " " + it.author;
        add(li, "p", meta, "meta");

        if (it.summary) add(li, "p", it.summary).lang = "it";

        if (/^https:\/\//.test(it.original)) {
          var p = document.createElement("p");
          p.className = "links";
          link(p, it.original, d.originalLabel);
          li.appendChild(p);
        }

        list.appendChild(li);
      });
    })
    .catch(function () {
      list.textContent = "";
      var li = document.createElement("li");
      link(li, d.allUrl, d.fallback);
      list.appendChild(li);
    });
})();

// 2. Tabs
(function () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tabs .tab"));
  if (!tabs.length) return;

  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
  }

  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(t); });
    t.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, true); }
    });
  });

  select(tabs[0]);
})();

// 3. Email link: the address is assembled here, so simple scrapers reading the HTML don't find it
(function () {
  var a = document.getElementById("email-link");
  if (!a || !a.dataset.parts) return;
  var parts = a.dataset.parts.split("|");
  a.href = "mailto:" + parts[0] + "@" + parts.slice(1).join(".");
  a.hidden = false;
})();

// 4. Footer date: last commit that touched the content folder (data-path)
(function () {
  var el = document.getElementById("last-updated");
  if (!el) return;

  fetch("https://api.github.com/repos/" + el.dataset.user + "/" + el.dataset.repo + "/commits?path=" + encodeURIComponent(el.dataset.path || "_data") + "&per_page=1")
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(function (commits) {
      var d = new Date(commits[0].commit.committer.date);
      el.textContent = d.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
      el.setAttribute("datetime", d.toISOString());
    })
    .catch(function () {
      el.parentNode.hidden = true; // hide the line if the lookup fails
    });
})();
