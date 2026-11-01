// Gravewired - service worker (offline copy for the installed web app). Adapted from Cricket Arcade's.
//
// Template: vite.config.ts stamps VERSION and the file lists into dist/sw.js on every build.
//
//  - The page, manifest and icons: NETWORK FIRST. Online, a normal reopen gets the newest build; offline, the copy.
//  - Code in assets/ has a content hash in its name, so a cached copy is always right: CACHE FIRST.
//  - Models and icon art (models_opt/): CACHE FIRST in a cache that survives new builds. Each file is listed with a
//    hash of its contents, so a publish re-downloads only the models that actually changed.
//  - After the game's first screen is up, the page sends 'warm' and every model not yet saved is fetched, so the
//    second launch is fast and the whole game (later bosses too) plays offline.
const VERSION = '20261101-140543';
const CACHE = 'gravewired-' + VERSION;
const MODELS_CACHE = 'gravewired-models';

const CORE = ["./", "index.html", "app-icon/icon-192.png", "app-icon/icon-512.png", "app-icon/icon-maskable-512.png", "manifest.webmanifest"];
const ASSETS = ["assets/index-BINcDXag.js"];
/** [path, content hash] for every file under models_opt/. */
const MODELS = [["art_opt/fx_atlas.webp", 'cda8ef899fb5'],
  ["models_opt/bosses/B01_roadblock_A.glb", 'a362d5e16cf4'],
  ["models_opt/bosses/B01_roadblock_B.glb", '6a98032ded16'],
  ["models_opt/bosses/B02_brood_queen.glb", '46e891b1d2e3'],
  ["models_opt/bosses/B03_volt_king.glb", '3cdcf315cb51'],
  ["models_opt/bosses/B04_sporeheart_A.glb", 'fc56f737db41'],
  ["models_opt/bosses/B04_sporeheart_B.glb", '4b8837e704f0'],
  ["models_opt/bosses/B05_scrap_titan.glb", '290e4b9291b8'],
  ["models_opt/bosses/B06_overmind.glb", 'b1066566b0c1'],
  ["models_opt/bosses/B07_siren_van.glb", 'c9769b94e8d8'],
  ["models_opt/bosses/B08_neon_butcher.glb", '0b3e7c491656'],
  ["models_opt/bosses/B09_billboard_beast.glb", '2be8b7e05443'],
  ["models_opt/bosses/B10_meter_maid.glb", 'f1cd96525800'],
  ["models_opt/bosses/B11_riot_marshal.glb", '75fad451969b'],
  ["models_opt/bosses/B12_gutter_crown.glb", '251a51743d99'],
  ["models_opt/bosses/B13_tunnel_maw.glb", '7a72c2a43b6d'],
  ["models_opt/bosses/B14_signal_witch.glb", '3d6539b64e91'],
  ["models_opt/bosses/B15_carriage_crab.glb", 'a9630eba747c'],
  ["models_opt/bosses/B16_turnstile_ogre.glb", '3cc58bf358ed'],
  ["models_opt/bosses/B17_flood_pump.glb", '8b7cfad5faae'],
  ["models_opt/bosses/B18_coil_twins_A.glb", 'fc2e8902fdd9'],
  ["models_opt/bosses/B18_coil_twins_B.glb", '01b228b26eeb'],
  ["models_opt/bosses/B19_fuse_hound.glb", '1ef65bfbf6b9'],
  ["models_opt/bosses/B20_turbine_monk.glb", '4eac1ae8ddea'],
  ["models_opt/bosses/B21_breaker_jack.glb", '011d63087ebd'],
  ["models_opt/bosses/B22_static_widow.glb", 'a54f40914045'],
  ["models_opt/bosses/B23_bloom_bishop.glb", 'b4b2edc3b029'],
  ["models_opt/bosses/B24_root_wrestler.glb", '2ba0e81a78cb'],
  ["models_opt/enemies/E01_shambler_A.glb", '21bd1531eb3b'],
  ["models_opt/enemies/E01_shambler_B.glb", 'b76030a0738d'],
  ["models_opt/enemies/E02_runner_A.glb", '890bd438bc36'],
  ["models_opt/enemies/E02_runner_B.glb", '6c07ff43aae7'],
  ["models_opt/enemies/E03_brute_A.glb", 'c21342f79da0'],
  ["models_opt/enemies/E03_brute_B.glb", '159c2c7a24a0'],
  ["models_opt/enemies/E03_brute_C.glb", '058e5008b302'],
  ["models_opt/enemies/E04_spitter_A.glb", '708259819b91'],
  ["models_opt/enemies/E04_spitter_B.glb", 'bb6737b06ff1'],
  ["models_opt/enemies/E05_bomber_A.glb", '0870e0bac8fd'],
  ["models_opt/enemies/E05_bomber_B.glb", '9d57a927bcc0'],
  ["models_opt/enemies/E06_booster_A.glb", '68c02fa77a64'],
  ["models_opt/enemies/E06_booster_B.glb", 'ca7f964ad4a6'],
  ["models_opt/enemies/E06_booster_C.glb", 'a669e60054fe'],
  ["models_opt/enemies/E07_shieldbearer_A.glb", 'f816f720bf74'],
  ["models_opt/enemies/E07_shieldbearer_C.glb", '0b06959a0714'],
  ["models_opt/enemies/E08_burrower_A.glb", 'ddf463d54d64'],
  ["models_opt/enemies/E08_burrower_B.glb", '022d49565edf'],
  ["models_opt/enemies/E08_burrower_C.glb", 'f6afdced606c'],
  ["models_opt/enemies/E09_leaper_A.glb", '3cb911fc6ea8'],
  ["models_opt/enemies/E09_leaper_B.glb", '4db4c7b53092'],
  ["models_opt/enemies/E10_snarer_A.glb", 'c2c441440523'],
  ["models_opt/enemies/E10_snarer_B.glb", '1ff5f8ba1d37'],
  ["models_opt/enemies/E11_splitter_A.glb", '74a2c580ae6c'],
  ["models_opt/enemies/E11_splitter_B.glb", '04cf935fd732'],
  ["models_opt/enemies/E12_scavenger_A.glb", '39e7a48cb75e'],
  ["models_opt/enemies/E12_scavenger_B.glb", 'c0286c7d8c2a'],
  ["models_opt/enemies/E12_scavenger_C.glb", 'db61d6f7eaad'],
  ["models_opt/gear/GE01_patch_suit.glb", 'ca5c953531c3'],
  ["models_opt/gear/GE02_runner_boots.glb", '9e984fe9b8e5'],
  ["models_opt/gear/GE03_work_gloves.glb", 'e6c03e1e5c18'],
  ["models_opt/gear/GE04_bumper_suit.glb", 'e20813212ce6'],
  ["models_opt/gear/GE05_drain_boots.glb", 'c79766cf51a7'],
  ["models_opt/gear/GE06_coil_gloves.glb", '34df43798c2c'],
  ["models_opt/gear/GE07_thorn_suit.glb", 'd064229c9f15'],
  ["models_opt/gear/GE08_magnet_boots.glb", '8653c8f2a368'],
  ["models_opt/gear/GE09_lab_gloves.glb", 'e25379bd3a68'],
  ["models_opt/gear/GE10_blast_suit.glb", 'e1d31efb5bf2'],
  ["models_opt/gear/GE11_rail_boots.glb", 'd4eb36b387b8'],
  ["models_opt/gear/GE13_insulator_suit.glb", '70e220f54f11'],
  ["models_opt/gear/GE14_moss_boots.glb", '17f3dd2d7dd0'],
  ["models_opt/gear/GE15_lens_gloves.glb", 'e043e40552f3'],
  ["models_opt/gear/GE16_medic_suit.glb", '95f0134da1d6'],
  ["models_opt/gear/GE17_ghost_boots.glb", 'e405dad9e4ad'],
  ["models_opt/gear/GE18_hunter_gloves.glb", 'ec73786dbafb'],
  ["models_opt/gear/GE19_magnetweave_suit.glb", 'e78604a9e2b9'],
  ["models_opt/gear/GE20_grav_grip_gloves.glb", 'e8325e63f8cd'],
  ["models_opt/gear/GE21_symbiote_suit.glb", '75b80bd7c362'],
  ["models_opt/gear/GE22_sporestep_boots.glb", '8e11e3ce7cc2'],
  ["models_opt/gear/GE23_phase_boots.glb", 'c2c3a699e0fb'],
  ["models_opt/gear/GE24_relay_gloves.glb", '23b507b8382c'],
  ["models_opt/heroes/H01_rook.glb", '4e0897260cd0'],
  ["models_opt/heroes/H01_rook_neon.png", 'f8365dd02404'],
  ["models_opt/heroes/H02_flux.glb", '48f1d6658d8b'],
  ["models_opt/heroes/H02_flux_neon.png", 'bc3f79018957'],
  ["models_opt/heroes/H03_moss.glb", '81dc506d023c'],
  ["models_opt/heroes/H03_moss_neon.png", '06fa88aabe94'],
  ["models_opt/heroes/H04_patch.glb", '2c8200b26559'],
  ["models_opt/heroes/H04_patch_neon.png", '4742d13428f6'],
  ["models_opt/heroes/H05_jinx.glb", '8e068724a324'],
  ["models_opt/heroes/H05_jinx_neon.png", '3d2564efb14a'],
  ["models_opt/heroes/H06_bolt.glb", '3c51f69726d9'],
  ["models_opt/heroes/H06_bolt_neon.png", '160fe647f6a1'],
  ["models_opt/heroes/H07_vex.glb", 'acf5683a6599'],
  ["models_opt/heroes/H07_vex_neon.png", '86c6f01798b6'],
  ["models_opt/heroes/H08_nova.glb", '24fa66e89446'],
  ["models_opt/heroes/H08_nova_neon.png", '8197a55cdb6a'],
  ["models_opt/icons/G01_pulse_grenade.webp", 'a5cd9cdc7b59'],
  ["models_opt/icons/G02_decoy_beacon.webp", 'ebfc18c7c2d9'],
  ["models_opt/icons/G03_shield_emitter.webp", '2af2731ade76'],
  ["models_opt/icons/G04_grapple_reel.webp", 'bc7e2861a128'],
  ["models_opt/icons/G05_shock_net.webp", '11f57f12e463'],
  ["models_opt/icons/G06_repair_bot.webp", 'e274edd00b8b'],
  ["models_opt/icons/G07_repulsor.webp", 'e6bb43f75653'],
  ["models_opt/icons/G08_oil_sprayer.webp", '9b6d395842bd'],
  ["models_opt/icons/G09_laser_tripwire.webp", 'f9f3f62046ef'],
  ["models_opt/icons/G10_smoke_capsule.webp", 'cb36ae2b4588'],
  ["models_opt/icons/G11_magnetic_boots_rig.webp", '979863cf3b35'],
  ["models_opt/icons/G12_arc_turret.webp", '798055614b6e'],
  ["models_opt/icons/G13_cryo_bomb.webp", 'cebbb1d7783c'],
  ["models_opt/icons/G14_nano_swarm.webp", '821cbf97d529'],
  ["models_opt/icons/G15_kinetic_umbrella.webp", 'dd9cc295c40b'],
  ["models_opt/icons/G16_jump_jets.webp", '5b9b40b3c265'],
  ["models_opt/icons/G17_scrap_wall.webp", 'c0378c420e0c'],
  ["models_opt/icons/G18_scanner.webp", '9f344ada4104'],
  ["models_opt/icons/G19_salvage_claw.webp", 'f887a2ab52aa'],
  ["models_opt/icons/G20_polarity_beacon.webp", '43a931625625'],
  ["models_opt/icons/G21_mutagen_flask.webp", '9110ddc6d090'],
  ["models_opt/icons/G22_spore_screen.webp", 'cc33f1d01398'],
  ["models_opt/icons/G23_phase_anchor.webp", '778f1111f00e'],
  ["models_opt/icons/G24_holo_projector.webp", '772e88c940a8'],
  ["models_opt/icons/GE01_patch_suit.webp", 'd43e9cca01e7'],
  ["models_opt/icons/GE02_runner_boots.webp", '85613bf0352c'],
  ["models_opt/icons/GE03_work_gloves.webp", '497df10f86ac'],
  ["models_opt/icons/GE04_bumper_suit.webp", '063059be9fa8'],
  ["models_opt/icons/GE05_drain_boots.webp", '62fd2ac41a46'],
  ["models_opt/icons/GE06_coil_gloves.webp", 'b1e81aab7891'],
  ["models_opt/icons/GE07_thorn_suit.webp", '2436fbfb9e70'],
  ["models_opt/icons/GE08_magnet_boots.webp", '3a4b34f70140'],
  ["models_opt/icons/GE09_lab_gloves.webp", '221885aa8eda'],
  ["models_opt/icons/GE10_blast_suit.webp", 'cc7b2f7c83d9'],
  ["models_opt/icons/GE11_rail_boots.webp", '00f6c6ea9c8d'],
  ["models_opt/icons/GE12_grip_gloves.webp", '79db41fbfa05'],
  ["models_opt/icons/GE13_insulator_suit.webp", '06ab1f594f4f'],
  ["models_opt/icons/GE14_moss_boots.webp", '4d8a8b86fdfc'],
  ["models_opt/icons/GE15_lens_gloves.webp", 'a00d74cb4e59'],
  ["models_opt/icons/GE16_medic_suit.webp", '938e72b5614c'],
  ["models_opt/icons/GE17_ghost_boots.webp", 'd9fdc1f65514'],
  ["models_opt/icons/GE18_hunter_gloves.webp", 'e084306cfa80'],
  ["models_opt/icons/GE19_magnetweave_suit.webp", '0ff8830f4f56'],
  ["models_opt/icons/GE20_grav_grip_gloves.webp", 'e424b83aacbe'],
  ["models_opt/icons/GE21_symbiote_suit.webp", '9dfebffe19d8'],
  ["models_opt/icons/GE22_sporestep_boots.webp", '88e26aa6002e'],
  ["models_opt/icons/GE23_phase_boots.webp", 'e620e1597d36'],
  ["models_opt/icons/GE24_relay_gloves.webp", 'f5e6b03e2f41'],
  ["models_opt/icons/W01_rivet_gun.webp", '7b5939bb6034'],
  ["models_opt/icons/W02_scattergun.webp", '3dad63d3222c'],
  ["models_opt/icons/W03_returning_saw.webp", 'c0015d29b2ac'],
  ["models_opt/icons/W04_arc_coil.webp", '8e6e24296f69'],
  ["models_opt/icons/W05_foam_launcher.webp", '8f8e09de7844'],
  ["models_opt/icons/W06_flame_sprayer.webp", '89a03a9817e3'],
  ["models_opt/icons/W07_scrap_mortar.webp", 'd92cbde7ffc2'],
  ["models_opt/icons/W08_bolt_rail.webp", '28204231c785'],
  ["models_opt/icons/W09_magnet_puck.webp", 'da7c36f58351'],
  ["models_opt/icons/W10_mine_dispenser.webp", '1d89ee4e2323'],
  ["models_opt/icons/W11_guard_drone.webp", '646ba479f8ab'],
  ["models_opt/icons/W12_scrap_hammer.webp", 'bd001c4452a0'],
  ["models_opt/icons/W13_pulse_carbine.webp", 'eab024fee6cb'],
  ["models_opt/icons/W14_prism_disc.webp", 'c4ca38c50877'],
  ["models_opt/icons/W15_cryo_needle.webp", 'f33bfbfdaf7f'],
  ["models_opt/icons/W16_tesla_fork.webp", '1be21705ad5a'],
  ["models_opt/icons/W17_harpoon.webp", '83acfa015752'],
  ["models_opt/icons/W18_shard_sling.webp", '01739b7aa397'],
  ["models_opt/icons/W19_sonic_bell.webp", 'f1b7ed8773c2'],
  ["models_opt/icons/W20_plasma_bow.webp", 'e0b7d0250774'],
  ["models_opt/icons/W21_acid_vial.webp", 'ff4ceeee93c8'],
  ["models_opt/icons/W22_chakram.webp", '1b7ec1d40991'],
  ["models_opt/icons/W23_burst_nailgun.webp", 'a0aff9ff5929'],
  ["models_opt/icons/W24_gravity_wand.webp", 'bf763f3e45c6'],
  ["models_opt/icons/W25_laser_ribbon.webp", '0409ec3bf9cf'],
  ["models_opt/icons/W26_rocket_fist.webp", 'ffd58cbef56c'],
  ["models_opt/icons/W27_neon_siege_bazooka.webp", '9927b882a94f'],
  ["models_opt/icons/W28_prism_lance.webp", '898da2667570'],
  ["models_opt/icons/W29_spore_cannon.webp", '0ae37802e0b5'],
  ["models_opt/icons/W30_quantum_yoyo.webp", '8a1ab5e6f6b1'],
  ["models_opt/weapons/W01_rivet_gun.glb", 'cc9365354f75'],
  ["models_opt/weapons/W02_scattergun.glb", 'ab9871f2eb78'],
  ["models_opt/weapons/W03_returning_saw.glb", '4b0113574ff0'],
  ["models_opt/weapons/W04_arc_coil.glb", '1f895d344a13'],
  ["models_opt/weapons/W05_foam_launcher.glb", 'c9725c3100f7'],
  ["models_opt/weapons/W06_flame_sprayer.glb", '8b213a229a52'],
  ["models_opt/weapons/W07_scrap_mortar.glb", '9cd46e1b3bd7'],
  ["models_opt/weapons/W08_bolt_rail.glb", 'c42a361dca32'],
  ["models_opt/weapons/W09_magnet_puck.glb", 'd69df1b4b3ca'],
  ["models_opt/weapons/W10_mine_dispenser.glb", '6b62effb4ec3'],
  ["models_opt/weapons/W11_guard_drone.glb", '8cb394c5f30d'],
  ["models_opt/weapons/W12_scrap_hammer.glb", 'b41c9886b317'],
  ["models_opt/weapons/W13_pulse_carbine.glb", '77c135591cf2'],
  ["models_opt/weapons/W14_prism_disc.glb", 'f8d01f29152a'],
  ["models_opt/weapons/W15_cryo_needle.glb", '01a9b1c1825a'],
  ["models_opt/weapons/W16_tesla_fork.glb", 'c93ca61955a5'],
  ["models_opt/weapons/W17_harpoon.glb", 'bcf087bb12a3'],
  ["models_opt/weapons/W19_sonic_bell.glb", '7c585d2c2721'],
  ["models_opt/weapons/W20_plasma_bow.glb", '04c3199d1386'],
  ["models_opt/weapons/W21_acid_vial.glb", 'aa2b671f8fe9'],
  ["models_opt/weapons/W22_chakram.glb", '8d424fc0c7da'],
  ["models_opt/weapons/W23_burst_nailgun.glb", '4a24f6e72421'],
  ["models_opt/weapons/W24_gravity_wand.glb", '52b8914877b8'],
  ["models_opt/weapons/W25_laser_ribbon.glb", 'bdaed5cd95de'],
  ["models_opt/weapons/W26_rocket_fist.glb", '6bd51b56b2ba'],
  ["models_opt/weapons/W27_neon_siege_bazooka.glb", 'eb0ad53aa4c8'],
  ["models_opt/weapons/W28_prism_lance.glb", '80c443529ffd'],
  ["models_opt/weapons/W29_spore_cannon.glb", '466a3718e164'],
  ["models_opt/weapons/W30_quantum_yoyo.glb", '7ae0399b1951']];
const HASH = new Map(MODELS);

const scopePath = new URL(self.registration.scope).pathname;
const rel = (url) => {
  const p = new URL(url).pathname;
  return p.startsWith(scopePath) ? decodeURIComponent(p.slice(scopePath.length)) : null;
};
const modelKey = (path) => new Request(new URL(path + '?h=' + HASH.get(path), self.registration.scope).toString());

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // one file failing must not block the rest
      .then((c) => Promise.allSettled(CORE.concat(ASSETS).map((u) => c.add(new Request(u, { cache: 'reload' })))))
      .catch(() => { /* offline during install: runtime caching fills in */ })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('gravewired-') && k !== CACHE && k !== MODELS_CACHE).map((k) => caches.delete(k)));
    // drop saved models that are no longer in this build (or have changed)
    const mc = await caches.open(MODELS_CACHE), want = new Set(MODELS.map(([p]) => modelKey(p).url));
    for (const r of await mc.keys()) if (!want.has(r.url)) await mc.delete(r);
    await self.clients.claim();
  })());
});

async function modelFirst(path) {
  const mc = await caches.open(MODELS_CACHE), key = modelKey(path);
  const hit = await mc.match(key);
  if (hit) return hit;
  const res = await fetch(new URL(path, self.registration.scope).toString());
  if (res && res.ok) await mc.put(key, res.clone());
  return res;
}

async function cacheFirst(req) {
  const hit = await caches.match(req, { ignoreSearch: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
  return res;
}

async function networkFirst(req) {
  try {
    const res = await fetch(req, { cache: 'no-cache' });
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  } catch {
    const hit = await caches.match(req, { ignoreSearch: true });
    return hit || (req.mode === 'navigate' ? (await caches.match('./index.html')) || Response.error() : Response.error());
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const path = rel(req.url);
  if (path !== null && HASH.has(path)) event.respondWith(modelFirst(path).catch(() => Response.error()));
  else if (path !== null && path.startsWith('assets/')) event.respondWith(cacheFirst(req).catch(() => Response.error()));
  else event.respondWith(networkFirst(req));
});

// 'warm': save every model not saved yet, a few at a time (in the background; play is not held up)
let warming = null;
self.addEventListener('message', (event) => {
  if (event.data !== 'warm' || warming) return;
  warming = (async () => {
    const mc = await caches.open(MODELS_CACHE), todo = [];
    for (const [p] of MODELS) if (!(await mc.match(modelKey(p)))) todo.push(p);
    const next = async () => { while (todo.length) { try { await modelFirst(todo.shift()); } catch { /* offline: next time */ } } };
    await Promise.all([next(), next(), next()]);
  })().finally(() => { warming = null; });
  event.waitUntil(warming);
});
