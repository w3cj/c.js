app.addComponent('contact', {
  model: {
    name: ''
  },
  view() {
    return `<h3>Contact</h3>
    <form class="form">
      <div class="form-group">
        <label for="name">Name</label>
        <input autofocus type="text" class="form-control" name="name" value="${this.name}">
      </div>
    </form>
    <h4>Hello, ${this.name}</h4>
    `
  }
});
