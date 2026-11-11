// Bases de datos de frases por categoría
const frasesInicio = [
    "Oh, genial. Has vuelto a escanearme.",
    "¿No tienes nada mejor que hacer con tu móvil?",
    "Me has despertado para esta tontería. Increíble."
];

const frasesMotivacion = [
    "Ríndete, hoy claramente no es tu día.",
    "Tu mejor esfuerzo sigue siendo mediocre.",
    "Si esperas que te motive, te has equivocado de plástico."
];

const frasesEstado = [
    "Estaba mejor antes de que me escanearas.",
    "Sigo atrapado en este bloque. ¿Tú qué crees?",
    "Cobrando lo mismo por aguantarte: nada."
];

const frasesTrabajo = [
    "Trabaja tú, yo soy un adorno estructural.",
    "Ese Excel no se va a rellenar con magia.",
    "Finge que trabajas, a mí me funciona."
];

// Las respuestas cuando el usuario escribe algo (El truco del pasota)
const frasesIgnorar = [
    "Mucho texto, no lo he leído.",
    "No me cuentes tu vida, no soy tu psicólogo.",
    "Interesante... si me importara.",
    "¿De verdad creías que un trozo de plástico te iba a escuchar?",
    "Ajam. Sí. Lo que tú digas."
];

function obtenerIdFigura() {
    const parametros = new URLSearchParams(window.location.search);
    return parametros.get('id');
}

window.onload = function() {
    const id = obtenerIdFigura();
    
    if (!id) {
        document.getElementById('message-box').innerText = "Error: Escanéame con el chip NFC.";
        return;
    }

    // Frase aleatoria de inicio
    cambiarTexto(frasesInicio);
};

// Función para los 3 botones fijos
function responder(categoria) {
    if (categoria === 'motivacion') cambiarTexto(frasesMotivacion);
    if (categoria === 'estado') cambiarTexto(frasesEstado);
    if (categoria === 'trabajo') cambiarTexto(frasesTrabajo);
}

// Función para el botón de enviar texto (ignora lo escrito y vacía la caja)
function ignorarTexto() {
    const input = document.getElementById('user-text');
    
    if (input.value.trim() === "") {
        document.getElementById('message-box').innerText = "¿Me mandas un texto vacío? Eres un genio.";
        return;
    }

    cambiarTexto(frasesIgnorar);
    input.value = ""; // Borramos lo que ha escrito para darle más rabia
}

// Función de utilidad para sacar frase aleatoria de un array
function cambiarTexto(arrayFrases) {
    const indice = Math.floor(Math.random() * arrayFrases.length);
    document.getElementById('message-box').innerText = arrayFrases[indice];
}
