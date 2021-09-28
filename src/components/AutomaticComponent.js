/**
 * @deprecated Instead extend `Component` and set `passive` to `true`
 **/
class AutomaticComponent {
    /**
     * Create a new component instance.
     */
    constructor() {
        this.passive = true;
    }
}

module.exports = AutomaticComponent;
