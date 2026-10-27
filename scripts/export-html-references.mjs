// Bounded HTML reference inspection; base elements are unsupported.
// Not a general HTML validator or CSS scanner.
const entities = {amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',colon:':',sol:'/',Tab:'\t',NewLine:'\n'};
function decode(value) {
 return value.replace(/&(#(?:x[0-9a-f]+|[0-9]+));?|&([^;\s&]*);/gi,(_,numeric,named)=>{
  const entity=numeric||named;
  if(Object.hasOwn(entities,entity))return entities[entity];
  if(/^#(?:[0-9]+|x[0-9a-f]+)$/i.test(entity)) {
   const n=entity[1].toLowerCase()==='x'?parseInt(entity.slice(2),16):Number(entity.slice(1));
   if(n>0&&n<=0x10ffff&&!(n>=0xd800&&n<=0xdfff))return String.fromCodePoint(n);
  }
  throw Error('Unsupported HTML entity in reference');
 });
}
export function htmlReferences(text) {
 const refs=[]; let i=0;
 while(i<text.length) {
  const start=text.indexOf('<',i);if(start<0)break;i=start;
  if(text.startsWith('<!--',i)){const end=text.indexOf('-->',i+4);if(end<0)throw Error('Malformed HTML comment');i=end+3;continue;}
  if(/^<!doctype\b/i.test(text.slice(i))){const end=text.indexOf('>',i);if(end<0)throw Error('Malformed HTML declaration');i=end+1;continue;}
  const tag=/^<\/?([a-z][a-z0-9:-]*)/i.exec(text.slice(i));
  if(!tag)throw Error('Malformed HTML tag');
  if(tag[1].toLowerCase()==='base')throw Error('Unsupported HTML base element');
  i+=tag[0].length;const attrs=new Map();let ended=false;
  while(i<text.length){
   const ws=/^[\t\n\f\r ]*/.exec(text.slice(i))[0];i+=ws.length;
   if(text.startsWith('/>',i)){i+=2;ended=true;break;}
   if(text[i]==='>'){i++;ended=true;break;}
   if(!ws.length)throw Error('Malformed HTML attribute separator');
   const attr=/^[^\s\x00-\x1f"'<>\/=]+/.exec(text.slice(i));if(!attr)throw Error('Malformed HTML attribute');
   const name=attr[0].toLowerCase();i+=attr[0].length;if(attrs.has(name))throw Error('Malformed HTML duplicate attribute');
   const equal=/^[\t\n\f\r ]*=\s*/.exec(text.slice(i));let value='';
   if(equal){i+=equal[0].length;const quote=text[i];
    if(quote==='"'||quote==="'"){const end=text.indexOf(quote,i+1);if(end<0)throw Error('Malformed HTML quoted attribute');value=text.slice(i+1,end);i=end+1;}
    else {const raw=/^[^\s"'`=<>]+/.exec(text.slice(i));if(!raw)throw Error('Malformed HTML unquoted attribute');value=raw[0];i+=value.length;}
   }
   attrs.set(name,value);
  }
  if(!ended)throw Error('Malformed HTML unfinished tag');
  for(const name of ['src','href','srcset'])if(attrs.has(name)){
   const value=decode(attrs.get(name));
   if(name!=='srcset'){refs.push(value);continue;}
   for(const candidate of value.split(',')){
    const match=/^\s*(\S+?)(?:\s+(?:[1-9][0-9]*w|(?:[0-9]*\.)?[0-9]+x))?\s*$/.exec(candidate);
    if(!match)throw Error('Malformed srcset');refs.push(match[1]);
   }
  }
  if(!tag[0].startsWith('</')&&/^(script|style|textarea|title)$/i.test(tag[1])){
   const close=new RegExp('</'+tag[1]+'\\s*>','ig');close.lastIndex=i;const match=close.exec(text);if(!match)throw Error('Malformed HTML raw text element');i=close.lastIndex;
  }
 }
 return refs;
}
