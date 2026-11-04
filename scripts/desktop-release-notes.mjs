import {read,metadata} from './lib/project.mjs';
const version=metadata().version,changes=read('CHANGELOG.md'),start=changes.indexOf('## ['+version+']'),end=changes.indexOf('\n## [',start+1);
console.log('Windows x64: stiahni a spusti Grindoria-Setup-'+version+'-x64.exe.\n\nAktualizácie sa kontrolujú pri štarte aplikácie. Postavy ostávajú uložené v používateľskom profile; prenos z prehliadača používa export/import.\n\n'+changes.slice(start,end<0?undefined:end));
