function searchdb() {
  const searchBox = document.getElementById("search");
  const listbox = document.getElementById("vb-style-listbox");
  // Get all radio buttons by name
  const searchByRadios = document.getElementsByName("searchType");

  if (!searchBox || !listbox || searchByRadios.length === 0) {
    console.warn("[searchdb] Required DOM elements not found.");
    return;
  }

  let debounceTimer;
  searchBox.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    const query = this.value.trim();

    // Find the checked radio button
    let column = "item_barcode"; // default
    for (const radio of searchByRadios) {
      if (radio.checked) {
        column = radio.value;
        break;
      }
    }

    debounceTimer = setTimeout(() => {
      // Always show header
      listbox.innerHTML = `
        <li class="vb-list-header">
          barcode | name | quantity | location | description
        </li>
      `;

      if (query.length > 0) {
        fetch(`/search?column=${encodeURIComponent(column)}&q=${encodeURIComponent(query)}`)
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
    }, 200); // 200ms debounce
  });

  // Show header on initial load
  listbox.innerHTML = `
    <li class="vb-list-header">
      barcode | name | quantity | location | description
    </li>
  `;

  console.log("[searchdb] Input listener initialized.");
}
