use actix_web::{web, HttpResponse, Responder};
use serde::Deserialize;
use reqwest::Client;

#[derive(Deserialize)]
pub struct LoginInfo {
    username: String,
    password: String,
}

pub async fn login(info: web::Json<LoginInfo>) -> impl Responder {
  let username = &info.username;
  let password = &info.password;

  match try_login(username, password).await {
    Ok(success) => {
      if success {
        HttpResponse::Ok().body("Login successful!")
      } else {
        HttpResponse::Unauthorized().body("Invalid username or password")
      }
    }
    Err(_) => HttpResponse::InternalServerError().body("Error communicating with login service"),
  }
}

async fn try_login(username: &str, password: &str) -> Result<bool, reqwest::Error> {
  let client = Client::new();
  let params = [("ajax", "1"), ("username", username), ("realm", ""), ("credential", password)];

  let response = client
    .post("https://primula.mau.se:10443/remote/logincheck")
    .form(&params)
    .send()
    .await?;

  let response_text = response.text().await?;

  if response_text.contains("ret=0") {
    Ok(false)  
  } else {
    Ok(true)
  }
}
