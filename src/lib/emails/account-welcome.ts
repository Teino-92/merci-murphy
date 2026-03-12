export function accountWelcomeHtml(prenom: string, nomChien?: string): string {
  const greeting = nomChien ? `Bienvenue à vous et à ${nomChien} !` : `Bienvenue, ${prenom} !`

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Votre compte merci murphy® est créé</title>
</head>
<body style="margin:0;padding:0;background-color:#F5EDE8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5EDE8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="https://mercimurphy.com/logo.avif" alt="merci murphy®" width="140" style="display:block;" />
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:20px;padding:48px 40px;">

              <!-- Heading -->
              <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#2C2C2C;text-align:center;line-height:1.3;">
                ${greeting}
              </h1>

              <!-- Body -->
              <p style="margin:0 0 16px;font-size:15px;color:#6B6B6B;line-height:1.7;text-align:center;">
                Votre compte merci murphy® a bien été créé. Notre équipe va vérifier votre profil et activer la réservation en ligne après votre première visite en boutique.
              </p>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td style="border-top:1px solid #F0E8E4;"></td>
                </tr>
              </table>

              <!-- Info box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF5F2;border-radius:12px;margin-bottom:32px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#2C2C2C;text-transform:uppercase;letter-spacing:0.08em;">
                      Prochaine étape
                    </p>
                    <p style="margin:0;font-size:14px;color:#6B6B6B;line-height:1.6;">
                      Venez nous rendre visite au <strong style="color:#2C2C2C;">18 rue Victor Massé, 75009 Paris</strong>. Notre équipe fera connaissance avec vous et votre chien, et activera votre accès à la réservation en ligne.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background-color:#C4714A;border-radius:12px;padding:14px 32px;">
                    <a href="https://mercimurphy.com/services" style="color:#ffffff;font-family:Georgia,serif;font-size:15px;font-weight:600;text-decoration:none;display:block;">
                      Découvrir nos services
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Footer note -->
              <p style="margin:0;font-size:12px;color:#B0A9A5;text-align:center;line-height:1.6;">
                Une question ? Écrivez-nous à <a href="mailto:bonjour@mercimurphy.com" style="color:#C4714A;">bonjour@mercimurphy.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#B0A9A5;">
                merci murphy® · 18 rue Victor Massé, 75009 Paris
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
