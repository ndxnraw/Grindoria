const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.join(__dirname, '../dist/Grindoria.html')).href);
    const uid = await page.evaluate(() => {
      createCharacter('Bonusy', 'warrior');
      playCharacter();
      p.level = 30;
      p.gold = 10000;
      loadMap('town', true);
      p.x = NPCS.merchant.x;
      p.y = NPCS.merchant.y;
      const item = createItem('weapon:fms');
      addGearItem(item);
      marketPanel();
      return item.uid;
    });

    for (const id of ['strengthenItem', 'enchantItem']) {
      await page.locator('[data-market-select="'+id+'"]').click();
      await page.locator('[data-market-buy="'+id+'"]').click();
    }
    await page.locator('[data-window-key="market:merchant"] .window-close').click();
    await page.keyboard.press('i');
    const inventory = page.locator('[data-window-key="inventory"]');
    const tool = id => inventory.locator('.inventory-bonus-tools [data-entry="material:'+id+'"]');
    const gear = inventory.locator('[data-entry="gear:'+uid+'"]');
    const equipped = inventory.locator('[data-entry="equipped:weapon"]');
    const state = () => page.evaluate(id => {
      const item = [...p.bag, p.equipped.weapon].find(gear => gear?.uid === id);
      return { innate: item.baseStats, affixes: item.affixes,
        add: p.career.materials.strengthenItem, reroll: p.career.materials.enchantItem };
    }, uid);

    const initial = await state();
    assert.equal(initial.add, 1);
    assert.equal(initial.reroll, 1);
    await tool('enchantItem').dragTo(gear);
    assert.deepEqual(await state(), initial);

    await tool('strengthenItem').dragTo(gear);
    const added = await state();
    assert.equal(added.add, 0);
    assert.equal(added.affixes.length, 1);
    assert.deepEqual(added.innate, initial.innate);
    await gear.hover();
    await inventory.getByText('Dodatočné bonusy').waitFor();
    await gear.dblclick();
    await inventory.locator('[data-inv-tab="supplies"]').click();
    await inventory.locator('.inventory-grid [data-entry="material:enchantItem"]').dragTo(equipped);
    const rerolled = await state();
    assert.equal(rerolled.reroll, 0);
    assert.equal(rerolled.affixes.length, 1);
    assert.notEqual(rerolled.affixes[0].stat, added.affixes[0].stat);
    assert.deepEqual(rerolled.innate, initial.innate);
    assert.deepEqual(errors, []);
    console.log('Merchant purchase, rejected drag, gear drag, equip and reroll passed.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
