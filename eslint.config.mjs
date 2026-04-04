import nextConfig from 'eslint-config-next'

export default [
  ...nextConfig,
  {
    rules: {
      // react-hooks v7 makes this an error by default, but async data-fetching
      // inside effects (the pattern used in DashboardClient) is a valid and
      // common approach. Downgrade to a warning so the build is not blocked.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]
