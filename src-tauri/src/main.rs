#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[tauri::command]
fn get_count_from_file(path: String) -> Result<i64, String> {
    std::fs::read_to_string(path)
        .map_err(|e| e.to_string())?
        .split(|c| !char::is_numeric(c))
        .next()
        .ok_or(String::from("File contains no numbers"))?
        .parse::<i64>()
        .map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_count_from_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
