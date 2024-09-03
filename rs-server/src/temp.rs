use chrono::Local;
use serde_json::Value;
use std::fs::File;
use std::io::Read;

fn main() -> std::io::Result<()> {
    let now = Local::now();
    
    let formatted_date = now.format("%Y-%m-%d_filtered").to_string();
    println!("Formatted date: {}", formatted_date);
    
    let file_path = format!("../scripts/files/{}.json", formatted_date);
    println!("File path: {}", file_path);
    
    let mut file = File::open(&file_path)?;

    let mut contents = String::new();
    file.read_to_string(&mut contents)?;

    let json: Value = serde_json::from_str(&contents)?;

    println!("JSON contents: {:#?}", json);

    Ok(())
}
