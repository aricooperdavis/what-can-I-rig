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
        ).sort((a,b) => a<b)
      );

      // Filter trips based on lengths
      // First pass - remove trips with more pitches than ropes
      trips = trips.filter(pitches => {
        // Shortcut: remove trips with more pitches than rope lengths
        if (!(pitches.length-1 <= ropes.length)) {
          return false;
        };
        // Compare pitch lengths and available rope lengths
        return pitches.slice(1).every((pitch, i) => {
          return pitch <= ropes[i];
        });
      });

      // Reset and populate results table
      tableData.innerHTML = '';
      trips.forEach(trip => {
        let row = `<tr><td>${trip[0]}</td><td>${trip.slice(1).join(', ')}</td>`;
        tableData.insertAdjacentHTML('beforeend',row);
      });
    });
}
