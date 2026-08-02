import Phaser from 'phaser';
import { DISTRICTS, FACTIONS } from '../data/campaign.js';
import { gameState, chooseSupport, repairRelay, addItem, districtProgress } from '../state/gameState.js';
import { saveGame } from '../state/save.js';
import { makeButton } from '../ui/button.js';

const AMBER = '#e0a83a';
const GREEN = '#9dff5c';

export class CampaignScene extends Phaser.Scene {
  constructor() { super('CampaignScene'); }

  init(data) { this.returnScene = data.returnScene ?? 'OverworldScene'; }

  create() {
    const bg = this.add.image(480, 320, 'bg-relay-command').setAlpha(0.33);
    bg.setScale(Math.max(960 / bg.width, 640 / bg.height));
    this.add.rectangle(480, 320, 960, 640, 0x0c0d0a, 0.55);
    this.add.rectangle(480, 76, 940, 96, 0x0c0d0a, 0.74).setStrokeStyle(1, 0x3a3d3c);
    this.add.text(480, 24, 'ASHVALE RELAY COMMAND', { fontFamily: 'monospace', fontSize: '20px', color: AMBER, fontStyle: 'bold' }).setOrigin(0.5);
    this.status = this.add.text(480, 54, '', { fontFamily: 'monospace', fontSize: '12px', color: '#c9a876', align: 'center' }).setOrigin(0.5);
    this.tracker = this.add.text(480, 77, '', { fontFamily: 'monospace', fontSize: '10px', color: '#8ae0d9', align: 'center', wordWrap: { width: 880 } }).setOrigin(0.5);
    this.message = this.add.text(480, 560, '', { fontFamily: 'monospace', fontSize: '12px', color: GREEN, align: 'center', wordWrap: { width: 820 } }).setOrigin(0.5);
    this.cards = DISTRICTS.map((district, index) => this.buildCard(district, 180 + index * 300));
    this.buildSupportDeck();
    makeButton(this, 850, 604, 'BACK', () => this.leave(), { width: 120, height: 38 });
    this.input.keyboard.on('keydown-ESC', () => this.leave());
    this.render();
  }

  buildCard(district, x) {
    const panel = this.add.rectangle(x, 285, 270, 330, 0x141712, 1).setStrokeStyle(2, district.accent);
    const title = this.add.text(x, 155, district.title, { fontFamily: 'monospace', fontSize: '15px', color: AMBER, align: 'center', wordWrap: { width: 240 } }).setOrigin(0.5);
    const desc = this.add.text(x, 196, district.subtitle, { fontFamily: 'monospace', fontSize: '11px', color: '#c9a876', align: 'center', wordWrap: { width: 230 } }).setOrigin(0.5);
    const state = this.add.text(x, 260, '', { fontFamily: 'monospace', fontSize: '12px', color: GREEN, align: 'center', wordWrap: { width: 235 } }).setOrigin(0.5);
      const objective = this.add.text(x, 315, `APEX: ${district.bossName.toUpperCase()}\nHAZARD: ${district.hazard}\n${district.landmarkLabel} x3`, { fontFamily: 'monospace', fontSize: '10px', color: '#8ab4e0', align: 'center', wordWrap: { width: 235 } }).setOrigin(0.5);
    const travel = makeButton(this, x, 400, 'DEPLOY', () => this.deploy(district.id), { width: 190, height: 40, fontSize: '13px' });
    const repair = makeButton(this, x, 452, `REPAIR (${district.repairCost})`, () => this.repair(district), { width: 190, height: 34, fontSize: '12px' });
    return { district, panel, title, desc, state, objective, travel, repair };
  }

  buildSupportDeck() {
    this.add.text(480, 492, 'CHOOSE FIELD SUPPORT FOR YOUR NEXT DEPLOYMENT', { fontFamily: 'monospace', fontSize: '11px', color: '#c9a876' }).setOrigin(0.5);
    this.supportButtons = Object.entries(FACTIONS).map(([id, faction], index) => makeButton(this, 250 + index * 230, 525, faction.name, () => this.support(id), { width: 210, height: 30, fontSize: '10px' }));
  }

  render() {
    const world = gameState.world;
    this.status.setText(world.relayRestored
      ? `RELAY ONLINE  •  SCRAP ${gameState.scrap}  •  ASHVALE CAN HEAR THE WORLD AGAIN`
      : `REPAIRS ${world.repaired}/3  •  SCRAP ${gameState.scrap}  •  RECOVER COMPONENTS, THEN FUND THE REPAIR`);
    this.cards.forEach((card) => {
      const { district, travel, repair, state } = card;
      const unlocked = world.repaired >= district.requiredRepairs;
      const complete = world.completedDistricts.includes(district.id);
      const component = world.components.includes(district.id);
      state.setText(!unlocked ? `LOCKED\nNEEDS ${district.requiredRepairs} RELAY REPAIR(S)`
        : component ? `COMPONENT SECURED\nFUND REPAIR: ${district.repairCost} SCRAP`
          : complete ? 'DISTRICT CLEARED' : 'SIGNAL DETECTED');
      travel.bg.setVisible(unlocked && !component && !world.relayRestored);
      travel.text.setVisible(unlocked && !component && !world.relayRestored);
      repair.bg.setVisible(component);
      repair.text.setVisible(component);
    });
    const active = DISTRICTS.find((district) => world.repaired >= district.requiredRepairs && !world.completedDistricts.includes(district.id));
    const progress = active ? districtProgress(active.id) : null;
    this.tracker.setText(active
      ? `NEXT SIGNAL: ${active.title} — ${active.objective} (${progress.landmarks.length}/3 ${active.landmarkLabel}S ONLINE)`
      : 'ALL SIGNALS SECURED — FUND ANY RECOVERED COMPONENTS TO RESTORE THE RELAY.');
    const support = world.currentSupport ? FACTIONS[world.currentSupport].name : 'NO SUPPORT SELECTED';
    this.message.setText(`CURRENT SUPPORT: ${support}. Faction support grants a field supply and changes the final relay call.`);
  }

  support(id) {
    const faction = FACTIONS[id];
    chooseSupport(id);
    addItem(faction.itemId);
    saveGame('field-support');
    this.message.setText(`${faction.reward.toUpperCase()} PACKED. ${faction.description}`);
    this.render();
  }

  deploy(id) {
    gameState.world.activeDistrict = id;
    saveGame('district-deploy');
    this.scene.launch('DistrictScene', { districtId: id });
    this.scene.sleep();
  }

  repair(district) {
    if (!repairRelay(district.id, district.repairCost)) {
      this.message.setText(`NOT ENOUGH SCRAP. ${district.repairCost} SCRAP IS REQUIRED TO STABILIZE THIS RELAY LINK.`);
      return;
    }
    saveGame('relay-repair');
    if (district.id === 'dead-towers') {
      this.scene.stop();
      this.scene.start('EndingScene');
      return;
    }
    this.message.setText(district.id === 'dead-towers'
      ? 'THE RELAY IS ONLINE. RETURN TO THE TOWERS TO HEAR THE FINAL TRANSMISSION.'
      : `${district.title} LINK REPAIRED. A NEW DISTRICT IS NOW REACHABLE.`);
    this.render();
  }

  leave() {
    this.scene.stop();
    this.scene.wake(this.returnScene);
  }
}
