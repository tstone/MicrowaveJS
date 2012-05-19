Microwave.js
============

There are a lot of differnet ways out there to have a blog.  Here's what I wanted, and what I built.  If this sounds like you too, you might like microwave.js.

- I wanted to write code for blog posts in my own editor, being able to use things like tab, brace highlighting, etc.
- I didn't want to write blog posts in HTML.  I wanted it to be simple, like answering a question on Stack Overflow.
- I want things to be simple.  I shouldn't have to fuss around for 5 minutes just to get a blog post online

**So I built microwave.js.**

Out of the box it supports the following features:

- Posts are written in your own editor, then pushed to Heroku via git
- Posts are written in markdown, supporting both code blocks and inline code
- Uses YAML for configuration, making it super simple
- DISQUS integration on index and posts
- Automatic code prettification
- Pre-configured for Heroku

Microwave has no editor interface.  Instead you write your blog posts in your own editor of choice, using markdown syntax.  There is a small bit of meta information to include with each post.  That's it.  There's nothing else to do besides write and git push.

Installation
------------

#### 1. Follow the instructions for installing the Heroku toolbelt here:
https://toolbelt.heroku.com/

#### 2. Create a new folder to hold your blog, then change directory into that folder

````
$ mkdir myblog
$ cd myblog
````

#### 3. Clone the microwave.js repo

````
$ git clone git://github.com/tstone/MicrowaveJS.git
````

#### 4. Edit settings.yml as you'd like.  See below for details.

You're done.
