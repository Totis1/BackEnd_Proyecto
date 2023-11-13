const express = require('express')
const bcrypt = require('bcrypt')
const cors = require('cors')

//Firebase
const { initializeApp } = require("firebase/app")
const { getFirestore, collection, getDoc, doc, getDocs, setDoc, updateDoc, deleteDoc } = require('firebase/firestore')

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

//Rutas

//Ruta para insertar un evento
app.post('/insertarevento', (req, res) =>{
    const {Nombre_eve, Ponente, Descripcion, Fecha, Lugar, Horas} = req.body
    const eventos = collection (db, "eventos")
    getDoc(doc(eventos, Nombre_eve)).then(evento =>{
        if (!Nombre_eve || !Ponente || !Descripcion || !Fecha || !Lugar || !Horas) {
            res.json({
                'alert': 'Faltan datos'
            })
            return
        }
        if(evento.exists()){
            res.json({
                'alert' : 'El evento ya existe en la BD'
            })
        } else {
            sendData = {
                Nombre_eve,
                Ponente,
                Descripcion,
                Fecha,
                Lugar,
                Horas
            }
            //Se envia a Firebase
            setDoc(doc(eventos, Nombre_eve), sendData).then(() =>{
                res.json({
                    'alert': 'success'
                })
            }).catch(error => {
                res.json({
                    'alert' : error
                })
            })
        }
    })
})

//Ruta para traer los eventos
app.get('/traereventos', async(req, res) => {
    const eventos = collection(db, "eventos")
    const arreglo = await getDocs(eventos)
    let returnData = []
    arreglo.forEach(eventos => {
        returnData.push(eventos.data())
    })
    res.json({
        'alert': 'success',
        'data' : returnData
    })
})

//Ruta para actualizar un evento
app.post('/actualizarevento', (req, res) => {
    const { Nombre_eve, Ponente, Descripcion, Fecha, Lugar, Horas } = req.body
    const dataUpdate = {
        Ponente, 
        Descripcion, 
        Fecha, 
        Lugar, 
        Horas
    }
    updateDoc(doc(db, "eventos", Nombre_eve), dataUpdate)
        .then((response) => {
            res.json({
                'alert': 'success'
            })
        }).catch(error => {
            res.json({
                'alert': 'error'
            })
        })
})

//Ruta para eliminar evento
app.post('/eliminarevento', (req, res) =>{
    const { Nombre_eve } = req.body
    let eventoBorrado = doc(db, 'eventos', Nombre_eve)
    deleteDoc(eventoBorrado)
        .then((result) => {
            res.json({
                'alert' : 'evento borrado'
            })
        }).catch((error) => {
            res.json({
                'alert' : 'error'
            })
        })
})

//Puertos
const PORT = 5000
app.listen(PORT, () => {
    console.log(`Escuchando en el Puerto: ${PORT}`)
})