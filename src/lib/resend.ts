import { Resend } from 'resend'

// Le constructeur Resend lève une erreur sans clé, ce qui casse le build
// (les routes sont évaluées à la collecte des pages). Avec une clé factice,
// le build passe et seuls les envois échouent (erreur renvoyée par l'API).
export const resend = new Resend(process.env.RESEND_API_KEY || 're_missing_api_key')
