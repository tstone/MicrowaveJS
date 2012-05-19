Microwave.js
============

There are a lot of differnet ways out there to have a blog.  Here's what I wanted, and what I built.  If this sounds like you too, you might like microwave.js.

- I wanted to write code for blog posts in my own editor, being able to use things like tab, brace highlighting, etc.
- I didn't want to write blog posts in HTML.  I wanted it to be simple, like answering a question on Stack Overflow.
- I want the syntax and setup to be fast and easy.  I shouldn't have to fuss around for 5 minutes just to get a blog post online

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

Writing a Blog Post
-------------------

Microwave will automatically scan any files that are in the posts folder and assume they are blog posts.  By default, the name of the file and creation date will be assumed to be the title and post time of the blog post.  These values, along with others, however can be controlled by adding a small header to the top of each file:

```
/*
title:  Example Markdown Post
date:   May 18, 2012
tags:   [simple, easy, sample]
*/
```

Values in this header will override any information pulled from the file.  All values are in YAML format and optional.

The date can be written in any way you like, including the following formats:

- MMMM dd, yyyy
- MM/DD/YYYY
- etc.

It's pretty smart.

Settings
--------

##### host
This is the root URL of your blog.  Be sure to change this before deploying.

##### posts
The folder for where the posts live.  This is relative to where your blog is on disk.

##### title
The title of your blog.

##### count
How many blog posts to show on the index page

##### disqusname
The DISQUS shortname for your blog.

#### next
The text that will be displayed for pagination when people want to see newer blog posts

##### prev
The text that will be displayed for pagination when people want to see older blog posts

Theme
-----

There isn't any direct theme supporting in microwave.js, but the theme specific CSS has been called out into it's own file.

A real light and dark theme will be provided sometime in the future.  For now, you're on your own.

Syntax Highlighting Theme
-------------------------

Syntax highlighting has it's own theme, prettify-theme.css.  This is located in the /public/theme folder.  A gallery of pre-built syntax themes is here:
http://google-code-prettify.googlecode.com/svn/trunk/styles/index.html

Simply download the new theme and replace the prettify-theme.css file.


Markdown
--------
Markdown language reference: http://daringfireball.net/projects/markdown/syntax
