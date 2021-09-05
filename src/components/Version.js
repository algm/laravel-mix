let glob = require('glob');
let path = require('path');
let File = require('../File');
let VersionFilesTask = require('../tasks/VersionFilesTask');

class Version {
    /**
     * Register the component.
     *
     * @param {string[]} paths
     */
    register(paths = []) {
        paths = Array.isArray(paths) ? paths : [paths];

        const files = paths.flatMap(filePath => {
            if (File.find(filePath).isDirectory()) {
                filePath += path.sep + '**/*';
            }

            if (!filePath.includes('*')) {
                return filePath;
            }

            return glob.sync(new File(filePath).forceFromPublic().relativePath(), {
                nodir: true
            });
        });

        Mix.addTask(new VersionFilesTask({ files }));
    }
}

module.exports = Version;
