const mongoose = require('mongoose');

// this is our schema to represent a blog post
const blogPostSchema = mongoose.Schema({
    // the `name` property is String type and required
    title: {
        type: String,
        required: true
    },
    content: {
        type: String
    },
    author: {
        firstName: String,
        lastName: String
    },
    created: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'blog-posts'
});



blogPostSchema.virtual('authorName').get(function () {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});


//gives each instance of our BlogPost model an apiRepr method.
//We will use this as the standard way to represent blog posts in our API
//Instead of passing along the document itself, we'll pass along this
//composite data.
blogPostSchema.methods.apiRepr = function () {

    return {
        id: this._id,
        title: this.title,
        content: this.content,
        author: this.authorName,
        created: this.created
    };
}

//creates a new mongoose model 'BlogPost' that uses the blogPostSchema.
const BlogPosts = mongoose.model('BlogPost', blogPostSchema);

module.exports = {
    BlogPosts
};
