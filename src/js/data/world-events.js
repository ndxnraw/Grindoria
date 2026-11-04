const WORLD_EVENT_RULES={schema:1,firstCheck:90,minCheck:120,maxCheck:180,maxMembers:5};
const WORLD_EVENTS={
 patrol:{name:'Elitná hliadka',kind:'group',chance:.20,duration:300,count:5,color:'#c3a1ed',objective:'Poraz päť elitných hliadkarov.',reward:'Yang a materiály; bonusové materiály len z primeraného cieľa.'},
 invasion:{name:'Prepad lovcov',kind:'group',chance:.12,duration:360,count:5,color:'#e6aa7d',objective:'Poraz veliteľa a štyroch elitných lovcov.',reward:'Yang a materiály; bonusové materiály len z primeraného cieľa.'},
 bounty:{name:'Žatva materiálov',kind:'drop',chance:.10,duration:240,count:0,color:'#b9d781',objective:'Farm v tejto mape počas udalosti.',reward:'Primeraná voľná príšera: ruda +1 (50 %), kameň vylepšenia +1 (10 %).'},
 boss:{name:'Prastarý strážca',kind:'boss',chance:.035,duration:420,count:1,color:'#f1c67d',objective:'Poraz vzácneho bossa pred koncom udalosti.',reward:'Yang, materiály a epická alebo lepšia výbava z primeraného cieľa.'},
 metin:{name:'Vzácny Metin',kind:'stone',chance:.025,duration:360,count:1,color:'#f3a4dd',objective:'Znič vzácny Metin pred koncom udalosti.',reward:'Pôvodný drop Metinu a bonusové Yang, materiály a výbava z primeraného cieľa.'},
 ruins:{name:'Skryté ruiny',kind:'secret',chance:.015,duration:480,count:0,color:'#8ed9d1',objective:'Nájdi ruiny. Značka sa objaví až pri priblížení.',reward:'Yang, materiály, výbava z primeranej mapy a trvalý záznam objavu.'},
 convoy:{name:'Démonický sprievod',kind:'group',chance:.01,duration:420,count:5,color:'#e49ac2',objective:'Poraz päť rôznych členov sprievodu.',reward:'Yang, materiály a epická alebo lepšia výbava z primeraného cieľa.'}
};
