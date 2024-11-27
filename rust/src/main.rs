use actix_web::{web, App, HttpServer, Responder, HttpResponse};
use serde::{Deserialize, Serialize};

// Data structure for parsing form-data or JSON
#[derive(Deserialize)]
struct LoginData {
    username: String,
    password: String,
}

// Handler for JSON login requests
async fn login(data: web::Json<LoginData>) -> impl Responder {
    // Extract username and password
    let username = &data.username;
    let password = &data.password;

    // Handle login logic
    if username == "admin" && password == "password" {
        HttpResponse::Ok().body("Login successful!")
    } else {
        HttpResponse::Unauthorized().body("Invalid username or password.")
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/", web::get().to(|| async { "Welcome to Actix-web!" }))
            .route("/login", web::post().to(login))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
