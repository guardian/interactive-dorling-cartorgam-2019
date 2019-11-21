import * as d3B from "d3"
import * as topojson from "topojson"
import * as d3GeoProjection from "d3-geo-projection"
import cartels from 'raw-loader!./../assets/subscribers.csv'
import map from '../assets/ne_10m_admin_0_countries.json';
import { $ } from "./util"

const d3 = Object.assign({}, d3B, topojson, d3GeoProjection);

const cartelsData = d3.csvParse(cartels);

let year = "2018"

d3.select(".date")
.html(year)

d3.select('.interactive-wrapper')
.append('div')
.attr('class', 'buttons')

d3.select('.interactive-wrapper')
.append('div')
.attr('class', 'date')

Object.getOwnPropertyNames(cartelsData[0]).map((o,i) => {
  if(i > 4){
    d3.select(".buttons")
    .append("button")
    .attr("type","button")
    .attr("class","btn-btn")
    .append("div")
    .attr("class","label")
    .text(o)
    .on('click', d => updateDorling(o))
  }
})

let cont = 0;

let width = $(".interactive-wrapper").getBoundingClientRect().width;
let height = width * 3 / 5;

let svg = d3.select(".interactive-wrapper")
.append("svg")
.attr("width", width)
.attr("height", height);

let simulation = d3.forceSimulation()
.force("charge", d3.forceManyBody().strength(-1.9))
.force("x", d3.forceX(d => d.x0))
.force("y", d3.forceY(d => d.y0))
.force("collide", d3.forceCollide().radius(d => d.r))
.on("tick", tick)
.on('end', function() {
  console.log("end")
})

let projection = d3.geoEckert3();

let path = d3.geoPath()
.projection(projection)

let radius = d3.scaleSqrt()
.domain([0, 393981])
.range([0, 100]);

projection.fitExtent([[20, 20], [width, height]], topojson.feature(map, map.objects.ne_10m_admin_0_countries));

let geoMap = svg.append("path")
.datum(topojson.feature(map, map.objects.ne_10m_admin_0_countries))
.attr("d", path)
.style('fill', 'none')
.style('stroke', 'black');


let nodes = cartelsData.map(d => {

  let point = projection([d.latitude, d.longitude]);
  let value = +d['total ' + year];

  return {
    continent: d.continent,
    x: point[0], y: point[1],
    x0: point[0], y0: point[1],
    value: value,
    r: radius(value)
  }
})

simulation.nodes(nodes)

let node = svg.selectAll("circle")
.data(nodes)
.enter()
.append("circle")
.attr("class", d => d.continent)
.attr("r", d => d.r )

function updateDorling(date)
{

  d3.select(".date")
  .html(date)

  nodes = cartelsData.map(d => {

    let point = projection([d.latitude, d.longitude]);
    let value = +d[date];

    return {
      x: point[0], y: point[1],
      x0: point[0], y0: point[1],
      value: value,
      r: radius(value)
    }
  })

  simulation.nodes(nodes);

  svg.selectAll("circle")
  .data(nodes)
  .transition(100)
  .attr("r", d => d.r )


  simulation.alpha(1).restart();
}


function tick() {
  node
  .attr("cx", d => d.x)
  .attr("cy", d => d.y)
}