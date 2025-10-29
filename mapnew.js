import Map from "https://js.arcgis.com/4.33/@arcgis/core/Map.js";
import MapView from "https://js.arcgis.com/4.33/@arcgis/core/views/MapView.js";
import FeatureLayer from "https://js.arcgis.com/4.33/@arcgis/core/layers/FeatureLayer.js";
import Legend from "https://js.arcgis.com/4.33/@arcgis/core/widgets/Legend.js";
import Graphic from "https://js.arcgis.com/4.33/@arcgis/core/Graphic.js";

window.addEventListener("DOMContentLoaded", () => {
  // ---------- BASE STATE GEOMETRIES ----------
  const statesLayer = new FeatureLayer({
    url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_States_Generalized_Boundaries/FeatureServer/0",
    title: "US States",
    popupTemplate: {
      title: "{STATE_NAME}",
      content: "Population: {POPULATION}"
    },
    opacity: 0.9
  });

  const map = new Map({
    basemap: "gray-vector",
    layers: []
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-100.3487846, 39.58907],
    zoom: 3
  });

  const legend = new Legend({
    view: view
  });
  view.ui.add(legend, "bottom-left");

  // ---------- BOOTSTRAP TABLE INIT ----------
  var $table = $('#table');
  if ($table && $table.length) $table.bootstrapTable();

  let statesLoaded = false;
  let incomeLoaded = false;
  let medianAgeLoaded = false;
  let povertyLoaded = false;

  const submitBtn = document.querySelector('form button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  // Failsafe unlock after 10s
  setTimeout(() => {
    if (submitBtn && submitBtn.disabled) {
      submitBtn.disabled = false;
      console.warn('Submit enabled after timeout — some data may be missing.');
    }
  }, 10000);

  // ---------- LOAD STATES GEOMETRY INTO stateObj ----------
  var loadStates = function () {
    // populate table initially with just state names
    Object.entries(stateObj).sort().forEach(([key], index) => {
      $table.bootstrapTable('insertRow', {
        index: index,
        row: { state: key.replace("_", " ") }
      });
    });

    let query = statesLayer.createQuery();
    query.returnGeometry = true;
    query.outFields = ["STATE_ABBR", "STATE_NAME"];

    statesLayer.queryFeatures(query)
      .then((response) => {
        response.features.forEach((feature) => {
          var abbr = feature.attributes.STATE_ABBR;
          if (abbr && abbr !== "DC") {
            var matchKey = Object.keys(stateObj).find(k =>
              stateObj[k] &&
              stateObj[k].abb &&
              stateObj[k].abb.toUpperCase() === abbr.toUpperCase()
            );
            if (matchKey) {
              stateObj[matchKey]['geometry'] = feature.geometry;
            }
          }
        });
        statesLoaded = true;
        if (statesLoaded && incomeLoaded && medianAgeLoaded && povertyLoaded && submitBtn) submitBtn.disabled = false;
      }).catch((err) => {
        console.error('loadStates failed:', err);
        statesLoaded = true;
        if (incomeLoaded && medianAgeLoaded && povertyLoaded && submitBtn) submitBtn.disabled = false;
      });
  };
  loadStates();

  // ---------- LOAD MEDIAN INCOME ----------
  var medianIncomeUrl = "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/ACS_Median_Income_by_Race_and_Age_Selp_Emp_Boundaries/FeatureServer/0";
  const medianIncomeLayer = new FeatureLayer({
    url: medianIncomeUrl,
    title: "Median Income"
  });

  var loadIncomeData = function () {
    let q = medianIncomeLayer.createQuery();
    q.returnGeometry = false;
    q.outFields = "*";

    medianIncomeLayer.queryFeatures(q).then((r) => {
      r.features.forEach((feature) => {
        var abbr = feature.attributes && feature.attributes['STUSPS'];
        if (!abbr || abbr === "DC") return;

        var matchKey = Object.keys(stateObj).find(k =>
          stateObj[k] &&
          stateObj[k].abb &&
          stateObj[k].abb.toUpperCase() === abbr.toUpperCase()
        );
        if (!matchKey) return;

        var incomeVal = feature.attributes['B19049_001E'] ||
                        feature.attributes['MEDIAN_INCOME'] ||
                        null;

        stateObj[matchKey]['medianIncome'] = incomeVal;
      });

      incomeLoaded = true;
      if (statesLoaded && incomeLoaded && medianAgeLoaded && povertyLoaded && submitBtn) submitBtn.disabled = false;
    }).catch((err) => {
      console.error('loadIncomeData failed:', err);
      incomeLoaded = true;
      if (statesLoaded && medianAgeLoaded && povertyLoaded && submitBtn) submitBtn.disabled = false;
    });
  };
  loadIncomeData();

  // ---------- LOAD MEDIAN AGE ----------
  // Using a different service that has median age data
  var medianAgeUrl = "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_Median_Age_Boundaries/FeatureServer/0";
  const medianAgeLayer = new FeatureLayer({
    url: medianAgeUrl,
    title: "Median Age"
  });

  var loadMedianAgeData = function () {
    let q = medianAgeLayer.createQuery();
    q.returnGeometry = false;
    q.outFields = "*";

    medianAgeLayer.queryFeatures(q).then((r) => {
      r.features.forEach((feature) => {
        var abbr = feature.attributes && feature.attributes['STUSPS'];
        if (!abbr || abbr === "DC") return;

        var matchKey = Object.keys(stateObj).find(k =>
          stateObj[k] &&
          stateObj[k].abb &&
          stateObj[k].abb.toUpperCase() === abbr.toUpperCase()
        );
        if (!matchKey) return;

        // Use the correct median age field
        var ageVal = feature.attributes['B01002_001E'] || null;

        stateObj[matchKey]['medianAge'] = ageVal;
      });

      medianAgeLoaded = true;
      if (statesLoaded && incomeLoaded && medianAgeLoaded && povertyLoaded && submitBtn) submitBtn.disabled = false;
    }).catch((err) => {
      console.error('loadMedianAgeData failed:', err);
      medianAgeLoaded = true;
      if (statesLoaded && incomeLoaded && povertyLoaded && submitBtn) submitBtn.disabled = false;
    });
  };
  loadMedianAgeData();

  // ---------- LOAD POVERTY DATA ----------
  var povertyUrl = "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_Poverty_by_Age_Boundaries/FeatureServer/0";
  const povertyLayer = new FeatureLayer({
    url: povertyUrl,
    title: "Poverty Rate"
  });

  var loadPovertyData = function () {
    let q = povertyLayer.createQuery();
    q.returnGeometry = false;
    q.outFields = "*";

    povertyLayer.queryFeatures(q).then((r) => {
      r.features.forEach((feature) => {
        var abbr = feature.attributes && feature.attributes['STUSPS'];
        if (!abbr || abbr === "DC") return;

        var matchKey = Object.keys(stateObj).find(k =>
          stateObj[k] &&
          stateObj[k].abb &&
          stateObj[k].abb.toUpperCase() === abbr.toUpperCase()
        );
        if (!matchKey) return;

        // Use the pre-calculated poverty percentage field
        var povertyRate = feature.attributes['B17020_calc_pctPovE'] || null;

        stateObj[matchKey]['povertyRate'] = povertyRate;
      });

      povertyLoaded = true;
      if (statesLoaded && incomeLoaded && medianAgeLoaded && povertyLoaded && submitBtn) submitBtn.disabled = false;
    }).catch((err) => {
      console.error('loadPovertyData failed:', err);
      povertyLoaded = true;
      if (statesLoaded && incomeLoaded && medianAgeLoaded && submitBtn) submitBtn.disabled = false;
    });
  };
  loadPovertyData();

  // ---------- TAX RATE HELPERS ----------
  const between = (x, min, max) => x >= min && x <= max;
  const getRate = (arr, inc) => {
    if (!arr || !Array.isArray(arr.range) || !Array.isArray(arr.rate)) return [0, 0];
    for (var i = 0; i < arr.range.length; i++) {
      if (between(inc, arr.range[i][0], arr.range[i][1])) {
        return [arr.rate[i], arr.range[i][0]];
      }
    }
    return [
      arr.rate[arr.rate.length - 1] || 0,
      arr.range[arr.range.length - 1]?.[0] || 0
    ];
  };

  // ---------- RENDERER FUNCTION ----------
  const getRenderer = (mode) => {
    if (mode === "income") {
      return {
        type: "class-breaks",
        field: "Median_Income",
        legendOptions: { title: "Median Household Income ($)" },
        classBreakInfos: [
          { minValue: 0, maxValue: 40000,
            symbol: { type: "simple-fill", color: "#fee5d9" },
            label: "< $40K" },
          { minValue: 40001, maxValue: 60000,
            symbol: { type: "simple-fill", color: "#fcae91" },
            label: "$40K–$60K" },
          { minValue: 60001, maxValue: 80000,
            symbol: { type: "simple-fill", color: "#fb6a4a" },
            label: "$60K–$80K" },
          { minValue: 80001, maxValue: 120000,
            symbol: { type: "simple-fill", color: "#cb181d" },
            label: "> $80K" }
        ]
      };
    }

    if (mode === "age") {
      return {
        type: "class-breaks",
        field: "Median_Age",
        legendOptions: { title: "Median Age (years)" },
        classBreakInfos: [
          { minValue: 0, maxValue: 32,
            symbol: { type: "simple-fill", color: "#edf8fb" },
            label: "<32" },
          { minValue: 32, maxValue: 38,
            symbol: { type: "simple-fill", color: "#b2e2e2" },
            label: "32–38" },
          { minValue: 38, maxValue: 44,
            symbol: { type: "simple-fill", color: "#66c2a4" },
            label: "38–44" },
          { minValue: 44, maxValue: 120,
            symbol: { type: "simple-fill", color: "#238b45" },
            label: ">44" }
        ]
      };
    }

    if (mode === "poverty") {
      return {
        type: "class-breaks",
        field: "Poverty_Rate",
        legendOptions: { title: "Poverty Rate (%)" },
        classBreakInfos: [
          { minValue: 0, maxValue: 10,
            symbol: { type: "simple-fill", color: "#ffffcc" },
            label: "< 10%" },
          { minValue: 10, maxValue: 12,
            symbol: { type: "simple-fill", color: "#c7e9b4" },
            label: "10–12%" },
          { minValue: 12, maxValue: 15,
            symbol: { type: "simple-fill", color: "#7fcdbb" },
            label: "12–15%" },
          { minValue: 15, maxValue: 100,
            symbol: { type: "simple-fill", color: "#1d91c0" },
            label: "> 15%" }
        ]
      };
    }

    // Default: tax percentage choropleth
    return {
      type: "class-breaks",
      field: "PercentOwed",
      legendOptions: { title: "Total Actual State Tax Owed" },
      classBreakInfos: [
        { minValue: 0, maxValue: 0,
          symbol: { type: "simple-fill", color: "#0c7d3f" },
          label: "No tax" },
        { minValue: 0.01, maxValue: 3,
          symbol: { type: "simple-fill", color: "#99bf47" },
          label: "0–3%" },
        { minValue: 3, maxValue: 5,
          symbol: { type: "simple-fill", color: "#d6a206" },
          label: "3–5%" },
        { minValue: 5.01, maxValue: 100,
          symbol: { type: "simple-fill", color: "#c42f02" },
          label: ">5%" }
      ]
    };
  };

  // ---------- FORM HANDLER ----------
  const formElement = document.querySelector('form');

  formElement.addEventListener("submit", (e) => {
    e.preventDefault();

    // clear table
    $table.bootstrapTable('removeAll');

    // inputs
    var incomeInput = formElement
      .querySelector('input[name="income"]')
      .value.replaceAll(",", "");
    var incomeVal = Number(incomeInput) || 0;

    var married = formElement
      .querySelector('input[name="marriedRadios"]:checked')
      .value === 'married';

    var dependents = Number($('#dependents').val()) || 0;

    const toggleEl = document.getElementById("mapToggle");
    // allowed values: "tax", "income", "age", "poverty"
    const mode = toggleEl ? toggleEl.value : "tax";

    var graphics = [];

    Object.entries(stateObj).forEach(([key, value], index) => {
      try {
        if (value.notax === true) {
          // no state income tax
          $table.bootstrapTable('insertRow', {
            index: index,
            row: {
              state: key,
              incomeAfterTaxes: incomeVal.toLocaleString(),
              grossDifference: 0,
              percentDifference: 0,
              medianIncome: value.medianIncome || 'N/A',
              medianAge: value.medianAge ? value.medianAge.toFixed(1) : 'N/A',
              povertyRate: value.povertyRate ? value.povertyRate.toFixed(1) : 'N/A'
            }
          });

          if (value.geometry) {
            graphics.push(new Graphic({
              geometry: value.geometry,
              attributes: {
                ObjectId: index,
                State_Abbr: value.abb,
                PercentOwed: 0,
                Median_Income: value.medianIncome || 0,
                Median_Age: value.medianAge || 0,
                Poverty_Rate: value.povertyRate || 0
              }
            }));
          }
        } else {
          // compute effective tax
          let rateArr = married
            ? getRate(value.married_brackets, incomeVal)
            : getRate(value.single_brackets, incomeVal);

          let rate = rateArr[0];
          let taxBeforeCredits = incomeVal * rate;

          let totalTax = Math.trunc(taxBeforeCredits);

          let percent = (incomeVal > 0)
            ? ((totalTax / incomeVal) * 100)
            : 0;

          $table.bootstrapTable('insertRow', {
            index: index,
            row: {
              state: key,
              bracket: (rate * 100).toFixed(2),
              incomeAfterTaxes: (incomeVal - totalTax).toLocaleString(),
              grossDifference: totalTax.toLocaleString(),
              percentDifference: percent.toFixed(2),
              medianIncome: value.medianIncome || 'N/A',
              medianAge: value.medianAge ? value.medianAge.toFixed(1) : 'N/A',
              povertyRate: value.povertyRate ? value.povertyRate.toFixed(1) : 'N/A'
            }
          });

          if (value.geometry) {
            graphics.push(new Graphic({
              geometry: value.geometry,
              attributes: {
                ObjectId: index,
                State_Abbr: value.abb,
                PercentOwed: percent,
                Median_Income: value.medianIncome || 0,
                Median_Age: value.medianAge || 0,
                Poverty_Rate: value.povertyRate || 0
              }
            }));
          }
        }
      } catch (err) {
        console.error('Error processing state', key, err);
      }
    });

    // remove previous dynamic layer(s)
    try {
      map.layers.forEach((lyr) => {
        if (lyr && (lyr.title === 'US States' || lyr.title === 'State Layer')) {
          map.layers.remove(lyr);
        }
      });
    } catch (err) {
      console.warn('Error removing previous layer:', err);
    }

    // add new dynamic layer from graphics
    const layer = new FeatureLayer({
      source: graphics,
      objectIdField: "ObjectId",
      title: "State Layer",
      fields: [
        { name: "ObjectId", type: "oid" },
        { name: "State_Abbr", type: "string" },
        { name: "PercentOwed", type: "double" },
        { name: "Median_Income", type: "double" },
        { name: "Median_Age", type: "double" },
        { name: "Poverty_Rate", type: "double" }
      ],
      popupTemplate: {
        content: `
          <b>State:</b> {State_Abbr}<br>
          <b>Tax %:</b> {PercentOwed}<br>
          <b>Median Income:</b> $ {Median_Income}<br>
          <b>Median Age:</b> {Median_Age} years<br>
          <b>Poverty Rate:</b> {Poverty_Rate}%`
      },
      renderer: getRenderer(mode)
    });

    map.add(layer);
  });

  // ---------- MAP TOGGLE (RE-RENDER) ----------
  const mapToggle = document.getElementById("mapToggle");
  if (mapToggle) {
    mapToggle.addEventListener("change", () => {
      // Only regenerate if form has been submitted at least once
      if (formElement.querySelector('input[name="income"]').value) {
        const event = new Event("submit");
        formElement.dispatchEvent(event);
      }
    });
  }
});