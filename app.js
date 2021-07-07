const debug = require('debug')('app:inicio'); // instalamos modulo debug "npm i debug" para trabajar la depuración de manera mas sencilla
// const dbDebug = require('debug')('app:database');
// requerimos express
const express = require('express');
// instanciamos express
const app = express(); // instalamos Joi "npm i @hapi/joi" para utilizar validaciones
const Joi = require('@hapi/joi');
// const logger = require('./logger');
const morgan = require('morgan'); // instalamos modulo morgan "npm i morgan", para trabajar visualizando los estados de las peticiones HTTP
const config = require('config'); // instalamos modulo config "npm i config", para configurar nuestra conexión a la DB

// middleware JSON desde express
app.use(express.json());
// middleware urlencoded desde express
app.use(express.urlencoded({ extended: true }));
// el middleware static te permite acceder a cualquier archivo dentro de la carpeta 'public'
// de forma directa, por ejemplo localhost:3000/prueba.txt
app.use(express.static('public'));

// configuración de entornos
console.log('La aplicación: ' + config.get('nombre'));
console.log('Base de datos server: ' + config.get('configDB.host'));

// uso de un middleware de tercero, morgan
// este middleware nos muestra por consola el estado de las peticiones get/post, etc. para 
// trabajar con las peticiones http mejor
if (app.get('env') === 'development') {
    app.use(morgan('tiny'));
    // console.log('Morgan habilitado...');
    debug('Morgan está habilitado');
}

// trabajos con la base de datos
// dbDebug('Conectando con la db...');

// middleware personalizado
// app.use(logger);
// app.use(function(req, res, next) {
//     console.log('Autenticando...');
//     next(); // cuando utilizamos next se va pasando el mismo "req" de una función a otra
// });

const usuarios = [
    { id: 1, nombre: 'Jose' },
    { id: 2, nombre: 'Pedro' },
    { id: 3, nombre: 'Remedios' },
];


/***************************/
/* PETICIONES HTTP CON GET */
/***************************/

// petición de datos con GET
app.get('/', (req, res) => {
    res.send('Hola mundo desde Express.');
});
app.get('/api/usuarios', (req, res) => {
    res.send(['Juan', 'Pedro', 'Ana']);
});
app.get('/api/usuarios/:id', (req, res) => {
    // res.send(req.params.id);
    let usuario = existeUsuario(req.params.id);
    if (!usuario) res.status(404).send('El usuario no fué encontrado');
    res.send(usuario);
});
app.get('/api/usuarios/:year/:mes', (req, res) => {
    // res.send(`Year: ${req.params.year}, Mes: ${req.params.mes}`);
    res.send(req.params);
});
app.get('/api/usuarios/:year/:mes', (req, res) => {
    res.send(req.query); // ?sexo=M  <-- podemos añadir en el navegador esto y añadiriamos a través de la query parámetros http://localhost:3000/api/usuarios/1987/10?sexo=M
});

/****************************/
/* PETICIONES HTTP CON POST */
/****************************/

// envío de datos con POST
app.post('/api/usuarios', (req, res) => {
    const { error, value } = validarUsuario(req.body.nombre);

    if (!error) {
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    } else {
        res.status(400).send(error.details[0].message);
    }
});


/***************************/
/* PETICIONES HTTP CON PUT */
/***************************/

// actualización
app.put('/api/usuarios/:id', (req, res) => {
    // encontrar si existe el objeto usuario que voy a modificar
    let usuario = existeUsuario(req.params.id);
    if (!usuario) {
        res.status(404).send('El usuario no fué encontrado');
        return;
    }

    const { error, value } = validarUsuario(req.body.nombre);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }

    usuario.nombre = value.nombre;
    res.send(usuario);
});


/******************************/
/* PETICIONES HTTP CON DELETE */
/******************************/

// borrado de datos
app.delete('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id);
    if (!usuario) {
        res.status(404).send('El usuario no fué encontrado');
        return;
    }

    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1);

    res.send(usuarios);
});

// funciones propias
function existeUsuario(id) {
    return usuarios.find(user => user.id === parseInt(id));
}

function validarUsuario(nom) {
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });
    return schema.validate({ nombre: nom });
}


// creación de una variable de entorno, si no existe PORT nos aplicará el valor 3000
const port = process.env.PORT || 3000;


// puerto donde se escucharán las peticiones
app.listen(port, () => {
    console.log(`Escuchando peticiones en el puerto ${port}...`);
});