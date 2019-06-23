
import * as d3 from "d3";


const w = 1200;
const h = 600;
const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json'
const margin = {
  top: 20,
  bottom: 100,
  left: 62,
  right: 20
}
const width = w - margin.left - margin.right;
const height = h - margin.top - margin.bottom;

const tooltip = d3.select('body')
        .append('div')
        .attr("id", "tooltip")
        .classed('tooltip', true);

const svg = d3.select('.container').append('svg')
        .attr('id', 'chart')
        .attr('width', w)
        .attr('height', h);

const chart = svg.append('g')
        .classed('display', true)
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

const colors = ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"];
const cLength = colors.length;

init.call(chart)

async function init() {
  try {
    const data  = await d3.json(url);
    data.monthlyVariance = data.monthlyVariance.map(elm => ({
        ...elm,
        month: elm.month-1
    }))
    
    const years = Array.from(new Set(data.monthlyVariance.map(val => val.year).filter(elm => !(elm%10))))
    const variances = data.monthlyVariance.map(val => val.variance);
    console.log(data)
    
    const legendWidth = 350;
    const legendHeight = 300/cLength;
    
    const min = data.baseTemperature + Math.min(...variances);
    const max = data.baseTemperature + Math.max(...variances);
    const step = (max-min)/cLength;
    const domain = Array(cLength-1).fill(0).map((elm,i) => (min + ((i+1)*step)))

    const legendThreshold = d3.scaleThreshold()
        .domain(domain)
        .range(colors);
    
    const legendData = legendThreshold.range().map(elm => legendThreshold.invertExtent(elm))
    legendData[0][0] = min;
    legendData[legendData.length-1][1] = max;
 
    
    const legendX = d3.scaleLinear()
        .domain([min, max])
        .range([0, legendWidth]);
    
    const legendXAxis = d3.axisBottom(legendX)
        .tickSize(10, 0)
        .tickValues(legendThreshold.domain())
        .tickFormat(d3.format(".1f"));
    
    const legend = this.append("g")
        .classed("legend", true)
        .attr("id", "legend")
        .attr("transform", "translate(" + 0 + "," +  520 + ")");
    
    legend.append("g").selectAll("rect")
        .data(legendData)
        .enter().append("rect")
          .style("fill", d => legendThreshold(d[0]))
          .attr('x', d => legendX(d[0]))
          .attr('y', d => 0)
          .attr('width', d => legendX(d[1]) - legendX(d[0]))
          .attr('height', legendHeight)
    
    legend.append("g")
        .attr("transform", "translate(" + 0 + "," + legendHeight + ")")
        .call(legendXAxis);
        
    
    
    d3.select('#title')
        .append("h3")
        .attr('id', 'description')
        .html(data.monthlyVariance[0].year + " - " + data.monthlyVariance[data.monthlyVariance.length-1].year + ": base temperature " + data.baseTemperature + "&#8451;");
    
    const y = d3.scaleBand()
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
        .range([0, height], 0, 0);
    
    const x = d3.scaleBand()
        .domain(data.monthlyVariance.map(val =>val.year))
        .range([0, width], 0, 0);
     
    const yAxis = d3.axisLeft(y)
        .tickValues(y.domain())
        .tickFormat(month => {
          let date = new Date(0);
          date.setUTCMonth(month);
          return d3.timeFormat("%B")(date);
        })
        .tickSize(10, 1);
    
    const xAxis = d3.axisBottom(x)
        .tickValues(years)
        .tickSize(10, 1);
    
     this.append("g")
        .classed("axis", true)
        .attr("id", "y-axis")
        .attr("transform", "translate(0, 0)")
        .call(yAxis)
    
    this.append("g")
        .classed("axis", true)
        .attr("id", "x-axis")
        .attr("transform", "translate( 0," + height + ")")
        .call(xAxis)
  
    
    this.append("g")
          .classed("map", true)
          .attr("transform", "translate(1,0)")
        .selectAll("rect")
        .data(data.monthlyVariance)
        .enter().append("rect")
          .attr('class', 'cell')
          .attr('data-month',d => d.month)
          .attr('data-year',d => d.year)
          .attr('data-temp', d => data.baseTemperature + d.variance)
          .attr('x', d => x(d.year))
          .attr('y', d => y(d.month))
          .attr("height", 100)
			    .transition()
			    .duration(200)
          .delay((d, i) => i * 1)
          .attr('width', d => x.bandwidth(d.year))
          .attr('height', d => y.bandwidth(d.month))
          .attr("fill", d => legendThreshold(data.baseTemperature + d.variance))
          .attr('stroke', '#8bcfff47');
    
    this.selectAll("rect")
          .on('mouseover', showTooltip)
          .on('touchstart', showTooltip)
          .on('mouseout', hideTooltip)
          .on('touchend', hideTooltip);


    function showTooltip(d,i) {
      const date = new Date(d.year, d.month);
      const str = `${d3.timeFormat("%Y - %B")(date)} <br /> 
${d3.format(".1f")(data.baseTemperature + d.variance)} &#8451; <br /> 
${d3.format("+.1f")(d.variance)} &#8451;`;
      tooltip
        .style('opacity', 1)
        .style('left', d3.event.x -(tooltip.node().offsetWidth / 2) + 'px')
        .style('top', d3.event.y + -90 + 'px')
        .attr("data-year", d.year)
        .html(str)
 }
  
     function hideTooltip() {
          tooltip
            .style('opacity', 0)
     }
    
} catch(e) {
    console.log(e)
  }
}