use serde::{Deserialize, Serialize};
use std::{env, path::PathBuf, time::Duration};
use tauri;

#[tauri::command]
fn show_window(window: tauri::Window) -> Result<(), String> {
    if window.is_visible().unwrap() {
        return Ok(());
    }

    window
        .show()
        .map_err(|e| format!("Failed to show window: {}", e))?;

    Ok(())
}

#[derive(Debug, Serialize)]
struct MarketSnapshot {
    provider: String,
    symbol: String,
    asset_class: String,
    price: Option<f64>,
    change: Option<f64>,
    change_percent: Option<f64>,
    open: Option<f64>,
    high: Option<f64>,
    low: Option<f64>,
    previous_close: Option<f64>,
    volume: Option<f64>,
    currency: Option<String>,
    as_of: Option<String>,
    source_note: String,
}

#[derive(Debug, Deserialize)]
struct FinnhubQuote {
    c: Option<f64>,
    d: Option<f64>,
    dp: Option<f64>,
    h: Option<f64>,
    l: Option<f64>,
    o: Option<f64>,
    pc: Option<f64>,
    t: Option<i64>,
}

#[derive(Debug, Deserialize)]
struct MassiveAggResponse {
    results: Option<Vec<MassiveAgg>>,
}

#[derive(Debug, Deserialize)]
struct MassiveAgg {
    c: Option<f64>,
    h: Option<f64>,
    l: Option<f64>,
    o: Option<f64>,
    v: Option<f64>,
    t: Option<i64>,
}

#[derive(Debug, Deserialize)]
struct TwelveQuote {
    symbol: Option<String>,
    currency: Option<String>,
    close: Option<String>,
    open: Option<String>,
    high: Option<String>,
    low: Option<String>,
    previous_close: Option<String>,
    change: Option<String>,
    percent_change: Option<String>,
    volume: Option<String>,
    datetime: Option<String>,
    message: Option<String>,
}

#[tauri::command]
fn get_market_snapshot(
    provider: String,
    symbol: String,
    asset_class: String,
) -> Result<MarketSnapshot, String> {
    load_env();

    let client = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(12))
        .build()
        .map_err(|error| format!("Failed to create HTTP client: {error}"))?;

    match provider.as_str() {
        "finnhub" => fetch_finnhub(&client, &symbol, &asset_class),
        "massive" => fetch_massive(&client, &symbol, &asset_class),
        "twelvedata" => fetch_twelve_data(&client, &symbol, &asset_class),
        _ => Err(format!("Unsupported market data provider: {provider}")),
    }
}

fn load_env() {
    let _ = dotenvy::dotenv();

    if let Ok(current_dir) = env::current_dir() {
        let candidates: [PathBuf; 2] = [
            current_dir.join(".env"),
            current_dir.join("..").join(".env"),
        ];

        for path in candidates {
            if path.exists() {
                let _ = dotenvy::from_path(path);
            }
        }
    }
}

fn env_key(names: &[&str]) -> Result<String, String> {
    for name in names {
        if let Ok(value) = env::var(name) {
            if !value.trim().is_empty() {
                return Ok(value);
            }
        }
    }

    Err(format!(
        "Missing API key. Expected one of: {}",
        names.join(", ")
    ))
}

fn fetch_finnhub(
    client: &reqwest::blocking::Client,
    symbol: &str,
    asset_class: &str,
) -> Result<MarketSnapshot, String> {
    let token = env_key(&["FINNHUB_API_KEY", "FINNHUB_TOKEN"])?;
    let url = format!(
        "https://finnhub.io/api/v1/quote?symbol={}&token={}",
        urlencoding::encode(symbol),
        urlencoding::encode(&token)
    );

    let quote: FinnhubQuote = client
        .get(url)
        .send()
        .and_then(|response| response.error_for_status())
        .map_err(|error| format!("Finnhub request failed: {error}"))?
        .json()
        .map_err(|error| format!("Finnhub response parse failed: {error}"))?;

    Ok(MarketSnapshot {
        provider: "finnhub".to_string(),
        symbol: symbol.to_string(),
        asset_class: asset_class.to_string(),
        price: quote.c,
        change: quote.d,
        change_percent: quote.dp,
        open: quote.o,
        high: quote.h,
        low: quote.l,
        previous_close: quote.pc,
        volume: None,
        currency: None,
        as_of: quote.t.map(|timestamp| timestamp.to_string()),
        source_note: "Finnhub quote endpoint".to_string(),
    })
}

fn fetch_massive(
    client: &reqwest::blocking::Client,
    symbol: &str,
    asset_class: &str,
) -> Result<MarketSnapshot, String> {
    let token = env_key(&["MASSIVE_API_KEY", "POLYGON_API_KEY"])?;
    let url = format!(
        "https://api.massive.com/v2/aggs/ticker/{}/prev?adjusted=true&apiKey={}",
        urlencoding::encode(symbol),
        urlencoding::encode(&token)
    );

    let response: MassiveAggResponse = client
        .get(url)
        .send()
        .and_then(|response| response.error_for_status())
        .map_err(|error| format!("Massive request failed: {error}"))?
        .json()
        .map_err(|error| format!("Massive response parse failed: {error}"))?;

    let result = response
        .results
        .and_then(|mut results| results.pop())
        .ok_or_else(|| "Massive returned no aggregate data for this symbol".to_string())?;

    let change = match (result.c, result.o) {
        (Some(close), Some(open)) => Some(close - open),
        _ => None,
    };
    let change_percent = match (change, result.o) {
        (Some(change), Some(open)) if open != 0.0 => Some((change / open) * 100.0),
        _ => None,
    };

    Ok(MarketSnapshot {
        provider: "massive".to_string(),
        symbol: symbol.to_string(),
        asset_class: asset_class.to_string(),
        price: result.c,
        change,
        change_percent,
        open: result.o,
        high: result.h,
        low: result.l,
        previous_close: result.o,
        volume: result.v,
        currency: None,
        as_of: result.t.map(|timestamp| timestamp.to_string()),
        source_note: "Massive previous aggregate endpoint".to_string(),
    })
}

fn fetch_twelve_data(
    client: &reqwest::blocking::Client,
    symbol: &str,
    asset_class: &str,
) -> Result<MarketSnapshot, String> {
    let token = env_key(&["TWELVE_DATA_API_KEY", "TWELVEDATA_API_KEY"])?;
    let url = format!(
        "https://api.twelvedata.com/quote?symbol={}&apikey={}",
        urlencoding::encode(symbol),
        urlencoding::encode(&token)
    );

    let quote: TwelveQuote = client
        .get(url)
        .send()
        .and_then(|response| response.error_for_status())
        .map_err(|error| format!("Twelve Data request failed: {error}"))?
        .json()
        .map_err(|error| format!("Twelve Data response parse failed: {error}"))?;

    if let Some(message) = quote.message {
        return Err(format!("Twelve Data returned an error: {message}"));
    }

    Ok(MarketSnapshot {
        provider: "twelvedata".to_string(),
        symbol: quote.symbol.unwrap_or_else(|| symbol.to_string()),
        asset_class: asset_class.to_string(),
        price: parse_number(quote.close),
        change: parse_number(quote.change),
        change_percent: parse_number(quote.percent_change),
        open: parse_number(quote.open),
        high: parse_number(quote.high),
        low: parse_number(quote.low),
        previous_close: parse_number(quote.previous_close),
        volume: parse_number(quote.volume),
        currency: quote.currency,
        as_of: quote.datetime,
        source_note: "Twelve Data quote endpoint".to_string(),
    })
}

fn parse_number(value: Option<String>) -> Option<f64> {
    value.and_then(|value| value.parse::<f64>().ok())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![show_window, get_market_snapshot])
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
