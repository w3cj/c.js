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
          <input type="text" class="form-control" name="search" data-bind="info.search" value="${this.info.search}">
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
