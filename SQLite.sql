-- SQLite
CREATE TABLE products (
    Name VARCHAR(55),
    Description VARCHAR(200),
    Price INTEGER,
    picture VARCHAR(100),
    id INTEGER PRIMARY KEY AUTOINCREMENT);

CREATE TABLE IF NOT EXISTS users(
    Email VARCHAR(50) UNIQUE,
    Firstname VARCHAR(20),
    Lastname VARCHAR(20),
    Password VARCHAR(50),
    Id INTEGER PRIMARY KEY AUTOINCREMENT);

DROP TABLE products;