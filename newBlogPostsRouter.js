const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


const {BlogPosts} = require('./models');

// we're going to add some blog posts to BlogPosts
// so there's some data to look at
BlogPosts.create(
    'Chicago Blackhawks', 'They are so awesome!!!!!', 'hawksFan', '5-1-16');
BlogPosts.create(
    'Frogs', 'Frogs are cool', 'frogProtector', '2-2-16');

// send back JSON representation of all recipes
// on GET requests to root
router.get('/', (req, res) => {
    res.json(BlogPosts.get());
});


// when new blog post is added, ensure has required fields. if not,
// log error and return 400 status code with hepful message.
// if okay, add new item, and return it with a status 201.
router.post('/', jsonParser, (req, res) => {
    // ensure `title`, 'content', 'author name' and `publication date`
    // are in request body
    const requiredFields = ['title', 'content', 'author', 'publishDate'];
    for (let i=0; i<requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }
    const item = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.publishDate);
    res.status(201).json(item);
});


module.exports = router;
