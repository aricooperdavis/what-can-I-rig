# What can I rig?
Enter the ropes you have and find out what trips you can go on (in the Yorkshire Dales).

Find it at: [aricooperdavis.github.io/what-can-I-rig](https://aricooperdavis.github.io/what-can-I-rig/)

### URL Parameters
<!--
// Calculate number of trips per region using:
fetch(`./pitchlengths/${region}.txt`).then(response => response.text()).then(function (trips) {
    // Parse and sort pitch lengths
    trips = trips.split('\n').filter(
      line => !(line.startsWith('#') | line.length < 3)
    );
    console.log(trips);
});
-->
You can preset the region of interest by passing a `region` URL parameter, e.g. `https://aricooperdavis.github.io/what-can-I-rig/?region=derbyshire`. Currently available regions are:

| Region | Trips |
| :- | :- |
| Derbyshire | 105 |
| Scotland | 3 |
| Yorkshire (*default*)| 181 |

### Data Sources
This data is not necessarily accurate, nor have I asked for permission to use it. So far it has been sourced from:

- [Braemoor](https://www.braemoor.co.uk/caving/pitchlengths.txt)
- [CCPC Peak District Rigging Guide](https://www.ccpc.org.uk/rigging.html)
- [CNCC](https://cncc.org.uk)
- [Northern Caves](https://northerncaves.co.uk/)
- [Not for the Faint-Hearted (Mike Cooper)](https://starlessriver.com/shop/not-for-the-faint-hearted/)
- [Simon Wilson](https://resinanchor.co.uk/6.html)

As far as I am aware the following contributors have collated this data:

- Sam Allshorn
- Ari Cooper-Davis
- John Gardner
- Jenny Drake

### Corrections
Please feel free to [raise an issue](https://github.com/aricooperdavis/what-can-I-rig/issues) if you spot mistakes, or if you're familiar with Git then make the changes yourself and open a pull request.
