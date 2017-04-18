const mongoose = require('mongoose');

// this is our schema to represent a blog post
const blogPostSchema = mongoose.Schema({
    // the `name` property is String type and required
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    // the `address` property is an object
    publishDate: {
        type: String,
    }
});

//function StorageException(message) {
//    this.message = message;
//    this.name = "StorageException";
//}
//
//const BlogPosts = {
//    create: function (title, content, author, publishDate) {
//        const post = {
//            id: uuid.v4(),
//            title: title,
//            content: content,
//            author: author,
//            publishDate: publishDate || Date.now()
//        };
//        this.posts.push(post);
//        return post;
//    },
//    get: function (id = null) {
//        // if id passed in, retrieve single post,
//        // otherwise send all posts.
//        if (id !== null) {
//            return this.posts.find(post => post.id === id);
//        }
//        // return posts sorted (descending) by
//        // publish date
//        return this.posts.sort(function (a, b) {
//            return b.publishDate - a.publishDate
//        });
//    },
//    delete: function (id) {
//        const postIndex = this.posts.findIndex(
//            post => post.id === id);
//        if (postIndex > -1) {
//            this.posts.splice(postIndex, 1);
//        }
//    },
//    update: function (updatedPost) {
//        const {
//            id
//        } = updatedPost;
//        const postIndex = this.posts.findIndex(
//            post => post.id === updatedPost.id);
//        if (postIndex === -1) {
//            throw StorageException(
//                `Can't update item \`${id}\` because doesn't exist.`)
//        }
//        this.posts[postIndex] = Object.assign(
//            this.posts[postIndex], updatedPost);
//        return this.posts[postIndex];
//    }
//};
//
//function createBlogPostsModel() {
//    const storage = Object.create(BlogPosts);
//    storage.posts = [];
//    return storage;
//}

//gives each instance of our BlogPost model an apiRepr method.
//We will use this as the standard way to represent blog posts in our API
//Instead of passing along the document itself, we'll pass along this
//composite data.
blogPostSchema.methods.apiRepr = function () {

    return {
        id: this._id,
        title: this.title,
        content: this.content,
        author: this.author,
        publishDate: this.publishDate
    };
}

//creates a new mongoose model 'BlogPost' that uses the blogPostSchema.
const BlogPosts = mongoose.model('BlogPost', blogPostSchema);

module.exports = {
    BlogPosts
};
