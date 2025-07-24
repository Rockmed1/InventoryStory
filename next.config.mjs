const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },

  //* Client caching:

  experimental: {
    // staleTimes: {
    //   dynamic: 30, // Manually set dynamic route staleTime to 30 seconds. Default is 0: no caching on the client= get fresh data with every request.
    //   static: 180, // Loading.js and Layout.js and back/forward navigation are cached default 5 min or the value of the stale time
    // },
    // // useCache: true, //allows you to mark a route, React component, or a function as cacheable. can also be enabled with the dynamicIO option.
  },
};

export default nextConfig;
