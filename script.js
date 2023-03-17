// Register service worker for PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register('/what-can-I-rig/sw.js', {scope: '/what-can-I-rig/'});
};

// Make installable
let deferredPrompt;
let installBtn = document.querySelector("#install");
let installP = document.querySelector(".install");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installP.style.display = "block";

  installBtn.addEventListener("click", (e) => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((result) => {
      deferredPrompt = null;
    });
  });
});

// Parse URL parameters
let regionSel = document.getElementById('region');
let region = new URLSearchParams(window.location.search).get('region').toLowerCase();
function updateRegion(reg) {
  region = ['yorkshire','derbyshire'].filter(r => r == reg)[0] ?? 'yorkshire';
  regionSel.value = region;
}
updateRegion(region);
regionSel.addEventListener('change', event => updateRegion(event.target.value));

// Remove rope input
function removeRope(event) {
  event.target.parentNode.remove();
}

// Add rope input
function addRope(el) {
  let newInput = ropeInput.cloneNode(true);
  newInput.lastChild.disabled = false;
  newInput.firstChild.value = '';
  newInput.firstChild.onkeydown = handleTabs;
  addButton.parentNode.insertBefore(newInput, el.target ?? el);
  for (let el of document.getElementsByClassName('rope')) {
    el.lastChild.onclick = removeRope;
  };
  return newInput;
};
let addButton = document.getElementById('add');
addButton.onclick = addRope;

function handleTabs (event) {
  if (event.code == 'Tab') {
    let newInput = addRope(event.target.parentNode.nextElementSibling);
    event.preventDefault();
    newInput.firstChild.focus();

  }
}
let ropeInput = document.getElementsByClassName('rope')[0];
ropeInput.onkeydown = handleTabs;

// Init leaflet map
function showMap() {
  let map = L.map('map').setView([54.17, -2.19], 10);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  return map;
}
let caveMap = showMap();

// Handle reset button
let tableData = document.getElementById('data');
let resetButton = document.getElementById('reset');
resetButton.onclick = function reset() {
  // remove all rope inputs
  for (let el of document.querySelectorAll('.rope')) {
    if (!el.lastChild.disabled) {
      el.remove();
    } else {
      el.firstChild.value = '';
    };
  };
  // remove results data
  tableData.innerHTML = '';
  clearMap();
  // Uncheck join
  document.getElementById('join').checked = false;
};

// Handle go button
let goButton = document.getElementById('go');
goButton.onclick = function calculate() {
  // Get values of inputs
  let ropes = [];
  for (let el of document.getElementsByClassName('rope')) {
    ropes.push(el.firstChild.value);
  };
  ropes = ropes.map(el => parseInt(el)).filter(el => el).sort((a, b) => a < b);
  let join_ropes = document.getElementById('join').checked;

  // Reset output
  tableData.innerHTML = '';
  clearMap();

  // Get trip lengths
  fetch(`./pitchlengths/${region}.txt`).then(response => response.text()).then(function (trips) {
    // Parse and sort pitch lengths
    trips = trips.split('\n').filter(
      line => !(line.startsWith('#') | line.length < 3)
    );
    for (let [_, trip] of Object.entries(trips.sort())) {
      trip = trip.split(',');
      // Trips can't have more pitches than we have ropes
      if (trip.filter(el => !el.includes('[')).length - 1 > ropes.length) {
        continue;
      };
      // Pitches must be possible
      pitches = trip.slice(1).filter(el => !el.includes('[')).map(x => parseInt(x.trim())).sort((a, b) => a < b);
      if (pitches.every((pitch, i) => { return pitch <= ropes[i] })) {
        let td_el = (trip[1].includes('[') ? `<a href="https://www.openstreetmap.org/?mlat=${trip[1].slice(1,-1)}&mlon=${trip[2].slice(1,-1)}" target="_blank" title="View in Open Street Map">${trip[0]}</a>` : trip[0]);
        let row = `<tr><td>${td_el}</td><td>${trip.slice(1).filter(el => !el.includes('[')).join(', ')}</td></tr>`;
        tableData.insertAdjacentHTML('beforeend', row);
        displayOnMap(trip, false);
        continue;
      };
      if (join_ropes) {
        for (let [_, _join] of Object.entries(join_combs(ropes))) {
          if (pitches.every((pitch, i) => { return pitch <= _join[i] })) {
            let td_el = (trip[1].includes('[') ? `<a href="https://www.openstreetmap.org/?mlat=${trip[1].slice(1,-1)}&mlon=${trip[2].slice(1,-1)}" target="_blank" title="View in Open Street Map">${trip[0]}</a>` : trip[0]);
            let row = `<tr class="join"><td>${td_el}</td><td>${trip.slice(1).filter(el => !el.includes('[')).join(', ')}</td></tr>`;
            tableData.insertAdjacentHTML('beforeend', row);
            displayOnMap(trip, true);
            break;
          };
        };
      };
    };
    // Fit map to markers
    fitBounds();
  });
};

// Get all unique rope join combinations (reverse sorted)
function join_combs(ropes) {
  function join(ropes) {
    let joins = [];
    for (var i = 0; i < ropes.length - 1; i++) {
      for (var j = i + 1; j < ropes.length; j++) {
        joins.push(ropes.slice(0, i).concat(ropes[i] + ropes[j], ropes.slice(i + 1, j), ropes.slice(j + 1)));
      }
    }
    return joins;
  }

  let joins = join(ropes);
  joins.forEach(i => {
    if (i.length > 1) {
      join(i).forEach(j => {
        joins.push(j.sort().reverse());
      });
    }
  });
  joins = Object.values(joins.reduce((p, c) => (p[JSON.stringify(c)] = c, p), {}));
  return (joins);
}

// Display on map
let markers = [];
let lost_count = document.getElementById('lost_count');
let lost_message = document.getElementById('lost_message');
function displayOnMap(trip, join) {
  if (trip[1].includes('[')) {
    let marker = L.marker(trip.slice(1,3).map(el => parseFloat(el.slice(1,-1)))).addTo(caveMap);
    if (!join) {
      marker._icon.classList.add('black');
    }
    marker.bindPopup(`<a href="https://www.openstreetmap.org/?mlat=${trip[1].slice(1,-1)}&mlon=${trip[2].slice(1,-1)}" target="_blank" title="View in Open Street Map">${trip[0]}</a>`);
    markers.push(marker);
  } else {
    lost_count.textContent = parseInt(lost_count.textContent)+1;
    lost_message.style.display = 'block';
  }
}

// Clear map of existing markers
function clearMap() {
  markers.forEach(marker => caveMap.removeLayer(marker));
  markers = [];
  lost_count.textContent = '0';
  lost_message.style.display = 'none';
}

// Move map to show all markers
let group = null;
function fitBounds() {
  if ( markers.length > 0 ) {
    group = new L.featureGroup(markers);
    caveMap.flyToBounds(group.getBounds().pad(0.1), );
  }
}