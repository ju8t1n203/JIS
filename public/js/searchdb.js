function getActiveSearchColumn() {
  const radios = document.getElementsByName("searchType");
  for (const radio of radios) {
    if (radio.checked) return radio.value;
  }
  return "item_barcode"; // default
}

function getActiveFilter() {
  const filterRadios = document.getElementsByName("filterType");
  for (const radio of filterRadios) {
    if (radio.checked) return radio.value;
  }
  return ""; // default or "all"
}

function populateSelectOptions(selectId, type) {
  const select = document.getElementById(selectId);
  if (!select) return;

  // Clear current options
  select.innerHTML = "";

  let url = "";
  if (type === "location") {
    if (selectId === "F1") url = "/api/sites";
    else if (selectId === "F2") url = "/api/rooms";
    else if (selectId === "F3") url = "/api/areas";
    else if (selectId === "F4") url = "/api/specifiers";
  } else if (type === "category" && selectId === "F1") {
    url = "/api/category";
  }

  if (!url) return;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      // For each result, add an option
      data.forEach(item => {
        let value = item.site_name || item.room_name || item.area_name || item.specifier_name || item.category_name;
        let option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    })
    .catch(err => {
      console.error("Error populating select:", err);
    });
}

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

function applyFilterAction(filter) {
  const F1 = document.getElementById("F1");
  const F2 = document.getElementById("F2");
  const F3 = document.getElementById("F3");
  const F4 = document.getElementById("F4");

  // Helper to clear and disable a select
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

  // Always clear and disable F2-F4 initially
  clearSelect(F2, "--- Choose Room ---");
  clearSelect(F3, "--- Choose Area ---");
  clearSelect(F4, "--- Choose Specifier ---");

  if (filter === "category" || filter === "none") {
    if (F1) {
      F1.disabled = false;
      fetch('/api/category')
        .then(res => res.json())
        .then(categories => {
          populateSelect(F1, categories, 'category_name', 'category_name', '--- Choose Category ---');
        });
      // Remove cascading logic for F1
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
      // Enable F2-F4 for cascading
      F2.disabled = true;
      F3.disabled = true;
      F4.disabled = true;

      // Set up cascading logic
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
    // If neither, disable and clear F1
    clearSelect(F1, "--- Choose Filter ---");
    F1.onchange = null;
    F2.onchange = null;
    F3.onchange = null;
  }
}

function searchdb() {
  const searchBox = document.getElementById("search");
  const listbox = document.getElementById("vb-style-listbox");

  if (!searchBox || !listbox) {
    console.warn("[searchdb] Required DOM elements not found.");
    return;
  }

  let debounceTimer;
  searchBox.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    const query = this.value.trim();
    const column = getActiveSearchColumn();
    const filter = getActiveFilter();

    debounceTimer = setTimeout(() => {
      listbox.innerHTML = `
        <li class="vb-list-header">
          barcode | name | quantity | location | description
        </li>
      `;

      if (query.length > 0) {
        fetch(`/search?column=${encodeURIComponent(column)}&q=${encodeURIComponent(query)}&filter=${encodeURIComponent(filter)}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data) && data.length > 0) {
              const fragment = document.createDocumentFragment();
              data.forEach(item => {
                const li = document.createElement("li");
                li.textContent =
                  `${item.item_barcode || ''} | ` +
                  `${item.item_name || ''} | ` +
                  `${item.quantity || ''} | ` +
                  `${item.location || ''} | ` +
                  `${item.descriptio || ''}`;
                li.dataset.id = item.item_barcode || item.item_name;
                li.className = "vb-list-item";
                fragment.appendChild(li);
              });
              listbox.appendChild(fragment);
            } else {
              listbox.innerHTML += "<li>No results found</li>";
            }
          })
          .catch(err => {
            console.error("[searchdb] Fetch error:", err);
            listbox.innerHTML += "<li>Error loading results</li>";
          });
      }
    }, 200);
  });

  // Listen for filter changes
  const filterRadios = document.getElementsByName("filterType");
  filterRadios.forEach(radio => {
    radio.addEventListener("change", function () {
      const filter = getActiveFilter();
      applyFilterAction(filter);
      // Optionally, trigger a new search:
      searchBox.dispatchEvent(new Event("input"));
    });
  });

  // Show header on initial load
  listbox.innerHTML = `
    <li class="vb-list-header">
      barcode | name | quantity | location | description
    </li>
  `;

  console.log("[searchdb] Input listener initialized.");
}

window.setupSearchCombo = function setupSearchCombo() {
  const siteBox = document.getElementById('F1');
  const roomBox = document.getElementById('F2');
  const areaBox = document.getElementById('F3');
  const specifierBox = document.getElementById('F4');
  const categoryBox = document.getElementById('Fcat');

  if (!siteBox || !roomBox || !areaBox || !specifierBox || !categoryBox) return;

  // Populate sites
  fetch('/api/sites')
    .then(res => res.json())
    .then(sites => populateSelect(siteBox, sites, 'site_name', 'site_name', '--- Choose Filter ---'));

  // Populate categories
  fetch('/api/category')
    .then(res => res.json())
    .then(categories => populateSelect(categoryBox, categories, 'category_name', 'category_name', '--- Choose Filter ---'));

  // Site change: update rooms
  siteBox.addEventListener('change', () => {
    if (!siteBox.value) {
      populateSelect(roomBox, [], 'room_name', 'room_name', '--- Choose Filter ---');
      populateSelect(areaBox, [], 'area_name', 'area_name', '--- Choose Filter ---');
      populateSelect(specifierBox, [], 'specifier_name', 'specifier_name', '--- Choose Filter ---');
      return;
    }
    fetch(`/api/rooms?site_name=${encodeURIComponent(siteBox.value)}`)
      .then(res => res.json())
      .then(rooms => {
        populateSelect(roomBox, rooms, 'room_name', 'room_name', '--- Choose Filter ---');
        populateSelect(areaBox, [], 'area_name', 'area_name', '--- Choose Filter ---');
        populateSelect(specifierBox, [], 'specifier_name', 'specifier_name', '--- Choose Filter ---');
      });
  });

  // Room change: update areas
  roomBox.addEventListener('change', () => {
    if (!roomBox.value) {
      populateSelect(areaBox, [], 'area_name', 'area_name', '--- Choose Filter ---');
      populateSelect(specifierBox, [], 'specifier_name', 'specifier_name', '--- Choose Filter ---');
      return;
    }
    fetch(`/api/areas?room_name=${encodeURIComponent(roomBox.value)}`)
      .then(res => res.json())
      .then(areas => {
        populateSelect(areaBox, areas, 'area_name', 'area_name', '--- Choose Filter ---');
        populateSelect(specifierBox, [], 'specifier_name', 'specifier_name', '--- Choose Filter ---');
      });
  });

  // Area change: update specifiers
  areaBox.addEventListener('change', () => {
    if (!areaBox.value) {
      populateSelect(specifierBox, [], 'specifier_name', 'specifier_name', '--- Choose Filter ---');
      return;
    }
    fetch(`/api/specifiers?area_name=${encodeURIComponent(areaBox.value)}`)
      .then(res => res.json())
      .then(specifiers => populateSelect(specifierBox, specifiers, 'specifier_name', 'specifier_name', '--- Choose Filter ---'));
  });
};
