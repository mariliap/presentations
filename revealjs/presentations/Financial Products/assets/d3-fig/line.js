function functionGrahph(profitFunctions, funcParams, colors, xRange, yRange, canvasSize, areas) {

  
  width = canvasSize.width;
  height = canvasSize.height;

  const svg = d3.select("body")
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Define chart area
  svg
    .append("clipPath")
    .attr("id", "chart-area")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)

  let xScale = d3.scaleLinear(xRange, [0, width])
  let yScale = d3.scaleLinear(yRange, [height, 0])

  let graph = {
    svg: svg,
    xScale: xScale,
    yScale: yScale
  };

  let xAxis = d3.axisBottom(xScale)
  let yAxis = d3.axisLeft(yScale)

  // Axis 
  svg.append("g")
    .attr("class", "axisWhite")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis)
  svg.append("g")
    .attr("class", "axisWhite")
    .attr("transform", `translate(0,0)`)
    .call(yAxis)

  // Axis label
  svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width / 2 + 5)
    .attr("y", height + 35)
    .style("fill", "white")
    .text("market price");

  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", -35)
    .attr("x", -height / 2)
    .attr("transform", "rotate(-90)")
    .style("fill", "white")
    .html("profit");


  addHorizontalLineAt('lineAtZero', graph, 0, 'white', xRange)
  addVerticalLineAt('lineAtStrike', graph, funcParams.strikePrice, 'white', yRange)
  

  const hMovableLine = 
    addHorizontalLineAt('hMovableLine', graph, yRange[0], 'black', xRange)
  const vMovableLine = 
    addVerticalLineAt('vMovableLine', graph, xRange[0], 'black', yRange)
  for(var i=0; i< areas.length; i++){
    addArea(areas[i].id, graph, areas[i].x0, areas[i].x1, areas[i].color, areas[i].opacity, xRange, yRange)
  }

  // Add function graph
  let line = d3.line()
    .x(d => xScale(d[0]))
    .y(d => yScale(d[1]))


  const dataArr = [];
  const focusCircleArr = [];
  const focusTextArr = [];
  for (var i = 0; i < profitFunctions.length; i++) {
    //const data = graphFunction(profitComparedToStartDate);
    const data = graphFunction(profitFunctions[i].function);
    svg.append("path")
      .datum(data)
      .attr("clip-path", "url(#chart-area)")
      .attr("fill", "none")
      .attr("stroke", profitFunctions[i].color)
      .attr("stroke-width", 2)
      .attr("d", line);
    dataArr.push(data);

    // Create the circle that travels along the curve of chart
    var focusCircle = svg
      .append('g')
      .append('circle')
      .style("fill", "none")
      .attr("stroke", "white")
      .attr('r', 8.5)
      .style("opacity", 0)
    focusCircleArr.push(focusCircle)

    // Create the text that travels along the curve of chart
    var focusText = svg
      .append('g')
      .append('text')
      .style("opacity", 0)
      .attr("text-anchor", "left")
      .style("fill", "white")
      .attr("alignment-baseline", "middle")
    focusTextArr.push(focusText)

  }

  // Create a rect on top of the svg area: this rectangle recovers mouse position
  svg
    .append('rect')
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', width)
    .attr('height', height)
    .on('mouseover', () => mouseover(focusCircleArr, focusTextArr, hMovableLine, vMovableLine))
    .on('mousemove', (event) => mousemove(event, xScale, yScale, dataArr, focusCircleArr, focusTextArr, hMovableLine, vMovableLine, xRange, yRange))
    .on('mouseout', () => mouseout(focusCircleArr, focusTextArr, hMovableLine, vMovableLine));

  return graph;
}


function graphFunction(profitFunction) {
  pointNum = 5000;

  const data = [];
  for (let x = 0; x <= pointNum; x++) {
    y = profitFunction(x);
    data.push([x, y])
  }
  return data;
}

// This allows to find the closest X index of the mouse:
var bisect = d3.bisector(function (d) { return d[0]; }).left;

// What happens when the mouse move -> show the annotations at the right positions.
function mouseover(focusCircleArr, focusTextArr,
  hMovableLine, vMovableLine) {
  for (var i = 0; i < focusCircleArr.length; i++) {
    focusCircleArr[i].style("opacity", 1)
    focusTextArr[i].style("opacity", 1)
  }
  hMovableLine.style("opacity", 1)
  vMovableLine.style("opacity", 1)
}

function mousemove(event, xScale, yScale,
  dataArr, focusCircleArr, focusTextArr,
  hMovableLine, vMovableLine, xRange, yRange) {
  // recover coordinate we need
  var x0 = xScale.invert(d3.pointer(event)[0]);

  for (var i = 0; i < focusCircleArr.length; i++) {

    var data = dataArr[i];
    var index = bisect(data, x0, 1);

    //selectedData = data[i];
    var selectedData = {};
    if (data[index]) {
      selectedData.x = data[index][0];
      selectedData.y = data[index][1];
    }

    focusCircleArr[i]
      .attr("cx", xScale(selectedData.x))
      .attr("cy", yScale(selectedData.y));
    focusTextArr[i]
      .html("(x:" + selectedData.x + ", " + "y:" + selectedData.y + ")")
      .attr("x", xScale(selectedData.x) + 15)
      .attr("y", yScale(selectedData.y))

  }
  var y0 = 100;
  moveHorizontalLine(y0, hMovableLine, xRange)
  moveVerticalLine(x0, vMovableLine, yRange)
}

function mouseout(focusCircleArr, focusTextArr,
  hMovableLine, vMovableLine) {
  for (var i = 0; i < focusCircleArr.length; i++) {
    focusCircleArr[i].style("opacity", 0)
    focusTextArr[i].style("opacity", 0)
  }
  hMovableLine.style("opacity", 0)
  vMovableLine.style("opacity", 0)
}

function addHorizontalLineAt(id, graph, value, color, xRange) {
  let lineAt = d3.line()
    .x(d => graph.xScale(d[0]))
    .y(d => graph.yScale(d[1]))
  const dataLineAt = [];

  for (let x = xRange[0]; x <= xRange[1]; x++) {
    dataLineAt.push([x, value])
  }
  var lineElement = graph.svg.append("path")
    .datum(dataLineAt)
    .attr("id", id)
    .attr("clip-path", "url(#chart-area)")
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 1)
    .style("stroke-dasharray", ("3, 3"))
    .attr("d", lineAt);
  return lineElement;
}

function addVerticalLineAt(id, graph, value, color, yRange, crossingPoints) {
  let lineAt = d3.line()
    .x(d => graph.xScale(d[0]))
    .y(d => graph.yScale(d[1]))
  const dataLineAt = [];

  for (let y = yRange[0]; y <= yRange[1]; y++) {
    dataLineAt.push([value, y])
  }

  // add the area if not exists
  let element = graph.svg.select("#" + id);
  if(element.empty()){
    element = graph.svg.append("path")
      .attr("id", id);
  }
  element
    .datum(dataLineAt)
    .attr("clip-path", "url(#chart-area)")
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 1)
    .style("stroke-dasharray", ("3, 3"))
    .attr("d", lineAt);

  if(crossingPoints){
    let xPoint = value;
    let yPoints = crossingPoints.getY(xPoint);
    let yPointsColors = crossingPoints.colors;
    graph.svg.selectAll(`g#${id}`).data([]).exit().remove()
    const toFindDuplicates = arry => arry.filter((item, index) => arry.indexOf(item) !== index)
    let repeated = toFindDuplicates(yPoints)
    let processed = [];
    for(let i=0; i< yPoints.length;i++){
      
      radius = repeated.includes(yPoints[i])? (!processed.includes(yPoints[i])? 5 : 3) : 4;
      processed.push(yPoints[i])
      circle = graph.svg
        .append('g')
        .attr("id", id)
        .append('circle')
        .style("fill", yPointsColors[i])
        .attr("stroke", "none")
        .attr('r', radius)
        .style("opacity", 1)
        .attr("cx", graph.xScale(xPoint))
        .attr("cy", graph.yScale(yPoints[i]));

      // let circle = graph.svg.selectAll(`g#${id}`).filter((d, index) => index === i)
      // if(circle.empty()){
      //   circle = graph.svg
      //     .append('g')
      //     .attr("id", id)
      //     .append('circle')
      //     .style("fill", yPointsColors[i])
      //     .attr("stroke", "none")
      //     .attr('r', 4)
      //     .style("opacity", 1)
      // }
      // circle
      //       .attr("cx", graph.xScale(xPoint))
      //       .attr("cy", graph.yScale(yPoints[i]));
      // console.log(graph.xScale(xPoint) +', '+ graph.yScale(yPoints[i]))
    }
  }

  return element;
}

function addArea(id, graph, x, xOffset, color, opacity, xRange, yRange){

  var area = d3.area()
    .x(d => graph.xScale(d[0]))// Position of both line breaks on the X axis
    .y0(d => graph.yScale(yRange[0]))//.y0(canvasSize.height) /// Y position of bottom line breaks (400 = bottom of svg area)
    .y1(d => graph.yScale(d[1]));// Y position of top line breaks


  const data = []; 
  data.push([x,yRange[1]]); 
  data.push([x+xOffset,yRange[1]]); 

  // add the area if not exists
  let element = graph.svg.select("#" + id);
  if(element.empty()){
    element = graph.svg.append("path")
      .attr("id", id);
  }
  element
    .datum(data)
    .attr("class", "areaColore1")
    .attr("d", area)
    .attr("fill", color)
    .attr("opacity", opacity);

  if(x == 0 && xOffset == 0){
    element.attr("opacity", "0");
  }

  // // add the pattern
  // svg.append("path")
  //   .datum(data)
  //   .attr("class", "area")
  //   .attr("d", area)
  //   .style('stroke', '#777777')
  //   .attr("fill", "url(#whitecarbon2)");

  return element;
}

function removeElement(id, svg) {
  //svg.selectAll("#" + id).remove();
  svg.selectAll("#" + id).data([]).exit().remove();
}



function moveHorizontalLine(yPosition, svg, xRange) {

  // const dataLine = [];
  // for (let x = xRange[0]; x <= xRange[1]; x++) {
  //   dataLine.push([x, yPosition])
  // }
  // svg.datum(dataLine).enter();

  // svg
  //   .attr('x1', xScale(xRange[0])).attr('y1', yPosition)
  //   .attr('x2', xScale(xRange[1])).attr('y2', yPosition);
  svg
    .attr('x1', xRange[0]).attr('y1', yPosition)
    .attr('x2', xRange[1]).attr('y2', yPosition);
}

function moveVerticalLine(xPosition, svg, yRange) {

  // const dataLine = [];
  // for (let y = yRange[0]; y <= yRange[1]; y++) {
  //   dataLine.push([xPosition, y])
  // }
  // svg.datum(dataLine).enter();

  svg
    .attr('x1', xPosition).attr('y1', yRange[0])
    .attr('x2', xPosition).attr('y2', yRange[1]);

}