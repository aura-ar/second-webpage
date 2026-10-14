/*
 * Builds the ONE continuous-guide dot matrix for every .environmental-chart.
 * A chart's data-reference attribute controls ONLY the four dotted lines.
 * The underlying 20 values, scales, dot positions and colours stay identical.
 *
 * Example: <div class="environmental-chart" data-reference="prawn"></div>
 */
(function () {
  "use strict";

  const ORDER = ["prawn", "egg", "blt", "cheese", "chicken"];
  const SANDWICH_COLORS = {
    prawn: "#2f8a9c",    // Teal
    egg: "#469573",      // Purple 
    blt: "#cc776d",      // Coral
    cheese: "#d19c43",   // Gold  
    chicken: "#a17bc0"   // Green 
};
  // const METRICS = [
  //   { key: "water", title: "Water usage", unit: "L", color: "#428bc6" },
  //   { key: "carbon", title: "Carbon emissions", unit: "kg CO₂e", color: "#9175b9" },
  //   { key: "eutrophication", title: "Eutrophication", unit: "g PO₄-eq", color: "#cb953a" },
  //   { key: "land", title: "Land usage", unit: "m²", color: "#3d9d80" }
  // ];
    const METRICS = [
    { key: "water", title: "Water usage", unit: "L"},
    { key: "carbon", title: "Carbon emissions", unit: "kg CO₂e"},
    { key: "eutrophication", title: "Eutrophication", unit: "g PO₄-eq"},
    { key: "land", title: "Land usage", unit: "m²"}
  ];

  function el(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function formatNumber(value) {
    return Number(value).toLocaleString("en-GB", { maximumFractionDigits: 3 });
  }

  function renderChart(container) {
    const data = window.sandwichEnvironmentalData;
    const referenceId = container.dataset.reference || "prawn";
    container.replaceChildren();

    if (!data || !ORDER.every(id => data[id]) || !data[referenceId]) {
      container.appendChild(el("p", "environmental-chart__error", "Missing data or unknown reference sandwich: " + referenceId));
      return;
    }

    const heading = el("div", "environmental-chart__heading");
    const headingText = el("div");
    headingText.appendChild(el("h2", "", "Environmental Impact Comparison"));
    // headingText.appendChild(el("p", "", "Values per sandwich. Coloured dotted lines mark the " + data[referenceId].name + " reference levels."));
    heading.appendChild(headingText);
    const legend = el("div", "environmental-chart__legend");
    // legend.appendChild(el("span", "environmental-chart__legend-line"));
    // legend.appendChild(el("span", "", "Reference value"));
    heading.appendChild(legend);
    container.appendChild(heading);

    const scroller = el("div", "environmental-chart__scroller");
    const matrix = el("div", "environmental-chart__matrix");
    const names = el("div", "environmental-chart__names");
    const nameHeader = el("div", "environmental-chart__colheader environmental-chart__colheader--empty", "Sandwich");
    names.appendChild(nameHeader);
    const nameRows = el("div", "environmental-chart__rows");
    ORDER.forEach(id => nameRows.appendChild(el("div", "environmental-chart__rowname", data[id].name)));
    names.appendChild(nameRows);
    matrix.appendChild(names);

    METRICS.forEach(metric => {
      const allValues = ORDER.map(id => Number(data[id][metric.key]));
      if (allValues.some(v => !Number.isFinite(v) || v < 0)) {
        throw new Error("Invalid value for " + metric.key + ": values must be nonnegative numbers.");
      }
      // A little headroom prevents the largest dot sitting on the track's very end.
      // Scale is based on the full dataset, NOT the current reference selection.
      const max = Math.max(1e-9, ...allValues) * 1.1;
      const referencePct = Number(data[referenceId][metric.key]) / max * 100;

      const column = el("section", "environmental-chart__measure");
      // column.style.setProperty("--measure-color", metric.color);
      const header = el("div", "environmental-chart__colheader");
      header.appendChild(el("strong", "", metric.title));
      header.appendChild(el("small", "", metric.unit));
      column.appendChild(header);

      const rows = el("div", "environmental-chart__rows");
      ORDER.forEach((id, i) => {
        const row = el("div", "environmental-chart__measure-row");
        const track = el("div", "environmental-chart__track");
        const dot = el("span", "environmental-chart__dot");
        dot.style.setProperty("--sandwich-color", SANDWICH_COLORS[id]); // Delete this line to go back to the old metric colour system thing.
        dot.style.left = (allValues[i] / max * 100).toFixed(4) + "%";
        dot.title = data[id].name + ": " + formatNumber(allValues[i]) + " " + metric.unit;
        track.appendChild(dot);
        row.appendChild(track);
        row.appendChild(el("span", "environmental-chart__number", formatNumber(allValues[i])));
        rows.appendChild(row);
      });
      const guideArea = el("div", "environmental-chart__guide-area");
      const guide = el("div", "environmental-chart__guide");
      guide.style.setProperty("--reference-percentage", referencePct.toFixed(4) + "%");
      guide.title = data[referenceId].name + " reference: " + formatNumber(data[referenceId][metric.key]) + " " + metric.unit;
      guideArea.appendChild(guide);
      rows.appendChild(guideArea);
      column.appendChild(rows);

      const scale = el("div", "environmental-chart__scale");
      scale.appendChild(el("span", "", "0"));
      scale.appendChild(el("span", "", formatNumber(max)));
      column.appendChild(scale);
      matrix.appendChild(column);
    });
    scroller.appendChild(matrix);
    container.appendChild(scroller);
    // container.appendChild(el("p", "environmental-chart__footnote", "Illustrative values only. Each environmental measure has its own scale and retains its original unit. On small screens, scroll the graph horizontally."));
  }

  // Renders all five conditions (even if four of them are currently hidden).
  // Hidden experiment sections remain hidden until your existing condition code reveals them.
  function renderEnvironmentalCharts() {
    document.querySelectorAll(".environmental-chart").forEach(renderChart);
  }

  // Optional: change the reference on a rendered chart without reloading:
  // chart.dataset.reference = "egg";
  // window.renderEnvironmentalCharts();
  window.renderEnvironmentalCharts = renderEnvironmentalCharts;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderEnvironmentalCharts, { once: true });
  } else {
    renderEnvironmentalCharts();
  }
})();
