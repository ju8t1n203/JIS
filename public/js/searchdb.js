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

    debounceTimer = setTimeout(() => {
      // Always show header
      listbox.innerHTML = `
        <li class="vb-list-header">
          barcode | name | quantity | location | description
        </li>
      `;

      if (query.length > 0) {
        fetch(`/search?q=${encodeURIComponent(query)}`)
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
                  `${item.description || ''}`;
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
