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

  // Get trip lengths
  fetch('pitchlengths.txt')
    .then(response => response.text())
    .then(function(trips) {
      // Parse and sort pitch lengths
      trips = trips.split('\n').filter(
        line => !(line.startsWith('#') | line.length < 3)
      );
      trips = trips.map(
        line => line.split(',').map(
          element => parseInt(element) ? parseInt(element) : element
        )
      );

      // Filter trips based on lengths
      valid_trips = filter_trips(trips, ropes).sort((a,b) => a[0]>b[0]);

      // Reset and populate results table
      tableData.innerHTML = '';
      valid_trips.forEach(trip => {
        let row = `<tr><td>${trip[0]}</td><td>${trip.slice(1).join(', ')}</td>`;
        tableData.insertAdjacentHTML('beforeend',row);
      });

      // Handle joins if selected
      if (document.getElementById('join').checked) {
        joined_trips = [];
        join_combs(ropes).forEach(r => {
          joined_trips = joined_trips.concat(filter_trips(trips, r));
        });
        joined_trips = Object.values(joined_trips.reduce((p,c) => (p[JSON.stringify(c)] = c,p),{}));

        valid_trips = valid_trips.map(t => t[0])
        joined_trips.sort((a,b) => a[0]>b[0]).forEach(trip => {
          if (!valid_trips.includes(trip[0])) {
            let row = `<tr class="join"><td>${trip[0]}</td><td>${trip.slice(1).join(', ')}</td>`;
            tableData.insertAdjacentHTML('beforeend',row);
          }
        });
      }
    });
}

// Filter possibe trips based on given ropes
function filter_trips(trips, ropes) {
  trips = trips.filter(pitches => {
    // Shortcut: remove trips with more pitches than rope lengths
    if (!(pitches.length-1 <= ropes.length)) {
      return false;
    };
    // Compare pitch lengths and available rope lengths
    return pitches.slice(0).sort((a,b) => a<b).slice(1).every((pitch, i) => {
      return pitch <= ropes[i];
    });
  });

  return trips;
}

// Get all rope length combinations possible by joining
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
        joins.push(j);
      });
    }
  });
  joins = Object.values(joins.reduce((p,c) => (p[JSON.stringify(c)] = c,p),{}));
  return(joins);
}
