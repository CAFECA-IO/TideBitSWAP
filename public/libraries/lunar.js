/*! For license information please see lunar.js.LICENSE.txt */
(()=>{"use strict";var t={964:(t,e,r)=>{r.d(e,{Z:()=>M}),t=r.hmd(t);var n="input is invalid type",i="object"==typeof window,s=i?window:{};s.JS_SHA3_NO_WINDOW&&(i=!1);var o=!i&&"object"==typeof self;!s.JS_SHA3_NO_NODE_JS&&"object"==typeof process&&process.versions&&process.versions.node?s=r.g:o&&(s=self),!s.JS_SHA3_NO_COMMON_JS&&t.exports,"function"==typeof define&&r.amdO;var a=!s.JS_SHA3_NO_ARRAY_BUFFER&&"undefined"!=typeof ArrayBuffer,c="0123456789abcdef".split(""),l=[4,1024,262144,67108864],u=[0,8,16,24],h=[1,0,32898,0,32906,2147483648,2147516416,2147483648,32907,0,2147483649,0,2147516545,2147483648,32777,2147483648,138,0,136,0,2147516425,0,2147483658,0,2147516555,0,139,2147483648,32905,2147483648,32771,2147483648,32770,2147483648,128,2147483648,32778,0,2147483658,2147483648,2147516545,2147483648,32896,2147483648,2147483649,0,2147516424,2147483648],f=[224,256,384,512],p=[128,256],d=["hex","buffer","arrayBuffer","array","digest"],m={128:168,256:136};!s.JS_SHA3_NO_NODE_JS&&Array.isArray||(Array.isArray=function(t){return"[object Array]"===Object.prototype.toString.call(t)}),!a||!s.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW&&ArrayBuffer.isView||(ArrayBuffer.isView=function(t){return"object"==typeof t&&t.buffer&&t.buffer.constructor===ArrayBuffer});for(var g=function(t,e,r){return function(n){return new T(t,e,t).update(n)[r]()}},y=function(t,e,r){return function(n,i){return new T(t,e,i).update(n)[r]()}},w=function(t,e,r){return function(e,n,i,s){return A["cshake"+t].update(e,n,i,s)[r]()}},b=function(t,e,r){return function(e,n,i,s){return A["kmac"+t].update(e,n,i,s)[r]()}},v=function(t,e,r,n){for(var i=0;i<d.length;++i){var s=d[i];t[s]=e(r,n,s)}return t},x=function(t,e){var r=g(t,e,"hex");return r.create=function(){return new T(t,e,t)},r.update=function(t){return r.create().update(t)},v(r,g,t,e)},k=[{name:"keccak",padding:[1,256,65536,16777216],bits:f,createMethod:x},{name:"sha3",padding:[6,1536,393216,100663296],bits:f,createMethod:x},{name:"shake",padding:[31,7936,2031616,520093696],bits:p,createMethod:function(t,e){var r=y(t,e,"hex");return r.create=function(r){return new T(t,e,r)},r.update=function(t,e){return r.create(e).update(t)},v(r,y,t,e)}},{name:"cshake",padding:l,bits:p,createMethod:function(t,e){var r=m[t],n=w(t,0,"hex");return n.create=function(n,i,s){return i||s?new T(t,e,n).bytepad([i,s],r):A["shake"+t].create(n)},n.update=function(t,e,r,i){return n.create(e,r,i).update(t)},v(n,w,t,e)}},{name:"kmac",padding:l,bits:p,createMethod:function(t,e){var r=m[t],n=b(t,0,"hex");return n.create=function(n,i,s){return new I(t,e,i).bytepad(["KMAC",s],r).bytepad([n],r)},n.update=function(t,e,r,i){return n.create(t,r,i).update(e)},v(n,b,t,e)}}],A={},_=[],E=0;E<k.length;++E)for(var N=k[E],O=N.bits,S=0;S<O.length;++S){var C=N.name+"_"+O[S];if(_.push(C),A[C]=N.createMethod(O[S],N.padding),"sha3"!==N.name){var B=N.name+O[S];_.push(B),A[B]=A[C]}}function T(t,e,r){this.blocks=[],this.s=[],this.padding=e,this.outputBits=r,this.reset=!0,this.finalized=!1,this.block=0,this.start=0,this.blockCount=1600-(t<<1)>>5,this.byteCount=this.blockCount<<2,this.outputBlocks=r>>5,this.extraBytes=(31&r)>>3;for(var n=0;n<50;++n)this.s[n]=0}function I(t,e,r){T.call(this,t,e,r)}T.prototype.update=function(t){if(this.finalized)throw new Error("finalize already called");var e,r=typeof t;if("string"!==r){if("object"!==r)throw new Error(n);if(null===t)throw new Error(n);if(a&&t.constructor===ArrayBuffer)t=new Uint8Array(t);else if(!(Array.isArray(t)||a&&ArrayBuffer.isView(t)))throw new Error(n);e=!0}for(var i,s,o=this.blocks,c=this.byteCount,l=t.length,h=this.blockCount,f=0,p=this.s;f<l;){if(this.reset)for(this.reset=!1,o[0]=this.block,i=1;i<h+1;++i)o[i]=0;if(e)for(i=this.start;f<l&&i<c;++f)o[i>>2]|=t[f]<<u[3&i++];else for(i=this.start;f<l&&i<c;++f)(s=t.charCodeAt(f))<128?o[i>>2]|=s<<u[3&i++]:s<2048?(o[i>>2]|=(192|s>>6)<<u[3&i++],o[i>>2]|=(128|63&s)<<u[3&i++]):s<55296||s>=57344?(o[i>>2]|=(224|s>>12)<<u[3&i++],o[i>>2]|=(128|s>>6&63)<<u[3&i++],o[i>>2]|=(128|63&s)<<u[3&i++]):(s=65536+((1023&s)<<10|1023&t.charCodeAt(++f)),o[i>>2]|=(240|s>>18)<<u[3&i++],o[i>>2]|=(128|s>>12&63)<<u[3&i++],o[i>>2]|=(128|s>>6&63)<<u[3&i++],o[i>>2]|=(128|63&s)<<u[3&i++]);if(this.lastByteIndex=i,i>=c){for(this.start=i-c,this.block=o[h],i=0;i<h;++i)p[i]^=o[i];U(p),this.reset=!0}else this.start=i}return this},T.prototype.encode=function(t,e){var r=255&t,n=1,i=[r];for(r=255&(t>>=8);r>0;)i.unshift(r),r=255&(t>>=8),++n;return e?i.push(n):i.unshift(n),this.update(i),i.length},T.prototype.encodeString=function(t){var e,r=typeof t;if("string"!==r){if("object"!==r)throw new Error(n);if(null===t)throw new Error(n);if(a&&t.constructor===ArrayBuffer)t=new Uint8Array(t);else if(!(Array.isArray(t)||a&&ArrayBuffer.isView(t)))throw new Error(n);e=!0}var i=0,s=t.length;if(e)i=s;else for(var o=0;o<t.length;++o){var c=t.charCodeAt(o);c<128?i+=1:c<2048?i+=2:c<55296||c>=57344?i+=3:(c=65536+((1023&c)<<10|1023&t.charCodeAt(++o)),i+=4)}return i+=this.encode(8*i),this.update(t),i},T.prototype.bytepad=function(t,e){for(var r=this.encode(e),n=0;n<t.length;++n)r+=this.encodeString(t[n]);var i=e-r%e,s=[];return s.length=i,this.update(s),this},T.prototype.finalize=function(){if(!this.finalized){this.finalized=!0;var t=this.blocks,e=this.lastByteIndex,r=this.blockCount,n=this.s;if(t[e>>2]|=this.padding[3&e],this.lastByteIndex===this.byteCount)for(t[0]=t[r],e=1;e<r+1;++e)t[e]=0;for(t[r-1]|=2147483648,e=0;e<r;++e)n[e]^=t[e];U(n)}},T.prototype.toString=T.prototype.hex=function(){this.finalize();for(var t,e=this.blockCount,r=this.s,n=this.outputBlocks,i=this.extraBytes,s=0,o=0,a="";o<n;){for(s=0;s<e&&o<n;++s,++o)t=r[s],a+=c[t>>4&15]+c[15&t]+c[t>>12&15]+c[t>>8&15]+c[t>>20&15]+c[t>>16&15]+c[t>>28&15]+c[t>>24&15];o%e==0&&(U(r),s=0)}return i&&(t=r[s],a+=c[t>>4&15]+c[15&t],i>1&&(a+=c[t>>12&15]+c[t>>8&15]),i>2&&(a+=c[t>>20&15]+c[t>>16&15])),a},T.prototype.arrayBuffer=function(){this.finalize();var t,e=this.blockCount,r=this.s,n=this.outputBlocks,i=this.extraBytes,s=0,o=0,a=this.outputBits>>3;t=i?new ArrayBuffer(n+1<<2):new ArrayBuffer(a);for(var c=new Uint32Array(t);o<n;){for(s=0;s<e&&o<n;++s,++o)c[o]=r[s];o%e==0&&U(r)}return i&&(c[s]=r[s],t=t.slice(0,a)),t},T.prototype.buffer=T.prototype.arrayBuffer,T.prototype.digest=T.prototype.array=function(){this.finalize();for(var t,e,r=this.blockCount,n=this.s,i=this.outputBlocks,s=this.extraBytes,o=0,a=0,c=[];a<i;){for(o=0;o<r&&a<i;++o,++a)t=a<<2,e=n[o],c[t]=255&e,c[t+1]=e>>8&255,c[t+2]=e>>16&255,c[t+3]=e>>24&255;a%r==0&&U(n)}return s&&(t=a<<2,e=n[o],c[t]=255&e,s>1&&(c[t+1]=e>>8&255),s>2&&(c[t+2]=e>>16&255)),c},I.prototype=new T,I.prototype.finalize=function(){return this.encode(this.outputBits,!0),T.prototype.finalize.call(this)};var U=function(t){var e,r,n,i,s,o,a,c,l,u,f,p,d,m,g,y,w,b,v,x,k,A,_,E,N,O,S,C,B,T,I,U,M,D,P,R,H,j,L,F,z,W,q,G,V,$,J,X,Y,Z,K,Q,tt,et,rt,nt,it,st,ot,at,ct,lt,ut;for(n=0;n<48;n+=2)i=t[0]^t[10]^t[20]^t[30]^t[40],s=t[1]^t[11]^t[21]^t[31]^t[41],o=t[2]^t[12]^t[22]^t[32]^t[42],a=t[3]^t[13]^t[23]^t[33]^t[43],c=t[4]^t[14]^t[24]^t[34]^t[44],l=t[5]^t[15]^t[25]^t[35]^t[45],u=t[6]^t[16]^t[26]^t[36]^t[46],f=t[7]^t[17]^t[27]^t[37]^t[47],e=(p=t[8]^t[18]^t[28]^t[38]^t[48])^(o<<1|a>>>31),r=(d=t[9]^t[19]^t[29]^t[39]^t[49])^(a<<1|o>>>31),t[0]^=e,t[1]^=r,t[10]^=e,t[11]^=r,t[20]^=e,t[21]^=r,t[30]^=e,t[31]^=r,t[40]^=e,t[41]^=r,e=i^(c<<1|l>>>31),r=s^(l<<1|c>>>31),t[2]^=e,t[3]^=r,t[12]^=e,t[13]^=r,t[22]^=e,t[23]^=r,t[32]^=e,t[33]^=r,t[42]^=e,t[43]^=r,e=o^(u<<1|f>>>31),r=a^(f<<1|u>>>31),t[4]^=e,t[5]^=r,t[14]^=e,t[15]^=r,t[24]^=e,t[25]^=r,t[34]^=e,t[35]^=r,t[44]^=e,t[45]^=r,e=c^(p<<1|d>>>31),r=l^(d<<1|p>>>31),t[6]^=e,t[7]^=r,t[16]^=e,t[17]^=r,t[26]^=e,t[27]^=r,t[36]^=e,t[37]^=r,t[46]^=e,t[47]^=r,e=u^(i<<1|s>>>31),r=f^(s<<1|i>>>31),t[8]^=e,t[9]^=r,t[18]^=e,t[19]^=r,t[28]^=e,t[29]^=r,t[38]^=e,t[39]^=r,t[48]^=e,t[49]^=r,m=t[0],g=t[1],$=t[11]<<4|t[10]>>>28,J=t[10]<<4|t[11]>>>28,C=t[20]<<3|t[21]>>>29,B=t[21]<<3|t[20]>>>29,at=t[31]<<9|t[30]>>>23,ct=t[30]<<9|t[31]>>>23,W=t[40]<<18|t[41]>>>14,q=t[41]<<18|t[40]>>>14,D=t[2]<<1|t[3]>>>31,P=t[3]<<1|t[2]>>>31,y=t[13]<<12|t[12]>>>20,w=t[12]<<12|t[13]>>>20,X=t[22]<<10|t[23]>>>22,Y=t[23]<<10|t[22]>>>22,T=t[33]<<13|t[32]>>>19,I=t[32]<<13|t[33]>>>19,lt=t[42]<<2|t[43]>>>30,ut=t[43]<<2|t[42]>>>30,et=t[5]<<30|t[4]>>>2,rt=t[4]<<30|t[5]>>>2,R=t[14]<<6|t[15]>>>26,H=t[15]<<6|t[14]>>>26,b=t[25]<<11|t[24]>>>21,v=t[24]<<11|t[25]>>>21,Z=t[34]<<15|t[35]>>>17,K=t[35]<<15|t[34]>>>17,U=t[45]<<29|t[44]>>>3,M=t[44]<<29|t[45]>>>3,E=t[6]<<28|t[7]>>>4,N=t[7]<<28|t[6]>>>4,nt=t[17]<<23|t[16]>>>9,it=t[16]<<23|t[17]>>>9,j=t[26]<<25|t[27]>>>7,L=t[27]<<25|t[26]>>>7,x=t[36]<<21|t[37]>>>11,k=t[37]<<21|t[36]>>>11,Q=t[47]<<24|t[46]>>>8,tt=t[46]<<24|t[47]>>>8,G=t[8]<<27|t[9]>>>5,V=t[9]<<27|t[8]>>>5,O=t[18]<<20|t[19]>>>12,S=t[19]<<20|t[18]>>>12,st=t[29]<<7|t[28]>>>25,ot=t[28]<<7|t[29]>>>25,F=t[38]<<8|t[39]>>>24,z=t[39]<<8|t[38]>>>24,A=t[48]<<14|t[49]>>>18,_=t[49]<<14|t[48]>>>18,t[0]=m^~y&b,t[1]=g^~w&v,t[10]=E^~O&C,t[11]=N^~S&B,t[20]=D^~R&j,t[21]=P^~H&L,t[30]=G^~$&X,t[31]=V^~J&Y,t[40]=et^~nt&st,t[41]=rt^~it&ot,t[2]=y^~b&x,t[3]=w^~v&k,t[12]=O^~C&T,t[13]=S^~B&I,t[22]=R^~j&F,t[23]=H^~L&z,t[32]=$^~X&Z,t[33]=J^~Y&K,t[42]=nt^~st&at,t[43]=it^~ot&ct,t[4]=b^~x&A,t[5]=v^~k&_,t[14]=C^~T&U,t[15]=B^~I&M,t[24]=j^~F&W,t[25]=L^~z&q,t[34]=X^~Z&Q,t[35]=Y^~K&tt,t[44]=st^~at&lt,t[45]=ot^~ct&ut,t[6]=x^~A&m,t[7]=k^~_&g,t[16]=T^~U&E,t[17]=I^~M&N,t[26]=F^~W&D,t[27]=z^~q&P,t[36]=Z^~Q&G,t[37]=K^~tt&V,t[46]=at^~lt&et,t[47]=ct^~ut&rt,t[8]=A^~m&y,t[9]=_^~g&w,t[18]=U^~E&O,t[19]=M^~N&S,t[28]=W^~D&R,t[29]=q^~P&H,t[38]=Q^~G&$,t[39]=tt^~V&J,t[48]=lt^~et&nt,t[49]=ut^~rt&it,t[0]^=h[n],t[1]^=h[n+1]};const M=A},759:(t,e,r)=>{class n{static Avax={chainId:"0xa86a",chainName:"Avalanche Network",nativeCurrency:{symbol:"AVAX"},rpcUrls:["https://api.avax.network/ext/bc/C/rpc"],blockExplorerUrls:["https://cchain.explorer.avax.network/"]};static BSC={chainId:"0x38",chainName:"Binance Smart Chain Mainnet",nativeCurrency:{symbol:"BNB"},rpcUrls:["https://bsc-dataseed.binance.org/"],blockExplorerUrls:["https://bscscan.com/"]};static BSCTestnet={chainId:"0x61",chainName:"Binance Smart Chain Testnet",nativeCurrency:{symbol:"BNB"},rpcUrls:["https://data-seed-prebsc-1-s1.binance.org:8545/"],blockExplorerUrls:["https://testnet.bscscan.com"]};static Ethereum={chainId:"0x1",chainName:"Ethereum",nativeCurrency:{symbol:"ETH",decimals:18}};static FUJI={chainId:"0xa869",chainName:"Avalanche Network",nativeCurrency:{symbol:"AVAX"},rpcUrls:["https://api.avax-test.network/ext/bc/C/rpc"],blockExplorerUrls:["https://cchain.explorer.avax-test.network"]};static Huobi={chainId:"0x80",chainName:"HuobiChain",nativeCurrency:{symbol:"HT"},rpcUrls:["https://http-mainnet-node.huobichain.com/"],blockExplorerUrls:["https://hecoinfo.com/"]};static HuobiTestnet={chainId:"0x100",chainName:"HuobiChain Testnet",nativeCurrency:{symbol:"HT"},rpcUrls:["https://http-testnet.hecochain.com/"],blockExplorerUrls:["https://scan-testnet.hecochain.com"]};static Matic={chainId:"0x89",chainName:"Polygon",nativeCurrency:{symbol:"MATIC"},rpcUrls:["https://rpc-mainnet.maticvigil.com/"],blockExplorerUrls:["https://explorer.matic.network/"]};static Mumbai={chainId:"0x13881",chainName:"Polygon Testnet",nativeCurrency:{symbol:"MATIC"},rpcUrls:["https://rpc-mumbai.maticvigil.com/"],blockExplorerUrls:["https://mumbai-explorer.matic.today/"]};static Ropsten={chainId:"0x3",chainName:"ETH testnet Ropsten",nativeCurrency:{symbol:"ETH",decimals:18}};static Tidetime={chainId:"0x1f51",chainName:"Tidetime",nativeCurrency:{name:"Tidetime Token",symbol:"TTT",decimals:18},rpcUrls:["https://rpc.tidebit.network"],blockExplorerUrls:["https://explorer.tidebit.network"],iconUrls:["https://iconape.com/wp-content/png_logo_vector/tidebit.png"]};static xDAI={chainId:"0x64",chainName:"xDai",nativeCurrency:{symbol:"xDAI"},rpcUrls:["https://rpc.xdaichain.com/"],blockExplorerUrls:["https://blockscout.com/xdai/mainnet"]};static AvaxTestnet=this.FUJI;static EthereumTestnet=this.Ropsten;static Polygon=this.Matic;static get keys(){return Object.keys(this)}static findByChainId(t=""){let e=t.toString(16);return 0!=e.indexOf("0x")&&(e="0x".concat(e)),this.keys.map((t=>this[t])).find((t=>parseInt(t.chainId)==parseInt(e)))}}const i=n,s=class{static Metamask="Metamask";static imToken="imToken";static TideWallet="TideWallet";static Trust="Trust"},o=class{_isConnected=!1;_address;_blockchain;_assets=[];constructor(){}get isConnected(){return this._isConnected}get blockchain(){return this._blockchain}get address(){return this._address}get type(){return this._type}get wallet(){}async init(){}on(t,e){}connect(){}disconnect(){}send({to:t,amount:e,data:r}){}getAsset({contract:t}){}getBalance({contract:t,address:e}){}getData({contract:t,data:e,func:r,params:n}){}interfaceOf({contract:t,abi:e}){}},a=class extends o{_type=s.TideWallet},c=class extends o{_type=s.imToken},l=class{static startWith(t,e){let r;try{t.startsWith(e)||(r=e.concat(t))}catch(e){r=t}return r}static chunkSubstr(t,e){const r=Math.ceil(t.length/e),n=new Array(r);for(let i=0,s=0;i<r;++i,s+=e)n[i]=t.substr(s,e);return n}static stringToHex(t){let e,r,n=[],i=1;if("string"==typeof t){e=t;for(let t=0;t<e.length;t++){let r=e.charCodeAt(t)+1,s=Math.ceil(Math.log(r)/Math.log(256));i=s>i?s:i,n[t]=e.charCodeAt(t).toString(16).padStart(2*s,"0")}n=n.map((t=>t.padStart(2*i,"0"))),r=n.join("")}else try{r=t.toString(16)}catch(t){r=""}return r}static isHex(t){return/^0x[a-fA-F0-9]*$/.test(t)}static toHex(t){let e;if(null==t)e="";else if(this.isHex(t))e=t.substr(2);else if(Number.isInteger(t))e=t.toString(16);else if("string"==typeof t)e=this.stringToHex(t);else try{e=t.toString(16)}catch(t){e=""}return e}};var u,h=r(964),f=/^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i,p=Math.ceil,d=Math.floor,m="[BigNumber Error] ",g=m+"Number primitive has more than 15 significant digits: ",y=1e14,w=14,b=9007199254740991,v=[1,10,100,1e3,1e4,1e5,1e6,1e7,1e8,1e9,1e10,1e11,1e12,1e13],x=1e7,k=1e9;function A(t){var e=0|t;return t>0||t===e?e:e-1}function _(t){for(var e,r,n=1,i=t.length,s=t[0]+"";n<i;){for(e=t[n++]+"",r=w-e.length;r--;e="0"+e);s+=e}for(i=s.length;48===s.charCodeAt(--i););return s.slice(0,i+1||1)}function E(t,e){var r,n,i=t.c,s=e.c,o=t.s,a=e.s,c=t.e,l=e.e;if(!o||!a)return null;if(r=i&&!i[0],n=s&&!s[0],r||n)return r?n?0:-a:o;if(o!=a)return o;if(r=o<0,n=c==l,!i||!s)return n?0:!i^r?1:-1;if(!n)return c>l^r?1:-1;for(a=(c=i.length)<(l=s.length)?c:l,o=0;o<a;o++)if(i[o]!=s[o])return i[o]>s[o]^r?1:-1;return c==l?0:c>l^r?1:-1}function N(t,e,r,n){if(t<e||t>r||t!==d(t))throw Error(m+(n||"Argument")+("number"==typeof t?t<e||t>r?" out of range: ":" not an integer: ":" not a primitive number: ")+String(t))}function O(t){var e=t.c.length-1;return A(t.e/w)==e&&t.c[e]%2!=0}function S(t,e){return(t.length>1?t.charAt(0)+"."+t.slice(1):t)+(e<0?"e":"e+")+e}function C(t,e,r){var n,i;if(e<0){for(i=r+".";++e;i+=r);t=i+t}else if(++e>(n=t.length)){for(i=r,e-=n;--e;i+=r);t+=i}else e<n&&(t=t.slice(0,e)+"."+t.slice(e));return t}u=function t(e){var r,n,i,s,o,a,c,l,u,h,B=W.prototype={constructor:W,toString:null,valueOf:null},T=new W(1),I=20,U=4,M=-7,D=21,P=-1e7,R=1e7,H=!1,j=1,L=0,F={prefix:"",groupSize:3,secondaryGroupSize:0,groupSeparator:",",decimalSeparator:".",fractionGroupSize:0,fractionGroupSeparator:" ",suffix:""},z="0123456789abcdefghijklmnopqrstuvwxyz";function W(t,e){var r,s,o,a,c,l,u,h,p=this;if(!(p instanceof W))return new W(t,e);if(null==e){if(t&&!0===t._isBigNumber)return p.s=t.s,void(!t.c||t.e>R?p.c=p.e=null:t.e<P?p.c=[p.e=0]:(p.e=t.e,p.c=t.c.slice()));if((l="number"==typeof t)&&0*t==0){if(p.s=1/t<0?(t=-t,-1):1,t===~~t){for(a=0,c=t;c>=10;c/=10,a++);return void(a>R?p.c=p.e=null:(p.e=a,p.c=[t]))}h=String(t)}else{if(!f.test(h=String(t)))return i(p,h,l);p.s=45==h.charCodeAt(0)?(h=h.slice(1),-1):1}(a=h.indexOf("."))>-1&&(h=h.replace(".","")),(c=h.search(/e/i))>0?(a<0&&(a=c),a+=+h.slice(c+1),h=h.substring(0,c)):a<0&&(a=h.length)}else{if(N(e,2,z.length,"Base"),10==e)return $(p=new W(t),I+p.e+1,U);if(h=String(t),l="number"==typeof t){if(0*t!=0)return i(p,h,l,e);if(p.s=1/t<0?(h=h.slice(1),-1):1,W.DEBUG&&h.replace(/^0\.0*|\./,"").length>15)throw Error(g+t)}else p.s=45===h.charCodeAt(0)?(h=h.slice(1),-1):1;for(r=z.slice(0,e),a=c=0,u=h.length;c<u;c++)if(r.indexOf(s=h.charAt(c))<0){if("."==s){if(c>a){a=u;continue}}else if(!o&&(h==h.toUpperCase()&&(h=h.toLowerCase())||h==h.toLowerCase()&&(h=h.toUpperCase()))){o=!0,c=-1,a=0;continue}return i(p,String(t),l,e)}l=!1,(a=(h=n(h,e,10,p.s)).indexOf("."))>-1?h=h.replace(".",""):a=h.length}for(c=0;48===h.charCodeAt(c);c++);for(u=h.length;48===h.charCodeAt(--u););if(h=h.slice(c,++u)){if(u-=c,l&&W.DEBUG&&u>15&&(t>b||t!==d(t)))throw Error(g+p.s*t);if((a=a-c-1)>R)p.c=p.e=null;else if(a<P)p.c=[p.e=0];else{if(p.e=a,p.c=[],c=(a+1)%w,a<0&&(c+=w),c<u){for(c&&p.c.push(+h.slice(0,c)),u-=w;c<u;)p.c.push(+h.slice(c,c+=w));c=w-(h=h.slice(c)).length}else c-=u;for(;c--;h+="0");p.c.push(+h)}}else p.c=[p.e=0]}function q(t,e,r,n){var i,s,o,a,c;if(null==r?r=U:N(r,0,8),!t.c)return t.toString();if(i=t.c[0],o=t.e,null==e)c=_(t.c),c=1==n||2==n&&(o<=M||o>=D)?S(c,o):C(c,o,"0");else if(s=(t=$(new W(t),e,r)).e,a=(c=_(t.c)).length,1==n||2==n&&(e<=s||s<=M)){for(;a<e;c+="0",a++);c=S(c,s)}else if(e-=o,c=C(c,s,"0"),s+1>a){if(--e>0)for(c+=".";e--;c+="0");}else if((e+=s-a)>0)for(s+1==a&&(c+=".");e--;c+="0");return t.s<0&&i?"-"+c:c}function G(t,e){for(var r,n=1,i=new W(t[0]);n<t.length;n++){if(!(r=new W(t[n])).s){i=r;break}e.call(i,r)&&(i=r)}return i}function V(t,e,r){for(var n=1,i=e.length;!e[--i];e.pop());for(i=e[0];i>=10;i/=10,n++);return(r=n+r*w-1)>R?t.c=t.e=null:r<P?t.c=[t.e=0]:(t.e=r,t.c=e),t}function $(t,e,r,n){var i,s,o,a,c,l,u,h=t.c,f=v;if(h){t:{for(i=1,a=h[0];a>=10;a/=10,i++);if((s=e-i)<0)s+=w,o=e,u=(c=h[l=0])/f[i-o-1]%10|0;else if((l=p((s+1)/w))>=h.length){if(!n)break t;for(;h.length<=l;h.push(0));c=u=0,i=1,o=(s%=w)-w+1}else{for(c=a=h[l],i=1;a>=10;a/=10,i++);u=(o=(s%=w)-w+i)<0?0:c/f[i-o-1]%10|0}if(n=n||e<0||null!=h[l+1]||(o<0?c:c%f[i-o-1]),n=r<4?(u||n)&&(0==r||r==(t.s<0?3:2)):u>5||5==u&&(4==r||n||6==r&&(s>0?o>0?c/f[i-o]:0:h[l-1])%10&1||r==(t.s<0?8:7)),e<1||!h[0])return h.length=0,n?(e-=t.e+1,h[0]=f[(w-e%w)%w],t.e=-e||0):h[0]=t.e=0,t;if(0==s?(h.length=l,a=1,l--):(h.length=l+1,a=f[w-s],h[l]=o>0?d(c/f[i-o]%f[o])*a:0),n)for(;;){if(0==l){for(s=1,o=h[0];o>=10;o/=10,s++);for(o=h[0]+=a,a=1;o>=10;o/=10,a++);s!=a&&(t.e++,h[0]==y&&(h[0]=1));break}if(h[l]+=a,h[l]!=y)break;h[l--]=0,a=1}for(s=h.length;0===h[--s];h.pop());}t.e>R?t.c=t.e=null:t.e<P&&(t.c=[t.e=0])}return t}function J(t){var e,r=t.e;return null===r?t.toString():(e=_(t.c),e=r<=M||r>=D?S(e,r):C(e,r,"0"),t.s<0?"-"+e:e)}return W.clone=t,W.ROUND_UP=0,W.ROUND_DOWN=1,W.ROUND_CEIL=2,W.ROUND_FLOOR=3,W.ROUND_HALF_UP=4,W.ROUND_HALF_DOWN=5,W.ROUND_HALF_EVEN=6,W.ROUND_HALF_CEIL=7,W.ROUND_HALF_FLOOR=8,W.EUCLID=9,W.config=W.set=function(t){var e,r;if(null!=t){if("object"!=typeof t)throw Error(m+"Object expected: "+t);if(t.hasOwnProperty(e="DECIMAL_PLACES")&&(N(r=t[e],0,k,e),I=r),t.hasOwnProperty(e="ROUNDING_MODE")&&(N(r=t[e],0,8,e),U=r),t.hasOwnProperty(e="EXPONENTIAL_AT")&&((r=t[e])&&r.pop?(N(r[0],-k,0,e),N(r[1],0,k,e),M=r[0],D=r[1]):(N(r,-k,k,e),M=-(D=r<0?-r:r))),t.hasOwnProperty(e="RANGE"))if((r=t[e])&&r.pop)N(r[0],-k,-1,e),N(r[1],1,k,e),P=r[0],R=r[1];else{if(N(r,-k,k,e),!r)throw Error(m+e+" cannot be zero: "+r);P=-(R=r<0?-r:r)}if(t.hasOwnProperty(e="CRYPTO")){if((r=t[e])!==!!r)throw Error(m+e+" not true or false: "+r);if(r){if("undefined"==typeof crypto||!crypto||!crypto.getRandomValues&&!crypto.randomBytes)throw H=!r,Error(m+"crypto unavailable");H=r}else H=r}if(t.hasOwnProperty(e="MODULO_MODE")&&(N(r=t[e],0,9,e),j=r),t.hasOwnProperty(e="POW_PRECISION")&&(N(r=t[e],0,k,e),L=r),t.hasOwnProperty(e="FORMAT")){if("object"!=typeof(r=t[e]))throw Error(m+e+" not an object: "+r);F=r}if(t.hasOwnProperty(e="ALPHABET")){if("string"!=typeof(r=t[e])||/^.?$|[+\-.\s]|(.).*\1/.test(r))throw Error(m+e+" invalid: "+r);z=r}}return{DECIMAL_PLACES:I,ROUNDING_MODE:U,EXPONENTIAL_AT:[M,D],RANGE:[P,R],CRYPTO:H,MODULO_MODE:j,POW_PRECISION:L,FORMAT:F,ALPHABET:z}},W.isBigNumber=function(t){if(!t||!0!==t._isBigNumber)return!1;if(!W.DEBUG)return!0;var e,r,n=t.c,i=t.e,s=t.s;t:if("[object Array]"=={}.toString.call(n)){if((1===s||-1===s)&&i>=-k&&i<=k&&i===d(i)){if(0===n[0]){if(0===i&&1===n.length)return!0;break t}if((e=(i+1)%w)<1&&(e+=w),String(n[0]).length==e){for(e=0;e<n.length;e++)if((r=n[e])<0||r>=y||r!==d(r))break t;if(0!==r)return!0}}}else if(null===n&&null===i&&(null===s||1===s||-1===s))return!0;throw Error(m+"Invalid BigNumber: "+t)},W.maximum=W.max=function(){return G(arguments,B.lt)},W.minimum=W.min=function(){return G(arguments,B.gt)},W.random=(s=9007199254740992,o=Math.random()*s&2097151?function(){return d(Math.random()*s)}:function(){return 8388608*(1073741824*Math.random()|0)+(8388608*Math.random()|0)},function(t){var e,r,n,i,s,a=0,c=[],l=new W(T);if(null==t?t=I:N(t,0,k),i=p(t/w),H)if(crypto.getRandomValues){for(e=crypto.getRandomValues(new Uint32Array(i*=2));a<i;)(s=131072*e[a]+(e[a+1]>>>11))>=9e15?(r=crypto.getRandomValues(new Uint32Array(2)),e[a]=r[0],e[a+1]=r[1]):(c.push(s%1e14),a+=2);a=i/2}else{if(!crypto.randomBytes)throw H=!1,Error(m+"crypto unavailable");for(e=crypto.randomBytes(i*=7);a<i;)(s=281474976710656*(31&e[a])+1099511627776*e[a+1]+4294967296*e[a+2]+16777216*e[a+3]+(e[a+4]<<16)+(e[a+5]<<8)+e[a+6])>=9e15?crypto.randomBytes(7).copy(e,a):(c.push(s%1e14),a+=7);a=i/7}if(!H)for(;a<i;)(s=o())<9e15&&(c[a++]=s%1e14);for(i=c[--a],t%=w,i&&t&&(s=v[w-t],c[a]=d(i/s)*s);0===c[a];c.pop(),a--);if(a<0)c=[n=0];else{for(n=-1;0===c[0];c.splice(0,1),n-=w);for(a=1,s=c[0];s>=10;s/=10,a++);a<w&&(n-=w-a)}return l.e=n,l.c=c,l}),W.sum=function(){for(var t=1,e=arguments,r=new W(e[0]);t<e.length;)r=r.plus(e[t++]);return r},n=function(){var t="0123456789";function e(t,e,r,n){for(var i,s,o=[0],a=0,c=t.length;a<c;){for(s=o.length;s--;o[s]*=e);for(o[0]+=n.indexOf(t.charAt(a++)),i=0;i<o.length;i++)o[i]>r-1&&(null==o[i+1]&&(o[i+1]=0),o[i+1]+=o[i]/r|0,o[i]%=r)}return o.reverse()}return function(n,i,s,o,a){var c,l,u,h,f,p,d,m,g=n.indexOf("."),y=I,w=U;for(g>=0&&(h=L,L=0,n=n.replace(".",""),p=(m=new W(i)).pow(n.length-g),L=h,m.c=e(C(_(p.c),p.e,"0"),10,s,t),m.e=m.c.length),u=h=(d=e(n,i,s,a?(c=z,t):(c=t,z))).length;0==d[--h];d.pop());if(!d[0])return c.charAt(0);if(g<0?--u:(p.c=d,p.e=u,p.s=o,d=(p=r(p,m,y,w,s)).c,f=p.r,u=p.e),g=d[l=u+y+1],h=s/2,f=f||l<0||null!=d[l+1],f=w<4?(null!=g||f)&&(0==w||w==(p.s<0?3:2)):g>h||g==h&&(4==w||f||6==w&&1&d[l-1]||w==(p.s<0?8:7)),l<1||!d[0])n=f?C(c.charAt(1),-y,c.charAt(0)):c.charAt(0);else{if(d.length=l,f)for(--s;++d[--l]>s;)d[l]=0,l||(++u,d=[1].concat(d));for(h=d.length;!d[--h];);for(g=0,n="";g<=h;n+=c.charAt(d[g++]));n=C(n,u,c.charAt(0))}return n}}(),r=function(){function t(t,e,r){var n,i,s,o,a=0,c=t.length,l=e%x,u=e/x|0;for(t=t.slice();c--;)a=((i=l*(s=t[c]%x)+(n=u*s+(o=t[c]/x|0)*l)%x*x+a)/r|0)+(n/x|0)+u*o,t[c]=i%r;return a&&(t=[a].concat(t)),t}function e(t,e,r,n){var i,s;if(r!=n)s=r>n?1:-1;else for(i=s=0;i<r;i++)if(t[i]!=e[i]){s=t[i]>e[i]?1:-1;break}return s}function r(t,e,r,n){for(var i=0;r--;)t[r]-=i,i=t[r]<e[r]?1:0,t[r]=i*n+t[r]-e[r];for(;!t[0]&&t.length>1;t.splice(0,1));}return function(n,i,s,o,a){var c,l,u,h,f,p,m,g,b,v,x,k,_,E,N,O,S,C=n.s==i.s?1:-1,B=n.c,T=i.c;if(!(B&&B[0]&&T&&T[0]))return new W(n.s&&i.s&&(B?!T||B[0]!=T[0]:T)?B&&0==B[0]||!T?0*C:C/0:NaN);for(b=(g=new W(C)).c=[],C=s+(l=n.e-i.e)+1,a||(a=y,l=A(n.e/w)-A(i.e/w),C=C/w|0),u=0;T[u]==(B[u]||0);u++);if(T[u]>(B[u]||0)&&l--,C<0)b.push(1),h=!0;else{for(E=B.length,O=T.length,u=0,C+=2,(f=d(a/(T[0]+1)))>1&&(T=t(T,f,a),B=t(B,f,a),O=T.length,E=B.length),_=O,x=(v=B.slice(0,O)).length;x<O;v[x++]=0);S=T.slice(),S=[0].concat(S),N=T[0],T[1]>=a/2&&N++;do{if(f=0,(c=e(T,v,O,x))<0){if(k=v[0],O!=x&&(k=k*a+(v[1]||0)),(f=d(k/N))>1)for(f>=a&&(f=a-1),m=(p=t(T,f,a)).length,x=v.length;1==e(p,v,m,x);)f--,r(p,O<m?S:T,m,a),m=p.length,c=1;else 0==f&&(c=f=1),m=(p=T.slice()).length;if(m<x&&(p=[0].concat(p)),r(v,p,x,a),x=v.length,-1==c)for(;e(T,v,O,x)<1;)f++,r(v,O<x?S:T,x,a),x=v.length}else 0===c&&(f++,v=[0]);b[u++]=f,v[0]?v[x++]=B[_]||0:(v=[B[_]],x=1)}while((_++<E||null!=v[0])&&C--);h=null!=v[0],b[0]||b.splice(0,1)}if(a==y){for(u=1,C=b[0];C>=10;C/=10,u++);$(g,s+(g.e=u+l*w-1)+1,o,h)}else g.e=l,g.r=+h;return g}}(),a=/^(-?)0([xbo])(?=\w[\w.]*$)/i,c=/^([^.]+)\.$/,l=/^\.([^.]+)$/,u=/^-?(Infinity|NaN)$/,h=/^\s*\+(?=[\w.])|^\s+|\s+$/g,i=function(t,e,r,n){var i,s=r?e:e.replace(h,"");if(u.test(s))t.s=isNaN(s)?null:s<0?-1:1;else{if(!r&&(s=s.replace(a,(function(t,e,r){return i="x"==(r=r.toLowerCase())?16:"b"==r?2:8,n&&n!=i?t:e})),n&&(i=n,s=s.replace(c,"$1").replace(l,"0.$1")),e!=s))return new W(s,i);if(W.DEBUG)throw Error(m+"Not a"+(n?" base "+n:"")+" number: "+e);t.s=null}t.c=t.e=null},B.absoluteValue=B.abs=function(){var t=new W(this);return t.s<0&&(t.s=1),t},B.comparedTo=function(t,e){return E(this,new W(t,e))},B.decimalPlaces=B.dp=function(t,e){var r,n,i,s=this;if(null!=t)return N(t,0,k),null==e?e=U:N(e,0,8),$(new W(s),t+s.e+1,e);if(!(r=s.c))return null;if(n=((i=r.length-1)-A(this.e/w))*w,i=r[i])for(;i%10==0;i/=10,n--);return n<0&&(n=0),n},B.dividedBy=B.div=function(t,e){return r(this,new W(t,e),I,U)},B.dividedToIntegerBy=B.idiv=function(t,e){return r(this,new W(t,e),0,1)},B.exponentiatedBy=B.pow=function(t,e){var r,n,i,s,o,a,c,l,u=this;if((t=new W(t)).c&&!t.isInteger())throw Error(m+"Exponent not an integer: "+J(t));if(null!=e&&(e=new W(e)),o=t.e>14,!u.c||!u.c[0]||1==u.c[0]&&!u.e&&1==u.c.length||!t.c||!t.c[0])return l=new W(Math.pow(+J(u),o?2-O(t):+J(t))),e?l.mod(e):l;if(a=t.s<0,e){if(e.c?!e.c[0]:!e.s)return new W(NaN);(n=!a&&u.isInteger()&&e.isInteger())&&(u=u.mod(e))}else{if(t.e>9&&(u.e>0||u.e<-1||(0==u.e?u.c[0]>1||o&&u.c[1]>=24e7:u.c[0]<8e13||o&&u.c[0]<=9999975e7)))return s=u.s<0&&O(t)?-0:0,u.e>-1&&(s=1/s),new W(a?1/s:s);L&&(s=p(L/w+2))}for(o?(r=new W(.5),a&&(t.s=1),c=O(t)):c=(i=Math.abs(+J(t)))%2,l=new W(T);;){if(c){if(!(l=l.times(u)).c)break;s?l.c.length>s&&(l.c.length=s):n&&(l=l.mod(e))}if(i){if(0===(i=d(i/2)))break;c=i%2}else if($(t=t.times(r),t.e+1,1),t.e>14)c=O(t);else{if(0==(i=+J(t)))break;c=i%2}u=u.times(u),s?u.c&&u.c.length>s&&(u.c.length=s):n&&(u=u.mod(e))}return n?l:(a&&(l=T.div(l)),e?l.mod(e):s?$(l,L,U,void 0):l)},B.integerValue=function(t){var e=new W(this);return null==t?t=U:N(t,0,8),$(e,e.e+1,t)},B.isEqualTo=B.eq=function(t,e){return 0===E(this,new W(t,e))},B.isFinite=function(){return!!this.c},B.isGreaterThan=B.gt=function(t,e){return E(this,new W(t,e))>0},B.isGreaterThanOrEqualTo=B.gte=function(t,e){return 1===(e=E(this,new W(t,e)))||0===e},B.isInteger=function(){return!!this.c&&A(this.e/w)>this.c.length-2},B.isLessThan=B.lt=function(t,e){return E(this,new W(t,e))<0},B.isLessThanOrEqualTo=B.lte=function(t,e){return-1===(e=E(this,new W(t,e)))||0===e},B.isNaN=function(){return!this.s},B.isNegative=function(){return this.s<0},B.isPositive=function(){return this.s>0},B.isZero=function(){return!!this.c&&0==this.c[0]},B.minus=function(t,e){var r,n,i,s,o=this,a=o.s;if(e=(t=new W(t,e)).s,!a||!e)return new W(NaN);if(a!=e)return t.s=-e,o.plus(t);var c=o.e/w,l=t.e/w,u=o.c,h=t.c;if(!c||!l){if(!u||!h)return u?(t.s=-e,t):new W(h?o:NaN);if(!u[0]||!h[0])return h[0]?(t.s=-e,t):new W(u[0]?o:3==U?-0:0)}if(c=A(c),l=A(l),u=u.slice(),a=c-l){for((s=a<0)?(a=-a,i=u):(l=c,i=h),i.reverse(),e=a;e--;i.push(0));i.reverse()}else for(n=(s=(a=u.length)<(e=h.length))?a:e,a=e=0;e<n;e++)if(u[e]!=h[e]){s=u[e]<h[e];break}if(s&&(i=u,u=h,h=i,t.s=-t.s),(e=(n=h.length)-(r=u.length))>0)for(;e--;u[r++]=0);for(e=y-1;n>a;){if(u[--n]<h[n]){for(r=n;r&&!u[--r];u[r]=e);--u[r],u[n]+=y}u[n]-=h[n]}for(;0==u[0];u.splice(0,1),--l);return u[0]?V(t,u,l):(t.s=3==U?-1:1,t.c=[t.e=0],t)},B.modulo=B.mod=function(t,e){var n,i,s=this;return t=new W(t,e),!s.c||!t.s||t.c&&!t.c[0]?new W(NaN):!t.c||s.c&&!s.c[0]?new W(s):(9==j?(i=t.s,t.s=1,n=r(s,t,0,3),t.s=i,n.s*=i):n=r(s,t,0,j),(t=s.minus(n.times(t))).c[0]||1!=j||(t.s=s.s),t)},B.multipliedBy=B.times=function(t,e){var r,n,i,s,o,a,c,l,u,h,f,p,d,m,g,b=this,v=b.c,k=(t=new W(t,e)).c;if(!(v&&k&&v[0]&&k[0]))return!b.s||!t.s||v&&!v[0]&&!k||k&&!k[0]&&!v?t.c=t.e=t.s=null:(t.s*=b.s,v&&k?(t.c=[0],t.e=0):t.c=t.e=null),t;for(n=A(b.e/w)+A(t.e/w),t.s*=b.s,(c=v.length)<(h=k.length)&&(d=v,v=k,k=d,i=c,c=h,h=i),i=c+h,d=[];i--;d.push(0));for(m=y,g=x,i=h;--i>=0;){for(r=0,f=k[i]%g,p=k[i]/g|0,s=i+(o=c);s>i;)r=((l=f*(l=v[--o]%g)+(a=p*l+(u=v[o]/g|0)*f)%g*g+d[s]+r)/m|0)+(a/g|0)+p*u,d[s--]=l%m;d[s]=r}return r?++n:d.splice(0,1),V(t,d,n)},B.negated=function(){var t=new W(this);return t.s=-t.s||null,t},B.plus=function(t,e){var r,n=this,i=n.s;if(e=(t=new W(t,e)).s,!i||!e)return new W(NaN);if(i!=e)return t.s=-e,n.minus(t);var s=n.e/w,o=t.e/w,a=n.c,c=t.c;if(!s||!o){if(!a||!c)return new W(i/0);if(!a[0]||!c[0])return c[0]?t:new W(a[0]?n:0*i)}if(s=A(s),o=A(o),a=a.slice(),i=s-o){for(i>0?(o=s,r=c):(i=-i,r=a),r.reverse();i--;r.push(0));r.reverse()}for((i=a.length)-(e=c.length)<0&&(r=c,c=a,a=r,e=i),i=0;e;)i=(a[--e]=a[e]+c[e]+i)/y|0,a[e]=y===a[e]?0:a[e]%y;return i&&(a=[i].concat(a),++o),V(t,a,o)},B.precision=B.sd=function(t,e){var r,n,i,s=this;if(null!=t&&t!==!!t)return N(t,1,k),null==e?e=U:N(e,0,8),$(new W(s),t,e);if(!(r=s.c))return null;if(n=(i=r.length-1)*w+1,i=r[i]){for(;i%10==0;i/=10,n--);for(i=r[0];i>=10;i/=10,n++);}return t&&s.e+1>n&&(n=s.e+1),n},B.shiftedBy=function(t){return N(t,-9007199254740991,b),this.times("1e"+t)},B.squareRoot=B.sqrt=function(){var t,e,n,i,s,o=this,a=o.c,c=o.s,l=o.e,u=I+4,h=new W("0.5");if(1!==c||!a||!a[0])return new W(!c||c<0&&(!a||a[0])?NaN:a?o:1/0);if(0==(c=Math.sqrt(+J(o)))||c==1/0?(((e=_(a)).length+l)%2==0&&(e+="0"),c=Math.sqrt(+e),l=A((l+1)/2)-(l<0||l%2),n=new W(e=c==1/0?"5e"+l:(e=c.toExponential()).slice(0,e.indexOf("e")+1)+l)):n=new W(c+""),n.c[0])for((c=(l=n.e)+u)<3&&(c=0);;)if(s=n,n=h.times(s.plus(r(o,s,u,1))),_(s.c).slice(0,c)===(e=_(n.c)).slice(0,c)){if(n.e<l&&--c,"9999"!=(e=e.slice(c-3,c+1))&&(i||"4999"!=e)){+e&&(+e.slice(1)||"5"!=e.charAt(0))||($(n,n.e+I+2,1),t=!n.times(n).eq(o));break}if(!i&&($(s,s.e+I+2,0),s.times(s).eq(o))){n=s;break}u+=4,c+=4,i=1}return $(n,n.e+I+1,U,t)},B.toExponential=function(t,e){return null!=t&&(N(t,0,k),t++),q(this,t,e,1)},B.toFixed=function(t,e){return null!=t&&(N(t,0,k),t=t+this.e+1),q(this,t,e)},B.toFormat=function(t,e,r){var n,i=this;if(null==r)null!=t&&e&&"object"==typeof e?(r=e,e=null):t&&"object"==typeof t?(r=t,t=e=null):r=F;else if("object"!=typeof r)throw Error(m+"Argument not an object: "+r);if(n=i.toFixed(t,e),i.c){var s,o=n.split("."),a=+r.groupSize,c=+r.secondaryGroupSize,l=r.groupSeparator||"",u=o[0],h=o[1],f=i.s<0,p=f?u.slice(1):u,d=p.length;if(c&&(s=a,a=c,c=s,d-=s),a>0&&d>0){for(s=d%a||a,u=p.substr(0,s);s<d;s+=a)u+=l+p.substr(s,a);c>0&&(u+=l+p.slice(s)),f&&(u="-"+u)}n=h?u+(r.decimalSeparator||"")+((c=+r.fractionGroupSize)?h.replace(new RegExp("\\d{"+c+"}\\B","g"),"$&"+(r.fractionGroupSeparator||"")):h):u}return(r.prefix||"")+n+(r.suffix||"")},B.toFraction=function(t){var e,n,i,s,o,a,c,l,u,h,f,p,d=this,g=d.c;if(null!=t&&(!(c=new W(t)).isInteger()&&(c.c||1!==c.s)||c.lt(T)))throw Error(m+"Argument "+(c.isInteger()?"out of range: ":"not an integer: ")+J(c));if(!g)return new W(d);for(e=new W(T),u=n=new W(T),i=l=new W(T),p=_(g),o=e.e=p.length-d.e-1,e.c[0]=v[(a=o%w)<0?w+a:a],t=!t||c.comparedTo(e)>0?o>0?e:u:c,a=R,R=1/0,c=new W(p),l.c[0]=0;h=r(c,e,0,1),1!=(s=n.plus(h.times(i))).comparedTo(t);)n=i,i=s,u=l.plus(h.times(s=u)),l=s,e=c.minus(h.times(s=e)),c=s;return s=r(t.minus(n),i,0,1),l=l.plus(s.times(u)),n=n.plus(s.times(i)),l.s=u.s=d.s,f=r(u,i,o*=2,U).minus(d).abs().comparedTo(r(l,n,o,U).minus(d).abs())<1?[u,i]:[l,n],R=a,f},B.toNumber=function(){return+J(this)},B.toPrecision=function(t,e){return null!=t&&N(t,1,k),q(this,t,e,2)},B.toString=function(t){var e,r=this,i=r.s,s=r.e;return null===s?i?(e="Infinity",i<0&&(e="-"+e)):e="NaN":(null==t?e=s<=M||s>=D?S(_(r.c),s):C(_(r.c),s,"0"):10===t?e=C(_((r=$(new W(r),I+s+1,U)).c),r.e,"0"):(N(t,2,z.length,"Base"),e=n(C(_(r.c),s,"0"),10,t,i,!0)),i<0&&r.c[0]&&(e="-"+e)),e},B.valueOf=B.toJSON=function(){return J(this)},B._isBigNumber=!0,null!=e&&W.set(e),W}();const B=u,T=class{static leftPad32(t){let e="";if("string"==typeof t)e=t.padStart(64,"0");else try{e=t.toString(16).padStart(64,"0")}catch(t){e=new Array(64).fill(0).join("")}return e}static parseString(t){let e=t;if("0"==e.indexOf("0x")&&(e=e.substr(2)),e.length>64)return l.chunkSubstr(e,64).slice(2).map((t=>this.parseString(t))).join("");let r="";try{r=decodeURIComponent("%"+e.match(/.{1,2}/g).filter((t=>"00"!=t)).join("%"))}catch(t){}return r}static toSmallestUnitHex({amount:t,decimals:e}){return new B(t).multipliedBy(new B(10).pow(e)).toString(16)}static toContractData({func:t,params:e}){if(!t)return"0x";const r="string"==typeof t?t:t.toString(),n=Array.isArray(e)?e.map((t=>this.leftPad32(l.toHex(t)))):[this.leftPad32(l.toHex(e))];return"0x".concat(h.Z.keccak256(r).substr(0,8)).concat(n.join(""))}static isEthereumAddress(t){return/^0x[a-fA-F0-9]{40}$/.test(t)}},I=class extends o{_type=s.Metamask;async connect({blockchain:t}){return t&&await this._addBlockchain({blockchain:t}),this._connect({blockchain:t})}async disconnect(){this._isConnected=!1}async send({from:t=this.address,to:e,amount:r,data:n}){const i=await this.getDecimals(),s={method:"eth_sendTransaction",params:[{from:t,to:e,value:T.toSmallestUnitHex({amount:r,decimals:i}),data:n,chainId:this._chainId}]};return await ethereum.request(s)}async getData({contract:t,data:e,func:r,params:n}){if(e){console.log(t,e);const r={method:"eth_call",params:[{to:t,data:e}]};return ethereum.request(r)}{let e=T.toContractData({func:r,params:n});return await this.getData({contract:t,data:e})}}async getBalance({contract:t,address:e}={}){let r=e;if(T.isEthereumAddress(e)||(r=this.address),"string"==typeof t)return this.getContractBalance({contract:t,address:e});const n={method:"eth_getBalance",params:[r,"latest"]};return ethereum.request(n).then((t=>new B(t).dividedBy(new B(10).pow(18)).toString()))}async getContractBalance({contract:t,address:e}={}){let r=e;return T.isEthereumAddress(e)||(r=this.address),Promise.all([this.getData({contract:t,func:"balanceOf(address)",params:[r]}),this.getDecimals({contract:t})]).then((([t,e])=>{const r=new B(t).dividedBy(new B(10).pow(e)).toString();return Promise.resolve(r)}))}async getDecimals({contract:t}={}){let e;if(!t){try{e=this.blockchain.nativeCurrency.decimals}catch(t){e=18}return Promise.resolve(e)}return this.getData({contract:t,func:"decimals()"}).then((t=>{const e=parseInt(t);return Promise.resolve(e)}))}async getSymbol({contract:t}={}){let e;if(!t){try{e=this.blockchain.nativeCurrency.symbol}catch(t){e="ETH"}return Promise.resolve(e)}return this.getData({contract:t,func:"symbol()"}).then((t=>{const e=T.parseString(t);return Promise.resolve(e)}))}async getTotalSupply({contract:t}){return t?Promise.all([this.getData({contract:t,func:"totalSupply()"}),this.getDecimals({contract:t})]).then((([t,e])=>{const r=new B(t).dividedBy(new B(10).pow(e)).toString();return Promise.resolve(r)})):Promise.resolve("0")}async getAsset({contract:t,decimals:e}={}){return Promise.all([this.getSymbol({contract:t}),this.getDecimals({contract:t}),this.getTotalSupply({contract:t})]).then((([t,e,r])=>Promise.resolve({symbol:t,decimals:e,totalSupply:r})))}async _connect({blockchain:t}){return ethereum.request({method:"eth_requestAccounts"}).then((e=>(this._blockchain=t,this._address=e[0],this._isConnected=!0,this._switchBlockchain(t))))}async _addBlockchain({blockchain:t}){const e=parseInt(t.chainId);if([1,3,4,5,42].indexOf(e)>-1)return!0;const r={method:"wallet_addEthereumChain",params:[t]};return ethereum.request(r)}async _switchBlockchain({chainId:t}){const e={method:"wallet_switchEthereumChain",params:[{chainId:t}]};return ethereum.request(e)}},U=class{static get types(){return["TideWallet","Metamask","imToken"]}static create(t=""){let e;switch(console.log(`create ${t}`),t){case s.TideWallet:e=new a;break;case s.imToken:e=new c;break;case s.Metamask:e=new I}return e}},M=class{static getPlatform(){let t="unknown environment";try{t=navigator.userAgent}catch(t){}return t}static getWallets(){const t=[];try{window.ethereum.isMetaMask&&t.push(s.Metamask)}catch(t){}try{window.ethereum.isImToken&&t.push(s.imToken)}catch(t){}try{window.ethereum.isTideWallet&&t.push(s.TideWallet)}catch(t){}return t}};t=r.hmd(t);class D{static Blockchains=i;static Wallets=s;_connector;_connectors=[];_blockchain;constructor(){this._connector=U.create()}get env(){return{platform:M.getPlatform(),wallets:M.getWallets()}}get isConnected(){return!!this._connector&&this._connector.isConnected}get address(){return!!this._connector&&this._connector.address}get blockchain(){return this._blockchain}findConnector({walletType:t}){return this._connectors.filter((t=>!!t)).find((e=>e.type=t))}async connect({wallet:t,blockchain:e}={}){if(this.isConnected)return!0;const r=this.env.wallets[0],n=t||r;if(this._connector=this.findConnector({walletType:n}),!this._connector){const t=U.create(n);this._connectors.push(t),this._connector=t}return this._blockchain=await this._connector.connect({blockchain:e}),this.address}async switchBlockchain({chainId:t}){return awaitthis._connector._switchBlockchain({chainId:t}),this.address}async disconnect(){return this._connector.disconnect()}async getAsset({contract:t}={}){return this._connector.getAsset({contract:t})}async getBalance({contract:t,address:e}={}){return this._connector.getBalance({contract:t,address:e})}async getData({contract:t,func:e,params:r,data:n}){return this._connector.getData({contract:t,func:e,params:r,data:n})}async send({to:t,amount:e,data:r}){return this._connector.send({to:t,amount:e,data:r})}async interfaceOf({contract:t,abi:e}){return this._connector.interfaceOf({contract:t,abi:e})}}window?window.Lunar=D:t.exports=D}},e={};function r(n){var i=e[n];if(void 0!==i)return i.exports;var s=e[n]={id:n,loaded:!1,exports:{}};return t[n](s,s.exports,r),s.loaded=!0,s.exports}r.amdO={},r.d=(t,e)=>{for(var n in e)r.o(e,n)&&!r.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:e[n]})},r.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),r.hmd=t=>((t=Object.create(t)).children||(t.children=[]),Object.defineProperty(t,"exports",{enumerable:!0,set:()=>{throw new Error("ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: "+t.id)}}),t),r.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r(759)})();