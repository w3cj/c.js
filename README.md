# c.js

A simple JavaScript MVC framework.

## Setup

Create an app.js file with an app and a router:

```js
const app = cjs.createApp({
  root: document.getElementById('app')
});

const router = cjs.createRouter(app, {
  routes: [{
    component: 'home',
    url: '/home'
  }, {
    component: 'about',
    url: '/about'
  }, {
    component: 'contact',
    url: '/contact'
  }],
  defaultUrl: '/home'
});
```

## Add Components

Add a component with the `addComponent` method. Components have a model which is an object, and a view which is a function that returns the view as an HTML string.

```js
app.addComponent('home', {
  model: {
    title: 'c.js Home'
  },
  view() {
    return `
    <div class="jumbotron">
      <h1>${this.title}</h1>
      <p>This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.</p>
      <p><a class="btn btn-primary btn-lg">Learn more</a></p>
      <contact></contact>
    </div>`
  }
});
```

## Input Binding

Bind an input to a property on the model by setting the data-bind attribute of the input element.

```js
app.addComponent('contact', {
  model: {
    name: ''
  },
  view() {
    return `<h3>Contact</h3>
    <form class="form">
      <div class="form-group">
        <label for="name">Name</label>
        <input autofocus type="text" class="form-control" name="name" data-bind="name" value="${this.name}">
      </div>
    </form>
    <h4>Hello, ${this.name}</h4>
    `
  }
});
```

## Methods

Methods on the component can access and update the model properties using the `this` keyword.

```js
app.addComponent('about', {
  model: {
    title: 'About',
    info: {
      search: 'cats'
    },
    gifs: []
  },
  methods: {
    searchGifs(event) {
      event.preventDefault();
      this.loading = true;
      api.getGifs(this.info.search).then(gifs => {
        this.gifs = gifs;
        this.loading = false;
      });
    }
  },
  view() {
    const gifDivs = this.gifs.reduce((html, gif) => {
      return html + `
        <div class="col-xs-3">
          <img class="img-responsive" src="${gif.images.downsized_medium.url}">
        </div>
      `
    }, '');

    return `
      <h3>${this.title}</h3>
      <form onsubmit="app.getComponent('about').methods.searchGifs(event)" class="form">
        <div class="form-group">
          <label for="search">search</label>
          <input type="text" class="form-control" name="info.search" value="${this.info.search}">
        </div>
        <button type="submit" class="btn btn-success">
          Search
        </button>
      </form>
      <div style="display:${this.loading ? '' : 'none'}">
        <center>
          <img src="https://media0.giphy.com/media/JIX9t2j0ZTN9S/giphy-downsized-medium.gif" class="img-responsive">
        </center>
      </div>
      <div class="row" style="display:${this.loading ? 'none' : ''}">
        ${gifDivs}
      </div>
    `
  }
});
```

## Event Listeners

Event listeners can be added with HTML attributes:

```html
<form onsubmit="app.getComponent('about').methods.searchGifs(event)" class="form">
```
