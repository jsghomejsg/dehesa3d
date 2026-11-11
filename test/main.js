import { diccionarioFrases, obtenerFraseDinamica } from './frases.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Tus claves reales de Firebase integradas
const firebaseConfig = {
  apiKey: "AIzaSyBiKAnyUmoYxlE-wwGi6B7q7n3xOXrZoc4",
  authDomain: "mascota-borde.firebaseapp.com",
  databaseURL: "https://mascota-borde-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mascota-borde",
  storageBucket: "mascota-borde.firebasestorage.app",
  messagingSenderId: "276796896045",
  appId: "1:276796896045:web:3a56b4d04a19843238d9a4",
  measurementId: "G-TH173G62NT"
};

// Inicializamos la conexión a la nube
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const cajaMensaje = document.getElementById('caja-mensaje');
const imgMascota = document.getElementById('mascota-img');
const contenedorMascota = document.getElementById('mascota-clickable');
const inputTexto = document.getElementById('user-text');
const btnEnviar = document.getElementById('btn-enviar');

let clicksRapidos = 0;
let temporizadorClicks = null;

// Obtenemos el ID del llavero desde la URL (ej: dehesa3d.es/test/?id=001)
const parametrosURL = new URLSearchParams(window.location.search);
const idLlavero = parametrosURL.get('id');

let estadoRegistro = 'comprobando';
let nombreTemporal = "";

// COMPROBACIÓN EN LA NUBE AL ENTRAR
async function comprobarLlavero() {
    if (!idLlavero) {
        cajaMensaje.innerText = "Error: Este muñeco no tiene un ID asignado en su chip NFC. Qué desastre de fabricante.";
        return;
    }

    cajaMensaje.innerText = "Consultando el cerebro central en la nube...";
    
    try {
        const llaveroRef = ref(db, 'llaveros/' + idLlavero);
        const snapshot = await get(llaveroRef);

        if (snapshot.exists()) {
            const datos = snapshot.val();
            estadoRegistro = 'registrado';
            cajaMensaje.innerText = `Hola de nuevo, ${datos.nombre}. ${obtenerFraseDinamica('hora')}`;
        } else {
            estadoRegistro = 'pidiendo_nombre';
            cajaMensaje.innerText = "Vaya, un chip NFC virgen. ¿Cómo te llamas antes de que me empiece a dar igual?";
            inputTexto.placeholder = "Escribe tu nombre aquí...";
        }
    } catch (error) {
        console.error(error);
        cajaMensaje.innerText = "Error de conexión con Firebase. ¿Has puesto los permisos de lectura/escritura en true?";
    }
}

comprobarLlavero();

function animarMascota(claseAnimacion) {
    if (!imgMascota) return;
    imgMascota.className = "";
    void imgMascota.offsetWidth; 
    imgMascota.classList.add(claseAnimacion);
}

function mostrarFrase(categoria, claseAnimacion) {
    if (estadoRegistro !== 'registrado') return; 
    const lista = diccionarioFrases[categoria];
    if (lista && lista.length > 0) {
        const randomIndex = Math.floor(Math.random() * lista.length);
        cajaMensaje.innerText = lista[randomIndex];
        animarMascota(claseAnimacion);
    }
}

document.getElementById('btn-inicio').addEventListener('click', () => mostrarFrase('inicio', 'animar-inicio'));
document.getElementById('btn-motivacion').addEventListener('click', () => mostrarFrase('motivacion', 'animar-motivacion'));
document.getElementById('btn-estado').addEventListener('click', () => mostrarFrase('estado', 'animar-estado'));
document.getElementById('btn-trabajo').addEventListener('click', () => mostrarFrase('trabajo', 'animar-trabajo'));

btnEnviar.addEventListener('click', async () => {
    const texto = inputTexto.value.trim();
    if (texto === "") return;

    if (estadoRegistro === 'pidiendo_nombre') {
        nombreTemporal = texto;
        estadoRegistro = 'pidiendo_pin';
        cajaMensaje.innerText = `Vale, ${nombreTemporal}. Ahora invéntate un PIN para que nadie reclame este muñeco en la nube.`;
        inputTexto.value = "";
        inputTexto.placeholder = "Escribe un PIN numérico...";
        inputTexto.type = "password"; 
        return;
    }

    if (estadoRegistro === 'pidiendo_pin') {
        const pin = texto;
        cajaMensaje.innerText = "Grabando a fuego en la nube...";
        
        try {
            await set(ref(db, 'llaveros/' + idLlavero), {
                nombre: nombreTemporal,
                pin: pin
            });
            
            estadoRegistro = 'registrado';
            inputTexto.value = "";
            inputTexto.type = "text";
            inputTexto.placeholder = "Dile algo absurdo...";
            cajaMensaje.innerText = `Perfecto, ${nombreTemporal}. Registrada en la base de datos oficial. Ya puedes tocar los botones.`;
            animarMascota('animar-estado');
        } catch (error) {
            cajaMensaje.innerText = "Error al guardar en Firebase. Revisa las reglas de la base de datos.";
        }
        return;
    }

    if (estadoRegistro === 'registrado') {
        cajaMensaje.innerText = "He leído lo que has escrito, pero he decidido ignorarlo por completo. Usa los botones y déjame en paz.";
        animarMascota('animar-enfado');
        inputTexto.value = "";
    }
});

contenedorMascota.addEventListener('click', () => {
    if (estadoRegistro !== 'registrado') return;
    clicksRapidos++;
    clearTimeout(temporizadorClicks);

    if (clicksRapidos >= 3) {
        cajaMensaje.innerText = "¡¿QUIERES PARAR DE TOCARME LA CARA YA, PESADO?! ¡QUE NO SOY UNA PANTALLA TÁCTIL DE FAST FOOD!";
        animarMascota('animar-enfado');
        clicksRapidos = 0;
    } else {
        temporizadorClicks = setTimeout(() => {
            clicksRapidos = 0;
        }, 700);
    }
});
