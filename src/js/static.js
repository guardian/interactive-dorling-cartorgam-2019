import * as d3B from "d3"
import * as d3Select from 'd3-selection'
import * as topojson from "topojson"
import * as d3GeoProjection from "d3-geo-projection"

const d3 = Object.assign({}, d3B, d3Select, topojson, d3GeoProjection);


let year = "2018"
let datum;
let nodes;
let simulation;

let svg = d3.select(".interactive-wrapper").append("svg").attr("width", 1260).attr("height", 752),
    margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    padding = 0;

let projection = d3.geoCylindricalStereographic();

let radius = d3.scaleSqrt()
    .range([0, 100]);

Promise.all([
  d3.csv('../assets/subscribers.csv'),
  d3.json('../assets/ne_10m_admin_0_countries.json')
  ])
.then(initialize)

function initialize(data) {

  datum = data[0];

  projection.fitSize([width, height], topojson.feature(data[1], data[1].objects.ne_10m_admin_0_countries));

  let currentValues = []

  data[0].map(d => currentValues.push(+d["total " + year]))

  let max = d3.max(currentValues);

  radius
  .domain([0, max])

  nodes = data[0].map(d => {
    
    let point = projection([d.latitude, d.longitude]);
    let value = +d["total " + year];

    return {
      country: d.country,
      continent: d.continent,
      x: point[0], y: point[1],
      x0: point[0], y0: point[1],
      value: value,
      r: radius(value)
    }
  })

  simulation = d3.forceSimulation()
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(function(d) { return d.x0; }))
      .force("y", d3.forceY(function(d) { return d.y0; }))
      .force("collide", d3.forceCollide().radius(d => d.r + 1))
      .nodes(nodes)
      .on("tick", tick)
      .on('end', function() {
      console.log("end")
    })
  

  let node = svg.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("id", d => d.continent.replace(" " , "-") + " " +  d.country.replace(" " , "-"))
    .attr("class", d => d.continent.replace(" " , "-") + " " +  d.country.replace(" " , "-"))
    .attr("r", function(d) { return d.r })


  function tick() {
    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

}