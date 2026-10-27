// Convex JWT verification for Clerk.
// Keep this issuer aligned with the Clerk Frontend API / Convex integration.
export default {
  providers: [
    {
      domain: 'https://clerk.idmap-dkp.web.id',
      applicationID: 'convex',
    },
  ],
};
