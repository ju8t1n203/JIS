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
        makeItHappen(btnText);
      });
    });
  } else {
    changeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const btnText = btn.textContent.trim();
        makeItHappen(btnText);
      });
    });
    
    hasInitialized = true;
  }

  //returns all item fields
  function getItem(barcode) {
    return fetch(`/api/get-item?barcode=${encodeURIComponent(barcode)}`)
    .then(res => res.json());
  }

  function makeItHappen(button) {
    const barcode = barcodeInput?.value.trim() || '';
    const quantity = quantityInput?.value.trim() || '';
    const message = `${button} | ${barcode} | ${quantity}`;

    fetch(`/api/item-exists?barcode=${barcode}&name=`)
    .then(res => res.json())
    .then(data => {
      if (data.exists) {
        if (outputBox) outputBox.textContent = message;
        console.log(`Clicked (${activeTab}) (first run):`, message);
      } else {
        alert(`Item with barcode "${barcode}" does not exist.`);
      }
    })
    .catch(err => {
      console.error('Fetch error:', err);
    });


    //log action
    
    getItem(barcode).then(item => {
      const action = button === 'Consume' ? 0 : 1; // 0 for consume, 1 for restock
      
      const oldQTY = Number(item.quantity);
      const changeQTY = Number(quantity);
      const newQTY = action === 0 ? oldQTY - changeQTY : oldQTY + changeQTY;

      const payload = {
        barcode,
        action,
        oldQuantity: oldQTY,
        changeQuantity: changeQTY,
        newQuantity: newQTY
      };
      console.log('Logging action:', payload);
      fetch('/api/action-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('✅ Action logged:', payload);
        } else {
          console.warn('⚠️ Failed to log action:', data.error);
        }
      })
      .catch(err => {
        console.error('❌ API error:', err);
      });
    });

  }
};



/*
//make header for initial load
outputBox.innerHTML = `
  <li class="vb-list-header">
    Action | Barcode | Old Qty | Change Qty | New Qty
  </li>
`;
  
//need to make header always be the first line item
*/