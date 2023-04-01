let root = document.getElementById("root");
let query_params = new URLSearchParams(window.location.search);
const invoke = window.__TAURI__.invoke;
const save = window.__TAURI__.dialog.save;

// state
let score = [0, 0];
let field_pos = 0;
let plays = [];
let save_path = null;

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

            m("label", {for: "clock"}, "Clock"),
            m("input", {type: "number", id: "clock_min", min: "0", max: "20"}),
            m("input", {type: "number", id: "clock_sec", min: "0", max: "59"}),
            m("br"),

            m("label", {for: "down"}, "Down"),
            m("input", {type: "number", id: "down", min: "1", max: "4"}),
            m("br"),

            m("label", {for: "new_field_pos"}, "New Field Position"),
            m("input", {type: "number", id: "new_field_pos", min: "-9", max: "9"}),
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

            m("button", {onclick: add_play}, "Add Play"),
            m("br"),

            m("div", m("button", {onclick: save_plays }, "Save")),
            m("div", m("button", {onclick: save_as_plays }, "Save As")),
        ];
    }
}

function add_play() {
    let negitive_score = Number(document.getElementById("negitive_score").value);
    let positive_score = Number(document.getElementById("positive_score").value);
    let old_field_pos = Number(document.getElementById("field_pos").value);
    let clock_min = Number(document.getElementById("clock_min").value);
    let clock_sec = Number(document.getElementById("clock_sec").value);
    let down = Number(document.getElementById("down").value);
    let new_field_pos = Number(document.getElementById("new_field_pos").value);
    let points_negitive = Number(document.getElementById("points_negitive").value);
    let points_positive = Number(document.getElementById("points_positive").value);
    let play_type = document.getElementById("play_type").value;
    let notes = document.getElementById("notes").value;

    let play = {
        clock: clock_min*60 + clock_sec,
        field_pos: [old_field_pos, new_field_pos],
        points_from_play: [points_negitive, points_positive],
        score_after: [negitive_score + points_negitive, positive_score + points_positive],
        down: down,
        play_type: play_type,
        notes: notes,
    };

    score = [negitive_score + points_negitive, positive_score + points_positive]
    field_pos = new_field_pos;

    plays.push(play);
}

if (query_params.has("game_file")) {
    let file = query_params.get("game_file");
    invoke('open_game', { path: file})
        .then((in_plays) => {
            plays = in_plays;
            let last_play = plays[plays.length - 1];
            field_pos = last_play.field_pos[1];
            score = last_play.score_after;
            save_path = file;

            m.mount(root, counter);
        }) 
        .catch((error) => alert(error));
} else {
    plays = [];
    field_pos = 0;
    score = [0, 0];
    save_path = null;

    m.mount(root, counter);
}

async function save_plays() {
    if (save_path == null) {
        return await save_as_plays();
    } else {
        invoke('save_game', {path: save_path, plays: plays})
            .then(() => {
                alert("Game Saved");
            })
            .catch((error) => alert(error));
    }
}

async function save_as_plays() {
    let filepath = await save();
    save_path = filepath;
    save_plays();
}


// if (query_params.has("count_file")) {
//     let file = query_params.get("count_file");
//     invoke('get_count_from_file', { path: file})
//         .then((num) => {
//             count = num;
//             m.mount(root, counter);
//         }) 
//         .catch((error) => alert(error));
// } else {
//     count = 0;
//     m.mount(root, counter);
// }

// async function save_count(num) {
//     let filepath = await save();
//     invoke('save_count_to_file', {count: count, path: filepath})
//         .then(() => {
//             alert("Count Saved");
//         })
//         .catch((error) => alert(error));
// }