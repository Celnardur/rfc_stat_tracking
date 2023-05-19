#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Serialize, Deserialize};
use std::fs::File;
use std::io::{BufReader, BufWriter};
use csv::{ReaderBuilder, WriterBuilder};

#[derive(Debug, Serialize, Deserialize)]
enum PlayType {
    Run,
    Pass,
    Punt,
    FieldGoal,
    Kickoff,
    ExtraPoint,
    TwoPointConversion,
    Safety,
    Penalty,
    StartGame,
}

// Negitive - moving right
// Positive - moving left
#[derive(Debug, Serialize, Deserialize)]
enum Possession {
    Negitive,
    Positive,
}

#[derive(Debug, Serialize, Deserialize)]
struct Play {
    clock:  u32,
    posession: Possession,
    field_pos: (i8, i8), // (before, after)
    points_from_play: (u16, u16), // (Negitive, Positive)
    score_after: (u16, u16), // (Negitive, Positive)
    down: u8,
    play_type: PlayType,
    notes: String,
}

#[tauri::command]
fn open_game(path: String) -> Result<Vec<Play>, String> {
    // open the path as a csv and read each line into a Play
    let file = File::open(&path).map_err(|err| format!("Failed to open file: {:?}", err))?;
    let reader = BufReader::new(file);
    let mut csv_reader = ReaderBuilder::new()
        .has_headers(false)
        .from_reader(reader);
    
    let mut plays = Vec::new();
    for result in csv_reader.deserialize() {
        let play: Play = result.map_err(|err| format!("Failed to deserialize play: {:?}", err))?;
        plays.push(play);
    }
    Ok(plays)
}

#[tauri::command]
fn save_game(plays: Vec<Play>, path: String) -> Result<(), String> {
    // save each play to a line of a csv at the given path
    let file = File::create(&path).map_err(|err| format!("Failed to create file: {:?}", err))?;
    let writer = BufWriter::new(file);
    let mut csv_writer = WriterBuilder::new()
        .has_headers(false)
        .from_writer(writer);
    
    for play in plays {
        csv_writer.serialize(play).map_err(|err| format!("Failed to serialize play: {:?}", err))?;
    }

    csv_writer.flush().map_err(|err| format!("Failed to flush data to file: {:?}", err))?;
    
    Ok(())
}

#[tauri::command]
fn print_play(play: Play) {
    println!("{:?}", play);
}

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

#[tauri::command]
fn save_count_to_file(count: i64, path: String) -> Result<(), String> {
    std::fs::write(path, count.to_string()).map_err(|e| e.to_string())?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_count_from_file, save_count_to_file, open_game, save_game, print_play])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
