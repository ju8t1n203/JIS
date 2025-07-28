function getActiveSearchColumn() {
  const radios = document.getElementsByName("searchType");
  for (const radio of radios) {
    if (radio.checked) return radio.value;
  }
  return "item_barcode"; // default in case of error
}

function getActiveFilter() {
  const filterRadios = document.getElementsByName("filterType");
  for (const radio of filterRadios) {
    if (radio.checked) return radio.value;
  }
  return ""; // default of "all" in case of error
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
    let filter = getActiveFilter();
    if (filter === "location" && typeof window.getLocationFilterString === "function") {
      filter = window.getLocationFilterString();
    }

    debounceTimer = setTimeout(() => {
      listbox.innerHTML = `
        <li class="vb-list-header">
          Barcode | Name | Quantity | Location | Description
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

  //filter radio change triggers filter action and search
  const filterRadios = document.getElementsByName("filterType");
  filterRadios.forEach(radio => {
    radio.addEventListener("change", function () {
      if (typeof window.applyFilterAction === "function") {
        window.applyFilterAction(getActiveFilter());
      }
      searchBox.dispatchEvent(new Event("input"));
    });
  });

  //make header for initial load
  listbox.innerHTML = `
    <li class="vb-list-header">
      Barcode | Name | Quantity | Location | Description
    </li>
  `;

  if (typeof window.setupListboxHighlighting === "function") {
    window.setupListboxHighlighting();
  }

  setupSearchTriggers();
}

function setupListboxHighlighting() {
  const listbox = document.getElementById("vb-style-listbox");
  if (!listbox) return;
  listbox.addEventListener("click", function (e) {
    if (e.target.tagName === "LI") {
      //if selected item is the header do nothing
      if (e.target.classList.contains("vb-list-header")) return;
      Array.from(listbox.children).forEach(item => item.classList.remove("selected"));
      e.target.classList.add("selected");
      //enable action buttons ie consume, restock, etc.
      const actionButtons = document.querySelectorAll(".inventory-btn");
      actionButtons.forEach(button => button.disabled = false);
    }
  });
}

function setupSearchTriggers() {
  const searchBox = document.getElementById("search");

  //if a search-type or filter-type radio is changed, trigger a search
  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener("change", function () {
      if (searchBox) searchBox.dispatchEvent(new Event("input"));
    });
  });

  //if a filter select is changed, trigger a search
  document.querySelectorAll('select').forEach(sel => {
    sel.addEventListener("change", function () {
      if (searchBox) searchBox.dispatchEvent(new Event("input"));
    });
  });
}