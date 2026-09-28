export const SITE_CONFIG = {
  name: 'Merci Murphy : Toilettage, spa, crèche, éducation et ostéopathie pour chiens à Paris',
  description:
    "Boutique premium de bien-être pour chiens à Paris. merci murphy®, c'est aussi un dog shop engagé.",
  url: 'https://mercimurphy.com',
  shopUrl: 'https://shop.mercimurphy.com',
  instagram: 'https://www.instagram.com/mercimurphy/',
  phone: '09 78 81 04 21',
  email: 'bonjour@mercimurphy.com',
  address: '18, rue Victor Massé, 75009, Paris',
  nav: [
    { label: 'Accueil', href: '/' },
    { label: 'Éco-shop', href: '/shop' },
    { label: 'Nos services', href: '/services' },
    { label: 'Le concept', href: '/concept' },
    { label: 'Contact', href: '/contact' },
  ],
  // Secondary entry points. Kept out of `nav` because the navbar slices that
  // array positionally to insert the blog link.
  secondaryNav: [
    {
      label: 'Espace revendeurs',
      href: '/revendeurs',
      description: 'Boutiques, concept-stores et toiletteurs : découvrez nos conditions pro.',
    },
  ],
}
