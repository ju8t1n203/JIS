//updates the combo box options based on the parent selection
window.setupADcombo = function setupADcombo() {
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

  const asiteBox = document.getElementById('asite');
  const aroomBox = document.getElementById('aroom');
  const aareaBox = document.getElementById('aarea');
  const aspecifierBox = document.getElementById('aspecifier');

  if (!asiteBox || !aroomBox || !aareaBox || !aspecifierBox) return;

  
  const adcategory = document.getElementById('adcategory');
  //populate categories
  fetch('/api/category')
    .then(res => res.json())
    .then(category => populateSelect(adcategory, category, 'category_name', 'category_name', '--- Category ---'));

  //populate sites
  fetch('/api/sites')
    .then(res => res.json())
    .then(sites => populateSelect(asiteBox, sites, 'site_name', 'site_name', '--- Site ---'));

  //add listeners
  //when a selected walue changes, update the next select box
  asite.addEventListener('change', () => {
    if (!asite.value) {
      populateSelect(aroom, [], 'room_name', 'room_name', '--- Room ---');
      populateSelect(aarea, [], 'area_name', 'area_name', '--- Area ---');
      populateSelect(aspecifier, [], 'specifier_name', 'specifier_name', '--- Specifier ---');
      return;
    }
    fetch(`/api/rooms?site_name=${encodeURIComponent(asite.value)}`)
      .then(res => res.json())
      .then(rooms => {
        populateSelect(aroom, rooms, 'room_name', 'room_name', '--- Room ---');
        populateSelect(aarea, [], 'area_name', 'area_name', '--- Area ---');
        populateSelect(aspecifier, [], 'specifier_name', 'specifier_name', '--- Specifier ---');
      });
  });

  aroom.addEventListener('change', () => {
    if (!aroom.value) {
      populateSelect(aarea, [], 'area_name', 'area_name', '--- Area ---');
      populateSelect(aspecifier, [], 'specifier_name', 'specifier_name', '--- Specifier ---');
      return;
    }
    fetch(`/api/areas?room_name=${encodeURIComponent(aroom.value)}`)
      .then(res => res.json())
      .then(areas => {
        populateSelect(aarea, areas, 'area_name', 'area_name', '--- Area ---');
        populateSelect(aspecifier, [], 'specifier_name', 'specifier_name', '--- Specifier ---');
      });
  });

  aarea.addEventListener('change', () => {
    if (!aarea.value) {
      populateSelect(aspecifier, [], 'specifier_name', 'specifier_name', '--- Specifier ---');
      return;
    }
    fetch(`/api/specifiers?area_name=${encodeURIComponent(aarea.value)}`)
      .then(res => res.json())
      .then(specifiers => populateSelect(aspecifier, specifiers, 'specifier_name', 'specifier_name', '--- Specifier ---'));
  });
};