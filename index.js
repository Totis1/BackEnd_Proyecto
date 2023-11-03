const express = require('express')
const bcrypt = require('bcrypt')
const cors = require('cors')

//Firebase
const { initializeApp } = require("firebase/app")
const { getFirestore } = require('firebase/firestore')

require('dotenv/config')

//Configuracion de Firabase
const firebaseConfig = {
    apiKey: "AIzaSyCLYWCuZlr4tLuZMQ6ZcOt063x6UtcOF34",
    authDomain: "db-eyv-fime.firebaseapp.com",
    projectId: "db-eyv-fime",
    storageBucket: "db-eyv-fime.appspot.com",
    messagingSenderId: "425676146910",
    appId: "1:425676146910:web:5e802d5bad343617249a4f",
    measurementId: "G-BW9MTZ05F1"
};

//inicializamos firebase
const firebase = initializeApp(firebaseConfig)
const db = getFirestore()

//inicializamos el servidor
const app = express()

//opciones de CORS
const corsOptions = {
    "origin": "*",
    "optionSuccessStatus": 200
}

//configuracion del servidor
app.use(express.json())
app.use(cors(corsOptions))

//Puertos
const PORT = 5000
app.listen(PORT, () => {
    console.log(`Escuchando en el Puerto: ${PORT}`)
})