const express = require('express')
const bcrypt = require('bcrypt')
const cors = require('cors')

//Firebase
const { initializeApp } = require("firebase/app")
const { getFirestore, collection, getDoc, doc, getDocs, setDoc, updateDoc, deleteDoc, query, where } = require('firebase/firestore')

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

//Ruta para filtrar con id eventos
app.get('/filtrareventos', async(req,res) => {
    const { id_Registro } = req.body
    if (!id_Registro ) {
        res.json({
            'alert': 'Falta la ID'
        })
    }
    const tabla = collection(db, "eventos")
    const q = query(tabla, where("Registro", "==", id_Registro))
    const querylog = await getDocs(q)
    let returnData = []
    querylog.forEach((doc) => {
        returnData.push(doc.data())
    })
    res.json({
        'alert': 'success',
        'data': returnData
    })
})

//Ruta ára filtrar con id Puestos
app.get('/filtrarpuestos', async(req,res) => {
    const { id_Buscar } = req.body
    if (!id_Buscar ) {
        res.json({
            'alert': 'Falta la ID'
        })
    }
    const tabla = collection(db, "puestos")
    const q = query(tabla, where("id_dueño", "==", id_Buscar))
    const querylog = await getDocs(q)
    let returnData = []
    querylog.forEach((doc) => {
        returnData.push(doc.data())
    })
    res.json({
        'alert': 'success',
        'data': returnData
    })
})

//Ruta para Puestos
// Ruta para obtener todas las ventas
app.get('/traerpuestosaceptados', async (req, res) => {
    const tabla = collection (db, "puestos")
    const q = query(tabla, where("validacion", "==", "102"))
    const querylog = await getDocs(q)
    let returnData = []
    querylog.forEach((doc) => {
        returnData.push(doc.data())
    })
    res.json({
        'alert' : 'success',
        'data' : returnData
    })
})

app.get('/traerpuestos', async (req, res) => {
    try {
        const puestos = collection(db, "puestos")
        const arreglo = await getDocs(puestos)
        let returnData = []

        arreglo.forEach(puestos => {
            returnData.push(puestos.data())
        })
        res.json({
            'alert': 'success',
            'data': returnData
        });
    } catch (error) {
        res.json({
            'alert': 'error',
            'message': error.message || 'Error al obtener las ventas'
        })
    }
})


// Ruta para actualizar una venta
app.post('/actualizarpuesto', (req, res) => {
        const { id_puesto, Nombre_puesto, productos, url_imagen, validacion } = req.body
        const dataUpdate = {
            Nombre_puesto, 
            productos, 
            url_imagen,
            validacion 
        }
        if (!id_puesto || !Nombre_puesto || !productos || !url_imagen || !validacion ) {
            res.json({
                'alert': 'Faltan datos'
            })
        }

        // Actualizar la venta en Firebase
        updateDoc(doc(db, "puestos", id_puesto), dataUpdate)
            .then((response) => {
                res.json({
                    'alert' : 'success'
                })
            }).catch(error => {
                res.json({
                    'alert': 'error'
                })
            })
})


// Ruta para eliminar un puesto
app.post('/eliminarpuesto', (req, res) => {
        const { id_puesto } = req.body;
        if (!id_puesto) {
            res.json({
                'alert': 'Falta el ID de la venta'
            });
            return;
        }
        // Eliminar la venta de Firebase
        let puestoBorrado = doc(db, 'puestos', id_puesto);
        deleteDoc(puestoBorrado)
            .then((result) => {
                res.json({
                    'alert': 'Puesto Borrado'
                })
            }).catch((error) => {
                res.json({
                    'alert': 'error' || error.message
                })
            })
})

// Ruta para insertar un puesto
app.post('/insertarpuesto', async (req, res) => {
    const { Nombre_puesto, productos, url_imagen, id_dueño } = req.body
    const puestos = collection(db, "puestos")
    const lastidpuesto = await getDocs(puestos)
    let id_puesto1 = ""
    if(!lastidpuesto.empty){
        let returnData = []
        lastidpuesto.forEach((doc) => {
            returnData = (doc.data())
        })
        id_puesto1 = Number (returnData.id_puesto) + 1
    } else {
        id_puesto1 = 1
    }
    const id_puesto = "" + id_puesto1
    getDoc(doc(puestos, id_puesto)).then(puesto => {
        if( !id_puesto || !Nombre_puesto || !productos || !url_imagen || !id_dueño){
            res.json({
                'alert' : 'Faltan datos'
            })
            return
        }
        if (puesto.exists()) {
            res.json({
                'alert': 'El puesto ya existe en la BD'
            })
        } else {
            puestoData = {
                id_puesto,
                Nombre_puesto,
                productos,
                url_imagen,
                id_dueño,
                validacion : '101'
            }
            setDoc(doc(puestos, id_puesto), puestoData).then(() => {
                res.json({
                    'alert' : 'success'
                })
            }).catch(error => {
                res.json({
                    'alert' : error
                })
            })
        }
    })
})
//---------------------------Rutas para eventos --------------------------------

//Ruta para localizar ultima id 
app.get('/recuperarid', async(req, res) => {
    const { tabla_bd, campo_id } = req.body
    const tabla = collection(db, tabla_bd )
    const q = query(tabla, where(campo_id, "!=", "0"))
    const querylog = await getDocs(q)
    let returnData = []
    querylog.forEach((doc) => {
        returnData = (doc.data())
    })
    res.json({
        'alert': 'success',
        'data': returnData
    })
})

//Ruta para insertar un evento
app.post('/insertarevento', async(req, res) =>{
    const {Nombre_eve, Ponente, Descripcion, Registro, Fecha, Lugar, N_horas,T_horas,
           hora_evento, url_imagen } = req.body
    const eventos = collection (db, "eventos")
    const lastid = await getDocs(eventos)  
    let id_evento1 = ""
    if (!lastid.empty){
        let returnData = []
        lastid.forEach((doc) => {
            returnData = (doc.data())
        })
        id_evento1 = Number(returnData.id_evento) + 1
    } else{
        id_evento1 = 1
    }
    const id_evento = "" + id_evento1
    getDoc(doc(eventos, id_evento)).then(evento =>{
        if (!id_evento || !Nombre_eve || !Ponente || !Descripcion || !Registro || !Fecha || !Lugar || !N_horas || !T_horas || !hora_evento || !url_imagen) {
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
                id_evento,
                Nombre_eve,
                Ponente,
                Descripcion,
                Registro,
                Fecha,
                Lugar,
                N_horas,
                T_horas,
                hora_evento,
                url_imagen,
                validacion : '101'
            }
            //Se envia a Firebase
            setDoc(doc(eventos, id_evento), sendData).then(() =>{
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

//Ruta para traer los eventos que estan en "Aceptado"
app.get('/traereventosaceptados', async (req, res) => {
    const tabla = collection (db, "eventos")
    const q = query(tabla, where("validacion", "==", "102"))
    const querylog = await getDocs(q)
    let returnData = []
    querylog.forEach((doc) => {
        returnData.push(doc.data())
    })
    res.json({
        'alert' : 'success',
        'data' : returnData
    })
})

//Ruta para actualizar un evento
app.post('/actualizarevento', (req, res) => {
    const { id_evento,Nombre_eve, Ponente, Descripcion, Registro, Fecha, Lugar, 
            N_horas,T_horas, hora_evento, validacion, url_imagen } = req.body
    const dataUpdate = {
        Nombre_eve,
        Ponente, 
        Descripcion,
        Registro, 
        Fecha, 
        Lugar, 
        N_horas,
        T_horas,
        hora_evento,
        validacion,
        url_imagen
    }
    updateDoc(doc(db, "eventos", id_evento), dataUpdate)
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
    const { id_evento } = req.body
    let eventoBorrado = doc(db, 'eventos', id_evento)
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

//-----------------------------Ruta para Adminstradores -----------------------

//Ruta de Login para Administradores
app.post('/loginadmin', async(req, res) => {
    const { Correo, Contraseña } = req.body
    if (!Correo || !Contraseña ) {
        res.json({
            'alert': 'Faltan Datos'
        })
    }

    const usuarios = collection(db, "usuarios")
    const q = query(usuarios, where("Correo", "==", Correo))
    const querylog = await getDocs(q)
    if(querylog.empty){
        return res.status(400).json({ 'alert': 'Correo Incorrecto' })
    } else {
        let returnData = []
        querylog.forEach((doc) => {
            returnData = (doc.data())
        })
        if (returnData.Contraseña === Contraseña && returnData.Rol == 'adm') {
            res.json({
                'alert': 'success',
                'data': returnData
            })
        } else{
            if (returnData.Contraseña != Contraseña)
                return res.status(400).json({ 'alert': 'Contraseña Incorrecta' })
        }
    }
})

//-----------------------------Rutas para Usuarios-----------------------------

//Ruta de Login 
app.post('/login', async(req, res) => {
    const { Correo, Contraseña } = req.body
    if (!Correo || !Contraseña ) {
        res.json({
            'alert': 'Faltan Datos'
        })
    }

    const usuarios = collection(db, "usuarios")
    const q = query(usuarios, where("Correo", "==", Correo))
    const querylog = await getDocs(q)
    if(querylog.empty){
        return res.status(400).json({ 'alert': 'Correo Incorrecto' })
    } else {
        let returnData = []
        querylog.forEach((doc) => {
            returnData = (doc.data())
        })
        if (returnData.Contraseña === Contraseña && returnData.Rol == 'usu') {
            res.json({
                'alert': 'success',
                'data': returnData
            })
        } else{
            if (returnData.Contraseña != Contraseña)
                return res.status(400).json({ 'alert': 'Contraseña Incorrecta' })
        }
    }
})

// Ruta para insertar un usuario
app.post('/insertarusuario', async(req, res) => {
    const { Nombre_usuario, Apellido_usuario, Correo, Contraseña, 
            NUA , Rol } = req.body
    const usuarios = collection (db, "usuarios")
    const lastidusu = await getDocs(usuarios)
    let id_usuario1 = ""
    if(!lastidusu.empty){
        let returnData = []
        lastidusu.forEach((doc) => {
            returnData = (doc.data())
        })
        id_usuario1 = Number(returnData.id_usuario) + 1
    } else{
        id_usuario1 = 1
    }
    const id_usuario = "" + id_usuario1
    getDoc(doc(usuarios, id_usuario)).then(usuario => {
        if ( !id_usuario || !Nombre_usuario || !Apellido_usuario || !Correo || !Contraseña || !NUA || !Rol) {
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
            userData = {
                id_usuario,
                Nombre_usuario,
                Apellido_usuario,
                Correo,
                Contraseña,
                NUA,
                Rol
            }
            // Se envía a Firebase
            setDoc(doc(usuarios, id_usuario), userData).then(() => {
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
    arreglo.forEach(usuarios => {
        returnData.push(usuarios.data())
    })
    res.json({
        'alert': 'success',
        'data': returnData
    })
})

// Ruta para actualizar un usuario
app.post('/actualizarusuario', (req, res) => {
    const { id_usuario , Nombre_usuario, Apellido_usuario, Correo, Contraseña, 
            NUA } = req.body
    const dataUpdate = {
        Nombre_usuario,
        Apellido_usuario,
        Correo,
        Contraseña,
        NUA
    }
    updateDoc(doc(db, "usuarios", id_usuario), dataUpdate)
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

// Ruta para eliminar usuario
app.post('/eliminarusuario', (req, res) => {
    const { id_usuario } = req.body
    let usuarioBorrado = doc(db, 'usuarios', id_usuario)
    deleteDoc(usuarioBorrado)
        .then((result) => {
            res.json({
                'alert': 'usuario borrado'
            })
        }).catch((error) => {
            res.json({
                'alert': 'error'
            })
        })
})

//--------------------------- Ruta para Ventas ----------------------------------------------------------

//Puertos
const PORT = 5000
app.listen(PORT, () => {
    console.log(`Escuchando en el Puerto: ${PORT}`)
})