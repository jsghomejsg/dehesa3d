import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
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
const db = getDatabase(app);

// 2. LÓGICA DIRECTA Y SIN FALLOS
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
            // Si el llavero ya está asignado, se abre directamente. Imposible hackearlo.
            window.location.href = snapshot.val().targetUrl;
        } else {
            // Si está virgen, muestra la pantalla de activación sin pedir cuentas.
            mostrarInterfazDirecta(id, tienda);
        }
    }).catch((error) => {
        console.error("Error DB:", error);
        alert("Error de conexión. Revisa tu internet.");
    });
});

function mostrarInterfazDirecta(idRecuerdo, tienda) {
    document.body.innerHTML = `
        <div style="max-width:400px; margin: 30px auto; text-align:center; color:white; padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
            <h1 style="color:#1DB954; font-size: 24px; margin-bottom: 10px;">¡Activa tu Llavero!</h1>
            <p style="font-size: 14px; color: #aaa; margin-bottom: 25px;">Pega tu enlace para vincularlo. Una vez guardado, quedará bloqueado por seguridad.</p>
            
            <div style="background:#222; padding:20px; border-radius:12px; text-align:left;">
                <p style="margin-top:0; font-size:15px; font-weight:bold; margin-bottom:15px;">Pega aquí tu enlace:</p>
                
                <input type="url" id="input-url" placeholder="https://..." style="width:100%; padding:15px; margin-bottom:15px; border-radius:8px; border:none; box-sizing:border-box; font-size:14px; background:#333; color:white;">
                
                <div style="background:#1a1a1a; padding:15px; border-radius:8px; margin-bottom:20px; font-size:13px; color:#bbb; line-height:1.5;">
                    <p style="margin-top:0; margin-bottom:10px;"><strong style="color:#1DB954;">📷 Fotos:</strong> Enlace a tu álbum (Google Photos, Drive, iCloud...).</p>
                    <p style="margin-top:0; margin-bottom:10px;"><strong style="color:#1DB954;">🎵 Música:</strong> Recomendamos usar enlaces de <strong>YouTube</strong>.</p>
                    <p style="margin:0; font-size:12px; color:#ff6b6b; font-weight:bold;">⚠️ ATENCIÓN: Si usas un enlace de Spotify, quien escanee el llavero debe tener cuenta Premium, o Spotify no le dejará escuchar esa canción exacta.</p>
                </div>

                <button id="btn-guardar" style="background:#1DB954; color:white; padding:15px; border:none; border-radius:30px; font-size:16px; font-weight:bold; cursor:pointer; width:100%;">
                    Bloquear y Guardar
                </button>
            </div>
            
            <div style="margin-top: 40px; padding: 15px; background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); border-radius: 10px; font-size: 12px; color: #888; line-height: 1.4;">
                <p style="margin: 0 0 8px 0;">✨ Tecnología NFC realizada por <a href="https://dehesa3d.es" target="_blank" style="color: #1DB954; text-decoration: none; font-weight: bold;">Dehesa3D.es</a></p>
            </div>
        </div>
    `;

    document.getElementById('btn-guardar').addEventListener('click', () => {
        let url = document.getElementById('input-url').value.trim();
        const btn = document.getElementById('btn-guardar');
        
        if (!url) {
            alert("Por favor, pega un enlace válido.");
            return;
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        btn.innerText = "Guardando...";
        btn.style.background = "#555";
        btn.disabled = true;

        set(ref(db, 'recuerdos/' + idRecuerdo), {
            targetUrl: url,
            tiendaOrigen: tienda,
            fechaActivacion: new Date().toISOString()
        }).then(() => {
            window.location.href = url;
        }).catch(err => {
            btn.innerText = "Bloquear y Guardar";
            btn.style.background = "#1DB954";
            btn.disabled = false;
            alert("Error al guardar. Refresca e inténtalo de nuevo.");
        });
    });
}
