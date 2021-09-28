import Mix from '../src/Mix';

export default async function () {
    const mix = Mix.shared;

    // Load the user's mix config
    await mix.load();

    // Prepare any matching build groups
    await mix.setup();

    // Install any missing dependencies
    await mix.installDependencies();

    // Start running
    await mix.init();

    // Turn everything into a config
    return await mix.build();
}
