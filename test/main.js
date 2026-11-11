// Importamos la conexión a la base de datos de Google
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// IMPORTAMOS EL DICCIONARIO MASIVO DE FRASES
import { diccionarioFrases } from "./frases.js";

// ========================================================
// CONFIGURACIÓN DE FIREBASE (CON LA URL DE TU REGIÓN)
// ========================================================
const firebaseConfig = {
    apiKey: "AIzaSyAImoyX-LE-wN6iG07q7n3x0XrZoc4",
    authDomain: "mascota-borde.firebaseapp.com",
    databaseURL: "https://mascota-borde-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mascota-borde",
    storageBucket: "mascota-borde.appspot.com",
    messagingSenderId: "276796896046",
    appId: "1:276796896046:web:3a56b4d84s19843238c9a4",
    measurementId: "G-TH173G62NT"
};

// Conectamos con la nube
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Usamos las categorías directamente desde el diccionario masivo importado
const frasesInicio = diccionarioFrases.inicio;
const frasesMotivacion = diccionarioFrases.motivacion;
const frasesEstado = diccionarioFrases.estado;
const frasesTrabajo = diccionarioFrases.trabajo;
const frasesIgnorar = diccionarioFrases.ignorar;

const cajaMensaje = document.getElementById('message-box');
let idFigura = null;

// Cuando la página carga en el móvil
window.onload = async function() {
    const parametros = new URLSearchParams(window.location.search);
    idFigura = parametros.get('id');
    
    if (!idFigura) {
        cajaMensaje.innerText = "Error: Escanéame con el chip NFC.";
        return;
    }

    try {
        // Comprobamos en Firebase si este muñeco ya tiene dueño
        const dbRef = ref(db, 'mascotas/' + idFigura);
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
            // Ya tiene dueño: mostramos los botones de interacción
            const datos = snapshot.val();
            document.getElementById('interact-panel').classList.add('activo');
            cajaMensaje.innerText = `Ugh... Hola otra vez, ${datos.nombre}. ` + frasesInicio[Math.floor(Math.random() * frasesInicio.length)];
        } else {
            // Es nuevo: mostramos el panel para registrar nombre y PIN
            document.getElementById('auth-panel').classList.add('activo');
            cajaMensaje.innerText = "Soy nuevo. Registra tu nombre y un PIN si quieres que hablemos.";
        }
    } catch (error) {
        console.error("Error al conectar con la base de datos:", error);
        cajaMensaje.innerText = "Error de conexión con el servidor.";
    }
};

// Botón para registrar un nuevo dueño
document.getElementById('btn-registrar').addEventListener('click', async () => {
    const nombre = document.getElementById('owner-name').value;
    const pin = document.getElementById('owner-pin').value;
    
    if(!nombre || !pin) {
        cajaMensaje.innerText = "Rellena los dos datos, que no soy adivino.";
        return;
    }
    
    // Guardamos los datos en la base de datos de Firebase
    await set(ref(db, 'mascotas/' + idFigura), {
        nombre: nombre,
        pin: pin
    });
    
    // Ocultamos el registro y mostramos los botones
    document.getElementById('auth-panel').classList.remove('activo');
    document.getElementById('interact-panel').classList.add('activo');
    cajaMensaje.innerText = `Vale ${nombre}, ya soy tuyo. ¿Y ahora qué?`;
});

// Eventos para los botones de interacción
document.getElementById('btn-motivar').addEventListener('click', () => cambiarTexto(frasesMotivacion));
document.getElementById('btn-estado').addEventListener('click', () => cambiarTexto(frasesEstado));
document.getElementById('btn-trabajo').addEventListener('click', () => cambiarTexto(frasesTrabajo));

// Botón de enviar texto (El truco del pasota)
document.getElementById('btn-enviar').addEventListener('click', () => {
    const input = document.getElementById('user-text');
    if (input.value.trim() === "") {
        cajaMensaje.innerText = "¿Me mandas un texto vacío? Eres un genio.";
        return;
    }
    cambiarTexto(frasesIgnorar);
    input.value = ""; 
});

function cambiarTexto(arrayFrases) {
    const indice = Math.floor(Math.random() * arrayFrases.length);
    cajaMensaje.innerText = arrayFrases[indice];
}
