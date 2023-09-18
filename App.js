const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { stringify } = require('querystring');
require('dotenv').config({ path: 'variables.env' });//connectar con archivo variables.env
//conectem servidor
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });//aqui estaba el link que no queremos que se vea en github y por eso emos creado la carpeta variables.env para darle el valor de todo el link a "DB"
const db = mongoose.connection;


db.on('error', (error) => console.error(error));// equivale al .catch 
db.once('open', () => console.log('Conexion establecida !!!'));// .once equivale al .then porque esta funcion ya viene con el mongoose

const objetoEsquema = new mongoose.Schema({ //diem que les dades que guardem son tipo text
    cancion: String,
    artista: String,
    genero: String
});

const Objeto = mongoose.model('Objeto', objetoEsquema);// el primer Objeto no es el mateix que 'Objeto'


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')))//
//routing 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "Index.html"));
})

app.post("/recomendacion", async (req, res) => {
    let usuarioObj = req.body;
    console.log(usuarioObj);

    let objetoAEnviar;

    try {
        // Primero, buscar una canción similar o diferente
        let mismogenero = await Objeto.find({ genero: usuarioObj.genero });

        if (mismogenero && mismogenero.length > 0) {
            let mismoartista = mismogenero.filter(obj => obj.artista === usuarioObj.artista);

            if (mismoartista && mismoartista.length > 0) {
                let difcancion = mismoartista.filter(obj => obj.cancion !== usuarioObj.cancion);

                if (difcancion && difcancion.length > 0) {
                    objetoAEnviar = difcancion[Math.floor(Math.random() * difcancion.length)];
                } else {
                    objetoAEnviar = mismoartista[Math.floor(Math.random() * mismoartista.length)];
                }
            } else {
                objetoAEnviar = mismogenero[Math.floor(Math.random() * mismogenero.length)];
            }
        } else {
            let todos = await Objeto.find();
            objetoAEnviar = todos[Math.floor(Math.random() * todos.length)];
        }


        // Asegurarse de que la canción enviada no sea la misma que la recibida
        if (objetoAEnviar && objetoAEnviar.cancion !== usuarioObj.cancion) {
            res.json(objetoAEnviar);
        } else {
            // Si la canción es la misma, buscar una canción cualquiera que no sea la recibida
            let todos = await Objeto.find({ cancion: { $ne: usuarioObj.cancion } });
            objetoAEnviar = todos[Math.floor(Math.random() * todos.length)];
            if (objetoAEnviar) {
                res.json(objetoAEnviar);
            } else {
                res.status(500).send('No se pudo encontrar un objeto para enviar');
            }
        }
        // Luego, guardar el nuevo objeto
        let nuevoObjeto = new Objeto(usuarioObj);
        await nuevoObjeto.save();

    } catch (error) {
        console.error(error);
        res.status(500).send('Error al procesar la solicitud');
    }

});
const PORT = process.env.PORT || 3000;//usa una variable que se llame PORT sino existe usara la 3000
app.listen(PORT, () => {
    console.log("Servidor corriendo");
});
//cambio