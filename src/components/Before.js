const { Component } = require('./Component');

class Before extends Component {
    /**
     * @param  {() => void | Promise<void>} callback
     */
    register(callback) {
        this.context.mix.listen('init', callback);
    }
}

module.exports = Before;
