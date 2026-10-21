CREATE DATABASE ExpTracker;
USE ExpTracker;

CREATE TABLE Users(
	user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    pwd VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active_yn INT DEFAULT 1
);

CREATE TABLE Categories(
    id INT AUTO_INCREMENT PRIMARY KEY,
    userid INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    icon_url VARCHAR(255),
    type ENUM('INCOME', 'EXPENSE') NOT NULL DEFAULT 'EXPENSE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active_yn INT DEFAULT 1,

   FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);

CREATE TABLE Transactions(
    id INT AUTO_INCREMENT PRIMARY KEY,
    userid INT NOT NULL,
    categoryid INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL, -- --The value(eg., 500.00)

    dateoftransaction DATE NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active_yn INT DEFAULT 1,

	FOREIGN KEY (userid) REFERENCES User(user_id) ON DELETE CASCADE,
	FOREIGN KEY (categoryid) REFERENCES Category(id) ON DELETE SET NULL
);

INSERT INTO USER( name, username, password, email, phone)
VALUES ('ABC', 'abc', 'pass123', 'abc12@gmail.com','1234567890');

select *
from users;

INSERT INTO CATEGORIES(id, userid, name, description, icon_url, type)
VALUES (1,'food', 'daily food expenses', 'https://www.example.com', 'EXPENSE')

select *
from categories;

INSERT INTO TRANSACTIONS(id, userid, categoryid, amount, dateoftransaction, note)
VALUES (1,'101', 'daily food expenses', 'https://www.example.com', 'EXPENSE')