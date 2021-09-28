import Mix from '../src/Mix';

export default async function () {
    const mix = Mix.primary;

    // Load the user's mix config
    await mix.load();

    // Install any missing dependencies
    await mix.installDependencies();

    // Start running
    await mix.init();

    // Turn everything into a config
    return await mix.build();
}
