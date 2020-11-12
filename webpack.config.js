const TerserPlugin = require('terser-webpack-plugin');
var webpack = require('webpack');



var versions = () => {
    var date = new Date();
    return date.getTime();
}

module.exports = {
    entry: ["./app/main.js", 'babel-polyfill'],
    output:
    {
        filename: `app.min.js`,
        chunkFilename: '[name].bundle.js',
        // path: __dirname + "../../../repo-webinar/pcc-frontend/cms-monitor/dist"
        path: __dirname + "/dist"
    },
    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".js", ".json", ".ts", ".tsx"]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(gif|eot|woff|woff2|ttf|otf)$/,
                loaders: [
                    'css-loader'
                ]
            },
            {
                test: /\.(png|jp(e*)g|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 8000, // Convert images < 8kb to base64 strings
                    }
                }]
            },
            { test: /\.tsx?$/, loader: "ts-loader" },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    plugins: [],
    optimization: {
        minimizer: [
            new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: false, // Must be set to true if using source-maps in production
                terserOptions: {
                }
            })
        ],
    }
};