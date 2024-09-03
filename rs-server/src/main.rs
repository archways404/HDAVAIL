use actix_web::{web, App, HttpServer, Responder};

mod handlers;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
  HttpServer::new(|| {
    App::new()
        .route("/", web::get().to(handlers::index))
        .route("/login", web::post().to(handlers::login)) // Change to POST method
  })
  .bind("127.0.0.1:8080")?
  .run()
  .await
}
