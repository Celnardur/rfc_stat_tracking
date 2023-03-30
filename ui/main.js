let root = document.getElementById("root");
let query_params = new URLSearchParams(window.location.search);
const invoke = window.__TAURI__.invoke;

let count = 0;

let counter = {
    view: function() {
        return m("button", {onclick: function() { count++; }}, count + " Clicks!");
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
}

