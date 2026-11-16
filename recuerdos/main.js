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

// 2. CONFIGURACIÓN DE TELEGRAM (Protegida)
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
        <div style="max-width:400px; margin: 50px auto; text-align:center; color:white; padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
            <h1 style="color:#1DB954; font-size: 24px; margin-bottom: 30px;">Vincular Recuerdo</h1>
            
            <button id="btn-login" style="background:white; color:black; padding:15px 20px; border:none; border-radius:30px; font-size:16px; font-weight:bold; cursor:pointer; width:100%; box-shadow: 0 4px 10px rgba(255,255,255,0.2);">
                Iniciar sesión con Google
            </button>
            
            <div id="panel-config" style="display:none; text-align:left; background:#222; padding:20px; border-radius:12px; margin-top: 20px;">
                <p style="margin-top:0; font-size:15px; font-weight:bold; margin-bottom:15px;">Pega aquí el enlace de tu recuerdo:</p>
                
                <input type="url" id="input-url" placeholder="https://..." style="width:100%; padding:15px; margin-bottom:15px; border-radius:8px; border:none; box-sizing:border-box; font-size:14px; background:#333; color:white;">
                
                <div style="background:#1a1a1a; padding:15px; border-radius:8px; margin-bottom:20px; font-size:13px; color:#bbb; line-height:1.5;">
                    <p style="margin-top:0; margin-bottom:10px;"><strong style="color:#1DB954;">📷 Fotos:</strong> Para guardar una foto o álbum, simplemente pega el enlace a esa foto o carpeta compartida (Google Photos, Drive, iCloud...).</p>
                    <p style="margin:0;"><strong style="color:#1DB954;">🎵 Música:</strong> Aconsejamos usar enlaces de <strong>YouTube</strong>. Si usas Spotify y la persona que recibe el regalo no tiene Premium, es posible que no escuche la canción exacta.</p>
                </div>

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
        // Ponemos el botón en modo "cargando"
        btnLogin.innerText = "Conectando con Google...";
        
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider).catch(err => {
            btnLogin.innerText = "Iniciar sesión con Google";
            // Si el móvil lo bloquea, ahora nos dirá exactamente por qué
            alert("Atención: " + err.message + " (" + err.code + ")");
        });
    });

    btnGuardar.addEventListener('click', () => {
        let url = inputUrl.value.trim();
        
        if (!url) {
            alert("Por favor, pega un enlace válido.");
            return;
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
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
