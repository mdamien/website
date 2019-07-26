const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID;
const NODE_ENV = process.env.NODE_ENV;

const plugins = [
  'gatsby-plugin-sass',
  'gatsby-plugin-react-svg',
  'gatsby-plugin-react-helmet',
  {
    resolve: 'gatsby-plugin-manifest',
    options: {
      name: 'medialab-website',
      short_name: 'medialab',
      start_url: '/',
      background_color: '#ffffff',
      icon: 'src/components/assets/images/icons/icon-specimen.png'
    }
  },
  'gatsby-plugin-offline',
  'gatsby-plugin-sitemap'
];

if (NODE_ENV === 'production' && GOOGLE_ANALYTICS_ID)
  plugins.push({
    resolve: 'gatsby-plugin-google-analytics',
    options: {
      trackingId: GOOGLE_ANALYTICS_ID,
      anonymize: true,
      respectDNT: true
    }
  });

module.exports = {
  siteMetadata: {
    title: 'médialab Sciences Po',
    siteUrl: 'https://medialab.sciencespo.fr'
  },
  plugins
};
