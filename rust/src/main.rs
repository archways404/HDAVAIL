use actix_web::{web, App, HttpServer, Responder, HttpResponse};
use serde::{Serialize, Deserialize};
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use password_hash::SaltString;
use rand_core::OsRng; // For secure random number generation

// Data structure for parsing form-data or JSON
#[derive(Deserialize)]
struct LoginData {
    username: String,
    password: String,
}

// Placeholder for a stored hash (in a real-world app, retrieve this from a database)
const STORED_HASH: &str = "$argon2id$v=19$m=19456,t=2,p=1$TzWeCBGiNf7vVftVF3Flog$u/xACLLGTZKw66CvCZhNDNkVBmMlixJvFUcx7EhGL/4";

// Function to hash a password
fn hash_password(password: &str) -> String {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    // Ensure the salt is used directly as generated
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
async fn login(data: web::Json<LoginData>) -> impl Responder {
    // Extract username and password
    let username = &data.username;
    let password = &data.password;

    // Handle login logic
    if username == "admin" && verify_password(password, STORED_HASH) {
        HttpResponse::Ok().body("Login successful!")
    } else {
        HttpResponse::Unauthorized().body("Invalid username or password.")
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Example of hashing a password (this would normally happen during registration)
    let example_password = "password";
    let hashed_password = hash_password(example_password);
    println!("Example hashed password: {}", hashed_password);

    HttpServer::new(|| {
        App::new()
            .route("/", web::get().to(|| async { "Welcome to Actix-web!" }))
            .route("/login", web::post().to(login))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
