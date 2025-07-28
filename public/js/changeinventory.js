let hasInitialized = false;
window.changeInventory = function () {

    const validTabs = ['consume', 'restock'];
    const activeTab = document.querySelector('.tabs.main-tabs .tab.active')?.dataset.tab;
    console.log(`Currently active tab: ${activeTab}`);


    // If the active tab doesn't match one of your target tabs, skip
    if (!activeTab || !validTabs.includes(activeTab)) {
      console.log(`Active tab not targeted — skipping init ${activeTab}`);
      return;
    }
    console.log(`Initializing change inventory for tab: ${activeTab}`);

    const changeBtns = document.querySelectorAll('.change-btn');
    const barcodeInput = document.querySelector('#cbarcode');
    const quantityInput = document.querySelector('#cquantity');
    const outputBox = document.querySelector('#vb-style-listbox');

    // Listener logic
    if (hasInitialized) {
      changeBtns.forEach(btn => {
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);

        clone.addEventListener('click', () => {
          const btnText = clone.textContent.trim();
          const barcode = barcodeInput?.value.trim() || '';
          const quantity = quantityInput?.value.trim() || '';
          const message = `${btnText} | ${barcode} | ${quantity}`;
          if (outputBox) outputBox.textContent = message;
          console.log(`Clicked (${activeTab.id}):`, message);
        });
      });
    } else {
      changeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const btnText = btn.textContent.trim();
          const barcode = barcodeInput?.value.trim() || '';
          const quantity = quantityInput?.value.trim() || '';
          const message = `${btnText} | ${barcode} | ${quantity}`;
          if (outputBox) outputBox.textContent = message;
          console.log(`Clicked (${activeTab.id}) (first run):`, message);
        });
      });

      hasInitialized = true;
    }
  };
