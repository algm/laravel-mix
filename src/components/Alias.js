const { Component } = require('./Component');

module.exports = class Alias extends Component {
    /** @type {Record<string, string>} */
    aliases = {};

    /**
     * Add resolution aliases to webpack's config
     *
     * @param {Record<string, string>} paths
     */
    register(paths) {
        this.aliases = { ...this.aliases, ...paths };
    }

    /**
     *
     * @param {import('webpack').Configuration} config
     */
    webpackConfig(config) {
        config.resolve = config.resolve || {};
        config.resolve.alias = config.resolve.alias || {};

        for (const [alias, path] of Object.entries(this.aliases)) {
            config.resolve.alias[alias] = this.context.mix.paths.root(path);
        }

        return config;
    }
};
