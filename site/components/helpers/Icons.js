import React from 'react';

// TODO: should probably not work thusly...
const icons = {
  'search-filter': () => {
    return (
      <svg
        id="search-filters"
        data-name="search-filters"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 60 60">
        <title>Search and filters</title>
        <path d="M36.1.12a22,22,0,0,0-12,5.36A21.7,21.7,0,0,0,17,23.76a22.23,22.23,0,0,0,4.38,11c.08.13-.28.55-1.52,1.8l-1.64,1.65-1.08-1.08L16.06,36l-8,8-8,8,4,4,4,3.95,8-8,8-8-1.09-1.09L21.8,41.78l1.64-1.64c1.26-1.24,1.68-1.61,1.81-1.52a28.74,28.74,0,0,0,5.36,3c.15,0,.28-.18.62-1a20.2,20.2,0,0,1,1.94-3.55c.13-.18.2-.34.16-.39s-.46-.22-.92-.41a16.83,16.83,0,0,1-6.81-5.33,15.91,15.91,0,0,1,9.68-25,19.51,19.51,0,0,1,6.1-.05,16,16,0,0,1,13,14.9,15.86,15.86,0,0,1-2.15,8.76c-.34.57-.62,1.05-.62,1.07a2.85,2.85,0,0,0,.79.32,16.33,16.33,0,0,1,3.34,1.57c1.08.65.92.75,1.88-1.1A21.55,21.55,0,0,0,36.1.12Z" /><path d="M44.72,33.94a13.15,13.15,0,0,0-10.3,17A13.32,13.32,0,0,0,44.48,59.8a21.49,21.49,0,0,0,4.81,0A13.39,13.39,0,0,0,59.81,49.28a21.4,21.4,0,0,0,0-4.8A13.27,13.27,0,0,0,49,33.93,14,14,0,0,0,44.72,33.94Zm7.79,9.85-3.75,4.4v8.07H45V48.19l-3.75-4.41-3.75-4.4H56.27Z" />
      </svg>
    );
  },
  'search': () => {
    return (
      <svg
        id="search-svg"
        data-name="search"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 60 60">
        <title>Search</title>
        <path d="M38.34,0A21.64,21.64,0,0,0,21.29,35a10.7,10.7,0,0,1-1.5,1.67l-1.64,1.63-1.07-1.07L16,36.13l-8,8-8,8,4,4L7.88,60l8-8,8-8-1.08-1.08-1.08-1.08,1.64-1.63A9.69,9.69,0,0,1,25,38.72,21.65,21.65,0,1,0,38.34,0Zm0,37.84A16.19,16.19,0,1,1,54.52,21.66,16.2,16.2,0,0,1,38.34,37.84Z" />
      </svg>
    );
  },
  'infos': () => {
    return (
      <svg
        id="infos"
        data-name="infos"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 60 60">
        <title>Infos</title>
        <path d="M30,57.5A27.5,27.5,0,1,1,57.5,30,27.54,27.54,0,0,1,30,57.5ZM30,8.05A22,22,0,1,0,52,30,22,22,0,0,0,30,8.05Z" />
        <rect
          x="25.75" y="27" width="8.5"
          height="20" rx="1.48" ry="1.48" />
        <circle cx="30" cy="18" r="5" />
      </svg>
    );
  },
  'arrow': () => {
    return (
      <svg
        className="arrow"
        data-name="arrow"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20">
        <title>Arrow</title>
        <polyline points="5.25 18.25 10.5 9.75 4.5 1.75" />
      </svg>
    );
  }
};

export function Icons({icon}) {
  const Component = icons[icon];

  if (!Component)
    return null;

  return <Component />;
}