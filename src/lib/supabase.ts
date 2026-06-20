  import { createClient } from '@supabase/supabase-js';

  // Configuración de Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  export const supabase = createClient(supabaseUrl, supabaseKey);

  // --- TU CÓDIGO ORIGINAL SE QUEDA AQUÍ ---
  export interface Patrulla {
    id: string
    nombre: string
    codigo_acceso: string
    nivel_actual: number
    tiempo_inicio: string | null
    tiempo_fin: string | null
  }

  export interface Nivel {
    id: number
    orden: number
    titulo: string
    descripcion: string
    tipo: string
    url_slug: string
    url_respuesta: string
    pista: string | null
  }

  export const NIVELES_SEED: Nivel[] = [
    { id: 1, orden: 1, titulo: 'La Promesa del Fuego', descripcion: 'Siglas de World Scout Jamboree + año', tipo: 'codigo', url_slug: 'wsj2027', url_respuesta: 'cracovia', pista: 'WSJ2027' },
    { id: 2, orden: 2, titulo: 'El Dragón de Wawel', descripcion: 'Capital histórica de Polonia', tipo: 'geografia', url_slug: 'cracovia', url_respuesta: 'nostalgia', pista: 'Antigua capital' },
    { id: 3, orden: 3, titulo: 'Señales Morse', descripcion: 'Decodifica: -. --- ... - .- .-.. --. .. .-', tipo: 'morse', url_slug: 'nostalgia', url_respuesta: 'zubr', pista: 'Tabla Morse' },
    { id: 4, orden: 4, titulo: 'Bisonte', descripcion: 'Animal europeo, en polaco es ZUBR', tipo: 'mapa', url_slug: 'zubr', url_respuesta: 'gdansk', pista: 'Białowieża' },
    { id: 5, orden: 5, titulo: 'Bandera', descripcion: 'Ciudad portuaria Báltica', tipo: 'banderas', url_slug: 'gdansk', url_respuesta: 'scout', pista: 'Puerto' },
    { id: 6, orden: 6, titulo: 'César +3', descripcion: 'VFRXW hacia atrás = SCOUT', tipo: 'cripto', url_slug: 'scout', url_respuesta: 'roble', pista: 'Descifra' },
    { id: 7, orden: 7, titulo: 'Roble Bartek', descripcion: 'Árbol milenario polaco', tipo: 'naturaleza', url_slug: 'roble', url_respuesta: 'solidarnosc', pista: 'Árbol' },
    { id: 8, orden: 8, titulo: 'Imagen Oscura', descripcion: 'Sube brillo para ver', tipo: 'estego', url_slug: 'solidarnosc', url_respuesta: 'lealtad', pista: 'Ajusta brillo' },
    { id: 9, orden: 9, titulo: 'Poema Desordenado', descripcion: 'Ordena las estrofas', tipo: 'acrostico', url_slug: 'lealtad', url_respuesta: 'tercero', pista: 'L-E-A-L' },
    { id: 10, orden: 10, titulo: 'Arrowe Park 1929', descripcion: 'Número de Jamboree', tipo: 'historia', url_slug: 'tercero', url_respuesta: 'as-de-guia', pista: 'tercero en español' },
    { id: 11, orden: 11, titulo: 'Nudos Scout', descripcion: 'Experto en nudos', tipo: 'secuencia', url_slug: 'as-de-guia', url_respuesta: 'brave', pista: 'as de guía' },
    { id: 12, orden: 12, titulo: '¡Ganaron!', descripcion: 'Fin del juego', tipo: 'final', url_slug: 'brave', url_respuesta: '__FIN__', pista: 'Victoria' },
  ]

  // --- FUNCIONES QUE FALTABAN ---
  export async function getPatrullaByCode(codigo: string) {
    return await supabase.from('patrullas').select('*').eq('codigo_acceso', codigo).single();
  }

  export async function getNivelBySlug(slug: string) {
    return await supabase.from('niveles').select('*').eq('url_slug', slug).single();
  }

  export function getNivelByOrden(orden: number): Nivel | null {
    return NIVELES_SEED.find(n => n.orden === orden) || null
  }