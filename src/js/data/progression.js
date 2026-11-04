const PROGRESSION = {
  schema: 2,
  maxLevel: 99,
  maxSkillRank: 20,
  maxTraining: 20,
  maxEnhancement: 9,
  maxGemRank: 5,
  maxSpecialization: 10,
  maxParagon: 50,
  maxRiftTier: 100
};

const MATERIALS = {
  essence: 'Esencia', ore: 'Ruda', training: 'Tréningové pečate',
  books: 'Knihy schopností', dust: 'Alchymistický prach', upgradeStones: 'Kamene vylepšenia',
  wolf: 'Vlčie tkanivo', venom: 'Vak jedu', frost: 'Ľadové jadro',
  ember: 'Démonický popol', keys: 'Kľúče trhliny', shards: 'Úlomky relikvie'
};



const GEMS = {
  ruby: { name: 'Rubín', text: 'Útok +2 za každú úroveň kameňa na druhú.', color: '#dda092' },
  sapphire: { name: 'Zafír', text: 'Mana +15 a sila kúziel +2 za úroveň.', color: '#9fcde8' },
  jade: { name: 'Jadeit', text: 'Zdravie +10 a obrana +1 za úroveň.', color: '#a8d4af' }
};

const RELICS = {
  valley: { name: 'Zub prastarého strážcu', text: '+3 útok', bonus: { attack: 3 } },
  desert: { name: 'Oko pieskov', text: '+2 obrana', bonus: { defense: 2 } },
  snow: { name: 'Večný kryštál', text: '+25 zdravie', bonus: { hp: 25 } },
  temple: { name: 'Pečať plameňa', text: '+3 % kritický zásah', bonus: { crit: .03 } }
};

const SPECIALIZATIONS = {
  ravager: { name: 'Ničiteľ', text: 'Za bod: +1,5 % útok a +0,5 % kritický zásah.' },
  sentinel: { name: 'Ochranca', text: 'Za bod: +15 zdravie a +2 obrana.' },
  mystic: { name: 'Mystik', text: 'Za bod: +4 sila kúziel a +8 mana.' }
};
