var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 170,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis] / 1.1), d3.max(data, d => d[chosenXAxis] * 1.05)])
    .range([0, (width / 1.25)]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis] / 6.5), d3.max(data, d => d[chosenYAxis])])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating xAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesXGroup, newXScale, chosenXAxis) {

  circlesXGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesXGroup;
}

function renderYCircles(circlesYGroup, newYScale, chosenYAxis) {

  circlesYGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesYGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circleLabels) {

  var xlabel;
  var ylabel;

  if (chosenXAxis === "poverty") {
    if (chosenYAxis === "obesity") {
      xlabel = "Poverty (%)"
      ylabel = "Obesity (%)"
    }
    if (chosenYAxis === "smokes") {
      xlabel = "Poverty (%)"
      ylabel = "Smokes (%)"
    }
    if (chosenYAxis === "healthcare") {
      xlabel = "Poverty (%)"
      ylabel = "Lack of Healthcare (%)"
    }
  }
  if (chosenXAxis === "age") {
    if (chosenYAxis === "obesity") {
      xlabel = "Age (Median)"
      ylabel = "Obesity (%)"
    }
    if (chosenYAxis === "smokes") {
      xlabel = "Age (Median)"
      ylabel = "Smokes (%)"
    }
    if (chosenYAxis === "healthcare") {
      xlabel = "Age (Median)"
      ylabel = "Lack of Healthcare (%)"
    }
  }
  if (chosenXAxis === "income") {
    if (chosenYAxis === "obesity") {
      xlabel = "Household Income (Median)"
      ylabel = "Obesity (%)"
    }
    if (chosenYAxis === "smokes") {
      xlabel = "Household Income (Median)"
      ylabel = "Smokes (%)"
    }
    if (chosenYAxis === "healthcare") {
      xlabel = "Household Income (Median)"
      ylabel = "Lack of Healthcare (%)"
    }
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([5, -5])
    .html(function(d) {
      return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]} <br> ${ylabel}: ${d[chosenYAxis]}`);
    });

  circleLabels.call(toolTip);

  circleLabels.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });

  return circleLabels;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function(data, err) {
  if (err) throw err;

  // parse data
  data.forEach(function(data) {
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcareLow = +data.healthcareLow;
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
});

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // yLinearScale function above csv import
  var yLinearScale = yScale(data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("opacity", ".7");

  // Append initial circle labels
  var circleLabels = chartGroup.selectAll(null)
    .data(data)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]) + 4)
    .text(d => d.abbr)
    .attr("font-size", "10px");

    // Create group for three x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2.5}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .classed("active", true)
    .classed("inactive", false)
    .text("Poverty (%)");
    
  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .classed("active", false)
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .classed("active", false)
    .classed("inactive", true)
    .text("Household Income (Median)");

    // Create group for three y-axis labels
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

  var obesityLabel = yLabelsGroup.append("text")
    .attr("x", -150)
    .attr("y", -80)
    .attr("value", "obesity")
    .classed("active", true)
    .classed("inactive", false)
    .text("Obesity (%)");
    
  var smokesLabel = yLabelsGroup.append("text")
    .attr("x", -150)
    .attr("y", -60)
    .attr("value", "smokes")
    .classed("active", false)
    .classed("inactive", true)
    .text("Smokes (%)");

  var healthcareLabel = yLabelsGroup.append("text")
    .attr("x", -150)
    .attr("y", -40)
    .attr("value", "healthcare")
    .classed("active", false)
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");
  
  // updateToolTip function above csv import
  var circleLabels = updateToolTip(chosenXAxis, chosenYAxis, circleLabels);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        chosenXAxis = value;

        xLinearScale = xScale(data, chosenXAxis);

        xAxis = renderXAxes(xLinearScale, xAxis);

        circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

        circleLabels
          .transition()
          .duration(1000)
          .attr("x", d => xLinearScale(d[chosenXAxis]))
          .attr("y", d => yLinearScale(d[chosenYAxis]) + 4)

        circleLabels = updateToolTip(chosenXAxis, chosenYAxis, circleLabels);

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
        if (chosenXAxis === "age"){
          povertyLabel
          .classed("active", false)
          .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
          .classed("active", false)
          .classed("inactive", true);
        }
        if (chosenXAxis === "income"){
          povertyLabel
          .classed("active", false)
          .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
          .classed("active", true)
          .classed("inactive", false);
        }
      }
    });

  // y axis labels event listener
  yLabelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
        chosenYAxis = value;

        YLinearScale = yScale(data, chosenYAxis);

        yAxis = renderYAxes(yLinearScale, yAxis);

        circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

        circleLabels
          .transition()
          .duration(1000)
          .attr("x", d => xLinearScale(d[chosenXAxis]))
          .attr("y", d => yLinearScale(d[chosenYAxis]) + 4)

        circleLabels = updateToolTip(chosenXAxis, chosenYAxis, circleLabels);

      if (chosenYAxis === "obesity") {
        obesityLabel
          .classed("active", true)
          .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
        .classed("active", false)
        .classed("inactive", true);
      }
      if (chosenYAxis === "smokes"){
        obesityLabel
        .classed("active", false)
        .classed("inactive", true);
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        healthcareLabel
        .classed("active", false)
        .classed("inactive", true);
      }
      if (chosenYAxis === "healthcare"){
        obesityLabel
        .classed("active", false)
        .classed("inactive", true);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
        .classed("active", true)
        .classed("inactive", false);
      }
    }
  });

}).catch(function(error) {
  console.log(error);
});
