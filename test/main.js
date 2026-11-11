
// El cerebro de la mascota: Frases iniciales
const frasesBordes = [
    "Oh, genial. Has vuelto a escanearme.",
    "¿No tienes nada mejor que hacer con tu móvil?",
    "Si esperas que te motive, te has equivocado de plástico.",
    "Me has despertado para esta tontería. Increíble.",
    "Sigo cobrando lo mismo por aguantarte: nada.",
    "Ese correo que estás ignorando no se va a contestar solo."
];

// 1. Leer el número de serie desde el enlace NFC
function obtenerIdFigura() {
    const parametros = new URLSearchParams(window.location.search);
    return parametros.get('id');
}

// 2. Lo que pasa nada más cargar la página
window.onload = function() {
    const id = obtenerIdFigura();
    
    // Si alguien entra a la web sin escanear el chip (sin el ?id=...)
    if (!id) {
        document.getElementById('message-box').innerText = "Error: Escanéame con el chip NFC. No entres por la puerta de atrás.";
        return;
    }

    // AQUI IRA LA CONEXIÓN CON FIREBASE MÁS ADELANTE
    // Por ahora, simulamos que el muñeco ya te reconoce y te suelta una frase.
    mostrarFraseAleatoria();
};

// 3. Cambiar el texto en pantalla
function mostrarFraseAleatoria() {
    const indice = Math.floor(Math.random() * frasesBordes.length);
    document.getElementById('message-box').innerText = frasesBordes[indice];
}

// 4. Preparar el botón de "Reclamar" para cuando activemos Firebase
function registrarMascota() {
    const nombre = document.getElementById('owner-name').value;
    const pin = document.getElementById('owner-pin').value;
    
    if(!nombre || !pin) {
        alert("Rellena los dos datos, que no soy adivino.");
        return;
    }
    
    // Esto lo conectaremos luego a la base de datos real
    alert(`Simulando registro: Dueño ${nombre} guardado. (Falta conectar Firebase)`);
}
