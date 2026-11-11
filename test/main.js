import { diccionarioFrases, obtenerFraseDinamica } from './frases.js';

const cajaMensaje = document.getElementById('caja-mensaje');
const imgMascota = document.getElementById('mascota-img');
const contenedorMascota = document.getElementById('mascota-clickable');

let clicksRapidos = 0;
let temporizadorClicks = null;

async function iniciarBienvenida() {
    let mensajeInicial = obtenerFraseDinamica('hora');
    
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            const nivelBateria = Math.round(battery.level * 100);
            if (nivelBateria <= 20) {
                mensajeInicial = `Tienes un ${nivelBateria}% de batería en el móvil y estás perdiendo el tiempo aquí. Genial tus prioridades.`;
            }
        } catch (e) {}
    }

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

// Easter Egg optimizado para móvil (sin zoom y detectando toques rápidos)
contenedorMascota.addEventListener('click', (e) => {
    e.preventDefault();
    clicksRapidos++;
    clearTimeout(temporizadorClicks);

    if (clicksRapidos >= 3) {
        cajaMensaje.innerText = "¡¿QUIERES PARAR DE TOCARME LA CARA YA, PESADO?! ¡QUE NO SOY UNA PANTALLA TÁCTIL DE FAST FOOD!";
        animarMascota('animar-enfado');
        clicksRapidos = 0;
    } else {
        temporizadorClicks = setTimeout(() => {
            clicksRapidos = 0;
        }, 500);
    }
});
