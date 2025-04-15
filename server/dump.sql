CREATE DATABASE inventory_db;
USE inventory_db;

-- Таблица ролей
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Таблица организаций
CREATE TABLE organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Таблица пользователей
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    organization_id INT,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Таблица номенклатуры
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    organization_id INT,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Вставка начальных данных
INSERT INTO roles (name) VALUES ('client'), ('manager'), ('admin');
INSERT INTO organizations (name) VALUES ('Default Organization');