import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Tus claves de conexión
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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Referencias a las pantallas en HTML
const pantallaCarga = document.getElementById('pantalla-carga');
const pantallaVirgen = document.getElementById('pantalla-virgen');
const pantallaGrabado = document.getElementById('pantalla-grabado');

// Referencias a los botones e inputs
const inputUrl = document.getElementById('input-url');
const inputPin = document.getElementById('input-pin');
const btnGuardar = document.getElementById('btn-guardar');
const mensajeError = document.getElementById('mensaje-error');
const btnPlay = document.getElementById('btn-play');

// Obtenemos el ID del llavero desde la URL (ej: dehesa3d.es/?id=001)
const parametrosURL = new URLSearchParams(window.location.search);
const idLlavero = parametrosURL.get('id');

let pinReal = "";

// Función principal que se ejecuta al escanear
async function comprobarLlavero() {
    if (!idLlavero) {
        pantallaCarga.innerHTML = "<h1>Error</h1><p>No se ha detectado ningún ID. Acerca tu móvil al chip NFC del llavero.</p>";
        return;
    }

    try {
        const llaveroRef = ref(db, 'llaveros/' + idLlavero);
        const snapshot = await get(llaveroRef);

        if (snapshot.exists()) {
            const datos = snapshot.val();
            
            if (datos.estado === 'virgen') {
                // Guardamos el PIN internamente para validarlo al darle al botón
                pinReal = datos.pin; 
                pantallaCarga.classList.add('hidden');
                pantallaVirgen.classList.remove('hidden');
            } else if (datos.estado === 'grabado') {
                // Ya tiene canción o foto, preparamos el botón gigante
                btnPlay.href = datos.url;
                pantallaCarga.classList.add('hidden');
                pantallaGrabado.classList.remove('hidden');
            }
        } else {
            pantallaCarga.innerHTML = "<h1>Llavero no encontrado</h1><p>Este ID aún no ha sido dado de alta por el fabricante.</p>";
        }
    } catch (error) {
        pantallaCarga.innerHTML = "<h1>Error de conexión</h1><p>Comprueba tu conexión a internet.</p>";
        console.error(error);
    }
}

// Arrancamos la comprobación
comprobarLlavero();

// Lógica al pulsar "GUARDAR RECUERDO"
btnGuardar.addEventListener('click', async () => {
    const url = inputUrl.value.trim();
    const pinUsuario = inputPin.value.trim();

    if (!url || !pinUsuario) {
        mostrarError("Por favor, rellena el enlace y tu PIN.");
        return;
    }

    if (pinUsuario !== pinReal) {
        mostrarError("El PIN es incorrecto. Búscalo dentro del cartón grapado.");
        return;
    }

    btnGuardar.innerText = "Guardando...";
    btnGuardar.disabled = true;

    try {
        // Actualizamos Firebase enviando el pin de vuelta para cumplir tu nueva regla de seguridad
        await update(ref(db, 'llaveros/' + idLlavero), {
            estado: 'grabado',
            url: url,
            pin: pinUsuario 
        });

        // Todo correcto, recargamos la página para que salga la pantalla final roja
        window.location.reload();
    } catch (error) {
        mostrarError("Error al guardar en la base de datos.");
        btnGuardar.innerText = "GUARDAR RECUERDO";
        btnGuardar.disabled = false;
        console.error(error);
    }
});

function mostrarError(texto) {
    mensajeError.innerText = texto;
    mensajeError.style.display = "block";
}
