/**
 * Kestrel Vale — brand imagery generator (patient edition).
 * Sequential, retrying, skips files that already exist.
 * Run: nohup bun scripts/gen-images.ts > gen-images.log 2>&1 &
 */
import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import path from "path";

const OUT = path.resolve("public/img");
const STYLE =
  "warm editorial photography, soft dusk light, muted earthy palette of deep pine green, warm copper and cream, subtle film grain, high detail, no text, no watermark, no logos";

const JOBS: { file: string; prompt: string; size: string }[] = [
  {
    file: "hero-valley.jpg",
    size: "1536x768",
    prompt: `Cinematic wide aerial view of an alpine valley at golden dusk: a grand dark-timber lodge with warm glowing windows beside a mirror-calm lake, pine forest slopes, granite peaks dusted with first snow, low mist bands drifting over the water ${STYLE}`,
  },
  {
    file: "lodge-exterior.jpg",
    size: "1344x768",
    prompt: `Grand alpine lodge exterior at blue hour, dark timber and river stone architecture, warm amber windows, brass lanterns by the entrance, cedar trees framing the view, mountains behind ${STYLE}`,
  },
  {
    file: "room-suite.jpg",
    size: "1344x768",
    prompt: `Luxury alpine hotel suite interior, exposed timber beams, linen bed with wool throws in cream and rust tones, warm reading lamp, floor-to-ceiling window with mountain view, oak floors ${STYLE}, no people`,
  },
  {
    file: "room-attic.jpg",
    size: "864x1152",
    prompt: `Cozy attic hotel room under timber eaves, sloped ceiling with a round window, warm woven textiles, single armchair with a wool blanket, soft lamp glow ${STYLE}, no people`,
  },
  {
    file: "tent-glamp.jpg",
    size: "864x1152",
    prompt: `Interior of a luxury canvas glamping tent at dusk, wood stove with soft fire glow, layered wool blankets on a low bed, lantern light, pine trees visible through the open flap ${STYLE}, no people`,
  },
  {
    file: "dining-hall.jpg",
    size: "1344x768",
    prompt: `Fine dining room in an alpine lodge, long oak tables set with ceramic plates and brass candlesticks, deep green painted walls, dried flowers, candlelight, tall windows with dusk view ${STYLE}, no people`,
  },
  {
    file: "dish-tasting.jpg",
    size: "1024x1024",
    prompt: `Close-up of an elegant tasting course on a dark ceramic plate: roasted venison with foraged berries and pine sprig, minimal plating, dramatic side light, dark wooden table ${STYLE}, no people`,
  },
  {
    file: "wine-cellar.jpg",
    size: "1344x768",
    prompt: `Atmospheric candle-lit barrel hall of a mountain winery, rows of oak casks, dust motes in warm light beams, stone floor, brass tasting table with glasses ${STYLE}, no people`,
  },
  {
    file: "cafe-counter.jpg",
    size: "1344x768",
    prompt: `Corner bakery cafe interior in the morning, polished brass espresso machine, trays of croissants and cardamom buns, marble counter, soft window light, wool seats ${STYLE}, no people`,
  },
  {
    file: "trail-ridge.jpg",
    size: "1536x768",
    prompt: `Wide cinematic view of two hikers on a granite ridge trail above a sea of clouds at golden hour, alpine peaks, warm backlight, small figures in earth-toned gear ${STYLE}`,
  },
  {
    file: "lake-canoe.jpg",
    size: "1344x768",
    prompt: `A single wooden canoe resting on a glassy alpine lake at dawn, mist on the water, forested reflections, pastel sky with a hint of copper ${STYLE}, no people`,
  },
  {
    file: "camp-night.jpg",
    size: "1344x768",
    prompt: `Campground at night in a mountain valley, canvas tents glowing from lantern light, string lights between pines, small campfire with people toasting, dense star field and milky way above dark peaks ${STYLE}`,
  },
  {
    file: "barn-wedding.jpg",
    size: "1344x768",
    prompt: `Restored timber barn wedding reception at dusk, long banquet tables with candles and wildflowers, warm festoon string lights, guests in elegant attire dancing, mountains visible through open barn doors ${STYLE}`,
  },
  {
    file: "chef-portrait.jpg",
    size: "864x1152",
    prompt: `Portrait of a calm middle-aged chef in a dark apron standing in a candle-lit alpine kitchen, arms crossed, warm side light, copper pans hanging behind, genuine gentle expression ${STYLE}`,
  },
  {
    file: "guides.jpg",
    size: "1152x864",
    prompt: `Two professional mountain guides with ropes and helmets resting on a granite ledge, smiling at ease, warm afternoon light, alpine valley far below ${STYLE}`,
  },
  {
    file: "vineyard.jpg",
    size: "1344x768",
    prompt: `Terraced vineyard rows on a mountain valley slope at harvest time, warm copper autumn vines, wooden stakes, peaks behind, soft haze ${STYLE}, no people`,
  },
  {
    file: "village.jpg",
    size: "1152x864",
    prompt: `Charming alpine village street in late afternoon, timber chalets with flower boxes, a bakery awning and lampposts, cobbled lane, mountains behind ${STYLE}, no people`,
  },
  {
    file: "beans-product.jpg",
    size: "1024x1024",
    prompt: `Product photography of a kraft-paper coffee bag with a copper clasp on a cream linen cloth, scattered roasted coffee beans, soft studio light, minimal composition ${STYLE}, no people, no readable text on label, plain blank label`,
  },
  {
    file: "oven-fire.jpg",
    size: "1344x768",
    prompt: `Wood-fired pizza oven with dancing flames inside a dark cozy pizzeria, a pizzaiolo sliding a pizza on a long peel, sparks and warm glow, brick and steel ${STYLE}`,
  },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generateOne(zai: any, job: (typeof JOBS)[number]): Promise<Buffer> {
  let lastErr: any;
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const res = await zai.images.generations.create({
        prompt: job.prompt,
        size: job.size,
      });
      const b64 = res?.data?.[0]?.base64;
      if (!b64) throw new Error("empty base64");
      return Buffer.from(b64, "base64");
    } catch (e: any) {
      lastErr = e;
      const msg = String(e?.message ?? e);
      const is429 = msg.includes("429") || /too many/i.test(msg);
      const wait = is429 ? 15000 * attempt + Math.random() * 5000 : 4000 * attempt;
      console.log(`retry ${attempt} for ${job.file} in ${Math.round(wait / 1000)}s (${msg.slice(0, 90)})`);
      await sleep(wait);
    }
  }
  throw lastErr;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const zai = await ZAI.create();
  let ok = 0;
  const failed: string[] = [];

  for (const job of JOBS) {
    const dest = path.join(OUT, job.file);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10_000) {
      console.log(`skip ${job.file} (exists)`);
      ok++;
      continue;
    }
    try {
      const buf = await generateOne(zai, job);
      fs.writeFileSync(dest, buf);
      ok++;
      console.log(`OK ${job.file} (${Math.round(buf.length / 1024)}KB)`);
    } catch (e: any) {
      failed.push(job.file);
      console.error(`GIVEUP ${job.file}: ${String(e?.message ?? e).slice(0, 120)}`);
    }
    await sleep(2500); // pace the API
  }

  console.log(`DONE ${ok}/${JOBS.length}; failed: ${failed.length ? failed.join(", ") : "none"}`);
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
