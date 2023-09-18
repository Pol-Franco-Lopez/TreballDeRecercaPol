let songsearch = document.getElementById("song-btn");
songsearch.addEventListener("click", SearchSong);

let artistsearch = document.getElementById("artist-btn");
artistsearch.addEventListener("click", SearchArtist);

var generos = [
    "Bachata",
    "Blues",
    "Country",
    "Cumbia",
    "Dance",
    "Disco",
    "Downtempo",
    "Drum and Bass",
    "Electrónica",
    "Flamenco",
    "Folk",
    "Funk",
    "Funky",
    "Fusión",
    "Gospel",
    "Grunge",
    "Hard Rock",
    "Heavy Metal",
    "Hip-hop",
    "Hip House",
    "House",
    "Indie",
    "Indie Pop",
    "Indie Rock",
    "Industrial",
    "Instrumental",
    "J-Pop",
    "Jazz",
    "K-Pop",
    "Lounge",
    "Merengue",
    "Metal",
    "Música clásica contemporánea",
    "Música experimental",
    "Música industrial",
    "Música minimalista",
    "Música vocal",
    "New Age",
    "New Wave",
    "Opera",
    "Pop",
    "Post-punk",
    "Punk",
    "R&B",
    "Rap",
    "Reggae",
    "Reggaetón",
    "Rock",
    "Rock alternativo",
    "Rock progresivo",
    "Rock psicodélico",
    "Rock sinfónico",
    "Rhythm and Blues (R&B)",
    "Salsa",
    "Samba",
    "Ska",
    "Ska punk",
    "Soul",
    "Swing",
    "Synth-pop",
    "Tango",
    "Techno",
    "Trance",
    "Trap",
    "Trópical",
    "Vallenato",
    "World Music"
];


let obj = {
    cancion: "", artista: "",
    genero: ""
}


const select_genre = document.getElementById("select_generos")
for (let index = 0; index < generos.length; index++) {
    let genre = generos[index]
    let option = document.createElement("option");
    option.value = genre;
    option.innerHTML = genre;
    select_genre.appendChild(option);
}
function SearchSong() {
    let inp = document.getElementById("search-song");
    if (inp.value.length < 3) {
        return
    }
    //ella&baila&sola
    let value = inp.value;
    const nombreCancionEncoded = encodeURIComponent(value);
    const url = `https://itunes.apple.com/search?term=${nombreCancionEncoded}&media=music`;

    fetch(url)
        .then(response => response.json())
        .then(data => {

            var box = document.querySelector("#song-suggestion-container");
            box.innerHTML = "";
            var songs = data.results.slice(0, 7);

            for (let index = 0; index < songs.length; index++) {
                var el = document.createElement("div");
                el.classList.add("song");
                el.innerHTML = `<span class='song-title'>${songs[index].trackName}</span><span>by ${songs[index].artistName}</span>`
                box.append(el);
                el.addEventListener("click", () => {
                    let fav = document.querySelector("#favorite-song");
                    fav.innerHTML = "";
                    let chosen = document.createElement("div");
                    chosen.classList.add("chosen-song");
                    chosen.innerHTML = `<h3>${songs[index].trackName}</h3><span>by ${songs[index].artistName}</span><br><img class='img-song' src="${songs[index].artworkUrl100}"<br>`
                    obj.cancion = songs[index].trackName;// aqui ponemos la cancion que emos clicado dentro de el apartado objeto , debtro de el elemento cancion.
                    let audio = document.createElement("audio");
                    audio.controls = true;
                    audio.src = songs[index].previewUrl;
                    chosen.appendChild(audio);
                    fav.append(chosen);
                });
            }

        })
        .catch(error => {
            console.error('Error:', error);
        });
}



function SearchArtist() {
    let inp = document.getElementById("search-artist");
    if (inp.value.length < 3) {
        return
    }
    let value = inp.value;
    const nombreArtistaEncoded = encodeURIComponent(value);
    const url = `https://itunes.apple.com/search?term=${nombreArtistaEncoded}&entity=musicArtist`;
    fetch(url).then(response => response.json())
        .then((data) => {
            let fav = document.querySelector("#artist-suggestion-container");
            fav.innerHTML = "";

            let artists = data.results.slice(0, 5);

            for (let posicion = 0; posicion < artists.length; posicion++) {
                let el = document.createElement("div");
                el.classList.add("artist");
                el.innerHTML = `<span>${artists[posicion].artistName}</span>`;
                el.addEventListener("click", () => {//aqui fem que cuan seleccioninin un artista pasi una funcio de flecha
                    let informacionartista = document.getElementById("favorite-artist");
                    informacionartista.innerHTML = ""
                    let chosen = document.createElement("div");
                    chosen.classList.add("chosen-artist")
                    chosen.innerHTML = `<h3 class="favorite-artist-name">${artists[posicion].artistName}</h3><span class='favorite-artist-genre'>Genre: ${artists[posicion].primaryGenreName}</span><a target='_blank' class='favorite-artist-link' href='${artists[posicion].artistLinkUrl}'>Ver artista</a>`;
                    obj.artista = artists[posicion].artistName// es lo mismo que lo otro pero con el artista.
                    informacionartista.append(chosen);


                });
                fav.append(el);

            }
        }).catch(error => console.log(error));


}

function reset() {
    var box = document.querySelector("#song-suggestion-container");
    box.innerHTML = "";
    let fav = document.querySelector("#favorite-song");
    fav.innerHTML = "";
    let fav2 = document.querySelector("#artist-suggestion-container");
    fav2.innerHTML = "";
    let informacionartista = document.getElementById("favorite-artist");
    informacionartista.innerHTML = "";

}



var send = document.getElementById("send-btn")

send.addEventListener("click", () => {
    if (obj.cancion != "" && obj.artista != "") {
        obj.genero = select_genre.value;

        document.querySelector("#loading").classList.remove('loading-hidden');
        document.querySelector("#loading").classList.add('loading-visible');
        reset();
        console.log(obj);
        fetch("/recomendacion", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(obj),// convertimos los tres elementos de obj en jason para que el servidor lo pueda leer, los elementos son las repuestas que nos da el usuario
        }).then(response => response.json()).then(data => {
            console.log(data);//muestra el resultado por consola, data es la respuesta
            document.querySelector("#loading").classList.add('loading-hidden');//quitamos animacion carga
            document.querySelector("#loading").classList.remove('loading-visible');
            mostrarrecomendacion(data);
            document.getElementById("search-artist").value = "";
            document.getElementById("search-song").value = "";
        }).catch(error => console.log(error));

    }

});



function mostrarrecomendacion(value) {
    let recomendation = document.querySelector("#recomendation");
    recomendation.innerHTML = "";
    obj.cancion = "";
    obj.artista = "";
    obj.genero = "";

    const nombreCancionEncoded = encodeURIComponent(value.cancion);//solo cojemos la cancion del resultado, i lo metemos en NombreCancionEncoded
    const url = `https://itunes.apple.com/search?term=${nombreCancionEncoded}&media=music`;

    fetch(url)//es una promesa, hace conexion con servidor i se queda esperando
        .then(response => response.json())//lo pasa a json, formato leible
        .then(data => {

            var box = document.querySelector("#recomendation");//coje el elemento div i lo mete en box
            box.innerHTML = "";
            var song = data.results[0]//porque queremos el primer resultado

            let chosen = document.createElement("div");//creamos elemento dic
            chosen.classList.add("chosen-song");//le ponemos una classe a div
            chosen.innerHTML = `<h3>${song.trackName}</h3><span>by ${song.artistName}</span><br><img class='img-song' src="${song.artworkUrl100}"<br>`
            let audio = document.createElement("audio");
            audio.controls = true;
            audio.src = song.previewUrl;
            chosen.appendChild(audio);
            box.append(chosen);

        })




        .catch(error => {
            console.error('Error:', error);
        });
}
