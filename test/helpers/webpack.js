import webpack from 'webpack';

import { mix, Mix } from './mix.js';

/**
 *
 * @typedef {object} CompileResult
 * @property {import('webpack').Configuration} config The first configuration
 * @property {import('webpack').Configuration[]} configs All built configurations
 * @property {import('webpack').MultiStats | undefined} stats Stats for each build
 * @property {Error | undefined} err Any errors
 * @returns
 */

/**
 *
 * @param {boolean} shouldInit
 */
export async function buildConfigs(shouldInit = true) {
    if (shouldInit) {
        await Mix.init();
    }

    return await Mix.build();
}

/**
 *
 * @param {boolean} shouldInit
 */
export async function buildConfig(shouldInit = true) {
    const configs = await buildConfigs(shouldInit);

    return configs[0];
}

/**
 *
 * @param {import('webpack').Configuration[]} [config]
 * @returns {Promise<CompileResult>}
 */
export async function compile(config = []) {
    if (!config.length) {
        config = await buildConfigs();
    }

    return new Promise((resolve, reject) => {
        webpack(config, (err, stats) => {
            if (err) {
                reject({ config, err, stats });
            } else if (stats && stats.hasErrors()) {
                const { errors } = stats.toJson({ errors: true });

                reject({
                    config,
                    err: new Error((errors || []).map(error => error.message).join('\n')),
                    stats
                });
            } else {
                resolve({
                    config: config[0],
                    configs: config,
                    err,
                    stats
                });
            }
        });
    });
}

/**
 *
 * @param {string|number} version
 */
export function setupVueAliases(version) {
    /** @type {typeof Mix} */
    // @ts-ignore
    const context = global.Mix;

    const vueModule = version === 3 ? 'vue3' : 'vue2';
    const vueLoaderModule = version === 3 ? 'vue-loader16' : 'vue-loader15';

    context.resolver.alias('vue', vueModule);
    context.resolver.alias('vue-loader', vueLoaderModule);
    context.api.alias({ vue: require.resolve(vueModule) });
}

export default { buildConfig, compile, setupVueAliases };
