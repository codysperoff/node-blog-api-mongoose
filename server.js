const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');

const app = express();

const newBlogPostsRouter = require('./newBlogPostsRouter');
const deleteBlogPostsRouter = require('./deleteBlogPostsRouter');

mongoose.Promise = global.Promise;

const {
    PORT,
    DATABASE_URL
} = require('./config');
const {
    BlogPosts
} = require('./models');

// log the http layer
app.use(morgan('common'));
//
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});


// when requests come into '/blog-posts' or
// '/blog-posts/:id', we'll route them to the express
// router instances we've imported. Remember,
// these router instances act as modular, mini-express apps.
app.use(bodyParser.json());
app.use('/blog-posts', newBlogPostsRouter);
app.use('/blog-posts', deleteBlogPostsRouter);

app.get('/posts', (req, res) => {
    //allows users to limit GET requests by title, content, author or date published.
    const filters = {};
    const queryableFields = ['title', 'content', 'author', 'created'];
    queryableFields.forEach(field => {
        if (req.query[field]) {
            filters[field] = req.query[field];
        }
    });

    //how would I create a query operator that showed posts with certain words in the content or title?
    BlogPosts
        .find(filters)
        // we're limiting so that no more than ten blogposts come up at once
        .limit(10)
        // `exec` returns a promise
        .exec()
        // success callback: for each blog post we got back, we'll
        // call the `.apiRepr` instance method we've created in
        // models.js in order to only expose the data we want the API return.
        .then(BlogPosts => res.json(
            BlogPosts.map(post => post.apiRepr());
        ))
        .catch(
            err => {
                console.error(err);
                res.status(500).json({
                    message: 'Internal server error'
                });
            });
});

// can also request by ID
app.get('/posts/:id', (req, res) => {
    BlogPosts
        .findById(req.params.id)
        .exec()
        .then(post => res.json(post.apiRepr())) //********Q: Will this work here just saying blogposts?********
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error'
            })
        });
});

//creates a new blog post
app.post('/posts', (req, res) => {
    //defines the required fields
    const requiredFields = ['title', 'content', 'author'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        //if the required fields are not in the body, send error message
        if (!(field in req.body)) {
            const message = `I'm sorry but you are still missing \`${field}\` in your post.`
            console.error(message);
            return res.status(400).send(message);
        }
    }
    //if the required fields are there, we use BlogPosts from models to
    //create a new blog post and then it will send a 201 code and a json blog post
    //using the apiRepr we created in models.
    BlogPosts
        .create({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author,
            //since 'created' is not a required field, should it still
            //be created or will it throw an error?
            created: req.body.created
        })
        .then(
            post => res.status(201).json(post.apiRepr()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error'
            });
        });
});

app.put('/posts/:id', (req, res) => {

    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (
            `The id you have concatenated to the url (${req.params.id}) and the id you have included in your request ` +
            `(${req.body.id}) must match`);
        console.error(message);
        res.status(400).json({
            message: message
        });
    }

    const toUpdate = {};
    const updateableFields = ['title', 'content', 'author'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    BlogPosts
        //what are the two lines of code below doing?
        .findByIdAndUpdate(req.params.id, {
            $set: toUpdate
        })
        .exec()
        .then(post => res.status(201).end())
        .catch(err => res.status(500).json({
            message: 'Internal server error'
        }));
});

app.delete('/posts/:id', (req, res) => {
    BlogPosts
        .findByIdAndRemove(req.params.id)
        .exec()
        .then(() => res.status(204).end())
        .catch(err => res.status(500).json({
            message: 'Internal server error'
        }));
});

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function (req, res) {
    res.status(404).json({
        message: 'Not Found'
    });
});

// both runServer and closeServer need to access the same
// server object, so we declare `server` here, and then when
// runServer runs, it assigns a value.
let server;

// this function starts our server and returns a Promise.
// In our test code, we need a way of asynchronously starting
// our server, since we'll be dealing with promises there.
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
    //const port = process.env.PORT || 8080;
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

// like `runServer`, this function also needs to return a promise.
// `server.close` does not return a promise on its own, so we manually
// create one.
function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    });

}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
    runServer().catch(err => console.error(err));
};

module.exports = {
    app,
    runServer,
    closeServer
};

app.listen(process.env.PORT || 8080, () => {
    console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});
