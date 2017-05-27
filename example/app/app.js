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
