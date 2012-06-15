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
- Publish at a future date
- Uses YAML for configuration, making it super simple
- DISQUS integration on index and posts
- Automatic code prettification
- Pre-configured for Heroku
- Automatic Sitemap.xml
- RSS feed
- Easy Google Analytics integration
- "Schedule" posts (ie. just give them a date in the future)
- Responsive CSS/mobile-friendly

Microwave has no editor interface.  Instead you write your blog posts in your own editor of choice, using markdown syntax.  There is a small bit of meta information to include with each post.  That's it.  There's nothing else to do besides write and git push.

Microwave.js is now powering my blog if you'd like to see a live version running: http://www.typeof.co

At present the code could be considered alpha or beta.  A lot of it is present, but changes are still being made.

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

#### 4. Edit settings.yml as you'd like.

See below for details of settings.

#### 5. Write a blog post.

Create a new file in the /posts folder

#### 6. Push to your heroku app

```
$ git push heroku master
```

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

- `MMMM dd, yyyy`
- `MMMM dd, yyyy HH:mm`
- `MM/DD/YYYY`
- etc.

Settings
--------

##### host
This is the root URL of your blog.  Be sure to change this before deploying.

##### posts
The folder for where the posts live.  This is relative to where your blog is on disk.

##### title
The title of your blog.

##### desc
A description of your blog.

##### author
Your name

##### disqusname
The DISQUS shortname for your blog.

##### comments
true or false if you want to enable comments

##### analytics
Your Google Analytics account.  If present Google Analytics will be enabled.

##### analyticsdomain
The domain you have configured your analytics account for.  This is setup in GA itself.

##### count
How many blog posts to show on the index page

#### next
The text that will be displayed for pagination when people want to see newer blog posts

##### prev
The text that will be displayed for pagination when people want to see older blog posts

##### posttimeformat
A datetime format string of how you'd like your dates to appear.  Any Date.js format is valid.  [Format Reference](http://code.google.com/p/datejs/wiki/FormatSpecifiers)

Examples:
- `M/d/yy` => 8/22/82
- `MMMM d, yyyy` => January 17, 2012
- `dddd` => Monday
- `ddd :: M.d.yy` => Mon :: 5.7.12

##### forcehost
If set to true (default), when a request comes in that is not on the value configured for `host`, the user will be `301 Moved Permanently`'ed to the same URL requested but on the preferred domain.  This is the [recommended setup](https://devcenter.heroku.com/articles/avoiding-naked-domains-dns-arecords) by Heroku.

Sidebars
--------

Super easy.  Edit either `left-sidebar.html` or `right-sidebar.html` depending on where you want to stick the things everyone will ignore anyways.  The sidebars are automatically added to every page.

Theme
-----

MicrowaveJS comes bundled with one theme at the moment.  Look inside the /public/theme folder if you want to mess with it.

A theme is composed of three files:

- head.html -- HTML to be included in the `<head>` of the page.  Use this for font-face CSS files, etc.
- theme.css -- The actual CSS of the theme
- prettify-theme.css -- The CSS to style syntax highlighted code.  Some themes are available [here](http://google-code-prettify.googlecode.com/svn/trunk/styles/index.html);

Syntax Highlighting Theme
-------------------------

Syntax highlighting has it's own theme, prettify-theme.css.  This is located in the /public/theme folder.  A gallery of pre-built syntax themes is here:
http://google-code-prettify.googlecode.com/svn/trunk/styles/index.html

Simply download the new theme and replace the prettify-theme.css file.


Markdown
--------
Markdown language reference: http://daringfireball.net/projects/markdown/syntax


Updating MicrowaveJS
--------------------

You've already got a blog out there and running but you want to get the latest version of MicrowaveJS?

```
$ git pull origin master
$ git push heroku master
````

You're done.

Getting Fancy
============

### Publish in the Future

Just set the date of your post to a future date/time and your post will only show up on/after that date.

#### Advanced Post Headers

`slug` -- Manually configure what the post slug should be.

`comments` -- "true" or "false" to enable or disable comments


### Manually Specifying a Highlighting Language

Start your code snippet with `lang: [language]`.  "Lang" is case insensative.  See the example.md blog post for sample syntax for all 3 code insertion formats.  The following languages are supported:

`bsh, c, cc, cpp, cs, csh, cyc, cv, htm, html, java, js, m, mxml, perl, pl, pm, py, rb, sh, xhtml, xml, xsl`

### Internet Explorer Support

You should probably know, the chances of everything in MicrowaveJS working right in IE8 or lower is pretty slim.  Client-side javascript is built to ECMAScript 5.

...cha2