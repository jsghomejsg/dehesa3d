import { diccionarioFrases, obtenerFraseDinamica } from './frases.js';
// Importamos Firebase directamente desde sus servidores (sin instalaciones raras)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// 1. PEGA AQUÍ LOS DATOS DE TU PROYECTO DE FIREBASE
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    databaseURL: "https://TU_PROYECTO-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "TU_PROYECTO",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
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

// 2. COMPROBACIÓN EN LA NUBE AL ENTRAR
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
            // El llavero ya está registrado en Firebase
            const datos = snapshot.val();
            estadoRegistro = 'registrado';
            cajaMensaje.innerText = `Hola de nuevo, ${datos.nombre}. ${obtenerFraseDinamica('hora')}`;
        } else {
            // El llavero es nuevo y virgen
            estadoRegistro = 'pidiendo_nombre';
            cajaMensaje.innerText = "Vaya, un chip NFC virgen. ¿Cómo te llamas antes de que me empiece a dar igual?";
            inputTexto.placeholder = "Escribe tu nombre aquí...";
        }
    } catch (error) {
        console.error(error);
        cajaMensaje.innerText = "Error de conexión con Firebase. Alguien ha roto la base de datos.";
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
    if (estadoRegistro !== 'registrado') return; // Bloquea los botones si no está registrado
    const lista = diccionarioFrases[categoria];
    if (lista && lista.length > 0) {
        const randomIndex = Math.floor(Math.random() * lista.length);
        cajaMensaje.innerText = lista[randomIndex];
        animarMascota(claseAnimacion);
    }
}

// Eventos de los botones
document.getElementById('btn-inicio').addEventListener('click', () => mostrarFrase('inicio', 'animar-inicio'));
document.getElementById('btn-motivacion').addEventListener('click', () => mostrarFrase('motivacion', 'animar-motivacion'));
document.getElementById('btn-estado').addEventListener('click', () => {
    if (estadoRegistro !== 'registrado') return;
    cajaMensaje.innerText = obtenerFraseDinamica('hora');
    animarMascota('animar-estado');
});
document.getElementById('btn-trabajo').addEventListener('click', () => mostrarFrase('trabajo', 'animar-trabajo'));

// 3. SECUENCIA DE REGISTRO CON EL BOTÓN ENVIAR
btnEnviar.addEventListener('click', async () => {
    const texto = inputTexto.value.trim();
    if (texto === "") return;

    if (estadoRegistro === 'pidiendo_nombre') {
        nombreTemporal = texto;
        estadoRegistro = 'pidiendo_pin';
        cajaMensaje.innerText = `Vale, ${nombreTemporal}. Ahora invéntate un PIN para que nadie reclame este muñeco en la nube.`;
        inputTexto.value = "";
        inputTexto.placeholder = "Escribe un PIN numérico...";
        inputTexto.type = "password"; // Oculta el texto como si fuera una contraseña
        return;
    }

    if (estadoRegistro === 'pidiendo_pin') {
        const pin = texto;
        cajaMensaje.innerText = "Grabando a fuego en la nube...";
        
        try {
            // Guardamos nombre y PIN permanentemente en Firebase bajo el ID del llavero
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
            cajaMensaje.innerText = "Error al guardar en Firebase. Revisa los permisos.";
        }
        return;
    }

    // Modo normal para insultar después de estar registrado
    if (estadoRegistro === 'registrado') {
        mostrarFrase('ignorantes', 'animar-ignorar');
        inputTexto.value = "";
    }
});

// Easter Egg (solo funciona si ya está registrado)
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
