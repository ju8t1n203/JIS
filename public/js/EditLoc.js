//adds listeners and error handling for MySQL
window.attachEditLocListener = function () {
  const btn = document.getElementById('esubmit');
  if (btn) {
    //probably need to vchange methods here, might not need new listeners
    btn.replaceWith(btn.cloneNode(true)); //remove old listeners
    const newBtn = document.getElementById('esubmit');
    newBtn.addEventListener('click', function () {
      const type = document.getElementById('type').value;
      if (!type) {
        alert('Please select a type.');
        return;
      }

      fetch('/api/check-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName: type })
      })
      .then(res => res.json())
      .then(data => {
        if (data.exists) {
          const action = document.querySelector('input[name="itemType"]:checked')?.value;
          if (action === 'add') {
            addLocation();
          } else if (action === 'remove') {
            deleteLocation();
          } else {
            alert('Please select a valid action.');
          }
        } else {
          alert(`Table "${type}" does not exist.`);
        }
      })
      .catch(() => alert('Error checking table.'));
    });
  }
};

//ensures every enabled fields have a value
function addLocation() {
  const type = document.getElementById('type').value;
  const site = document.getElementById('site');
  const room = document.getElementById('room');
  const area = document.getElementById('area');
  const name = document.getElementById('itemName').value;

  if (!type || !name) {
    alert('Please fill in all required fields.');
    return;
  }
  if (!site.disabled && !site.value) {
    alert('Please select a site.');
    return;
  }
  if (!room.disabled && !room.value) {
    alert('Please select a room.');
    return;
  }
  if (!area.disabled && !area.value) {
    alert('Please select an area.');
    return;
  }

  //gets parentID based on type
  function getParentId(cb) {
    if (type === 'room') {
      fetch(`/api/site-id?site_name=${encodeURIComponent(site.value)}`)
        .then(res => res.json())
        .then(data => cb(data.id));
    } else if (type === 'area') {
      fetch(`/api/room-id?room_name=${encodeURIComponent(room.value)}`)
        .then(res => res.json())
        .then(data => cb(data.id));
    } else if (type === 'specifier') {
      fetch(`/api/area-id?area_name=${encodeURIComponent(area.value)}`)
        .then(res => res.json())
        .then(data => cb(data.id));
    } else {
      cb(null);
    }
  }

  getParentId(function(parentId) {
    fetch('/api/check-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, name, parentId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.exists) {
          alert('A location with that name already exists.');
          return;
        }
        //if does not exist then add
        fetch('/api/add-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, name, parentId })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              alert('Location added successfully!');
            } else {
              alert('Error adding location: ' + data.message);
            }
          })
          .catch(() => alert('Error adding location.'));
      })
      .catch(() => alert('Error checking for duplicate location.'));
  });
}

//ensures every enabled field has a value and searches database for location to be deleted
function deleteLocation() {
  const type = document.getElementById('type').value;
  const site = document.getElementById('site');
  const room = document.getElementById('room');
  const area = document.getElementById('area');
  const name = document.getElementById('itemName').value;

  if (!type || !name) {
    alert('Please fill in all required fields.');
    return;
  }
  if (!site.disabled && !site.value) {
    alert('Please select a site.');
    return;
  }
  if (!room.disabled && !room.value) {
    alert('Please select a room.');
    return;
  }
  if (!area.disabled && !area.value) {
    alert('Please select an area.');
    return;
  }
};