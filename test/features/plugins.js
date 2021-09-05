import test from 'ava';
import { zip } from 'lodash';
import sinon from 'sinon';

import { mix, Mix } from '../helpers/mix.js';
import webpack from '../helpers/webpack.js';

/** @typedef {import("../../types/component").ClassComponent} ClassComponent */

test('mix can be extended with new functionality as a callback', async t => {
    let registration = sinon.spy();

    mix.extend('foobar', registration);

    // @ts-ignore - there's no way to do declaration merging with JSDoc afaik
    mix.foobar('baz', 'buzz');

    let config = await webpack.buildConfig();

    t.true(registration.calledWith(config, 'baz', 'buzz'));
});

test('mix can be extended with new functionality as a class', t => {
    mix.extend(
        'foobar',
        class {
            /** @param {string} val */
            register(val) {
                t.is('baz', val);
            }
        }
    );

    // @ts-ignore - there's no way to do declaration merging with JSDoc afaik
    mix.foobar('baz');
});

test('mix can be extended with new functionality as a class instance', t => {
    mix.extend(
        'foobar',
        new (class {
            /** @param {string} val */
            register(val) {
                t.is('baz', val);
            }
        })()
    );

    // @ts-ignore - there's no way to do declaration merging with JSDoc afaik
    mix.foobar('baz');
});

test('dependencies can be requested for download', async t => {
    let Dependencies = require('../../src/Dependencies');

    Dependencies.queue = sinon.spy();
    Dependencies.installQueued = sinon.spy();

    mix.extend(
        'foobar',
        /** @implements ClassComponent */
        class {
            dependencies() {
                return ['npm-package'];
            }
        }
    );

    mix.extend('foobar2', {
        dependencies() {
            this.requiresReload = true;

            return ['npm-package2'];
        },

        register() {}
    });

    // @ts-ignore - there's no way to do declaration merging with JSDoc afaik
    mix.foobar();

    // @ts-ignore - there's no way to do declaration merging with JSDoc afaik
    mix.foobar2();

    await Mix.installDependencies();
    await Mix.init();

    /**
     * @template {(...args: any) => any} F
     * @typedef {sinon.SinonSpy<Parameters<F>, ReturnType<F>>} SpyFn
     **/

    t.true(
        Dependencies /** @type {any} */.queue
            .calledWith(['npm-package'], false)
    );
    t.true(
        Dependencies /** @type {any} */.queue
            .calledWith(['npm-package2'], true)
    );
    t.true(Dependencies.installQueued.calledWith());
});

test('webpack entry may be appended to', async t => {
    mix.extend(
        'foobar',
        class {
            register() {}

            webpackEntry(entry) {
                entry.add('foo', 'path');
            }
        }
    );

    // @ts-ignore - there's no way to do declaration merging with JSDoc afaik
    mix.foobar();

    const config = await webpack.buildConfig();

    t.deepEqual(['path'], config.entry.foo);
});

test('webpack rules may be added', async t => {
    let rule = {
        test: /\.ext/,
        loaders: ['example-loader']
    };

    mix.extend(
        'foobar',
        new (class {
            register() {}

            webpackRules() {
                return rule;
            }
        })()
    );

    // @ts-ignore - there's no way to do declaration merging with JSDoc afaik
    mix.foobar();

    const config = await webpack.buildConfig();

    t.deepEqual(config.module.rules.pop(), rule);
});

test('webpack plugins may be added', async t => {
    let plugin = sinon.stub();

    mix.extend(
        'foobar',
        new (class {
            register() {}

            webpackPlugins() {
                return plugin;
            }
        })()
    );

    // @ts-ignore - there's no way to do declaration merging with JSDoc afaik
    mix.foobar();

    const config = await webpack.buildConfig();

    t.is(plugin, config.plugins.pop());
});

test('the fully constructed webpack config object is available for modification, if needed', async t => {
    mix.extend(
        'extension',
        new (class {
            register() {}

            webpackConfig(config) {
                config.stats.performance = true;
            }
        })()
    );

    t.false((await webpack.buildConfig(false)).stats.performance);

    // @ts-ignore - there's no way to do declaration merging with JSDoc afaik
    mix.extension();

    t.true((await webpack.buildConfig(true)).stats.performance);
});

test('prior Mix components can be overwritten', t => {
    let component = {
        register: sinon.spy()
    };

    mix.extend('foo', component);

    let overridingComponent = {
        register: sinon.spy()
    };

    mix.extend('foo', overridingComponent);

    // @ts-ignore - there's no way to do declaration merging with JSDoc afaik
    mix.foo();

    t.true(component.register.notCalled);
    t.true(overridingComponent.register.called);
});

test('components can be passive', t => {
    let stub = sinon.spy();

    let component = new (class {
        register() {
            stub();
        }
    })();

    mix.extend('example', component);

    t.true(stub.notCalled);

    component = new (class {
        constructor() {
            this.passive = true;
        }

        register() {
            stub();
        }
    })();

    mix.extend('example', component);

    t.true(stub.called);
});

test('components can manually hook into the mix API', t => {
    let component = new (class {
        mix() {
            return {
                foo: arg => {
                    t.is('value', arg);
                },

                baz: arg => {
                    t.is('anotherValue', arg);
                }
            };
        }
    })();

    mix.extend('example', component);

    // @ts-ignore - there's no way to do declaration merging with JSDoc afaik
    mix.foo('value');

    // @ts-ignore - there's no way to do declaration merging with JSDoc afaik
    mix.baz('anotherValue');
});

test('components can be booted, after the webpack.mix.js configuration file has processed', async t => {
    let stub = sinon.spy();

    let component = new (class {
        boot() {
            stub();
        }
    })();

    mix.extend('example', component);

    // @ts-ignore - there's no way to do declaration merging with JSDoc afaik
    mix.example();

    t.false(stub.called);

    await Mix.init();

    t.true(stub.called);
});
