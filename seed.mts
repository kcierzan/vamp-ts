import { createSeedClient } from "@snaplet/seed";

// You can use @snaplet/copycat to generate fake data for a field, for example:
// ```
// await seed.users([{ email: ({ seed }) => copycat.email(seed) }])
// ```
// More on this in our docs: https://docs.snaplet.dev/core-concepts/seed#inside-the-snapletseed-workflow
import { copycat } from "@snaplet/copycat";

// This is a basic example generated by Snaplet to start you off, check out the docs for where to go from here
// * For more on getting started with @snaplet/seed: https://docs.snaplet.dev/getting-started/quick-start/seed
// * For a more detailed reference: https://docs.snaplet.dev/core-concepts/seed

const seed = await createSeedClient({
  dryRun: process.env.DRY !== "0"
});

// Clears all existing data in the database, but keep the structure
await seed.$resetDatabase();

await seed.projects([
  {
    name: "Cool Jam 2024",
    description: "The track of the summer",
    bpm: 128.0,
    createdByUser: {
      email: ({ seed }) => copycat.email(seed, { domain: "example.org" })
    },
    tracks: (x) => x(6)
  },
  {
    name: "Tropical House",
    description: "a lot of steel drums - no tracks yet",
    bpm: 126.0,
    createdByUser: (ctx) => ctx.connect(({ store }) => store.users[0])
  }
]);