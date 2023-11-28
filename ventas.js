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

// Ruta para obtener todas las ventas
app.get('/get-ventas', async (req, res) => {
    try {
        const ventasCollection = collection(db, "ventas");
        const snapshot = await getDocs(ventasCollection);
        const returnData = [];

        snapshot.forEach(venta => {
            returnData.push({ id: venta.id, ...venta.data() });
        });

        res.json({
            'alert': 'success',
            'data': returnData
        });
    } catch (error) {
        res.json({
            'alert': 'error',
            'message': error.message || 'Error al obtener las ventas'
        });
    }
});


// Ruta para actualizar una venta
app.post('/update-ventas', async (req, res) => {
    try {
        const { id, Nombre_puesto, Nombre_producto, Precio_producto } = req.body;

        if (!id || !Nombre_puesto || !Nombre_producto || !Precio_producto) {
            res.json({
                'alert': 'Faltan datos'
            });
            return;
        }

        // Actualizar la venta en Firebase
        const ventasCollection = collection(db, "ventas");
        const ventaData = { Nombre_puesto, productos: [{ Nombre_producto, Precio_producto }] };
        await updateDoc(doc(ventasCollection, id), ventaData);

        res.json({
            'alert': 'success'
        });
    } catch (error) {
        res.json({
            'alert': 'error',
            'message': error.message || 'Error al actualizar la venta'
        });
    }
});


// Ruta para eliminar una venta
app.post('/eliminarventa', async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            res.json({
                'alert': 'Falta el ID de la venta'
            });
            return;
        }

        // Eliminar la venta de Firebase
        const ventasCollection = collection(db, 'ventas');
        await deleteDoc(doc(ventasCollection, id));

        res.json({
            'alert': 'Venta eliminada'
        });
    } catch (error) {
        res.json({
            'alert': 'error',
            'message': error.message || 'Error al eliminar la venta'
        });
    }
});


// Ruta para insertar una venta
app.post('/new-Ventas', async (req, res) => {
    try {
        const { Nombre_puesto, Nombre_producto, Precio_producto } = req.body;

        if (!Nombre_puesto || !Nombre_producto || !Precio_producto) {
            res.json({
                'alert': 'Faltan datos'
            });
            return;
        }

        // Obtiene el valor actual del contador de puestos
        const countersCollection = collection(db, "counters");
        const counterDoc = doc(countersCollection, "puestos");
        const counterSnapshot = await getDoc(counterDoc);
        const currentCount = counterSnapshot.data().count;

        // Agrega el puesto con el ID incremental
        const puestosCollection = collection(db, "puestos");
        const puestoData = { idPuesto: currentCount + 1, Nombre_puesto };
        const newPuestoDocRef = await addDoc(puestosCollection, puestoData);

        // Actualiza el contador de puestos para el próximo registro
        await updateDoc(counterDoc, { count: currentCount + 1 });

        // Agrega el producto al puesto
        const productosCollection = collection(db, "puestos", newPuestoDocRef.id, "productos");
        const productoData = { Nombre_producto, Precio_producto };
        await addDoc(productosCollection, productoData);

        res.json({
            'alert': 'success'
        });
    } catch (error) {
        res.json({
            'alert': error.message || 'Error al agregar la venta'
        });
    }
});


