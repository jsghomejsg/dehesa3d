import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// 1. CONFIGURACIÓN FIREBASE (DEHESA3D)
const firebaseConfig = {
  apiKey: "AIzaSyBGlbifV7uCylDtDUL2ecl2RaH4pTF9r_8",
  authDomain: "dehesa3d.firebaseapp.com",
  databaseURL: "https://dehesa3d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dehesa3d",
  storageBucket: "dehesa3d.firebasestorage.app",
  messagingSenderId: "217744907698",
  appId: "1:217744907698:web:58076022dbe7a53d6418ab",
  measurementId: "G-61MWRL1JPX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// 2. CONFIGURACIÓN DE TELEGRAM (Protegida - Vacía por ahora)
const TELEGRAM_TOKEN_PARTE_1 = ""; 
const TELEGRAM_TOKEN_PARTE_2 = ""; 
const TELEGRAM_CHAT_ID = "";       

// 3. LÓGICA PRINCIPAL DEL RECUERDO
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const tienda = urlParams.get('tienda') || "No especificada"; 

    if (!id) {
        document.body.innerHTML = "<h2 style='color:white;text-align:center;margin-top:50px;'>Error: Recuerdo no identificado.</h2>";
        return;
    }

    const recuerdoRef = ref(db, 'recuerdos/' + id);

    get(recuerdoRef).then((snapshot) => {
        if (snapshot.exists() && snapshot.val().targetUrl) {
            window.location.href = snapshot.val().targetUrl;
        } else {
            mostrarInterfazConfiguracion(id, tienda);
        }
    }).catch((error) => {
        console.error("Error DB:", error);
        alert("Error de conexión. Revisa tu internet.");
    });
});

function mostrarInterfazConfiguracion(idRecuerdo, tienda) {
    document.body.innerHTML = `
        <div style="max-width:400px; margin: 50px auto; text-align:center; color:white; padding: 20px;">
            <h1 style="color:#1DB954; font-size: 24px; margin-bottom: 30px;">Vincular Recuerdo</h1>
            
            <button id="btn-login" style="background:white; color:black; padding:15px 20px; border:none; border-radius:30px; font-size:16px; font-weight:bold; cursor:pointer; width:100%; box-shadow: 0 4px 10px rgba(255,255,255,0.2);">
                Iniciar sesión con Google
            </button>
            
            <div id="panel-config" style="display:none; text-align:left; background:#222; padding:20px; border-radius:12px; margin-top: 20px;">
                <p style="margin-top:0; font-size:14px;">Pega aquí el enlace que quieres guardar:</p>
                <input type="url" id="input-url" placeholder="Ej: https://open.spotify.com/..." style="width:100%; padding:15px; margin-bottom:20px; border-radius:8px; border:none; box-sizing:border-box; font-size:14px;">
                <button id="btn-guardar" style="background:#1DB954; color:white; padding:15px; border:none; border-radius:30px; font-size:16px; font-weight:bold; cursor:pointer; width:100%;">
                    Guardar Recuerdo
                </button>
            </div>
        </div>
    `;

    const btnLogin = document.getElementById('btn-login');
    const panelConfig = document.getElementById('panel-config');
    const btnGuardar = document.getElementById('btn-guardar');
    const inputUrl = document.getElementById('input-url');
    let usuarioActual = null;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            usuarioActual = user;
            btnLogin.style.display = 'none';
            panelConfig.style.display = 'block';
        } else {
            btnLogin.style.display = 'block';
            panelConfig.style.display = 'none';
        }
    });

    btnLogin.addEventListener('click', () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider).catch(err => alert("Cerraste la ventana o hubo un error al iniciar sesión."));
    });

    btnGuardar.addEventListener('click', () => {
        const url = inputUrl.value.trim();
        if (!url) {
            alert("Por favor, pega un enlace válido.");
            return;
        }

        set(ref(db, 'recuerdos/' + idRecuerdo), {
            targetUrl: url,
            propietarioUid: usuarioActual.uid,
            email: usuarioActual.email,
            tiendaOrigen: tienda,
            fechaActivacion: new Date().toISOString()
        }).then(() => {
            notificarTelegram(idRecuerdo, usuarioActual.email, tienda);
            window.location.href = url;
        }).catch(err => alert("Error al guardar. Refresca la página e inténtalo de nuevo."));
    });
}

function notificarTelegram(idRecuerdo, email, tienda) {
    const token = TELEGRAM_TOKEN_PARTE_1 + TELEGRAM_TOKEN_PARTE_2;
    if (!token || !TELEGRAM_CHAT_ID) return;
    
    const mensaje = `🟢 NUEVO RECUERDO VINCULADO\n\n🆔 ID: ${idRecuerdo}\n🏬 Tienda: ${tienda}\n👤 Usuario: ${email}`;
    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(mensaje)}`;
    
    fetch(url).catch(err => console.log(err));
}
