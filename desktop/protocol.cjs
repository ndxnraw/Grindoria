const {pathToFileURL}=require('node:url');
function gameProtocolResponse(request,entry,fetchFile){
 const url=new URL(request.url);
 if(request.method!=='GET'||url.hostname!=='game'||!['/','/index.html'].includes(url.pathname))return new Response('Not found',{status:404});
 return fetchFile(pathToFileURL(entry).href).then(async response=>{
  const headers=new Headers(response.headers);
  headers.set('Content-Security-Policy',"default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-src 'none'");
  return new Response(response.body,{status:response.status,headers});
 });
}
module.exports={gameProtocolResponse};
