// function (ctx) {
//   let index = ctx.dataIndex;
  
//   let logRMS = RMS_ARRAY[index];
//   if (logRMS < 0) logRMS = 0;
  
//   // console.info("borderWidth: ", logRMS);
//   return logRMS * 8; // max 6 pixels wide
// }
const DATA = {
  "labels": [],
  "yLabels": [],
  "datasets": [{
    "data": [],
    "fill": false,
    "type": "line",
    "pointRadius": 0,
    "borderWidth": 5,
    "fontColor": "#555",
    "yAxisID": "main-y-axis",
    "backgroundColor": "",
    "label": "",
    "borderColor": function(ctx) {
      return setColorGradient(ctx);
    },
    "pointBorderColor": "transparent"
  }, {
    "data": [],
    "fill": false,
    "type": "line",
    "pointRadius": 0,
    "borderWidth": 1,
    "label": "background-fill-bottom",
    "yAxisID": "background-area-y-axis",
    "borderColor": "rgba(224, 224, 224, 0.5)",
    "backgroundColor": "rgba(224, 224, 224, 0.5)",
    "pointBorderColor": "transparent"
  }, {
    "data": [],
    "fill": "-1",
    "type": "line",
    "pointRadius": 0,
    "borderWidth": 1,
    "label": "background-fill-top",
    "yAxisID": "background-area-y-axis",
    "borderColor": "rgba(224, 224, 224, 0.5)",
    "backgroundColor": "rgba(224, 224, 224, 0.5)",
    "pointBorderColor": "transparent"
  }]
};

const OPTIONS = {
  "responsive": true,
  "animation": false,
  "title": {
    "display": false
  },
  "maintainAspectRatio": true,
  "legend": {
    "labels": {
      "fontSize": 11,
      "boxWidth": 22,
      "fontColor": "#a1a1a1",
      "filter": function (item, chart) {
        return item.text.includes("Pitch");
      }
    }
  },
  "layout": {
    "padding": {
      "top": 0,
      "left": 10,
      "right": 10,
      "bottom": 0
    }
  },
  "scales": {
    "xAxes": [{
      "barPercentage": 1.00,
      "categoryPercentage": 1.00,
      "gridLines": {
        "display": false
      },
      "ticks": {
        "fontSize": 11,
        "fontColor": "#a1a1a1",
        "maxRotation": 15,
        "autoSkip": true,
        "autoSkipPadding": 10
      },
      "scaleLabel": {
        "display": true,
        "fontSize": 11,
        "fontColor": "#a1a1a1",
        "labelString": "Time (seconds)"
      }
    }],
    "yAxes": [{
        "id": "main-y-axis",
        "type": "linear",
        "position": "left",
        "stacked": true,
        "gridLines": {
          "display": false
        },
        "ticks": {
          "fontSize": 11,
          "fontColor": "#a1a1a1",
          "stepSize": 12,
          "min": 21,
          "max": 108,
          "callback": function(value) {
            return Math.round(value);
          }
        },
        "scaleLabel": {
          "display": true,
          "fontSize": 11,
          "fontColor": "#a1a1a1",
          "labelString": "MIDI pitch"
        }
      },
      {
        "id": "pitchclass-y-axis",
        "position": "right",
        "type": "category",
        "afterFit": function() {
          this.width = Math.max(this.width, 84);
        },
        "stacked": false,
        "gridLines": {
          "display": false
        },
        "ticks": {
          "fontSize": 11,
          "fontColor": "#a1a1a1",
          "autoSkip": false,
          "callback": function() {
            return "";
          }
        },
        "scaleLabel": {
          "display": true,
          "fontSize": 11,
          "fontColor": "#a1a1a1",
        }
      },
      /* auxiliary axes */
      {
        "id": "background-area-y-axis",
        "position": "left",
        "type": "linear",
        "stacked": true,
        "gridLines": {
          "display": false
        },
        "ticks": {
          "fontSize": 11,
          "fontColor": "#a1a1a1",
          "min": 21,
          "max": 108
        },
        "display": false
      }
    ]
  }
};



const LOWEST_MIDI_PITCH = 21;
const HIGHEST_MIDI_PITCH = 108;
const AXES_PITCHES = Array.from(
  { length: HIGHEST_MIDI_PITCH - LOWEST_MIDI_PITCH + 1 },
  (_, index) => LOWEST_MIDI_PITCH + index
);
const PITCH_CLASS_COLORS = {
  'C': 'hsl(210, 25%, 50%)', 
  'C#': 'hsl(240, 25%, 50%)', 
  'D': 'hsl(270, 25%, 50%)', 
  'D#': 'hsl(300, 25%, 50%)', 
  'E': 'hsl(330, 25%, 50%)', 
  'F': 'hsl(0, 25%, 50%)', 
  'F#': 'hsl(30, 25%, 50%)', 
  'G': 'hsl(60, 25%, 50%)', 
  'G#': 'hsl(90, 25%, 50%)', 
  'A': 'hsl(120, 25%, 50%)', 
  'A#': 'hsl(150, 25%, 50%)', 
  'B': 'hsl(180, 25%, 50%)'
};

const CONFIDENCE_ARRAY = Array(30).fill(0);
const RMS_ARRAY = Array(30).fill(0);
let rms_pointer = RMS_ARRAY;

function midiPitchClass(pitch) {
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return keys[pitch % 12];
}

function midiNoteLabel(pitch) {
  return `${midiPitchClass(pitch)}${Math.floor(pitch / 12) - 1}`;
}


// fill in data, labels, and setup axes

for (var i = 0; i < 30; i++) DATA.datasets[0].data.push(100);
for (var i = 0; i < 30; i++) DATA.datasets[1].data.push(AXES_PITCHES[0]);
for (var i = 0; i < 30; i++) DATA.datasets[2].data.push(AXES_PITCHES.slice(-1)[0]);

for (var p of AXES_PITCHES) {
    DATA.yLabels.push(midiPitchClass(p));
}
DATA.yLabels.reverse();

OPTIONS.scales.yAxes[0].ticks.min = LOWEST_MIDI_PITCH;
OPTIONS.scales.yAxes[0].ticks.max = HIGHEST_MIDI_PITCH;
OPTIONS.scales.yAxes[2].ticks.min = LOWEST_MIDI_PITCH;
OPTIONS.scales.yAxes[2].ticks.max = HIGHEST_MIDI_PITCH;


Chart.pluginService.register({
  beforeDatasetsDraw: function(chart) {
    const pitchScale = chart.scales['main-y-axis'];
    if (!pitchScale) return;

    const chartArea = chart.chartArea;
    const ctx = chart.ctx;
    const notePositions = AXES_PITCHES.map(frequency => ({
      y: pitchScale.getPixelForValue(frequency),
      natural: /^[A-G]$/.test(midiPitchClass(frequency))
    })).sort((a, b) => a.y - b.y);

    ctx.save();
    notePositions.forEach((note, index) => {
      const previous = notePositions[index - 1];
      const next = notePositions[index + 1];
      const top = Math.max(
        chartArea.top,
        previous ? (previous.y + note.y) / 2 : note.y - (next.y - note.y) / 2
      );
      const bottom = Math.min(
        chartArea.bottom,
        next ? (note.y + next.y) / 2 : note.y + (note.y - previous.y) / 2
      );
      if (bottom <= chartArea.top || top >= chartArea.bottom) return;

      ctx.fillStyle = note.natural ? '#eee' : '#ccc';
      ctx.fillRect(chartArea.left, top, chartArea.right - chartArea.left, bottom - top);
    });
    ctx.restore();
  },
  afterDraw: function(chart) {
    const labelScale = chart.scales['pitchclass-y-axis'];
    const pitchScale = chart.scales['main-y-axis'];
    if (!labelScale || !pitchScale) return;

    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    const fontSize = 7;
    const naturalNotes = AXES_PITCHES
      .map(frequency => ({
        label: midiNoteLabel(frequency),
        y: pitchScale.getPixelForValue(frequency)
      }))
      .filter(tick =>
        /^[A-G]\d+$/.test(tick.label) &&
        tick.y >= chartArea.top &&
        tick.y <= chartArea.bottom
      )
      .sort((a, b) => a.y - b.y);

    ctx.save();
    ctx.font = Chart.helpers.fontString(
      fontSize,
      labelScale.options.ticks.fontStyle || 'normal',
      labelScale.options.ticks.fontFamily || Chart.defaults.global.defaultFontFamily
    );
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    naturalNotes.forEach(tick => {
      ctx.fillText(tick.label, labelScale.right - 40, tick.y);
    });

    ctx.restore();
  }
});


function setColorGradient(ctx) {
  // "#ff5144": hue = 4
  const chartArea = ctx.chart.chartArea;
  if (!chartArea) return null;

  const canvasCtx = ctx.chart.ctx;
  let gradient = canvasCtx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
  const transparency = rms_pointer;

  const dataSize = ctx.dataset.data.length;
  const stops = Array.from(Array(dataSize).keys()).map(i => i/dataSize); // normalized (0 - 1) gradient stops positions
  stops.forEach((s, idx) => {
    gradient.addColorStop(s, `rgba(255, 81, 69, ${transparency[idx]})`)
  });

  return gradient;
}