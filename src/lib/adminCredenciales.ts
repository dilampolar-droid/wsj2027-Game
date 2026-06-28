import { sha256 } from './hash'

// Hashes SHA-256 de las contraseñas de admin. La contraseña en
// texto plano nunca se guarda aquí, solo su huella SHA-256.
// (Antes este archivo guardaba la contraseña en texto plano en el
// campo que se llamaba "hash" — por eso el login de admin nunca
// funcionaba: se comparaba un hash real contra texto plano.)
export const ADMIN_CREDENCIALES = [
  { usuario: 'admin1', hash: '25f43b1486ad95a1398e3eeb3d83bc4010015fcc9bedb35b432e00298d5021f7' }, //admin1
  { usuario: 'admin2', hash: '1c142b2d01aa34e9a36bde480645a57fd69e14155dacfab5a3f9257b77fdc8d8' }, //admin2
  { usuario: 'admin3', hash: '4fc2b5673a201ad9b1fc03dcb346e1baad44351daa0503d5534b4dfdcc4332e0' }, //admin3
  { usuario: 'admin4', hash: '110198831a426807bccd9dbdf54b6dcb5298bc5d31ac49069e0ba3d210d970ae' }, //admin4
  { usuario: 'admin5', hash: '69b5406538c5c09580cecc0c7bafbf3f960267ffa7478e89d8352da814529cb7' }, //admin5
];

export function validarAdmin(usuario: string, password: string): boolean {
  const cred = ADMIN_CREDENCIALES.find((a) => a.usuario === usuario)
  if (!cred) return false
  return sha256(password) === cred.hash
}
