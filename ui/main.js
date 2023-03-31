let root = document.getElementById("root");
let query_params = new URLSearchParams(window.location.search);
const invoke = window.__TAURI__.invoke;
const save = window.__TAURI__.dialog.save;

// state
let score = [0, 0];
let field_pos = 0;
let plays = [];

let count = 0;

let counter = {
    view: function() {
        return [
            m("div", m("b", "Score")),
            m("div", [
                m("input", {type: "number", id: "negitive_score", value: score[0], min: "0", max: "9999"}),
                m("input", {type: "number", id: "positive_score", value: score[1], min: "0", max: "9999"}),
            ]),

            m("div", [
                m("label", {for: "field_pos"}, "Field Position"),
                m("input", {type: "number", id: "field_pos", value: field_pos, min: "-9", max: "9"}),
            ]),
            m("br"),

            m("form", [
                m("label", {for: "clock"}, "Clock"),
                m("input", {type: "number", id: "clock_min", min: "0", max: "20"}),
                m("input", {type: "number", id: "clock_sec", min: "0", max: "59"}),
                m("br"),

                m("label", {for: "down"}, "Down"),
                m("input", {type: "number", id: "down", min: "1", max: "4"}),
                m("br"),
                
                m("label", {for: "points"}, "Points This Play"),
                m("input", {type: "number", id: "points_negitive", min: "0", max: "9999", value: "0"}),
                m("input", {type: "number", id: "points_positive", min: "0", max: "9999", value: "0"}),
                m("br"),

                m("label", {for: "play_type"}, "Play Type"),
                m("select", {id: "play_type"}, [
                    m("option", {value: "Run"}, "Run"),
                    m("option", {value: "Pass"}, "Pass"),
                    m("option", {value: "Punt"}, "Punt"),
                    m("option", {value: "FieldGoal"}, "Field Goal"),
                    m("option", {value: "Kickoff"}, "Kickoff"),
                    m("option", {value: "ExtraPoint"}, "Extra Point"),
                    m("option", {value: "TwoPointConversion"}, "Two Point Conversion"),
                    m("option", {value: "Safety"}, "Safety"),
                    m("option", {value: "Penalty"}, "Penalty"),
                    m("option", {value: "StartGame"}, "Start Game"),
                ]),
                m("br"),
                
                m("label", {for: "notes"}, "Notes"),
                m("input", {type: "text", id: "notes"}),
                m("br"),

                m("input", {type: "submit", value: "Add Play", onclick: function() { add_play() } }),
            ]),
            m("div", m("button", {onclick: function() { count++; }}, count + " Clicks!")),
            m("div", m("button", {onclick: function() { save_count(count) } }, "Save"))
        ];
    }
}

function add_play() {
}

if (query_params.has("count_file")) {
    let file = query_params.get("count_file");
    invoke('get_count_from_file', { path: file})
        .then((num) => {
            count = num;
            m.mount(root, counter);
        }) 
        .catch((error) => alert(error));
} else {
    count = 0;
    m.mount(root, counter);
}

async function save_count(num) {
    let filepath = await save();
    invoke('save_count_to_file', {count: count, path: filepath})
        .then(() => {
            alert("Count Saved");
        })
        .catch((error) => alert(error));
}