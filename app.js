const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database.db');


// ==============================
// Middleware
// ==============================

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));


// ==============================
// Multer Config (Image Upload)
// ==============================

const storage = multer.diskStorage({

    destination: './public/uploads/',

    filename: (req, file, cb) => {

        cb(
            null,
            Date.now() + path.extname(file.originalname)
        );

    }

});

const upload = multer({ storage });


// ==============================
// Database Initialization
// ==============================

db.serialize(() => {

    db.run(`
        
        CREATE TABLE IF NOT EXISTS posts (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            title TEXT NOT NULL,

            category TEXT,

            content TEXT NOT NULL,

            image TEXT,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP

        )

    `);

});


// ==============================
// Routes
// ==============================


// Home Page

app.get('/', (req, res) => {

    res.sendFile(
        path.join(__dirname, 'views', 'index.html')
    );

});


// Add Post Page

app.get('/add', (req, res) => {

    res.sendFile(
        path.join(__dirname, 'views', 'add.html')
    );

});


// Admin Page

app.get('/admin', (req, res) => {

    res.sendFile(
        path.join(__dirname, 'views', 'admin.html')
    );

});


// Post Details Page

app.get('/post-details/:title', (req, res) => {

    res.sendFile(
        path.join(__dirname, 'views', 'post-details.html')
    );

});


// ==============================
// GET ALL POSTS
// ==============================

app.get('/posts', (req, res) => {

    db.all(

        'SELECT * FROM posts ORDER BY created_at DESC',

        [],

        (err, rows) => {

            if (err) {

                console.error(err.message);

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json(rows);

        }

    );

});


// ==============================
// GET SINGLE POST
// ==============================

app.get('/post/:title', (req, res) => {

    const postTitle = req.params.title

        .replace(/-/g, ' ')
        .trim()
        .toLowerCase();



    db.get(

        'SELECT * FROM posts WHERE LOWER(TRIM(title)) = ?',

        [postTitle],

        (err, row) => {

            if (err) {

                return res.status(500).json({
                    error: 'Database error'
                });

            }

            if (!row) {

                return res.status(404).json({
                    error: 'Post not found'
                });

            }

            res.json(row);

        }

    );

});


// ==============================
// ADD POST
// ==============================

app.post(

    '/add',

    upload.single('image'),

    (req, res) => {

        const { title, category, content } = req.body;

        const image = req.file
            ? `/uploads/${req.file.filename}`
            : null;



        db.run(

            `

            INSERT INTO posts (

                title,
                category,
                content,
                image

            )

            VALUES (?, ?, ?, ?)

            `,

            [title, category, content, image],

            function (err) {

                if (err) {

                    console.error(err.message);

                    return res.status(500).send(
                        'Error saving post'
                    );

                }

                res.redirect('/');

            }

        );

    }

);


// ==============================
// DELETE POST
// ==============================

app.delete('/delete/:id', (req, res) => {

    const id = req.params.id;



    db.run(

        'DELETE FROM posts WHERE id = ?',

        [id],

        function (err) {

            if (err) {

                console.log(err.message);

                return res.status(500).json({
                    message: 'Error deleting post'
                });

            }

            res.status(200).json({
                message: 'Post deleted successfully'
            });

        }

    );

});


// ==============================
// Server
// ==============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});