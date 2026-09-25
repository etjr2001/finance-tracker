// React Query pauses queries and mutations while the browser is offline
// (its default networkMode is 'online'). demoApi never touches the network,
// so demo calls must run regardless. Spread into useQuery/useMutation options.
// Returns {} outside demo mode rather than networkMode: 'online', so the real
// API keeps whatever default the QueryClient sets.
export function demoNetworkMode(isDemo) {
    return isDemo ? { networkMode: 'always' } : {}
}
