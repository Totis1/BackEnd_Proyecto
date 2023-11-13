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

// Ruta para insertar un usuario
app.post('/insertarusuario', (req, res) => {
    const { Nombre_usuario, Correo, Contraseña, Edad, Rol } = req.body
    const usuarios = collection(db, "usuarios")
    getDoc(doc(usuarios, Nombre_usuario)).then(usuario => {
        if (!Nombre_usuario || !Correo || !Contraseña || !Edad || !Rol) {
            res.json({
                'alert': 'Faltan datos'
            })
            return
        }
        if (usuario.exists()) {
            res.json({
                'alert': 'El usuario ya existe en la BD'
            })
        } else {
            const userData = {
                Nombre_usuario,
                Correo,
                Contraseña,
                Edad,
                Rol
            }
            // Se envía a Firebase
            setDoc(doc(usuarios, Nombre_usuario), userData).then(() => {
                res.json({
                    'alert': 'success'
                })
            }).catch(error => {
                res.json({
                    'alert': error
                })
            })
        }
    })
})

// Ruta para traer los usuarios
app.get('/traerusuarios', async (req, res) => {
    const usuarios = collection(db, "usuarios")
    const arreglo = await getDocs(usuarios)
    let returnData = []
    arreglo.forEach(usuario => {
        returnData.push(usuario.data())
    })
    res.json({
        'alert': 'success',
        'data': returnData
    })
})

// Ruta para actualizar un usuario
app.post('/actualizarusuario', (req, res) => {
    const { Nombre_usuario, Correo, Contraseña, Edad, Rol } = req.body
    const dataUpdate = {
        Correo,
        Contraseña,
        Edad,
        Rol
    }
    updateDoc(doc(db, "usuarios", Nombre_usuario), dataUpdate)
        .then(() => {
            res.json({
                'alert': 'success'
            })
        }).catch(error => {
            res.json({
                'alert': 'error'
            })
        })
})

// Ruta para eliminar usuario
app.post('/eliminarusuario', (req, res) => {
    const { Nombre_usuario } = req.body
    let usuarioBorrado = doc(db, 'usuarios', Nombre_usuario)
    deleteDoc(usuarioBorrado)
        .then(() => {
            res.json({
                'alert': 'usuario borrado'
            })
        }).catch(() => {
            res.json({
                'alert': 'error'
            })
        })
})
