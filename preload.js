export async function preloadSprites(variant) {
  console.log(`Preloading ${variant}`);
  const animations = [
    "Idle.png",
    "Run.png",
    "attack3.png",
    "hurt.png",
    "dead.png",
  ];

  await Promise.all(
    animations.map(async (animation) => {
      const img = new Image();
      img.src = `assets/${variant}/${animation}`;
      if (img.decode) await img.decode();
      console.log(`Loaded ${variant} ${animation}`);
    }),
  );
}
