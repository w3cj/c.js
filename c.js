function App(options) {
  let components = {};
  let currentComponent = null;
  let appReady = false;
  let inputListeners = [];

  this.addComponent = addComponent;
  this.showComponent = showComponent;
  this.updateView = updateView;
  this.getComponent = getComponent;

  function addComponent(name, component) {
    component.name = name;
    components[name] = component;
    component.model = createProxy(component.model);
    component.view = component.view.bind(component.model);

    if(component.controller) {
      component.controller = component.controller.bind(component.model);
    }

    if(component.methods) {
      Object.keys(component.methods).forEach(methodName => {
        component.methods[methodName] = component.methods[methodName].bind(component.model);
      })
    }
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

    if(component.controller) {
      component.controller();
    }
    const html = component.view();
    setViewHTML(html);
    const inputs = document.querySelector('#view').getElementsByTagName('input');
    [].forEach.call(inputs, (input) => {
      const listener = () => {
        setProperty(component.model, input.name, input.value);
      };
      inputListeners.push({input, listener});
      input.addEventListener('keyup', listener);
    });
  }

  function updateView() {
    const html = currentComponent.view();
    setViewHTML(html);
  }

  function setViewHTML(html) {
    html = `<section id="view">${html}</section>`;
    morphdom(document.getElementById('view'), html);
  }

  function setProperty(obj, prop, value) {
    const properties = prop.split('.');
    if(properties.length > 1) {
      setProperty(obj[properties[0]], properties.slice(1).join('.'), value);
    } else {
      obj[prop] = value;
    }
  }

  function createProxy(model) {
    const proxy = new Proxy(model, {
      set(obj, property, value) {
        if(value.constructor == Array) {
          obj[property] = watchArray(value);
        } else if(typeof value == 'object') {
          obj[property] = createProxy(value);
        } else {
          obj[property] = value;
        }
        if(appReady) updateView();
      }
    });

    Object.keys(proxy).forEach(property => {
      if(proxy[property].constructor == Array) {
        proxy[property] = watchArray(proxy[property]);
      } else if(typeof proxy[property] == 'object') {
        proxy[property] = createProxy(proxy[property]);
      }
    });

    return proxy;
  }

  function watchArray(array) {
    ['push', 'pop', 'splice'].forEach(method => {
      const original = array[method];
      array[method] = function() {
        original.apply(array, this.arguments);
        if(appReady) updateView();
      }
    });
    return array;
  }

  document.addEventListener('readystatechange', function() {
    if(document.readyState == 'complete') {
      appReady = true;
    }
  });
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

  document.addEventListener('readystatechange', function() {
    if(document.readyState == 'complete') {
      hashChange();
    }
  });
}
