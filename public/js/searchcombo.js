function populateSelect(select, items, valueKey, textKey, placeholder) {
  select.innerHTML = '';
  const opt = document.createElement('option');
  opt.value = '';
  opt.textContent = placeholder;
  select.appendChild(opt);
  items.forEach(item => {
    const option = document.createElement('option');
    option.value = item[valueKey];
    option.textContent = item[textKey];
    select.appendChild(option);
  });
}

window.applyFilterAction = function applyFilterAction(filter) {
  const F1 = document.getElementById("F1");
  const F2 = document.getElementById("F2");
  const F3 = document.getElementById("F3");
  const F4 = document.getElementById("F4");

  function clearSelect(sel, placeholder) {
    if (sel) {
      sel.disabled = true;
      sel.innerHTML = '';
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = placeholder;
      sel.appendChild(opt);
    }
  }

  clearSelect(F2, "--- Choose Filter ---");
  clearSelect(F3, "--- Choose Filter ---");
  clearSelect(F4, "--- Choose Filter ---");

  if (filter === "category" || filter === "none") {
    if (F1) {
      F1.disabled = false;
      fetch('/api/category')
        .then(res => res.json())
        .then(categories => {
          populateSelect(F1, categories, 'category_name', 'category_name', '--- Choose Category ---');
        });
      F1.onchange = null;
      F2.onchange = null;
      F3.onchange = null;
    }
  } else if (filter === "location") {
    if (F1) {
      F1.disabled = false;
      fetch('/api/sites')
        .then(res => res.json())
        .then(sites => {
          populateSelect(F1, sites, 'site_name', 'site_name', '--- Choose Site ---');
        });

      F2.disabled = true;
      F3.disabled = true;
      F4.disabled = true;

      F1.onchange = function () {
        if (!F1.value) {
          clearSelect(F2, "--- Choose Room ---");
          clearSelect(F3, "--- Choose Area ---");
          clearSelect(F4, "--- Choose Specifier ---");
          return;
        }
        F2.disabled = false;
        fetch(`/api/rooms?site_name=${encodeURIComponent(F1.value)}`)
          .then(res => res.json())
          .then(rooms => {
            populateSelect(F2, rooms, 'room_name', 'room_name', '--- Choose Room ---');
            clearSelect(F3, "--- Choose Area ---");
            clearSelect(F4, "--- Choose Specifier ---");
          });
      };

      F2.onchange = function () {
        if (!F2.value) {
          clearSelect(F3, "--- Choose Area ---");
          clearSelect(F4, "--- Choose Specifier ---");
          return;
        }
        F3.disabled = false;
        fetch(`/api/areas?room_name=${encodeURIComponent(F2.value)}`)
          .then(res => res.json())
          .then(areas => {
            populateSelect(F3, areas, 'area_name', 'area_name', '--- Choose Area ---');
            clearSelect(F4, "--- Choose Specifier ---");
          });
      };

      F3.onchange = function () {
        if (!F3.value) {
          clearSelect(F4, "--- Choose Specifier ---");
          return;
        }
        F4.disabled = false;
        fetch(`/api/specifiers?area_name=${encodeURIComponent(F3.value)}`)
          .then(res => res.json())
          .then(specifiers => {
            populateSelect(F4, specifiers, 'specifier_name', 'specifier_name', '--- Choose Specifier ---');
          });
      };
    }
  } else {
    clearSelect(F1, "--- Choose Filter ---");
    F1.onchange = null;
    F2.onchange = null;
    F3.onchange = null;
  }
};

// Helper for location filter string
window.getLocationFilterString = function getLocationFilterString() {
  const F1 = document.getElementById("F1");
  const F2 = document.getElementById("F2");
  const F3 = document.getElementById("F3");
  const F4 = document.getElementById("F4");
  const values = [F1, F2, F3, F4].map(sel => sel && sel.value ? sel.value : null).filter(Boolean);
  return values.join(">");
};

// Always trigger a new search when F1-F4 change
["F1", "F2", "F3", "F4"].forEach(id => {
  const sel = document.getElementById(id);
  if (sel) {
    sel.addEventListener("change", function () {
      const searchBox = document.getElementById("search");
      if (searchBox) {
        searchBox.dispatchEvent(new Event("input"));
      }
    });
  }
});