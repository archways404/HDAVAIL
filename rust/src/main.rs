use actix_web::{cookie::Cookie, web, App, HttpServer, HttpResponse, Responder};
use serde::{Serialize, Deserialize};
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use password_hash::SaltString;
use rand_core::OsRng;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

// Data structure for parsing form-data or JSON
#[derive(Deserialize)]
struct LoginData {
    username: String,
    password: String,
}

// Placeholder for a stored hash (in a real-world app, retrieve this from a database)
const STORED_HASH: &str = "$argon2id$v=19$m=19456,t=2,p=1$TzWeCBGiNf7vVftVF3Flog$u/xACLLGTZKw66CvCZhNDNkVBmMlixJvFUcx7EhGL/4";

// Mock session store
type SessionStore = Arc<Mutex<HashMap<String, String>>>;

// Function to hash a password
fn hash_password(password: &str) -> String {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    match argon2.hash_password(password.as_bytes(), &salt) {
        Ok(hash) => hash.to_string(),
        Err(e) => panic!("Password hashing failed: {}", e),
    }
}

// Function to verify a password against a stored hash
fn verify_password(password: &str, hash: &str) -> bool {
    let parsed_hash = PasswordHash::new(hash).unwrap();
    Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok()
}

// Handler for JSON login requests
async fn login(data: web::Json<LoginData>, sessions: web::Data<SessionStore>) -> impl Responder {
    let username = &data.username;
    let password = &data.password;

    if username == "admin" && verify_password(password, STORED_HASH) {
        // Generate a simple session token (use something more secure in production)
        let session_token = uuid::Uuid::new_v4().to_string();
        
        // Store the session token
        let mut store = sessions.lock().unwrap();
        store.insert(session_token.clone(), username.clone());

        // Create a cookie
        let cookie = Cookie::build("session_token", session_token)
            .http_only(true)
            .secure(true)
            .finish();

        HttpResponse::Ok()
            .cookie(cookie)
            .body("Login successful!")
    } else {
        HttpResponse::Unauthorized().body("Invalid username or password.")
    }
}

// Handler to verify the session cookie
async fn verify(cookie: actix_web::HttpRequest, sessions: web::Data<SessionStore>) -> impl Responder {
    if let Some(cookie) = cookie.cookie("session_token") {
        let token = cookie.value();

        // Check if the token is in the session store
        let store = sessions.lock().unwrap();
        if store.contains_key(token) {
            return HttpResponse::Ok().body("Session is valid.");
        }
    }
    HttpResponse::Unauthorized().body("Invalid or missing session.")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let sessions: SessionStore = Arc::new(Mutex::new(HashMap::new()));

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(sessions.clone()))
            .route("/", web::get().to(|| async { "Welcome to Actix-web!" }))
            .route("/login", web::post().to(login))
            .route("/verify", web::get().to(verify))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
