# 🔑 Credenciales de Patrulla — WSJ 2027

Estas son las 20 cuentas para que cada patrulla entre al escape room desde
su propio dispositivo. Reparte una fila a cada patrulla **antes del evento**.

⚠️ **Este archivo contiene contraseñas en texto plano.** No lo subas a
GitHub ni lo compartas públicamente. Está en `.gitignore` por seguridad,
pero revisa que `git status` no lo liste como "untracked" antes de hacer
`git add .` a la ligera.

| Usuario                 | Patrulla         | Contraseña |
|-------------------------|------------------|------------|
| PatrullaLeones          | LEONES           | ESYRND     |
| patrullaDelfnes         | DELFINES         | QB374S     |
| patrullaGuacamayos      | GUACAMAYOS       | E38H98     |
| patrullaLeones2         | LEONES2          | SJ2HRC     |
| patrullaFocas           | FOCAS            | Q9WYNE     |
| patrullaCapybaras       | CAPYBARAS        | 3AF5CB     | 
| patrullaÁguilas         | ÁGUILAS          | MEKBEE     |
| patrullaNutriasmarinas  | NUTRIAS MARINAS  | 4M46MR     | 
| patrullaLobos           | LOBOS            | Q6M2MY     |
| patrullaZorros          | ZORROS           | 5LXFJX     |
| patrullaTigres          | TIGRES           | 84PFNS     |
| patrullaPanacas         | PANACAS          | C6PFT3     |
| patrullaCuervos         | CUERVOS          | EBBA3Q     |
| patrullaLlamas          | LLAMAS           | 97JEK8     |
| patrullaCondores        | CONDORES         | PPSFKL     |
| patrullaFenix           | FÉNIX            | ALUXHL     |
| patrullaPanteras        | PANTERAS         | 3JA5CA     |
| patrulla18              | 18               | WGA37K     |
| patrullaAnaconda        | ANACONDA         | L7SD3L     |
| patrullaCuyes           | CUYES            | CF9E4M     |

## Cómo entran las patrullas

1. Abren la URL del juego (la que te dé Vercel al desplegar).
2. Escriben su **usuario** (ej: `patrulla1`) y su **contraseña** (ej: `ESYRND`).
3. El cronómetro de 45 minutos arranca en ese momento, en el servidor — no
   en su navegador, así que no se puede hacer trampa cambiando la hora del
   celular.
4. Si recargan la página o pierden conexión, al volver a entrar con las
   mismas credenciales recuperan exactamente su progreso (nivel y puntos),
   porque todo vive en la base de datos, no en su dispositivo.

## Cómo cambiar estas contraseñas

Las contraseñas reales están guardadas como hash bcrypt en Supabase, nunca
en texto plano en el código. Para cambiar la contraseña de una patrulla:

```bash
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('NUEVA-CONTRASEÑA', 10))"
```

Copia el resultado y actualízalo en Supabase: tabla `patrullas` → columna
`password_hash` → fila correspondiente a esa patrulla.
