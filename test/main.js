import { diccionarioFrases, obtenerFraseDinamica } from './frases.js';

const cajaMensaje = document.getElementById('caja-mensaje');
const imgMascota = document.getElementById('mascota-img');

cajaMensaje.innerText = "Toca un botón si te atreves, aunque prefiero que no.";

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
    mostrarFrase('estado', 'animar-estado');
});

document.getElementById('btn-trabajo').addEventListener('click', () => {
    mostrarFrase('trabajo', 'animar-trabajo');
});

document.getElementById('btn-tiempo').addEventListener('click', () => {
    cajaMensaje.innerText = obtenerFraseDinamica('hora');
    animarMascota('animar-estado');
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
