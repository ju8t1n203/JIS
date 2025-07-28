//attach click listener to all .inventory-btn buttons
function setupInventoryBtnListeners() {
  document.querySelectorAll('.inventory-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      console.log('Button clicked:', btn.textContent);
      const tabText = btn.textContent.trim().toLowerCase();

      //get the selected listbox item's barcode
      const selectedLi = document.querySelector('#vb-style-listbox .selected');
      const barcode = selectedLi ? selectedLi.dataset.id : '';

      let tabSelector, barcodeFieldSelector;
      switch (tabText) {
        case 'consume': {
          tabSelector = '[data-tab="consume"]';
          barcodeFieldSelector = '#cbarcode';
          break;
        }
        case 'restock': {
          tabSelector = '[data-tab="restock"]';
          barcodeFieldSelector = '#cbarcode';
          break;
        }
        case 'remove': {
          tabSelector = '[data-tab="addremove"]';
          barcodeFieldSelector = '#adbarcode';
          setTimeout(() => {
            const removeRadio = document.querySelector('input[type="radio"][name="changeType"][value="remove"]');
            if (removeRadio) removeRadio.checked = true;
            if (typeof window.updateFields === "function") window.updateFields();
          }, 150);
          break;
        }
        case 'edit': {
          tabSelector = '[data-tab="edit"]';
          barcodeFieldSelector = '#eibarcode';
          break;
        }
        case 'pick it': {
          tabSelector = '[data-tab="picklist"]';
          barcodeFieldSelector = '#picklist-barcode';
          break;
        }
        default: {
          tabSelector = null;
          barcodeFieldSelector = null;
        }
      }

      if (tabSelector) {
        const tab = document.querySelector(tabSelector);
        if (tab) {
          tab.click();

          //for edit, activate the item sub-tab after switching
          if (tabSelector === '[data-tab="edit"]') {
            setTimeout(() => {
              const itemSubTab = document.querySelector('[data-subtab="item"]');
              if (itemSubTab) itemSubTab.click();
              //insert barcode after sub-tab is activated
              if (barcodeFieldSelector && barcode) {
                setTimeout(() => {
                  const barcodeField = document.querySelector(barcodeFieldSelector);
                  if (barcodeField) barcodeField.value = barcode;
                }, 150);
              }
            }, 150);
          } else {
            //for other tabs, set barcode after switching
            setTimeout(() => {
              if (barcodeFieldSelector && barcode) {
                const barcodeField = document.querySelector(barcodeFieldSelector);
                if (barcodeField) barcodeField.value = barcode;
              }
            }, 150);
          }
        }
      }

      document.querySelectorAll('.inventory-btn').forEach(b => b.disabled = true);
    });
  });
}

//make it available globally
window.setupInventoryBtnListeners = setupInventoryBtnListeners;