/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        turbo: {
            loaders: {
                '.svg': ['@svgr/webpack']
            }
        }
    }
    // webpack(config) {
    //     config.module.rules.push({
    //         test: /\.svg$/,
    //         use: [
    //             {
    //                 loader: '@svgr/webpack',
    //                 options: {
    //                     native: true,
    //                 },
    //             },
    //         ]
    //     });
    //     return config;
    // }
}

//module.exports = nextConfig
export default nextConfig;