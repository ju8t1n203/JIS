window.setupComboLogic = function setupComboLogic() {
  (function waitForElements() {
    const typeBox = document.getElementById('type');
    const siteBox = document.getElementById('site');
    const roomBox = document.getElementById('room');
    const areaBox = document.getElementById('area');

    if (!typeBox || !siteBox || !roomBox || !areaBox) {
      console.log('[ComboLogic] Elements not ready, retrying...');
      return setTimeout(waitForElements, 20); //retry every 20ms
    }

    console.log('[ComboLogic] All elements found, setting up logic');
    
    //when a type of location is selected the necessary select fields enable
    function updateDependencies(type) {
      console.log('[updateDependencies] Received type:', type);

      siteBox.disabled = true;
      roomBox.disabled = true;
      areaBox.disabled = true;
      console.log('[updateDependencies] All disabled');

      if (type === 'room') {
        siteBox.disabled = false;
        console.log('[updateDependencies] Enabling: site');
      } else if (type === 'area') {
        siteBox.disabled = false;
        roomBox.disabled = false;
        console.log('[updateDependencies] Enabling: site and room');
      } else if (type === 'specifier') {
        siteBox.disabled = false;
        roomBox.disabled = false;
        areaBox.disabled = false;
        console.log('[updateDependencies] Enabling: all');
      }
    }

    typeBox.addEventListener('change', () => {
      console.log('[ComboLogic] Type changed to:', typeBox.value);
      updateDependencies(typeBox.value);
    });

    updateDependencies(typeBox.value);
  })();

  //populates location selects from database
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

  const siteBox = document.getElementById('site');
  const roomBox = document.getElementById('room');
  const areaBox = document.getElementById('area');

  //fetch sites
  fetch('/api/sites')
    .then(res => res.json())
    .then(sites => populateSelect(siteBox, sites, 'site_name', 'site_name', '--- Site ---'));

  //fetch rooms for selected site
  siteBox.addEventListener('change', () => {
    if (!siteBox.value) {
      populateSelect(roomBox, [], 'room_name', 'room_name', '--- Room ---');
      populateSelect(areaBox, [], 'area_name', 'area_name', '--- Area ---');
      return;
    }
    fetch(`/api/rooms?site_name=${encodeURIComponent(siteBox.value)}`)
      .then(res => res.json())
      .then(rooms => {
        populateSelect(roomBox, rooms, 'room_name', 'room_name', '--- Room ---');
        populateSelect(areaBox, [], 'area_name', 'area_name', '--- Area ---');
      });
  });

  //fetch areas for selected room
  roomBox.addEventListener('change', () => {
    if (!roomBox.value) {
      populateSelect(areaBox, [], 'area_name', 'area_name', '--- Area ---');
      return;
    }
    fetch(`/api/areas?room_name=${encodeURIComponent(roomBox.value)}`)
      .then(res => res.json())
      .then(areas => populateSelect(areaBox, areas, 'area_name', 'area_name', '--- Area ---'));
  });
}