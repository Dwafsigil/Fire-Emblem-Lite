export async function preloadSprites(variant) {
  // console.log(`Preloading ${variant}`);
  const animations = [
    "idle.png",
    "run.png",
    "attack.png",
    "hurt.png",
    "dead.png",
  ];

  await Promise.all(
    animations.map(async (animation) => {
      const img = new Image();
      img.src = `assets/${variant}/${animation}`;
      if (img.decode) await img.decode();
      // console.log(`Loaded ${variant} ${animation}`);
    }),
  );
}

export function preloadImage(url) {
  const img = new Image();
  img.src = url;
}
