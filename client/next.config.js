/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'chat-api.baejangho.com',
                pathname: '/images/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8080',
                pathname: '/images/**',
            },
            {
                protocol: 'http',
                hostname: '192.168.100.4',
                port: '8080',
                pathname: '/images/**',
            }
        ]
    },
    poweredByHeader: false,
    async headers() {
        return [];
    },
    experimental: {
        turbo: {
            loaders: {
                '.svg': ['@svgr/webpack']
            }
        }
    }
}

//module.exports = nextConfig
export default nextConfig;