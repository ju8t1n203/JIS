function insertLineItem(id, name, code, description, qty, price, status) {
  const container = document.querySelector('.data-view');
  const fields = [id, name, code, description, qty, price, status];

  fields.forEach(value => {
    const cell = document.createElement('div');
    if (value instanceof HTMLElement) {
      cell.appendChild(value);  // render checkbox as a child element
    } else {
      cell.textContent = value;
    }
    container.appendChild(cell);
  });
}

//returns a true if found, false if not
function rSearch(barcode) {
    return fetch(`/api/item-exists?barcode=${encodeURIComponent(barcode)}&name=`)
        .then(res => res.json())
        .then(data => data.exists);
}

//returns all item fields
function getItem(barcode) {
    return fetch(`/api/get-item?barcode=${encodeURIComponent(barcode)}`)
        .then(res => res.json());
}

window.load = () => {
  const submit = document.getElementById('pSubmit');
  const print = document.getElementById('pPrint');
  const pBarcode = document.getElementById('pBarcode');
  const pQty = document.getElementById('pAmount');
  
  submit.addEventListener('click', () => {

    rSearch(pBarcode.value).then(exists => {
      if (!exists) {
        alert('Item not found in database');
        return;
      }
      const qty = parseInt(pQty.value, 10);
      if (isNaN(qty) || qty <= 0) {
        alert('Please enter a valid quantity');
        return;
      }

      getItem(pBarcode.value).then(item => {
        if (!item) {
          alert('Item not found in database');
          return;
        }
        
        let toOrder = qty - item.quantity;

        if (toOrder > 0) {
          alert(`Insufficient stock for ${item.item_name}. Available: ${item.quantity}`);
        }
        else if (toOrder < 0) {
          toOrder = 0; // no need to order in stock
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';

        insertLineItem(checkbox, item.item_barcode, item.item_name, item.location, qty, item.quantity, toOrder);
        console.log('Added', item.item_name, "to the picklist");
      }).catch(err => {
        console.error('Error fetching item:', err);
        alert('Error fetching item details');
      });
    }).catch(err => {
      console.error('Error checking item existence:', err);
      alert('Error looking up item');
    });
  });

  print.addEventListener('click', () => {
    console.log('Print button clicked');
    window.print();
  });
};