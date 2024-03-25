/** @type {import('next').NextConfig} */
const nextConfig = {
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