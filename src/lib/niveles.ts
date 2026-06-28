// Definición de los 12 enigmas.
//
// IMPORTANTE sobre `respuestaHash`:
// Es el SHA-256 de la respuesta correcta, ya normalizada
// (minúsculas, sin espacios). Así la respuesta nunca aparece en
// texto plano en el código que llega al navegador, ni en este
// archivo: solo se ve su "huella digital", que no se puede
// revertir para obtener la palabra original.
//
// La respuesta SOLO se verifica en el servidor (ver
// src/app/api/responder/route.ts): el navegador envía la
// respuesta en texto plano por HTTPS, el servidor calcula su
// hash y lo compara contra el de aquí. Esto es más seguro que
// la versión anterior, donde la comparación ocurría en el propio
// navegador (cualquiera podía leer el hash objetivo abriendo las
// herramientas de desarrollador y, con tiempo, intentar romperlo).
//
// El NIVEL 7 se deja intencionalmente vacío (sin descripción, sin
// respuesta, sin pista) — pendiente de completar más adelante.
export interface Nivel {
  orden: number
  titulo: string
  descripcion: string
  respuestaHash: string
  pista: string
}

export const NIVELES: Nivel[] = [
  {
    orden: 1,
    titulo: '🔓 El Cofre del Fundador',
    descripcion: 'En 1907, Robert Baden-Powell fundó el movimiento Scout. Su nombre completo tenia 3 nombres y 2 apellidos ¿Cuál era sus otros 2 nombres?',
    respuestaHash: 'c753760cb8ec0a5afa385c67c5e4970f0e5402bf758318a89abacef0591599bb', // stevensmith
    pista: '1907 + historia scout = búsqueda en Wikipedia',
  },
  {
    orden: 2,
    titulo: '🗺️ La Brújula Desaparecida',
    descripcion: '5S/67/341D7D/D56/J70B9255. Decodifica y encontrarás una ciudad polaca.',
    respuestaHash: '7fb1ce6c242756717902de56c5b8286738ddce688a4fe46d56a077b9044e6826', // gdansk
    pista: 'Utilza la clave murcielago para decodificar el mensaje',
  },
  {
    orden: 3,
    titulo: '🔢 La Pirámide Numérica',
    descripcion: 'Secuencia: 2-4-8-16-?. Si sumas los dígitos del siguiente número y lo conviertes a palabra en inglés: ONE, TWO, THREE... ¿cuál es?',
    respuestaHash: '222b0bd51fcef7e65c2e62db2ed65457013bab56be6fafeb19ee11d453153c80', // five
    pista: 'Potencias de 2: cada número es el anterior x 2',
  },
  {
    orden: 4,
    titulo: '⚜️ El Lema Scout',
    descripcion: 'El lema Scout oficial en inglés tiene 2 palabras que comienzan: B-P. Es una lema a nivel mundial. ¿Cuál es?',
    respuestaHash: 'd36eda975ffca9687dafaeabefedcdbf4c0639072e0177f3738ccd97a146d760', // be prepared 
    pista: 'Traducción al español: "Siempre listo"',
  },
  {
    orden: 5,
    titulo: '🎖️ Las 4 patrullas',
    descripcion: 'En el primer campamento scout fueron 4 patrullas que fueron: Toros, Cuervos, Lobos y....¿el quinto?.',
    respuestaHash: '0af1b037e53e3a463c4b7b184c34ca95c8152bddfaf2c7253de548afd2b38ef9', // chorlitos
    pista: 'Comienza con C',
  },
  {
    orden: 6,
    titulo: '🔐 Fecha Importante',
    descripcion: 'Cuando fue el primer campamento scout?',
    respuestaHash: '4332cd76590d0efdbd8d067acf531546da2ba0a67c538440e7defedbea48d1dc', // 1907
    pista: 'Fue entre 1900 y 1910,'
  },
  {
    // Nivel 7: se deja vacío a propósito, tal como estaba.
    orden: 7,
    titulo: '📖 Un libro importante',
    descripcion: '¿Qué nombre recibe el libro escrito por Baden-Powell que contiene las bases del movimiento?',
    respuestaHash: '9a2f83cbc1142e606b611444f8712b07b59cd3716c2821187053aeebc5fe1475', // escultismoparamuchachos
    pista: 'Libro fundamental del movimiento scout',
  },
  {
    orden: 8,
    titulo: '🎭 El Acertijo Paradójico',
    descripcion: 'Soy una puerta que está siempre abierta pero nunca entra ni sale nadie. He guiado a millones de scouts en la oscuridad. ¿Qué soy?',
    respuestaHash: '57ce0e2ba0d91ef2855a10cf319dbe90026b2d53b3db88e13343ac0f03da7659', // brujula
    pista: 'Navegación sin entradas ni salidas',
  },
  {
    orden: 9,
    titulo: '📜 Anagrama Antiguo',
    descripcion: 'Las letras de esta palabra "MACAPAR" pueden reorganizarse para formar una actividad típica de campamento scout. ¿Cuál es?',
    respuestaHash: '34ff755dbc59fbcfcd72518d851409824470a04b24f9fb1daae490e6726d9a52', // acampar
    pista: 'la actividad de dormir al aire libre en carpas',
  },
  {
    orden: 10,
    titulo: '🔗 La Cadena de Nudos',
    descripcion: '¿Qué nudo sirve para empezar o finalizar un amarre?',
    respuestaHash: 'c5fea547d2edf7907bc56c6f66e3ef896538daffdd149cb9830a25362e50f6b5', // ballestrinque
    pista: 'Nudo de empalme, muy usado en escalada',
  },
  {
    orden: 11,
    titulo: '⚡ Código Morse Final',
    descripcion: 'Morse: .-.. . .- .-.. - .- -.. / .- -... -. . --. .- -.-. .. --- -. / -.-- / .--. ..- .-. . --.. .-¿Que son?',
    respuestaHash: '850cefd7f34500fda87256def7f549c2c4f9d485bfce95dc85154a891ff0e8a7', //virtudes 
    pista: 'D=../ A=.- / Y=-.-- / R=.-.',
  },
  {
    orden: 12,
    titulo: '🏆 El Círculo Completo',
    descripcion: '¡FELICITACIONES! Han resuelto todos los enigmas. El verdadero premio es el viaje, no el destino. ¿cómo se llama el acto final de reunión?',
    respuestaHash: '0e82f09822a7c760270b4884e57634ceab794419aad347323e7ca6a1fa6361e9', // fogata
    pista: 'Tradición alrededor del fuego al final de campamento',
  },
]

export const TIEMPO_LIMITE_SEGUNDOS = 2700 // 45 minutos
export const PUNTOS_POR_NIVEL = 1000
export const TIEMPO_BONUS_SEGUNDOS = 120 // Bonus si respondes en menos de 2 minutos

// Normaliza igual que antes: minúsculas y sin espacios.
export function normalizarRespuesta(texto: string): string {
  return texto.toLowerCase().replace(/\s/g, '')
}
