let root = document.getElementById("root");
let query_params = new URLSearchParams(window.location.search);
const invoke = window.__TAURI__.invoke;
const save = window.__TAURI__.dialog.save;

let count = 0;

let counter = {
    view: function() {
        return [
            m("div", m("button", {onclick: function() { count++; }}, count + " Clicks!")),
            m("div", m("button", {onclick: function() { save_count(count) } }, "Save"))
        ];
    }
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