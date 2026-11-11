import { diccionarioFrases, obtenerFraseDinamica } from './frases.js';

const cajaMensaje = document.getElementById('caja-mensaje');
const imgMascota = document.getElementById('mascota-img');
const contenedorMascota = document.getElementById('mascota-clickable');

let clicksRapidos = 0;
let temporizadorClicks = null;

// Carga inmediata de la frase horaria al abrir
function iniciarBienvenida() {
    const mensajeInicial = obtenerFraseDinamica('hora');
    cajaMensaje.innerText = mensajeInicial;
}

iniciarBienvenida();

function animarMascota(claseAnimacion) {
    if (!imgMascota) return;
    imgMascota.className = "";
    void imgMascota.offsetWidth; 
    imgMascota.classList.add(claseAnimacion);
}

function mostrarFrase(categoria, claseAnimacion) {
    const lista = diccionarioFrases[categoria];
    if (lista && lista.length > 0) {
        const randomIndex = Math.floor(Math.random() * lista.length);
        cajaMensaje.innerText = lista[randomIndex];
        animarMascota(claseAnimacion);
    }
}

document.getElementById('btn-inicio').addEventListener('click', () => {
    mostrarFrase('inicio', 'animar-inicio');
});

document.getElementById('btn-motivacion').addEventListener('click', () => {
    mostrarFrase('motivacion', 'animar-motivacion');
});

document.getElementById('btn-estado').addEventListener('click', () => {
    cajaMensaje.innerText = obtenerFraseDinamica('hora');
    animarMascota('animar-estado');
});

document.getElementById('btn-trabajo').addEventListener('click', () => {
    mostrarFrase('trabajo', 'animar-trabajo');
});

document.getElementById('btn-enviar').addEventListener('click', () => {
    const inputTexto = document.getElementById('user-text');
    if (inputTexto.value.trim() === "") {
        cajaMensaje.innerText = "¿Me mandas un texto vacío? Qué esfuerzo mental tan titánico.";
        animarMascota('animar-ignorar');
        return;
    }
    mostrarFrase('ignorantes', 'animar-ignorar');
    inputTexto.value = "";
});

// Easter Egg al tocar el muñeco (3 veces seguidas)
contenedorMascota.addEventListener('click', () => {
    clicksRapidos++;
    clearTimeout(temporizadorClicks);

    if (clicksRapidos >= 3) {
        cajaMensaje.innerText = "¡¿QUIERES PARAR DE TOCARME LA CARA YA, PESADO?! ¡QUE NO SOY UNA PANTALLA TÁCTIL DE FAST FOOD!";
        animarMascota('animar-enfado');
        clicksRapidos = 0;
    } else {
        temporizadorClicks = setTimeout(() => {
            clicksRapidos = 0;
        }, 700);
    }
});
