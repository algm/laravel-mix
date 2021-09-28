let AutomaticComponent = require('./AutomaticComponent');
const { Component } = require('./Component');

class Notifications extends Component {
    passive = true;

    /**
     * webpack plugins to be appended to the master config.
     */
    webpackPlugins() {
        if (!this.mix.config.notifications) {
            return;
        }

        let WebpackNotifierPlugin = require('webpack-notifier');

        return new WebpackNotifierPlugin({
            appID: 'Laravel Mix',

            title: 'Laravel Mix',
            alwaysNotify: this.mix.config.notifications.onSuccess,
            timeout: false,
            hint: process.platform === 'linux' ? 'int:transient:1' : undefined,
            contentImage: this.mix.paths.root(
                'node_modules/laravel-mix/icons/laravel.png'
            )
        });
    }
}

module.exports = Notifications;
