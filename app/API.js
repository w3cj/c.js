function API() {
  const API_URL = 'https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=';

  this.getGifs = getGifs;

  function getGifs(search) {
    return fetch(`${API_URL}${search}`)
      .then(res => res.json())
      .then(results => results.data);
  }
}

const api = new API();
