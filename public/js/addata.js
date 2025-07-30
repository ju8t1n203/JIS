//retrieves the image blob from the server from the barcode
function updateImage(barcode) {
    const img = document.getElementById('imagePreview');
    console.log(`image placeholder: ${img} image barcode: ${barcode} the other thing: ${encodeURIComponent(barcode)}`)
    if (img) {
        img.onerror = function() {
            fetch(`/api/item-photo?barcode=${encodeURIComponent(barcode)}`)
            .then(res => res.json())
            .then(data => {
                let details = '';
                if (data.dbInfo) {
                    details =
                    `\nDatabase: ${data.dbInfo.database}` +
                    `\nPort: ${data.dbInfo.port}` +
                    `\nTable: ${data.dbInfo.table}` +
                    `\nColumn: ${data.dbInfo.column}` +
                    `\nBarcode: ${data.dbInfo.barcode}`;
                }
                alert((data.error || 'No image found.') + details);
            })
                .catch(() => {
                    alert('No image found for this item or default.');
                });
        };
        img.onload = function() {
            img.style.display = '';
        };
        img.src = `/api/item-photo?barcode=${encodeURIComponent(barcode)}`;
    }
}

//this is the main function that handles adding or removing items
//activates after tab load and adsetup
window.adData = function adData() {
    const addRadio = document.querySelector('input[name="changeType"][value="add"]');
    const removeRadio = document.querySelector('input[name="changeType"][value="remove"]');

    const barcode = document.getElementById('adbarcode').value.trim();
    const name = document.getElementById('adname').value.trim();
    const qty = document.getElementById('adqty').value.trim();
    const desc = document.getElementById('addescription').value.trim();
    
    const site = document.getElementById('asite').value;
    const room = document.getElementById('aroom').value;
    const area = document.getElementById('aarea').value;
    const specifier = document.getElementById('aspecifier').value;
    
    const preview = document.getElementById('adpdescription');

    const add = document.getElementById('adadd');
    const remove = document.getElementById('adremove');

    if (addRadio && addRadio.checked) {
        if (barcode && name && qty && desc && site && room && area && specifier) {
            aSearch(barcode, name).then(exists => {
                if (!exists) {
                    preview.value =
                    `Barcode: ${barcode}\n` +
                    `Name: ${name}\n` +
                `Quantity: ${qty}\n` +
                `Site: ${site}\n` +
                `Room: ${room}\n` +
                `Area: ${area}\n` +
                `Specifier: ${specifier}\n` +
                `Description: ${desc}`;
                add.disabled = false;
                window.final();
            }
        });
    } else {
        alert('Please enter all information in the textboxes and select all location fields.');
    }
    } else if (removeRadio && removeRadio.checked) {
        if (!barcode) {
            console.log('removing item')
                alert('Please enter the barcode of the item you want to remove.');
                return;
        } else {
                rSearch(barcode).then(exists => {
                    if (!exists) {
                        alert('Item not found.');
                    } else {
                        getItem(barcode).then(item => {
                            if (item.error) {
                                alert(item.error);
                            } else {
                            console.log('Full item row:', item);
                            const [site, room, area, specifier] = (item.location || '').split('>');
                                
                            preview.value =
                            `Barcode: ${item.item_barcode}\n` +
                            `Name: ${item.item_name}\n` +
                            `Quantity: ${item.quantity}\n` +
                            `Site: ${site || ''}\n` +
                            `Room: ${room || ''}\n` +
                            `Area: ${area || ''}\n` +
                            `Specifier: ${specifier || ''}\n` +
                            `Description: ${item.descriptio}`;
                            updateImage(item.item_barcode);
                            remove.disabled = false;
                            window.final();
                        }
                    });
                }
            });
        }
    }
};

//runs on tab load to set fields and properties
window.setupADdata = function setupADdata() {
    window.updateFields = updateFields;
    const submit = document.getElementById('adsubmit');
    if (submit) {
        submit.addEventListener('click', function(e) {
            window.adData();
        });
    }
    
    const addRadio = document.querySelector('input[name="changeType"][value="add"]');
    const removeRadio = document.querySelector('input[name="changeType"][value="remove"]');
    const add = document.getElementById('adadd');
    const remove = document.getElementById('adremove');
    const preview = document.getElementById('adpdescription');
    
    //fields to enable/disable
    const fields = [
        document.getElementById('adname'),
        document.getElementById('adqty'),
        document.getElementById('addescription'),
        document.getElementById('asite'),
        document.getElementById('aroom'),
        document.getElementById('aarea'),
        document.getElementById('aspecifier'),
        document.getElementById('adupload'),
        document.getElementById('adcategory'),
        document.getElementById('adrestock'),
    ];

    //based on the add/remove radio button, it will enable/disable fields for that mode
    function updateFields() {
        if (removeRadio && removeRadio.checked) {
            fields.forEach(f => {
                if (f) {
                    f.disabled = true;
                    //clears input values for text, textarea, and select fields
                    if (f.tagName === 'INPUT' || f.tagName === 'TEXTAREA') {
                        f.value = '';
                        } else if (f.tagName === 'SELECT') {
                        f.selectedIndex = 0;
                    }
                }
                add.disabled = true;
                remove.disabled = true;
                preview.value = '';
                updateImage('12345');
            });
        } else {
            fields.forEach(f => f && (f.disabled = false));
            add.disabled = true;
            remove.disabled = true;
            preview.value = '';
            updateImage('12345');
        }
    }

    //sets the initial state
    updateImage('12345');
    updateFields();
    setupUploadButton();

    if (addRadio) addRadio.addEventListener('change', updateFields);
    if (removeRadio) removeRadio.addEventListener('change', updateFields);

};

//makes a file input to select an image and will display image once one is chosen
function setupUploadButton() {
    const uploadBtn = document.getElementById('adupload');
    const img = document.getElementById('imagePreview');

    //create hidden file input
    let fileInput = document.getElementById('adfileinput');
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.id = 'adfileinput';
        document.body.appendChild(fileInput);
    }

    uploadBtn.addEventListener('click', () => {
        fileInput.value = ''; //reset so selecting the same file twice works
        fileInput.click();
    });

    fileInput.addEventListener('change', function () {
        const file = fileInput.files[0];
        if (file && img) {
            const reader = new FileReader();
            reader.onload = function (e) {
                img.src = e.target.result; //displays image in the picture box
            };
            reader.readAsDataURL(file);
        }
    });
}

//searches item data for matches with the the soon to be item's barcode and name to ensure no items share primary identifiers
function aSearch(barcode, name) {
    return fetch(`/api/item-exists?barcode=${encodeURIComponent(barcode)}&name=${encodeURIComponent(name)}`)
        .then(res => res.json())
        .then(data => {
            if (data.exists) {
                let msg = 'An item already exists with the same ';
                if (data.match.barcode && data.match.name) {
                    msg += 'barcode and name.';
                } else if (data.match.barcode) {
                    msg += 'barcode.';
                } else if (data.match.name) {
                    msg += 'name.';
                } else {
                    msg = 'An item already exists.';
                }
                alert(msg);
                return true;
            }
            return false;
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

//makes the image blob from the selected image for saving in MySQL
function dataURLtoBlob(dataURL) {
  const [header, base64] = dataURL.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }

  return new Blob([array], { type: mime });
}

//once the submit button is clicked perform the add or remove action
window.final = function final() {
    const add = document.getElementById('adadd');
    const remove = document.getElementById('adremove');
    const preview = document.getElementById('adpdescription');

    if (add) add.addEventListener('click', function(e) {
        e.preventDefault();
        const barcode = document.getElementById('adbarcode').value.trim();
        const name = document.getElementById('adname').value.trim();
        const quantity = document.getElementById('adqty').value.trim();
        const descriptio = document.getElementById('addescription').value.trim();
        const site = document.getElementById('asite').value;
        const room = document.getElementById('aroom').value;
        const area = document.getElementById('aarea').value;
        const specifier = document.getElementById('aspecifier').value;
        const amount = document.getElementById('adrestock').value;
        const category = document.getElementById('adcategory').value;
        const img = document.getElementById('imagePreview');
        const dataURL = img.src;                            //full Data-URL
        const base64 = dataURL.split(',')[1] || '';         //just the base64

        const location = [site, room, area, specifier].join('>');

        
        fetch('/api/add-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode, name, quantity, amount, location, descriptio, category, photo: base64})
        })
        .then(res => res.json())
        .then(result => {
            console.log('Received item:', {barcode, name, quantity, amount, location, descriptio, category, photo: base64});
            if (result.success) {
                alert('Item added successfully!');
                if (preview) preview.value = '';
            } else {
                alert('Failed to add item: ' + (result.error || 'Unknown error'));
            }
        });
    });

    if (remove) remove.addEventListener('click', function(e) {
        console.log('🗑️ delete-item handler fired');
        e.preventDefault();
        const barcode = document.getElementById('adbarcode').value.trim();

        fetch('/api/delete-item', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode })
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                alert('Item deleted successfully!');
                if (preview) preview.value = '';
            } else {
                alert('Failed to delete item: ' + (result.error || 'Unknown error'));
            }
        });
    });
};

window.final();