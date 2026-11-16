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

// 2. LÓGICA PRINCIPAL DEL RECUERDO
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
        <div style="max-width:400px; margin: 30px auto; text-align:center; color:white; padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
            <h1 style="color:#1DB954; font-size: 24px; margin-bottom: 25px;">Vincular Recuerdo</h1>
            
            <div style="background:#222; padding:20px; border-radius:12px; text-align:left;">
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

            <!-- BANNER DE PUBLICIDAD / AUTORÍA DE DEHESA3D -->
            <div style="margin-top: 40px; padding: 15px; background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); border-radius: 10px; font-size: 12px; color: #888; line-height: 1.4;">
                <p style="margin: 0 0 8px 0;">✨ Tecnología NFC realizada por <a href="https://dehesa3d.es" target="_blank" style="color: #1DB954; text-decoration: none; font-weight: bold;">Dehesa3D.es</a></p>
                <p style="margin: 0;">¿Tienes un negocio o tienda? Crea tus propios productos interactivos con nosotros.</p>
            </div>
        </div>
    `;

    const btnGuardar = document.getElementById('btn-guardar');
    const inputUrl = document.getElementById('input-url');

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
            email: "tienda@caprichodeana.es",
            tiendaOrigen: tienda,
            fechaActivacion: new Date().toISOString()
        }).then(() => {
            window.location.href = url;
        }).catch(err => alert("Error al guardar. Refresca la página e inténtalo de nuevo."));
    });
}
