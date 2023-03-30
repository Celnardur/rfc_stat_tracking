const open = window.__TAURI__.dialog.open;

async function on_open() {
    const selected = await open();
    if (Array.isArray(selected)) {
        window.location.assign("/counter.html?count_file="+selected[0]);
    } else if (selected === null) {
        ;
    } else {
        window.location.assign("/counter.html?count_file="+selected);
    }
}
