-- WSJ 2027 SUPABASE SCHEMA
-- Ejecutar esto en Supabase SQL Editor

CREATE TABLE patrullas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  codigo_acceso TEXT NOT NULL UNIQUE,
  nivel_actual INTEGER NOT NULL DEFAULT 1,
  tiempo_inicio TIMESTAMP WITH TIME ZONE,
  tiempo_fin TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE niveles (
  id SERIAL PRIMARY KEY,
  orden INTEGER NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL,
  url_slug TEXT NOT NULL UNIQUE,
  url_respuesta TEXT NOT NULL,
  pista TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE intentos (
  id BIGSERIAL PRIMARY KEY,
  patrulla_id UUID REFERENCES patrullas(id),
  patrulla_nombre TEXT,
  nivel_orden INTEGER,
  url_intentada TEXT NOT NULL,
  es_correcta BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEED: 20 Patrullas
INSERT INTO patrullas (nombre, codigo_acceso) VALUES
('Patrulla_1', 'patrulla1-2027'),
('Patrulla_2', 'patrulla2-2027'),
('Patrulla_3', 'patrulla3-2027'),
('Patrulla_4', 'patrulla4-2027'),
('Patrulla_5', 'patrulla5-2027'),
('Patrulla_6', 'patrulla6-2027'),
('Patrulla_7', 'patrulla7-2027'),
('Patrulla_8', 'patrulla8-2027'),
('Patrulla_9', 'patrulla9-2027'),
('Patrulla_10', 'patrulla10-2027'),
('Patrulla_11', 'patrulla11-2027'),
('Patrulla_12', 'patrulla12-2027'),
('Patrulla_13', 'patrulla13-2027'),
('Patrulla_14', 'patrulla14-2027'),
('Patrulla_15', 'patrulla15-2027'),
('Patrulla_16', 'patrulla16-2027'),
('Patrulla_17', 'patrulla17-2027'),
('Patrulla_18', 'patrulla18-2027'),
('Patrulla_19', 'patrulla19-2027'),
('Patrulla_20', 'patrulla20-2027');

-- SEED: 12 Niveles
INSERT INTO niveles (orden, titulo, descripcion, tipo, url_slug, url_respuesta, pista) VALUES
(1, 'La Promesa', 'Siglas de World Scout Jamboree + año', 'codigo', 'wsj2027', 'cracovia', 'WSJ2027'),
(2, 'Dragón Wawel', 'Capital histórica de Polonia', 'geografia', 'cracovia', 'nostalgia', 'Antigua capital'),
(3, 'Morse', 'Decodifica: -. --- ... - .- .-.. --. .. .-', 'morse', 'nostalgia', 'zubr', 'Tabla Morse'),
(4, 'Bisonte', 'Animal europeo en polaco: ZUBR', 'mapa', 'zubr', 'gdansk', 'Białowieża'),
(5, 'Bandera', 'Ciudad portuaria Báltica', 'banderas', 'gdansk', 'scout', 'Puerto'),
(6, 'César +3', 'VFRXW descifrado = SCOUT', 'cripto', 'scout', 'roble', 'Hacia atrás'),
(7, 'Roble Bartek', 'Árbol milenario polaco', 'naturaleza', 'roble', 'solidarnosc', 'Árbol'),
(8, 'Imagen Oscura', 'Sube brillo para ver respuesta', 'estego', 'solidarnosc', 'lealtad', 'Ajusta brillo'),
(9, 'Poema', 'Ordena estrofas = LEAL', 'acrostico', 'lealtad', 'tercero', 'L-E-A-L'),
(10, 'Arrowe Park', 'Número Jamboree 1929', 'historia', 'tercero', 'as-de-guia', 'Tercero'),
(11, 'Nudos', 'Experto en nudos', 'secuencia', 'as-de-guia', 'brave', 'As de'),
(12, 'Victoria', 'Fin del juego', 'final', 'brave', '__FIN__', 'Ganaron');

-- Habilitar Realtime (opcional)
ALTER PUBLICATION supabase_realtime ADD TABLE patrullas;
ALTER PUBLICATION supabase_realtime ADD TABLE intentos;
