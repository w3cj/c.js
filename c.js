const cjs = (function() {
  function App(options) {
    let components = {};
    let currentComponent = null;
    let inputListeners = [];
    let viewElement = null;

    this.appReady = false;
    this.addComponent = addComponent;
    this.showComponent = showComponent;
    this.updateView = updateView;
    this.getComponent = getComponent;

    function addComponent(name, component) {
      components[name] = new Component(this, name, component);
      return components[name];
    }

    function getComponent(name) {
      const component = components[name];
      return component;
    }

    function showComponent(name) {
      inputListeners.forEach(({input, listener}) => {
        input.removeEventListener('keyup', listener)
      });

      inputListeners = [];

      const component = components[name];
      currentComponent = component;
      component.loadModel();

      if(component.controller) {
        component.controller();
      }

      updateView();

      const inputs = viewElement.querySelectorAll('input[data-bind]');
      if(inputs) {
        [].forEach.call(inputs, (input) => {
          const listener = () => {
            setProperty(component.model, input.dataset.bind, input.value);
          };
          inputListeners.push({input, listener});
          input.addEventListener('keyup', listener);
        });
      }
    }

    function updateView() {
      if(currentComponent) {
        const html = currentComponent.view();
        setViewHTML(html);
      } else {
        console.log('wtf');
      }
    }

    function setViewHTML(html) {
      html = `<div>${html}</div>`;
      morphdom(viewElement, html);
    }

    function setProperty(obj, prop, value) {
      const properties = prop.split('.');
      if(properties.length > 1) {
        setProperty(obj[properties[0]], properties.slice(1).join('.'), value);
      } else {
        obj[prop] = value;
      }
    }

    document.addEventListener('readystatechange', () => {
      if(document.readyState == 'complete') {
        viewElement = document.createElement('div');
        options.root.appendChild(viewElement);
        this.appReady = true;
      }
    });
  }

  function Component(app, name, component) {
    this.name = name;
    this.loadModel = loadModel;

    this.loadModel();

    function loadModel() {
      this.model = createProxy(deepCopy(component.model));
      this.view = component.view.bind(this.model);

      if(component.controller) {
        this.controller = component.controller.bind(this.model);
      }

      if(component.methods) {
        this.methods = {};
        Object.keys(component.methods).forEach(methodName => {
          this.methods[methodName] = component.methods[methodName].bind(this.model);
        });
      }
    }

    function deepCopy(model) {
      const copy = Object.assign({}, model);
      Object.keys(copy).forEach(property => {
        if(copy[property].constructor == Array) {
          copy[property] = copy[property].slice();
        } else if(typeof copy[property] == 'object') {
          copy[property] = deepCopy(copy[property]);
        }
      });
      return copy;
    }

    function createProxy(model) {
      const proxy = new Proxy(model, {
        set(obj, property, value) {
          if(value.constructor == Array) {
            obj[property] = value._type == 'watched' ? value : watchArray(value);
          } else if(typeof value == 'object') {
            obj[property] = value._type == 'proxy' ? value : createProxy(value);
          } else {
            obj[property] = value;
          }
          if(app.appReady) app.updateView();
        }
      });

      Object.keys(proxy).forEach(property => {
        if(typeof proxy[property] == 'object') {
          proxy[property] = proxy[property];
        }
      });

      proxy._type == 'proxy';
      return proxy;
    }

    function watchArray(array) {
      ['push', 'pop', 'splice'].forEach(method => {
        const original = array[method];
        array[method] = function() {
          original.apply(array, this.arguments);
          if(app.appReady) app.updateView();
        }

        array._type = 'watched';
      });
      return array;
    }
  }

  function Router(app, options) {
    window.onhashchange = hashChange;

    function hashChange() {
      const url = window.location.hash.substr(1);
      const route = options.routes.filter(route => route.url == url)[0];

      if(route) {
        app.showComponent(route.component);
      } else {
        if(options.defaultUrl) {
          history.pushState({}, {}, `/#${options.defaultUrl}`);
          app.showComponent(options.routes.filter(route => route.url == options.defaultUrl)[0].component);
        }
      }
    }

    document.addEventListener('readystatechange', () => {
      if(document.readyState == 'complete') {
        hashChange();
      }
    });
  }

  return {
    createApp(options) {
      return new App(options);
    },
    createRouter(app, routes) {
      return new Router(app, routes);
    }
  };
})();
