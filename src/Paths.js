let path = require('path');

class Paths {
    /**
     * Create a new Paths instance.
     */
    constructor() {
        // TODO: Refactor setup to allow removing this check
        if (process.env.NODE_ENV === 'test') {
            this.rootPath = path.resolve(__dirname, '../');
        } else {
            this.rootPath = process.cwd();
        }
    }

    /**
     * Set the root path to resolve webpack.mix.js.
     *
     * @param {string} path
     */
    setRootPath(path) {
        this.rootPath = path;

        return this;
    }

    /**
     * Determine the path to the user's webpack.mix.js file.
     */
    mix() {
        this._mixFilePath = this._mixFilePath || this.findMixFile();

        // TODO: Add test for this
        if (this._mixFilePath === null) {
            throw new Error("Unable to find Mix config file")
        }

        return this._mixFilePath;
    }

    /**
     * @internal
     * @returns
     */
    getPossibleMixPaths() {
        if (process.env.MIX_FILE) {
            return [
                process.env.MIX_FILE,
                `${process.env.MIX_FILE}.js`,
            ]
        }

        return [
            "webpack.mix.js",
        ]
    }

    /**
     * Determine the path to the user's webpack.mix.js file.
     *
     * @internal
     */
    findMixFile() {
        /**
         * TODO: Should we use `mix.resolve` here so it can be mocked?
         *
         * @param {string} path
         * @returns {string|null}
         */
        const find = path => {
            try {
                return require.resolve(path);
            } catch (err) {
                return null;
            }
        };

        const paths = this.getPossibleMixPaths().map(path => this.root(path))

        for (const filepath of paths) {
            const resolvedPath = find(filepath)

            if (resolvedPath) {
                return resolvedPath
            }
        }

        return null;
    }

    /**
     * Determine the project root.
     *
     * @param {string} [append]
     */
    root(append = '') {
        return path.resolve(this.rootPath, append);
    }
}

module.exports = Paths;
