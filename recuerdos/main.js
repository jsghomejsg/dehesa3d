import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
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

// 2. LÓGICA PRINCIPAL DEL RECUERDO
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const tienda = urlParams.get('tienda') || "CaprichoDeAna"; 

    if (!id) {
        document.body.innerHTML = "<h2 style='color:white;text-align:center;margin-top:50px;'>Error: Recuerdo no identificado.</h2>";
        return;
    }

    const recuerdoRef = ref(db, 'recuerdos/' + id);

    get(recuerdoRef).then((snapshot) => {
        if (snapshot.exists() && snapshot.val().targetUrl) {
            window.location.href = snapshot.val().targetUrl;
        } else {
            mostrarInterfazRegistroYConfig(id, tienda);
        }
    }).catch((error) => {
        console.error("Error DB:", error);
        alert("Error de conexión. Revisa tu internet.");
    });
});

function mostrarInterfazRegistroYConfig(idRecuerdo, tienda) {
    document.body.innerHTML = `
        <div style="max-width:400px; margin: 30px auto; text-align:center; color:white; padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
            <h1 style="color:#1DB954; font-size: 24px; margin-bottom: 25px;">Activa tu Llavero</h1>
            
            <!-- PANEL DE REGISTRO / ACCESO -->
            <div id="panel-auth" style="background:#222; padding:20px; border-radius:12px; text-align:left;">
                <p style="margin-top:0; font-size:14px; color:#bbb; margin-bottom:15px;">🔐 Regístrate con tu email para asociar este llavero a tu cuenta:</p>
                
                <input type="email" id="input-email" placeholder="Tu correo electrónico" style="width:100%; padding:15px; margin-bottom:12px; border-radius:8px; border:none; box-sizing:border-box; font-size:14px; background:#333; color:white;">
                <input type="password" id="input-pass" placeholder="Contraseña (mínimo 6 caracteres)" style="width:100%; padding:15px; margin-bottom:15px; border-radius:8px; border:none; box-sizing:border-box; font-size:14px; background:#333; color:white;">
                
                <button id="btn-auth" style="background:#1DB954; color:white; padding:15px; border:none; border-radius:30px; font-size:16px; font-weight:bold; cursor:pointer; width:100%;">
                    Continuar y Vincular
                </button>
            </div>

            <!-- PANEL DE CONFIGURACIÓN DEL ENLACE (Oculto hasta registrarse) -->
            <div id="panel-config" style="display:none; background:#222; padding:20px; border-radius:12px; text-align:left;">
                <p id="info-usuario" style="margin-top:0; font-size:12px; color:#1DB954; margin-bottom:15px;"></p>
                <p style="margin-top:0; font-size:15px; font-weight:bold; margin-bottom:15px;">Pega aquí el enlace de tu recuerdo:</p>
                
                <input type="url" id="input-url" placeholder="https://..." style="width:100%; padding:15px; margin-bottom:15px; border-radius:8px; border:none; box-sizing:border-box; font-size:14px; background:#333; color:white;">
                
                <div style="background:#1a1a1a; padding:15px; border-radius:8px; margin-bottom:20px; font-size:13px; color:#bbb; line-height:1.5;">
                    <p style="margin-top:0; margin-bottom:10px;"><strong style="color:#1DB954;">📷 Fotos:</strong> Enlace a tu álbum (Google Photos, Drive, iCloud...).</p>
                    <p style="margin:0;"><strong style="color:#1DB954;">🎵 Música:</strong> Recomendamos enlaces de <strong>YouTube</strong>.</p>
                </div>

                <button id="btn-guardar" style="background:#1DB954; color:white; padding:15px; border:none; border-radius:30px; font-size:16px; font-weight:bold; cursor:pointer; width:100%;">
                    Guardar Recuerdo
                </button>
            </div>

            <!-- BANNER DE DEHESA3D -->
            <div style="margin-top: 40px; padding: 15px; background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); border-radius: 10px; font-size: 12px; color: #888; line-height: 1.4;">
                <p style="margin: 0 0 8px 0;">✨ Tecnología NFC realizada por <a href="https://dehesa3d.es" target="_blank" style="color: #1DB954; text-decoration: none; font-weight: bold;">Dehesa3D.es</a></p>
                <p style="margin: 0;">¿Tienes un negocio o tienda? Crea tus propios productos interactivos con nosotros.</p>
            </div>
        </div>
    `;

    const panelAuth = document.getElementById('panel-auth');
    const panelConfig = document.getElementById('panel-config');
    const inputEmail = document.getElementById('input-email');
    const inputPass = document.getElementById('input-pass');
    const btnAuth = document.getElementById('btn-auth');
    const btnGuardar = document.getElementById('btn-guardar');
    const inputUrl = document.getElementById('input-url');
    const infoUsuario = document.getElementById('info-usuario');

    // Comprobar si ya está logueado en esta sesión de navegador
    onAuthStateChanged(auth, (user) => {
        if (user) {
            panelAuth.style.display = 'none';
            panelConfig.style.display = 'block';
            infoUsuario.innerText = `👤 Conectado como: ${user.email}`;
        }
    });

    // Botón unificado de Registro / Login automático
    btnAuth.addEventListener('click', () => {
        const email = inputEmail.value.trim();
        const pass = inputPass.value.trim();

        if (!email || pass.length < 6) {
            alert("Por favor, introduce un correo válido y una contraseña de al menos 6 caracteres.");
            return;
        }

        btnAuth.innerText = "Procesando...";

        // Intentar registrar al usuario; si ya existe, iniciar sesión
        createUserWithEmailAndPassword(auth, email, pass)
            .then((userCredential) => {
                // Registro exitoso
            })
            .catch((error) => {
                if (error.code === 'auth/email-already-in-use') {
                    // Si ya existe, loguearlo directamente
                    return signInWithEmailAndPassword(auth, email, pass);
                } else {
                    throw error;
                }
            })
            .catch((err) => {
                btnAuth.innerText = "Continuar y Vincular";
                alert("Error: " + err.message);
            });
    });

    btnGuardar.addEventListener('click', () => {
        let url = inputUrl.value.trim();
        const usuarioActual = auth.currentUser;
        
        if (!url) {
            alert("Por favor, pega un enlace válido.");
            return;
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        set(ref(db, 'recuerdos/' + idRecuerdo), {
            targetUrl: url,
            propietarioUid: usuarioActual ? usuarioActual.uid : "anonimo",
            email: usuarioActual ? usuarioActual.email : "desconocido",
            tiendaOrigen: tienda,
            fechaActivacion: new Date().toISOString()
        }).then(() => {
            window.location.href = url;
        }).catch(err => alert("Error al guardar. Refresca la página e inténtalo de nuevo."));
    });
}
