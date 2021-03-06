const path = require('path');
const { merge } = require('webpack-merge');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { ESBuildPlugin } = require('esbuild-loader');

const isProd = process.argv.indexOf('-p') !== -1;

const common = {
	mode: 'development',
	entry: {
		index: ['./src/js/game.js'],
	},
	output: {
		filename: 'game.js',
		chunkFilename: 'game.js',
		path: path.join(__dirname, 'public/game/')
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'esbuild-loader',
				options: {
					target: 'es2015'
				}
			},
			{
				test: /\.(glsl|frag|vert)$/,
				use: [
					{ loader: 'glslify-import-loader' },
					{ loader: 'raw-loader', options: { esModule: false } },
					{ loader: 'glslify-loader' }
				]
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					isProd ? MiniCssExtractPlugin.loader : 'style-loader',
					'css-loader',
					'sass-loader',
				]
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: {
					loader: 'file-loader',
					options: {
						name: 'assets/fonts/[name].[ext]',
						esModule: false,
						publicPath: isProd ? '../' : '/'
					}
				}
			},
		]
	},
	resolve: {
		extensions: ['.js']
	},
	plugins: [
		new CleanWebpackPlugin(),
		new ESBuildPlugin(),
	]
};

const dev = {
	mode: 'development',
	devtool: 'inline-source-map',
	devServer: {
		contentBase: './public/game',
		host: '0.0.0.0',
		stats: {
			assets: false,
			children: false,
			chunks: false,
			colors: true,
			hash: false,
			entrypoints: false,
			modules: false,
			publicPath: false,
			reasons: false,
			source: false,
			timings: true,
			version: false,
			warnings: false,
		}
	}
};

const prod = {
	mode: 'production'
};

module.exports = merge(common, (isProd ? prod : dev));