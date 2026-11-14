// Importamos módulos de la versión 10, incluyendo ahora Firebase Auth
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Referencias HTML
const pantallaCarga = document.getElementById('pantalla-carga');
const pantallaLogin = document.getElementById('pantalla-login');
const pantallaConfig = document.getElementById('pantalla-config');
const pantallaGrabado = document.getElementById('pantalla-grabado');

const btnLogin = document.getElementById('btn-login');
const btnGuardar = document.getElementById('btn-guardar');
const inputUrl = document.getElementById('input-url');
const btnPlay = document.getElementById('btn-play');

const parametrosURL = new URLSearchParams(window.location.search);
const idLlavero = parametrosURL.get('id');

let usuarioActual = null;

async function iniciarComprobacion() {
    if (!idLlavero) {
        pantallaCarga.innerHTML = "<h1>Error</h1><p>Acerca tu móvil al chip NFC del llavero.</p>";
        return;
    }

    try {
        const llaveroRef = ref(db, 'llaveros/' + idLlavero);
        const snapshot = await get(llaveroRef);

        if (snapshot.exists()) {
            // EL LLAVERO YA FUE CONFIGURADO POR ALGUIEN
            const datos = snapshot.val();
            if (datos.estado === 'grabado') {
                btnPlay.href = datos.url;
                pantallaCarga.classList.add('hidden');
                pantallaGrabado.classList.remove('hidden');
            }
        } else {
            // MAGIA: El llavero NO EXISTE en Firebase. Es virgen de fábrica.
            pantallaCarga.classList.add('hidden');
            pantallaLogin.classList.remove('hidden');
        }
    } catch (error) {
        pantallaCarga.innerHTML = "<h1>Error de red</h1><p>Comprueba tu conexión a internet.</p>";
        console.error(error);
    }
}

// Botón de iniciar sesión con Google
btnLogin.addEventListener('click', async () => {
    try {
        const resultado = await signInWithPopup(auth, provider);
        usuarioActual = resultado.user;
        
        // Sesión iniciada correctamente, pasamos a pedir la URL
        pantallaLogin.classList.add('hidden');
        pantallaConfig.classList.remove('hidden');
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert("Hubo un problema al conectar con Google. Inténtalo de nuevo.");
    }
});

// Botón para guardar en base de datos
btnGuardar.addEventListener('click', async () => {
    let url = inputUrl.value.trim();

    if (!url) {
        alert("Por favor, introduce un enlace.");
        return;
    }

    // Prevención de olvido de https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    btnGuardar.innerText = "Guardando...";
    btnGuardar.disabled = true;

    try {
        // CREACIÓN AUTOMÁTICA EN FIREBASE: Creamos la carpeta del ID y le asignamos dueño
        await set(ref(db, 'llaveros/' + idLlavero), {
            estado: 'grabado',
            url: url,
            propietario_uid: usuarioActual.uid,
            propietario_email: usuarioActual.email
        });

        // Recargamos para que aparezca la pantalla roja de ABRIR AHORA
        window.location.reload();
    } catch (error) {
        alert("Error al guardar el recuerdo.");
        btnGuardar.innerText = "GUARDAR RECUERDO";
        btnGuardar.disabled = false;
        console.error(error);
    }
});

// Arrancamos todo
iniciarComprobacion();
