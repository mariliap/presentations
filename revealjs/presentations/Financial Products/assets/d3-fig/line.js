function functionGrahph(profitFunctions, funcParams, axisDef, canvasSize, areas, includeLegends) {

  
  width = canvasSize.width > 450? 450 : canvasSize.width ;
  height = canvasSize.height > 400? 400 :  canvasSize.height;

  const svg = d3.select("#graph")
    .append('svg')
    .attr("width", canvasSize.width + margin.left + margin.right)
    .attr("height", canvasSize.height + margin.top + margin.bottom)
    .attr("class", "graph-svg-component")
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    
  addGraphicDefinitions(svg)
  // Define chart area
  svg
    .append("clipPath")
    .attr("id", "chart-area")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    
    

  let xScale = d3.scaleLinear(axisDef.x.range, [0, width])
  let yScale = d3.scaleLinear(axisDef.y.range, [height, 0])

  let graph = {
    svg: svg,
    xScale: xScale,
    yScale: yScale
  };

  appendAxis(graph, canvasSize, axisDef)
  if(includeLegends){
    appendLegends(graph, profitFunctions, canvasSize)
  }

  addHorizontalLineAt('lineAtZero', graph, 0, 'white', axisDef.x.range)
  addVerticalLineAt('lineAtStrike', graph, funcParams.strikePrice, 'white', axisDef.y.range)
  

  const hMovableLine = 
     addHorizontalLineAt('hMovableLine', graph, axisDef.y.range[0], 'black', axisDef.x.range)
  const vMovableLine = 
    addVerticalLineAt('vMovableLine', graph, axisDef.x.range[0], 'black', axisDef.y.range)
  if(areas){
    for(var i=0; i< areas.length; i++){
      addArea(areas[i].id, graph, areas[i].x0, areas[i].x1, areas[i].color, areas[i].opacity, axisDef)
    }
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
    const data = generateData(profitFunctions[i].function, axisDef.x.range);

    svg.append("path")
      .attr("id", profitFunctions[i].id)
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
    .on('mousemove', (event) => mousemove(event, xScale, yScale, dataArr, focusCircleArr, focusTextArr, hMovableLine, vMovableLine, axisDef))
    .on('mouseout', () => mouseout(focusCircleArr, focusTextArr, hMovableLine, vMovableLine));

  return graph;
}

function appendAxis(graph, canvasSize, axisDef){
  let xAxis = d3.axisBottom(graph.xScale)
  let yAxis = d3.axisLeft(graph.yScale)

  // Axis x
  graph.svg.append("g")
    .attr("class", "axisWhite")
    .attr("transform", `translate(0,${canvasSize.height})`)
    .call(xAxis)

  // Axis y
  graph.svg.append("g")
    .attr("class", "axisWhite")
    .attr("transform", `translate(0,0)`)
    .call(yAxis)

  // Axis x label
  graph.svg.append("g")
    .attr('class', 'axisWhite')
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", canvasSize.width / 2 + 40)
    .attr("y", canvasSize.height + 35)
    //.style("fill", "white")
    .text(axisDef.x.label);

  // Axis y label
  graph.svg.append("g")
    .attr('class', 'axisWhite')
    .append("text")
    .attr("text-anchor", "end")
    .attr("y", -35)
    .attr("x", -(canvasSize.height-50) / 2)
    .attr("transform", "rotate(-90)")
    //.style("fill", "white")
    .html(axisDef.y.label);
}

function appendLegends(graph, functions, canvasSize){

  //var color = key => functions.find(f => f.id == key).color
  var color = func => func.color
  // d3.scaleOrdinal()
  //   .domain(keys)
  //   .range(d3.schemeSet2);

  
  lineHeight = 12
  //const getTargetWidth = (text) => Math.sqrt(measureWidth(text.trim()) * lineHeight);
  
  // Add one dot in the legend for each name.
  keys = functions.map(func => func.description)

  

  //graph.svg.selectAll("mydots")
  let legendSvg = d3.select("#legend")
  .append('svg')
    .attr("width", canvasSize.width + margin.left + margin.right)
    .attr("height", 170)
    .attr("class", "graph-svg-component")
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`) 

//  legendSvg.selectAll("mydots")
//   .data(keys)
//   .enter()
//   .append("circle")
//     .attr("cx", cx)
//     .attr("cy", function(d,i){ return yx + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
//     .attr("r", 7)
//     .style("fill", function(d){ return color(d)})

  // Add one dot in the legend for each name.
  //graph.svg.selectAll("mylabels")
  let cx = -10
  let yx = 0
  marginTop=5
  for(let i = 0; i < functions.length; i++){
    
    functions[i].description = getLines(functions[i].description, 200, 8)

    legendSvg.selectAll("mylabels")
    .data(functions[i].description)
    .enter()
    .append("text")
      .attr("x", cx + 20)
      .attr("y", function(d,i){ return yx + i*(lineHeight+marginTop)}) // yx is where the first dot appears. 25 is the distance between dots 
      //.attr("font-size", (200 * 0.007) + "em")
      .style("fill", functions[i].color)
      .text(function(d){ return d.text})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")

    legendSvg//.selectAll("mydots")
    //.data(functions)
    //.enter()
    .append("circle")
      .attr("cx", cx)
      .attr("cy", function(d,i){ return yx+lineHeight + (i*marginTop)}) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("r", 7)
      .style("fill", functions[i].color)

    yx = yx + functions[i].description.length * (lineHeight+(1.5*marginTop));
  }
  
}



function generateData(profitFunction, xRange) {

  const data = [];
  for (let x = xRange[0]; x <= xRange[1]; x++) {
    y = profitFunction(x);
    data.push([x, y])
  }
  return data;
}

function getCrossingPoint (x, func) {
  return {
    x: x,
    y: func.function(x),
    color: func.color
  }
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
  hMovableLine, vMovableLine, axisDef) {
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
  moveHorizontalLine(y0, hMovableLine, axisDef.x.range)
  moveVerticalLine(x0, vMovableLine, axisDef.y.range)
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

function addVerticalLineAt(id, graph, value, color, yRange, functions) {
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

  if(functions){
    // let xPoint = value;
    // let yPoints = crossingPoints.getY(xPoint);
    // let yPointsColors = crossingPoints.colors;

    graph.svg.selectAll(`g#${id}`).data([]).exit().remove()

    let points = [];
    functions.forEach(func => {
      points.push(getCrossingPoint(value, func));
    });  
    // const toFindDuplicates = arry => arry.filter((item, index) => arry.indexOf(item) !== index)
    yList = points.map(point => point.y );
    //const toFindDuplicates = arry => arry.filter((point, index) => yList.indexOf(point.y) !== index)
    const toFindDuplicates = arry => 
      arry
        .filter((point, index) => yList.indexOf(point.y) !== index)
        .map(point => point.y )

    
    let repeated = toFindDuplicates(points)
    let processed = [];
    // for(let i=0; i< yPoints.length;i++){
    for(let i=0; i< points.length;i++){
      
      //radius = repeated.includes(yPoints[i])? (!processed.includes(yPoints[i])? 5 : 3) : 4;
      //processed.push(yPoints[i])
      radius = repeated.includes(points[i].y)? (!processed.includes(points[i].y)? 5 : 3) : 4;
      processed.push(points[i].y)
      circle = graph.svg
        .append('g')
        .attr("id", id)
        .append('circle')
        // .style("fill", yPointsColors[i])
        .style("fill", points[i].color)
        .attr("stroke", "none")
        .attr('r', radius)
        .style("opacity", 1)
        // .attr("cx", graph.xScale(xPoint))
        // .attr("cy", graph.yScale(yPoints[i]))
        .attr("cx", graph.xScale(points[i].x))
        .attr("cy", graph.yScale(points[i].y))
    }
  }

  return element;
}

function addArea(id, graph, x, xOffset, color, opacity, axisDef){

  var area = d3.area()
    .x(d => graph.xScale(d[0]))// Position of both line breaks on the X axis
    .y0(d => graph.yScale(axisDef.y.range[0]))//.y0(canvasSize.height) /// Y position of bottom line breaks (400 = bottom of svg area)
    .y1(d => graph.yScale(d[1]));// Y position of top line breaks


  const data = []; 
  data.push([x, axisDef.y.range[1]]); 
  data.push([x+xOffset, axisDef.y.range[1]]); 

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
  if(svg){
    svg.selectAll("#" + id).data([]).exit().remove();
  } else {
    d3.selectAll("#" + id).data([]).exit().remove();
  }
}

function addExplanation(id, graph, description){
  console.log('description: ' + description)

  
  let fontsize = 22
  
  let textLines = getLines(description, canvasSize.width, fontsize)
  
  let marginTop=5
  let marginBottom = 10;
  let cx = 0
  let yx = marginTop
  lineHeight= fontsize; //measureHeight('a', fontsize)
  height = (textLines.length * (lineHeight + marginTop)) //+ marginBottom

  let explainSvg = d3.select("#explain").select("svg")
  if(explainSvg.empty()){
    explainSvg = d3.select("#explain")
    .append('svg')
    .attr("id", id)
    .attr("width", canvasSize.width + margin.left + margin.right)
    .attr("height", height)
    .attr("class", "graph-svg-component-explain")
    .append("g")    
    .attr("transform", `translate(${margin.left}, ${margin.top})`)    
    
  } else {
    explainSvg.attr("height", height)
    explainSvg = explainSvg.select("g")
    explainSvg.selectAll(`text`).data([]).exit().remove()
  }
  
  explainSvg.selectAll('textLines')
    .data(textLines)
    .enter()
    .append("text")
    .attr("x", cx)
    .attr("y", function(d,i){ return yx + i*(lineHeight+marginTop)}) // yx is where the first dot appears. 25 is the distance between dots 
    .attr("font-size", fontsize + "px")
    .text(d => d.text)
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
}

const measureHeight = (text, fontSize) => {

  const margin = 5;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = fontSize + 'px' + context.font.split('px')[1]
  const metrics = context.measureText(text);

  let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
  let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

  return actualHeight + margin
}
const measureWidth = (text, fontSize) => {

  const margin = 10;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  //context.font = '5px';//(100 * 0.007) + "em";//fontSize + 'px';
  context.font = fontSize + 'px' + context.font.split('px')[1]
  const metrics = context.measureText(text);

  return metrics.width + margin;
}
const getWords = (text) => {
  const words = text.split(/\s+/g); // To hyphenate: /\s+|(?<=-)/
  if (!words[words.length - 1]) words.pop();
  if (!words[0]) words.shift();
  return words;
}
const getLines = (text, targetWidth, fontSize) => {
  let words = getWords(text)
  let line;
  let lineWidth0 = Infinity;
  //let targetWidth = 200; //getTargetWidth(text)
  const lines = [];
  for (let i = 0, n = words.length; i < n; ++i) {
    let lineText1 = (line ? line.text + " " : "") + words[i];
    let lineWidth1 = measureWidth(lineText1, fontSize);
    if ((lineWidth0 + lineWidth1) / 2 < targetWidth) {
      line.width = lineWidth0 = lineWidth1;
      line.text = lineText1;
    } else {
      lineWidth0 = measureWidth(words[i], fontSize);
      line = {width: lineWidth0, text: words[i]};
      lines.push(line);
    }
  }
  return lines;
}

function addGraphicDefinitions(svg){
   //Container for the gradients
   var defs = svg.append("defs");

   //Add fFilter for the outside glow
   var filter = defs.append("filter")
       .attr("id","glow");
   filter.append("feGaussianBlur")
       .attr("stdDeviation","3.5")
       .attr("result","coloredBlur");
   var feMerge = filter.append("feMerge");
   feMerge.append("feMergeNode")
       .attr("in","coloredBlur");
   feMerge.append("feMergeNode")
       .attr("in","SourceGraphic");
 
}

function addHighlightToLine(graph, func){
 
  graph.svg.select("#" + func.id)
  .attr("stroke-width", 4)
  .style("filter", "url(#glow)")
}
function removeHighlightOfLine(graph, func){
  graph.svg.select("#" + func.id)
  .attr("stroke-width", 2)
  .style("filter", null)
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