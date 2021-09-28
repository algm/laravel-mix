const { assertSupportedNodeVersion } = require('../src/Engine');
const Mix = require("../src/Mix")

module.exports = () => {
    assertSupportedNodeVersion();

    const config = await import('./webpack.config.mjs');

    return await config.default();
};
