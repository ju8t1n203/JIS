//returns a true or false if an item with the barcode exists in the database
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

//retrieves item blob from database
function updateImagePreview(barcode) {
    const img = document.getElementById('eimagePreview');
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
                    img.src = `/api/item-photo?barcode=12345`; //default image
                });
        };
        img.onload = function() {
            img.style.display = '';
        };
        img.src = `/api/item-photo?barcode=${encodeURIComponent(barcode)}`;
    }
}

//makes a file dialog to upload an image for an item
function setupPhotoButton() {
    const uploadBtn = document.getElementById('eiphoto');
    const img = document.getElementById('eimagePreview');

    //create a hidden file input
    let fileInput = document.getElementById('eifileinput');
    if (!fileInput) {
        fileInput = document.createElement('einput');
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
                img.src = e.target.result; //displays the image in the picture box
            };
            reader.readAsDataURL(file);
        }
    });
}

//called on tab load
window.setupei = function setupei() {
    const find = document.getElementById('eifind');
    if (find) {
        find.addEventListener('click', function(e) {
            window. edit();
        });
    }

    updateImagePreview('12345');
    setupPhotoButton();
};

//will verify all required fields are filled and no duplicate identifiers are made
window.edit = function edit() {
    const eibarcode = document.getElementById('eibarcode');
    const einame = document.getElementById('einame');
    const eiquantity = document.getElementById('eiqty');
    const eidescription = document.getElementById('eidescription');
    const eiupload = document.getElementById('eiphoto');
    const eicategory = document.getElementById('eicategory');
    const eirestock = document.getElementById('eirestock');
    const eisite = document.getElementById('eisite');
    const eiroom = document.getElementById('eiroom');
    const eiarea = document.getElementById('eiarea');
    const eispecifier = document.getElementById('eispecifier');
    const eiadlocation = document.getElementById('eiadloc');
    const eiapply = document.getElementById('eichange');
    const img = document.getElementById('eimagePreview');
    
    const fields = [
        einame, eiquantity, eidescription,eiupload, eicategory, eirestock,
        eisite, eiroom, eiarea, eispecifier, eiadlocation, eiapply
    ];
    
    
    rSearch(eibarcode.value).then(found => {
        if (!found) {
            alert('Item not found.');
            return;
        }
        fields.forEach(field => {
            field.disabled = false;
        });
        
        getItem(eibarcode.value).then(item => {
            einame.value = item.item_name;
            eiquantity.value = item.quantity;
            eidescription.value = item.descriptio;
            setTimeout(() => {             
                updateImagePreview(eibarcode.value);
            }, 100);
            
            const [site, room, area, specifier] = (item.location || '').split('>');
            console.log(`location information: ${site}->${room}->${area}->${specifier}`);

            
            fetch('/api/sites')
            .then(res => res.json())
            .then(sites => {
                populateSelect(eisite, sites, 'site_name', 'site_name', '--- Choose Site ---');
                //if site exists in eisite then eisite.value = site
                eisite.value = site || '';
                eisite.dispatchEvent(new Event('change'));
                [...eisite.options].find(o => o.text === '--- Choose Site ---')?.remove();
            });

            //buffer, wait 100ms before fetching rooms
            setTimeout(() => {  
                fetch(`/api/rooms?site_name=${encodeURIComponent(eisite.value)}`)
                .then(res => res.json())
                .then(rooms => {
                    populateSelect(eiroom, rooms, 'room_name', 'room_name', '--- Choose Room ---');
                    //if room exists in eiroom then eiroom.value = room
                    eiroom.value = room || '';
                    eiroom.dispatchEvent(new Event('change'));
                    [...eiroom.options].find(o => o.text === '--- Choose Room ---')?.remove();
                });
            }, 100);

            setTimeout(() => {  
                fetch(`/api/areas?room_name=${encodeURIComponent(eiroom.value)}`)
                .then(res => res.json())
                .then(areas => {
                    populateSelect(eiarea, areas, 'area_name', 'area_name', '--- Choose Area ---');
                    //if area exists in eiarea then eiarea.value = area
                    eiarea.value = area || '';
                    eiarea.dispatchEvent(new Event('change'));
                    [...eiarea.options].find(o => o.text === '--- Choose Area ---')?.remove();
                });
            }, 200);

            setTimeout(() => {  
                fetch(`/api/specifiers?area_name=${encodeURIComponent(eiarea.value)}`)
                .then(res => res.json())
                .then(specifiers => {
                    populateSelect(eispecifier, specifiers, 'specifier_name', 'specifier_name', '--- Choose Specifier ---');
                    //if area exists in eiarea then eiarea.value = area
                    eispecifier.value = specifier || '';
                    eispecifier.dispatchEvent(new Event('change'));
                    [...eispecifier.options].find(o => o.text === '--- Choose Specifier ---')?.remove();
                });
            }, 300);

            setTimeout(() => {  
                fetch('/api/category')
                .then(res => res.json())
                .then(categories => {
                    const eicategory = document.getElementById('eicategory');
                    populateSelect(eicategory, categories, 'category_name', 'category_name', '--- Choose Category ---');
                    eicategory.value = item.category || '';
                    [...eicategory.options].find(o => o.text === '--- Choose Category ---')?.remove();
                });
            }, 400);

            eirestock.value = item.restock_amount || '';
        });
    }).catch(err => {
        console.error('Error fetching item:', err);
    });

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

}
