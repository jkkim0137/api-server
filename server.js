const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database('./database.db');

app.use(bodyParser.json());

// 데이터베이스 초기화
// db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT, description TEXT)");
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT,
        age INTEGER,
        gender TEXT,
        email TEXT
    )
`, (err) => {
    if (err) {
        console.error('Error creating table:', err);
    } else {
        // insertInitialData();
    }
});

function insertInitialData() {
    const initialUsers = [
        { name: 'Alice', age: 28, gender: 'Female', email: 'alice@example.com' },
        { name: 'Bob', age: 32, gender: 'Male', email: 'bob@example.com' },
        // ... 기타 초기 데이터 추가 가능
    ];

    const placeholders = initialUsers.map(() => '(?, ?, ?, ?)').join(',');
    const values = initialUsers.flatMap(user => [user.name, user.age, user.gender, user.email]);

    db.run(`INSERT OR IGNORE INTO users (name, age, gender, email) VALUES ${placeholders}`, values, function(err) {
        if (err) {
            console.error('Error inserting initial data:', err);
        } else {
            console.log('Initial data inserted successfully.');
        }
    });
}

// 모든 users 조회
app.get('/api/users', (req, res) => {
    console.log('모든 users 조회 됨!!')
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// 특정 users 조회
app.get('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: row });
    });
});

// user 추가
app.post('/api/users', (req, res) => {
    const { name, age, gender, email } = req.body;
    const sql = `INSERT INTO users (name, age, gender, email) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, age, gender, email], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "User added successfully!", id: this.lastID });
    });
});

// user 수정
app.put('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const { name, age, gender, email } = req.body;
    const sql = `UPDATE users SET name = ?, age = ?, gender = ?, email = ? WHERE id = ?`;
    db.run(sql, [name, age, gender, email, userId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "User updated successfully!" });
    });
});

// user 삭제
app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const sql = `DELETE FROM users WHERE id = ?`;
    db.run(sql, [userId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "User deleted successfully!" });
    });
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// server: {
//     proxy: {
//       '/api': {
//         target: 'http://localhost:3000/',
//         changeOrigin: true,
//         // rewrite: (path) => path.replace(/^\/api/, ''),
//         secure: false,
//         ws: true
//       }
//     }
//   }