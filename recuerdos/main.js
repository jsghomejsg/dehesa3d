import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// 1. CONFIGURACIÓN FIREBASE
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

// 2. LÓGICA PRINCIPAL
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const tienda = urlParams.get('tienda') || "CaprichoDeAna"; 

    if (!id) {
        document.body.innerHTML = "<h2 style='color:white;text-align:center;margin-top:50px;'>Error: Recuerdo no identificado.</h2>";
        return;
    }

    // Ocultar la pantalla mientras Firebase comprueba el estado inicial
    document.body.innerHTML = `
        <div style="max-width:400px; margin: 50px auto; text-align:center; color:white; font-family: system-ui, -apple-system, sans-serif;">
            <h2 style="color:#1DB954; font-size: 20px;">Cargando...</h2>
        </div>
    `;

    // Comprobar la sesión SIN redirecciones
    onAuthStateChanged(auth, (user) => {
        const recuerdoRef = ref(db, 'recuerdos/' + id);

        get(recuerdoRef).then((snapshot) => {
            if (snapshot.exists() && snapshot.val().targetUrl) {
                // Si el llavero ya está grabado, redirige directo
                window.location.href = snapshot.val().targetUrl;
            } else {
                // Llavero virgen
                if (user) {
                    mostrarInterfazConfiguracion(id, tienda, user);
                } else {
                    mostrarInterfazGoogle(id, tienda);
                }
            }
        }).catch(err => {
            document.body.innerHTML = "<h2 style='color:white;text-align:center;'>Error de conexión. Revisa internet.</h2>";
        });
    });
});

function mostrarInterfazGoogle(idRecuerdo, tienda) {
    document.body.innerHTML = `
        <div style="max-width:400px; margin: 30px auto; text-align:center; color:white; padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
            <h1 style="color:#1DB954; font-size: 24px; margin-bottom: 25px;">Activa tu Llavero</h1>
            
            <div style="background:#222; padding:25px; border-radius:12px; text-align:center;">
                <p style="margin-top:0; font-size:14px; color:#bbb; margin-bottom:20px;">Inicia sesión con tu cuenta de Google para vincular este llavero de forma segura:</p>
                
                <button id="btn-google" style="background:white; color:black; padding:15px 20px; border:none; border-radius:30px; font-size:16px; font-weight:bold; cursor:pointer; width:100%; box-shadow: 0 4px 10px rgba(255,255,255,0.2);">
                    🔵 Iniciar sesión con Google
                </button>
            </div>
            
            <div style="margin-top: 40px; padding: 15px; background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); border-radius: 10px; font-size: 12px; color: #888; line-height: 1.4;">
                <p style="margin: 0 0 8px 0;">✨ Tecnología NFC realizada por <a href="https://dehesa3d.es" target="_blank" style="color: #1DB954; text-decoration: none; font-weight: bold;">Dehesa3D.es</a></p>
                <p style="margin: 0;">¿Tienes un negocio o tienda? Crea tus propios productos interactivos con nosotros.</p>
            </div>
        </div>
    `;

    document.getElementById('btn-google').addEventListener('click', () => {
        const btn = document.getElementById('btn-google');
        btn.innerText = "Abriendo Google...";
        const provider = new GoogleAuthProvider();
        
        // POPUP: Se abre una ventanita por encima de tu web, Safari no borra datos
        signInWithPopup(auth, provider)
            .then((result) => {
                // Al volver a la web, ya tenemos al usuario
                mostrarInterfazConfiguracion(idRecuerdo, tienda, result.user);
            })
            .catch((error) => {
                console.error("Error Google Auth:", error);
                btn.innerText = "🔵 Iniciar sesión con Google";
                
                if (error.code === 'auth/popup-blocked') {
                    alert("⚠️ Tu móvil ha bloqueado la ventana emergente. Por favor, toca el icono de la brújula para abrirlo en Safari normal, o desactiva el bloqueo de ventanas emergentes.");
                } else {
                    alert("Error al conectar con Google. Inténtalo de nuevo.");
                }
            });
    });
}

function mostrarInterfazConfiguracion(idRecuerdo, tienda, usuario) {
    document.body.innerHTML = `
        <div style="max-width:400px; margin: 30px auto; text-align:center; color:white; padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
            <h1 style="color:#1DB954; font-size: 24px; margin-bottom: 25px;">Activa tu Llavero</h1>
            
            <div style="background:#222; padding:20px; border-radius:12px; text-align:left;">
                <p style="margin-top:0; font-size:12px; color:#1DB954; margin-bottom:15px;">👤 Conectado como: ${usuario.email}</p>
                <p style="margin-top:0; font-size:15px; font-weight:bold; margin-bottom:15px;">Pega aquí tu enlace:</p>
                
                <input type="url" id="input-url" placeholder="https://..." style="width:100%; padding:15px; margin-bottom:15px; border-radius:8px; border:none; box-sizing:border-box; font-size:14px; background:#333; color:white;">
                
                <div style="background:#1a1a1a; padding:15px; border-radius:8px; margin-bottom:20px; font-size:13px; color:#bbb; line-height:1.5;">
                    <p style="margin-top:0; margin-bottom:10px;"><strong style="color:#1DB954;">📷 Fotos:</strong> Enlace a tu álbum (Google Photos, Drive, iCloud...).</p>
                    <p style="margin:0;"><strong style="color:#1DB954;">🎵 Música:</strong> Recomendamos enlaces de <strong>YouTube</strong>.</p>
                </div>

                <button id="btn-guardar" style="background:#1DB954; color:white; padding:15px; border:none; border-radius:30px; font-size:16px; font-weight:bold; cursor:pointer; width:100%;">
                    Guardar Recuerdo
                </button>
            </div>
            
            <div style="margin-top: 40px; padding: 15px; background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); border-radius: 10px; font-size: 12px; color: #888; line-height: 1.4;">
                <p style="margin: 0 0 8px 0;">✨ Tecnología NFC realizada por <a href="https://dehesa3d.es" target="_blank" style="color: #1DB954; text-decoration: none; font-weight: bold;">Dehesa3D.es</a></p>
            </div>
        </div>
    `;

    document.getElementById('btn-guardar').addEventListener('click', () => {
        let url = document.getElementById('input-url').value.trim();
        
        if (!url) {
            alert("Por favor, pega un enlace válido.");
            return;
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        set(ref(db, 'recuerdos/' + idRecuerdo), {
            targetUrl: url,
            propietarioUid: usuario.uid,
            email: usuario.email,
            tiendaOrigen: tienda,
            fechaActivacion: new Date().toISOString()
        }).then(() => {
            window.location.href = url;
        }).catch(err => alert("Error al guardar. Refresca e inténtalo de nuevo."));
    });
}
