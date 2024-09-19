CREATE TABLE users (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    reset_token VARCHAR(255) UNIQUE
);


CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- EXAMPLE USAGE

INSERT INTO users (username, password, email, type) 
VALUES ('worker_user', 'worker_password', 'worker@example.com', 'worker');

INSERT INTO users (username, password, email, type) 
VALUES ('admin_user', 'admin_password', 'admin@example.com', 'admin');

INSERT INTO users (username, password, email, type) 
VALUES ('maintainer_user', 'maintainer_password', 'maintainer@example.com', 'maintainer');

SELECT * FROM users;

DROP TABLE users;
