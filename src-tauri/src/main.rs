// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use futures_util::StreamExt;
use reqwest::Client;
use std::collections::HashMap;
use std::fs::File;
use std::io::Write;
use std::path::Path;
use tauri::command;

#[command]
async fn download_file(
    url: String,
    dest: String,
    headers: HashMap<String, String>,
) -> Result<(), String> {
    let path = Path::new(&dest);
    let client = Client::new();

    let mut request_builder = client.get(&url);
    for (key, value) in &headers {
        request_builder = request_builder.header(key, value);
    }

    let response = request_builder.send().await.map_err(|e| e.to_string())?;

    let mut file = File::create(path).map_err(|e| e.to_string())?;
    let mut content = response.bytes_stream();

    while let Some(chunk) = content.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        file.write_all(&chunk).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[command]
async fn image_to_base64(url: String) -> Result<String, String> {
    let response = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    let bytes = response.bytes().await.map_err(|e| e.to_string())?;
    let base64 = base64::encode(&bytes);
    Ok(base64)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![download_file, image_to_base64])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
