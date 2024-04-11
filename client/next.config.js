/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns:
            "production" === process.env.NODE_ENV
                ? [
                    {
                        protocol: 'https',
                        hostname: 'chat-api.baejangho.com',
                        pathname: '/*',
                    }
                ]
                : [
                    {
                        protocol: 'http',
                        hostname: 'localhost',
                        port: '8080',
                        pathname: '/*'
                    }
                ],
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