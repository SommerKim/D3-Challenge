// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 50
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("data.csv").then(function(data) {

    // Parse data
    data.forEach(function(data) {
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcareLow = +data.healthcareLow;
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
      });

    // Create scale functions
    var xLinearScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.poverty)])
      .range([0, width / 1.25]);

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.obesity)])
      .range([height, 0]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append axes to chart
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Create circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .classed("stateCircle", true)
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("cy", d => yLinearScale(d.obesity))
      .attr("r", "10")
      .attr("opacity", ".7");

    // Initialize tooltip
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
          return(`In Poverty (%): ${d.poverty}<br>Obesity (%): ${d.obesity}`);
      });

    // Create tooltip in chart
    chartGroup.call(toolTip);

    // Create event listeners
    circlesGroup.on("click", function(data) {
        toolTip.show(data, this);
    })
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });
    
    // Create labels
    var circleLabels = chartGroup.selectAll(null)
      .data(data)
      .enter()
      .append("text");

    circleLabels
      .attr("x", d => xLinearScale(d.poverty))
      .attr("y", d => yLinearScale(d.obesity) + 4)
      .text(d => d.abbr)
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .attr("fill", "white");

    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 1.75))
        .attr("dy", "1em")
        .text("Obesity (%))");

    chartGroup.append("text")
        .attr("transform", `translate(${width / 3.25}, ${height + margin.top + 25})`)
        .text("Household Income (Median)");
    }).catch(function(error) {
        console.log(error);
    });