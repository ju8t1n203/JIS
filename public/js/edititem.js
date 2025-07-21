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
            updateImagePreview(eibarcode.value);
            
            const [site, room, area, specifier] = (item.location || '').split('>');
            console.log(`location information: ${site}->${room}->${area}->${specifier}`);

            eisite.remove('--- Site ---')

            getSites().then(sites => {
                const matchedSite = sites.find(s => s.site_name === site);
                if (matchedSite) {
                    eisite.value = String(matchedSite.site_id);
                } else {
                    console.warn(`Site name "${site}" not found`);
                }
            });

            eiroom.remove('--- Room ---')

            getChild(`site`, site, 'room', eiroom).then(locations => {
                const matchedRoom = locations.find(s => s.room_name === room);
                if (matchedRoom) {
                    eiroom.value = String(matchedRoom.room_id);
                } else {
                    console.warn(`Room name "${room}" not found`);
                }
            });


        });
    }).catch(err => {
        console.error('Error fetching item:', err);
    });
    
    async function getSites() {
      try {
        const response = await fetch('/api/sites');
        const sites = await response.json();
        console.log(sites);
    
        sites.forEach(site => {
          const option = document.createElement('option');
          option.value = site.site_id;
          option.textContent = site.site_name;
          eisite.appendChild(option);
        });
    
        return sites;

      } catch (err) {
        console.error('Error fetching sites:', err);
      }
    }

        
    async function getChild(parentType, parentName, childType, destination) {
      try {
        const response = await fetch(`/api/${childType}s?${parentType}_name=${parentName}`);
        const locations = await response.json();
        console.log(locations);
    
        const idKey = `.${childType}_id`;
        const nameKey = `.${childType}_name`;

        locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location[idKey];
        option.textContent = location[nameKey];
        destination.appendChild(option);
        });

        return locations;

      } catch (err) {
        console.error('Error fetching location:', err);
      }
    }

}
