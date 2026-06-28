-- ============================================================
-- WSJ 2027 - Esquema de base de datos (Supabase / Postgres)
-- ============================================================
-- Cómo usar este archivo:
-- 1. Crea un proyecto gratis en https://supabase.com
-- 2. Ve a "SQL Editor" en el panel izquierdo
-- 3. Pega TODO este archivo y dale a "Run"
-- Eso crea la tabla, la seguridad y mete las 20 patrullas ya listas.
-- ============================================================

-- Tabla principal: una fila por patrulla, con sus credenciales
-- de acceso y su progreso de partida. Esta misma tabla es la
-- que lee el panel admin en tiempo real para el ranking.
create table if not exists public.patrullas (
  id uuid primary key default gen_random_uuid(),
  usuario text not null unique,         -- ej: 'patrulla1' (login)
  password_hash text not null,          -- hash bcrypt, nunca texto plano
  nombre_patrulla text not null,        -- ej: 'AGUILA' (se muestra en pantalla/ranking)
  nivel_actual int not null default 1,  -- 1..12
  puntos int not null default 0,
  estado text not null default 'sin_empezar', -- sin_empezar | jugando | completado | tiempo_agotado
  tiempo_inicio timestamptz,            -- se rellena al hacer login (arranca el cronómetro de 45 min)
  tiempo_fin timestamptz,
  intentos_nivel_actual int not null default 0,
  updated_at timestamptz not null default now()
);

-- Refresca updated_at automáticamente en cada cambio (útil para
-- ordenar "quién avanzó más recientemente" si hay puntos iguales)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_patrullas_updated_at on public.patrullas;
create trigger trg_patrullas_updated_at
  before update on public.patrullas
  for each row
  execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Seguridad (RLS): el navegador NUNCA habla directo con esta
-- tabla. Todo pasa por las API routes de Next.js usando la
-- "service role key" (clave secreta de servidor). Por eso
-- bloqueamos todo acceso público por defecto.
-- ------------------------------------------------------------
alter table public.patrullas enable row level security;

-- Sin políticas para "anon"/"authenticated" => nadie desde el
-- navegador puede leer ni escribir directamente. Solo la
-- service role key (que ignora RLS) puede, y esa clave solo
-- vive en el servidor (variables de entorno de Vercel).

-- ------------------------------------------------------------
-- Realtime: permite que el panel admin reciba actualizaciones
-- en vivo (ranking en tiempo real) sin tener que refrescar.
-- ------------------------------------------------------------
alter publication supabase_realtime add table public.patrullas;

-- ------------------------------------------------------------
-- Seed: las 20 credenciales de patrulla.
-- Usuario / contraseña en texto plano para entregar a cada
-- patrulla están en el archivo CREDENCIALES.md (generado aparte).
-- Aquí solo se guarda el HASH bcrypt de cada contraseña.
-- ------------------------------------------------------------
insert into public.patrullas (usuario, password_hash, nombre_patrulla)
values
  ('patrulla1', '$2b$10$9bH7IcDHbIsyPLLY8xq3bOBGqGVIVOdWHjIec/s1gqeg4m.SIGrA2', 'AGUILA'),
  ('patrulla2', '$2b$10$oA6ASGCisiKCG6nr5PYy5OlaBWKLm/YmXqluOExW8Piyfmzo3EX9i', 'HALCON'),
  ('patrulla3', '$2b$10$QKwQYTjlBbarwkaLkX7w6OMWS59h/e0b5waUhjKkHr53wYfE7QxHG', 'LOBO'),
  ('patrulla4', '$2b$10$dHDgklqwne/hcqKJdXlad.4dQQvhzJkGb44kW5kf3BHVDENTS.UmG', 'ZORRO'),
  ('patrulla5', '$2b$10$blygiMIf3l9fuhwrlJzJA.9M7.HFafStdpGMqXxupUP7T3nub0FBe', 'PUMA'),
  ('patrulla6', '$2b$10$9MbSg8O9rRLSS56uBT63bOeLhoqIaJOaTLatxG8CPxQmuBW9inxTO', 'JAGUAR'),
  ('patrulla7', '$2b$10$8irrQ83/XppNRgdFeC8UXubEbuI8KHYl.BL/vqxwUz3damNcaN5zm', 'CONDOR'),
  ('patrulla8', '$2b$10$pbXNUAU1HsgvZ2BZ3FkASe9i0Z2D0TQPnkQvIgls0XgIYv.Nb.mRK', 'TIGRE'),
  ('patrulla9', '$2b$10$KvaK8varWkK3IQ54RzzAI.8Y1K4.wR0OCEW7.GREkZR9dd1P4pVpO', 'PANTERA'),
  ('patrulla10', '$2b$10$hXDy6yseoKDcv.3EaOSpPO177KaVgekve7avfnykinQumxdDRdUUa', 'LINCE'),
  ('patrulla11', '$2b$10$LfYmFuX/0eG/xDl9m3ZvmuWlVpF6vXPbzssKp3R3QN5fMnnwKxjBq', 'OSO'),
  ('patrulla12', '$2b$10$7UGMX.3Dq75r7jJIHAOI6OQAxNZd/O7lAPVvqD473yYrYorVW.lLm', 'BISONTE'),
  ('patrulla13', '$2b$10$uNDN6282/pOaTKoTYNUVjO3vHeRYgR6p7SE0lleGqeGEt.LdBkw6W', 'COYOTE'),
  ('patrulla14', '$2b$10$KAmYupHh9.nHEPLDkFyZK.sOLwYMI8MoQ/LOhXtsgRRg7hxA2AaRC', 'LEOPARDO'),
  ('patrulla15', '$2b$10$52Ax5fhUSByI0VWU4oNRq.5DRENoEjmRnnffcSYx1vG399Tyanvty', 'GAVILAN'),
  ('patrulla16', '$2b$10$b.J8dtsqT1lNN.Fv1n2QduDLu0.jy4E6xEGEx1NXhHXNYGzkQTmoW', 'BUHO'),
  ('patrulla17', '$2b$10$E7YONnj8VmLb9VsJNim3NOQluuHEStareMUpLEHKQ4q3QJbW9Jd2O', 'SERPIENTE'),
  ('patrulla18', '$2b$10$l8wY7eXnSMhxrKe8q53yQuRF58ewitNC2e4Wqivle0qn0qzSwZbrC', 'CARACAL'),
  ('patrulla19', '$2b$10$s.iEWMqapKoDgIPTGTGbAeizveSeluHgzhOGjM/SqPxqxnTjrv.vW', 'GUEPARDO'),
  ('patrulla20', '$2b$10$j8ZWAAWanRWPUCYgKG06SuIvksQg65QEfYw6uBhbCfg0Cq/f7IMne', 'VENADO')
on conflict (usuario) do nothing;

-- ------------------------------------------------------------
-- Para reiniciar todas las partidas antes del evento real
-- (vuelve a poner a las 20 patrullas en el punto de partida):
-- ------------------------------------------------------------
-- update public.patrullas set
--   nivel_actual = 1, puntos = 0, estado = 'sin_empezar',
--   tiempo_inicio = null, tiempo_fin = null, intentos_nivel_actual = 0;
