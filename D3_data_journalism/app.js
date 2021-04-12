// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 50
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append svg group  
var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial parameters
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// Updating x-scale based on user choice
function xScale(data, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]),
      d3.max(data, d => d[chosenXAxis])
    ])
    .range([0, width / 1.4]);
  
  return xLinearScale;

}

// Updating x-scale based on user choice
function yScale(data, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]),
      d3.max(data, d => d[chosenYAxis])
    ])
    .range([0, width / 1.4]);
  
  return yLinearScale;

}

// Updating X Axis based on user choice
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// Updating circles group with transition
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// Updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "Poverty (%):";
  }
  if (chosenXAxis === "age") {
    label = "Age (Median):";
  }
  else {
    label = "Household Income (Median):";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("click", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Import Data
d3.csv("data.csv").then(function(data, err) {
  if (err) throw (err);

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
    var xLinearScale = xScale(data, chosenXAxis);

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.obesity)])
      .range([height, 0]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append axes to chart
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      // .classed("y-axis", true)
      .call(leftAxis);

    // Create circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.obesity))
      .attr("r", "10")
      .attr("fill", "blue")
      .attr("opacity", ".5")

    chartGroup.selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .text(d => d.abbr)
      .attr("x", d => xLinearScale(d.poverty))
      .attr("y", d => yLinearScale(d.obesity) + 4)
      .attr("font-size", "10px")
      .attr("fill", "white")
      .attr("text-anchor", "middle");

    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 3}, ${height + 20})`);
    
    var povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty")
      .classed("active", true)
      .text("Poverty (%)")
      
    var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .classed("active", false)
    .text("Age (Median)")

    var incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income")
      .classed("active", false)
      .text("Household Income (Median)")

    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // X Axis event listener
    labelsGroup.selectAll("text")
      .on("click", function() {
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
          chosenXAxis = value;
          xLinearScale = xScale(data, chosenXAxis);
          xAxis = renderAxes(xLinearScale, xAxis);
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
          circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

          // Change classes to match chosen text
          if (chosenXAxis === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          if (chosenXAxis === "income") {
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        }
      });
    }).catch(function(error) {
      console.log(error);
    });

    // // Initialize tooltip
    // var toolTip = d3.tip()
    //   .attr("class", "tooltip")
    //   .offset([80, -60])
    //   .html(function(d) {
    //       return(`State: ${d.abbr}<br>In Poverty (%): ${d.poverty}<br>Obesity (%): ${d.obesity}`);
    //   });

    // // Create tooltip in chart
    // chartGroup.call(toolTip);

    // // Create event listeners
    // circlesGroup.on("click", function(data) {
    //     toolTip.show(data, this);
    // })
    //     .on("mouseout", function(data, index) {
    //         toolTip.hide(data);
    //     });
    
    // // Create axes labels
    // chartGroup.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 0 - margin.left)
    //     .attr("x", 0 - (height / 1.75))
    //     .attr("dy", "1em")
    //     .attr("class", "axisText")
    //     .text("Obesity (%))");

    // chartGroup.append("text")
    //     .attr("transform", `translate(${width / 4}, ${height + margin.top + 25})`)
    //     .attr("class", "axisText")
    //     .text("Household Income (Median)");
    // }).catch(function(error) {
    //     console.log(error);
    // });
