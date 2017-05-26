const app = new App();

const router = new Router(app, {
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
