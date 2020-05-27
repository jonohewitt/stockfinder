const svg = d3.select("svg");
svg.attr("viewBox", "0 0 960 400");

// const url = "1y.json";
const url = "https://api.superhi.com/api/stocks/aapl";

d3.json(url).then(data => {
  data = data.map(d => {
    const dateParse = d3.timeParse("%Y-%m-%d");
    return { close: d.close, date: dateParse(d.date) };
  });
  const minDate = d3.min(data, d => d.date);
  const maxDate = d3.max(data, d => d.date);
  const minClose = d3.min(data, d => d.close);
  const maxClose = d3.max(data, d => d.close);

  const dateScale = d3
    .scaleTime()
    .domain([minDate, maxDate])
    .range([60, 900]);

  const closeScale = d3
    .scaleLinear()
    .domain([minClose, maxClose])
    .range([280, 70]);

  const flatLine = d3
    .line()
    .x(d => dateScale(d.date))
    .y(d => closeScale(minClose));

  const line = d3
    .line()
    .x(d => dateScale(d.date))
    .y(d => closeScale(d.close));

  const flatArea = d3
    .area()
    .x0(d => dateScale(d.date))
    .y0(d => closeScale(minClose))
    .y1(d => closeScale(minClose));

  const area = d3
    .area()
    .x0(d => dateScale(d.date))
    .y0(d => closeScale(minClose) + 15)
    .y1(d => closeScale(d.close));

  const defs =
    '<defs><linearGradient id="gradient" x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0" stop-color="rgba(169,195,227,1)" /><stop offset="0.4" stop-color="rgba(169,195,227,0.5)" /><stop offset="1" stop-color="rgba(169,195,227,0)" /></linearGradient></defs>';

  svg.html(defs);

  svg
    .append("path")
    .datum(data)
    .attr("class", "area")
    .attr("d", flatArea)
    .transition()
    .duration(1000)
    .attr("d", area);

  svg
    .append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", flatLine)
    .transition()
    .duration(1000)
    .attr("d", line);

  const hoverTextGroup = svg
    .append("g")
    .attr("transform", "translate(-999,-999)")
    .style("pointer-events", "none");

  const hoverCircle = svg
    .append("g")
    .attr("transform", "translate(-999,-999)")
    .style("pointer-events", "none");

  hoverTextGroup
    .append("rect")
    .attr("x", -50)
    .attr("y", -70)
    .attr("width", 100)
    .attr("height", 50)
    .attr("rx", 5);

  hoverCircle
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 7);

  const closeText = hoverTextGroup
    .append("text")
    .attr("class", "close")
    .attr("x", 0)
    .attr("y", -47)
    .text("");

  const dateText = hoverTextGroup
    .append("text")
    .attr("class", "date")
    .attr("x", 0)
    .attr("y", -28)
    .text("");

  const toEasing = (final, initial, easing) => {
    if (!initial) {
      initial = 0;
    }
    const difference = final - initial;
    if (Math.round(difference) == 0) {
      clearInterval(loop);
    }
    return (initial += difference * easing);
  };

const getDataPoint = (mouseX) => {
  const mouseDate = dateScale.invert(mouseX);
  const bisector = d3.bisector(d => d.date).right;
  const i = bisector(data, mouseDate);
  return data[i];
}

  let x;
  let y;

  const updateInfo = mouseX => {
    const dataPoint = getDataPoint(mouseX);

    if (dataPoint) {
      const finalX = dateScale(dataPoint.date);
      const finalY = closeScale(dataPoint.close);
      const timeFormat = d3.timeFormat("%d %b %Y");
      dateText.text(timeFormat(dataPoint.date));
      closeText.text(`${d3.format("($.2f")(dataPoint.close)}`);

      x = toEasing(finalX, x, 0.02);
      y = toEasing(finalY, y, 0.02);
      const circleX = toEasing(finalX, x, 0.9);
      const circleY = toEasing(finalY, y, 0.9);

      hoverTextGroup.attr("transform", `translate(${x}, ${y})`);
      hoverCircle.attr("transform", `translate(${circleX}, ${circleY})`);
    }
  };

  let loop;

  const startLoop = mouseX => {
    updateInfo(mouseX);
    clearInterval(loop);

    loop = setInterval(() => {
      updateInfo(mouseX);
    }, 0);
  };

  svg.on("mouseenter", function() {
    x = d3.mouse(this)[0];
    y = 0;
  });

  svg.on("mousemove", function() {
    startLoop(d3.mouse(this)[0]);
  });

  svg.on("mouseout", () => {
    hoverTextGroup.attr("transform", "translate(-999,-999)");
    hoverCircle.attr("transform", "translate(-999,-999)");
    clearInterval(loop);
  });
});
