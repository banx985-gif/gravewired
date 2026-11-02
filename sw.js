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
const VERSION = '20261102-210959';
const CACHE = 'gravewired-' + VERSION;
const MODELS_CACHE = 'gravewired-models';

const CORE = ["./", "index.html", "app-icon/icon-192.png", "app-icon/icon-512.png", "app-icon/icon-maskable-512.png", "manifest.webmanifest"];
const ASSETS = ["assets/index-DlkEAI8i.js"];
/** [path, content hash] for every file under models_opt/. */
const MODELS = [["art_opt/district_D01_atlas.webp", 'cddf7889f07c'],
  ["art_opt/district_D02_atlas.webp", '4bbd113894fc'],
  ["art_opt/district_D03_atlas.webp", 'd1042c28f467'],
  ["art_opt/district_D04_atlas.webp", 'ea26c5bdabf2'],
  ["art_opt/district_D05_atlas.webp", 'a14d5f57fdde'],
  ["art_opt/district_D06_atlas.webp", '362b1633cfb6'],
  ["art_opt/events_atlas.webp", '9af52660f243'],
  ["art_opt/floor/D01_asphalt.webp", '698e529d359e'],
  ["art_opt/floor/D01_cracked_paving.webp", '5958043f993b'],
  ["art_opt/floor/D01_shop_tile.webp", 'db50677979f8'],
  ["art_opt/floor/D02_platform_concrete.webp", '5f0aac0358f8'],
  ["art_opt/floor/D02_service_tile.webp", '0f4424432db3'],
  ["art_opt/floor/D02_shallow_water.webp", '367087bb5508'],
  ["art_opt/floor/D03_cable_concrete.webp", 'd8077c241540'],
  ["art_opt/floor/D03_insulated_tile.webp", 'd8abcec28b54'],
  ["art_opt/floor/D03_metal_plate.webp", 'e590ee9cf102'],
  ["art_opt/floor/D04_greenhouse_tile.webp", '2599d5e8cf27'],
  ["art_opt/floor/D04_moss_floor.webp", '552c05ecb95c'],
  ["art_opt/floor/D04_root_soil.webp", 'd424da1d3130'],
  ["art_opt/floor/D05_conveyor_floor.webp", '78cfd75280df'],
  ["art_opt/floor/D05_rust_plate.webp", 'e649e4a45236'],
  ["art_opt/floor/D05_scrap_concrete.webp", '344c042d39b7'],
  ["art_opt/floor/D06_circuit_floor.webp", '395a7c313b6b'],
  ["art_opt/floor/D06_containment_floor.webp", '5ba76b12228e'],
  ["art_opt/floor/D06_lab_tile.webp", 'a76a9ca1fb01'],
  ["art_opt/fx_atlas.webp", 'd644954dfb1d'],
  ["art_opt/pic/banner_ARENA.webp", '566df3275df5'],
  ["art_opt/pic/banner_DEFENCE.webp", 'bb2d654e9744'],
  ["art_opt/pic/banner_EQUIPMENT_COLLECTION.webp", 'a0b53db74271'],
  ["art_opt/pic/banner_HERO_COLLECTION.webp", '3cbcc4bcc72a'],
  ["art_opt/pic/banner_LEGENDARY_WORKSHOP.webp", '23935758c477'],
  ["art_opt/pic/banner_OVERDRIVE_UNLOCK.webp", 'dece156389fa'],
  ["art_opt/pic/banner_REACTOR_RAIDS.webp", '2ef84cc795ff'],
  ["art_opt/pic/banner_RELIC_COLLECTION.webp", '4aa3c528b05a'],
  ["art_opt/pic/banner_SNAPSHOT_TOURNAMENT.webp", '9b9b185e7367'],
  ["art_opt/pic/banner_WEEKLY_WORLD.webp", '50387fe67d80'],
  ["art_opt/pic/bg_COLLECTION.webp", 'bb172b6248b4'],
  ["art_opt/pic/bg_HUB.webp", '878c9710c333'],
  ["art_opt/pic/bg_RESULTS.webp", '85770a399cff'],
  ["art_opt/pic/bg_SELECTION.webp", 'ee033464eb78'],
  ["art_opt/pic/bg_SKILLS.webp", 'ff3ee9aad64f'],
  ["art_opt/pic/bg_WORLD_MAP.webp", '98e817b2cffb'],
  ["art_opt/pic/event_BUNKER_BOARD_BG.webp", 'b513df3f7ac9'],
  ["art_opt/pic/event_BUNKER_PROMO_BANNER.webp", '10e2dd83f9f3'],
  ["art_opt/pic/event_BUNKER_STAGE_MAP_BG.webp", '13dde35532e2'],
  ["art_opt/pic/event_LAB_BOARD_BG.webp", '222e56bb9302'],
  ["art_opt/pic/event_LAB_PROMO_BANNER.webp", 'b191329346a8'],
  ["art_opt/pic/event_LAB_STAGE_MAP_BG.webp", '226bc7695364'],
  ["art_opt/pic/event_SCRAPYARD_BOARD_BG.webp", '11f03ea797ed'],
  ["art_opt/pic/event_SCRAPYARD_PROMO_BANNER.webp", '11d28cc912f8'],
  ["art_opt/pic/event_SCRAPYARD_STAGE_MAP_BG.webp", 'b532f6529d64'],
  ["art_opt/pic/keyart_landscape.webp", '4d583bb6c6f6'],
  ["art_opt/pic/loading_art.webp", 'e06a2dbddf0b'],
  ["art_opt/pic/logo_wide.webp", 'ada693b9431a'],
  ["art_opt/pic/overview_D01.webp", '2f16cb7f018e'],
  ["art_opt/pic/overview_D02.webp", 'edbd1c5d9e7f'],
  ["art_opt/pic/overview_D03.webp", '8a30382413b7'],
  ["art_opt/pic/overview_D04.webp", 'ebb38b7ca101'],
  ["art_opt/pic/overview_D05.webp", '60cf5fbe87bf'],
  ["art_opt/pic/overview_D06.webp", '3dea299ead41'],
  ["art_opt/relics_atlas.webp", '38ab09f172f5'],
  ["art_opt/tattoo_atlas.webp", 'cf85fa90e223'],
  ["art_opt/ui/boss_portrait_frame.webp", '79891122ed99'],
  ["art_opt/ui/bottom_sheet_panel.webp", '64d42331461d'],
  ["art_opt/ui/destructive_button.webp", '929200fb5471'],
  ["art_opt/ui/enemy_portrait_frame.webp", '18dbfd323133'],
  ["art_opt/ui/event_item_frame.webp", 'd6ae8133e7f3'],
  ["art_opt/ui/event_shop_tile.webp", 'e329cdde4999'],
  ["art_opt/ui/focus_bracket.webp", '40922201cc7d'],
  ["art_opt/ui/free_reward_cell.webp", 'ad9e481d1433'],
  ["art_opt/ui/graffiti_splash.webp", 'c2d483c79c46'],
  ["art_opt/ui/health_bar_track.webp", 'f40d32db26ea'],
  ["art_opt/ui/hero_portrait_frame.webp", '3f2406fc0c4a'],
  ["art_opt/ui/icon_button.webp", 'a9831cc7fa6f'],
  ["art_opt/ui/item_card.webp", '7e7e72b0f05f'],
  ["art_opt/ui/joystick_base.webp", '033dcec381d7'],
  ["art_opt/ui/joystick_knob.webp", '1ef8c0bb31d0'],
  ["art_opt/ui/metal_divider.webp", '1cc4f1094176'],
  ["art_opt/ui/modal_panel.webp", 'a95f30e5886e'],
  ["art_opt/ui/neon_corner.webp", 'ce46aeeddafb'],
  ["art_opt/ui/ordinary_item_frame.webp", '35b6511fdd96'],
  ["art_opt/ui/overdrive_bar_track.webp", '1ac3d97ae6a4'],
  ["art_opt/ui/paid_reward_cell.webp", '35a77225123a'],
  ["art_opt/ui/pass_header_trim.webp", 'b8bb69e56e86'],
  ["art_opt/ui/primary_button.webp", 'ef7e35e209f6'],
  ["art_opt/ui/relic_frame.webp", '2eccdbe6290a'],
  ["art_opt/ui/reward_card.webp", 'e24453ad1198'],
  ["art_opt/ui/round_action_button.webp", '2bbc711284ff'],
  ["art_opt/ui/secondary_button.webp", 'e2890015273f'],
  ["art_opt/ui/selection_ring.webp", '5aab56b66533'],
  ["art_opt/ui/shield_bar_track.webp", '01948252fea8'],
  ["art_opt/ui/small_tab.webp", '3496ff01f60d'],
  ["art_opt/ui/stage_node.webp", '5a6a4a472158'],
  ["art_opt/ui/star_socket.webp", '8d87e193c056'],
  ["art_opt/ui/toast_panel.webp", 'dc3be60d4ad6'],
  ["art_opt/ui/tooltip_panel.webp", 'fe5063ba376b'],
  ["art_opt/ui/torn_tape_strip.webp", '323acc42bb6a'],
  ["art_opt/ui/xp_bar_track.webp", '933c4ecd24d2'],
  ["art_opt/ui_icons.webp", '38c8750d07f2'],
  ["art_opt/world_atlas.webp", 'e30c4133bc60'],
  ["models_opt/bosses/B01_roadblock_A.glb", '2a72f3676d6c'],
  ["models_opt/bosses/B01_roadblock_B.glb", '7f3da103235d'],
  ["models_opt/bosses/B02_brood_queen.glb", '8461a80ad3a9'],
  ["models_opt/bosses/B03_volt_king.glb", '7c1bfdc850f6'],
  ["models_opt/bosses/B04_sporeheart_A.glb", '90b056e4448e'],
  ["models_opt/bosses/B04_sporeheart_B.glb", '1292e650d1c5'],
  ["models_opt/bosses/B05_scrap_titan.glb", '6e1baf4ad8f7'],
  ["models_opt/bosses/B06_overmind.glb", '1161fe02a776'],
  ["models_opt/bosses/B07_siren_van.glb", 'a111f79bb1d3'],
  ["models_opt/bosses/B08_neon_butcher.glb", '12ad546b5af4'],
  ["models_opt/bosses/B09_billboard_beast.glb", '1989f5b9434c'],
  ["models_opt/bosses/B10_meter_maid.glb", '3788372445d9'],
  ["models_opt/bosses/B11_riot_marshal.glb", '919bd6f7c870'],
  ["models_opt/bosses/B12_gutter_crown.glb", '67eea2359bec'],
  ["models_opt/bosses/B13_tunnel_maw.glb", '0df0eaff738d'],
  ["models_opt/bosses/B14_signal_witch.glb", '2839ea4cda43'],
  ["models_opt/bosses/B15_carriage_crab.glb", '7a84894cb7fc'],
  ["models_opt/bosses/B16_turnstile_ogre.glb", '508f25b8af57'],
  ["models_opt/bosses/B17_flood_pump.glb", 'bbdd8b534de6'],
  ["models_opt/bosses/B18_coil_twins_A.glb", 'f9944361aa84'],
  ["models_opt/bosses/B18_coil_twins_B.glb", '31d24320e0c1'],
  ["models_opt/bosses/B19_fuse_hound.glb", '4b6432deed3d'],
  ["models_opt/bosses/B20_turbine_monk.glb", 'fb29f5140aae'],
  ["models_opt/bosses/B21_breaker_jack.glb", '8224f874c53b'],
  ["models_opt/bosses/B22_static_widow.glb", '1378efbd307e'],
  ["models_opt/bosses/B23_bloom_bishop.glb", '61f7c8d42d97'],
  ["models_opt/bosses/B24_root_wrestler.glb", '3ad2ec75d1a7'],
  ["models_opt/bosses/B26_compost_duke.glb", '3c4b0a5cdc76'],
  ["models_opt/bosses/B27_orchid_choir_A.glb", '66df497bad25'],
  ["models_opt/bosses/B27_orchid_choir_C.glb", '1bf190d8d373'],
  ["models_opt/enemies/E01_shambler_A.glb", '99d0c4f1278c'],
  ["models_opt/enemies/E01_shambler_B.glb", 'b84437dc7233'],
  ["models_opt/enemies/E02_runner_A.glb", '3cd343b535a6'],
  ["models_opt/enemies/E02_runner_B.glb", 'add46ef3365f'],
  ["models_opt/enemies/E03_brute_A.glb", 'b68c1ea2043a'],
  ["models_opt/enemies/E03_brute_B.glb", 'd1bff93f8965'],
  ["models_opt/enemies/E03_brute_C.glb", 'd2289565066e'],
  ["models_opt/enemies/E04_spitter_A.glb", '1535060083a3'],
  ["models_opt/enemies/E04_spitter_B.glb", 'd8fedb4b8399'],
  ["models_opt/enemies/E05_bomber_A.glb", '1ca7e8e5683b'],
  ["models_opt/enemies/E05_bomber_B.glb", '19c8f39c1b89'],
  ["models_opt/enemies/E06_booster_A.glb", '7446b79775cc'],
  ["models_opt/enemies/E06_booster_B.glb", 'a2ace01a0e2b'],
  ["models_opt/enemies/E06_booster_C.glb", '2e5fa2001e1e'],
  ["models_opt/enemies/E07_shieldbearer_A.glb", '59e03478d491'],
  ["models_opt/enemies/E07_shieldbearer_C.glb", '26bbf3055dec'],
  ["models_opt/enemies/E08_burrower_A.glb", '00e16995b93a'],
  ["models_opt/enemies/E08_burrower_B.glb", 'a4086b17de91'],
  ["models_opt/enemies/E08_burrower_C.glb", 'a478bcc14e12'],
  ["models_opt/enemies/E09_leaper_A.glb", '2a09ad3ce80e'],
  ["models_opt/enemies/E09_leaper_B.glb", 'a81fd541a71d'],
  ["models_opt/enemies/E10_snarer_A.glb", 'd07b7399afe8'],
  ["models_opt/enemies/E10_snarer_B.glb", '48829069aa0a'],
  ["models_opt/enemies/E11_splitter_A.glb", '495df1ea6a78'],
  ["models_opt/enemies/E11_splitter_B.glb", 'ea7a56e0553a'],
  ["models_opt/enemies/E12_scavenger_A.glb", '3746865b980d'],
  ["models_opt/enemies/E12_scavenger_B.glb", 'a1a768bca2bd'],
  ["models_opt/enemies/E12_scavenger_C.glb", '544cdb4401f6'],
  ["models_opt/gear/GE01_patch_suit.glb", '2ae61c5da616'],
  ["models_opt/gear/GE02_runner_boots.glb", '49abba886822'],
  ["models_opt/gear/GE03_work_gloves.glb", 'e1f562a90afc'],
  ["models_opt/gear/GE04_bumper_suit.glb", '49d28a7d4b5d'],
  ["models_opt/gear/GE05_drain_boots.glb", 'f193db5d9511'],
  ["models_opt/gear/GE06_coil_gloves.glb", 'efe8ee4efe06'],
  ["models_opt/gear/GE07_thorn_suit.glb", 'b9272e8708d3'],
  ["models_opt/gear/GE08_magnet_boots.glb", 'cbca18c69c7d'],
  ["models_opt/gear/GE09_lab_gloves.glb", 'd3847dfaf05e'],
  ["models_opt/gear/GE10_blast_suit.glb", 'a3f80d71d09d'],
  ["models_opt/gear/GE11_rail_boots.glb", 'c4f4dab9b76b'],
  ["models_opt/gear/GE13_insulator_suit.glb", '6339d2e54e24'],
  ["models_opt/gear/GE14_moss_boots.glb", '53408baaa2c0'],
  ["models_opt/gear/GE15_lens_gloves.glb", '1e3a3f0c4769'],
  ["models_opt/gear/GE16_medic_suit.glb", '75cfbda9693b'],
  ["models_opt/gear/GE17_ghost_boots.glb", '8a903158fecc'],
  ["models_opt/gear/GE18_hunter_gloves.glb", '9b609b7cf921'],
  ["models_opt/gear/GE19_magnetweave_suit.glb", '5e722a51a50e'],
  ["models_opt/gear/GE20_grav_grip_gloves.glb", '5d1e3b20e9b0'],
  ["models_opt/gear/GE21_symbiote_suit.glb", '7f110a6bdb3d'],
  ["models_opt/gear/GE22_sporestep_boots.glb", '68c200f08f47'],
  ["models_opt/gear/GE23_phase_boots.glb", '4ea9d2b7b62f'],
  ["models_opt/gear/GE24_relay_gloves.glb", '51fa6761cf0c'],
  ["models_opt/heroes/H01_rook.glb", 'aafb2c9b3a9d'],
  ["models_opt/heroes/H01_rook_neon.png", 'f8365dd02404'],
  ["models_opt/heroes/H02_flux.glb", '402d1bacd900'],
  ["models_opt/heroes/H02_flux_neon.png", 'bc3f79018957'],
  ["models_opt/heroes/H03_moss.glb", 'f03878f1da1c'],
  ["models_opt/heroes/H03_moss_neon.png", '06fa88aabe94'],
  ["models_opt/heroes/H04_patch.glb", 'd85309f0245d'],
  ["models_opt/heroes/H04_patch_neon.png", '4742d13428f6'],
  ["models_opt/heroes/H05_jinx.glb", 'b186ad0ef4a1'],
  ["models_opt/heroes/H05_jinx_neon.png", '3d2564efb14a'],
  ["models_opt/heroes/H06_bolt.glb", '16a215319c86'],
  ["models_opt/heroes/H06_bolt_neon.png", '160fe647f6a1'],
  ["models_opt/heroes/H07_vex.glb", 'cb1bca2939fe'],
  ["models_opt/heroes/H07_vex_neon.png", '86c6f01798b6'],
  ["models_opt/heroes/H08_nova.glb", 'd89a154b27d1'],
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
  ["models_opt/weapons/W01_rivet_gun.glb", 'd553b7b9c123'],
  ["models_opt/weapons/W02_scattergun.glb", '935f6c004832'],
  ["models_opt/weapons/W03_returning_saw.glb", 'f3bfcf323ec4'],
  ["models_opt/weapons/W04_arc_coil.glb", '896cc989c232'],
  ["models_opt/weapons/W05_foam_launcher.glb", '084beb5b57c5'],
  ["models_opt/weapons/W06_flame_sprayer.glb", '8e1186d46277'],
  ["models_opt/weapons/W07_scrap_mortar.glb", '436858cc8491'],
  ["models_opt/weapons/W08_bolt_rail.glb", 'ae4c519439c1'],
  ["models_opt/weapons/W09_magnet_puck.glb", '0a305779a928'],
  ["models_opt/weapons/W10_mine_dispenser.glb", '908b802d20f0'],
  ["models_opt/weapons/W11_guard_drone.glb", '22832a37c965'],
  ["models_opt/weapons/W12_scrap_hammer.glb", 'c4e0f8d9e73b'],
  ["models_opt/weapons/W13_pulse_carbine.glb", '1875506de77f'],
  ["models_opt/weapons/W14_prism_disc.glb", '43f498968588'],
  ["models_opt/weapons/W15_cryo_needle.glb", '6c517694120b'],
  ["models_opt/weapons/W16_tesla_fork.glb", '5c162152764f'],
  ["models_opt/weapons/W17_harpoon.glb", '97a08c8c9aad'],
  ["models_opt/weapons/W19_sonic_bell.glb", '6632cbc2793c'],
  ["models_opt/weapons/W20_plasma_bow.glb", '1d7a5e4bf23b'],
  ["models_opt/weapons/W21_acid_vial.glb", '60de4eebd43d'],
  ["models_opt/weapons/W22_chakram.glb", '99d8f5fbdfef'],
  ["models_opt/weapons/W23_burst_nailgun.glb", 'a79e44b5b019'],
  ["models_opt/weapons/W24_gravity_wand.glb", '10d20b635657'],
  ["models_opt/weapons/W25_laser_ribbon.glb", 'fb5aedeafc9a'],
  ["models_opt/weapons/W26_rocket_fist.glb", '744e66659a09'],
  ["models_opt/weapons/W27_neon_siege_bazooka.glb", '666fab9ddc34'],
  ["models_opt/weapons/W28_prism_lance.glb", '32da06fbf7be'],
  ["models_opt/weapons/W29_spore_cannon.glb", '7bb6f56f5f0a'],
  ["models_opt/weapons/W30_quantum_yoyo.glb", '92d5e0a60ed9']];
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
