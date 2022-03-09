// Remove rope input
let ropeInput = document.getElementsByClassName('rope')[0];
function removeRope(event) {
  event.target.parentNode.remove()
}

// Add rope input
let addButton = document.getElementById('add');
addButton.onclick = function addRope() {
  let newInput = ropeInput.cloneNode(true);
  newInput.lastChild.disabled = false;
  newInput.firstChild.value = '';
  addButton.parentNode.insertBefore(newInput, addButton);
  for (let el of document.getElementsByClassName('rope')) {
    el.lastChild.onclick = removeRope;
  };
};

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
  ropes = ropes.map(el => parseInt(el)).filter(el => el).sort((a,b) => a<b);
  let join_ropes = document.getElementById('join').checked;

  // Reset output
  tableData.innerHTML = '';

  // Get trip lengths
  fetch('pitchlengths.txt').then(response => response.text()).then(function(trips) {
    // Parse and sort pitch lengths
    trips = trips.split('\n').filter(
      line => !(line.startsWith('#') | line.length < 3)
    );
    for (let [_, trip] of Object.entries(trips.sort())) {
      trip = trip.split(',');
      // Trips can't have more pitches than we have ropes
      if (trip.length-1 > ropes.length) {
        continue;
      };
      // Pitches must be possible
      pitches = trip.slice(1).map(x => parseInt(x.trim())).sort((a,b) => a<b);
      if (pitches.every((pitch, i) => {return pitch <= ropes[i]})) {
        let row = `<tr><td>${trip[0]}</td><td>${trip.slice(1).join(', ')}</td></tr>`;
        tableData.insertAdjacentHTML('beforeend',row);
        continue;
      };
      if (join_ropes){
        for (let [_, _join] of Object.entries(join_combs(ropes))) {
          if (pitches.every((pitch, i) => {return pitch <= _join[i]})) {
            let row = `<tr class="join"><td>${trip[0]}</td><td>${trip.slice(1).join(', ')}</td></tr>`;
            tableData.insertAdjacentHTML('beforeend',row);
            break;
          };
        };
      };
    };
  });
};

// Get all unique rope join combinations (reverse sorted)
function join_combs(ropes) {
  function join(ropes) {
    let joins = [];
    for (var i = 0; i < ropes.length-1; i++) {
      for (var j = i+1; j < ropes.length; j++) {
        joins.push(ropes.slice(0,i).concat(ropes[i]+ropes[j],ropes.slice(i+1,j),ropes.slice(j+1)));
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
  joins = Object.values(joins.reduce((p,c) => (p[JSON.stringify(c)] = c,p),{}));
  return(joins);
}
