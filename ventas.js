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
const PORT = 5010
app.listen(PORT, () => {
    console.log(`Escuchando en el Puerto: ${PORT}`)
})



// Ruta para insertar una venta
app.post('/new-Ventas', (req, res) => {
    const { Nombre_puesto, productos } = req.body;
    const ventas = collection(db, "ventas");

    if (!Nombre_puesto || !productos || !productos.length) {
        res.json({
            'alert': 'Faltan datos'
        });
        return;
    }
    const ventaData = {
        Nombre_puesto,
        productos
    };
    addDoc(ventas, ventaData)
        .then(() => {
            res.json({
                'alert': 'success'
            });
        })
        .catch(error => {
            res.json({
                'alert': error.message || 'Error al agregar la venta'
            });
        });
});

// Ruta para traer las ventas
app.get('/get-ventas', async (req, res) => {
    const ventas = collection(db, "ventas");
    const snapshot = await getDocs(ventas);
    const returnData = [];
    snapshot.forEach(venta => {
        returnData.push(venta.data());
    });
    res.json({
        'alert': 'success',
        'data': returnData
    });
});

// Ruta para actualizar una venta
app.post('/update-ventas', (req, res) => {
    const { id, Nombre_puesto, productos } = req.body;

    if (!id || !Nombre_puesto || !productos || !productos.length) {
        res.json({
            'alert': 'Faltan datos'
        });
        return;
    }
    const ventaData = {
        Nombre_puesto,
        productos
    };

    // Actualizar la venta en Firebase
    updateDoc(doc(db, "ventas", id), ventaData)
        .then(() => {
            res.json({
                'alert': 'success'
            });
        })
        .catch(error => {
            res.json({
                'alert': 'error',
                'message': error.message || 'Error al actualizar la venta'
            });
        });
});

// Ruta para eliminar venta
app.post('/eliminarventa', (req, res) => {
    const { id } = req.body;

    if (!id) {
        res.json({
            'alert': 'Falta el ID de la venta'
        });
        return;
    }

    // Eliminar la venta de Firebase
    deleteDoc(doc(db, 'ventas', id))
        .then(() => {
            res.json({
                'alert': 'Venta eliminada'
            });
        })
        .catch(() => {
            res.json({
                'alert': 'Error al eliminar la venta'
            });
        });
});
