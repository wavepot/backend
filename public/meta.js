((function(self){var Module=self.OggVorbisEncoderConfig;var Module;if(!Module)Module=(typeof Module!=="undefined"?Module:null)||{};var moduleOverrides={};for(var key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key];}}var ENVIRONMENT_IS_WEB=typeof window==="object";var ENVIRONMENT_IS_NODE=typeof process==="object"&&typeof require==="function"&&!ENVIRONMENT_IS_WEB;var ENVIRONMENT_IS_WORKER=typeof importScripts==="function";var ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;if(ENVIRONMENT_IS_NODE){if(!Module["print"])Module["print"]=function print(x){process["stdout"].write(x+"\n");};if(!Module["printErr"])Module["printErr"]=function printErr(x){process["stderr"].write(x+"\n");};var nodeFS=require("fs");var nodePath=require("path");Module["read"]=function read(filename,binary){filename=nodePath["normalize"](filename);var ret=nodeFS["readFileSync"](filename);if(!ret&&filename!=nodePath["resolve"](filename)){filename=path.join(__dirname,"..","src",filename);ret=nodeFS["readFileSync"](filename);}if(ret&&!binary)ret=ret.toString();return ret};Module["readBinary"]=function readBinary(filename){return Module["read"](filename,true)};Module["load"]=function load(f){globalEval(read(f));};if(!Module["thisProgram"]){if(process["argv"].length>1){Module["thisProgram"]=process["argv"][1].replace(/\\/g,"/");}else {Module["thisProgram"]="unknown-program";}}Module["arguments"]=process["argv"].slice(2);if(typeof module!=="undefined"){module["exports"]=Module;}process["on"]("uncaughtException",(function(ex){if(!(ex instanceof ExitStatus)){throw ex}}));Module["inspect"]=(function(){return "[Emscripten Module object]"});}else if(ENVIRONMENT_IS_SHELL){if(!Module["print"])Module["print"]=print;if(typeof printErr!="undefined")Module["printErr"]=printErr;if(typeof read!="undefined"){Module["read"]=read;}else {Module["read"]=function read(){throw "no read() available (jsc?)"};}Module["readBinary"]=function readBinary(f){if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}var data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){Module["arguments"]=scriptArgs;}else if(typeof arguments!="undefined"){Module["arguments"]=arguments;}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){Module["read"]=function read(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};if(typeof arguments!="undefined"){Module["arguments"]=arguments;}if(typeof console!=="undefined"){if(!Module["print"])Module["print"]=function print(x){console.log(x);};if(!Module["printErr"])Module["printErr"]=function printErr(x){console.log(x);};}else {var TRY_USE_DUMP=false;if(!Module["print"])Module["print"]=TRY_USE_DUMP&&typeof dump!=="undefined"?(function(x){dump(x);}):(function(x){});}if(ENVIRONMENT_IS_WORKER){Module["load"]=importScripts;}if(typeof Module["setWindowTitle"]==="undefined"){Module["setWindowTitle"]=(function(title){document.title=title;});}}else {throw "Unknown runtime environment. Where are we?"}function globalEval(x){eval.call(null,x);}if(!Module["load"]&&Module["read"]){Module["load"]=function load(f){globalEval(Module["read"](f));};}if(!Module["print"]){Module["print"]=(function(){});}if(!Module["printErr"]){Module["printErr"]=Module["print"];}if(!Module["arguments"]){Module["arguments"]=[];}if(!Module["thisProgram"]){Module["thisProgram"]="./this.program";}Module.print=Module["print"];Module.printErr=Module["printErr"];Module["preRun"]=[];Module["postRun"]=[];for(var key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key];}}var Runtime={setTempRet0:(function(value){tempRet0=value;}),getTempRet0:(function(){return tempRet0}),stackSave:(function(){return STACKTOP}),stackRestore:(function(stackTop){STACKTOP=stackTop;}),getNativeTypeSize:(function(type){switch(type){case"i1":case"i8":return 1;case"i16":return 2;case"i32":return 4;case"i64":return 8;case"float":return 4;case"double":return 8;default:{if(type[type.length-1]==="*"){return Runtime.QUANTUM_SIZE}else if(type[0]==="i"){var bits=parseInt(type.substr(1));assert(bits%8===0);return bits/8}else {return 0}}}}),getNativeFieldSize:(function(type){return Math.max(Runtime.getNativeTypeSize(type),Runtime.QUANTUM_SIZE)}),STACK_ALIGN:16,prepVararg:(function(ptr,type){if(type==="double"||type==="i64"){if(ptr&7){assert((ptr&7)===4);ptr+=4;}}else {assert((ptr&3)===0);}return ptr}),getAlignSize:(function(type,size,vararg){if(!vararg&&(type=="i64"||type=="double"))return 8;if(!type)return Math.min(size,8);return Math.min(size||(type?Runtime.getNativeFieldSize(type):0),Runtime.QUANTUM_SIZE)}),dynCall:(function(sig,ptr,args){if(args&&args.length){if(!args.splice)args=Array.prototype.slice.call(args);args.splice(0,0,ptr);return Module["dynCall_"+sig].apply(null,args)}else {return Module["dynCall_"+sig].call(null,ptr)}}),functionPointers:[],addFunction:(function(func){for(var i=0;i<Runtime.functionPointers.length;i++){if(!Runtime.functionPointers[i]){Runtime.functionPointers[i]=func;return 2*(1+i)}}throw "Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS."}),removeFunction:(function(index){Runtime.functionPointers[(index-2)/2]=null;}),warnOnce:(function(text){if(!Runtime.warnOnce.shown)Runtime.warnOnce.shown={};if(!Runtime.warnOnce.shown[text]){Runtime.warnOnce.shown[text]=1;Module.printErr(text);}}),funcWrappers:{},getFuncWrapper:(function(func,sig){assert(sig);if(!Runtime.funcWrappers[sig]){Runtime.funcWrappers[sig]={};}var sigCache=Runtime.funcWrappers[sig];if(!sigCache[func]){sigCache[func]=function dynCall_wrapper(){return Runtime.dynCall(sig,func,arguments)};}return sigCache[func]}),getCompilerSetting:(function(name){throw "You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work"}),stackAlloc:(function(size){var ret=STACKTOP;STACKTOP=STACKTOP+size|0;STACKTOP=STACKTOP+15&-16;return ret}),staticAlloc:(function(size){var ret=STATICTOP;STATICTOP=STATICTOP+size|0;STATICTOP=STATICTOP+15&-16;return ret}),dynamicAlloc:(function(size){var ret=DYNAMICTOP;DYNAMICTOP=DYNAMICTOP+size|0;DYNAMICTOP=DYNAMICTOP+15&-16;if(DYNAMICTOP>=TOTAL_MEMORY){var success=enlargeMemory();if(!success){DYNAMICTOP=ret;return 0}}return ret}),alignMemory:(function(size,quantum){var ret=size=Math.ceil(size/(quantum?quantum:16))*(quantum?quantum:16);return ret}),makeBigInt:(function(low,high,unsigned){var ret=unsigned?+(low>>>0)+ +(high>>>0)*+4294967296:+(low>>>0)+ +(high|0)*+4294967296;return ret}),GLOBAL_BASE:8,QUANTUM_SIZE:4,__dummy__:0};Module["Runtime"]=Runtime;var ABORT=false;var tempDouble;var tempI64;var tempRet0;function assert(condition,text){if(!condition){abort("Assertion failed: "+text);}}function getCFunc(ident){var func=Module["_"+ident];if(!func){try{func=eval("_"+ident);}catch(e){}}assert(func,"Cannot call unknown function "+ident+" (perhaps LLVM optimizations or closure removed it?)");return func}var cwrap,ccall;((function(){var JSfuncs={"stackSave":(function(){Runtime.stackSave();}),"stackRestore":(function(){Runtime.stackRestore();}),"arrayToC":(function(arr){var ret=Runtime.stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret}),"stringToC":(function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){ret=Runtime.stackAlloc((str.length<<2)+1);writeStringToMemory(str,ret);}return ret})};var toC={"string":JSfuncs["stringToC"],"array":JSfuncs["arrayToC"]};ccall=function ccallFunc(ident,returnType,argTypes,args,opts){var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=Runtime.stackSave();cArgs[i]=converter(args[i]);}else {cArgs[i]=args[i];}}}var ret=func.apply(null,cArgs);if(returnType==="string")ret=Pointer_stringify(ret);if(stack!==0){if(opts&&opts.async){EmterpreterAsync.asyncFinalizers.push((function(){Runtime.stackRestore(stack);}));return}Runtime.stackRestore(stack);}return ret};var sourceRegex=/^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;function parseJSFunc(jsfunc){var parsed=jsfunc.toString().match(sourceRegex).slice(1);return {arguments:parsed[0],body:parsed[1],returnValue:parsed[2]}}var JSsource={};for(var fun in JSfuncs){if(JSfuncs.hasOwnProperty(fun)){JSsource[fun]=parseJSFunc(JSfuncs[fun]);}}cwrap=function cwrap(ident,returnType,argTypes){argTypes=argTypes||[];var cfunc=getCFunc(ident);var numericArgs=argTypes.every((function(type){return type==="number"}));var numericRet=returnType!=="string";if(numericRet&&numericArgs){return cfunc}var argNames=argTypes.map((function(x,i){return "$"+i}));var funcstr="(function("+argNames.join(",")+") {";var nargs=argTypes.length;if(!numericArgs){funcstr+="var stack = "+JSsource["stackSave"].body+";";for(var i=0;i<nargs;i++){var arg=argNames[i],type=argTypes[i];if(type==="number")continue;var convertCode=JSsource[type+"ToC"];funcstr+="var "+convertCode.arguments+" = "+arg+";";funcstr+=convertCode.body+";";funcstr+=arg+"="+convertCode.returnValue+";";}}var cfuncname=parseJSFunc((function(){return cfunc})).returnValue;funcstr+="var ret = "+cfuncname+"("+argNames.join(",")+");";if(!numericRet){var strgfy=parseJSFunc((function(){return Pointer_stringify})).returnValue;funcstr+="ret = "+strgfy+"(ret);";}if(!numericArgs){funcstr+=JSsource["stackRestore"].body.replace("()","(stack)")+";";}funcstr+="return ret})";return eval(funcstr)};}))();Module["cwrap"]=cwrap;Module["ccall"]=ccall;function setValue(ptr,value,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":HEAP8[ptr>>0]=value;break;case"i8":HEAP8[ptr>>0]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=+1?tempDouble>+0?(Math_min(+Math_floor(tempDouble/+4294967296),+4294967295)|0)>>>0:~~+Math_ceil((tempDouble- +(~~tempDouble>>>0))/+4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;default:abort("invalid type for setValue: "+type);}}Module["setValue"]=setValue;function getValue(ptr,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":return HEAP8[ptr>>0];case"i8":return HEAP8[ptr>>0];case"i16":return HEAP16[ptr>>1];case"i32":return HEAP32[ptr>>2];case"i64":return HEAP32[ptr>>2];case"float":return HEAPF32[ptr>>2];case"double":return HEAPF64[ptr>>3];default:abort("invalid type for setValue: "+type);}return null}Module["getValue"]=getValue;var ALLOC_NORMAL=0;var ALLOC_STACK=1;var ALLOC_STATIC=2;var ALLOC_DYNAMIC=3;var ALLOC_NONE=4;Module["ALLOC_NORMAL"]=ALLOC_NORMAL;Module["ALLOC_STACK"]=ALLOC_STACK;Module["ALLOC_STATIC"]=ALLOC_STATIC;Module["ALLOC_DYNAMIC"]=ALLOC_DYNAMIC;Module["ALLOC_NONE"]=ALLOC_NONE;function allocate(slab,types,allocator,ptr){var zeroinit,size;if(typeof slab==="number"){zeroinit=true;size=slab;}else {zeroinit=false;size=slab.length;}var singleType=typeof types==="string"?types:null;var ret;if(allocator==ALLOC_NONE){ret=ptr;}else {ret=[_malloc,Runtime.stackAlloc,Runtime.staticAlloc,Runtime.dynamicAlloc][allocator===undefined?ALLOC_STATIC:allocator](Math.max(size,singleType?1:types.length));}if(zeroinit){var ptr=ret,stop;assert((ret&3)==0);stop=ret+(size&~3);for(;ptr<stop;ptr+=4){HEAP32[ptr>>2]=0;}stop=ret+size;while(ptr<stop){HEAP8[ptr++>>0]=0;}return ret}if(singleType==="i8"){if(slab.subarray||slab.slice){HEAPU8.set(slab,ret);}else {HEAPU8.set(new Uint8Array(slab),ret);}return ret}var i=0,type,typeSize,previousType;while(i<size){var curr=slab[i];if(typeof curr==="function"){curr=Runtime.getFunctionIndex(curr);}type=singleType||types[i];if(type===0){i++;continue}if(type=="i64")type="i32";setValue(ret+i,curr,type);if(previousType!==type){typeSize=Runtime.getNativeTypeSize(type);previousType=type;}i+=typeSize;}return ret}Module["allocate"]=allocate;function getMemory(size){if(!staticSealed)return Runtime.staticAlloc(size);if(typeof _sbrk!=="undefined"&&!_sbrk.called||!runtimeInitialized)return Runtime.dynamicAlloc(size);return _malloc(size)}Module["getMemory"]=getMemory;function Pointer_stringify(ptr,length){if(length===0||!ptr)return "";var hasUtf=0;var t;var i=0;while(1){t=HEAPU8[ptr+i>>0];hasUtf|=t;if(t==0&&!length)break;i++;if(length&&i==length)break}if(!length)length=i;var ret="";if(hasUtf<128){var MAX_CHUNK=1024;var curr;while(length>0){curr=String.fromCharCode.apply(String,HEAPU8.subarray(ptr,ptr+Math.min(length,MAX_CHUNK)));ret=ret?ret+curr:curr;ptr+=MAX_CHUNK;length-=MAX_CHUNK;}return ret}return Module["UTF8ToString"](ptr)}Module["Pointer_stringify"]=Pointer_stringify;function AsciiToString(ptr){var str="";while(1){var ch=HEAP8[ptr++>>0];if(!ch)return str;str+=String.fromCharCode(ch);}}Module["AsciiToString"]=AsciiToString;function stringToAscii(str,outPtr){return writeAsciiToMemory(str,outPtr,false)}Module["stringToAscii"]=stringToAscii;function UTF8ArrayToString(u8Array,idx){var u0,u1,u2,u3,u4,u5;var str="";while(1){u0=u8Array[idx++];if(!u0)return str;if(!(u0&128)){str+=String.fromCharCode(u0);continue}u1=u8Array[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}u2=u8Array[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2;}else {u3=u8Array[idx++]&63;if((u0&248)==240){u0=(u0&7)<<18|u1<<12|u2<<6|u3;}else {u4=u8Array[idx++]&63;if((u0&252)==248){u0=(u0&3)<<24|u1<<18|u2<<12|u3<<6|u4;}else {u5=u8Array[idx++]&63;u0=(u0&1)<<30|u1<<24|u2<<18|u3<<12|u4<<6|u5;}}}if(u0<65536){str+=String.fromCharCode(u0);}else {var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023);}}}Module["UTF8ArrayToString"]=UTF8ArrayToString;function UTF8ToString(ptr){return UTF8ArrayToString(HEAPU8,ptr)}Module["UTF8ToString"]=UTF8ToString;function stringToUTF8Array(str,outU8Array,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){if(outIdx>=endIdx)break;outU8Array[outIdx++]=u;}else if(u<=2047){if(outIdx+1>=endIdx)break;outU8Array[outIdx++]=192|u>>6;outU8Array[outIdx++]=128|u&63;}else if(u<=65535){if(outIdx+2>=endIdx)break;outU8Array[outIdx++]=224|u>>12;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63;}else if(u<=2097151){if(outIdx+3>=endIdx)break;outU8Array[outIdx++]=240|u>>18;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63;}else if(u<=67108863){if(outIdx+4>=endIdx)break;outU8Array[outIdx++]=248|u>>24;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63;}else {if(outIdx+5>=endIdx)break;outU8Array[outIdx++]=252|u>>30;outU8Array[outIdx++]=128|u>>24&63;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63;}}outU8Array[outIdx]=0;return outIdx-startIdx}Module["stringToUTF8Array"]=stringToUTF8Array;function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}Module["stringToUTF8"]=stringToUTF8;function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){++len;}else if(u<=2047){len+=2;}else if(u<=65535){len+=3;}else if(u<=2097151){len+=4;}else if(u<=67108863){len+=5;}else {len+=6;}}return len}Module["lengthBytesUTF8"]=lengthBytesUTF8;function UTF16ToString(ptr){var i=0;var str="";while(1){var codeUnit=HEAP16[ptr+i*2>>1];if(codeUnit==0)return str;++i;str+=String.fromCharCode(codeUnit);}}Module["UTF16ToString"]=UTF16ToString;function stringToUTF16(str,outPtr,maxBytesToWrite){if(maxBytesToWrite===undefined){maxBytesToWrite=2147483647;}if(maxBytesToWrite<2)return 0;maxBytesToWrite-=2;var startPtr=outPtr;var numCharsToWrite=maxBytesToWrite<str.length*2?maxBytesToWrite/2:str.length;for(var i=0;i<numCharsToWrite;++i){var codeUnit=str.charCodeAt(i);HEAP16[outPtr>>1]=codeUnit;outPtr+=2;}HEAP16[outPtr>>1]=0;return outPtr-startPtr}Module["stringToUTF16"]=stringToUTF16;function lengthBytesUTF16(str){return str.length*2}Module["lengthBytesUTF16"]=lengthBytesUTF16;function UTF32ToString(ptr){var i=0;var str="";while(1){var utf32=HEAP32[ptr+i*4>>2];if(utf32==0)return str;++i;if(utf32>=65536){var ch=utf32-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023);}else {str+=String.fromCharCode(utf32);}}}Module["UTF32ToString"]=UTF32ToString;function stringToUTF32(str,outPtr,maxBytesToWrite){if(maxBytesToWrite===undefined){maxBytesToWrite=2147483647;}if(maxBytesToWrite<4)return 0;var startPtr=outPtr;var endPtr=startPtr+maxBytesToWrite-4;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343){var trailSurrogate=str.charCodeAt(++i);codeUnit=65536+((codeUnit&1023)<<10)|trailSurrogate&1023;}HEAP32[outPtr>>2]=codeUnit;outPtr+=4;if(outPtr+4>endPtr)break}HEAP32[outPtr>>2]=0;return outPtr-startPtr}Module["stringToUTF32"]=stringToUTF32;function lengthBytesUTF32(str){var len=0;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343)++i;len+=4;}return len}Module["lengthBytesUTF32"]=lengthBytesUTF32;function demangle(func){var hasLibcxxabi=!!Module["___cxa_demangle"];if(hasLibcxxabi){try{var buf=_malloc(func.length);writeStringToMemory(func.substr(1),buf);var status=_malloc(4);var ret=Module["___cxa_demangle"](buf,0,0,status);if(getValue(status,"i32")===0&&ret){return Pointer_stringify(ret)}}catch(e){}finally{if(buf)_free(buf);if(status)_free(status);if(ret)_free(ret);}}var i=3;var basicTypes={"v":"void","b":"bool","c":"char","s":"short","i":"int","l":"long","f":"float","d":"double","w":"wchar_t","a":"signed char","h":"unsigned char","t":"unsigned short","j":"unsigned int","m":"unsigned long","x":"long long","y":"unsigned long long","z":"..."};var subs=[];var first=true;function parseNested(){i++;if(func[i]==="K")i++;var parts=[];while(func[i]!=="E"){if(func[i]==="S"){i++;var next=func.indexOf("_",i);var num=func.substring(i,next)||0;parts.push(subs[num]||"?");i=next+1;continue}if(func[i]==="C"){parts.push(parts[parts.length-1]);i+=2;continue}var size=parseInt(func.substr(i));var pre=size.toString().length;if(!size||!pre){i--;break}var curr=func.substr(i+pre,size);parts.push(curr);subs.push(curr);i+=pre+size;}i++;return parts}function parse(rawList,limit,allowVoid){limit=limit||Infinity;var ret="",list=[];function flushList(){return "("+list.join(", ")+")"}var name;if(func[i]==="N"){name=parseNested().join("::");limit--;if(limit===0)return rawList?[name]:name}else {if(func[i]==="K"||first&&func[i]==="L")i++;var size=parseInt(func.substr(i));if(size){var pre=size.toString().length;name=func.substr(i+pre,size);i+=pre+size;}}first=false;if(func[i]==="I"){i++;var iList=parse(true);var iRet=parse(true,1,true);ret+=iRet[0]+" "+name+"<"+iList.join(", ")+">";}else {ret=name;}paramLoop:while(i<func.length&&limit-->0){var c=func[i++];if(c in basicTypes){list.push(basicTypes[c]);}else {switch(c){case"P":list.push(parse(true,1,true)[0]+"*");break;case"R":list.push(parse(true,1,true)[0]+"&");break;case"L":{i++;var end=func.indexOf("E",i);var size=end-i;list.push(func.substr(i,size));i+=size+2;break}case"A":{var size=parseInt(func.substr(i));i+=size.toString().length;if(func[i]!=="_")throw "?";i++;list.push(parse(true,1,true)[0]+" ["+size+"]");break}case"E":break paramLoop;default:ret+="?"+c;break paramLoop}}}if(!allowVoid&&list.length===1&&list[0]==="void")list=[];if(rawList){if(ret){list.push(ret+"?");}return list}else {return ret+flushList()}}var parsed=func;try{if(func=="Object._main"||func=="_main"){return "main()"}if(typeof func==="number")func=Pointer_stringify(func);if(func[0]!=="_")return func;if(func[1]!=="_")return func;if(func[2]!=="Z")return func;switch(func[3]){case"n":return "operator new()";case"d":return "operator delete()"}parsed=parse();}catch(e){parsed+="?";}if(parsed.indexOf("?")>=0&&!hasLibcxxabi){Runtime.warnOnce("warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");}return parsed}function demangleAll(text){return text.replace(/__Z[\w\d_]+/g,(function(x){var y=demangle(x);return x===y?x:x+" ["+y+"]"}))}function jsStackTrace(){var err=new Error;if(!err.stack){try{throw new Error(0)}catch(e){err=e;}if(!err.stack){return "(no stack trace available)"}}return err.stack.toString()}function stackTrace(){return demangleAll(jsStackTrace())}Module["stackTrace"]=stackTrace;var PAGE_SIZE=4096;function alignMemoryPage(x){if(x%4096>0){x+=4096-x%4096;}return x}var HEAP;var HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;var STATIC_BASE=0,STATICTOP=0,staticSealed=false;var STACK_BASE=0,STACKTOP=0,STACK_MAX=0;var DYNAMIC_BASE=0,DYNAMICTOP=0;function enlargeMemory(){abort("Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value "+TOTAL_MEMORY+", (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.");}var TOTAL_STACK=Module["TOTAL_STACK"]||5242880;var TOTAL_MEMORY=Module["TOTAL_MEMORY"]||16777216;var totalMemory=64*1024;while(totalMemory<TOTAL_MEMORY||totalMemory<2*TOTAL_STACK){if(totalMemory<16*1024*1024){totalMemory*=2;}else {totalMemory+=16*1024*1024;}}if(totalMemory!==TOTAL_MEMORY){Module.printErr("increasing TOTAL_MEMORY to "+totalMemory+" to be compliant with the asm.js spec (and given that TOTAL_STACK="+TOTAL_STACK+")");TOTAL_MEMORY=totalMemory;}assert(typeof Int32Array!=="undefined"&&typeof Float64Array!=="undefined"&&!!(new Int32Array(1))["subarray"]&&!!(new Int32Array(1))["set"],"JS engine does not provide full typed array support");var buffer;buffer=new ArrayBuffer(TOTAL_MEMORY);HEAP8=new Int8Array(buffer);HEAP16=new Int16Array(buffer);HEAP32=new Int32Array(buffer);HEAPU8=new Uint8Array(buffer);HEAPU16=new Uint16Array(buffer);HEAPU32=new Uint32Array(buffer);HEAPF32=new Float32Array(buffer);HEAPF64=new Float64Array(buffer);HEAP32[0]=255;assert(HEAPU8[0]===255&&HEAPU8[3]===0,"Typed arrays 2 must be run on a little-endian system");Module["HEAP"]=HEAP;Module["buffer"]=buffer;Module["HEAP8"]=HEAP8;Module["HEAP16"]=HEAP16;Module["HEAP32"]=HEAP32;Module["HEAPU8"]=HEAPU8;Module["HEAPU16"]=HEAPU16;Module["HEAPU32"]=HEAPU32;Module["HEAPF32"]=HEAPF32;Module["HEAPF64"]=HEAPF64;function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Runtime.dynCall("v",func);}else {Runtime.dynCall("vi",func,[callback.arg]);}}else {func(callback.arg===undefined?null:callback.arg);}}}var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATEXIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift());}}callRuntimeCallbacks(__ATPRERUN__);}function ensureInitRuntime(){if(runtimeInitialized)return;runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__);}function preMain(){callRuntimeCallbacks(__ATMAIN__);}function exitRuntime(){callRuntimeCallbacks(__ATEXIT__);}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift());}}callRuntimeCallbacks(__ATPOSTRUN__);}function addOnPreRun(cb){__ATPRERUN__.unshift(cb);}Module["addOnPreRun"]=Module.addOnPreRun=addOnPreRun;function addOnInit(cb){__ATINIT__.unshift(cb);}Module["addOnInit"]=Module.addOnInit=addOnInit;function addOnPreMain(cb){__ATMAIN__.unshift(cb);}Module["addOnPreMain"]=Module.addOnPreMain=addOnPreMain;function addOnExit(cb){__ATEXIT__.unshift(cb);}Module["addOnExit"]=Module.addOnExit=addOnExit;function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb);}Module["addOnPostRun"]=Module.addOnPostRun=addOnPostRun;function intArrayFromString(stringy,dontAddNull,length){var len=length>0?length:lengthBytesUTF8(stringy)+1;var u8array=new Array(len);var numBytesWritten=stringToUTF8Array(stringy,u8array,0,u8array.length);if(dontAddNull)u8array.length=numBytesWritten;return u8array}Module["intArrayFromString"]=intArrayFromString;function intArrayToString(array){var ret=[];for(var i=0;i<array.length;i++){var chr=array[i];if(chr>255){chr&=255;}ret.push(String.fromCharCode(chr));}return ret.join("")}Module["intArrayToString"]=intArrayToString;function writeStringToMemory(string,buffer,dontAddNull){var array=intArrayFromString(string,dontAddNull);var i=0;while(i<array.length){var chr=array[i];HEAP8[buffer+i>>0]=chr;i=i+1;}}Module["writeStringToMemory"]=writeStringToMemory;function writeArrayToMemory(array,buffer){for(var i=0;i<array.length;i++){HEAP8[buffer++>>0]=array[i];}}Module["writeArrayToMemory"]=writeArrayToMemory;function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i);}if(!dontAddNull)HEAP8[buffer>>0]=0;}Module["writeAsciiToMemory"]=writeAsciiToMemory;if(!Math["imul"]||Math["imul"](4294967295,5)!==-5)Math["imul"]=function imul(a,b){var ah=a>>>16;var al=a&65535;var bh=b>>>16;var bl=b&65535;return al*bl+(ah*bl+al*bh<<16)|0};Math.imul=Math["imul"];if(!Math["clz32"])Math["clz32"]=(function(x){x=x>>>0;for(var i=0;i<32;i++){if(x&1<<31-i)return i}return 32});Math.clz32=Math["clz32"];var Math_abs=Math.abs;var Math_cos=Math.cos;var Math_sin=Math.sin;var Math_atan=Math.atan;var Math_exp=Math.exp;var Math_log=Math.log;var Math_sqrt=Math.sqrt;var Math_ceil=Math.ceil;var Math_floor=Math.floor;var Math_pow=Math.pow;var Math_min=Math.min;var runDependencies=0;var dependenciesFulfilled=null;function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies);}}Module["addRunDependency"]=addRunDependency;function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies);}if(runDependencies==0){if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback();}}}Module["removeRunDependency"]=removeRunDependency;Module["preloadedImages"]={};Module["preloadedAudios"]={};var memoryInitializer=null;STATIC_BASE=8;STATICTOP=STATIC_BASE+553552;__ATINIT__.push();memoryInitializer="OggVorbisEncoder.min.js.mem";var tempDoublePtr=Runtime.alignMemory(allocate(12,"i8",ALLOC_STATIC),8);assert(tempDoublePtr%8==0);var _cosf=Math_cos;var _fabsf=Math_abs;var ___errno_state=0;function ___setErrNo(value){HEAP32[___errno_state>>2]=value;return value}var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};function _sysconf(name){switch(name){case 30:return PAGE_SIZE;case 85:return totalMemory/PAGE_SIZE;case 132:case 133:case 12:case 137:case 138:case 15:case 235:case 16:case 17:case 18:case 19:case 20:case 149:case 13:case 10:case 236:case 153:case 9:case 21:case 22:case 159:case 154:case 14:case 77:case 78:case 139:case 80:case 81:case 82:case 68:case 67:case 164:case 11:case 29:case 47:case 48:case 95:case 52:case 51:case 46:return 200809;case 79:return 0;case 27:case 246:case 127:case 128:case 23:case 24:case 160:case 161:case 181:case 182:case 242:case 183:case 184:case 243:case 244:case 245:case 165:case 178:case 179:case 49:case 50:case 168:case 169:case 175:case 170:case 171:case 172:case 97:case 76:case 32:case 173:case 35:return -1;case 176:case 177:case 7:case 155:case 8:case 157:case 125:case 126:case 92:case 93:case 129:case 130:case 131:case 94:case 91:return 1;case 74:case 60:case 69:case 70:case 4:return 1024;case 31:case 42:case 72:return 32;case 87:case 26:case 33:return 2147483647;case 34:case 1:return 47839;case 38:case 36:return 99;case 43:case 37:return 2048;case 0:return 2097152;case 3:return 65536;case 28:return 32768;case 44:return 32767;case 75:return 16384;case 39:return 1e3;case 89:return 700;case 71:return 256;case 40:return 255;case 2:return 100;case 180:return 64;case 25:return 20;case 5:return 16;case 6:return 6;case 73:return 4;case 84:{if(typeof navigator==="object")return navigator["hardwareConcurrency"]||1;return 1}}___setErrNo(ERRNO_CODES.EINVAL);return -1}Module["_memset"]=_memset;Module["_strlen"]=_strlen;Module["_strcat"]=_strcat;Module["_bitshift64Shl"]=_bitshift64Shl;function _abort(){Module["abort"]();}Module["_i64Add"]=_i64Add;var _floor=Math_floor;var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};var TTY={ttys:[],init:(function(){}),shutdown:(function(){}),register:(function(dev,ops){TTY.ttys[dev]={input:[],output:[],ops:ops};FS.registerDevice(dev,TTY.stream_ops);}),stream_ops:{open:(function(stream){var tty=TTY.ttys[stream.node.rdev];if(!tty){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}stream.tty=tty;stream.seekable=false;}),close:(function(stream){stream.tty.ops.flush(stream.tty);}),flush:(function(stream){stream.tty.ops.flush(stream.tty);}),read:(function(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.get_char){throw new FS.ErrnoError(ERRNO_CODES.ENXIO)}var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=stream.tty.ops.get_char(stream.tty);}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result;}if(bytesRead){stream.node.timestamp=Date.now();}return bytesRead}),write:(function(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.put_char){throw new FS.ErrnoError(ERRNO_CODES.ENXIO)}for(var i=0;i<length;i++){try{stream.tty.ops.put_char(stream.tty,buffer[offset+i]);}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}}if(length){stream.node.timestamp=Date.now();}return i})},default_tty_ops:{get_char:(function(tty){if(!tty.input.length){var result=null;if(ENVIRONMENT_IS_NODE){var BUFSIZE=256;var buf=new Buffer(BUFSIZE);var bytesRead=0;var fd=process.stdin.fd;var usingDevice=false;try{fd=fs.openSync("/dev/stdin","r");usingDevice=true;}catch(e){}bytesRead=fs.readSync(fd,buf,0,BUFSIZE,null);if(usingDevice){fs.closeSync(fd);}if(bytesRead>0){result=buf.slice(0,bytesRead).toString("utf-8");}else {result=null;}}else if(typeof window!="undefined"&&typeof window.prompt=="function"){result=window.prompt("Input: ");if(result!==null){result+="\n";}}else if(typeof readline=="function"){result=readline();if(result!==null){result+="\n";}}if(!result){return null}tty.input=intArrayFromString(result,true);}return tty.input.shift()}),put_char:(function(tty,val){if(val===null||val===10){Module["print"](UTF8ArrayToString(tty.output,0));tty.output=[];}else {if(val!=0)tty.output.push(val);}}),flush:(function(tty){if(tty.output&&tty.output.length>0){Module["print"](UTF8ArrayToString(tty.output,0));tty.output=[];}})},default_tty1_ops:{put_char:(function(tty,val){if(val===null||val===10){Module["printErr"](UTF8ArrayToString(tty.output,0));tty.output=[];}else {if(val!=0)tty.output.push(val);}}),flush:(function(tty){if(tty.output&&tty.output.length>0){Module["printErr"](UTF8ArrayToString(tty.output,0));tty.output=[];}})}};var MEMFS={ops_table:null,mount:(function(mount){return MEMFS.createNode(null,"/",16384|511,0)}),createNode:(function(parent,name,mode,dev){if(FS.isBlkdev(mode)||FS.isFIFO(mode)){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(!MEMFS.ops_table){MEMFS.ops_table={dir:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,lookup:MEMFS.node_ops.lookup,mknod:MEMFS.node_ops.mknod,rename:MEMFS.node_ops.rename,unlink:MEMFS.node_ops.unlink,rmdir:MEMFS.node_ops.rmdir,readdir:MEMFS.node_ops.readdir,symlink:MEMFS.node_ops.symlink},stream:{llseek:MEMFS.stream_ops.llseek}},file:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:{llseek:MEMFS.stream_ops.llseek,read:MEMFS.stream_ops.read,write:MEMFS.stream_ops.write,allocate:MEMFS.stream_ops.allocate,mmap:MEMFS.stream_ops.mmap,msync:MEMFS.stream_ops.msync}},link:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,readlink:MEMFS.node_ops.readlink},stream:{}},chrdev:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:FS.chrdev_stream_ops}};}var node=FS.createNode(parent,name,mode,dev);if(FS.isDir(node.mode)){node.node_ops=MEMFS.ops_table.dir.node;node.stream_ops=MEMFS.ops_table.dir.stream;node.contents={};}else if(FS.isFile(node.mode)){node.node_ops=MEMFS.ops_table.file.node;node.stream_ops=MEMFS.ops_table.file.stream;node.usedBytes=0;node.contents=null;}else if(FS.isLink(node.mode)){node.node_ops=MEMFS.ops_table.link.node;node.stream_ops=MEMFS.ops_table.link.stream;}else if(FS.isChrdev(node.mode)){node.node_ops=MEMFS.ops_table.chrdev.node;node.stream_ops=MEMFS.ops_table.chrdev.stream;}node.timestamp=Date.now();if(parent){parent.contents[name]=node;}return node}),getFileDataAsRegularArray:(function(node){if(node.contents&&node.contents.subarray){var arr=[];for(var i=0;i<node.usedBytes;++i)arr.push(node.contents[i]);return arr}return node.contents}),getFileDataAsTypedArray:(function(node){if(!node.contents)return new Uint8Array;if(node.contents.subarray)return node.contents.subarray(0,node.usedBytes);return new Uint8Array(node.contents)}),expandFileStorage:(function(node,newCapacity){if(node.contents&&node.contents.subarray&&newCapacity>node.contents.length){node.contents=MEMFS.getFileDataAsRegularArray(node);node.usedBytes=node.contents.length;}if(!node.contents||node.contents.subarray){var prevCapacity=node.contents?node.contents.buffer.byteLength:0;if(prevCapacity>=newCapacity)return;var CAPACITY_DOUBLING_MAX=1024*1024;newCapacity=Math.max(newCapacity,prevCapacity*(prevCapacity<CAPACITY_DOUBLING_MAX?2:1.125)|0);if(prevCapacity!=0)newCapacity=Math.max(newCapacity,256);var oldContents=node.contents;node.contents=new Uint8Array(newCapacity);if(node.usedBytes>0)node.contents.set(oldContents.subarray(0,node.usedBytes),0);return}if(!node.contents&&newCapacity>0)node.contents=[];while(node.contents.length<newCapacity)node.contents.push(0);}),resizeFileStorage:(function(node,newSize){if(node.usedBytes==newSize)return;if(newSize==0){node.contents=null;node.usedBytes=0;return}if(!node.contents||node.contents.subarray){var oldContents=node.contents;node.contents=new Uint8Array(new ArrayBuffer(newSize));if(oldContents){node.contents.set(oldContents.subarray(0,Math.min(newSize,node.usedBytes)));}node.usedBytes=newSize;return}if(!node.contents)node.contents=[];if(node.contents.length>newSize)node.contents.length=newSize;else while(node.contents.length<newSize)node.contents.push(0);node.usedBytes=newSize;}),node_ops:{getattr:(function(node){var attr={};attr.dev=FS.isChrdev(node.mode)?node.id:1;attr.ino=node.id;attr.mode=node.mode;attr.nlink=1;attr.uid=0;attr.gid=0;attr.rdev=node.rdev;if(FS.isDir(node.mode)){attr.size=4096;}else if(FS.isFile(node.mode)){attr.size=node.usedBytes;}else if(FS.isLink(node.mode)){attr.size=node.link.length;}else {attr.size=0;}attr.atime=new Date(node.timestamp);attr.mtime=new Date(node.timestamp);attr.ctime=new Date(node.timestamp);attr.blksize=4096;attr.blocks=Math.ceil(attr.size/attr.blksize);return attr}),setattr:(function(node,attr){if(attr.mode!==undefined){node.mode=attr.mode;}if(attr.timestamp!==undefined){node.timestamp=attr.timestamp;}if(attr.size!==undefined){MEMFS.resizeFileStorage(node,attr.size);}}),lookup:(function(parent,name){throw FS.genericErrors[ERRNO_CODES.ENOENT]}),mknod:(function(parent,name,mode,dev){return MEMFS.createNode(parent,name,mode,dev)}),rename:(function(old_node,new_dir,new_name){if(FS.isDir(old_node.mode)){var new_node;try{new_node=FS.lookupNode(new_dir,new_name);}catch(e){}if(new_node){for(var i in new_node.contents){throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)}}}delete old_node.parent.contents[old_node.name];old_node.name=new_name;new_dir.contents[new_name]=old_node;old_node.parent=new_dir;}),unlink:(function(parent,name){delete parent.contents[name];}),rmdir:(function(parent,name){var node=FS.lookupNode(parent,name);for(var i in node.contents){throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)}delete parent.contents[name];}),readdir:(function(node){var entries=[".",".."];for(var key in node.contents){if(!node.contents.hasOwnProperty(key)){continue}entries.push(key);}return entries}),symlink:(function(parent,newname,oldpath){var node=MEMFS.createNode(parent,newname,511|40960,0);node.link=oldpath;return node}),readlink:(function(node){if(!FS.isLink(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return node.link})},stream_ops:{read:(function(stream,buffer,offset,length,position){var contents=stream.node.contents;if(position>=stream.node.usedBytes)return 0;var size=Math.min(stream.node.usedBytes-position,length);assert(size>=0);if(size>8&&contents.subarray){buffer.set(contents.subarray(position,position+size),offset);}else {for(var i=0;i<size;i++)buffer[offset+i]=contents[position+i];}return size}),write:(function(stream,buffer,offset,length,position,canOwn){if(!length)return 0;var node=stream.node;node.timestamp=Date.now();if(buffer.subarray&&(!node.contents||node.contents.subarray)){if(canOwn){node.contents=buffer.subarray(offset,offset+length);node.usedBytes=length;return length}else if(node.usedBytes===0&&position===0){node.contents=new Uint8Array(buffer.subarray(offset,offset+length));node.usedBytes=length;return length}else if(position+length<=node.usedBytes){node.contents.set(buffer.subarray(offset,offset+length),position);return length}}MEMFS.expandFileStorage(node,position+length);if(node.contents.subarray&&buffer.subarray)node.contents.set(buffer.subarray(offset,offset+length),position);else {for(var i=0;i<length;i++){node.contents[position+i]=buffer[offset+i];}}node.usedBytes=Math.max(node.usedBytes,position+length);return length}),llseek:(function(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position;}else if(whence===2){if(FS.isFile(stream.node.mode)){position+=stream.node.usedBytes;}}if(position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return position}),allocate:(function(stream,offset,length){MEMFS.expandFileStorage(stream.node,offset+length);stream.node.usedBytes=Math.max(stream.node.usedBytes,offset+length);}),mmap:(function(stream,buffer,offset,length,position,prot,flags){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}var ptr;var allocated;var contents=stream.node.contents;if(!(flags&2)&&(contents.buffer===buffer||contents.buffer===buffer.buffer)){allocated=false;ptr=contents.byteOffset;}else {if(position>0||position+length<stream.node.usedBytes){if(contents.subarray){contents=contents.subarray(position,position+length);}else {contents=Array.prototype.slice.call(contents,position,position+length);}}allocated=true;ptr=_malloc(length);if(!ptr){throw new FS.ErrnoError(ERRNO_CODES.ENOMEM)}buffer.set(contents,ptr);}return {ptr:ptr,allocated:allocated}}),msync:(function(stream,buffer,offset,length,mmapFlags){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}if(mmapFlags&2){return 0}var bytesWritten=MEMFS.stream_ops.write(stream,buffer,0,length,offset,false);return 0})}};var NODEFS={isWindows:false,staticInit:(function(){NODEFS.isWindows=!!process.platform.match(/^win/);}),mount:(function(mount){assert(ENVIRONMENT_IS_NODE);return NODEFS.createNode(null,"/",NODEFS.getMode(mount.opts.root),0)}),createNode:(function(parent,name,mode,dev){if(!FS.isDir(mode)&&!FS.isFile(mode)&&!FS.isLink(mode)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var node=FS.createNode(parent,name,mode);node.node_ops=NODEFS.node_ops;node.stream_ops=NODEFS.stream_ops;return node}),getMode:(function(path){var stat;try{stat=fs.lstatSync(path);if(NODEFS.isWindows){stat.mode=stat.mode|(stat.mode&146)>>1;}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}return stat.mode}),realPath:(function(node){var parts=[];while(node.parent!==node){parts.push(node.name);node=node.parent;}parts.push(node.mount.opts.root);parts.reverse();return PATH.join.apply(null,parts)}),flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:(function(flags){if(flags in NODEFS.flagsToPermissionStringMap){return NODEFS.flagsToPermissionStringMap[flags]}else {return flags}}),node_ops:{getattr:(function(node){var path=NODEFS.realPath(node);var stat;try{stat=fs.lstatSync(path);}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}if(NODEFS.isWindows&&!stat.blksize){stat.blksize=4096;}if(NODEFS.isWindows&&!stat.blocks){stat.blocks=(stat.size+stat.blksize-1)/stat.blksize|0;}return {dev:stat.dev,ino:stat.ino,mode:stat.mode,nlink:stat.nlink,uid:stat.uid,gid:stat.gid,rdev:stat.rdev,size:stat.size,atime:stat.atime,mtime:stat.mtime,ctime:stat.ctime,blksize:stat.blksize,blocks:stat.blocks}}),setattr:(function(node,attr){var path=NODEFS.realPath(node);try{if(attr.mode!==undefined){fs.chmodSync(path,attr.mode);node.mode=attr.mode;}if(attr.timestamp!==undefined){var date=new Date(attr.timestamp);fs.utimesSync(path,date,date);}if(attr.size!==undefined){fs.truncateSync(path,attr.size);}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),lookup:(function(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);var mode=NODEFS.getMode(path);return NODEFS.createNode(parent,name,mode)}),mknod:(function(parent,name,mode,dev){var node=NODEFS.createNode(parent,name,mode,dev);var path=NODEFS.realPath(node);try{if(FS.isDir(node.mode)){fs.mkdirSync(path,node.mode);}else {fs.writeFileSync(path,"",{mode:node.mode});}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}return node}),rename:(function(oldNode,newDir,newName){var oldPath=NODEFS.realPath(oldNode);var newPath=PATH.join2(NODEFS.realPath(newDir),newName);try{fs.renameSync(oldPath,newPath);}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),unlink:(function(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);try{fs.unlinkSync(path);}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),rmdir:(function(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);try{fs.rmdirSync(path);}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),readdir:(function(node){var path=NODEFS.realPath(node);try{return fs.readdirSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),symlink:(function(parent,newName,oldPath){var newPath=PATH.join2(NODEFS.realPath(parent),newName);try{fs.symlinkSync(oldPath,newPath);}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),readlink:(function(node){var path=NODEFS.realPath(node);try{path=fs.readlinkSync(path);path=NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root),path);return path}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}})},stream_ops:{open:(function(stream){var path=NODEFS.realPath(stream.node);try{if(FS.isFile(stream.node.mode)){stream.nfd=fs.openSync(path,NODEFS.flagsToPermissionString(stream.flags));}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),close:(function(stream){try{if(FS.isFile(stream.node.mode)&&stream.nfd){fs.closeSync(stream.nfd);}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),read:(function(stream,buffer,offset,length,position){if(length===0)return 0;var nbuffer=new Buffer(length);var res;try{res=fs.readSync(stream.nfd,nbuffer,0,length,position);}catch(e){throw new FS.ErrnoError(ERRNO_CODES[e.code])}if(res>0){for(var i=0;i<res;i++){buffer[offset+i]=nbuffer[i];}}return res}),write:(function(stream,buffer,offset,length,position){var nbuffer=new Buffer(buffer.subarray(offset,offset+length));var res;try{res=fs.writeSync(stream.nfd,nbuffer,0,length,position);}catch(e){throw new FS.ErrnoError(ERRNO_CODES[e.code])}return res}),llseek:(function(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position;}else if(whence===2){if(FS.isFile(stream.node.mode)){try{var stat=fs.fstatSync(stream.nfd);position+=stat.size;}catch(e){throw new FS.ErrnoError(ERRNO_CODES[e.code])}}}if(position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return position})}};var _stdin=allocate(1,"i32*",ALLOC_STATIC);var _stdout=allocate(1,"i32*",ALLOC_STATIC);var _stderr=allocate(1,"i32*",ALLOC_STATIC);function _fflush(stream){}var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,trackingDelegate:{},tracking:{openFlags:{READ:1,WRITE:2}},ErrnoError:null,genericErrors:{},handleFSError:(function(e){if(!(e instanceof FS.ErrnoError))throw e+" : "+stackTrace();return ___setErrNo(e.errno)}),lookupPath:(function(path,opts){path=PATH.resolve(FS.cwd(),path);opts=opts||{};if(!path)return {path:"",node:null};var defaults={follow_mount:true,recurse_count:0};for(var key in defaults){if(opts[key]===undefined){opts[key]=defaults[key];}}if(opts.recurse_count>8){throw new FS.ErrnoError(ERRNO_CODES.ELOOP)}var parts=PATH.normalizeArray(path.split("/").filter((function(p){return !!p})),false);var current=FS.root;var current_path="/";for(var i=0;i<parts.length;i++){var islast=i===parts.length-1;if(islast&&opts.parent){break}current=FS.lookupNode(current,parts[i]);current_path=PATH.join2(current_path,parts[i]);if(FS.isMountpoint(current)){if(!islast||islast&&opts.follow_mount){current=current.mounted.root;}}if(!islast||opts.follow){var count=0;while(FS.isLink(current.mode)){var link=FS.readlink(current_path);current_path=PATH.resolve(PATH.dirname(current_path),link);var lookup=FS.lookupPath(current_path,{recurse_count:opts.recurse_count});current=lookup.node;if(count++>40){throw new FS.ErrnoError(ERRNO_CODES.ELOOP)}}}}return {path:current_path,node:current}}),getPath:(function(node){var path;while(true){if(FS.isRoot(node)){var mount=node.mount.mountpoint;if(!path)return mount;return mount[mount.length-1]!=="/"?mount+"/"+path:mount+path}path=path?node.name+"/"+path:node.name;node=node.parent;}}),hashName:(function(parentid,name){var hash=0;for(var i=0;i<name.length;i++){hash=(hash<<5)-hash+name.charCodeAt(i)|0;}return (parentid+hash>>>0)%FS.nameTable.length}),hashAddNode:(function(node){var hash=FS.hashName(node.parent.id,node.name);node.name_next=FS.nameTable[hash];FS.nameTable[hash]=node;}),hashRemoveNode:(function(node){var hash=FS.hashName(node.parent.id,node.name);if(FS.nameTable[hash]===node){FS.nameTable[hash]=node.name_next;}else {var current=FS.nameTable[hash];while(current){if(current.name_next===node){current.name_next=node.name_next;break}current=current.name_next;}}}),lookupNode:(function(parent,name){var err=FS.mayLookup(parent);if(err){throw new FS.ErrnoError(err,parent)}var hash=FS.hashName(parent.id,name);for(var node=FS.nameTable[hash];node;node=node.name_next){var nodeName=node.name;if(node.parent.id===parent.id&&nodeName===name){return node}}return FS.lookup(parent,name)}),createNode:(function(parent,name,mode,rdev){if(!FS.FSNode){FS.FSNode=(function(parent,name,mode,rdev){if(!parent){parent=this;}this.parent=parent;this.mount=parent.mount;this.mounted=null;this.id=FS.nextInode++;this.name=name;this.mode=mode;this.node_ops={};this.stream_ops={};this.rdev=rdev;});FS.FSNode.prototype={};var readMode=292|73;var writeMode=146;Object.defineProperties(FS.FSNode.prototype,{read:{get:(function(){return (this.mode&readMode)===readMode}),set:(function(val){val?this.mode|=readMode:this.mode&=~readMode;})},write:{get:(function(){return (this.mode&writeMode)===writeMode}),set:(function(val){val?this.mode|=writeMode:this.mode&=~writeMode;})},isFolder:{get:(function(){return FS.isDir(this.mode)})},isDevice:{get:(function(){return FS.isChrdev(this.mode)})}});}var node=new FS.FSNode(parent,name,mode,rdev);FS.hashAddNode(node);return node}),destroyNode:(function(node){FS.hashRemoveNode(node);}),isRoot:(function(node){return node===node.parent}),isMountpoint:(function(node){return !!node.mounted}),isFile:(function(mode){return (mode&61440)===32768}),isDir:(function(mode){return (mode&61440)===16384}),isLink:(function(mode){return (mode&61440)===40960}),isChrdev:(function(mode){return (mode&61440)===8192}),isBlkdev:(function(mode){return (mode&61440)===24576}),isFIFO:(function(mode){return (mode&61440)===4096}),isSocket:(function(mode){return (mode&49152)===49152}),flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:(function(str){var flags=FS.flagModes[str];if(typeof flags==="undefined"){throw new Error("Unknown file open mode: "+str)}return flags}),flagsToPermissionString:(function(flag){var accmode=flag&2097155;var perms=["r","w","rw"][accmode];if(flag&512){perms+="w";}return perms}),nodePermissions:(function(node,perms){if(FS.ignorePermissions){return 0}if(perms.indexOf("r")!==-1&&!(node.mode&292)){return ERRNO_CODES.EACCES}else if(perms.indexOf("w")!==-1&&!(node.mode&146)){return ERRNO_CODES.EACCES}else if(perms.indexOf("x")!==-1&&!(node.mode&73)){return ERRNO_CODES.EACCES}return 0}),mayLookup:(function(dir){var err=FS.nodePermissions(dir,"x");if(err)return err;if(!dir.node_ops.lookup)return ERRNO_CODES.EACCES;return 0}),mayCreate:(function(dir,name){try{var node=FS.lookupNode(dir,name);return ERRNO_CODES.EEXIST}catch(e){}return FS.nodePermissions(dir,"wx")}),mayDelete:(function(dir,name,isdir){var node;try{node=FS.lookupNode(dir,name);}catch(e){return e.errno}var err=FS.nodePermissions(dir,"wx");if(err){return err}if(isdir){if(!FS.isDir(node.mode)){return ERRNO_CODES.ENOTDIR}if(FS.isRoot(node)||FS.getPath(node)===FS.cwd()){return ERRNO_CODES.EBUSY}}else {if(FS.isDir(node.mode)){return ERRNO_CODES.EISDIR}}return 0}),mayOpen:(function(node,flags){if(!node){return ERRNO_CODES.ENOENT}if(FS.isLink(node.mode)){return ERRNO_CODES.ELOOP}else if(FS.isDir(node.mode)){if((flags&2097155)!==0||flags&512){return ERRNO_CODES.EISDIR}}return FS.nodePermissions(node,FS.flagsToPermissionString(flags))}),MAX_OPEN_FDS:4096,nextfd:(function(fd_start,fd_end){fd_start=fd_start||0;fd_end=fd_end||FS.MAX_OPEN_FDS;for(var fd=fd_start;fd<=fd_end;fd++){if(!FS.streams[fd]){return fd}}throw new FS.ErrnoError(ERRNO_CODES.EMFILE)}),getStream:(function(fd){return FS.streams[fd]}),createStream:(function(stream,fd_start,fd_end){if(!FS.FSStream){FS.FSStream=(function(){});FS.FSStream.prototype={};Object.defineProperties(FS.FSStream.prototype,{object:{get:(function(){return this.node}),set:(function(val){this.node=val;})},isRead:{get:(function(){return (this.flags&2097155)!==1})},isWrite:{get:(function(){return (this.flags&2097155)!==0})},isAppend:{get:(function(){return this.flags&1024})}});}var newStream=new FS.FSStream;for(var p in stream){newStream[p]=stream[p];}stream=newStream;var fd=FS.nextfd(fd_start,fd_end);stream.fd=fd;FS.streams[fd]=stream;return stream}),closeStream:(function(fd){FS.streams[fd]=null;}),getStreamFromPtr:(function(ptr){return FS.streams[ptr-1]}),getPtrForStream:(function(stream){return stream?stream.fd+1:0}),chrdev_stream_ops:{open:(function(stream){var device=FS.getDevice(stream.node.rdev);stream.stream_ops=device.stream_ops;if(stream.stream_ops.open){stream.stream_ops.open(stream);}}),llseek:(function(){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)})},major:(function(dev){return dev>>8}),minor:(function(dev){return dev&255}),makedev:(function(ma,mi){return ma<<8|mi}),registerDevice:(function(dev,ops){FS.devices[dev]={stream_ops:ops};}),getDevice:(function(dev){return FS.devices[dev]}),getMounts:(function(mount){var mounts=[];var check=[mount];while(check.length){var m=check.pop();mounts.push(m);check.push.apply(check,m.mounts);}return mounts}),syncfs:(function(populate,callback){if(typeof populate==="function"){callback=populate;populate=false;}var mounts=FS.getMounts(FS.root.mount);var completed=0;function done(err){if(err){if(!done.errored){done.errored=true;return callback(err)}return}if(++completed>=mounts.length){callback(null);}}mounts.forEach((function(mount){if(!mount.type.syncfs){return done(null)}mount.type.syncfs(mount,populate,done);}));}),mount:(function(type,opts,mountpoint){var root=mountpoint==="/";var pseudo=!mountpoint;var node;if(root&&FS.root){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}else if(!root&&!pseudo){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});mountpoint=lookup.path;node=lookup.node;if(FS.isMountpoint(node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}if(!FS.isDir(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)}}var mount={type:type,opts:opts,mountpoint:mountpoint,mounts:[]};var mountRoot=type.mount(mount);mountRoot.mount=mount;mount.root=mountRoot;if(root){FS.root=mountRoot;}else if(node){node.mounted=mount;if(node.mount){node.mount.mounts.push(mount);}}return mountRoot}),unmount:(function(mountpoint){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});if(!FS.isMountpoint(lookup.node)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var node=lookup.node;var mount=node.mounted;var mounts=FS.getMounts(mount);Object.keys(FS.nameTable).forEach((function(hash){var current=FS.nameTable[hash];while(current){var next=current.name_next;if(mounts.indexOf(current.mount)!==-1){FS.destroyNode(current);}current=next;}}));node.mounted=null;var idx=node.mount.mounts.indexOf(mount);assert(idx!==-1);node.mount.mounts.splice(idx,1);}),lookup:(function(parent,name){return parent.node_ops.lookup(parent,name)}),mknod:(function(path,mode,dev){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);if(!name||name==="."||name===".."){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var err=FS.mayCreate(parent,name);if(err){throw new FS.ErrnoError(err)}if(!parent.node_ops.mknod){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}return parent.node_ops.mknod(parent,name,mode,dev)}),create:(function(path,mode){mode=mode!==undefined?mode:438;mode&=4095;mode|=32768;return FS.mknod(path,mode,0)}),mkdir:(function(path,mode){mode=mode!==undefined?mode:511;mode&=511|512;mode|=16384;return FS.mknod(path,mode,0)}),mkdev:(function(path,mode,dev){if(typeof dev==="undefined"){dev=mode;mode=438;}mode|=8192;return FS.mknod(path,mode,dev)}),symlink:(function(oldpath,newpath){if(!PATH.resolve(oldpath)){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}var lookup=FS.lookupPath(newpath,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}var newname=PATH.basename(newpath);var err=FS.mayCreate(parent,newname);if(err){throw new FS.ErrnoError(err)}if(!parent.node_ops.symlink){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}return parent.node_ops.symlink(parent,newname,oldpath)}),rename:(function(old_path,new_path){var old_dirname=PATH.dirname(old_path);var new_dirname=PATH.dirname(new_path);var old_name=PATH.basename(old_path);var new_name=PATH.basename(new_path);var lookup,old_dir,new_dir;try{lookup=FS.lookupPath(old_path,{parent:true});old_dir=lookup.node;lookup=FS.lookupPath(new_path,{parent:true});new_dir=lookup.node;}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}if(!old_dir||!new_dir)throw new FS.ErrnoError(ERRNO_CODES.ENOENT);if(old_dir.mount!==new_dir.mount){throw new FS.ErrnoError(ERRNO_CODES.EXDEV)}var old_node=FS.lookupNode(old_dir,old_name);var relative=PATH.relative(old_path,new_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}relative=PATH.relative(new_path,old_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)}var new_node;try{new_node=FS.lookupNode(new_dir,new_name);}catch(e){}if(old_node===new_node){return}var isdir=FS.isDir(old_node.mode);var err=FS.mayDelete(old_dir,old_name,isdir);if(err){throw new FS.ErrnoError(err)}err=new_node?FS.mayDelete(new_dir,new_name,isdir):FS.mayCreate(new_dir,new_name);if(err){throw new FS.ErrnoError(err)}if(!old_dir.node_ops.rename){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isMountpoint(old_node)||new_node&&FS.isMountpoint(new_node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}if(new_dir!==old_dir){err=FS.nodePermissions(old_dir,"w");if(err){throw new FS.ErrnoError(err)}}try{if(FS.trackingDelegate["willMovePath"]){FS.trackingDelegate["willMovePath"](old_path,new_path);}}catch(e){console.log("FS.trackingDelegate['willMovePath']('"+old_path+"', '"+new_path+"') threw an exception: "+e.message);}FS.hashRemoveNode(old_node);try{old_dir.node_ops.rename(old_node,new_dir,new_name);}catch(e){throw e}finally{FS.hashAddNode(old_node);}try{if(FS.trackingDelegate["onMovePath"])FS.trackingDelegate["onMovePath"](old_path,new_path);}catch(e){console.log("FS.trackingDelegate['onMovePath']('"+old_path+"', '"+new_path+"') threw an exception: "+e.message);}}),rmdir:(function(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var err=FS.mayDelete(parent,name,true);if(err){throw new FS.ErrnoError(err)}if(!parent.node_ops.rmdir){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}try{if(FS.trackingDelegate["willDeletePath"]){FS.trackingDelegate["willDeletePath"](path);}}catch(e){console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: "+e.message);}parent.node_ops.rmdir(parent,name);FS.destroyNode(node);try{if(FS.trackingDelegate["onDeletePath"])FS.trackingDelegate["onDeletePath"](path);}catch(e){console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: "+e.message);}}),readdir:(function(path){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;if(!node.node_ops.readdir){throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)}return node.node_ops.readdir(node)}),unlink:(function(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var err=FS.mayDelete(parent,name,false);if(err){if(err===ERRNO_CODES.EISDIR)err=ERRNO_CODES.EPERM;throw new FS.ErrnoError(err)}if(!parent.node_ops.unlink){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}try{if(FS.trackingDelegate["willDeletePath"]){FS.trackingDelegate["willDeletePath"](path);}}catch(e){console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: "+e.message);}parent.node_ops.unlink(parent,name);FS.destroyNode(node);try{if(FS.trackingDelegate["onDeletePath"])FS.trackingDelegate["onDeletePath"](path);}catch(e){console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: "+e.message);}}),readlink:(function(path){var lookup=FS.lookupPath(path);var link=lookup.node;if(!link){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}if(!link.node_ops.readlink){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return PATH.resolve(FS.getPath(lookup.node.parent),link.node_ops.readlink(link))}),stat:(function(path,dontFollow){var lookup=FS.lookupPath(path,{follow:!dontFollow});var node=lookup.node;if(!node){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}if(!node.node_ops.getattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}return node.node_ops.getattr(node)}),lstat:(function(path){return FS.stat(path,true)}),chmod:(function(path,mode,dontFollow){var node;if(typeof path==="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node;}else {node=path;}if(!node.node_ops.setattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}node.node_ops.setattr(node,{mode:mode&4095|node.mode&~4095,timestamp:Date.now()});}),lchmod:(function(path,mode){FS.chmod(path,mode,true);}),fchmod:(function(fd,mode){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}FS.chmod(stream.node,mode);}),chown:(function(path,uid,gid,dontFollow){var node;if(typeof path==="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node;}else {node=path;}if(!node.node_ops.setattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}node.node_ops.setattr(node,{timestamp:Date.now()});}),lchown:(function(path,uid,gid){FS.chown(path,uid,gid,true);}),fchown:(function(fd,uid,gid){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}FS.chown(stream.node,uid,gid);}),truncate:(function(path,len){if(len<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var node;if(typeof path==="string"){var lookup=FS.lookupPath(path,{follow:true});node=lookup.node;}else {node=path;}if(!node.node_ops.setattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isDir(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EISDIR)}if(!FS.isFile(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var err=FS.nodePermissions(node,"w");if(err){throw new FS.ErrnoError(err)}node.node_ops.setattr(node,{size:len,timestamp:Date.now()});}),ftruncate:(function(fd,len){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}FS.truncate(stream.node,len);}),utime:(function(path,atime,mtime){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;node.node_ops.setattr(node,{timestamp:Math.max(atime,mtime)});}),open:(function(path,flags,mode,fd_start,fd_end){if(path===""){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}flags=typeof flags==="string"?FS.modeStringToFlags(flags):flags;mode=typeof mode==="undefined"?438:mode;if(flags&64){mode=mode&4095|32768;}else {mode=0;}var node;if(typeof path==="object"){node=path;}else {path=PATH.normalize(path);try{var lookup=FS.lookupPath(path,{follow:!(flags&131072)});node=lookup.node;}catch(e){}}var created=false;if(flags&64){if(node){if(flags&128){throw new FS.ErrnoError(ERRNO_CODES.EEXIST)}}else {node=FS.mknod(path,mode,0);created=true;}}if(!node){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}if(FS.isChrdev(node.mode)){flags&=~512;}if(!created){var err=FS.mayOpen(node,flags);if(err){throw new FS.ErrnoError(err)}}if(flags&512){FS.truncate(node,0);}flags&=~(128|512);var stream=FS.createStream({node:node,path:FS.getPath(node),flags:flags,seekable:true,position:0,stream_ops:node.stream_ops,ungotten:[],error:false},fd_start,fd_end);if(stream.stream_ops.open){stream.stream_ops.open(stream);}if(Module["logReadFiles"]&&!(flags&1)){if(!FS.readFiles)FS.readFiles={};if(!(path in FS.readFiles)){FS.readFiles[path]=1;Module["printErr"]("read file: "+path);}}try{if(FS.trackingDelegate["onOpenFile"]){var trackingFlags=0;if((flags&2097155)!==1){trackingFlags|=FS.tracking.openFlags.READ;}if((flags&2097155)!==0){trackingFlags|=FS.tracking.openFlags.WRITE;}FS.trackingDelegate["onOpenFile"](path,trackingFlags);}}catch(e){console.log("FS.trackingDelegate['onOpenFile']('"+path+"', flags) threw an exception: "+e.message);}return stream}),close:(function(stream){try{if(stream.stream_ops.close){stream.stream_ops.close(stream);}}catch(e){throw e}finally{FS.closeStream(stream.fd);}}),llseek:(function(stream,offset,whence){if(!stream.seekable||!stream.stream_ops.llseek){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)}stream.position=stream.stream_ops.llseek(stream,offset,whence);stream.ungotten=[];return stream.position}),read:(function(stream,buffer,offset,length,position){if(length<0||position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if((stream.flags&2097155)===1){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EISDIR)}if(!stream.stream_ops.read){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var seeking=true;if(typeof position==="undefined"){position=stream.position;seeking=false;}else if(!stream.seekable){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)}var bytesRead=stream.stream_ops.read(stream,buffer,offset,length,position);if(!seeking)stream.position+=bytesRead;return bytesRead}),write:(function(stream,buffer,offset,length,position,canOwn){if(length<0||position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EISDIR)}if(!stream.stream_ops.write){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if(stream.flags&1024){FS.llseek(stream,0,2);}var seeking=true;if(typeof position==="undefined"){position=stream.position;seeking=false;}else if(!stream.seekable){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)}var bytesWritten=stream.stream_ops.write(stream,buffer,offset,length,position,canOwn);if(!seeking)stream.position+=bytesWritten;try{if(stream.path&&FS.trackingDelegate["onWriteToFile"])FS.trackingDelegate["onWriteToFile"](stream.path);}catch(e){console.log("FS.trackingDelegate['onWriteToFile']('"+path+"') threw an exception: "+e.message);}return bytesWritten}),allocate:(function(stream,offset,length){if(offset<0||length<=0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if(!FS.isFile(stream.node.mode)&&!FS.isDir(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}if(!stream.stream_ops.allocate){throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP)}stream.stream_ops.allocate(stream,offset,length);}),mmap:(function(stream,buffer,offset,length,position,prot,flags){if((stream.flags&2097155)===1){throw new FS.ErrnoError(ERRNO_CODES.EACCES)}if(!stream.stream_ops.mmap){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}return stream.stream_ops.mmap(stream,buffer,offset,length,position,prot,flags)}),msync:(function(stream,buffer,offset,length,mmapFlags){if(!stream||!stream.stream_ops.msync){return 0}return stream.stream_ops.msync(stream,buffer,offset,length,mmapFlags)}),munmap:(function(stream){return 0}),ioctl:(function(stream,cmd,arg){if(!stream.stream_ops.ioctl){throw new FS.ErrnoError(ERRNO_CODES.ENOTTY)}return stream.stream_ops.ioctl(stream,cmd,arg)}),readFile:(function(path,opts){opts=opts||{};opts.flags=opts.flags||"r";opts.encoding=opts.encoding||"binary";if(opts.encoding!=="utf8"&&opts.encoding!=="binary"){throw new Error('Invalid encoding type "'+opts.encoding+'"')}var ret;var stream=FS.open(path,opts.flags);var stat=FS.stat(path);var length=stat.size;var buf=new Uint8Array(length);FS.read(stream,buf,0,length,0);if(opts.encoding==="utf8"){ret=UTF8ArrayToString(buf,0);}else if(opts.encoding==="binary"){ret=buf;}FS.close(stream);return ret}),writeFile:(function(path,data,opts){opts=opts||{};opts.flags=opts.flags||"w";opts.encoding=opts.encoding||"utf8";if(opts.encoding!=="utf8"&&opts.encoding!=="binary"){throw new Error('Invalid encoding type "'+opts.encoding+'"')}var stream=FS.open(path,opts.flags,opts.mode);if(opts.encoding==="utf8"){var buf=new Uint8Array(lengthBytesUTF8(data)+1);var actualNumBytes=stringToUTF8Array(data,buf,0,buf.length);FS.write(stream,buf,0,actualNumBytes,0,opts.canOwn);}else if(opts.encoding==="binary"){FS.write(stream,data,0,data.length,0,opts.canOwn);}FS.close(stream);}),cwd:(function(){return FS.currentPath}),chdir:(function(path){var lookup=FS.lookupPath(path,{follow:true});if(!FS.isDir(lookup.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)}var err=FS.nodePermissions(lookup.node,"x");if(err){throw new FS.ErrnoError(err)}FS.currentPath=lookup.path;}),createDefaultDirectories:(function(){FS.mkdir("/tmp");FS.mkdir("/home");FS.mkdir("/home/web_user");}),createDefaultDevices:(function(){FS.mkdir("/dev");FS.registerDevice(FS.makedev(1,3),{read:(function(){return 0}),write:(function(stream,buffer,offset,length,pos){return length})});FS.mkdev("/dev/null",FS.makedev(1,3));TTY.register(FS.makedev(5,0),TTY.default_tty_ops);TTY.register(FS.makedev(6,0),TTY.default_tty1_ops);FS.mkdev("/dev/tty",FS.makedev(5,0));FS.mkdev("/dev/tty1",FS.makedev(6,0));var random_device;if(typeof crypto!=="undefined"){var randomBuffer=new Uint8Array(1);random_device=(function(){crypto.getRandomValues(randomBuffer);return randomBuffer[0]});}else if(ENVIRONMENT_IS_NODE){random_device=(function(){return require("crypto").randomBytes(1)[0]});}else {random_device=(function(){return Math.random()*256|0});}FS.createDevice("/dev","random",random_device);FS.createDevice("/dev","urandom",random_device);FS.mkdir("/dev/shm");FS.mkdir("/dev/shm/tmp");}),createStandardStreams:(function(){if(Module["stdin"]){FS.createDevice("/dev","stdin",Module["stdin"]);}else {FS.symlink("/dev/tty","/dev/stdin");}if(Module["stdout"]){FS.createDevice("/dev","stdout",null,Module["stdout"]);}else {FS.symlink("/dev/tty","/dev/stdout");}if(Module["stderr"]){FS.createDevice("/dev","stderr",null,Module["stderr"]);}else {FS.symlink("/dev/tty1","/dev/stderr");}var stdin=FS.open("/dev/stdin","r");HEAP32[_stdin>>2]=FS.getPtrForStream(stdin);assert(stdin.fd===0,"invalid handle for stdin ("+stdin.fd+")");var stdout=FS.open("/dev/stdout","w");HEAP32[_stdout>>2]=FS.getPtrForStream(stdout);assert(stdout.fd===1,"invalid handle for stdout ("+stdout.fd+")");var stderr=FS.open("/dev/stderr","w");HEAP32[_stderr>>2]=FS.getPtrForStream(stderr);assert(stderr.fd===2,"invalid handle for stderr ("+stderr.fd+")");}),ensureErrnoError:(function(){if(FS.ErrnoError)return;FS.ErrnoError=function ErrnoError(errno,node){this.node=node;this.setErrno=(function(errno){this.errno=errno;for(var key in ERRNO_CODES){if(ERRNO_CODES[key]===errno){this.code=key;break}}});this.setErrno(errno);this.message=ERRNO_MESSAGES[errno];};FS.ErrnoError.prototype=new Error;FS.ErrnoError.prototype.constructor=FS.ErrnoError;[ERRNO_CODES.ENOENT].forEach((function(code){FS.genericErrors[code]=new FS.ErrnoError(code);FS.genericErrors[code].stack="<generic error, no stack>";}));}),staticInit:(function(){FS.ensureErrnoError();FS.nameTable=new Array(4096);FS.mount(MEMFS,{},"/");FS.createDefaultDirectories();FS.createDefaultDevices();}),init:(function(input,output,error){assert(!FS.init.initialized,"FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");FS.init.initialized=true;FS.ensureErrnoError();Module["stdin"]=input||Module["stdin"];Module["stdout"]=output||Module["stdout"];Module["stderr"]=error||Module["stderr"];FS.createStandardStreams();}),quit:(function(){FS.init.initialized=false;for(var i=0;i<FS.streams.length;i++){var stream=FS.streams[i];if(!stream){continue}FS.close(stream);}}),getMode:(function(canRead,canWrite){var mode=0;if(canRead)mode|=292|73;if(canWrite)mode|=146;return mode}),joinPath:(function(parts,forceRelative){var path=PATH.join.apply(null,parts);if(forceRelative&&path[0]=="/")path=path.substr(1);return path}),absolutePath:(function(relative,base){return PATH.resolve(base,relative)}),standardizePath:(function(path){return PATH.normalize(path)}),findObject:(function(path,dontResolveLastLink){var ret=FS.analyzePath(path,dontResolveLastLink);if(ret.exists){return ret.object}else {___setErrNo(ret.error);return null}}),analyzePath:(function(path,dontResolveLastLink){try{var lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});path=lookup.path;}catch(e){}var ret={isRoot:false,exists:false,error:0,name:null,path:null,object:null,parentExists:false,parentPath:null,parentObject:null};try{var lookup=FS.lookupPath(path,{parent:true});ret.parentExists=true;ret.parentPath=lookup.path;ret.parentObject=lookup.node;ret.name=PATH.basename(path);lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});ret.exists=true;ret.path=lookup.path;ret.object=lookup.node;ret.name=lookup.node.name;ret.isRoot=lookup.path==="/";}catch(e){ret.error=e.errno;}return ret}),createFolder:(function(parent,name,canRead,canWrite){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(canRead,canWrite);return FS.mkdir(path,mode)}),createPath:(function(parent,path,canRead,canWrite){parent=typeof parent==="string"?parent:FS.getPath(parent);var parts=path.split("/").reverse();while(parts.length){var part=parts.pop();if(!part)continue;var current=PATH.join2(parent,part);try{FS.mkdir(current);}catch(e){}parent=current;}return current}),createFile:(function(parent,name,properties,canRead,canWrite){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(canRead,canWrite);return FS.create(path,mode)}),createDataFile:(function(parent,name,data,canRead,canWrite,canOwn){var path=name?PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name):parent;var mode=FS.getMode(canRead,canWrite);var node=FS.create(path,mode);if(data){if(typeof data==="string"){var arr=new Array(data.length);for(var i=0,len=data.length;i<len;++i)arr[i]=data.charCodeAt(i);data=arr;}FS.chmod(node,mode|146);var stream=FS.open(node,"w");FS.write(stream,data,0,data.length,0,canOwn);FS.close(stream);FS.chmod(node,mode);}return node}),createDevice:(function(parent,name,input,output){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(!!input,!!output);if(!FS.createDevice.major)FS.createDevice.major=64;var dev=FS.makedev(FS.createDevice.major++,0);FS.registerDevice(dev,{open:(function(stream){stream.seekable=false;}),close:(function(stream){if(output&&output.buffer&&output.buffer.length){output(10);}}),read:(function(stream,buffer,offset,length,pos){var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=input();}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result;}if(bytesRead){stream.node.timestamp=Date.now();}return bytesRead}),write:(function(stream,buffer,offset,length,pos){for(var i=0;i<length;i++){try{output(buffer[offset+i]);}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}}if(length){stream.node.timestamp=Date.now();}return i})});return FS.mkdev(path,mode,dev)}),createLink:(function(parent,name,target,canRead,canWrite){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);return FS.symlink(target,path)}),forceLoadFile:(function(obj){if(obj.isDevice||obj.isFolder||obj.link||obj.contents)return true;var success=true;if(typeof XMLHttpRequest!=="undefined"){throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")}else if(Module["read"]){try{obj.contents=intArrayFromString(Module["read"](obj.url),true);obj.usedBytes=obj.contents.length;}catch(e){success=false;}}else {throw new Error("Cannot load without read() or XMLHttpRequest.")}if(!success)___setErrNo(ERRNO_CODES.EIO);return success}),createLazyFile:(function(parent,name,url,canRead,canWrite){function LazyUint8Array(){this.lengthKnown=false;this.chunks=[];}LazyUint8Array.prototype.get=function LazyUint8Array_get(idx){if(idx>this.length-1||idx<0){return undefined}var chunkOffset=idx%this.chunkSize;var chunkNum=idx/this.chunkSize|0;return this.getter(chunkNum)[chunkOffset]};LazyUint8Array.prototype.setDataGetter=function LazyUint8Array_setDataGetter(getter){this.getter=getter;};LazyUint8Array.prototype.cacheLength=function LazyUint8Array_cacheLength(){var xhr=new XMLHttpRequest;xhr.open("HEAD",url,false);xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))throw new Error("Couldn't load "+url+". Status: "+xhr.status);var datalength=Number(xhr.getResponseHeader("Content-length"));var header;var hasByteServing=(header=xhr.getResponseHeader("Accept-Ranges"))&&header==="bytes";var chunkSize=1024*1024;if(!hasByteServing)chunkSize=datalength;var doXHR=(function(from,to){if(from>to)throw new Error("invalid range ("+from+", "+to+") or no bytes requested!");if(to>datalength-1)throw new Error("only "+datalength+" bytes available! programmer error!");var xhr=new XMLHttpRequest;xhr.open("GET",url,false);if(datalength!==chunkSize)xhr.setRequestHeader("Range","bytes="+from+"-"+to);if(typeof Uint8Array!="undefined")xhr.responseType="arraybuffer";if(xhr.overrideMimeType){xhr.overrideMimeType("text/plain; charset=x-user-defined");}xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))throw new Error("Couldn't load "+url+". Status: "+xhr.status);if(xhr.response!==undefined){return new Uint8Array(xhr.response||[])}else {return intArrayFromString(xhr.responseText||"",true)}});var lazyArray=this;lazyArray.setDataGetter((function(chunkNum){var start=chunkNum*chunkSize;var end=(chunkNum+1)*chunkSize-1;end=Math.min(end,datalength-1);if(typeof lazyArray.chunks[chunkNum]==="undefined"){lazyArray.chunks[chunkNum]=doXHR(start,end);}if(typeof lazyArray.chunks[chunkNum]==="undefined")throw new Error("doXHR failed!");return lazyArray.chunks[chunkNum]}));this._length=datalength;this._chunkSize=chunkSize;this.lengthKnown=true;};if(typeof XMLHttpRequest!=="undefined"){if(!ENVIRONMENT_IS_WORKER)throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";var lazyArray=new LazyUint8Array;Object.defineProperty(lazyArray,"length",{get:(function(){if(!this.lengthKnown){this.cacheLength();}return this._length})});Object.defineProperty(lazyArray,"chunkSize",{get:(function(){if(!this.lengthKnown){this.cacheLength();}return this._chunkSize})});var properties={isDevice:false,contents:lazyArray};}else {var properties={isDevice:false,url:url};}var node=FS.createFile(parent,name,properties,canRead,canWrite);if(properties.contents){node.contents=properties.contents;}else if(properties.url){node.contents=null;node.url=properties.url;}Object.defineProperty(node,"usedBytes",{get:(function(){return this.contents.length})});var stream_ops={};var keys=Object.keys(node.stream_ops);keys.forEach((function(key){var fn=node.stream_ops[key];stream_ops[key]=function forceLoadLazyFile(){if(!FS.forceLoadFile(node)){throw new FS.ErrnoError(ERRNO_CODES.EIO)}return fn.apply(null,arguments)};}));stream_ops.read=function stream_ops_read(stream,buffer,offset,length,position){if(!FS.forceLoadFile(node)){throw new FS.ErrnoError(ERRNO_CODES.EIO)}var contents=stream.node.contents;if(position>=contents.length)return 0;var size=Math.min(contents.length-position,length);assert(size>=0);if(contents.slice){for(var i=0;i<size;i++){buffer[offset+i]=contents[position+i];}}else {for(var i=0;i<size;i++){buffer[offset+i]=contents.get(position+i);}}return size};node.stream_ops=stream_ops;return node}),createPreloadedFile:(function(parent,name,url,canRead,canWrite,onload,onerror,dontCreateFile,canOwn,preFinish){Browser.init();var fullname=name?PATH.resolve(PATH.join2(parent,name)):parent;function processData(byteArray){function finish(byteArray){if(preFinish)preFinish();if(!dontCreateFile){FS.createDataFile(parent,name,byteArray,canRead,canWrite,canOwn);}if(onload)onload();removeRunDependency();}var handled=false;Module["preloadPlugins"].forEach((function(plugin){if(handled)return;if(plugin["canHandle"](fullname)){plugin["handle"](byteArray,fullname,finish,(function(){if(onerror)onerror();removeRunDependency();}));handled=true;}}));if(!handled)finish(byteArray);}addRunDependency();if(typeof url=="string"){Browser.asyncLoad(url,(function(byteArray){processData(byteArray);}),onerror);}else {processData(url);}}),indexedDB:(function(){return window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB}),DB_NAME:(function(){return "EM_FS_"+window.location.pathname}),DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:(function(paths,onload,onerror){onload=onload||(function(){});onerror=onerror||(function(){});var indexedDB=FS.indexedDB();try{var openRequest=indexedDB.open(FS.DB_NAME(),FS.DB_VERSION);}catch(e){return onerror(e)}openRequest.onupgradeneeded=function openRequest_onupgradeneeded(){console.log("creating db");var db=openRequest.result;db.createObjectStore(FS.DB_STORE_NAME);};openRequest.onsuccess=function openRequest_onsuccess(){var db=openRequest.result;var transaction=db.transaction([FS.DB_STORE_NAME],"readwrite");var files=transaction.objectStore(FS.DB_STORE_NAME);var ok=0,fail=0,total=paths.length;function finish(){if(fail==0)onload();else onerror();}paths.forEach((function(path){var putRequest=files.put(FS.analyzePath(path).object.contents,path);putRequest.onsuccess=function putRequest_onsuccess(){ok++;if(ok+fail==total)finish();};putRequest.onerror=function putRequest_onerror(){fail++;if(ok+fail==total)finish();};}));transaction.onerror=onerror;};openRequest.onerror=onerror;}),loadFilesFromDB:(function(paths,onload,onerror){onload=onload||(function(){});onerror=onerror||(function(){});var indexedDB=FS.indexedDB();try{var openRequest=indexedDB.open(FS.DB_NAME(),FS.DB_VERSION);}catch(e){return onerror(e)}openRequest.onupgradeneeded=onerror;openRequest.onsuccess=function openRequest_onsuccess(){var db=openRequest.result;try{var transaction=db.transaction([FS.DB_STORE_NAME],"readonly");}catch(e){onerror(e);return}var files=transaction.objectStore(FS.DB_STORE_NAME);var ok=0,fail=0,total=paths.length;function finish(){if(fail==0)onload();else onerror();}paths.forEach((function(path){var getRequest=files.get(path);getRequest.onsuccess=function getRequest_onsuccess(){if(FS.analyzePath(path).exists){FS.unlink(path);}FS.createDataFile(PATH.dirname(path),PATH.basename(path),getRequest.result,true,true,true);ok++;if(ok+fail==total)finish();};getRequest.onerror=function getRequest_onerror(){fail++;if(ok+fail==total)finish();};}));transaction.onerror=onerror;};openRequest.onerror=onerror;})};var PATH={splitPath:(function(filename){var splitPathRe=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;return splitPathRe.exec(filename).slice(1)}),normalizeArray:(function(parts,allowAboveRoot){var up=0;for(var i=parts.length-1;i>=0;i--){var last=parts[i];if(last==="."){parts.splice(i,1);}else if(last===".."){parts.splice(i,1);up++;}else if(up){parts.splice(i,1);up--;}}if(allowAboveRoot){for(;up--;up){parts.unshift("..");}}return parts}),normalize:(function(path){var isAbsolute=path.charAt(0)==="/",trailingSlash=path.substr(-1)==="/";path=PATH.normalizeArray(path.split("/").filter((function(p){return !!p})),!isAbsolute).join("/");if(!path&&!isAbsolute){path=".";}if(path&&trailingSlash){path+="/";}return (isAbsolute?"/":"")+path}),dirname:(function(path){var result=PATH.splitPath(path),root=result[0],dir=result[1];if(!root&&!dir){return "."}if(dir){dir=dir.substr(0,dir.length-1);}return root+dir}),basename:(function(path){if(path==="/")return "/";var lastSlash=path.lastIndexOf("/");if(lastSlash===-1)return path;return path.substr(lastSlash+1)}),extname:(function(path){return PATH.splitPath(path)[3]}),join:(function(){var paths=Array.prototype.slice.call(arguments,0);return PATH.normalize(paths.join("/"))}),join2:(function(l,r){return PATH.normalize(l+"/"+r)}),resolve:(function(){var resolvedPath="",resolvedAbsolute=false;for(var i=arguments.length-1;i>=-1&&!resolvedAbsolute;i--){var path=i>=0?arguments[i]:FS.cwd();if(typeof path!=="string"){throw new TypeError("Arguments to path.resolve must be strings")}else if(!path){return ""}resolvedPath=path+"/"+resolvedPath;resolvedAbsolute=path.charAt(0)==="/";}resolvedPath=PATH.normalizeArray(resolvedPath.split("/").filter((function(p){return !!p})),!resolvedAbsolute).join("/");return (resolvedAbsolute?"/":"")+resolvedPath||"."}),relative:(function(from,to){from=PATH.resolve(from).substr(1);to=PATH.resolve(to).substr(1);function trim(arr){var start=0;for(;start<arr.length;start++){if(arr[start]!=="")break}var end=arr.length-1;for(;end>=0;end--){if(arr[end]!=="")break}if(start>end)return [];return arr.slice(start,end-start+1)}var fromParts=trim(from.split("/"));var toParts=trim(to.split("/"));var length=Math.min(fromParts.length,toParts.length);var samePartsLength=length;for(var i=0;i<length;i++){if(fromParts[i]!==toParts[i]){samePartsLength=i;break}}var outputParts=[];for(var i=samePartsLength;i<fromParts.length;i++){outputParts.push("..");}outputParts=outputParts.concat(toParts.slice(samePartsLength));return outputParts.join("/")})};function _emscripten_set_main_loop_timing(mode,value){Browser.mainLoop.timingMode=mode;Browser.mainLoop.timingValue=value;if(!Browser.mainLoop.func){return 1}if(mode==0){Browser.mainLoop.scheduler=function Browser_mainLoop_scheduler(){setTimeout(Browser.mainLoop.runner,value);};Browser.mainLoop.method="timeout";}else if(mode==1){Browser.mainLoop.scheduler=function Browser_mainLoop_scheduler(){Browser.requestAnimationFrame(Browser.mainLoop.runner);};Browser.mainLoop.method="rAF";}return 0}function _emscripten_set_main_loop(func,fps,simulateInfiniteLoop,arg,noSetTiming){Module["noExitRuntime"]=true;assert(!Browser.mainLoop.func,"emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");Browser.mainLoop.func=func;Browser.mainLoop.arg=arg;var thisMainLoopId=Browser.mainLoop.currentlyRunningMainloop;Browser.mainLoop.runner=function Browser_mainLoop_runner(){if(ABORT)return;if(Browser.mainLoop.queue.length>0){var start=Date.now();var blocker=Browser.mainLoop.queue.shift();blocker.func(blocker.arg);if(Browser.mainLoop.remainingBlockers){var remaining=Browser.mainLoop.remainingBlockers;var next=remaining%1==0?remaining-1:Math.floor(remaining);if(blocker.counted){Browser.mainLoop.remainingBlockers=next;}else {next=next+.5;Browser.mainLoop.remainingBlockers=(8*remaining+next)/9;}}console.log('main loop blocker "'+blocker.name+'" took '+(Date.now()-start)+" ms");Browser.mainLoop.updateStatus();setTimeout(Browser.mainLoop.runner,0);return}if(thisMainLoopId<Browser.mainLoop.currentlyRunningMainloop)return;Browser.mainLoop.currentFrameNumber=Browser.mainLoop.currentFrameNumber+1|0;if(Browser.mainLoop.timingMode==1&&Browser.mainLoop.timingValue>1&&Browser.mainLoop.currentFrameNumber%Browser.mainLoop.timingValue!=0){Browser.mainLoop.scheduler();return}if(Browser.mainLoop.method==="timeout"&&Module.ctx){Module.printErr("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");Browser.mainLoop.method="";}Browser.mainLoop.runIter((function(){if(typeof arg!=="undefined"){Runtime.dynCall("vi",func,[arg]);}else {Runtime.dynCall("v",func);}}));if(thisMainLoopId<Browser.mainLoop.currentlyRunningMainloop)return;if(typeof SDL==="object"&&SDL.audio&&SDL.audio.queueNewAudioData)SDL.audio.queueNewAudioData();Browser.mainLoop.scheduler();};if(!noSetTiming){if(fps&&fps>0)_emscripten_set_main_loop_timing(0,1e3/fps);else _emscripten_set_main_loop_timing(1,1);Browser.mainLoop.scheduler();}if(simulateInfiniteLoop){throw "SimulateInfiniteLoop"}}var Browser={mainLoop:{scheduler:null,method:"",currentlyRunningMainloop:0,func:null,arg:0,timingMode:0,timingValue:0,currentFrameNumber:0,queue:[],pause:(function(){Browser.mainLoop.scheduler=null;Browser.mainLoop.currentlyRunningMainloop++;}),resume:(function(){Browser.mainLoop.currentlyRunningMainloop++;var timingMode=Browser.mainLoop.timingMode;var timingValue=Browser.mainLoop.timingValue;var func=Browser.mainLoop.func;Browser.mainLoop.func=null;_emscripten_set_main_loop(func,0,false,Browser.mainLoop.arg,true);_emscripten_set_main_loop_timing(timingMode,timingValue);Browser.mainLoop.scheduler();}),updateStatus:(function(){if(Module["setStatus"]){var message=Module["statusMessage"]||"Please wait...";var remaining=Browser.mainLoop.remainingBlockers;var expected=Browser.mainLoop.expectedBlockers;if(remaining){if(remaining<expected){Module["setStatus"](message+" ("+(expected-remaining)+"/"+expected+")");}else {Module["setStatus"](message);}}else {Module["setStatus"]("");}}}),runIter:(function(func){if(ABORT)return;if(Module["preMainLoop"]){var preRet=Module["preMainLoop"]();if(preRet===false){return}}try{func();}catch(e){if(e instanceof ExitStatus){return}else {if(e&&typeof e==="object"&&e.stack)Module.printErr("exception thrown: "+[e,e.stack]);throw e}}if(Module["postMainLoop"])Module["postMainLoop"]();})},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:(function(){if(!Module["preloadPlugins"])Module["preloadPlugins"]=[];if(Browser.initted)return;Browser.initted=true;try{new Blob;Browser.hasBlobConstructor=true;}catch(e){Browser.hasBlobConstructor=false;console.log("warning: no blob constructor, cannot create blobs with mimetypes");}Browser.BlobBuilder=typeof MozBlobBuilder!="undefined"?MozBlobBuilder:typeof WebKitBlobBuilder!="undefined"?WebKitBlobBuilder:!Browser.hasBlobConstructor?console.log("warning: no BlobBuilder"):null;Browser.URLObject=typeof window!="undefined"?window.URL?window.URL:window.webkitURL:undefined;if(!Module.noImageDecoding&&typeof Browser.URLObject==="undefined"){console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");Module.noImageDecoding=true;}var imagePlugin={};imagePlugin["canHandle"]=function imagePlugin_canHandle(name){return !Module.noImageDecoding&&/\.(jpg|jpeg|png|bmp)$/i.test(name)};imagePlugin["handle"]=function imagePlugin_handle(byteArray,name,onload,onerror){var b=null;if(Browser.hasBlobConstructor){try{b=new Blob([byteArray],{type:Browser.getMimetype(name)});if(b.size!==byteArray.length){b=new Blob([(new Uint8Array(byteArray)).buffer],{type:Browser.getMimetype(name)});}}catch(e){Runtime.warnOnce("Blob constructor present but fails: "+e+"; falling back to blob builder");}}if(!b){var bb=new Browser.BlobBuilder;bb.append((new Uint8Array(byteArray)).buffer);b=bb.getBlob();}var url=Browser.URLObject.createObjectURL(b);var img=new Image;img.onload=function img_onload(){assert(img.complete,"Image "+name+" could not be decoded");var canvas=document.createElement("canvas");canvas.width=img.width;canvas.height=img.height;var ctx=canvas.getContext("2d");ctx.drawImage(img,0,0);Module["preloadedImages"][name]=canvas;Browser.URLObject.revokeObjectURL(url);if(onload)onload(byteArray);};img.onerror=function img_onerror(event){console.log("Image "+url+" could not be decoded");if(onerror)onerror();};img.src=url;};Module["preloadPlugins"].push(imagePlugin);var audioPlugin={};audioPlugin["canHandle"]=function audioPlugin_canHandle(name){return !Module.noAudioDecoding&&name.substr(-4)in{".ogg":1,".wav":1,".mp3":1}};audioPlugin["handle"]=function audioPlugin_handle(byteArray,name,onload,onerror){var done=false;function finish(audio){if(done)return;done=true;Module["preloadedAudios"][name]=audio;if(onload)onload(byteArray);}function fail(){if(done)return;done=true;Module["preloadedAudios"][name]=new Audio;if(onerror)onerror();}if(Browser.hasBlobConstructor){try{var b=new Blob([byteArray],{type:Browser.getMimetype(name)});}catch(e){return fail()}var url=Browser.URLObject.createObjectURL(b);var audio=new Audio;audio.addEventListener("canplaythrough",(function(){finish(audio);}),false);audio.onerror=function audio_onerror(event){if(done)return;console.log("warning: browser could not fully decode audio "+name+", trying slower base64 approach");function encode64(data){var BASE="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var PAD="=";var ret="";var leftchar=0;var leftbits=0;for(var i=0;i<data.length;i++){leftchar=leftchar<<8|data[i];leftbits+=8;while(leftbits>=6){var curr=leftchar>>leftbits-6&63;leftbits-=6;ret+=BASE[curr];}}if(leftbits==2){ret+=BASE[(leftchar&3)<<4];ret+=PAD+PAD;}else if(leftbits==4){ret+=BASE[(leftchar&15)<<2];ret+=PAD;}return ret}audio.src="data:audio/x-"+name.substr(-3)+";base64,"+encode64(byteArray);finish(audio);};audio.src=url;Browser.safeSetTimeout((function(){finish(audio);}),1e4);}else {return fail()}};Module["preloadPlugins"].push(audioPlugin);var canvas=Module["canvas"];function pointerLockChange(){Browser.pointerLock=document["pointerLockElement"]===canvas||document["mozPointerLockElement"]===canvas||document["webkitPointerLockElement"]===canvas||document["msPointerLockElement"]===canvas;}if(canvas){canvas.requestPointerLock=canvas["requestPointerLock"]||canvas["mozRequestPointerLock"]||canvas["webkitRequestPointerLock"]||canvas["msRequestPointerLock"]||(function(){});canvas.exitPointerLock=document["exitPointerLock"]||document["mozExitPointerLock"]||document["webkitExitPointerLock"]||document["msExitPointerLock"]||(function(){});canvas.exitPointerLock=canvas.exitPointerLock.bind(document);document.addEventListener("pointerlockchange",pointerLockChange,false);document.addEventListener("mozpointerlockchange",pointerLockChange,false);document.addEventListener("webkitpointerlockchange",pointerLockChange,false);document.addEventListener("mspointerlockchange",pointerLockChange,false);if(Module["elementPointerLock"]){canvas.addEventListener("click",(function(ev){if(!Browser.pointerLock&&canvas.requestPointerLock){canvas.requestPointerLock();ev.preventDefault();}}),false);}}}),createContext:(function(canvas,useWebGL,setInModule,webGLContextAttributes){if(useWebGL&&Module.ctx&&canvas==Module.canvas)return Module.ctx;var ctx;var contextHandle;if(useWebGL){var contextAttributes={antialias:false,alpha:false};if(webGLContextAttributes){for(var attribute in webGLContextAttributes){contextAttributes[attribute]=webGLContextAttributes[attribute];}}contextHandle=GL.createContext(canvas,contextAttributes);if(contextHandle){ctx=GL.getContext(contextHandle).GLctx;}canvas.style.backgroundColor="black";}else {ctx=canvas.getContext("2d");}if(!ctx)return null;if(setInModule){if(!useWebGL)assert(typeof GLctx==="undefined","cannot set in module if GLctx is used, but we are a non-GL context that would replace it");Module.ctx=ctx;if(useWebGL)GL.makeContextCurrent(contextHandle);Module.useWebGL=useWebGL;Browser.moduleContextCreatedCallbacks.forEach((function(callback){callback();}));Browser.init();}return ctx}),destroyContext:(function(canvas,useWebGL,setInModule){}),fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:(function(lockPointer,resizeCanvas,vrDevice){Browser.lockPointer=lockPointer;Browser.resizeCanvas=resizeCanvas;Browser.vrDevice=vrDevice;if(typeof Browser.lockPointer==="undefined")Browser.lockPointer=true;if(typeof Browser.resizeCanvas==="undefined")Browser.resizeCanvas=false;if(typeof Browser.vrDevice==="undefined")Browser.vrDevice=null;var canvas=Module["canvas"];function fullScreenChange(){Browser.isFullScreen=false;var canvasContainer=canvas.parentNode;if((document["webkitFullScreenElement"]||document["webkitFullscreenElement"]||document["mozFullScreenElement"]||document["mozFullscreenElement"]||document["fullScreenElement"]||document["fullscreenElement"]||document["msFullScreenElement"]||document["msFullscreenElement"]||document["webkitCurrentFullScreenElement"])===canvasContainer){canvas.cancelFullScreen=document["cancelFullScreen"]||document["mozCancelFullScreen"]||document["webkitCancelFullScreen"]||document["msExitFullscreen"]||document["exitFullscreen"]||(function(){});canvas.cancelFullScreen=canvas.cancelFullScreen.bind(document);if(Browser.lockPointer)canvas.requestPointerLock();Browser.isFullScreen=true;if(Browser.resizeCanvas)Browser.setFullScreenCanvasSize();}else {canvasContainer.parentNode.insertBefore(canvas,canvasContainer);canvasContainer.parentNode.removeChild(canvasContainer);if(Browser.resizeCanvas)Browser.setWindowedCanvasSize();}if(Module["onFullScreen"])Module["onFullScreen"](Browser.isFullScreen);Browser.updateCanvasDimensions(canvas);}if(!Browser.fullScreenHandlersInstalled){Browser.fullScreenHandlersInstalled=true;document.addEventListener("fullscreenchange",fullScreenChange,false);document.addEventListener("mozfullscreenchange",fullScreenChange,false);document.addEventListener("webkitfullscreenchange",fullScreenChange,false);document.addEventListener("MSFullscreenChange",fullScreenChange,false);}var canvasContainer=document.createElement("div");canvas.parentNode.insertBefore(canvasContainer,canvas);canvasContainer.appendChild(canvas);canvasContainer.requestFullScreen=canvasContainer["requestFullScreen"]||canvasContainer["mozRequestFullScreen"]||canvasContainer["msRequestFullscreen"]||(canvasContainer["webkitRequestFullScreen"]?(function(){canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);}):null);if(vrDevice){canvasContainer.requestFullScreen({vrDisplay:vrDevice});}else {canvasContainer.requestFullScreen();}}),nextRAF:0,fakeRequestAnimationFrame:(function(func){var now=Date.now();if(Browser.nextRAF===0){Browser.nextRAF=now+1e3/60;}else {while(now+2>=Browser.nextRAF){Browser.nextRAF+=1e3/60;}}var delay=Math.max(Browser.nextRAF-now,0);setTimeout(func,delay);}),requestAnimationFrame:function requestAnimationFrame(func){if(typeof window==="undefined"){Browser.fakeRequestAnimationFrame(func);}else {if(!window.requestAnimationFrame){window.requestAnimationFrame=window["requestAnimationFrame"]||window["mozRequestAnimationFrame"]||window["webkitRequestAnimationFrame"]||window["msRequestAnimationFrame"]||window["oRequestAnimationFrame"]||Browser.fakeRequestAnimationFrame;}window.requestAnimationFrame(func);}},safeCallback:(function(func){return(function(){if(!ABORT)return func.apply(null,arguments)})}),allowAsyncCallbacks:true,queuedAsyncCallbacks:[],pauseAsyncCallbacks:(function(){Browser.allowAsyncCallbacks=false;}),resumeAsyncCallbacks:(function(){Browser.allowAsyncCallbacks=true;if(Browser.queuedAsyncCallbacks.length>0){var callbacks=Browser.queuedAsyncCallbacks;Browser.queuedAsyncCallbacks=[];callbacks.forEach((function(func){func();}));}}),safeRequestAnimationFrame:(function(func){return Browser.requestAnimationFrame((function(){if(ABORT)return;if(Browser.allowAsyncCallbacks){func();}else {Browser.queuedAsyncCallbacks.push(func);}}))}),safeSetTimeout:(function(func,timeout){Module["noExitRuntime"]=true;return setTimeout((function(){if(ABORT)return;if(Browser.allowAsyncCallbacks){func();}else {Browser.queuedAsyncCallbacks.push(func);}}),timeout)}),safeSetInterval:(function(func,timeout){Module["noExitRuntime"]=true;return setInterval((function(){if(ABORT)return;if(Browser.allowAsyncCallbacks){func();}}),timeout)}),getMimetype:(function(name){return {"jpg":"image/jpeg","jpeg":"image/jpeg","png":"image/png","bmp":"image/bmp","ogg":"audio/ogg","wav":"audio/wav","mp3":"audio/mpeg"}[name.substr(name.lastIndexOf(".")+1)]}),getUserMedia:(function(func){if(!window.getUserMedia){window.getUserMedia=navigator["getUserMedia"]||navigator["mozGetUserMedia"];}window.getUserMedia(func);}),getMovementX:(function(event){return event["movementX"]||event["mozMovementX"]||event["webkitMovementX"]||0}),getMovementY:(function(event){return event["movementY"]||event["mozMovementY"]||event["webkitMovementY"]||0}),getMouseWheelDelta:(function(event){var delta=0;switch(event.type){case"DOMMouseScroll":delta=event.detail;break;case"mousewheel":delta=event.wheelDelta;break;case"wheel":delta=event["deltaY"];break;default:throw "unrecognized mouse wheel event: "+event.type}return delta}),mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:(function(event){if(Browser.pointerLock){if(event.type!="mousemove"&&"mozMovementX"in event){Browser.mouseMovementX=Browser.mouseMovementY=0;}else {Browser.mouseMovementX=Browser.getMovementX(event);Browser.mouseMovementY=Browser.getMovementY(event);}if(typeof SDL!="undefined"){Browser.mouseX=SDL.mouseX+Browser.mouseMovementX;Browser.mouseY=SDL.mouseY+Browser.mouseMovementY;}else {Browser.mouseX+=Browser.mouseMovementX;Browser.mouseY+=Browser.mouseMovementY;}}else {var rect=Module["canvas"].getBoundingClientRect();var cw=Module["canvas"].width;var ch=Module["canvas"].height;var scrollX=typeof window.scrollX!=="undefined"?window.scrollX:window.pageXOffset;var scrollY=typeof window.scrollY!=="undefined"?window.scrollY:window.pageYOffset;if(event.type==="touchstart"||event.type==="touchend"||event.type==="touchmove"){var touch=event.touch;if(touch===undefined){return}var adjustedX=touch.pageX-(scrollX+rect.left);var adjustedY=touch.pageY-(scrollY+rect.top);adjustedX=adjustedX*(cw/rect.width);adjustedY=adjustedY*(ch/rect.height);var coords={x:adjustedX,y:adjustedY};if(event.type==="touchstart"){Browser.lastTouches[touch.identifier]=coords;Browser.touches[touch.identifier]=coords;}else if(event.type==="touchend"||event.type==="touchmove"){var last=Browser.touches[touch.identifier];if(!last)last=coords;Browser.lastTouches[touch.identifier]=last;Browser.touches[touch.identifier]=coords;}return}var x=event.pageX-(scrollX+rect.left);var y=event.pageY-(scrollY+rect.top);x=x*(cw/rect.width);y=y*(ch/rect.height);Browser.mouseMovementX=x-Browser.mouseX;Browser.mouseMovementY=y-Browser.mouseY;Browser.mouseX=x;Browser.mouseY=y;}}),xhrLoad:(function(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function xhr_onload(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);}else {onerror();}};xhr.onerror=onerror;xhr.send(null);}),asyncLoad:(function(url,onload,onerror,noRunDep){Browser.xhrLoad(url,(function(arrayBuffer){assert(arrayBuffer,'Loading data file "'+url+'" failed (no arrayBuffer).');onload(new Uint8Array(arrayBuffer));if(!noRunDep)removeRunDependency();}),(function(event){if(onerror){onerror();}else {throw 'Loading data file "'+url+'" failed.'}}));if(!noRunDep)addRunDependency();}),resizeListeners:[],updateResizeListeners:(function(){var canvas=Module["canvas"];Browser.resizeListeners.forEach((function(listener){listener(canvas.width,canvas.height);}));}),setCanvasSize:(function(width,height,noUpdates){var canvas=Module["canvas"];Browser.updateCanvasDimensions(canvas,width,height);if(!noUpdates)Browser.updateResizeListeners();}),windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:(function(){if(typeof SDL!="undefined"){var flags=HEAPU32[SDL.screen+Runtime.QUANTUM_SIZE*0>>2];flags=flags|8388608;HEAP32[SDL.screen+Runtime.QUANTUM_SIZE*0>>2]=flags;}Browser.updateResizeListeners();}),setWindowedCanvasSize:(function(){if(typeof SDL!="undefined"){var flags=HEAPU32[SDL.screen+Runtime.QUANTUM_SIZE*0>>2];flags=flags&~8388608;HEAP32[SDL.screen+Runtime.QUANTUM_SIZE*0>>2]=flags;}Browser.updateResizeListeners();}),updateCanvasDimensions:(function(canvas,wNative,hNative){if(wNative&&hNative){canvas.widthNative=wNative;canvas.heightNative=hNative;}else {wNative=canvas.widthNative;hNative=canvas.heightNative;}var w=wNative;var h=hNative;if(Module["forcedAspectRatio"]&&Module["forcedAspectRatio"]>0){if(w/h<Module["forcedAspectRatio"]){w=Math.round(h*Module["forcedAspectRatio"]);}else {h=Math.round(w/Module["forcedAspectRatio"]);}}if((document["webkitFullScreenElement"]||document["webkitFullscreenElement"]||document["mozFullScreenElement"]||document["mozFullscreenElement"]||document["fullScreenElement"]||document["fullscreenElement"]||document["msFullScreenElement"]||document["msFullscreenElement"]||document["webkitCurrentFullScreenElement"])===canvas.parentNode&&typeof screen!="undefined"){var factor=Math.min(screen.width/w,screen.height/h);w=Math.round(w*factor);h=Math.round(h*factor);}if(Browser.resizeCanvas){if(canvas.width!=w)canvas.width=w;if(canvas.height!=h)canvas.height=h;if(typeof canvas.style!="undefined"){canvas.style.removeProperty("width");canvas.style.removeProperty("height");}}else {if(canvas.width!=wNative)canvas.width=wNative;if(canvas.height!=hNative)canvas.height=hNative;if(typeof canvas.style!="undefined"){if(w!=wNative||h!=hNative){canvas.style.setProperty("width",w+"px","important");canvas.style.setProperty("height",h+"px","important");}else {canvas.style.removeProperty("width");canvas.style.removeProperty("height");}}}}),wgetRequests:{},nextWgetRequestHandle:0,getNextWgetRequestHandle:(function(){var handle=Browser.nextWgetRequestHandle;Browser.nextWgetRequestHandle++;return handle})};var _llvm_sqrt_f64=Math_sqrt;function __exit(status){Module["exit"](status);}function _exit(status){__exit(status);}var _sin=Math_sin;Module["_bitshift64Lshr"]=_bitshift64Lshr;var _atan=Math_atan;var _ceil=Math_ceil;var _sinf=Math_sin;function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest);return dest}Module["_memcpy"]=_memcpy;var _log=Math_log;var _cos=Math_cos;var _llvm_pow_f64=Math_pow;function _sbrk(bytes){var self=_sbrk;if(!self.called){DYNAMICTOP=alignMemoryPage(DYNAMICTOP);self.called=true;assert(Runtime.dynamicAlloc);self.alloc=Runtime.dynamicAlloc;Runtime.dynamicAlloc=(function(){abort("cannot dynamically allocate, sbrk now has control");});}var ret=DYNAMICTOP;if(bytes!=0){var success=self.alloc(bytes);if(!success)return -1>>>0}return ret}Module["_memmove"]=_memmove;function ___errno_location(){return ___errno_state}Module["_strcpy"]=_strcpy;var _exp=Math_exp;function _time(ptr){var ret=Date.now()/1e3|0;if(ptr){HEAP32[ptr>>2]=ret;}return ret}function _floor0_exportbundle(){Module["printErr"]("missing function: floor0_exportbundle");abort(-1);}___errno_state=Runtime.staticAlloc(4);HEAP32[___errno_state>>2]=0;Module["requestFullScreen"]=function Module_requestFullScreen(lockPointer,resizeCanvas,vrDevice){Browser.requestFullScreen(lockPointer,resizeCanvas,vrDevice);};Module["requestAnimationFrame"]=function Module_requestAnimationFrame(func){Browser.requestAnimationFrame(func);};Module["setCanvasSize"]=function Module_setCanvasSize(width,height,noUpdates){Browser.setCanvasSize(width,height,noUpdates);};Module["pauseMainLoop"]=function Module_pauseMainLoop(){Browser.mainLoop.pause();};Module["resumeMainLoop"]=function Module_resumeMainLoop(){Browser.mainLoop.resume();};Module["getUserMedia"]=function Module_getUserMedia(){Browser.getUserMedia();};Module["createContext"]=function Module_createContext(canvas,useWebGL,setInModule,webGLContextAttributes){return Browser.createContext(canvas,useWebGL,setInModule,webGLContextAttributes)};FS.staticInit();__ATINIT__.unshift((function(){if(!Module["noFSInit"]&&!FS.init.initialized)FS.init();}));__ATMAIN__.push((function(){FS.ignorePermissions=false;}));__ATEXIT__.push((function(){FS.quit();}));Module["FS_createFolder"]=FS.createFolder;Module["FS_createPath"]=FS.createPath;Module["FS_createDataFile"]=FS.createDataFile;Module["FS_createPreloadedFile"]=FS.createPreloadedFile;Module["FS_createLazyFile"]=FS.createLazyFile;Module["FS_createLink"]=FS.createLink;Module["FS_createDevice"]=FS.createDevice;__ATINIT__.unshift((function(){TTY.init();}));__ATEXIT__.push((function(){TTY.shutdown();}));if(ENVIRONMENT_IS_NODE){var fs=require("fs");var NODEJS_PATH=require("path");NODEFS.staticInit();}STACK_BASE=STACKTOP=Runtime.alignMemory(STATICTOP);staticSealed=true;STACK_MAX=STACK_BASE+TOTAL_STACK;DYNAMIC_BASE=DYNAMICTOP=Runtime.alignMemory(STACK_MAX);assert(DYNAMIC_BASE<TOTAL_MEMORY,"TOTAL_MEMORY not big enough for stack");var cttz_i8=allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0],"i8",ALLOC_DYNAMIC);function invoke_iiiii(index,a1,a2,a3,a4){try{return Module["dynCall_iiiii"](index,a1,a2,a3,a4)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0);}}function invoke_vi(index,a1){try{Module["dynCall_vi"](index,a1);}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0);}}function invoke_vii(index,a1,a2){try{Module["dynCall_vii"](index,a1,a2);}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0);}}function invoke_ii(index,a1){try{return Module["dynCall_ii"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0);}}function invoke_viii(index,a1,a2,a3){try{Module["dynCall_viii"](index,a1,a2,a3);}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0);}}function invoke_iiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8){try{return Module["dynCall_iiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0);}}function invoke_iii(index,a1,a2){try{return Module["dynCall_iii"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0);}}function invoke_iiiiii(index,a1,a2,a3,a4,a5){try{return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0);}}Module.asmGlobalArg={"Math":Math,"Int8Array":Int8Array,"Int16Array":Int16Array,"Int32Array":Int32Array,"Uint8Array":Uint8Array,"Uint16Array":Uint16Array,"Uint32Array":Uint32Array,"Float32Array":Float32Array,"Float64Array":Float64Array,"NaN":NaN,"Infinity":Infinity};Module.asmLibraryArg={"abort":abort,"assert":assert,"invoke_iiiii":invoke_iiiii,"invoke_vi":invoke_vi,"invoke_vii":invoke_vii,"invoke_ii":invoke_ii,"invoke_viii":invoke_viii,"invoke_iiiiiiiii":invoke_iiiiiiiii,"invoke_iii":invoke_iii,"invoke_iiiiii":invoke_iiiiii,"_sin":_sin,"_exp":_exp,"_cosf":_cosf,"___setErrNo":___setErrNo,"_floor":_floor,"_fflush":_fflush,"_llvm_sqrt_f64":_llvm_sqrt_f64,"_llvm_pow_f64":_llvm_pow_f64,"_emscripten_set_main_loop_timing":_emscripten_set_main_loop_timing,"_fabsf":_fabsf,"_sbrk":_sbrk,"_atan":_atan,"_emscripten_memcpy_big":_emscripten_memcpy_big,"_sysconf":_sysconf,"_sinf":_sinf,"_cos":_cos,"_log":_log,"_emscripten_set_main_loop":_emscripten_set_main_loop,"___errno_location":___errno_location,"__exit":__exit,"_abort":_abort,"_time":_time,"_ceil":_ceil,"_exit":_exit,"STACKTOP":STACKTOP,"STACK_MAX":STACK_MAX,"tempDoublePtr":tempDoublePtr,"ABORT":ABORT,"cttz_i8":cttz_i8,"_floor0_exportbundle":_floor0_exportbundle};// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer) {
"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env._floor0_exportbundle|0;var o=0;var p=0;var q=0;var r=0;var s=global.NaN,t=global.Infinity;var u=0,v=0,w=0,x=0,y=0.0,z=0,A=0,B=0,C=0.0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=global.Math.floor;var O=global.Math.abs;var P=global.Math.sqrt;var Q=global.Math.pow;var R=global.Math.cos;var S=global.Math.sin;var T=global.Math.tan;var U=global.Math.acos;var V=global.Math.asin;var W=global.Math.atan;var X=global.Math.atan2;var Y=global.Math.exp;var Z=global.Math.log;var _=global.Math.ceil;var $=global.Math.imul;var aa=global.Math.min;var ba=global.Math.clz32;var ca=env.abort;var da=env.assert;var ea=env.invoke_iiiii;var fa=env.invoke_vi;var ga=env.invoke_vii;var ha=env.invoke_ii;var ia=env.invoke_viii;var ja=env.invoke_iiiiiiiii;var ka=env.invoke_iii;var la=env.invoke_iiiiii;var ma=env._sin;var na=env._exp;var oa=env._cosf;var pa=env.___setErrNo;var qa=env._floor;var ra=env._fflush;var sa=env._llvm_sqrt_f64;var ta=env._llvm_pow_f64;var ua=env._emscripten_set_main_loop_timing;var va=env._fabsf;var wa=env._sbrk;var xa=env._atan;var ya=env._emscripten_memcpy_big;var za=env._sysconf;var Aa=env._sinf;var Ba=env._cos;var Ca=env._log;var Da=env._emscripten_set_main_loop;var Ea=env.___errno_location;var Fa=env.__exit;var Ga=env._abort;var Ha=env._time;var Ia=env._ceil;var Ja=env._exit;var Ka=0.0;
// EMSCRIPTEN_START_FUNCS
function Ta(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+15&-16;return b|0}function Ua(){return i|0}function Va(a){a=a|0;i=a;}function Wa(a,b){a=a|0;b=b|0;i=a;j=b;}function Xa(a,b){a=a|0;b=b|0;if(!o){o=a;p=b;}}function Ya(b){b=b|0;a[k>>0]=a[b>>0];a[k+1>>0]=a[b+1>>0];a[k+2>>0]=a[b+2>>0];a[k+3>>0]=a[b+3>>0];}function Za(b){b=b|0;a[k>>0]=a[b>>0];a[k+1>>0]=a[b+1>>0];a[k+2>>0]=a[b+2>>0];a[k+3>>0]=a[b+3>>0];a[k+4>>0]=a[b+4>>0];a[k+5>>0]=a[b+5>>0];a[k+6>>0]=a[b+6>>0];a[k+7>>0]=a[b+7>>0];}function _a(a){a=a|0;D=a;}function $a(){return D|0}function ab(b){b=b|0;var d=0;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;d=Ld(256)|0;c[b+8>>2]=d;c[b+12>>2]=d;a[d>>0]=0;c[b+16>>2]=256;return}function bb(b,e){b=b|0;e=e|0;var f=0,g=0,h=0;f=e>>3;g=b+12|0;if(!(c[g>>2]|0))return;h=e-(f<<3)|0;e=(c[b+8>>2]|0)+f|0;c[g>>2]=e;c[b+4>>2]=h;c[b>>2]=f;a[e>>0]=(d[e>>0]|0)&c[8+(h<<2)>>2];return}function cb(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;do if(f>>>0<=32){h=b+16|0;j=c[h>>2]|0;k=b+12|0;g=c[k>>2]|0;if((c[b>>2]|0)>=(j+-4|0)){if(!g)return;if((j|0)>2147483391)break;i=b+8|0;g=Od(c[i>>2]|0,j+256|0)|0;if(!g)break;c[i>>2]=g;c[h>>2]=(c[h>>2]|0)+256;g=g+(c[b>>2]|0)|0;c[k>>2]=g;}i=c[8+(f<<2)>>2]&e;j=b+4|0;e=c[j>>2]|0;h=e+f|0;a[g>>0]=d[g>>0]|0|i<<e;do if((((h|0)>7?(a[(c[k>>2]|0)+1>>0]=i>>>(8-(c[j>>2]|0)|0),(h|0)>15):0)?(a[(c[k>>2]|0)+2>>0]=i>>>(16-(c[j>>2]|0)|0),(h|0)>23):0)?(a[(c[k>>2]|0)+3>>0]=i>>>(24-(c[j>>2]|0)|0),(h|0)>31):0){g=c[j>>2]|0;if(!g){a[(c[k>>2]|0)+4>>0]=0;break}else {a[(c[k>>2]|0)+4>>0]=i>>>(32-g|0);break}}while(0);g=(h|0)/8|0;c[b>>2]=(c[b>>2]|0)+g;c[k>>2]=(c[k>>2]|0)+g;c[j>>2]=h&7;return}while(0);g=c[b+8>>2]|0;if(g)Md(g);c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+16>>2]=0;return}function db(a){a=a|0;var b=0;b=c[a+8>>2]|0;if(b)Md(b);c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;c[a+12>>2]=0;c[a+16>>2]=0;return}function eb(b){b=b|0;var d=0,e=0;d=b+12|0;if(!(c[d>>2]|0))return;e=c[b+8>>2]|0;c[d>>2]=e;a[e>>0]=0;c[b>>2]=0;c[b+4>>2]=0;return}function fb(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0;if(b>>>0>32){b=-1;return b|0}h=c[8+(b<<2)>>2]|0;g=c[a+4>>2]|0;f=g+b|0;b=c[a>>2]|0;e=c[a+16>>2]|0;if((b|0)>=(e+-4|0)){if((b|0)>(e-(f+7>>3)|0)){b=-1;return b|0}if(!f){b=0;return b|0}}a=c[a+12>>2]|0;b=(d[a>>0]|0)>>>g;if((f|0)>8){b=(d[a+1>>0]|0)<<8-g|b;if((f|0)>16){b=(d[a+2>>0]|0)<<16-g|b;if((f|0)>24){b=(d[a+3>>0]|0)<<24-g|b;if(!((f|0)<33|(g|0)==0))b=(d[a+4>>0]|0)<<32-g|b;}}}b=b&h;return b|0}function gb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;f=a+4|0;b=(c[f>>2]|0)+b|0;d=c[a>>2]|0;e=c[a+16>>2]|0;if((d|0)>(e-(b+7>>3)|0)){c[a+12>>2]=0;c[a>>2]=e;b=1;c[f>>2]=b;return}else {e=(b|0)/8|0;g=a+12|0;c[g>>2]=(c[g>>2]|0)+e;c[a>>2]=d+e;b=b&7;c[f>>2]=b;return}}function hb(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;do if(b>>>0>32){f=a;e=a+4|0;b=c[a+16>>2]|0;}else {k=c[8+(b<<2)>>2]|0;e=a+4|0;h=c[e>>2]|0;i=h+b|0;j=c[a>>2]|0;b=c[a+16>>2]|0;if((j|0)>=(b+-4|0)){if((j|0)>(b-(i+7>>3)|0)){f=a;break}if(!i){b=0;return b|0}}b=a+12|0;g=c[b>>2]|0;f=(d[g>>0]|0)>>>h;if((i|0)>8){f=(d[g+1>>0]|0)<<8-h|f;if((i|0)>16){f=(d[g+2>>0]|0)<<16-h|f;if((i|0)>24){f=(d[g+3>>0]|0)<<24-h|f;if(!((i|0)<33|(h|0)==0))f=(d[g+4>>0]|0)<<32-h|f;}}}h=(i|0)/8|0;c[b>>2]=g+h;c[a>>2]=j+h;c[e>>2]=i&7;b=f&k;return b|0}while(0);c[a+12>>2]=0;c[f>>2]=b;c[e>>2]=1;b=-1;return b|0}function ib(a){a=a|0;return (((c[a+4>>2]|0)+7|0)/8|0)+(c[a>>2]|0)|0}function jb(a){a=a|0;return c[a+8>>2]|0}function kb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;if(!a){d=-1;return d|0}Sd(a|0,0,360)|0;c[a+4>>2]=16384;c[a+24>>2]=1024;e=Ld(16384)|0;c[a>>2]=e;d=Ld(4096)|0;f=a+16|0;c[f>>2]=d;g=Ld(8192)|0;h=a+20|0;c[h>>2]=g;do if(e){if((g|0)==0|(d|0)==0){Md(e);d=c[f>>2]|0;break}c[a+336>>2]=b;d=0;return d|0}while(0);if(d)Md(d);d=c[h>>2]|0;if(d)Md(d);Sd(a|0,0,360)|0;d=-1;return d|0}function lb(a){a=a|0;var b=0;if(!a)return 0;b=c[a>>2]|0;if(b)Md(b);b=c[a+16>>2]|0;if(b)Md(b);b=c[a+20>>2]|0;if(b)Md(b);Sd(a|0,0,360)|0;return 0}function mb(b){b=b|0;var e=0,f=0,g=0,h=0;if(!b)return;a[(c[b>>2]|0)+22>>0]=0;a[(c[b>>2]|0)+23>>0]=0;a[(c[b>>2]|0)+24>>0]=0;a[(c[b>>2]|0)+25>>0]=0;f=c[b+4>>2]|0;if((f|0)>0){g=c[b>>2]|0;e=0;h=0;do{e=c[144+(((d[g+h>>0]|0)^e>>>24)<<2)>>2]^e<<8;h=h+1|0;}while((h|0)<(f|0));}else e=0;g=c[b+12>>2]|0;if((g|0)>0){f=c[b+8>>2]|0;h=0;do{e=c[144+(((d[f+h>>0]|0)^e>>>24)<<2)>>2]^e<<8;h=h+1|0;}while((h|0)<(g|0));}a[(c[b>>2]|0)+22>>0]=e;a[(c[b>>2]|0)+23>>0]=e>>>8;a[(c[b>>2]|0)+24>>0]=e>>>16;a[(c[b>>2]|0)+25>>0]=e>>>24;return}function nb(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if(!a){o=-1;return o|0}n=c[a>>2]|0;if(!n){o=-1;return o|0}if(!b){o=0;return o|0}l=(d|0)>0;a:do if(l){h=0;j=0;while(1){i=c[b+(j<<3)+4>>2]|0;if((i|0)<0|(h|0)>(2147483647-i|0)){h=-1;break}h=i+h|0;j=j+1|0;if((j|0)>=(d|0))break a}return h|0}else h=0;while(0);o=(h|0)/255|0;p=o+1|0;k=a+12|0;j=c[k>>2]|0;m=a+8|0;if(j){q=c[m>>2]|0;i=q-j|0;c[m>>2]=i;if((q|0)!=(j|0))Zd(n|0,n+j|0,i|0)|0;c[k>>2]=0;}k=a+4|0;j=c[k>>2]|0;do if((j-h|0)<=(c[m>>2]|0)){if((j|0)>(2147483647-h|0)){h=c[a>>2]|0;if(h)Md(h);h=c[a+16>>2]|0;if(h)Md(h);h=c[a+20>>2]|0;if(h)Md(h);Sd(a|0,0,360)|0;o=-1;return o|0}j=j+h|0;j=(j|0)<2147482623?j+1024|0:j;i=Od(c[a>>2]|0,j)|0;if(i){c[k>>2]=j;c[a>>2]=i;break}h=c[a>>2]|0;if(h)Md(h);h=c[a+16>>2]|0;if(h)Md(h);h=c[a+20>>2]|0;if(h)Md(h);Sd(a|0,0,360)|0;o=-1;return o|0}while(0);if(rb(a,p)|0){o=-1;return o|0}if(l){i=c[m>>2]|0;j=0;do{n=b+(j<<3)+4|0;Yd((c[a>>2]|0)+i|0,c[b+(j<<3)>>2]|0,c[n>>2]|0)|0;i=(c[m>>2]|0)+(c[n>>2]|0)|0;c[m>>2]=i;j=j+1|0;}while((j|0)!=(d|0));}l=a+28|0;m=c[l>>2]|0;n=c[a+16>>2]|0;if((h|0)>254){j=a+352|0;i=c[a+20>>2]|0;d=(o|0)>1;k=0;do{b=m+k|0;c[n+(b<<2)>>2]=255;r=j;q=c[r+4>>2]|0;b=i+(b<<3)|0;c[b>>2]=c[r>>2];c[b+4>>2]=q;k=k+1|0;}while((k|0)<(o|0));k=j;j=d?o:1;}else {k=a+352|0;i=c[a+20>>2]|0;j=0;}o=m+j|0;c[n+(o<<2)>>2]=(h|0)%255|0;o=i+(o<<3)|0;c[o>>2]=f;c[o+4>>2]=g;o=k;c[o>>2]=f;c[o+4>>2]=g;o=n+(m<<2)|0;c[o>>2]=c[o>>2]|256;c[l>>2]=m+p;o=a+344|0;b=o;b=Wd(c[b>>2]|0,c[b+4>>2]|0,1,0)|0;c[o>>2]=b;c[o+4>>2]=D;if(!e){o=0;return o|0}c[a+328>>2]=1;o=0;return o|0}function ob(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;i=i+16|0;f=d;c[f>>2]=c[b>>2];c[f+4>>2]=c[b+4>>2];e=b+16|0;b=nb(a,f,1,c[b+12>>2]|0,c[e>>2]|0,c[e+4>>2]|0)|0;i=d;return b|0}function pb(a,b){a=a|0;b=b|0;return sb(a,b,1,4096)|0}function qb(a,b){a=a|0;b=b|0;var d=0,e=0;if(!a){d=0;return d|0}if(!(c[a>>2]|0)){d=0;return d|0}d=(c[a+28>>2]|0)==0;if(!(c[a+328>>2]|0))if(!d?(c[a+332>>2]|0)==0:0)e=7;else d=0;else if(d)d=0;else e=7;if((e|0)==7)d=1;d=sb(a,b,d,4096)|0;return d|0}function rb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;f=a+24|0;d=c[f>>2]|0;if((d-b|0)>(c[a+28>>2]|0)){d=0;return d|0}if((d|0)>(2147483647-b|0)){d=c[a>>2]|0;if(d)Md(d);d=c[a+16>>2]|0;if(d)Md(d);d=c[a+20>>2]|0;if(d)Md(d);Sd(a|0,0,360)|0;d=-1;return d|0}d=d+b|0;d=(d|0)<2147483615?d+32|0:d;g=a+16|0;b=Od(c[g>>2]|0,d<<2)|0;if(!b){d=c[a>>2]|0;if(d)Md(d);d=c[g>>2]|0;if(d)Md(d);d=c[a+20>>2]|0;if(d)Md(d);Sd(a|0,0,360)|0;d=-1;return d|0}c[g>>2]=b;e=a+20|0;b=Od(c[e>>2]|0,d<<3)|0;if(b){c[e>>2]=b;c[f>>2]=d;d=0;return d|0}d=c[a>>2]|0;if(d)Md(d);d=c[g>>2]|0;if(d)Md(d);d=c[e>>2]|0;if(d)Md(d);Sd(a|0,0,360)|0;d=-1;return d|0}function sb(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;B=b+28|0;i=c[B>>2]|0;w=(i|0)>255?255:i;if(!b){z=0;return z|0}A=c[b>>2]|0;if((w|0)==0|(A|0)==0){z=0;return z|0}y=b+332|0;z=(c[y>>2]|0)==0;a:do if(!z)if((w|0)>0){g=b+16|0;u=b+20|0;v=0;r=-1;h=-1;n=-1;o=-1;p=-1;q=-1;m=-1;l=-1;k=0;t=0;j=0;while(1){if((v|0)>(f|0)&(k|0)>3){e=1;k=r;break}s=c[(c[g>>2]|0)+(j<<2)>>2]&255;if((s|0)==255)k=0;else {o=(c[u>>2]|0)+(j<<3)|0;r=c[o>>2]|0;o=c[o+4>>2]|0;t=t+1|0;l=Xd(r|0,o|0,8)|0;h=Xd(r|0,o|0,16)|0;n=Xd(r|0,o|0,24)|0;p=Xd(r|0,o|0,40)|0;q=Xd(r|0,o|0,48)|0;m=Xd(r|0,o|0,56)|0;r=r&255;h=h&255;n=n&255;o=o&255;p=p&255;q=q&255;m=m&255;l=l&255;k=t;}j=j+1|0;if((j|0)<(w|0))v=s+v|0;else {k=r;break}}if((j|0)==255){f=k;t=h;s=255;}else x=14;}else {k=-1;h=-1;n=-1;o=-1;p=-1;q=-1;m=-1;l=-1;j=0;x=14;}else {h=b+16|0;g=0;while(1){if((g|0)>=(w|0)){k=0;h=0;n=0;o=0;p=0;q=0;m=0;l=0;j=g;x=14;break a}j=g+1|0;if((c[(c[h>>2]|0)+(g<<2)>>2]&255|0)==255)g=j;else {k=0;h=0;n=0;o=0;p=0;q=0;m=0;l=0;x=14;break}}}while(0);if((x|0)==14)if(!e){z=0;return z|0}else {f=k;t=h;s=j;}r=b+40|0;a[r>>0]=79;a[r+1>>0]=103;a[r+2>>0]=103;a[r+3>>0]=83;a[b+44>>0]=0;j=b+45|0;a[j>>0]=0;e=b+16|0;h=c[e>>2]|0;g=(c[h>>2]|0)>>>8&1^1;k=g|2;a[j>>0]=z?k:g;if((c[b+328>>2]|0)!=0&(i|0)==(s|0))a[j>>0]=(z?k:g)|4;c[y>>2]=1;a[b+46>>0]=f;a[b+47>>0]=l;a[b+48>>0]=t;a[b+49>>0]=n;a[b+50>>0]=o;a[b+51>>0]=p;a[b+52>>0]=q;a[b+53>>0]=m;j=c[b+336>>2]|0;a[b+54>>0]=j;a[b+55>>0]=j>>>8;a[b+56>>0]=j>>>16;a[b+57>>0]=j>>>24;j=b+340|0;g=c[j>>2]|0;if((g|0)==-1){c[j>>2]=0;g=0;}c[j>>2]=g+1;a[b+58>>0]=g;a[b+59>>0]=g>>>8;a[b+60>>0]=g>>>16;a[b+61>>0]=g>>>24;z=b+62|0;a[z>>0]=0;a[z+1>>0]=0;a[z+2>>0]=0;a[z+3>>0]=0;a[b+66>>0]=s;if((s|0)>0){g=c[h>>2]|0;a[b+67>>0]=g;g=g&255;if((s|0)!=1){h=1;do{z=c[(c[e>>2]|0)+(h<<2)>>2]|0;a[h+27+(b+40)>>0]=z;g=(z&255)+g|0;h=h+1|0;}while((h|0)!=(s|0));}j=c[b>>2]|0;i=c[B>>2]|0;h=c[e>>2]|0;}else {j=A;g=0;}c[d>>2]=r;z=s+27|0;c[b+324>>2]=z;c[d+4>>2]=z;z=b+12|0;c[d+8>>2]=j+(c[z>>2]|0);c[d+12>>2]=g;y=i-s|0;c[B>>2]=y;Zd(h|0,h+(s<<2)|0,y<<2|0)|0;y=c[b+20>>2]|0;Zd(y|0,y+(s<<3)|0,c[B>>2]<<3|0)|0;c[z>>2]=(c[z>>2]|0)+g;mb(d);z=1;return z|0}function tb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=c[a+104>>2]|0;e=a+88|0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;eb(c[d+12>>2]|0);eb(c[d+16>>2]|0);eb(c[d+20>>2]|0);eb(c[d+24>>2]|0);eb(c[d+28>>2]|0);eb(c[d+32>>2]|0);eb(c[d+36>>2]|0);eb(c[d+40>>2]|0);eb(c[d+44>>2]|0);eb(c[d+48>>2]|0);eb(c[d+52>>2]|0);eb(c[d+56>>2]|0);eb(c[d+60>>2]|0);eb(c[d+64>>2]|0);eb(c[d+68>>2]|0);d=Oa[c[(c[25664>>2]|0)+12>>2]&1](a)|0;if(d)return d|0;if(!b){d=0;return d|0}if(wb(a)|0){d=-131;return d|0}f=a+4|0;c[b>>2]=jb(f)|0;c[b+4>>2]=ib(f)|0;c[b+8>>2]=0;c[b+12>>2]=c[a+44>>2];f=a+48|0;d=c[f+4>>2]|0;e=b+16|0;c[e>>2]=c[f>>2];c[e+4>>2]=d;e=a+56|0;a=c[e+4>>2]|0;d=b+24|0;c[d>>2]=c[e>>2];c[d+4>>2]=a;d=0;return d|0}function ub(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0.0,i=0.0;f=c[a+28>>2]|0;d=b;e=d+48|0;do{c[d>>2]=0;d=d+4|0;}while((d|0)<(e|0));d=c[f+3372>>2]|0;if((d|0)<=0)return;e=c[a+8>>2]|0;a=c[f>>2]|0;c[b+24>>2]=(c[f+4>>2]|0)/(a|0)|0;c[b>>2]=1;i=+(a>>1|0);g=+(e|0);c[b+12>>2]=~~+Gd(+(c[f+3360>>2]|0)*i/g);c[b+16>>2]=~~+Gd(+(c[f+3364>>2]|0)*i/g);c[b+20>>2]=~~+Gd(+(c[f+3368>>2]|0)*i/g);h[b+32>>3]=7.0;d=~~(+(d|0)*+h[f+3376>>3]);c[b+8>>2]=d;c[b+4>>2]=d;return}function vb(a){a=a|0;var b=0;b=a+48|0;do{c[a>>2]=0;a=a+4|0;}while((a|0)<(b|0));return}function wb(a){a=a|0;return (c[(c[(c[a+64>>2]|0)+104>>2]|0)+80>>2]|0)!=0|0}function xb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,i=0,j=0.0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0;r=c[a+104>>2]|0;n=c[a+64>>2]|0;A=c[n+104>>2]|0;n=c[n+4>>2]|0;i=c[n+28>>2]|0;m=A+112|0;e=~~+Gd(+h[m>>3]);b=(ib(c[r+12+(e<<2)>>2]|0)|0)<<3;z=a+28|0;d=c[z>>2]|0;g=(d|0)==0;t=A+96|0;f=c[t>>2]|0;if(g){y=A+100|0;x=f;s=y;y=c[y>>2]|0;}else {w=c[A+104>>2]|0;y=A+100|0;x=$(w,f)|0;s=y;y=$(w,c[y>>2]|0)|0;}l=c[i+(d<<2)>>2]>>1;q=i+3372|0;w=~~(+(c[q>>2]|0)*+h[i+3376>>3]);d=A+120|0;if(!(c[A+80>>2]|0)){if(c[d>>2]|0){y=-1;return y|0}c[d>>2]=a;y=0;return y|0}c[d>>2]=a;v=A+92|0;d=c[v>>2]|0;if((d|0)>0){if(g)g=d;else g=$(c[A+104>>2]|0,d)|0;j=15.0/+h[i+3384>>3];i=A+84|0;f=c[i>>2]|0;d=f+(b-g)|0;a:do if((d|0)>(w|0)){if((b|0)>(g|0)&(e|0)>0?(b-g+f|0)>(w|0):0)while(1){f=e+-1|0;d=(ib(c[r+12+(f<<2)>>2]|0)|0)<<3;if(!((d|0)>(g|0)&(e|0)>1)){e=f;break a}if((d-g+(c[i>>2]|0)|0)>(w|0))e=f;else {e=f;break}}}else if(((d|0)<(w|0)?(k=e+1|0,(b|0)<(g|0)&(k|0)<15):0)?(b-g+f|0)<(w|0):0){e=k;while(1){f=(ib(c[r+12+(e<<2)>>2]|0)|0)<<3;d=e+1|0;if(!((f|0)<(g|0)&(d|0)<15))break a;if((f-g+(c[i>>2]|0)|0)<(w|0))e=d;else break}}while(0);B=+h[m>>3];C=+(l|0);E=+Gd(+(e|0)-B)/C;D=+(c[n+8>>2]|0);E=D*E;F=-j;E=E<F?F:E;j=(E>j?j:E)/D*C+B;h[m>>3]=j;e=~~+Gd(j);b=(ib(c[r+12+(e<<2)>>2]|0)|0)<<3;f=c[t>>2]|0;}b:do if((b|0)<(x|0)&(f|0)>0?(o=A+88|0,(b-x+(c[o>>2]|0)|0)<0):0){f=e;while(1){e=f+1|0;if((f|0)>13)break b;b=(ib(c[r+12+(e<<2)>>2]|0)|0)<<3;if((b-x+(c[o>>2]|0)|0)<0)f=e;else break}}while(0);c:do if((b|0)>(y|0)&(c[s>>2]|0)>0?(p=A+88|0,(b-y+(c[p>>2]|0)|0)>(c[q>>2]|0)):0){f=e;while(1){e=f+-1|0;if((f|0)<1)break c;b=(ib(c[r+12+(e<<2)>>2]|0)|0)<<3;if((b-y+(c[p>>2]|0)|0)>(c[q>>2]|0))f=e;else break}}while(0);if((e|0)<0){d=((c[q>>2]|0)+y-(c[A+88>>2]|0)|0)/8|0;c[A+124>>2]=0;e=r+12|0;if((ib(c[e>>2]|0)|0)>(d|0)){bb(c[e>>2]|0,d<<3);f=(ib(c[e>>2]|0)|0)<<3;}else f=b;}else {a=(x+7-(c[A+88>>2]|0)|0)/8|0;d=(e|0)>14?14:e;c[A+124>>2]=d;d=r+12+(d<<2)|0;e=a-(ib(c[d>>2]|0)|0)|0;a=c[d>>2]|0;if((e|0)>0)while(1){cb(a,0,8);a=c[d>>2]|0;if((e|0)>1)e=e+-1|0;else break}f=(ib(a)|0)<<3;}if(!((c[t>>2]|0)<=0?(c[s>>2]|0)<=0:0))u=37;do if((u|0)==37){a=(y|0)>0;if(a&(f|0)>(y|0)){x=A+88|0;c[x>>2]=f-y+(c[x>>2]|0);break}b=(x|0)>0;if(b&(f|0)<(x|0)){y=A+88|0;c[y>>2]=f-x+(c[y>>2]|0);break}d=A+88|0;e=c[d>>2]|0;if((e|0)>(w|0))if(a){y=e+(f-y)|0;c[d>>2]=(y|0)<(w|0)?w:y;break}else {c[d>>2]=w;break}else if(b){y=e+(f-x)|0;c[d>>2]=(y|0)>(w|0)?w:y;break}else {c[d>>2]=w;break}}while(0);a=c[v>>2]|0;if((a|0)<=0){y=0;return y|0}if(c[z>>2]|0)a=$(c[A+104>>2]|0,a)|0;y=A+84|0;c[y>>2]=f-a+(c[y>>2]|0);y=0;return y|0}function yb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;a=c[a+104>>2]|0;d=a+120|0;e=c[d>>2]|0;if(!e){a=0;return a|0}if(b){if(!(c[(c[(c[e+64>>2]|0)+104>>2]|0)+80>>2]|0))a=7;else a=c[a+124>>2]|0;g=(c[e+104>>2]|0)+12+(a<<2)|0;c[b>>2]=jb(c[g>>2]|0)|0;c[b+4>>2]=ib(c[g>>2]|0)|0;c[b+8>>2]=0;c[b+12>>2]=c[e+44>>2];g=e+48|0;a=c[g+4>>2]|0;f=b+16|0;c[f>>2]=c[g>>2];c[f+4>>2]=a;f=e+56|0;e=c[f+4>>2]|0;a=b+24|0;c[a>>2]=c[f>>2];c[a+4>>2]=e;}c[d>>2]=0;a=1;return a|0}function zb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=b;e=d+112|0;do{c[d>>2]=0;d=d+4|0;}while((d|0)<(e|0));c[b+64>>2]=a;c[b+76>>2]=0;c[b+68>>2]=0;if(!(c[a>>2]|0))return 0;e=Nd(1,72)|0;c[b+104>>2]=e;g[e+4>>2]=-9999.0;d=b+4|0;b=e+12|0;e=e+40|0;a=0;while(1)if((a|0)!=7){f=Nd(1,20)|0;c[b+(a<<2)>>2]=f;ab(f);a=a+1|0;if((a|0)==15)break;else continue}else {c[e>>2]=d;ab(d);a=8;continue}return 0}function Ab(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;b=b+7&-8;d=a+72|0;e=c[d>>2]|0;f=a+76|0;g=a+68|0;h=c[g>>2]|0;if((e+b|0)<=(c[f>>2]|0)){g=h;f=e;e=g+f|0;b=f+b|0;c[d>>2]=b;return e|0}if(h){i=Ld(8)|0;j=a+80|0;c[j>>2]=(c[j>>2]|0)+e;e=a+84|0;c[i+4>>2]=c[e>>2];c[i>>2]=h;c[e>>2]=i;}c[f>>2]=b;e=Ld(b)|0;c[g>>2]=e;c[d>>2]=0;f=0;e=e+f|0;b=f+b|0;c[d>>2]=b;return e|0}function Bb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;h=c[a+104>>2]|0;g=a+84|0;b=c[g>>2]|0;if(b)do{d=b;b=c[b+4>>2]|0;Md(c[d>>2]|0);Md(d);}while((b|0)!=0);f=a+80|0;e=c[f>>2]|0;d=a+68|0;b=c[d>>2]|0;if(e){i=a+76|0;b=Od(b,(c[i>>2]|0)+e|0)|0;c[d>>2]=b;c[i>>2]=(c[i>>2]|0)+(c[f>>2]|0);c[f>>2]=0;}c[a+72>>2]=0;c[g>>2]=0;if(b)Md(b);if(!h){b=a+112|0;do{c[a>>2]=0;a=a+4|0;}while((a|0)<(b|0));return 0}else d=0;while(1){b=h+12+(d<<2)|0;db(c[b>>2]|0);if((d|0)==7){d=8;continue}Md(c[b>>2]|0);d=d+1|0;if((d|0)==15)break}Md(h);b=a+112|0;do{c[a>>2]=0;a=a+4|0;}while((a|0)<(b|0));return 0}function Cb(a,b){a=a|0;b=b|0;var d=0,e=0;if(Hb(a,b,1)|0){a=1;return a|0}d=c[a+104>>2]|0;c[d+60>>2]=Ac(b)|0;e=Nd(1,180)|0;c[d>>2]=e;Qb(e,b);ub(b,d+80|0);a=a+64|0;c[a>>2]=3;c[a+4>>2]=0;a=0;return a|0}function Db(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;if(!a)return;l=c[a+4>>2]|0;m=(l|0)!=0;if(m)j=c[l+28>>2]|0;else j=0;p=c[a+104>>2]|0;o=(p|0)!=0;if(o){f=c[p>>2]|0;if(f){Rb(f);Md(c[p>>2]|0);}f=p+12|0;d=c[f>>2]|0;if(d){vc(c[d>>2]|0);Md(c[c[f>>2]>>2]|0);Md(c[f>>2]|0);}f=p+16|0;d=c[f>>2]|0;if(d){vc(c[d>>2]|0);Md(c[c[f>>2]>>2]|0);Md(c[f>>2]|0);}g=p+48|0;d=c[g>>2]|0;if(d){if((j|0)!=0?(h=j+16|0,(c[h>>2]|0)>0):0){b=j+800|0;Ma[c[(c[25640+(c[b>>2]<<2)>>2]|0)+16>>2]&7](c[d>>2]|0);if((c[h>>2]|0)>1){f=1;do{Ma[c[(c[25640+(c[b+(f<<2)>>2]<<2)>>2]|0)+16>>2]&7](c[(c[g>>2]|0)+(f<<2)>>2]|0);f=f+1|0;}while((f|0)<(c[h>>2]|0));}d=c[g>>2]|0;}Md(d);}b=p+52|0;d=c[b>>2]|0;if(d){if((j|0)!=0?(i=j+20|0,(c[i>>2]|0)>0):0){g=j+1312|0;Ma[c[(c[25648+(c[g>>2]<<2)>>2]|0)+16>>2]&7](c[d>>2]|0);if((c[i>>2]|0)>1){f=1;do{Ma[c[(c[25648+(c[g+(f<<2)>>2]<<2)>>2]|0)+16>>2]&7](c[(c[b>>2]|0)+(f<<2)>>2]|0);f=f+1|0;}while((f|0)<(c[i>>2]|0));}d=c[b>>2]|0;}Md(d);}f=p+56|0;b=c[f>>2]|0;if(b){if((j|0)!=0?(k=j+28|0,(c[k>>2]|0)>0):0){Ec(b);if((c[k>>2]|0)>1){d=1;do{Ec((c[f>>2]|0)+(d*52|0)|0);d=d+1|0;}while((d|0)<(c[k>>2]|0));}b=c[f>>2]|0;}Md(b);}b=c[p+60>>2]|0;if(b)Bc(b);vb(p+80|0);md(p+20|0);md(p+32|0);}g=a+8|0;b=c[g>>2]|0;if(b){if(m?(n=l+4|0,e=c[n>>2]|0,(e|0)>0):0){d=0;while(1){b=c[b+(d<<2)>>2]|0;if(b){Md(b);e=c[n>>2]|0;}d=d+1|0;if((d|0)>=(e|0))break;b=c[g>>2]|0;}b=c[g>>2]|0;}Md(b);b=c[a+12>>2]|0;if(b)Md(b);}if(o){b=c[p+64>>2]|0;if(b)Md(b);b=c[p+68>>2]|0;if(b)Md(b);b=c[p+72>>2]|0;if(b)Md(b);Md(p);}b=a+112|0;do{c[a>>2]=0;a=a+4|0;}while((a|0)<(b|0));return}function Eb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;d=c[a+4>>2]|0;e=c[a+104>>2]|0;g=e+64|0;f=c[g>>2]|0;if(f)Md(f);c[g>>2]=0;g=e+68|0;f=c[g>>2]|0;if(f)Md(f);c[g>>2]=0;f=e+72|0;e=c[f>>2]|0;if(e)Md(e);c[f>>2]=0;i=a+20|0;g=c[i>>2]|0;h=a+16|0;if((g+b|0)>=(c[h>>2]|0)){g=g+(b<<1)|0;c[h>>2]=g;b=d+4|0;if((c[b>>2]|0)>0){d=a+8|0;e=Od(c[c[d>>2]>>2]|0,g<<2)|0;c[c[d>>2]>>2]=e;e=c[b>>2]|0;if((e|0)>1){g=1;do{f=Od(c[(c[d>>2]|0)+(g<<2)>>2]|0,c[h>>2]<<2)|0;c[(c[d>>2]|0)+(g<<2)>>2]=f;g=g+1|0;f=c[b>>2]|0;}while((g|0)<(f|0));k=f;j=11;}else {k=e;j=11;}}}else {k=c[d+4>>2]|0;j=11;}if((j|0)==11?(k|0)>0:0){g=a+8|0;f=c[i>>2]|0;d=a+12|0;e=0;do{c[(c[d>>2]|0)+(e<<2)>>2]=(c[(c[g>>2]|0)+(e<<2)>>2]|0)+(f<<2);e=e+1|0;}while((e|0)<(k|0));d=c[d>>2]|0;return d|0}d=a+12|0;d=c[d>>2]|0;return d|0}function Fb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;l=i;d=c[a+4>>2]|0;e=c[d+28>>2]|0;if((b|0)>=1){d=a+20|0;b=(c[d>>2]|0)+b|0;if((b|0)>(c[a+16>>2]|0)){b=-131;i=l;return b|0}c[d>>2]=b;if(c[a+28>>2]|0){b=0;i=l;return b|0}if((b-(c[a+48>>2]|0)|0)<=(c[e+4>>2]|0)){b=0;i=l;return b|0}Ib(a);b=0;i=l;return b|0}k=i;i=i+128|0;if(!(c[a+28>>2]|0))Ib(a);j=e+4|0;Eb(a,(c[j>>2]|0)*3|0)|0;g=a+20|0;e=c[g>>2]|0;h=a+32|0;c[h>>2]=e;c[g>>2]=e+((c[j>>2]|0)*3|0);f=d+4|0;if((c[f>>2]|0)<=0){b=0;i=l;return b|0}b=a+8|0;d=e;e=0;while(1){if((d|0)>64){a=c[j>>2]|0;a=(d|0)>(a|0)?a:d;+nc((c[(c[b>>2]|0)+(e<<2)>>2]|0)+(d-a<<2)|0,k,a,32);a=c[(c[b>>2]|0)+(e<<2)>>2]|0;d=c[h>>2]|0;oc(k,a+(d+-32<<2)|0,32,a+(d<<2)|0,(c[g>>2]|0)-d|0);}else Sd((c[(c[b>>2]|0)+(e<<2)>>2]|0)+(d<<2)|0,0,(c[g>>2]|0)-d<<2|0)|0;e=e+1|0;if((e|0)>=(c[f>>2]|0)){b=0;break}d=c[h>>2]|0;}i=l;return b|0}function Gb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0.0,i=0.0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0;l=c[a+4>>2]|0;z=c[l+28>>2]|0;B=c[a+104>>2]|0;m=c[B+60>>2]|0;G=a+48|0;E=a+40|0;x=(c[G>>2]|0)-((c[z+(c[E>>2]<<2)>>2]|0)/2|0)|0;y=c[b+104>>2]|0;if(!(c[a+28>>2]|0)){b=0;return b|0}H=a+32|0;if((c[H>>2]|0)==-1){b=0;return b|0}e=Sb(a)|0;do if((e|0)==-1)if(!(c[H>>2]|0)){b=0;return b|0}else {C=a+44|0;c[C>>2]=0;d=0;break}else {d=a+44|0;if((c[z>>2]|0)==(c[z+4>>2]|0)){c[d>>2]=0;C=d;d=0;break}else {c[d>>2]=e;C=d;d=e;break}}while(0);w=c[z+(d<<2)>>2]|0;v=((c[z+(c[E>>2]<<2)>>2]|0)/4|0)+(c[G>>2]|0)+((w|0)/4|0)|0;A=a+20|0;if((c[A>>2]|0)<(v+((w|0)/2|0)|0)){b=0;return b|0}u=b+84|0;e=c[u>>2]|0;if(e)do{w=e;e=c[e+4>>2]|0;Md(c[w>>2]|0);Md(w);}while((e|0)!=0);s=b+80|0;f=c[s>>2]|0;if(f){t=b+68|0;w=b+76|0;c[t>>2]=Od(c[t>>2]|0,(c[w>>2]|0)+f|0)|0;c[w>>2]=(c[w>>2]|0)+(c[s>>2]|0);c[s>>2]=0;}r=b+72|0;c[r>>2]=0;c[u>>2]=0;w=a+36|0;f=c[w>>2]|0;c[b+24>>2]=f;t=c[E>>2]|0;c[b+28>>2]=t;e=c[C>>2]|0;c[b+32>>2]=e;do if(!t){f=y+8|0;if(!(Tb(a)|0)){c[f>>2]=1;break}else {c[f>>2]=0;break}}else {d=y+8|0;if((f|0)==0|(e|0)==0){c[d>>2]=0;break}else {c[d>>2]=1;break}}while(0);c[b+64>>2]=a;t=a+64|0;d=t;f=c[d>>2]|0;d=c[d+4>>2]|0;q=Wd(f|0,d|0,1,0)|0;c[t>>2]=q;c[t+4>>2]=D;t=b+56|0;c[t>>2]=f;c[t+4>>2]=d;t=a+56|0;d=t;f=c[d+4>>2]|0;q=b+48|0;c[q>>2]=c[d>>2];c[q+4>>2]=f;q=b+36|0;c[q>>2]=c[z+(c[E>>2]<<2)>>2];f=y+4|0;i=+g[f>>2];h=+g[m>>2];if(i>h){g[m>>2]=i;h=i;}h=+Ic(h,a);g[m>>2]=h;g[f>>2]=h;p=l+4|0;d=c[p>>2]|0;l=(d<<2)+7&-8;e=c[r>>2]|0;n=b+76|0;j=c[n>>2]|0;o=b+68|0;f=c[o>>2]|0;if((l+e|0)>(j|0)){if(f){d=Ld(8)|0;c[s>>2]=(c[s>>2]|0)+e;c[d+4>>2]=c[u>>2];c[d>>2]=f;c[u>>2]=d;}c[n>>2]=l;f=Ld(l)|0;c[o>>2]=f;c[r>>2]=0;e=0;d=c[p>>2]|0;k=l;}else k=j;j=e+l|0;c[r>>2]=j;c[b>>2]=f+e;l=(d<<2)+7&-8;if((l+j|0)>(k|0)){if(f){d=Ld(8)|0;c[s>>2]=(c[s>>2]|0)+j;c[d+4>>2]=c[u>>2];c[d>>2]=f;c[u>>2]=d;}c[n>>2]=l;f=Ld(l)|0;c[o>>2]=f;c[r>>2]=0;j=0;d=c[p>>2]|0;k=l;}e=j+l|0;c[r>>2]=e;c[y>>2]=f+j;a:do if((d|0)>0){m=a+8|0;d=e;e=0;while(1){l=(c[q>>2]|0)+x<<2;j=l+7&-8;if((j+d|0)>(k|0)){if(f){k=Ld(8)|0;c[s>>2]=(c[s>>2]|0)+d;c[k+4>>2]=c[u>>2];c[k>>2]=f;c[u>>2]=k;}c[n>>2]=j;f=Ld(j)|0;c[o>>2]=f;c[r>>2]=0;d=0;}c[r>>2]=d+j;c[(c[y>>2]|0)+(e<<2)>>2]=f+d;Yd(c[(c[y>>2]|0)+(e<<2)>>2]|0,c[(c[m>>2]|0)+(e<<2)>>2]|0,l|0)|0;c[(c[b>>2]|0)+(e<<2)>>2]=(c[(c[y>>2]|0)+(e<<2)>>2]|0)+(x<<2);e=e+1|0;if((e|0)>=(c[p>>2]|0))break a;d=c[r>>2]|0;k=c[n>>2]|0;f=c[o>>2]|0;}}while(0);y=c[H>>2]|0;if((y|0)!=0?(c[G>>2]|0)>=(y|0):0){c[H>>2]=-1;c[b+44>>2]=1;b=1;return b|0}f=(c[z+4>>2]|0)/2|0;e=v-f|0;if((e|0)<=0){b=1;return b|0}Ub(c[B>>2]|0,e);d=(c[A>>2]|0)-e|0;c[A>>2]=d;if((c[p>>2]|0)>0?(F=a+8|0,b=c[c[F>>2]>>2]|0,Zd(b|0,b+(e<<2)|0,d<<2|0)|0,(c[p>>2]|0)>1):0){d=1;do{b=c[(c[F>>2]|0)+(d<<2)>>2]|0;Zd(b|0,b+(e<<2)|0,c[A>>2]<<2|0)|0;d=d+1|0;}while((d|0)<(c[p>>2]|0));}c[w>>2]=c[E>>2];c[E>>2]=c[C>>2];c[G>>2]=f;d=c[H>>2]|0;if(!d){z=t;z=Wd(c[z>>2]|0,c[z+4>>2]|0,e|0,((e|0)<0)<<31>>31|0)|0;b=t;c[b>>2]=z;c[b+4>>2]=D;b=1;return b|0}d=d-e|0;d=(d|0)<1?-1:d;c[H>>2]=d;if((d|0)>(f|0)){z=t;z=Wd(c[z>>2]|0,c[z+4>>2]|0,e|0,((e|0)<0)<<31>>31|0)|0;b=t;c[b>>2]=z;c[b+4>>2]=D;b=1;return b|0}else {z=d+e-f|0;b=t;z=Wd(c[b>>2]|0,c[b+4>>2]|0,z|0,((z|0)<0)<<31>>31|0)|0;b=t;c[b>>2]=z;c[b+4>>2]=D;b=1;return b|0}return 0}function Hb(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;p=c[b+28>>2]|0;if(!p){m=1;return m|0}f=p+8|0;if((c[f>>2]|0)<1){m=1;return m|0}h=c[p>>2]|0;if((h|0)<64){m=1;return m|0}o=p+4|0;if((c[o>>2]|0)<(h|0)){m=1;return m|0}g=c[p+3656>>2]|0;i=a;h=i+112|0;do{c[i>>2]=0;i=i+4|0;}while((i|0)<(h|0));n=Nd(1,136)|0;c[a+104>>2]=n;c[a+4>>2]=b;c[n+44>>2]=bd((c[f>>2]|0)+-1|0)|0;q=Nd(1,4)|0;c[n+12>>2]=q;f=Nd(1,4)|0;i=n+16|0;c[i>>2]=f;h=Nd(1,20)|0;c[q>>2]=h;c[f>>2]=Nd(1,20)|0;uc(h,c[p>>2]>>g);uc(c[c[i>>2]>>2]|0,c[o>>2]>>g);c[n+4>>2]=(bd(c[p>>2]|0)|0)+-7;c[n+8>>2]=(bd(c[o>>2]|0)|0)+-7;a:do if(!d){i=p+2848|0;if((c[i>>2]|0)==0?(m=p+24|0,c[i>>2]=Nd(c[m>>2]|0,56)|0,e=c[m>>2]|0,(e|0)>0):0){f=0;while(1){h=p+1824+(f<<2)|0;g=c[h>>2]|0;if(!g)break;if(id((c[i>>2]|0)+(f*56|0)|0,g)|0){l=20;break}fd(c[h>>2]|0);c[h>>2]=0;f=f+1|0;e=c[m>>2]|0;if((f|0)>=(e|0))break a}if((l|0)==20)e=c[m>>2]|0;if((e|0)>0){g=0;do{d=p+1824+(g<<2)|0;f=c[d>>2]|0;if(f){fd(f);c[d>>2]=0;e=c[m>>2]|0;}g=g+1|0;}while((g|0)<(e|0));}Db(a);m=-1;return m|0}}else {ld(n+20|0,c[p>>2]|0);ld(n+32|0,c[o>>2]|0);h=p+2848|0;if(((c[h>>2]|0)==0?(k=p+24|0,j=Nd(c[k>>2]|0,56)|0,c[h>>2]=j,(c[k>>2]|0)>0):0)?(hd(j,c[p+1824>>2]|0)|0,(c[k>>2]|0)>1):0){g=1;do{hd((c[h>>2]|0)+(g*56|0)|0,c[p+1824+(g<<2)>>2]|0)|0;g=g+1|0;}while((g|0)<(c[k>>2]|0));}f=p+28|0;h=Nd(c[f>>2]|0,52)|0;d=n+56|0;c[d>>2]=h;b:do if((c[f>>2]|0)>0){e=p+2868|0;i=b+8|0;g=0;while(1){m=c[p+2852+(g<<2)>>2]|0;Dc(h+(g*52|0)|0,m,e,(c[p+(c[m>>2]<<2)>>2]|0)/2|0,c[i>>2]|0);g=g+1|0;if((g|0)>=(c[f>>2]|0))break b;h=c[d>>2]|0;}}while(0);c[a>>2]=1;}while(0);h=c[o>>2]|0;c[a+16>>2]=h;g=c[b+4>>2]|0;m=g<<2;f=Ld(m)|0;d=a+8|0;c[d>>2]=f;c[a+12>>2]=Ld(m)|0;if((g|0)>0?(c[f>>2]=Nd(h,4)|0,(g|0)>1):0){f=1;do{m=c[d>>2]|0;c[m+(f<<2)>>2]=Nd(h,4)|0;f=f+1|0;}while((f|0)<(g|0));}c[a+36>>2]=0;c[a+40>>2]=0;d=(c[o>>2]|0)/2|0;c[a+48>>2]=d;c[a+20>>2]=d;d=p+16|0;e=n+48|0;c[e>>2]=Nd(c[d>>2]|0,4)|0;h=p+20|0;g=n+52|0;c[g>>2]=Nd(c[h>>2]|0,4)|0;if((c[d>>2]|0)>0){f=0;do{m=Ra[c[(c[25640+(c[p+800+(f<<2)>>2]<<2)>>2]|0)+8>>2]&15](a,c[p+1056+(f<<2)>>2]|0)|0;c[(c[e>>2]|0)+(f<<2)>>2]=m;f=f+1|0;}while((f|0)<(c[d>>2]|0));}if((c[h>>2]|0)>0)e=0;else {m=0;return m|0}do{m=Ra[c[(c[25648+(c[p+1312+(e<<2)>>2]<<2)>>2]|0)+8>>2]&15](a,c[p+1568+(e<<2)>>2]|0)|0;c[(c[g>>2]|0)+(e<<2)>>2]=m;e=e+1|0;}while((e|0)<(c[h>>2]|0));e=0;return e|0}function Ib(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;m=i;i=i+64|0;g=m;h=a+20|0;b=c[h>>2]|0;k=i;i=i+((1*(b<<2)|0)+15&-16)|0;c[a+28>>2]=1;l=a+48|0;if((b-(c[l>>2]|0)|0)<=32){i=m;return}j=a+4|0;if((c[(c[j>>2]|0)+4>>2]|0)<=0){i=m;return}f=a+8|0;e=0;do{if((b|0)>0){a=c[(c[f>>2]|0)+(e<<2)>>2]|0;d=0;do{c[k+(d<<2)>>2]=c[a+(b+~d<<2)>>2];d=d+1|0;}while((b|0)>(d|0));}+nc(k,g,b-(c[l>>2]|0)|0,16);d=c[l>>2]|0;a=(c[h>>2]|0)-d|0;oc(g,k+(a+-16<<2)|0,16,k+(a<<2)|0,d);b=c[h>>2]|0;if((b|0)>0){a=c[(c[f>>2]|0)+(e<<2)>>2]|0;d=0;do{c[a+(b+~d<<2)>>2]=c[k+(d<<2)>>2];d=d+1|0;}while((b|0)>(d|0));}e=e+1|0;}while((e|0)<(c[(c[j>>2]|0)+4>>2]|0));i=m;return}function Jb(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;cb(d,5653314,24);cb(d,c[b>>2]|0,16);m=b+4|0;cb(d,c[m>>2]|0,24);h=c[m>>2]|0;a:do if((h|0)>1){g=c[b+8>>2]|0;e=a[g>>0]|0;f=1;do{if(!(e<<24>>24))break a;k=e;e=a[g+f>>0]|0;if(e<<24>>24<k<<24>>24)break a;f=f+1|0;}while((f|0)<(h|0));}else f=1;while(0);b:do if((f|0)!=(h|0)){cb(d,0,1);g=c[m>>2]|0;c:do if((g|0)>0){e=c[b+8>>2]|0;f=0;do{if(!(a[e+f>>0]|0))break c;f=f+1|0;}while((f|0)<(g|0));}else f=0;while(0);if((f|0)==(g|0)){cb(d,0,1);if((c[m>>2]|0)<=0)break;f=b+8|0;e=0;while(1){cb(d,(a[(c[f>>2]|0)+e>>0]|0)+-1|0,5);e=e+1|0;if((e|0)>=(c[m>>2]|0))break b}}cb(d,1,1);if((c[m>>2]|0)>0){f=b+8|0;e=0;do{if(!(a[(c[f>>2]|0)+e>>0]|0))cb(d,0,1);else {cb(d,1,1);cb(d,(a[(c[f>>2]|0)+e>>0]|0)+-1|0,5);}e=e+1|0;}while((e|0)<(c[m>>2]|0));}}else {cb(d,1,1);k=b+8|0;cb(d,(a[c[k>>2]>>0]|0)+-1|0,5);f=c[m>>2]|0;if((f|0)>1){g=0;e=1;do{i=c[k>>2]|0;h=a[i+e>>0]|0;i=a[i+(e+-1)>>0]|0;if(h<<24>>24>i<<24>>24){j=h<<24>>24;h=i<<24>>24;while(1){cb(d,e-g|0,bd(f-g|0)|0);h=h+1|0;f=c[m>>2]|0;if((h|0)==(j|0)){g=e;break}else g=e;}}e=e+1|0;}while((e|0)<(f|0));}else {g=0;e=1;}cb(d,e-g|0,bd(f-g|0)|0);}while(0);e=b+12|0;cb(d,c[e>>2]|0,4);f=c[e>>2]|0;if((f|0)==2|(f|0)==1)l=28;else if(f){b=-1;return b|0}do if((l|0)==28){g=b+32|0;if(!(c[g>>2]|0)){b=-1;return b|0}cb(d,c[b+16>>2]|0,32);cb(d,c[b+20>>2]|0,32);h=b+24|0;cb(d,(c[h>>2]|0)+-1|0,4);cb(d,c[b+28>>2]|0,1);f=c[e>>2]|0;if((f|0)==1)f=dd(b)|0;else if((f|0)==2)f=$(c[b>>2]|0,c[m>>2]|0)|0;else break;if((f|0)>0){e=0;do{b=c[(c[g>>2]|0)+(e<<2)>>2]|0;cb(d,(b|0)>-1?b:0-b|0,c[h>>2]|0);e=e+1|0;}while((e|0)!=(f|0));}}while(0);b=0;return b|0}function Kb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;if((d|0)<0){f=0;return f|0}f=b+12|0;g=c[f>>2]|0;if((c[g+4>>2]|0)<=(d|0)){f=0;return f|0}cb(e,c[(c[b+20>>2]|0)+(d<<2)>>2]|0,a[(c[g+8>>2]|0)+d>>0]|0);f=a[(c[(c[f>>2]|0)+8>>2]|0)+d>>0]|0;return f|0}function Lb(a,b){a=a|0;b=b|0;if((c[a+8>>2]|0)<=0){b=-1;return b|0}b=Pb(a,b)|0;if((b|0)<=-1){b=-1;return b|0}b=c[(c[a+24>>2]|0)+(b<<2)>>2]|0;return b|0}function Mb(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,k=0,l=0,m=0,n=0;n=i;if((c[a+8>>2]|0)<=0){b=0;i=n;return b|0}h=c[a>>2]|0;l=(e|0)/(h|0)|0;m=i;i=i+((1*(l<<2)|0)+15&-16)|0;k=(l|0)>0;a:do if(k){f=a+16|0;e=0;while(1){h=Pb(a,d)|0;if((h|0)==-1){e=-1;break}j=c[a>>2]|0;c[m+(e<<2)>>2]=(c[f>>2]|0)+(($(j,h)|0)<<2);e=e+1|0;if((e|0)>=(l|0))break a}i=n;return e|0}else j=h;while(0);if((j|0)<1|k^1){b=0;i=n;return b|0}else {e=0;h=0;}while(1){f=0;do{a=b+(f+h<<2)|0;g[a>>2]=+g[a>>2]+ +g[(c[m+(f<<2)>>2]|0)+(e<<2)>>2];f=f+1|0;}while((f|0)!=(l|0));e=e+1|0;if((e|0)>=(j|0)){e=0;break}else h=h+l|0;}i=n;return e|0}function Nb(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,aa=0,ba=0,ca=0,da=0;if((c[a+8>>2]|0)<=0){W=0;return W|0}if((c[a>>2]|0)>8){if((e|0)<=0){W=0;return W|0}n=a+16|0;f=0;while(1){h=Pb(a,d)|0;if((h|0)==-1){f=-1;k=29;break}l=c[n>>2]|0;m=c[a>>2]|0;k=$(m,h)|0;if((m|0)>0){h=(m|0)>1?m:1;j=f;i=0;while(1){da=b+(j<<2)|0;g[da>>2]=+g[da>>2]+ +g[l+(i+k<<2)>>2];i=i+1|0;if((i|0)>=(m|0))break;else j=j+1|0;}f=f+h|0;}if((f|0)>=(e|0)){f=0;k=29;break}}if((k|0)==29)return f|0}i=a+16|0;if((e|0)>0)j=0;else {W=0;return W|0}a:while(1){b:while(1){f=Pb(a,d)|0;if((f|0)==-1){f=-1;k=29;break a}h=c[i>>2]|0;switch(c[a>>2]|0){case 5:{s=f;y=h;k=17;break b}case 7:{q=f;w=h;k=13;break b}case 3:{u=f;A=h;k=21;break b}case 4:{t=f;z=h;k=19;break b}case 2:{v=f;B=h;k=23;break b}case 6:{r=f;x=h;k=15;break b}case 8:{o=h;p=f;k=12;break b}case 1:{O=f;P=h;W=j;ca=0;break b}default:{}}}if((k|0)==12){C=p<<3;D=b+(j<<2)|0;g[D>>2]=+g[D>>2]+ +g[o+(C<<2)>>2];D=o;Q=j+1|0;X=1;k=14;}else if((k|0)==13){C=q*7|0;D=w;Q=j;X=0;k=14;}else if((k|0)==15){E=r*6|0;F=x;R=j;Y=0;k=16;}else if((k|0)==17){G=s*5|0;H=y;S=j;Z=0;k=18;}else if((k|0)==19){I=t<<2;J=z;T=j;_=0;k=20;}else if((k|0)==21){K=u*3|0;L=A;U=j;aa=0;k=22;}else if((k|0)==23){M=v<<1;N=B;V=j;ba=0;k=24;}if((k|0)==14){E=b+(Q<<2)|0;g[E>>2]=+g[E>>2]+ +g[D+(X+C<<2)>>2];E=C;F=D;R=Q+1|0;Y=X+1|0;k=16;}if((k|0)==16){G=b+(R<<2)|0;g[G>>2]=+g[G>>2]+ +g[F+(Y+E<<2)>>2];G=E;H=F;S=R+1|0;Z=Y+1|0;k=18;}if((k|0)==18){I=b+(S<<2)|0;g[I>>2]=+g[I>>2]+ +g[H+(Z+G<<2)>>2];I=G;J=H;T=S+1|0;_=Z+1|0;k=20;}if((k|0)==20){K=b+(T<<2)|0;g[K>>2]=+g[K>>2]+ +g[J+(_+I<<2)>>2];K=I;L=J;U=T+1|0;aa=_+1|0;k=22;}if((k|0)==22){M=b+(U<<2)|0;g[M>>2]=+g[M>>2]+ +g[L+(aa+K<<2)>>2];M=K;N=L;V=U+1|0;ba=aa+1|0;k=24;}if((k|0)==24){k=0;O=b+(V<<2)|0;g[O>>2]=+g[O>>2]+ +g[N+(ba+M<<2)>>2];O=M;P=N;W=V+1|0;ca=ba+1|0;}j=W+1|0;n=b+(W<<2)|0;g[n>>2]=+g[n>>2]+ +g[P+(ca+O<<2)>>2];if((j|0)>=(e|0)){f=0;k=29;break}}if((k|0)==29)return f|0;return 0}function Ob(a,b,d,e,f,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0;if((c[a+8>>2]|0)<=0){f=0;return f|0}i=(d|0)/(e|0)|0;m=(h+d|0)/(e|0)|0;if((i|0)>=(m|0)){f=0;return f|0}n=a+16|0;d=0;h=i;while(1){i=Pb(a,f)|0;if((i|0)==-1){d=-1;h=8;break}k=c[n>>2]|0;l=c[a>>2]|0;j=$(l,i)|0;if((l|0)>0){i=d;d=0;do{o=i+1|0;i=(c[b+(i<<2)>>2]|0)+(h<<2)|0;g[i>>2]=+g[i>>2]+ +g[k+(d+j<<2)>>2];i=(o|0)==(e|0);h=(i&1)+h|0;i=i?0:o;d=d+1|0;}while((d|0)<(l|0));}else i=d;if((h|0)<(m|0))d=i;else {d=0;h=8;break}}if((h|0)==8)return d|0;return 0}function Pb(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;i=c[b+40>>2]|0;e=fb(d,c[b+36>>2]|0)|0;do if((e|0)>-1){e=c[(c[b+32>>2]|0)+(e<<2)>>2]|0;if((e|0)<0){k=(c[b+8>>2]|0)-(e&32767)|0;f=e>>>15&32767;break}e=e+-1|0;gb(d,a[(c[b+28>>2]|0)+e>>0]|0);return e|0}else {k=c[b+8>>2]|0;f=0;}while(0);h=fb(d,i)|0;e=(h|0)<0;if(e&(i|0)>1){e=i;do{e=e+-1|0;h=fb(d,e)|0;g=(h|0)<0;}while(g&(e|0)>1);i=e;}else g=e;if(g){e=-1;return e|0}e=h>>>16|h<<16;e=e>>>8&16711935|e<<8&-16711936;e=e>>>4&252645135|e<<4&-252645136;e=e>>>2&858993459|e<<2&-858993460;e=e>>>1&1431655765|e<<1&-1431655766;h=k-f|0;if((h|0)>1){j=c[b+20>>2]|0;g=k;do{k=h>>1;l=(c[j+(k+f<<2)>>2]|0)>>>0>e>>>0;f=(l?0:k)+f|0;g=g-(l?k:0)|0;h=g-f|0;}while((h|0)>1);}e=a[(c[b+28>>2]|0)+f>>0]|0;if((e|0)>(i|0)){gb(d,i);e=-1;return e|0}else {gb(d,e);e=f;return e|0}return 0}function Qb(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0,h=0.0,i=0,j=0,k=0,l=0,m=0.0;d=c[b+28>>2]|0;k=c[b+4>>2]|0;c[a+4>>2]=128;c[a+8>>2]=64;c[a+12>>2]=c[d+2932>>2];c[a>>2]=k;l=a+164|0;c[l>>2]=128;c[a+176>>2]=(c[d+4>>2]|0)/2|0;b=a+36|0;c[b>>2]=Nd(128,4)|0;uc(a+16|0,128);b=c[b>>2]|0;d=0;do{e=+S(+(+(d|0)*.024736950028266088));g[b+(d<<2)>>2]=e*e;d=d+1|0;}while((d|0)!=128);c[a+40>>2]=2;c[a+44>>2]=4;c[a+56>>2]=4;c[a+60>>2]=5;c[a+72>>2]=6;c[a+76>>2]=6;c[a+88>>2]=9;c[a+92>>2]=8;c[a+104>>2]=13;c[a+108>>2]=8;c[a+120>>2]=17;c[a+124>>2]=8;c[a+136>>2]=22;c[a+140>>2]=8;j=4;b=0;while(1){f=Ld(j<<2)|0;c[a+40+(b<<4)+8>>2]=f;if((j|0)>0){h=+(j|0);d=a+40+(b<<4)+12|0;e=+g[d>>2];i=0;do{m=+S(+((+(i|0)+.5)/h*3.141592653589793));g[f+(i<<2)>>2]=m;e=e+m;i=i+1|0;}while((i|0)!=(j|0));g[d>>2]=e;}else {f=a+40+(b<<4)+12|0;d=f;e=+g[f>>2];}g[d>>2]=1.0/e;b=b+1|0;if((b|0)==7)break;j=c[a+40+(b<<4)+4>>2]|0;}c[a+152>>2]=Nd(k*7|0,144)|0;c[a+160>>2]=Nd(c[l>>2]|0,4)|0;return}function Rb(a){a=a|0;vc(a+16|0);Md(c[a+48>>2]|0);Md(c[a+64>>2]|0);Md(c[a+80>>2]|0);Md(c[a+96>>2]|0);Md(c[a+112>>2]|0);Md(c[a+128>>2]|0);Md(c[a+144>>2]|0);Md(c[a+36>>2]|0);Md(c[a+152>>2]|0);Md(c[a+160>>2]|0);Sd(a|0,0,180)|0;return}function Sb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;o=c[(c[a+4>>2]|0)+28>>2]|0;l=o+2868|0;p=c[c[a+104>>2]>>2]|0;n=p+168|0;k=p+8|0;g=c[k>>2]|0;i=(c[n>>2]|0)/(g|0)|0;g=(c[a+20>>2]|0)/(g|0)|0;m=g+-4|0;i=(i|0)<0?0:i;g=g+2|0;f=p+164|0;if((g|0)>(c[f>>2]|0)){c[f>>2]=g;j=p+160|0;c[j>>2]=Od(c[j>>2]|0,g<<2)|0;}if((i|0)<(m|0)){f=p+156|0;e=p+160|0;d=a+8|0;b=p+40|0;j=p+152|0;do{h=c[f>>2]|0;c[f>>2]=(h|0)>23?24:h+1|0;if((c[p>>2]|0)>0){g=0;h=0;do{q=(c[(c[d>>2]|0)+(g<<2)>>2]|0)+(($(c[k>>2]|0,i)|0)<<2)|0;h=Vb(p,l,q,b,(c[j>>2]|0)+((g*7|0)*144|0)|0)|0|h;g=g+1|0;}while((g|0)<(c[p>>2]|0));g=c[e>>2]|0;c[g+(i+2<<2)>>2]=0;if(h&1){c[g+(i<<2)>>2]=1;c[g+(i+1<<2)>>2]=1;}if((h&2|0)!=0?(c[g+(i<<2)>>2]=1,(i|0)>0):0)c[g+(i+-1<<2)>>2]=1;if(h&4)c[f>>2]=-1;}else c[(c[e>>2]|0)+(i+2<<2)>>2]=0;i=i+1|0;}while((i|0)!=(m|0));}i=c[k>>2]|0;f=$(i,m)|0;c[n>>2]=f;h=c[a+48>>2]|0;d=((c[o+(c[a+40>>2]<<2)>>2]|0)/4|0)+h+((c[o+4>>2]|0)/2|0)+((c[o>>2]|0)/4|0)|0;e=p+176|0;b=c[e>>2]|0;f=f-i|0;if((b|0)>=(f|0)){l=-1;return l|0}g=p+160|0;while(1){if((b|0)>=(d|0)){b=1;d=22;break}c[e>>2]=b;if((b|0)>(h|0)?(c[(c[g>>2]|0)+(((b|0)/(i|0)|0)<<2)>>2]|0)!=0:0){d=21;break}b=i+b|0;if((b|0)>=(f|0)){b=-1;d=22;break}}if((d|0)==21){c[p+172>>2]=b;l=0;return l|0}else if((d|0)==22)return b|0;return 0}function Tb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;g=c[c[a+104>>2]>>2]|0;d=c[(c[a+4>>2]|0)+28>>2]|0;f=c[a+48>>2]|0;b=c[a+40>>2]|0;e=(c[d+(b<<2)>>2]|0)/4|0;if(!b){a=(c[d>>2]|0)/4|0;b=a;}else {b=(c[d+(c[a+44>>2]<<2)>>2]|0)/4|0;a=(c[d+(c[a+36>>2]<<2)>>2]|0)/4|0;}d=f-e-a|0;b=e+f+b|0;a=c[g+172>>2]|0;if((a|0)>=(d|0)&(a|0)<(b|0)){b=1;return b|0}e=c[g+8>>2]|0;a=(d|0)/(e|0)|0;d=(b|0)/(e|0)|0;if((a|0)>=(d|0)){b=0;return b|0}b=c[g+160>>2]|0;while(1){if(c[b+(a<<2)>>2]|0){b=1;a=9;break}a=a+1|0;if((a|0)>=(d|0)){b=0;a=9;break}}if((a|0)==9)return b|0;return 0}function Ub(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=a+168|0;f=c[a+8>>2]|0;e=(b|0)/(f|0)|0;g=c[a+160>>2]|0;Zd(g|0,g+(e<<2)|0,((c[d>>2]|0)/(f|0)|0)+2-e<<2|0)|0;c[d>>2]=(c[d>>2]|0)-b;d=a+172|0;e=c[d>>2]|0;if((e|0)<=-1){d=a+176|0;e=c[d>>2]|0;e=e-b|0;c[d>>2]=e;return}c[d>>2]=e-b;d=a+176|0;e=c[d>>2]|0;e=e-b|0;c[d>>2]=e;return}function Vb(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,j=0.0,l=0,m=0.0,n=0,o=0.0,p=0,q=0.0,r=0.0,s=0,t=0,u=0,v=0.0,w=0,x=0.0;w=i;p=c[a+4>>2]|0;r=+g[a+12>>2];u=i;i=i+((1*(p<<2)|0)+15&-16)|0;t=c[a+156>>2]|0;n=(t|0)/2|0;t=(t|0)>5?n:2;j=+g[b+60>>2];v=j-+(n+-2|0);v=v<0.0?0.0:v;v=v>j?j:v;if((p|0)>0){h=c[a+36>>2]|0;l=0;do{g[u+(l<<2)>>2]=+g[h+(l<<2)>>2]*+g[d+(l<<2)>>2];l=l+1|0;}while((l|0)!=(p|0));}xc(a+16|0,u,u);j=+g[u>>2];o=+g[u+4>>2];m=+g[u+8>>2];m=o*o*.7+j*j+m*m*.2;a=f+140|0;l=c[a>>2]|0;if(!l){d=f+136|0;o=+g[d>>2]+m;n=f+132|0;g[n>>2]=o;g[d>>2]=m;}else {n=f+132|0;o=+g[n>>2]+m;g[n>>2]=o;d=f+136|0;g[d>>2]=+g[d>>2]+m;}l=f+72+(l<<2)|0;g[n>>2]=o-+g[l>>2];g[l>>2]=m;n=c[a>>2]|0;c[a>>2]=(n|0)>13?0:n+1|0;n=(p|0)/2|0;a:do if((p|0)>1){m=(+(((g[k>>2]=o*.0625,c[k>>2]|0)&2147483647)>>>0)*7.177114298428933e-07+-764.6162109375)*.5+-15.0;h=0;while(1){o=+g[u+((h|1)<<2)>>2];j=+(((g[k>>2]=o*o+j*j,c[k>>2]|0)&2147483647)>>>0)*3.5885571492144663e-07+-382.30810546875;j=j<m?m:j;g[u+(h>>1<<2)>>2]=j<r?r:j;h=h+2|0;if((h|0)>=(n|0))break a;m=m+-8.0;j=+g[u+(h<<2)>>2];}}while(0);if((t|0)>0){s=0;h=0;}else {p=0;h=0;do{a=c[e+(p<<4)+4>>2]|0;if((a|0)>0){l=c[e+(p<<4)>>2]|0;d=c[e+(p<<4)+8>>2]|0;j=0.0;n=0;do{j=+g[d+(n<<2)>>2]*+g[u+(l+n<<2)>>2]+j;n=n+1|0;}while((n|0)<(a|0));}else j=0.0;j=+g[e+(p<<4)+12>>2]*j;t=f+(p*144|0)+68|0;n=c[t>>2]|0;m=+g[f+(p*144|0)+(((n|0)<1?16:-1)+n<<2)>>2];g[f+(p*144|0)+(n<<2)>>2]=j;n=c[t>>2]|0;c[t>>2]=(n|0)>15?0:n+1|0;h=(j<m?m:j)+99999.0>+g[b+4+(p<<2)>>2]+v?h|5:h;h=(j>m?m:j)+-99999.0<+g[b+32+(p<<2)>>2]-v?h|2:h;p=p+1|0;}while((p|0)!=7);i=w;return h|0}do{l=c[e+(s<<4)+4>>2]|0;if((l|0)>0){n=c[e+(s<<4)>>2]|0;a=c[e+(s<<4)+8>>2]|0;j=0.0;d=0;do{j=+g[a+(d<<2)>>2]*+g[u+(n+d<<2)>>2]+j;d=d+1|0;}while((d|0)<(l|0));}else j=0.0;r=+g[e+(s<<4)+12>>2]*j;l=f+(s*144|0)+68|0;a=c[l>>2]|0;n=((a|0)<1?16:-1)+a|0;j=+g[f+(s*144|0)+(n<<2)>>2];q=r<j?j:r;j=r>j?j:r;p=0;o=-99999.0;m=99999.0;do{n=((n|0)<1?16:-1)+n|0;x=+g[f+(s*144|0)+(n<<2)>>2];o=o<x?x:o;m=m>x?x:m;p=p+1|0;}while((p|0)!=(t|0));g[f+(s*144|0)+(a<<2)>>2]=r;p=c[l>>2]|0;c[l>>2]=(p|0)>15?0:p+1|0;h=q-o>+g[b+4+(s<<2)>>2]+v?h|5:h;h=j-m<+g[b+32+(s<<2)>>2]-v?h|2:h;s=s+1|0;}while((s|0)!=7);i=w;return h|0}function Wb(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0,q=0,r=0.0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0.0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,aa=0,ba=0,ca=0;ca=i;i=i+4912|0;P=ca+1328|0;aa=ca+1064|0;ba=ca+804|0;T=ca+544|0;Q=ca+284|0;W=ca+24|0;N=ca+20|0;M=ca+16|0;U=ca+12|0;V=ca+8|0;R=ca+4|0;S=ca;Z=c[b+1296>>2]|0;O=c[b+1288>>2]|0;_=c[b+1284>>2]|0;k=(_|0)>0;if(k){l=0;do{c[aa+(l<<2)>>2]=-200;l=l+1|0;}while((l|0)!=(_|0));if(k){l=0;do{c[ba+(l<<2)>>2]=-200;l=l+1|0;}while((l|0)!=(_|0));if(k){Sd(T|0,0,_<<2|0)|0;l=0;do{c[Q+(l<<2)>>2]=1;l=l+1|0;}while((l|0)!=(_|0));if(k){Sd(W|0,-1,_<<2|0)|0;if((_|0)<=1){Y=0;i=ca;return Y|0}C=O+-1|0;B=Z+1112|0;E=_+-1|0;F=c[b>>2]|0;G=0;l=0;do{D=G;G=G+1|0;h=F;F=c[b+(G<<2)>>2]|0;k=P+(D*56|0)|0;f=k;m=f+56|0;do{c[f>>2]=0;f=f+4|0;}while((f|0)<(m|0));c[k>>2]=h;c[P+(D*56|0)+4>>2]=F;A=(F|0)<(O|0)?F:C;if((A|0)<(h|0)){n=0;x=0;y=0;w=0;m=0;k=0;h=0;s=0;f=0;v=0;u=0;t=0;}else {n=0;x=0;y=0;w=0;m=0;k=0;q=0;s=0;f=0;v=0;u=0;t=0;while(1){r=+g[e+(h<<2)>>2];p=~~(r*7.314285755157471+1023.5);p=(p|0)>1023?1023:(p|0)<0?0:p;do if(p)if(!(+g[B>>2]+ +g[d+(h<<2)>>2]>=r)){x=x+1|0;w=($(h,h)|0)+w|0;k=h+k|0;s=($(p,h)|0)+s|0;v=($(p,p)|0)+v|0;t=p+t|0;break}else {n=n+1|0;y=($(h,h)|0)+y|0;m=h+m|0;q=($(p,h)|0)+q|0;f=($(p,p)|0)+f|0;u=p+u|0;break}while(0);if((h|0)<(A|0))h=h+1|0;else {h=q;break}}}c[P+(D*56|0)+8>>2]=m;c[P+(D*56|0)+12>>2]=u;c[P+(D*56|0)+16>>2]=y;c[P+(D*56|0)+20>>2]=f;c[P+(D*56|0)+24>>2]=h;c[P+(D*56|0)+28>>2]=n;c[P+(D*56|0)+32>>2]=k;c[P+(D*56|0)+36>>2]=t;c[P+(D*56|0)+40>>2]=w;c[P+(D*56|0)+44>>2]=v;c[P+(D*56|0)+48>>2]=s;c[P+(D*56|0)+52>>2]=x;l=n+l|0;}while((G|0)!=(E|0));}else X=9;}else X=9;}else X=9;}else X=9;if((X|0)==9){if(_){Y=0;i=ca;return Y|0}l=P+4|0;f=P;m=f+56|0;do{c[f>>2]=0;f=f+4|0;}while((f|0)<(m|0));c[l>>2]=O;if((O|0)<1){l=0;v=0;u=0;t=0;s=0;q=0;p=0;n=0;f=0;m=0;h=0;k=0;}else {x=Z+1112|0;y=0;l=0;v=0;u=0;t=0;s=0;q=0;p=0;n=0;f=0;m=0;h=0;k=0;do{o=+g[e+(y<<2)>>2];w=~~(o*7.314285755157471+1023.5);w=(w|0)>1023?1023:(w|0)<0?0:w;do if(w)if(!(+g[x>>2]+ +g[d+(y<<2)>>2]>=o)){v=v+1|0;t=($(y,y)|0)+t|0;q=y+q|0;n=($(w,y)|0)+n|0;m=($(w,w)|0)+m|0;k=w+k|0;break}else {l=l+1|0;u=($(y,y)|0)+u|0;s=y+s|0;p=($(w,y)|0)+p|0;f=($(w,w)|0)+f|0;h=w+h|0;break}while(0);y=y+1|0;}while((y|0)!=(O|0));}c[P+8>>2]=s;c[P+12>>2]=h;c[P+16>>2]=u;c[P+20>>2]=f;c[P+24>>2]=p;c[P+28>>2]=l;c[P+32>>2]=q;c[P+36>>2]=k;c[P+40>>2]=t;c[P+44>>2]=m;c[P+48>>2]=n;c[P+52>>2]=v;}if(!l){Y=0;i=ca;return Y|0}c[N>>2]=-200;c[M>>2]=-200;Zb(P,_+-1|0,N,M,Z)|0;l=c[N>>2]|0;c[aa>>2]=l;c[ba>>2]=l;O=c[M>>2]|0;N=ba+4|0;c[N>>2]=O;M=aa+4|0;c[M>>2]=O;O=(_|0)>2;do if(O){G=Z+1112|0;H=Z+1096|0;I=Z+1100|0;J=Z+1104|0;L=2;a:while(1){E=c[b+520+(L<<2)>>2]|0;K=c[T+(E<<2)>>2]|0;F=c[Q+(E<<2)>>2]|0;l=W+(K<<2)|0;b:do if((c[l>>2]|0)!=(F|0)){k=c[b+520+(K<<2)>>2]|0;B=c[b+520+(F<<2)>>2]|0;c[l>>2]=F;w=c[Z+836+(K<<2)>>2]|0;A=c[Z+836+(F<<2)>>2]|0;m=c[aa+(K<<2)>>2]|0;C=ba+(K<<2)|0;l=c[C>>2]|0;if((m|0)>=0)if((l|0)<0)h=m;else h=l+m>>1;else h=l;D=aa+(F<<2)|0;p=c[D>>2]|0;n=c[ba+(F<<2)>>2]|0;if((p|0)>=0){if((n|0)>=0)p=n+p>>1;}else p=n;if((h|0)==-1|(p|0)==-1){X=38;break a}n=p-h|0;u=A-w|0;t=(n|0)/(u|0)|0;f=n>>31|1;o=+g[e+(w<<2)>>2];v=~~(o*7.314285755157471+1023.5);v=(v|0)>1023?1023:(v|0)<0?0:v;s=$(t,u)|0;s=((n|0)>-1?n:0-n|0)-((s|0)>-1?s:0-s|0)|0;n=h-v|0;n=$(n,n)|0;z=+g[G>>2];if(z+ +g[d+(w<<2)>>2]>=o){r=+(h|0);o=+(v|0);if(!(+g[H>>2]+r<o)?!(r-+g[I>>2]>o):0)X=42;}else X=42;c:do if((X|0)==42){X=0;v=w+1|0;if((v|0)<(A|0)){w=0;q=1;x=h;do{m=w+s|0;y=(m|0)<(u|0);w=m-(y?0:u)|0;x=x+t+(y?0:f)|0;o=+g[e+(v<<2)>>2];y=~~(o*7.314285755157471+1023.5);y=(y|0)>1023?1023:(y|0)<0?0:y;m=x-y|0;n=($(m,m)|0)+n|0;q=q+1|0;if((y|0)!=0?+g[d+(v<<2)>>2]+z>=o:0){o=+(x|0);r=+(y|0);if(+g[H>>2]+o<r)break c;if(o-+g[I>>2]>r)break c}v=v+1|0;}while((v|0)<(A|0));}else q=1;z=+g[H>>2];o=+(q|0);r=+g[J>>2];if((!(z*z/o>r)?(z=+g[I>>2],!(z*z/o>r)):0)?+((n|0)/(q|0)|0|0)>r:0)break;c[aa+(L<<2)>>2]=-200;c[ba+(L<<2)>>2]=-200;break b}while(0);c[U>>2]=-200;c[V>>2]=-200;c[R>>2]=-200;c[S>>2]=-200;l=Zb(P+(k*56|0)|0,E-k|0,U,V,Z)|0;m=Zb(P+(E*56|0)|0,B-E|0,R,S,Z)|0;l=(l|0)!=0;if(l){c[U>>2]=h;c[V>>2]=c[R>>2];}if((m|0)!=0?(c[R>>2]=c[V>>2],c[S>>2]=p,l):0){c[aa+(L<<2)>>2]=-200;c[ba+(L<<2)>>2]=-200;break}l=c[U>>2]|0;c[C>>2]=l;if(!K)c[aa>>2]=l;l=c[V>>2]|0;c[aa+(L<<2)>>2]=l;k=c[R>>2]|0;c[ba+(L<<2)>>2]=k;h=c[S>>2]|0;c[D>>2]=h;if((F|0)==1)c[N>>2]=h;if((k&l|0)>-1){d:do if((E|0)>0){k=E;do{h=k;k=k+-1|0;l=Q+(k<<2)|0;if((c[l>>2]|0)!=(F|0))break d;c[l>>2]=L;}while((h|0)>1);}while(0);l=E+1|0;if((l|0)<(_|0))do{k=T+(l<<2)|0;if((c[k>>2]|0)!=(K|0))break b;c[k>>2]=L;l=l+1|0;}while((l|0)<(_|0));}}while(0);L=L+1|0;if((L|0)>=(_|0)){X=68;break}}if((X|0)==38)Ja(1);else if((X|0)==68){j=c[aa>>2]|0;Y=c[ba>>2]|0;break}}else {j=l;Y=l;}while(0);f=Ab(a,_<<2)|0;if((j|0)>=0){if((Y|0)>=0)j=Y+j>>1;}else j=Y;c[f>>2]=j;h=c[M>>2]|0;j=c[N>>2]|0;if((h|0)>=0){if((j|0)>=0)h=j+h>>1;}else h=j;c[f+4>>2]=h;if(O)l=2;else {Y=f;i=ca;return Y|0}do{Y=l+-2|0;k=c[b+1032+(Y<<2)>>2]|0;Y=c[b+780+(Y<<2)>>2]|0;h=c[Z+836+(k<<2)>>2]|0;k=c[f+(k<<2)>>2]&32767;j=(c[f+(Y<<2)>>2]&32767)-k|0;h=($((j|0)>-1?j:0-j|0,(c[Z+836+(l<<2)>>2]|0)-h|0)|0)/((c[Z+836+(Y<<2)>>2]|0)-h|0)|0;k=((j|0)<0?0-h|0:h)+k|0;h=c[aa+(l<<2)>>2]|0;j=c[ba+(l<<2)>>2]|0;if((h|0)>=0){if((j|0)>=0)h=j+h>>1;}else h=j;c[f+(l<<2)>>2]=(h|0)<0|(k|0)==(h|0)?k|32768:h;l=l+1|0;}while((l|0)!=(_|0));i=ca;return f|0}function Xb(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;j=c[b+1284>>2]|0;if(!((d|0)!=0&(e|0)!=0)){b=0;return b|0}b=Ab(a,j<<2)|0;if((j|0)<=0)return b|0;h=65536-f|0;i=0;do{l=d+(i<<2)|0;a=$(c[l>>2]&32767,h)|0;k=e+(i<<2)|0;a=a+32768+($(c[k>>2]&32767,f)|0)>>16;g=b+(i<<2)|0;c[g>>2]=a;if((c[l>>2]&32768|0)!=0?(c[k>>2]&32768|0)!=0:0)c[g>>2]=a|32768;i=i+1|0;}while((i|0)!=(j|0));return b|0}function Yb(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+336|0;B=F+64|0;z=F+32|0;A=F;D=c[d+1296>>2]|0;E=d+1284|0;u=c[E>>2]|0;C=c[(c[(c[b+64>>2]|0)+4>>2]|0)+28>>2]|0;x=c[C+2848>>2]|0;if(!e){cb(a,0,1);Sd(f|0,0,((c[b+36>>2]|0)/2|0)<<2|0)|0;B=0;i=F;return B|0}if((u|0)>0){k=D+832|0;m=0;do{g=e+(m<<2)|0;l=c[g>>2]|0;j=l&32767;h=c[k>>2]|0;if((h|0)==4)j=j>>>4;else if((h|0)==1)j=j>>>2;else if((h|0)==2)j=j>>>3;else if((h|0)==3)j=(j>>>0)/12|0;c[g>>2]=l&32768|j;m=m+1|0;}while((m|0)!=(u|0));}h=c[e>>2]|0;c[B>>2]=h;j=c[e+4>>2]|0;n=B+4|0;c[n>>2]=j;s=d+1292|0;if((u|0)>2){j=2;do{p=j+-2|0;r=c[d+1032+(p<<2)>>2]|0;p=c[d+780+(p<<2)>>2]|0;k=c[D+836+(r<<2)>>2]|0;r=e+(r<<2)|0;g=e+(p<<2)|0;h=c[r>>2]&32767;m=(c[g>>2]&32767)-h|0;k=($((m|0)>-1?m:0-m|0,(c[D+836+(j<<2)>>2]|0)-k|0)|0)/((c[D+836+(p<<2)>>2]|0)-k|0)|0;k=((m|0)<0?0-k|0:k)+h|0;m=e+(j<<2)|0;p=c[m>>2]|0;if((p&32768|0)!=0|(p|0)==(k|0)){c[m>>2]=k|32768;c[B+(j<<2)>>2]=0;}else {l=(c[s>>2]|0)-k|0;l=(l|0)<(k|0)?l:k;m=p-k|0;do if((m|0)<0)if((m|0)<(0-l|0)){m=l+~m|0;break}else {m=~(m<<1);break}else if((l|0)>(m|0)){m=m<<1;break}else {m=l+m|0;break}while(0);c[B+(j<<2)>>2]=m;c[r>>2]=h;c[g>>2]=c[g>>2]&32767;}j=j+1|0;}while((j|0)!=(u|0));h=c[B>>2]|0;j=c[n>>2]|0;}cb(a,1,1);v=d+1308|0;c[v>>2]=(c[v>>2]|0)+1;v=(bd((c[s>>2]|0)+-1|0)|0)<<1;w=d+1304|0;c[w>>2]=(c[w>>2]|0)+v;cb(a,h,bd((c[s>>2]|0)+-1|0)|0);cb(a,j,bd((c[s>>2]|0)+-1|0)|0);if((c[D>>2]|0)>0){s=d+1300|0;p=0;v=2;while(1){n=c[D+4+(p<<2)>>2]|0;o=c[D+128+(n<<2)>>2]|0;u=c[D+192+(n<<2)>>2]|0;t=1<<u;c[z>>2]=0;c[z+4>>2]=0;c[z+8>>2]=0;c[z+12>>2]=0;c[z+16>>2]=0;c[z+20>>2]=0;c[z+24>>2]=0;c[z+28>>2]=0;if(u){c[A>>2]=0;c[A+4>>2]=0;c[A+8>>2]=0;c[A+12>>2]=0;c[A+16>>2]=0;c[A+20>>2]=0;c[A+24>>2]=0;c[A+28>>2]=0;q=(u|0)==31;if(!q){r=0;do{m=c[D+320+(n<<5)+(r<<2)>>2]|0;if((m|0)<0)m=1;else m=c[(c[C+1824+(m<<2)>>2]|0)+4>>2]|0;c[A+(r<<2)>>2]=m;r=r+1|0;}while((r|0)<(t|0));}a:do if((o|0)>0){if(q){m=0;k=0;l=0;while(1){k=c[z+(l<<2)>>2]<<m|k;l=l+1|0;if((l|0)==(o|0))break a;else m=m+31|0;}}else {h=0;k=0;j=0;}while(1){r=c[B+(j+v<<2)>>2]|0;g=0;while(1){if((r|0)<(c[A+(g<<2)>>2]|0)){r=g;g=31;break}g=g+1|0;if((g|0)>=(t|0)){g=33;break}}if((g|0)==31)c[z+(j<<2)>>2]=r;else if((g|0)==33)r=c[z+(j<<2)>>2]|0;k=r<<h|k;j=j+1|0;if((j|0)==(o|0))break;else h=h+u|0;}}else k=0;while(0);u=Kb(x+((c[D+256+(n<<2)>>2]|0)*56|0)|0,k,a)|0;c[s>>2]=(c[s>>2]|0)+u;}if((o|0)>0){m=0;do{k=c[D+320+(n<<5)+(c[z+(m<<2)>>2]<<2)>>2]|0;if((k|0)>-1?(y=c[B+(m+v<<2)>>2]|0,(y|0)<(c[x+(k*56|0)+4>>2]|0)):0){u=Kb(x+(k*56|0)|0,y,a)|0;c[w>>2]=(c[w>>2]|0)+u;}m=m+1|0;}while((m|0)!=(o|0));}p=p+1|0;if((p|0)>=(c[D>>2]|0))break;else v=o+v|0;}}u=D+832|0;j=$(c[u>>2]|0,c[e>>2]|0)|0;s=(c[C+(c[b+28>>2]<<2)>>2]|0)/2|0;if((c[E>>2]|0)>1){g=0;t=1;k=0;m=j;while(1){h=c[d+260+(t<<2)>>2]|0;j=c[e+(h<<2)>>2]|0;if((j&32767|0)==(j|0)){j=$(c[u>>2]|0,j)|0;r=c[D+836+(h<<2)>>2]|0;q=j-m|0;l=r-k|0;n=(q|0)/(l|0)|0;o=q>>31|1;p=$(n,l)|0;p=((q|0)>-1?q:0-q|0)-((p|0)>-1?p:0-p|0)|0;q=(s|0)>(r|0)?r:s;if((q|0)>(k|0))c[f+(k<<2)>>2]=m;h=k+1|0;if((h|0)<(q|0)){k=0;while(1){g=k+p|0;k=(g|0)<(l|0);m=m+n+(k?0:o)|0;c[f+(h<<2)>>2]=m;h=h+1|0;if((h|0)==(q|0)){g=r;h=r;break}else k=g-(k?0:l)|0;}}else {g=r;h=r;}}else {h=k;j=m;}t=t+1|0;if((t|0)>=(c[E>>2]|0))break;else {k=h;m=j;}}}else g=0;h=b+36|0;if((g|0)>=((c[h>>2]|0)/2|0|0)){B=1;i=F;return B|0}do{c[f+(g<<2)>>2]=j;g=g+1|0;}while((g|0)<((c[h>>2]|0)/2|0|0));g=1;i=F;return g|0}function Zb(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0,p=0,q=0.0,r=0;n=c[a>>2]|0;o=c[a+((b+-1|0)*56|0)+4>>2]|0;if((b|0)>0){m=+g[f+1108>>2];h=0.0;f=0;l=0.0;k=0.0;j=0.0;i=0.0;do{r=c[a+(f*56|0)+52>>2]|0;p=c[a+(f*56|0)+28>>2]|0;q=+(p+r|0)*m/+(p+1|0)+1.0;k=+(c[a+(f*56|0)+32>>2]|0)+k+ +(c[a+(f*56|0)+8>>2]|0)*q;i=+(c[a+(f*56|0)+36>>2]|0)+i+ +(c[a+(f*56|0)+12>>2]|0)*q;l=+(c[a+(f*56|0)+40>>2]|0)+l+ +(c[a+(f*56|0)+16>>2]|0)*q;j=+(c[a+(f*56|0)+48>>2]|0)+j+ +(c[a+(f*56|0)+24>>2]|0)*q;h=+(r|0)+h+q*+(p|0);f=f+1|0;}while((f|0)!=(b|0));}else {h=0.0;l=0.0;k=0.0;j=0.0;i=0.0;}f=c[d>>2]|0;if((f|0)>-1){h=h+1.0;l=l+ +($(n,n)|0);k=k+ +(n|0);j=+($(f,n)|0)+j;i=+(f|0)+i;}f=c[e>>2]|0;if((f|0)>-1){m=h+1.0;l=l+ +($(o,o)|0);k=k+ +(o|0);j=+($(f,o)|0)+j;i=+(f|0)+i;}else m=h;h=l*m-k*k;if(!(h>0.0)){c[d>>2]=0;c[e>>2]=0;a=1;return a|0}q=(i*l-k*j)/h;h=(j*m-k*i)/h;c[d>>2]=~~+Gd(h*+(n|0)+q);a=~~+Gd(h*+(o|0)+q);c[e>>2]=a;f=c[d>>2]|0;if((f|0)>1023){c[d>>2]=1023;a=c[e>>2]|0;f=1023;}if((a|0)>1023){c[e>>2]=1023;f=c[d>>2]|0;a=1023;}if((f|0)<0){c[d>>2]=0;a=c[e>>2]|0;}if((a|0)>=0){a=0;return a|0}c[e>>2]=0;a=0;return a|0}function _b(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;n=a+836|0;l=c[a+840>>2]|0;cb(b,c[a>>2]|0,5);if((c[a>>2]|0)>0){e=a+4|0;f=0;d=-1;do{k=e+(f<<2)|0;cb(b,c[k>>2]|0,4);k=c[k>>2]|0;d=(d|0)<(k|0)?k:d;f=f+1|0;}while((f|0)<(c[a>>2]|0));if((d|0)>-1){h=a+128|0;i=a+192|0;f=a+256|0;e=a+320|0;j=0;while(1){cb(b,(c[h+(j<<2)>>2]|0)+-1|0,3);g=i+(j<<2)|0;cb(b,c[g>>2]|0,2);if(!((c[g>>2]|0)!=0?(cb(b,c[f+(j<<2)>>2]|0,8),(c[g>>2]|0)==31):0)){k=0;m=8;}if((m|0)==8)while(1){m=0;cb(b,(c[e+(j<<5)+(k<<2)>>2]|0)+1|0,8);k=k+1|0;if((k|0)>=(1<<c[g>>2]|0))break;else m=8;}if((j|0)==(d|0))break;else j=j+1|0;}}}cb(b,(c[a+832>>2]|0)+-1|0,2);k=l+-1|0;cb(b,bd(k)|0,4);k=bd(k)|0;d=c[a>>2]|0;if((d|0)<=0)return;h=a+4|0;g=a+128|0;i=0;j=0;f=0;do{i=(c[g+(c[h+(j<<2)>>2]<<2)>>2]|0)+i|0;if((f|0)<(i|0)){do{cb(b,c[n+(f+2<<2)>>2]|0,k);f=f+1|0;}while((f|0)!=(i|0));d=c[a>>2]|0;f=i;}j=j+1|0;}while((j|0)<(d|0));return}function $b(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;r=i;i=i+272|0;q=r;g=c[a+28>>2]|0;p=Nd(1,1120)|0;m=hb(b,5)|0;c[p>>2]=m;a:do if((m|0)>0){a=p+4|0;d=0;e=-1;do{f=hb(b,4)|0;c[a+(d<<2)>>2]=f;if((f|0)<0)break a;e=(e|0)<(f|0)?f:e;d=d+1|0;}while((d|0)<(c[p>>2]|0));if((e|0)>-1){k=p+128|0;l=p+192|0;m=p+256|0;a=g+24|0;d=p+320|0;j=0;while(1){c[k+(j<<2)>>2]=(hb(b,3)|0)+1;g=hb(b,2)|0;h=l+(j<<2)|0;c[h>>2]=g;if((g|0)<0)break a;if(!g)g=c[m+(j<<2)>>2]|0;else {g=hb(b,8)|0;c[m+(j<<2)>>2]=g;}if((g|0)<0)break a;if((g|0)>=(c[a>>2]|0))break a;if((c[h>>2]|0)!=31){f=0;do{g=hb(b,8)|0;c[d+(j<<5)+(f<<2)>>2]=g+-1;if((g|0)<0)break a;f=f+1|0;if((g|0)>(c[a>>2]|0))break a}while((f|0)<(1<<c[h>>2]|0));}if((j|0)<(e|0))j=j+1|0;else {n=18;break}}}else n=18;}else n=18;while(0);b:do if((n|0)==18?(c[p+832>>2]=(hb(b,2)|0)+1,o=hb(b,4)|0,(o|0)>=0):0){e=c[p>>2]|0;if((e|0)>0){l=p+4|0;k=p+128|0;f=p+836|0;a=1<<o;d=0;m=0;g=0;do{d=(c[k+(c[l+(m<<2)>>2]<<2)>>2]|0)+d|0;if((d|0)>63)break b;if((g|0)<(d|0)){e=g;while(1){j=hb(b,o)|0;c[f+(e+2<<2)>>2]=j;if(!((j|0)>-1&(j|0)<(a|0)))break b;e=e+1|0;if((e|0)>=(d|0)){g=e;break}}e=c[p>>2]|0;}m=m+1|0;}while((m|0)<(e|0));}else {f=p+836|0;a=1<<o;d=0;}c[f>>2]=0;c[p+840>>2]=a;e=d+2|0;if((d|0)>-2){d=0;do{c[q+(d<<2)>>2]=f+(d<<2);d=d+1|0;}while((d|0)<(e|0));}Ed(q,e,4,8);c:do if((e|0)>1){d=c[c[q>>2]>>2]|0;a=1;while(1){m=d;d=c[c[q+(a<<2)>>2]>>2]|0;a=a+1|0;if((m|0)==(d|0))break;if((a|0)>=(e|0))break c}if(!p)d=0;else break b;i=r;return d|0}while(0);m=p;i=r;return m|0}while(0);Md(p);m=0;i=r;return m|0}function ac(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;t=i;i=i+272|0;n=t;q=Nd(1,1312)|0;c[q+1296>>2]=b;r=b+836|0;s=q+1288|0;c[s>>2]=c[b+840>>2];d=c[b>>2]|0;if((d|0)>0){a=b+4|0;f=b+128|0;g=0;e=0;do{e=(c[f+(c[a+(g<<2)>>2]<<2)>>2]|0)+e|0;g=g+1|0;}while((g|0)<(d|0));a=e+2|0;c[q+1284>>2]=a;if((e|0)>-2){g=e;h=7;}else Ed(n,a,4,8);}else {c[q+1284>>2]=2;a=2;g=0;h=7;}if((h|0)==7){d=0;do{c[n+(d<<2)>>2]=r+(d<<2);d=d+1|0;}while((d|0)<(a|0));Ed(n,a,4,8);f=r;e=q+260|0;d=0;do{c[e+(d<<2)>>2]=(c[n+(d<<2)>>2]|0)-f>>2;d=d+1|0;}while((d|0)<(a|0));e=q+260|0;d=q+520|0;f=0;do{c[d+(c[e+(f<<2)>>2]<<2)>>2]=f;f=f+1|0;}while((f|0)<(a|0));d=q+260|0;e=0;do{c[q+(e<<2)>>2]=c[r+(c[d+(e<<2)>>2]<<2)>>2];e=e+1|0;}while((e|0)<(a|0));e=g;}a=c[b+832>>2]|0;if((a|0)==2)c[q+1292>>2]=128;else if((a|0)==3)c[q+1292>>2]=86;else if((a|0)==1)c[q+1292>>2]=256;else if((a|0)==4)c[q+1292>>2]=64;if((e|0)<=0){i=t;return q|0}o=q+1032|0;p=q+780|0;b=0;do{h=b+2|0;a=c[r+(h<<2)>>2]|0;d=1;k=c[s>>2]|0;l=0;f=0;m=0;while(1){j=c[r+(l<<2)>>2]|0;n=(j|0)>(m|0)&(j|0)<(a|0);f=n?l:f;g=(j|0)<(k|0)&(j|0)>(a|0);d=g?l:d;l=l+1|0;if((l|0)>=(h|0))break;else {k=g?j:k;m=n?j:m;}}c[o+(b<<2)>>2]=f;c[p+(b<<2)>>2]=d;b=b+1|0;}while((b|0)!=(e|0));i=t;return q|0}function bc(a){a=a|0;if(a)Md(a);return}function cc(a){a=a|0;if(a)Md(a);return}function dc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;p=c[b+1296>>2]|0;n=c[(c[(c[(c[a+64>>2]|0)+4>>2]|0)+28>>2]|0)+2848>>2]|0;m=a+4|0;if((hb(m,1)|0)!=1){l=0;return l|0}q=b+1284|0;a=Ab(a,c[q>>2]<<2)|0;o=b+1292|0;c[a>>2]=hb(m,bd((c[o>>2]|0)+-1|0)|0)|0;c[a+4>>2]=hb(m,bd((c[o>>2]|0)+-1|0)|0)|0;a:do if((c[p>>2]|0)>0){e=0;d=2;b:while(1){i=c[p+4+(e<<2)>>2]|0;h=c[p+128+(i<<2)>>2]|0;f=c[p+192+(i<<2)>>2]|0;l=1<<f;if(f){g=Lb(n+((c[p+256+(i<<2)>>2]|0)*56|0)|0,m)|0;if((g|0)==-1){a=0;d=25;break}}else g=0;if((h|0)>0){j=l+-1|0;k=0;do{l=c[p+320+(i<<5)+((g&j)<<2)>>2]|0;g=g>>f;if((l|0)>-1){l=Lb(n+(l*56|0)|0,m)|0;c[a+(k+d<<2)>>2]=l;if((l|0)==-1){a=0;d=25;break b}}else c[a+(k+d<<2)>>2]=0;k=k+1|0;}while((k|0)<(h|0));}e=e+1|0;if((e|0)>=(c[p>>2]|0))break a;else d=h+d|0;}if((d|0)==25)return a|0}while(0);if((c[q>>2]|0)<=2){l=a;return l|0}l=b+1032|0;g=b+780|0;k=2;do{i=k+-2|0;h=l+(i<<2)|0;f=c[h>>2]|0;d=c[p+836+(f<<2)>>2]|0;i=g+(i<<2)|0;e=c[i>>2]|0;f=c[a+(f<<2)>>2]&32767;j=(c[a+(e<<2)>>2]&32767)-f|0;d=($((j|0)>-1?j:0-j|0,(c[p+836+(k<<2)>>2]|0)-d|0)|0)/((c[p+836+(e<<2)>>2]|0)-d|0)|0;f=((j|0)<0?0-d|0:d)+f|0;d=(c[o>>2]|0)-f|0;j=a+(k<<2)|0;e=c[j>>2]|0;if(!e)c[j>>2]=f|32768;else {do if((e|0)<(((d|0)<(f|0)?d:f)<<1|0))if(!(e&1)){d=e>>1;break}else {d=0-(e+1>>1)|0;break}else if((d|0)>(f|0)){d=e-f|0;break}else {d=~(e-d);break}while(0);c[j>>2]=d+f&32767;j=a+(c[h>>2]<<2)|0;c[j>>2]=c[j>>2]&32767;j=a+(c[i>>2]<<2)|0;c[j>>2]=c[j>>2]&32767;}k=k+1|0;}while((k|0)<(c[q>>2]|0));return a|0}function ec(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0.0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;u=c[b+1296>>2]|0;v=(c[(c[(c[(c[a+64>>2]|0)+4>>2]|0)+28>>2]|0)+(c[a+28>>2]<<2)>>2]|0)/2|0;if(!d){Sd(e|0,0,v<<2|0)|0;o=0;return o|0}s=c[u+832>>2]|0;a=$(s,c[d>>2]|0)|0;a=(a|0)<0?0:(a|0)>255?255:a;t=c[b+1284>>2]|0;if((t|0)>1){q=b+260|0;b=0;r=1;i=0;j=a;while(1){a=c[q+(r<<2)>>2]|0;h=c[d+(a<<2)>>2]|0;if((h&32767|0)==(h|0)){p=c[u+836+(a<<2)>>2]|0;a=$(s,h)|0;a=(a|0)<0?0:(a|0)>255?255:a;o=a-j|0;k=p-i|0;l=(o|0)/(k|0)|0;m=o>>31|1;n=$(l,k)|0;n=((o|0)>-1?o:0-o|0)-((n|0)>-1?n:0-n|0)|0;o=(v|0)>(p|0)?p:v;if((o|0)>(i|0)){h=e+(i<<2)|0;g[h>>2]=+g[h>>2]*+g[1768+(j<<2)>>2];}h=i+1|0;if((h|0)<(o|0)){i=0;while(1){b=i+n|0;i=(b|0)<(k|0);j=j+l+(i?0:m)|0;w=e+(h<<2)|0;g[w>>2]=+g[w>>2]*+g[1768+(j<<2)>>2];h=h+1|0;if((h|0)==(o|0)){b=p;h=p;break}else i=b-(i?0:k)|0;}}else {b=p;h=p;}}else {h=i;a=j;}r=r+1|0;if((r|0)>=(t|0))break;else {i=h;j=a;}}}else b=0;if((b|0)>=(v|0)){o=1;return o|0}f=+g[1768+(a<<2)>>2];do{o=e+(b<<2)|0;g[o>>2]=+g[o>>2]*f;b=b+1|0;}while((b|0)!=(v|0));b=1;return b|0}function fc(a,b){a=a|0;b=b|0;return (c[c[a>>2]>>2]|0)-(c[c[b>>2]>>2]|0)|0}function gc(a){a=a|0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;c[a+12>>2]=0;return}function hc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;h=Td(d|0)|0;h=h+2+(Td(e|0)|0)|0;g=i;i=i+((1*h|0)+15&-16)|0;_d(g|0,d|0)|0;d=g+(Td(g|0)|0)|0;a[d>>0]=61;a[d+1>>0]=0;Ud(g|0,e|0)|0;d=b+8|0;c[b>>2]=Od(c[b>>2]|0,(c[d>>2]<<2)+8|0)|0;h=b+4|0;j=Od(c[h>>2]|0,(c[d>>2]<<2)+8|0)|0;c[h>>2]=j;h=Td(g|0)|0;e=c[d>>2]|0;c[j+(e<<2)>>2]=h;h=Ld(h+1|0)|0;c[(c[b>>2]|0)+(e<<2)>>2]=h;_d(c[(c[b>>2]|0)+(e<<2)>>2]|0,g|0)|0;e=(c[d>>2]|0)+1|0;c[d>>2]=e;c[(c[b>>2]|0)+(e<<2)>>2]=0;i=f;return}function ic(a){a=a|0;var b=0,d=0,e=0,f=0;if(!a)return;b=c[a>>2]|0;if(b){f=a+8|0;d=c[f>>2]|0;if((d|0)>0){e=0;while(1){b=c[b+(e<<2)>>2]|0;if(b){Md(b);d=c[f>>2]|0;}e=e+1|0;if((e|0)>=(d|0))break;b=c[a>>2]|0;}b=c[a>>2]|0;}Md(b);}b=c[a+4>>2]|0;if(b)Md(b);b=c[a+12>>2]|0;if(b)Md(b);c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;c[a+12>>2]=0;return}function jc(a){a=a|0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;c[a+12>>2]=0;c[a+16>>2]=0;c[a+20>>2]=0;c[a+24>>2]=0;c[a+28>>2]=Nd(1,3664)|0;return}function kc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;g=c[a+28>>2]|0;if(!g){c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;c[a+12>>2]=0;c[a+16>>2]=0;c[a+20>>2]=0;c[a+24>>2]=0;c[a+28>>2]=0;return}f=g+8|0;b=c[f>>2]|0;if((b|0)>0){e=0;do{d=c[g+32+(e<<2)>>2]|0;if(d){Md(d);b=c[f>>2]|0;}e=e+1|0;}while((e|0)<(b|0));}f=g+12|0;b=c[f>>2]|0;if((b|0)>0){e=0;do{d=c[g+544+(e<<2)>>2]|0;if(d){Ma[c[(c[25664+(c[g+288+(e<<2)>>2]<<2)>>2]|0)+8>>2]&7](d);b=c[f>>2]|0;}e=e+1|0;}while((e|0)<(b|0));}f=g+16|0;b=c[f>>2]|0;if((b|0)>0){e=0;do{d=c[g+1056+(e<<2)>>2]|0;if(d){Ma[c[(c[25640+(c[g+800+(e<<2)>>2]<<2)>>2]|0)+12>>2]&7](d);b=c[f>>2]|0;}e=e+1|0;}while((e|0)<(b|0));}f=g+20|0;b=c[f>>2]|0;if((b|0)>0){e=0;do{d=c[g+1568+(e<<2)>>2]|0;if(d){Ma[c[(c[25648+(c[g+1312+(e<<2)>>2]<<2)>>2]|0)+12>>2]&7](d);b=c[f>>2]|0;}e=e+1|0;}while((e|0)<(b|0));}b=g+24|0;e=g+2848|0;if((c[b>>2]|0)>0){f=0;do{d=c[g+1824+(f<<2)>>2]|0;if(d)fd(d);d=c[e>>2]|0;if(d)gd(d+(f*56|0)|0);f=f+1|0;}while((f|0)<(c[b>>2]|0));}b=c[e>>2]|0;if(b)Md(b);b=g+28|0;if((c[b>>2]|0)>0){d=0;do{Cc(c[g+2852+(d<<2)>>2]|0);d=d+1|0;}while((d|0)<(c[b>>2]|0));}Md(g);c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;c[a+12>>2]=0;c[a+16>>2]=0;c[a+20>>2]=0;c[a+24>>2]=0;c[a+28>>2]=0;return}function lc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;q=i;i=i+32|0;p=q;n=c[a+4>>2]|0;o=c[a+104>>2]|0;if(!o){c[d>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+16>>2]=0;c[d+20>>2]=0;c[d+24>>2]=0;c[d+28>>2]=0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;c[e+20>>2]=0;c[e+24>>2]=0;c[e+28>>2]=0;c[f>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+16>>2]=0;c[f+20>>2]=0;c[f+24>>2]=0;c[f+28>>2]=0;m=-129;i=q;return m|0}j=n+4|0;if((c[j>>2]|0)>=1){ab(p);k=n+28|0;a=c[k>>2]|0;if(((a|0)!=0?(h=c[a>>2]|0,(h|0)>=64):0)?(g=a+4|0,(c[g>>2]|0)>=(h|0)):0){cb(p,1,8);cb(p,118,8);cb(p,111,8);cb(p,114,8);cb(p,98,8);cb(p,105,8);cb(p,115,8);cb(p,0,32);cb(p,c[j>>2]|0,8);cb(p,c[n+8>>2]|0,32);cb(p,c[n+12>>2]|0,32);cb(p,c[n+16>>2]|0,32);cb(p,c[n+20>>2]|0,32);cb(p,bd((c[a>>2]|0)+-1|0)|0,4);cb(p,bd((c[g>>2]|0)+-1|0)|0,4);cb(p,1,1);j=o+64|0;a=c[j>>2]|0;if(a)Md(a);h=Ld(ib(p)|0)|0;c[j>>2]=h;l=p+8|0;a=c[l>>2]|0;Yd(h|0,a|0,ib(p)|0)|0;c[d>>2]=c[j>>2];c[d+4>>2]=ib(p)|0;c[d+8>>2]=1;a=d+12|0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;c[a+12>>2]=0;c[a+16>>2]=0;eb(p);mc(p,b);a=o+68|0;h=c[a>>2]|0;if(h)Md(h);g=Ld(ib(p)|0)|0;c[a>>2]=g;h=c[l>>2]|0;Yd(g|0,h|0,ib(p)|0)|0;c[e>>2]=c[a>>2];c[e+4>>2]=ib(p)|0;a=e+8|0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;c[a+12>>2]=0;a=e+24|0;c[a>>2]=1;c[a+4>>2]=0;eb(p);k=c[k>>2]|0;a:do if(k){cb(p,5,8);cb(p,118,8);cb(p,111,8);cb(p,114,8);cb(p,98,8);cb(p,105,8);cb(p,115,8);a=k+24|0;cb(p,(c[a>>2]|0)+-1|0,8);if((c[a>>2]|0)>0){h=0;do{if(Jb(c[k+1824+(h<<2)>>2]|0,p)|0)break a;h=h+1|0;}while((h|0)<(c[a>>2]|0));}cb(p,0,6);cb(p,0,16);a=k+16|0;cb(p,(c[a>>2]|0)+-1|0,6);if((c[a>>2]|0)>0){g=0;do{h=k+800+(g<<2)|0;cb(p,c[h>>2]|0,16);h=c[c[25640+(c[h>>2]<<2)>>2]>>2]|0;if(!h)break a;Na[h&3](c[k+1056+(g<<2)>>2]|0,p);g=g+1|0;}while((g|0)<(c[a>>2]|0));}h=k+20|0;cb(p,(c[h>>2]|0)+-1|0,6);if((c[h>>2]|0)>0){g=0;do{m=k+1312+(g<<2)|0;cb(p,c[m>>2]|0,16);Na[c[c[25648+(c[m>>2]<<2)>>2]>>2]&3](c[k+1568+(g<<2)>>2]|0,p);g=g+1|0;}while((g|0)<(c[h>>2]|0));}h=k+12|0;cb(p,(c[h>>2]|0)+-1|0,6);if((c[h>>2]|0)>0){g=0;do{m=k+288+(g<<2)|0;cb(p,c[m>>2]|0,16);Pa[c[c[25664+(c[m>>2]<<2)>>2]>>2]&1](n,c[k+544+(g<<2)>>2]|0,p);g=g+1|0;}while((g|0)<(c[h>>2]|0));}g=k+8|0;cb(p,(c[g>>2]|0)+-1|0,6);if((c[g>>2]|0)>0){h=0;do{m=k+32+(h<<2)|0;cb(p,c[c[m>>2]>>2]|0,1);cb(p,c[(c[m>>2]|0)+4>>2]|0,16);cb(p,c[(c[m>>2]|0)+8>>2]|0,16);cb(p,c[(c[m>>2]|0)+12>>2]|0,8);h=h+1|0;}while((h|0)<(c[g>>2]|0));}cb(p,1,1);b=o+72|0;g=c[b>>2]|0;if(g)Md(g);e=Ld(ib(p)|0)|0;c[b>>2]=e;m=c[l>>2]|0;Yd(e|0,m|0,ib(p)|0)|0;c[f>>2]=c[b>>2];c[f+4>>2]=ib(p)|0;m=f+8|0;c[m>>2]=0;c[m+4>>2]=0;c[m+8>>2]=0;c[m+12>>2]=0;m=f+24|0;c[m>>2]=2;c[m+4>>2]=0;db(p);m=0;i=q;return m|0}while(0);c[d>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+16>>2]=0;c[d+20>>2]=0;c[d+24>>2]=0;c[d+28>>2]=0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;c[e+20>>2]=0;c[e+24>>2]=0;c[e+28>>2]=0;c[f>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+16>>2]=0;c[f+20>>2]=0;c[f+24>>2]=0;c[f+28>>2]=0;a=-130;}else {h=-130;m=27;}}else {h=-129;m=27;}if((m|0)==27){c[d>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+16>>2]=0;c[d+20>>2]=0;c[d+24>>2]=0;c[d+28>>2]=0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;c[e+20>>2]=0;c[e+24>>2]=0;c[e+28>>2]=0;c[f>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+16>>2]=0;c[f+20>>2]=0;c[f+24>>2]=0;c[f+28>>2]=0;j=o+64|0;a=h;}db(p);b=c[j>>2]|0;if(b)Md(b);h=o+68|0;g=c[h>>2]|0;if(g)Md(g);g=o+72|0;b=c[g>>2]|0;if(b)Md(b);c[j>>2]=0;c[h>>2]=0;c[g>>2]=0;m=a;i=q;return m|0}function mc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;cb(b,3,8);cb(b,118,8);cb(b,111,8);cb(b,114,8);cb(b,98,8);cb(b,105,8);cb(b,115,8);cb(b,44,32);e=1200;f=44;while(1){f=f+-1|0;cb(b,a[e>>0]|0,8);if(!f)break;else e=e+1|0;}g=d+8|0;cb(b,c[g>>2]|0,32);if((c[g>>2]|0)<=0){cb(b,1,1);return}h=d+4|0;i=0;do{if(c[(c[d>>2]|0)+(i<<2)>>2]|0){cb(b,c[(c[h>>2]|0)+(i<<2)>>2]|0,32);f=c[(c[h>>2]|0)+(i<<2)>>2]|0;if(f){e=c[(c[d>>2]|0)+(i<<2)>>2]|0;while(1){f=f+-1|0;cb(b,a[e>>0]|0,8);if(!f)break;else e=e+1|0;}}}else cb(b,0,32);i=i+1|0;}while((i|0)<(c[g>>2]|0));cb(b,1,1);return}function nc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0.0,f=0,j=0.0,k=0,l=0,m=0,n=0.0,o=0,p=0,q=0,r=0,s=0,t=0,u=0.0,v=0;s=i;o=d+1|0;p=i;i=i+((1*(o<<3)|0)+15&-16)|0;r=i;i=i+((1*(d<<3)|0)+15&-16)|0;if(!o)j=0.0;else {k=d;while(1){if((k|0)<(c|0)){j=0.0;f=k;do{j=+g[a+(f-k<<2)>>2]*+g[a+(f<<2)>>2]+j;f=f+1|0;}while((f|0)!=(c|0));}else j=0.0;h[p+(k<<3)>>3]=j;if(!k)break;else k=k+-1|0;}j=+h[p>>3];}e=j*1.0000000001;n=j*1.0e-09+1.0e-10;o=(d|0)>0;if(o)m=0;else {i=s;return +e}do{f=m;m=m+1|0;if(e<n){q=8;break}j=-+h[p+(m<<3)>>3];if((f|0)>0){c=0;do{j=j-+h[p+(f-c<<3)>>3]*+h[r+(c<<3)>>3];c=c+1|0;}while((c|0)!=(f|0));j=j/e;h[r+(f<<3)>>3]=j;k=(f|0)/2|0;if((f|0)>1){c=f+-1|0;l=(k|0)>1;a=0;do{v=r+(a<<3)|0;u=+h[v>>3];t=r+(c-a<<3)|0;h[v>>3]=+h[t>>3]*j+u;h[t>>3]=+h[t>>3]+u*j;a=a+1|0;}while((a|0)<(k|0));a=l?k:1;}else a=0;}else {j=j/e;h[r+(f<<3)>>3]=j;a=0;}if(f&1){l=r+(a<<3)|0;u=+h[l>>3];h[l>>3]=u*j+u;}e=(1.0-j*j)*e;}while((m|0)<(d|0));if((q|0)==8)Sd(r+(f<<3)|0,0,d-f<<3|0)|0;if(o){j=.99;f=0;}else {i=s;return +e}while(1){q=r+(f<<3)|0;h[q>>3]=+h[q>>3]*j;f=f+1|0;if((f|0)==(d|0))break;else j=j*.99;}if(o)f=0;else {i=s;return +e}do{g[b+(f<<2)>>2]=+h[r+(f<<3)>>3];f=f+1|0;}while((f|0)!=(d|0));i=s;return +e}function oc(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0,h=0.0,j=0,k=0,l=0,m=0,n=0;m=i;l=i;i=i+((1*(e+c<<2)|0)+15&-16)|0;f=(c|0)>0;if(!b){if(f)Sd(l|0,0,c<<2|0)|0;}else if(f)Yd(l|0,b|0,c<<2|0)|0;if((e|0)<=0){i=m;return}if((c|0)>0){j=0;k=c;}else {f=e<<2;Sd(l|0,0,f|0)|0;Sd(d|0,0,f|0)|0;i=m;return}while(1){b=j;f=c;h=0.0;do{n=b;b=b+1|0;f=f+-1|0;h=h-+g[a+(f<<2)>>2]*+g[l+(n<<2)>>2];}while((b|0)!=(k|0));g[l+(k<<2)>>2]=h;g[d+(j<<2)>>2]=h;j=j+1|0;if((j|0)==(e|0))break;else k=k+1|0;}i=m;return}function pc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((c[b>>2]|0)>1){cb(d,1,1);cb(d,(c[b>>2]|0)+-1|0,4);}else cb(d,0,1);h=b+1156|0;if((c[h>>2]|0)>0){cb(d,1,1);cb(d,(c[h>>2]|0)+-1|0,8);if((c[h>>2]|0)>0){g=b+1160|0;f=a+4|0;e=b+2184|0;i=0;do{l=c[g+(i<<2)>>2]|0;cb(d,l,bd((c[f>>2]|0)+-1|0)|0);l=c[e+(i<<2)>>2]|0;cb(d,l,bd((c[f>>2]|0)+-1|0)|0);i=i+1|0;}while((i|0)<(c[h>>2]|0));}}else cb(d,0,1);cb(d,0,2);g=c[b>>2]|0;if((g|0)>1){g=a+4|0;if((c[g>>2]|0)>0){e=b+4|0;f=0;do{cb(d,c[e+(f<<2)>>2]|0,4);f=f+1|0;}while((f|0)<(c[g>>2]|0));j=c[b>>2]|0;k=13;}}else {j=g;k=13;}if((k|0)==13?(j|0)<=0:0)return;e=b+1028|0;f=b+1092|0;g=0;do{cb(d,0,8);cb(d,c[e+(g<<2)>>2]|0,8);cb(d,c[f+(g<<2)>>2]|0,8);g=g+1|0;}while((g|0)<(c[b>>2]|0));return}function qc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;d=Nd(1,3208)|0;m=c[a+28>>2]|0;Sd(d|0,0,3208)|0;l=a+4|0;a:do if((c[l>>2]|0)>=1?(f=hb(b,1)|0,(f|0)>=0):0){if(f){k=hb(b,4)|0;c[d>>2]=k+1;if((k|0)<0)break}else c[d>>2]=1;a=hb(b,1)|0;if((a|0)>=0){if(a){k=hb(b,8)|0;h=d+1156|0;c[h>>2]=k+1;if((k|0)<0)break;g=d+1160|0;f=d+2184|0;a=c[l>>2]|0;k=0;do{i=hb(b,bd(a+-1|0)|0)|0;c[g+(k<<2)>>2]=i;j=hb(b,bd((c[l>>2]|0)+-1|0)|0)|0;c[f+(k<<2)>>2]=j;if((i|0)==(j|0)|(j|i|0)<0)break a;a=c[l>>2]|0;k=k+1|0;if(!((i|0)<(a|0)&(j|0)<(a|0)))break a}while((k|0)<(c[h>>2]|0));}if(!(hb(b,2)|0)){a=c[d>>2]|0;if((a|0)>1){if((c[l>>2]|0)>0){a=d+4|0;f=0;while(1){k=hb(b,4)|0;c[a+(f<<2)>>2]=k;e=c[d>>2]|0;f=f+1|0;if((k|0)<0|(k|0)>=(e|0))break a;if((f|0)>=(c[l>>2]|0)){n=17;break}}}}else {e=a;n=17;}if((n|0)==17?(e|0)<=0:0){l=d;return l|0}e=d+1028|0;g=m+16|0;h=d+1092|0;a=m+20|0;f=0;do{hb(b,8)|0;l=hb(b,8)|0;c[e+(f<<2)>>2]=l;if((l|0)<0?1:(l|0)>=(c[g>>2]|0))break a;l=hb(b,8)|0;c[h+(f<<2)>>2]=l;f=f+1|0;if((l|0)<0?1:(l|0)>=(c[a>>2]|0))break a}while((f|0)<(c[d>>2]|0));return d|0}}}else n=24;while(0);if((n|0)==24?(d|0)==0:0){l=0;return l|0}Md(d);l=0;return l|0}function rc(a){a=a|0;if(a)Md(a);return}function sc(a){a=a|0;var b=0,d=0,e=0.0,f=0,h=0,j=0,l=0,m=0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0,t=0.0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0.0;N=i;B=c[a+64>>2]|0;C=c[B+4>>2]|0;L=c[C+28>>2]|0;B=c[B+104>>2]|0;M=c[a+104>>2]|0;y=c[a+36>>2]|0;C=C+4|0;E=c[C>>2]<<2;D=i;i=i+((1*E|0)+15&-16)|0;E=Ab(a,E)|0;F=Ab(a,c[C>>2]<<2)|0;G=Ab(a,c[C>>2]<<2)|0;v=M+4|0;e=+g[v>>2];A=c[C>>2]|0;x=i;i=i+((1*(A<<2)|0)+15&-16)|0;H=a+28|0;I=c[H>>2]|0;J=c[L+544+(I<<2)>>2]|0;K=(c[B+56>>2]|0)+((((I|0)!=0?2:0)+(c[M+8>>2]|0)|0)*52|0)|0;w=a+40|0;c[w>>2]=I;if((A|0)>0){u=(y|0)/2|0;b=u<<2;t=+(((g[k>>2]=4.0/+(y|0),c[k>>2]|0)&2147483647)>>>0)*7.177114298428933e-07+-764.6162109375+.345;j=B+4|0;h=a+24|0;f=a+32|0;r=t+-764.6162109375;d=y+-1|0;s=(d|0)>1;t=t+-382.30810546875;q=e;l=0;while(1){m=c[(c[a>>2]|0)+(l<<2)>>2]|0;c[F+(l<<2)>>2]=Ab(a,b)|0;p=E+(l<<2)|0;c[p>>2]=Ab(a,b)|0;wd(m,j,L,c[h>>2]|0,c[H>>2]|0,c[f>>2]|0);xc(c[c[B+12+(c[H>>2]<<2)>>2]>>2]|0,m,c[p>>2]|0);kd(B+20+((c[H>>2]|0)*12|0)|0,m);e=r+ +((c[m>>2]&2147483647)>>>0)*7.177114298428933e-07+.345;g[m>>2]=e;p=x+(l<<2)|0;g[p>>2]=e;if(s){o=1;do{n=+g[m+(o<<2)>>2];A=o+1|0;O=+g[m+(A<<2)>>2];n=t+ +(((g[k>>2]=O*O+n*n,c[k>>2]|0)&2147483647)>>>0)*3.5885571492144663e-07+.345;g[m+(A>>1<<2)>>2]=n;if(n>e){g[p>>2]=n;e=n;}o=o+2|0;}while((o|0)<(d|0));}if(e>0.0){g[p>>2]=0.0;e=0.0;}e=e>q?e:q;l=l+1|0;if((l|0)>=(c[C>>2]|0))break;else q=e;}}else {u=(y|0)/2|0;b=u<<2;}z=Ab(a,b)|0;A=Ab(a,b)|0;b=c[C>>2]|0;a:do if((b|0)>0){s=B+48|0;if((y|0)>1)o=0;else {m=0;while(1){d=c[J+4+(m<<2)>>2]|0;f=c[E+(m<<2)>>2]|0;h=c[(c[a>>2]|0)+(m<<2)>>2]|0;j=h+(u<<2)|0;c[w>>2]=I;b=Ab(a,60)|0;l=G+(m<<2)|0;c[l>>2]=b;p=b+60|0;do{c[b>>2]=0;b=b+4|0;}while((b|0)<(p|0));Fc(K,j,z);Gc(K,h,A,e,+g[x+(m<<2)>>2]);Hc(K,z,A,1,h,f,j);d=J+1028+(d<<2)|0;b=c[d>>2]|0;if((c[L+800+(b<<2)>>2]|0)!=1){b=-1;break}y=Wb(a,c[(c[s>>2]|0)+(b<<2)>>2]|0,j,h)|0;c[(c[l>>2]|0)+28>>2]=y;if((wb(a)|0)!=0?(c[(c[l>>2]|0)+28>>2]|0)!=0:0){Hc(K,z,A,2,h,f,j);y=Wb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,j,h)|0;c[(c[l>>2]|0)+56>>2]=y;Hc(K,z,A,0,h,f,j);y=Wb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,j,h)|0;c[c[l>>2]>>2]=y;y=c[l>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y>>2]|0,c[y+28>>2]|0,9362)|0;c[(c[l>>2]|0)+4>>2]=y;y=c[l>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y>>2]|0,c[y+28>>2]|0,18724)|0;c[(c[l>>2]|0)+8>>2]=y;y=c[l>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y>>2]|0,c[y+28>>2]|0,28086)|0;c[(c[l>>2]|0)+12>>2]=y;y=c[l>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y>>2]|0,c[y+28>>2]|0,37449)|0;c[(c[l>>2]|0)+16>>2]=y;y=c[l>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y>>2]|0,c[y+28>>2]|0,46811)|0;c[(c[l>>2]|0)+20>>2]=y;y=c[l>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y>>2]|0,c[y+28>>2]|0,56173)|0;c[(c[l>>2]|0)+24>>2]=y;y=c[l>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y+28>>2]|0,c[y+56>>2]|0,9362)|0;c[(c[l>>2]|0)+32>>2]=y;y=c[l>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y+28>>2]|0,c[y+56>>2]|0,18724)|0;c[(c[l>>2]|0)+36>>2]=y;y=c[l>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y+28>>2]|0,c[y+56>>2]|0,28086)|0;c[(c[l>>2]|0)+40>>2]=y;y=c[l>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y+28>>2]|0,c[y+56>>2]|0,37449)|0;c[(c[l>>2]|0)+44>>2]=y;y=c[l>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y+28>>2]|0,c[y+56>>2]|0,46811)|0;c[(c[l>>2]|0)+48>>2]=y;y=c[l>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y+28>>2]|0,c[y+56>>2]|0,56173)|0;c[(c[l>>2]|0)+52>>2]=y;}m=m+1|0;b=c[C>>2]|0;if((m|0)>=(b|0))break a}i=N;return b|0}while(1){f=c[J+4+(o<<2)>>2]|0;h=c[E+(o<<2)>>2]|0;j=c[(c[a>>2]|0)+(o<<2)>>2]|0;l=j+(u<<2)|0;c[w>>2]=I;b=Ab(a,60)|0;m=G+(o<<2)|0;c[m>>2]=b;p=b+60|0;do{c[b>>2]=0;b=b+4|0;}while((b|0)<(p|0));d=0;do{g[j+(d+u<<2)>>2]=+((c[h+(d<<2)>>2]&2147483647)>>>0)*7.177114298428933e-07+-764.6162109375+.345;d=d+1|0;}while((d|0)<(u|0));Fc(K,l,z);Gc(K,j,A,e,+g[x+(o<<2)>>2]);Hc(K,z,A,1,j,h,l);d=J+1028+(f<<2)|0;b=c[d>>2]|0;if((c[L+800+(b<<2)>>2]|0)!=1){b=-1;break}y=Wb(a,c[(c[s>>2]|0)+(b<<2)>>2]|0,l,j)|0;c[(c[m>>2]|0)+28>>2]=y;if((wb(a)|0)!=0?(c[(c[m>>2]|0)+28>>2]|0)!=0:0){Hc(K,z,A,2,j,h,l);y=Wb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,l,j)|0;c[(c[m>>2]|0)+56>>2]=y;Hc(K,z,A,0,j,h,l);y=Wb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,l,j)|0;c[c[m>>2]>>2]=y;y=c[m>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y>>2]|0,c[y+28>>2]|0,9362)|0;c[(c[m>>2]|0)+4>>2]=y;y=c[m>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y>>2]|0,c[y+28>>2]|0,18724)|0;c[(c[m>>2]|0)+8>>2]=y;y=c[m>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y>>2]|0,c[y+28>>2]|0,28086)|0;c[(c[m>>2]|0)+12>>2]=y;y=c[m>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y>>2]|0,c[y+28>>2]|0,37449)|0;c[(c[m>>2]|0)+16>>2]=y;y=c[m>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y>>2]|0,c[y+28>>2]|0,46811)|0;c[(c[m>>2]|0)+20>>2]=y;y=c[m>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y>>2]|0,c[y+28>>2]|0,56173)|0;c[(c[m>>2]|0)+24>>2]=y;y=c[m>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y+28>>2]|0,c[y+56>>2]|0,9362)|0;c[(c[m>>2]|0)+32>>2]=y;y=c[m>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y+28>>2]|0,c[y+56>>2]|0,18724)|0;c[(c[m>>2]|0)+36>>2]=y;y=c[m>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y+28>>2]|0,c[y+56>>2]|0,28086)|0;c[(c[m>>2]|0)+40>>2]=y;y=c[m>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y+28>>2]|0,c[y+56>>2]|0,37449)|0;c[(c[m>>2]|0)+44>>2]=y;y=c[m>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y+28>>2]|0,c[y+56>>2]|0,46811)|0;c[(c[m>>2]|0)+48>>2]=y;y=c[m>>2]|0;y=Xb(a,c[(c[s>>2]|0)+(c[d>>2]<<2)>>2]|0,c[y+28>>2]|0,c[y+56>>2]|0,56173)|0;c[(c[m>>2]|0)+52>>2]=y;}o=o+1|0;b=c[C>>2]|0;if((o|0)>=(b|0))break a}i=N;return b|0}else s=B+48|0;while(0);g[v>>2]=e;j=b<<2;v=i;i=i+((1*j|0)+15&-16)|0;w=i;i=i+((1*j|0)+15&-16)|0;j=(wb(a)|0)!=0;x=B+44|0;y=a+24|0;z=a+32|0;A=L+2868|0;u=B+52|0;j=j?0:7;while(1){h=c[M+12+(j<<2)>>2]|0;cb(h,0,1);cb(h,I,c[x>>2]|0);if(c[H>>2]|0){cb(h,c[y>>2]|0,1);cb(h,c[z>>2]|0,1);}b=c[C>>2]|0;if((b|0)>0){d=0;do{c[D+(d<<2)>>2]=Yb(h,a,c[(c[s>>2]|0)+(c[J+1028+(c[J+4+(d<<2)>>2]<<2)>>2]<<2)>>2]|0,c[(c[G+(d<<2)>>2]|0)+(j<<2)>>2]|0,c[F+(d<<2)>>2]|0)|0;d=d+1|0;b=c[C>>2]|0;}while((d|0)<(b|0));}Jc(j,A,K,J,E,F,D,c[L+3240+((c[H>>2]|0)*60|0)+(j<<2)>>2]|0,b);if((c[J>>2]|0)>0){o=0;do{p=c[J+1092+(o<<2)>>2]|0;d=c[C>>2]|0;if((d|0)>0){b=0;f=0;do{if((c[J+4+(f<<2)>>2]|0)==(o|0)){c[w+(b<<2)>>2]=(c[D+(f<<2)>>2]|0)!=0&1;c[v+(b<<2)>>2]=c[F+(f<<2)>>2];d=c[C>>2]|0;b=b+1|0;}f=f+1|0;}while((f|0)<(d|0));d=b;}else d=0;m=L+1312+(p<<2)|0;l=Sa[c[(c[25648+(c[m>>2]<<2)>>2]|0)+20>>2]&7](a,c[(c[u>>2]|0)+(p<<2)>>2]|0,v,w,d)|0;f=c[C>>2]|0;if((f|0)>0){d=0;b=0;do{if((c[J+4+(b<<2)>>2]|0)==(o|0)){c[v+(d<<2)>>2]=c[F+(b<<2)>>2];d=d+1|0;}b=b+1|0;}while((b|0)<(f|0));}else d=0;Qa[c[(c[25648+(c[m>>2]<<2)>>2]|0)+24>>2]&3](h,a,c[(c[u>>2]|0)+(p<<2)>>2]|0,v,w,d,l,o)|0;o=o+1|0;}while((o|0)<(c[J>>2]|0));}B=(wb(a)|0)!=0;if((j|0)<((B?14:7)|0))j=j+1|0;else {b=0;break}}i=N;return b|0}function tc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;B=i;z=c[a+64>>2]|0;y=c[z+4>>2]|0;x=c[y+28>>2]|0;z=c[z+104>>2]|0;A=a+28|0;v=c[x+(c[A>>2]<<2)>>2]|0;c[a+36>>2]=v;y=y+4|0;j=c[y>>2]<<2;o=i;i=i+((1*j|0)+15&-16)|0;p=i;i=i+((1*j|0)+15&-16)|0;u=i;i=i+((1*j|0)+15&-16)|0;w=i;i=i+((1*j|0)+15&-16)|0;j=c[y>>2]|0;if((j|0)>0){h=b+4|0;f=b+1028|0;e=z+48|0;d=v<<1&2147483646;k=0;do{j=c[f+(c[h+(k<<2)>>2]<<2)>>2]|0;j=Ra[c[(c[25640+(c[x+800+(j<<2)>>2]<<2)>>2]|0)+20>>2]&15](a,c[(c[e>>2]|0)+(j<<2)>>2]|0)|0;c[w+(k<<2)>>2]=j;c[u+(k<<2)>>2]=(j|0)!=0&1;Sd(c[(c[a>>2]|0)+(k<<2)>>2]|0,0,d|0)|0;k=k+1|0;j=c[y>>2]|0;}while((k|0)<(j|0));}q=b+1156|0;k=c[q>>2]|0;if((k|0)>0){h=b+1160|0;f=b+2184|0;l=0;do{e=u+(c[h+(l<<2)>>2]<<2)|0;d=c[f+(l<<2)>>2]|0;if(!((c[e>>2]|0)==0?(c[u+(d<<2)>>2]|0)==0:0)){c[e>>2]=1;c[u+(d<<2)>>2]=1;}l=l+1|0;}while((l|0)<(k|0));}if((c[b>>2]|0)>0){t=b+1092|0;s=z+52|0;r=b+4|0;h=0;while(1){if((j|0)>0){l=0;k=0;do{if((c[r+(k<<2)>>2]|0)==(h|0)){c[p+(l<<2)>>2]=(c[u+(k<<2)>>2]|0)!=0&1;c[o+(l<<2)>>2]=c[(c[a>>2]|0)+(k<<2)>>2];j=c[y>>2]|0;l=l+1|0;}k=k+1|0;}while((k|0)<(j|0));j=l;}else j=0;d=c[t+(h<<2)>>2]|0;Sa[c[(c[25648+(c[x+1312+(d<<2)>>2]<<2)>>2]|0)+28>>2]&7](a,c[(c[s>>2]|0)+(d<<2)>>2]|0,o,p,j)|0;h=h+1|0;if((h|0)>=(c[b>>2]|0))break;j=c[y>>2]|0;}j=c[q>>2]|0;}else j=k;if((j|0)>0){q=b+1160|0;r=c[a>>2]|0;s=b+2184|0;t=(v|0)/2|0;p=(v|0)>1;do{d=j;j=j+-1|0;l=c[r+(c[q+(j<<2)>>2]<<2)>>2]|0;k=c[r+(c[s+(j<<2)>>2]<<2)>>2]|0;if(p){o=0;do{h=l+(o<<2)|0;m=+g[h>>2];f=k+(o<<2)|0;n=+g[f>>2];e=n>0.0;do if(m>0.0)if(e){g[h>>2]=m;g[f>>2]=m-n;break}else {g[f>>2]=m;g[h>>2]=n+m;break}else if(e){g[h>>2]=m;g[f>>2]=n+m;break}else {g[f>>2]=m;g[h>>2]=m-n;break}while(0);o=o+1|0;}while((o|0)<(t|0));}}while((d|0)>1);}if((c[y>>2]|0)<=0){i=B;return 0}j=b+4|0;e=b+1028|0;f=z+48|0;h=0;do{d=c[e+(c[j+(h<<2)>>2]<<2)>>2]|0;La[c[(c[25640+(c[x+800+(d<<2)>>2]<<2)>>2]|0)+24>>2]&3](a,c[(c[f>>2]|0)+(d<<2)>>2]|0,c[w+(h<<2)>>2]|0,c[(c[a>>2]|0)+(h<<2)>>2]|0)|0;h=h+1|0;d=c[y>>2]|0;}while((h|0)<(d|0));if((d|0)<=0){i=B;return 0}d=0;do{x=c[(c[a>>2]|0)+(d<<2)>>2]|0;wc(c[c[z+12+(c[A>>2]<<2)>>2]>>2]|0,x,x);d=d+1|0;}while((d|0)<(c[y>>2]|0));i=B;return 0}function uc(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0,i=0,j=0,k=0,l=0,m=0,n=0.0,o=0.0,p=0;d=(b|0)/4|0;m=Ld(d<<2)|0;k=Ld(d+b<<2)|0;h=b>>1;n=+(b|0);j=~~+Gd(+Z(+n)*1.4426950408889634);c[a+4>>2]=j;c[a>>2]=b;c[a+8>>2]=k;c[a+12>>2]=m;if((b|0)<=3){e=4.0/n;d=a+16|0;g[d>>2]=e;return}e=3.141592653589793/+(b|0);f=3.141592653589793/+(b<<1|0);i=0;do{o=e*+(i<<2|0);l=i<<1;g[k+(l<<2)>>2]=+R(+o);p=l|1;g[k+(p<<2)>>2]=-+S(+o);o=f*+(p|0);l=l+h|0;g[k+(l<<2)>>2]=+R(+o);g[k+(l+1<<2)>>2]=+S(+o);i=i+1|0;}while((i|0)<(d|0));l=(b|0)/8|0;i=(b|0)>7;if(!i){e=4.0/n;d=a+16|0;g[d>>2]=e;return}e=3.141592653589793/+(b|0);d=0;do{o=e*+(d<<2|2|0);h=(d<<1)+b|0;g[k+(h<<2)>>2]=+R(+o)*.5;g[k+(h+1<<2)>>2]=+S(+o)*-.5;d=d+1|0;}while((d|0)<(l|0));k=(1<<j+-1)+-1|0;b=1<<j+-2;if(i)j=0;else {e=4.0/n;d=a+16|0;g[d>>2]=e;return}do{h=b;d=0;i=0;do{d=((h&j|0)==0?0:1<<i)|d;i=i+1|0;h=b>>i;}while((h|0)!=0);h=j<<1;c[m+(h<<2)>>2]=(k&~d)+-1;c[m+((h|1)<<2)>>2]=d;j=j+1|0;}while((j|0)<(l|0));e=4.0/n;d=a+16|0;g[d>>2]=e;return}function vc(a){a=a|0;var b=0;if(!a)return;b=c[a+8>>2]|0;if(b)Md(b);b=c[a+12>>2]|0;if(b)Md(b);c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;c[a+12>>2]=0;c[a+16>>2]=0;return}function wc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0;m=c[a>>2]|0;j=m>>1;m=m>>2;o=d+(j+m<<2)|0;k=a+8|0;l=c[k>>2]|0;e=l+(m<<2)|0;i=e;h=b+(j+-7<<2)|0;f=o;while(1){n=f;f=f+-16|0;p=h+8|0;q=i+12|0;r=i+8|0;g[f>>2]=-(+g[p>>2]*+g[q>>2])-+g[r>>2]*+g[h>>2];g[n+-12>>2]=+g[q>>2]*+g[h>>2]-+g[r>>2]*+g[p>>2];p=h+24|0;r=i+4|0;q=h+16|0;g[n+-8>>2]=-(+g[p>>2]*+g[r>>2])-+g[i>>2]*+g[q>>2];g[n+-4>>2]=+g[r>>2]*+g[q>>2]-+g[i>>2]*+g[p>>2];h=h+-32|0;if(h>>>0<b>>>0)break;else i=i+16|0;}n=d+(j<<2)|0;i=e;h=b+(j+-8<<2)|0;f=o;while(1){q=h+16|0;e=i+-4|0;p=h+24|0;r=i+-8|0;g[f>>2]=+g[r>>2]*+g[p>>2]+ +g[e>>2]*+g[q>>2];g[f+4>>2]=+g[r>>2]*+g[q>>2]-+g[e>>2]*+g[p>>2];p=i+-12|0;i=i+-16|0;e=h+8|0;g[f+8>>2]=+g[i>>2]*+g[e>>2]+ +g[p>>2]*+g[h>>2];g[f+12>>2]=+g[i>>2]*+g[h>>2]-+g[p>>2]*+g[e>>2];h=h+-32|0;if(h>>>0<b>>>0)break;else f=f+16|0;}yc(c[a+4>>2]|0,l,n,j);zc(c[a>>2]|0,c[k>>2]|0,c[a+12>>2]|0,d);h=(c[k>>2]|0)+(j<<2)|0;f=d;e=o;i=o;while(1){b=h+4|0;l=f+4|0;g[e+-4>>2]=+g[b>>2]*+g[f>>2]-+g[h>>2]*+g[l>>2];g[i>>2]=-(+g[h>>2]*+g[f>>2]+ +g[b>>2]*+g[l>>2]);l=f+8|0;b=h+12|0;a=f+12|0;k=h+8|0;g[e+-8>>2]=+g[b>>2]*+g[l>>2]-+g[k>>2]*+g[a>>2];g[i+4>>2]=-(+g[k>>2]*+g[l>>2]+ +g[b>>2]*+g[a>>2]);a=f+16|0;b=h+20|0;l=f+20|0;k=h+16|0;g[e+-12>>2]=+g[b>>2]*+g[a>>2]-+g[k>>2]*+g[l>>2];e=e+-16|0;g[i+8>>2]=-(+g[k>>2]*+g[a>>2]+ +g[b>>2]*+g[l>>2]);l=f+24|0;b=h+28|0;a=f+28|0;k=h+24|0;g[e>>2]=+g[b>>2]*+g[l>>2]-+g[k>>2]*+g[a>>2];g[i+12>>2]=-(+g[k>>2]*+g[l>>2]+ +g[b>>2]*+g[a>>2]);f=f+32|0;if(f>>>0>=e>>>0)break;else {h=h+32|0;i=i+16|0;}}h=d+(m<<2)|0;f=o;e=h;do{m=e;e=e+-16|0;s=+g[f+-4>>2];g[m+-4>>2]=s;g[h>>2]=-s;s=+g[f+-8>>2];g[m+-8>>2]=s;g[h+4>>2]=-s;s=+g[f+-12>>2];f=f+-16|0;g[m+-12>>2]=s;g[h+8>>2]=-s;s=+g[f>>2];g[e>>2]=s;g[h+12>>2]=-s;h=h+16|0;}while(h>>>0<f>>>0);f=o;e=o;while(1){m=e;e=e+-16|0;c[e>>2]=c[f+12>>2];c[m+-12>>2]=c[f+8>>2];c[m+-8>>2]=c[f+4>>2];c[m+-4>>2]=c[f>>2];if(e>>>0<=n>>>0)break;else f=f+16|0;}return}function xc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0.0,y=0.0,z=0;w=i;q=c[a>>2]|0;u=q>>1;v=q>>2;o=q>>3;f=i;i=i+((1*(q<<2)|0)+15&-16)|0;r=f+(u<<2)|0;k=u+v|0;j=b+(k<<2)|0;t=a+8|0;s=c[t>>2]|0;e=s+(u<<2)|0;if((o|0)>0){n=(o+-1|0)>>>1;m=n<<1;l=u+-2-m|0;n=k+-4-(n<<2)|0;h=0;k=b+(k+1<<2)|0;while(1){z=j;j=j+-16|0;p=e;e=e+-8|0;x=+g[k>>2]+ +g[z+-8>>2];y=+g[k+8>>2]+ +g[j>>2];p=p+-4|0;g[f+(h+u<<2)>>2]=+g[e>>2]*x+y*+g[p>>2];g[f+((h|1)+u<<2)>>2]=+g[e>>2]*y-+g[p>>2]*x;h=h+2|0;if((h|0)>=(o|0))break;else k=k+16|0;}p=l;e=s+(l<<2)|0;h=m+2|0;j=b+(n<<2)|0;}else {p=u;h=0;}k=b+4|0;n=u-o|0;if((h|0)<(n|0)){o=(u+-1-h-o|0)>>>1;m=o<<1;l=h+m|0;o=(o<<2)+5|0;m=-2-m|0;while(1){z=e;e=e+-8|0;x=+g[j+-8>>2]-+g[k>>2];j=j+-16|0;y=+g[j>>2]-+g[k+8>>2];z=z+-4|0;g[f+(h+u<<2)>>2]=+g[e>>2]*x+y*+g[z>>2];g[f+((h|1)+u<<2)>>2]=+g[e>>2]*y-+g[z>>2]*x;h=h+2|0;if((h|0)>=(n|0))break;else k=k+16|0;}e=s+(p+m<<2)|0;h=l+2|0;k=b+(o<<2)|0;}if((h|0)<(u|0)){j=b+(q<<2)|0;while(1){p=e;e=e+-8|0;x=-+g[j+-8>>2]-+g[k>>2];j=j+-16|0;y=-+g[j>>2]-+g[k+8>>2];p=p+-4|0;g[f+(h+u<<2)>>2]=+g[e>>2]*x+y*+g[p>>2];g[f+((h|1)+u<<2)>>2]=+g[e>>2]*y-+g[p>>2]*x;h=h+2|0;if((h|0)>=(u|0))break;else k=k+16|0;}}yc(c[a+4>>2]|0,s,r,u);zc(c[a>>2]|0,c[t>>2]|0,c[a+12>>2]|0,f);if((v|0)<=0){i=w;return}k=a+16|0;h=(c[t>>2]|0)+(u<<2)|0;j=0;e=d+(u<<2)|0;while(1){e=e+-4|0;p=f+4|0;o=h+4|0;g[d+(j<<2)>>2]=(+g[o>>2]*+g[p>>2]+ +g[h>>2]*+g[f>>2])*+g[k>>2];g[e>>2]=(+g[o>>2]*+g[f>>2]-+g[h>>2]*+g[p>>2])*+g[k>>2];j=j+1|0;if((j|0)==(v|0))break;else {h=h+8|0;f=f+8|0;}}i=w;return}function yc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0,C=0,D=0,E=0,F=0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0.0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,aa=0,ba=0.0,ca=0.0;v=a+-6|0;if((a|0)>6){a=b;e=c+(d+-8<<2)|0;f=c+((d>>1)+-8<<2)|0;while(1){l=e+24|0;z=+g[l>>2];k=f+24|0;x=+g[k>>2];w=z-x;m=e+28|0;y=+g[m>>2];n=f+28|0;A=y-+g[n>>2];g[l>>2]=x+z;g[m>>2]=+g[n>>2]+y;m=a+4|0;g[k>>2]=+g[a>>2]*w+ +g[m>>2]*A;g[n>>2]=+g[a>>2]*A-+g[m>>2]*w;n=e+16|0;w=+g[n>>2];m=f+16|0;A=+g[m>>2];y=w-A;k=e+20|0;z=+g[k>>2];l=f+20|0;x=z-+g[l>>2];g[n>>2]=A+w;g[k>>2]=+g[l>>2]+z;k=a+20|0;n=a+16|0;g[m>>2]=+g[n>>2]*y+ +g[k>>2]*x;g[l>>2]=+g[n>>2]*x-+g[k>>2]*y;l=e+8|0;y=+g[l>>2];k=f+8|0;x=+g[k>>2];z=y-x;n=e+12|0;w=+g[n>>2];m=f+12|0;A=w-+g[m>>2];g[l>>2]=x+y;g[n>>2]=+g[m>>2]+w;n=a+36|0;l=a+32|0;g[k>>2]=+g[l>>2]*z+ +g[n>>2]*A;g[m>>2]=+g[l>>2]*A-+g[n>>2]*z;z=+g[e>>2];A=+g[f>>2];w=z-A;m=e+4|0;y=+g[m>>2];n=f+4|0;x=y-+g[n>>2];g[e>>2]=A+z;g[m>>2]=+g[n>>2]+y;m=a+52|0;l=a+48|0;g[f>>2]=+g[l>>2]*w+ +g[m>>2]*x;g[n>>2]=+g[l>>2]*x-+g[m>>2]*w;f=f+-32|0;if(f>>>0<c>>>0)break;else {a=a+64|0;e=e+-32|0;}}}if((v|0)>1){r=1;do{n=1<<r;if((r|0)!=31){o=d>>r;p=4<<r;e=o+-8|0;a=(o>>1)+-8|0;h=p+1|0;i=p<<1;j=i|1;k=p*3|0;l=k+1|0;m=p<<2;s=0;do{u=$(s,o)|0;q=c+(u<<2)|0;f=b;t=c+(e+u<<2)|0;u=c+(a+u<<2)|0;while(1){F=t+24|0;z=+g[F>>2];C=u+24|0;x=+g[C>>2];w=z-x;D=t+28|0;y=+g[D>>2];E=u+28|0;A=y-+g[E>>2];g[F>>2]=x+z;g[D>>2]=+g[E>>2]+y;D=f+4|0;g[C>>2]=+g[f>>2]*w+ +g[D>>2]*A;g[E>>2]=+g[f>>2]*A-+g[D>>2]*w;E=f+(p<<2)|0;D=t+16|0;w=+g[D>>2];C=u+16|0;A=+g[C>>2];y=w-A;F=t+20|0;z=+g[F>>2];B=u+20|0;x=z-+g[B>>2];g[D>>2]=A+w;g[F>>2]=+g[B>>2]+z;F=f+(h<<2)|0;g[C>>2]=+g[E>>2]*y+ +g[F>>2]*x;g[B>>2]=+g[E>>2]*x-+g[F>>2]*y;B=f+(i<<2)|0;F=t+8|0;y=+g[F>>2];E=u+8|0;x=+g[E>>2];z=y-x;C=t+12|0;w=+g[C>>2];D=u+12|0;A=w-+g[D>>2];g[F>>2]=x+y;g[C>>2]=+g[D>>2]+w;C=f+(j<<2)|0;g[E>>2]=+g[B>>2]*z+ +g[C>>2]*A;g[D>>2]=+g[B>>2]*A-+g[C>>2]*z;D=f+(k<<2)|0;z=+g[t>>2];A=+g[u>>2];w=z-A;C=t+4|0;y=+g[C>>2];B=u+4|0;x=y-+g[B>>2];g[t>>2]=A+z;g[C>>2]=+g[B>>2]+y;C=f+(l<<2)|0;g[u>>2]=+g[D>>2]*w+ +g[C>>2]*x;g[B>>2]=+g[D>>2]*x-+g[C>>2]*w;u=u+-32|0;if(u>>>0<q>>>0)break;else {f=f+(m<<2)|0;t=t+-32|0;}}s=s+1|0;}while((s|0)<(n|0));}r=r+1|0;}while((r|0)!=(v|0));}if((d|0)>0)a=0;else return;do{Z=c+(a<<2)|0;p=c+((a|30)<<2)|0;H=+g[p>>2];T=c+((a|14)<<2)|0;O=+g[T>>2];v=c+((a|31)<<2)|0;x=+g[v>>2];m=c+((a|15)<<2)|0;J=+g[m>>2];g[p>>2]=O+H;g[v>>2]=J+x;g[T>>2]=H-O;g[m>>2]=x-J;q=c+((a|28)<<2)|0;J=+g[q>>2];F=c+((a|12)<<2)|0;x=+g[F>>2];O=J-x;b=c+((a|29)<<2)|0;H=+g[b>>2];l=c+((a|13)<<2)|0;L=+g[l>>2];I=H-L;g[q>>2]=x+J;g[b>>2]=L+H;g[F>>2]=O*.9238795042037964-I*.3826834261417389;g[l>>2]=I*.9238795042037964+O*.3826834261417389;s=c+((a|26)<<2)|0;O=+g[s>>2];D=c+((a|10)<<2)|0;I=+g[D>>2];H=O-I;t=c+((a|27)<<2)|0;L=+g[t>>2];C=c+((a|11)<<2)|0;J=+g[C>>2];x=L-J;g[s>>2]=I+O;g[t>>2]=J+L;g[D>>2]=(H-x)*.7071067690849304;g[C>>2]=(x+H)*.7071067690849304;r=c+((a|24)<<2)|0;H=+g[r>>2];E=c+((a|8)<<2)|0;x=+g[E>>2];L=H-x;u=c+((a|25)<<2)|0;J=+g[u>>2];n=c+((a|9)<<2)|0;O=+g[n>>2];I=J-O;g[r>>2]=x+H;g[u>>2]=O+J;J=L*.3826834261417389-I*.9238795042037964;L=I*.3826834261417389+L*.9238795042037964;k=c+((a|22)<<2)|0;I=+g[k>>2];aa=c+((a|6)<<2)|0;O=+g[aa>>2];H=I-O;V=c+((a|7)<<2)|0;x=+g[V>>2];e=c+((a|23)<<2)|0;K=+g[e>>2];ca=x-K;g[k>>2]=O+I;g[e>>2]=K+x;g[aa>>2]=ca;g[V>>2]=H;_=c+((a|4)<<2)|0;x=+g[_>>2];j=c+((a|20)<<2)|0;K=+g[j>>2];I=x-K;U=c+((a|5)<<2)|0;O=+g[U>>2];o=c+((a|21)<<2)|0;w=+g[o>>2];R=O-w;g[j>>2]=K+x;g[o>>2]=w+O;O=R*.9238795042037964+I*.3826834261417389;I=R*.3826834261417389-I*.9238795042037964;Y=c+((a|2)<<2)|0;R=+g[Y>>2];h=c+((a|18)<<2)|0;w=+g[h>>2];x=R-w;X=c+((a|3)<<2)|0;K=+g[X>>2];B=c+((a|19)<<2)|0;z=+g[B>>2];y=K-z;g[h>>2]=w+R;g[B>>2]=z+K;K=(y+x)*.7071067690849304;x=(y-x)*.7071067690849304;y=+g[Z>>2];i=c+((a|16)<<2)|0;z=+g[i>>2];R=y-z;W=c+((a|1)<<2)|0;w=+g[W>>2];f=c+((a|17)<<2)|0;N=+g[f>>2];M=w-N;y=z+y;g[i>>2]=y;w=N+w;g[f>>2]=w;N=M*.3826834261417389+R*.9238795042037964;R=M*.9238795042037964-R*.3826834261417389;M=R-L;z=N-J;J=N+J;L=R+L;R=z+M;z=M-z;M=+g[C>>2];N=x-M;A=+g[D>>2];G=A-K;K=A+K;x=M+x;M=+g[F>>2];A=M-O;ba=+g[l>>2];S=ba-I;O=M+O;I=ba+I;ba=A-S;A=S+A;S=+g[T>>2];M=S-ca;Q=+g[m>>2];P=Q-H;S=ca+S;Q=H+Q;H=M+N;N=M-N;M=(ba+R)*.7071067690849304;R=(ba-R)*.7071067690849304;g[aa>>2]=M+H;g[_>>2]=H-M;M=(A-z)*.7071067690849304;H=P-G;g[Z>>2]=M+N;g[Y>>2]=N-M;z=(A+z)*.7071067690849304;G=P+G;g[X>>2]=H+R;g[W>>2]=H-R;g[V>>2]=G+z;g[U>>2]=G-z;z=S+K;K=S-K;S=J+O;J=O-J;g[T>>2]=z+S;g[F>>2]=z-S;S=I-L;z=Q-x;g[E>>2]=K+S;g[D>>2]=K-S;L=I+L;x=Q+x;g[C>>2]=z+J;g[n>>2]=z-J;g[m>>2]=x+L;g[l>>2]=x-L;L=+g[u>>2];x=w-L;J=+g[r>>2];z=y-J;y=J+y;w=L+w;L=z+x;z=x-z;x=+g[B>>2];J=+g[t>>2];Q=x-J;I=+g[s>>2];S=+g[h>>2];K=I-S;I=S+I;x=J+x;J=+g[q>>2];S=+g[j>>2];O=J-S;G=+g[b>>2];R=+g[o>>2];H=G-R;J=S+J;G=R+G;R=O-H;O=H+O;H=+g[p>>2];S=+g[k>>2];P=H-S;A=+g[v>>2];M=+g[e>>2];N=A-M;H=S+H;A=M+A;M=P+Q;Q=P-Q;P=(R+L)*.7071067690849304;L=(R-L)*.7071067690849304;g[k>>2]=P+M;g[j>>2]=M-P;P=(O-z)*.7071067690849304;M=N-K;g[i>>2]=P+Q;g[h>>2]=Q-P;z=(O+z)*.7071067690849304;K=N+K;g[B>>2]=M+L;g[f>>2]=M-L;g[e>>2]=K+z;g[o>>2]=K-z;z=H+I;I=H-I;H=J+y;y=J-y;g[p>>2]=z+H;g[q>>2]=z-H;H=G-w;z=A-x;g[r>>2]=I+H;g[s>>2]=I-H;w=G+w;x=A+x;g[t>>2]=z+y;g[u>>2]=z-y;g[v>>2]=x+w;g[b>>2]=x-w;a=a+32|0;}while((a|0)<(d|0));return}function zc(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0;h=a>>1;f=b+(a<<2)|0;b=d;d=e;a=e+(h<<2)|0;while(1){t=(c[b>>2]|0)+h|0;i=(c[b+4>>2]|0)+h|0;n=+g[e+(t+1<<2)>>2];q=+g[e+(i+1<<2)>>2];o=n-q;j=+g[e+(t<<2)>>2];m=+g[e+(i<<2)>>2];r=m+j;p=+g[f>>2];l=+g[f+4>>2];k=l*o+r*p;o=l*r-p*o;i=a;a=a+-16|0;n=(q+n)*.5;m=(j-m)*.5;g[d>>2]=k+n;g[i+-8>>2]=n-k;g[d+4>>2]=o+m;g[i+-4>>2]=o-m;t=(c[b+8>>2]|0)+h|0;s=(c[b+12>>2]|0)+h|0;m=+g[e+(t+1<<2)>>2];o=+g[e+(s+1<<2)>>2];k=m-o;n=+g[e+(t<<2)>>2];j=+g[e+(s<<2)>>2];q=j+n;p=+g[f+8>>2];r=+g[f+12>>2];l=r*k+q*p;k=r*q-p*k;m=(o+m)*.5;j=(n-j)*.5;g[d+8>>2]=l+m;g[a>>2]=m-l;g[d+12>>2]=k+j;g[i+-12>>2]=k-j;d=d+16|0;if(d>>>0>=a>>>0)break;else {f=f+16|0;b=b+16|0;}}return}function Ac(a){a=a|0;var b=0,d=0;d=(c[a+28>>2]|0)+2868|0;b=Nd(1,36)|0;c[b+4>>2]=c[a+4>>2];g[b>>2]=-9999.0;c[b+8>>2]=d;return b|0}function Bc(a){a=a|0;if(!a)return;Md(a);return}function Cc(a){a=a|0;if(a)Md(a);return}function Dc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0,l=0.0,m=0.0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0.0,w=0,x=0,y=0,z=0.0,A=0.0,B=0.0;h=a;i=h+48|0;do{c[h>>2]=0;h=h+4|0;}while((h|0)<(i|0));w=c[d>>2]|0;c[a+36>>2]=w;p=~~(+Gd(+Z(+(+(w|0)*8.0))*1.4426950408889634)+-1.0);t=a+32|0;c[t>>2]=p;l=+(f|0);v=+(e|0);m=+(1<<p+1|0);w=~~(m*(+Z(+(l*.25*.5/v))*1.4426950216293335+-5.965784072875977)-+(w|0));c[a+28>>2]=w;c[a+40>>2]=1-w+~~(m*(+Z(+((+(e|0)+.25)*l*.5/v))*1.4426950216293335+-5.965784072875977)+.5);w=e<<2;p=Ld(w)|0;c[a+16>>2]=p;u=Ld(w)|0;c[a+20>>2]=u;s=Ld(w)|0;c[a+24>>2]=s;x=a+4|0;c[x>>2]=b;c[a>>2]=e;c[a+44>>2]=f;k=a+48|0;g[k>>2]=1.0;do if((f|0)>=26e3){if((f|0)<38e3){g[k>>2]=.9399999976158142;break}if((f|0)>46e3)g[k>>2]=1.274999976158142;}else g[k>>2]=0.0;while(0);z=v*2.0;A=+(f|0);j=(e|0)>0;i=0;d=0;a:while(1){h=j^1;while(1){k=i;i=i+1|0;j=~~+Gd(z*+Y(+(+(i|0)*.08664337545633316+2.7488713472395148))/A);if(!((j|0)<=(d|0)|h))break;if((i|0)>=87){k=d;break a}}m=+g[1272+(k<<2)>>2];l=(+g[1272+(i<<2)>>2]-m)/+(j-d|0);j=d-j|0;k=d-e|0;k=d-(j>>>0>k>>>0?j:k)|0;j=d;while(1){g[p+(j<<2)>>2]=m+100.0;j=j+1|0;if((j|0)==(k|0))break;else m=m+l;}if((i|0)<87){j=(k|0)<(e|0);d=k;}else break}if((k|0)<(e|0))do{c[p+(k<<2)>>2]=c[p+(k+-1<<2)>>2];k=k+1|0;}while((k|0)!=(e|0));r=(e|0)>0;if(r){d=(f|0)/(e<<1|0)|0;n=c[b+120>>2]|0;o=b+124|0;f=b+116|0;p=b+112|0;k=1;q=0;j=-99;do{i=$(d,q)|0;l=+(i|0);l=+W(+(+($(i,i)|0)*1.8499999754340024e-08))*2.240000009536743+ +W(+(l*7.399999885819852e-04))*13.100000381469727+l*9.999999747378752e-05;b:do if((n+j|0)<(q|0)){m=l-+g[p>>2];do{i=$(j,d)|0;B=+(i|0);if(!(+W(+(B*7.399999885819852e-04))*13.100000381469727+B*9.999999747378752e-05+ +W(+(+($(i,i)|0)*1.8499999754340024e-08))*2.240000009536743<m))break b;j=j+1|0;}while((n+j|0)<(q|0));}while(0);c:do if((k|0)<=(e|0)){h=(c[o>>2]|0)+q|0;i=k;while(1){if((i|0)>=(h|0)?(k=$(i,d)|0,m=+(k|0),m=+W(+(m*7.399999885819852e-04))*13.100000381469727+m*9.999999747378752e-05+ +W(+(+($(k,k)|0)*1.8499999754340024e-08))*2.240000009536743,!(m<+g[f>>2]+l)):0){k=i;break c}k=i+1|0;if((i|0)<(e|0))i=k;else break}}while(0);c[s+(q<<2)>>2]=(j<<16)+-65537+k;q=q+1|0;}while((q|0)!=(e|0));if(r){l=A*.5;m=+(1<<(c[t>>2]|0)+1|0);k=0;do{c[u+(k<<2)>>2]=~~(m*(+Z(+(l*(+(k|0)+.25)/v))*1.4426950216293335+-5.965784072875977)+.5);k=k+1|0;}while((k|0)!=(e|0));}else y=19;}else y=19;if((y|0)==19)l=A*.5;c[a+8>>2]=Kc(b+36|0,l/v,e,+g[b+24>>2],+g[b+28>>2])|0;h=Ld(12)|0;c[a+12>>2]=h;c[h>>2]=Ld(w)|0;c[h+4>>2]=Ld(w)|0;c[h+8>>2]=Ld(w)|0;if(!r)return;k=c[x>>2]|0;i=c[h>>2]|0;j=c[h+4>>2]|0;d=c[h+8>>2]|0;h=0;do{v=+Z(+((+(h|0)+.5)*A/z))*2.885390043258667+-11.931568145751953;v=v<0.0?0.0:v;v=v>=16.0?16.0:v;p=~~v;v=v-+(p|0);l=1.0-v;f=p+1|0;g[i+(h<<2)>>2]=+g[k+132+(f<<2)>>2]*v+ +g[k+132+(p<<2)>>2]*l;g[j+(h<<2)>>2]=+g[k+200+(f<<2)>>2]*v+ +g[k+200+(p<<2)>>2]*l;g[d+(h<<2)>>2]=+g[k+268+(f<<2)>>2]*v+ +g[k+268+(p<<2)>>2]*l;h=h+1|0;}while((h|0)!=(e|0));return}function Ec(a){a=a|0;var b=0,d=0,e=0;if(!a)return;b=c[a+16>>2]|0;if(b)Md(b);b=c[a+20>>2]|0;if(b)Md(b);b=c[a+24>>2]|0;if(b)Md(b);e=a+8|0;d=c[e>>2]|0;if(d){b=0;while(1){Md(c[c[d+(b<<2)>>2]>>2]|0);Md(c[(c[(c[e>>2]|0)+(b<<2)>>2]|0)+4>>2]|0);Md(c[(c[(c[e>>2]|0)+(b<<2)>>2]|0)+8>>2]|0);Md(c[(c[(c[e>>2]|0)+(b<<2)>>2]|0)+12>>2]|0);Md(c[(c[(c[e>>2]|0)+(b<<2)>>2]|0)+16>>2]|0);Md(c[(c[(c[e>>2]|0)+(b<<2)>>2]|0)+20>>2]|0);Md(c[(c[(c[e>>2]|0)+(b<<2)>>2]|0)+24>>2]|0);Md(c[(c[(c[e>>2]|0)+(b<<2)>>2]|0)+28>>2]|0);Md(c[(c[e>>2]|0)+(b<<2)>>2]|0);b=b+1|0;if((b|0)==17)break;d=c[e>>2]|0;}Md(c[e>>2]|0);}d=a+12|0;b=c[d>>2]|0;if(b){Md(c[b>>2]|0);Md(c[(c[d>>2]|0)+4>>2]|0);Md(c[(c[d>>2]|0)+8>>2]|0);Md(c[d>>2]|0);}b=a;d=b+52|0;do{c[b>>2]=0;b=b+4|0;}while((b|0)<(d|0));return}function Fc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0;l=i;j=c[a>>2]|0;k=i;i=i+((1*(j<<2)|0)+15&-16)|0;f=a+24|0;Lc(j,c[f>>2]|0,b,d,140.0,-1);h=(j|0)>0;if(h){e=0;do{g[k+(e<<2)>>2]=+g[b+(e<<2)>>2]-+g[d+(e<<2)>>2];e=e+1|0;}while((e|0)!=(j|0));}a=a+4|0;Lc(j,c[f>>2]|0,k,d,0.0,c[(c[a>>2]|0)+128>>2]|0);if(h)e=0;else {i=l;return}do{f=k+(e<<2)|0;g[f>>2]=+g[b+(e<<2)>>2]-+g[f>>2];e=e+1|0;}while((e|0)!=(j|0));if(!h){i=l;return}a=c[a>>2]|0;e=0;do{f=d+(e<<2)|0;h=~~(+g[f>>2]+.5);h=(h|0)>39?39:h;g[f>>2]=+g[a+336+(((h|0)<0?0:h)<<2)>>2]+ +g[k+(e<<2)>>2];e=e+1|0;}while((e|0)!=(j|0));i=l;return}function Gc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=+e;f=+f;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0,u=0,v=0,w=0,x=0.0,y=0,z=0.0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;G=i;t=c[a>>2]|0;E=a+40|0;C=c[E>>2]|0;F=i;i=i+((1*(C<<2)|0)+15&-16)|0;D=a+4|0;n=c[D>>2]|0;f=+g[n+4>>2]+f;if((C|0)>0){m=0;do{g[F+(m<<2)>>2]=-9999.0;m=m+1|0;}while((m|0)<(C|0));}s=+g[n+8>>2];f=f<s?s:f;k=(t|0)>0;if(k){m=c[a+16>>2]|0;l=0;do{g[d+(l<<2)>>2]=+g[m+(l<<2)>>2]+f;l=l+1|0;}while((l|0)!=(t|0));r=c[a+8>>2]|0;s=+g[n+496>>2]-e;if(k){o=c[a+20>>2]|0;k=a+32|0;j=a+36|0;h=a+28|0;m=0;while(1){q=c[o+(m<<2)>>2]|0;n=m;e=+g[b+(m<<2)>>2];a:while(1)while(1){m=n+1|0;if((m|0)>=(t|0)){p=0;f=e;break a}if((c[o+(m<<2)>>2]|0)!=(q|0)){p=1;f=e;break a}f=+g[b+(m<<2)>>2];if(f>e){n=m;e=f;continue a}else n=m;}if(f+6.0>+g[d+(n<<2)>>2]?(w=q>>c[k>>2],w=(w|0)>16?16:w,u=c[j>>2]|0,v=~~((s+f+-30.0)*.10000000149011612),v=(v|0)<0?0:v,v=c[(c[r+(((w|0)<0?0:w)<<2)>>2]|0)+(((v|0)>7?7:v)<<2)>>2]|0,w=~~+g[v+4>>2],x=+g[v>>2],y=~~x,(y|0)<(w|0)):0){l=y;n=~~((x+-16.0)*+(u|0)-+(u>>1|0)+ +((c[o+(n<<2)>>2]|0)-(c[h>>2]|0)|0));do{if((n|0)>0?(z=+g[v+(l+2<<2)>>2]+f,A=F+(n<<2)|0,+g[A>>2]<z):0)g[A>>2]=z;n=n+u|0;l=l+1|0;}while((l|0)<(w|0)&(n|0)<(C|0));}if(!p)break}}else B=7;}else B=7;if((B|0)==7)j=a+36|0;k=c[j>>2]|0;Mc(F,k,C);r=c[a>>2]|0;b:do if((r|0)>1){q=c[a+20>>2]|0;B=c[q>>2]|0;p=c[a+28>>2]|0;o=(c[D>>2]|0)+32|0;h=1;n=B;j=0;k=B-(k>>1)-p|0;while(1){e=+g[F+(k<<2)>>2];m=((c[q+(h<<2)>>2]|0)+n>>1)-p|0;f=+g[o>>2];e=e>f?f:e;c:do if((k|0)<(m|0)){h=k;while(1){l=e==-9999.0;while(1){h=h+1|0;f=+g[F+(h<<2)>>2];if(f>-9999.0){if(l|f<e){e=f;break}}else if(l){e=f;break}if((h|0)>=(m|0)){k=h;break c}}if((h|0)>=(m|0)){k=h;break}}}while(0);l=k+p|0;d:do if(!((j|0)>=(r|0)|(n|0)>(l|0)))do{h=d+(j<<2)|0;if(+g[h>>2]<e)g[h>>2]=e;j=j+1|0;if((j|0)>=(r|0))break d}while((c[q+(j<<2)>>2]|0)<=(l|0));while(0);h=j+1|0;if((h|0)>=(r|0))break b;n=c[q+(j<<2)>>2]|0;}}else j=0;while(0);e=+g[F+((c[E>>2]|0)+-1<<2)>>2];if((j|0)>=(r|0)){i=G;return}do{h=d+(j<<2)|0;if(+g[h>>2]<e)g[h>>2]=e;j=j+1|0;}while((j|0)!=(r|0));i=G;return}function Hc(a,b,d,e,f,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;i=i|0;var j=0,k=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0;n=c[a>>2]|0;j=c[a+4>>2]|0;p=+g[j+12+(e<<2)>>2];if((n|0)<=0)return;o=c[(c[a+12>>2]|0)+(e<<2)>>2]|0;j=j+108|0;e=(e|0)==1;m=+g[a+48>>2];l=m*.005;m=m*.0003;a=0;do{k=+g[o+(a<<2)>>2]+ +g[b+(a<<2)>>2];q=+g[j>>2];k=k>q?q:k;q=+g[d+(a<<2)>>2]+p;g[f+(a<<2)>>2]=k<q?q:k;if(e){q=k-+g[i+(a<<2)>>2];k=q+17.200000762939453;if(q>-17.200000762939453){k=1.0-l*k;if(k<0.0)k=9.999999747378752e-05;}else k=1.0-m*k;r=h+(a<<2)|0;g[r>>2]=+g[r>>2]*k;}a=a+1|0;}while((a|0)!=(n|0));return}function Ic(a,b){a=+a;b=b|0;var d=0,e=0;d=c[b+4>>2]|0;e=c[d+28>>2]|0;a=+g[e+2936>>2]*(+((c[e+(c[b+40>>2]<<2)>>2]|0)/2|0|0)/+(c[d+8>>2]|0))+a;return +(a<-9999.0?-9999.0:a);}function Jc(a,b,d,e,f,j,k,l,m){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0.0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,P=0.0,Q=0,R=0.0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,aa=0,ba=0,ca=0,da=0.0,ea=0.0;ca=i;_=c[d>>2]|0;Y=d+4|0;d=c[Y>>2]|0;if(!(c[d+500>>2]|0))Z=16;else Z=c[d+508>>2]|0;Q=c[b+132+((c[d>>2]|0)*60|0)+(a<<2)>>2]|0;R=+h[1624+(c[b+252+(a<<2)>>2]<<3)>>3];S=m<<2;T=i;i=i+((1*S|0)+15&-16)|0;U=i;i=i+((1*S|0)+15&-16)|0;V=i;i=i+((1*S|0)+15&-16)|0;W=i;i=i+((1*S|0)+15&-16)|0;X=i;i=i+((1*S|0)+15&-16)|0;ba=e+1156|0;P=+h[((_|0)>1e3?1696:1624)+(c[b+312+(a<<2)>>2]<<3)>>3];N=$(S,Z)|0;d=i;i=i+((1*N|0)+15&-16)|0;c[T>>2]=d;a=i;i=i+((1*N|0)+15&-16)|0;c[U>>2]=a;b=i;i=i+((1*N|0)+15&-16)|0;c[V>>2]=b;n=i;i=i+((1*N|0)+15&-16)|0;c[W>>2]=n;if((m|0)>1?(c[T+4>>2]=d+(Z<<2),c[U+4>>2]=a+(Z<<2),c[V+4>>2]=b+(Z<<2),c[W+4>>2]=n+(Z<<2),(m|0)!=2):0){d=2;do{J=c[U>>2]|0;K=c[V>>2]|0;L=c[W>>2]|0;M=$(d,Z)|0;c[T+(d<<2)>>2]=(c[T>>2]|0)+(M<<2);c[U+(d<<2)>>2]=J+(M<<2);c[V+(d<<2)>>2]=K+(M<<2);c[W+(d<<2)>>2]=L+(M<<2);d=d+1|0;}while((d|0)!=(m|0));}n=c[ba>>2]|0;if((_|0)>0){I=c[W>>2]|0;J=(m|0)>0;K=~Z;L=0;M=~_;while(1){H=~((M|0)>(K|0)?M:K);G=_-L|0;G=(Z|0)>(G|0)?G:Z;Yd(X|0,k|0,S|0)|0;Sd(I|0,0,N|0)|0;if(J){t=(G|0)>0;u=Q-L|0;v=0;do{p=c[j+(v<<2)>>2]|0;q=p+(L<<2)|0;if(!(c[X+(v<<2)>>2]|0)){if(t){d=c[V+(v<<2)>>2]|0;a=c[T+(v<<2)>>2]|0;b=c[U+(v<<2)>>2]|0;n=c[W+(v<<2)>>2]|0;o=0;do{g[d+(o<<2)>>2]=1.000000013351432e-10;g[a+(o<<2)>>2]=0.0;g[b+(o<<2)>>2]=0.0;c[n+(o<<2)>>2]=0;c[p+(o+L<<2)>>2]=0;o=o+1|0;}while((o|0)!=(H|0));}}else {r=c[V+(v<<2)>>2]|0;if(t){d=0;do{c[r+(d<<2)>>2]=c[1768+(c[p+(d+L<<2)>>2]<<2)>>2];d=d+1|0;}while((d|0)!=(H|0));p=c[f+(v<<2)>>2]|0;d=c[W+(v<<2)>>2]|0;if(t){a=0;do{s=+O(+(+g[p+(a+L<<2)>>2]));c[d+(a<<2)>>2]=!(s/+g[r+(a<<2)>>2]<((a|0)>=(u|0)?P:R))&1;a=a+1|0;}while((a|0)!=(G|0));if(t){d=c[T+(v<<2)>>2]|0;a=U+(v<<2)|0;o=c[a>>2]|0;n=0;do{w=p+(n+L<<2)|0;s=+g[w>>2];s=s*s;b=d+(n<<2)|0;g[b>>2]=s;g[o+(n<<2)>>2]=s;if(+g[w>>2]<0.0)g[b>>2]=-+g[b>>2];b=r+(n<<2)|0;s=+g[b>>2];g[b>>2]=s*s;n=n+1|0;}while((n|0)!=(H|0));}else aa=21;}else aa=21;}else aa=21;if((aa|0)==21){aa=0;a=U+(v<<2)|0;d=c[T+(v<<2)>>2]|0;}+Nc(c[Y>>2]|0,Q,d,c[a>>2]|0,r,0,L,G,q);}v=v+1|0;}while((v|0)!=(m|0));}n=c[ba>>2]|0;if((n|0)>0){D=(G|0)>0;E=l-L|0;F=Q-L|0;C=0;do{r=c[e+1160+(C<<2)>>2]|0;q=c[e+2184+(C<<2)>>2]|0;b=c[j+(r<<2)>>2]|0;a=b+(L<<2)|0;d=c[j+(q<<2)>>2]|0;t=c[T+(r<<2)>>2]|0;u=c[T+(q<<2)>>2]|0;w=c[U+(r<<2)>>2]|0;x=c[U+(q<<2)>>2]|0;y=c[V+(r<<2)>>2]|0;z=c[V+(q<<2)>>2]|0;A=c[W+(r<<2)>>2]|0;B=c[W+(q<<2)>>2]|0;r=X+(r<<2)|0;q=X+(q<<2)|0;if(!((c[r>>2]|0)==0?(c[q>>2]|0)==0:0)){c[q>>2]=1;c[r>>2]=1;if(D){v=0;do{do if((v|0)<(E|0)){r=A+(v<<2)|0;p=B+(v<<2)|0;if((c[r>>2]|0)==0?(c[p>>2]|0)==0:0){do if((v|0)>=(F|0)){q=t+(v<<2)|0;da=+g[q>>2];r=u+(v<<2)|0;ea=+g[r>>2];s=+O(+ea)+ +O(+da);g[w+(v<<2)>>2]=s;if(ea+da<0.0){g[q>>2]=-s;break}else {g[q>>2]=s;break}}else {r=u+(v<<2)|0;q=t+(v<<2)|0;s=+g[q>>2]+ +g[r>>2];g[q>>2]=s;g[w+(v<<2)>>2]=+O(+s);}while(0);g[x+(v<<2)>>2]=0.0;g[r>>2]=0.0;c[p>>2]=1;c[d+(v+L<<2)>>2]=0;break}o=t+(v<<2)|0;s=+O(+(+g[o>>2]));g[o>>2]=+O(+(+g[u+(v<<2)>>2]))+s;o=w+(v<<2)|0;g[o>>2]=+g[x+(v<<2)>>2]+ +g[o>>2];c[p>>2]=1;c[r>>2]=1;o=v+L|0;p=b+(o<<2)|0;r=c[p>>2]|0;o=d+(o<<2)|0;q=c[o>>2]|0;if((((r|0)>-1?r:0-r|0)|0)>(((q|0)>-1?q:0-q|0)|0)){r=(r|0)>0?r-q|0:q-r|0;c[o>>2]=r;q=c[p>>2]|0;}else {c[o>>2]=(q|0)>0?r-q|0:q-r|0;c[p>>2]=q;r=c[o>>2]|0;}if((r|0)>=(((q|0)>-1?q:0-q|0)<<1|0)){c[o>>2]=0-r;c[p>>2]=0-(c[p>>2]|0);}}while(0);r=y+(v<<2)|0;q=z+(v<<2)|0;s=+g[q>>2]+ +g[r>>2];g[q>>2]=s;g[r>>2]=s;v=v+1|0;}while((v|0)!=(H|0));}+Nc(c[Y>>2]|0,Q,t,w,y,A,L,G,a);n=c[ba>>2]|0;}C=C+1|0;}while((C|0)<(n|0));}L=L+Z|0;if((_|0)<=(L|0))break;else M=M+Z|0;}}if((n|0)>0)d=0;else {i=ca;return}do{b=k+(c[e+1160+(d<<2)>>2]<<2)|0;a=e+2184+(d<<2)|0;if(!((c[b>>2]|0)==0?(c[k+(c[a>>2]<<2)>>2]|0)==0:0)){c[b>>2]=1;c[k+(c[a>>2]<<2)>>2]=1;n=c[ba>>2]|0;}d=d+1|0;}while((d|0)<(n|0));i=ca;return}function Kc(a,b,d,e,f){a=a|0;b=+b;d=d|0;e=+e;f=+f;var h=0,j=0,k=0.0,l=0.0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0.0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;D=i;i=i+32480|0;r=D+32256|0;C=D+1792|0;s=D;A=i;i=i+((1*(d<<2)|0)+15&-16)|0;B=Ld(68)|0;Sd(C|0,0,30464)|0;p=e>0.0;q=e<0.0;t=0;do{o=t<<2;m=0;do{n=m+o|0;if((n|0)<88)k=+g[1272+(n<<2)>>2];else k=-30.0;j=n+1|0;if((j|0)<88){l=+g[1272+(j<<2)>>2];if(!(k>l))l=k;}else if(k>-30.0)l=-30.0;else l=k;j=n+2|0;if((j|0)<88){k=+g[1272+(j<<2)>>2];if(!(l>k))k=l;}else if(l>-30.0)k=-30.0;else k=l;j=n+3|0;if((j|0)<88){l=+g[1272+(j<<2)>>2];if(k>l)k=l;}else if(k>-30.0)k=-30.0;g[r+(m<<2)>>2]=k;m=m+1|0;}while((m|0)!=56);o=2792+(t*1344|0)|0;Yd(C+(t*1792|0)+448|0,o|0,224)|0;Yd(C+(t*1792|0)+672|0,2792+(t*1344|0)+224|0,224)|0;Yd(C+(t*1792|0)+896|0,2792+(t*1344|0)+448|0,224)|0;Yd(C+(t*1792|0)+1120|0,2792+(t*1344|0)+672|0,224)|0;Yd(C+(t*1792|0)+1344|0,2792+(t*1344|0)+896|0,224)|0;Yd(C+(t*1792|0)+1568|0,2792+(t*1344|0)+1120|0,224)|0;Yd(C+(t*1792|0)|0,o|0,224)|0;Yd(C+(t*1792|0)+224|0,o|0,224)|0;if(p){j=0;do{if(q){h=0;do{o=16-h|0;k=+(((o|0)>-1?o:0-o|0)|0)*f+e;k=k<0.0?0.0:k;o=C+(t*1792|0)+(j*224|0)+(h<<2)|0;g[o>>2]=+g[o>>2]+(k>0.0?0.0:k);h=h+1|0;}while((h|0)!=56);}else {h=0;do{o=16-h|0;k=+(((o|0)>-1?o:0-o|0)|0)*f+e;o=C+(t*1792|0)+(j*224|0)+(h<<2)|0;g[o>>2]=+g[o>>2]+(k<0.0?0.0:k);h=h+1|0;}while((h|0)!=56);}j=j+1|0;}while((j|0)!=8);}else {j=0;do{if(q){h=0;do{o=16-h|0;k=+(((o|0)>-1?o:0-o|0)|0)*f+e;o=C+(t*1792|0)+(j*224|0)+(h<<2)|0;g[o>>2]=+g[o>>2]+(k>0.0?0.0:k);h=h+1|0;}while((h|0)!=56);}else {h=0;do{n=16-h|0;o=C+(t*1792|0)+(j*224|0)+(h<<2)|0;g[o>>2]=+g[o>>2]+(+(((n|0)>-1?n:0-n|0)|0)*f+e);h=h+1|0;}while((h|0)!=56);}j=j+1|0;}while((j|0)!=8);}k=+g[a+(t<<2)>>2];n=0;do{l=((n|0)<2?50.0:70.0-+(n|0)*10.0)+k;j=0;do{o=C+(t*1792|0)+(n*224|0)+(j<<2)|0;g[o>>2]=+g[o>>2]+l;j=j+1|0;}while((j|0)!=56);Yd(s+(n*224|0)|0,r|0,224)|0;l=70.0-+(n|0)*10.0;j=0;do{o=s+(n*224|0)+(j<<2)|0;g[o>>2]=l+ +g[o>>2];j=j+1|0;}while((j|0)!=56);m=0;do{l=+g[C+(t*1792|0)+(n*224|0)+(m<<2)>>2];j=s+(n*224|0)+(m<<2)|0;if(l>+g[j>>2])g[j>>2]=l;m=m+1|0;}while((m|0)!=56);n=n+1|0;}while((n|0)!=8);n=1;do{h=n+-1|0;m=0;do{l=+g[s+(h*224|0)+(m<<2)>>2];j=s+(n*224|0)+(m<<2)|0;if(l<+g[j>>2])g[j>>2]=l;m=m+1|0;}while((m|0)!=56);h=0;do{k=+g[s+(n*224|0)+(h<<2)>>2];j=C+(t*1792|0)+(n*224|0)+(h<<2)|0;if(k<+g[j>>2])g[j>>2]=k;h=h+1|0;}while((h|0)!=56);n=n+1|0;}while((n|0)!=8);t=t+1|0;}while((t|0)!=17);u=b;v=(d|0)>0;w=~d;x=0;do{q=Ld(32)|0;c[B+(x<<2)>>2]=q;e=+(x|0);f=e*.5;t=~~+N(+(+Y(+(e*.34657350182533264+4.135165354540845))/u));y=~~+_(+(+Z(+(+(t|0)*b+1.0))*2.885390043258667+-11.931568145751953));t=~~+N(+(+Z(+(+(t+1|0)*b))*2.885390043258667+-11.931568145751953));y=(y|0)>(x|0)?x:y;y=(y|0)<0?0:y;t=(t|0)>16?16:t;r=(y|0)>(t|0);x=x+1|0;s=(x|0)<17;e=f+3.9657840728759766;z=0;do{a=Ld(232)|0;c[q+(z<<2)>>2]=a;if(v){m=0;do{g[A+(m<<2)>>2]=999.0;m=m+1|0;}while((m|0)!=(d|0));}if(!r){p=y;while(1){k=+(p|0)*.5;h=0;n=0;do{l=+(h|0)*.125+k;o=~~(+Y(+((l+3.9032840728759766)*.6931470036506653))/u);j=~~(+Y(+((l+4.028284072875977)*.6931470036506653))/u+1.0);m=(o|0)<0?0:o;m=(m|0)>(d|0)?d:m;m=(m|0)<(n|0)?m:n;E=(j|0)<0?0:j;if((m|0)<(d|0)?(m|0)<(((E|0)>(d|0)?d:E)|0):0){l=+g[C+(p*1792|0)+(z*224|0)+(h<<2)>>2];n=~((n|0)<(d|0)?n:d);E=(o|0)>0?~o:-1;E=(E|0)<(n|0)?n:E;o=(j|0)>0?~j:-1;o=((o|0)<(w|0)?w:o)-E|0;n=~(E+d);n=~E-(o>>>0>n>>>0?o:n)|0;do{o=A+(m<<2)|0;if(+g[o>>2]>l)g[o>>2]=l;m=m+1|0;}while((m|0)!=(n|0));}else n=m;h=h+1|0;}while((h|0)!=56);if((n|0)<(d|0)){l=+g[C+(p*1792|0)+(z*224|0)+220>>2];do{m=A+(n<<2)|0;if(+g[m>>2]>l)g[m>>2]=l;n=n+1|0;}while((n|0)!=(d|0));}if((p|0)<(t|0))p=p+1|0;else break}}if(s){h=0;m=0;do{k=+(h|0)*.125+f;n=~~(+Y(+((k+3.9032840728759766)*.6931470036506653))/u);j=~~(+Y(+((k+4.028284072875977)*.6931470036506653))/u+1.0);o=(n|0)<0?0:n;o=(o|0)>(d|0)?d:o;o=(o|0)<(m|0)?o:m;p=(j|0)<0?0:j;if((o|0)<(d|0)?(o|0)<(((p|0)>(d|0)?d:p)|0):0){l=+g[C+(x*1792|0)+(z*224|0)+(h<<2)>>2];p=~((m|0)<(d|0)?m:d);n=(n|0)>0?~n:-1;n=(n|0)<(p|0)?p:n;p=(j|0)>0?~j:-1;p=((p|0)<(w|0)?w:p)-n|0;m=~(n+d);m=~n-(p>>>0>m>>>0?p:m)|0;do{n=A+(o<<2)|0;if(+g[n>>2]>l)g[n>>2]=l;o=o+1|0;}while((o|0)!=(m|0));}else m=o;h=h+1|0;}while((h|0)!=56);if((m|0)<(d|0)){l=+g[C+(x*1792|0)+(z*224|0)+220>>2];do{j=A+(m<<2)|0;if(+g[j>>2]>l)g[j>>2]=l;m=m+1|0;}while((m|0)!=(d|0));}}n=q+(z<<2)|0;m=q+(z<<2)|0;j=q+(z<<2)|0;o=0;do{h=~~(+Y(+((e+ +(o|0)*.125)*.6931470036506653))/u);do if((h|0)>=0)if((h|0)<(d|0)){c[(c[m>>2]|0)+(o+2<<2)>>2]=c[A+(h<<2)>>2];break}else {g[(c[j>>2]|0)+(o+2<<2)>>2]=-999.0;break}else g[(c[n>>2]|0)+(o+2<<2)>>2]=-999.0;while(0);o=o+1|0;}while((o|0)!=56);do if(!(+g[a+8>>2]>-200.0))if(!(+g[a+12>>2]>-200.0))if(!(+g[a+16>>2]>-200.0))if(!(+g[a+20>>2]>-200.0))if(!(+g[a+24>>2]>-200.0))if(!(+g[a+28>>2]>-200.0))if(!(+g[a+32>>2]>-200.0))if(!(+g[a+36>>2]>-200.0))if(!(+g[a+40>>2]>-200.0))if(!(+g[a+44>>2]>-200.0))if(!(+g[a+48>>2]>-200.0))if(!(+g[a+52>>2]>-200.0))if(!(+g[a+56>>2]>-200.0))if(+g[a+60>>2]>-200.0)l=13.0;else {if(+g[a+64>>2]>-200.0){l=14.0;break}if(+g[a+68>>2]>-200.0){l=15.0;break}l=16.0;}else l=12.0;else l=11.0;else l=10.0;else l=9.0;else l=8.0;else l=7.0;else l=6.0;else l=5.0;else l=4.0;else l=3.0;else l=2.0;else l=1.0;else l=0.0;while(0);g[a>>2]=l;m=55;do{if(+g[a+(m+2<<2)>>2]>-200.0)break;m=m+-1|0;}while((m|0)>17);g[a+4>>2]=+(m|0);z=z+1|0;}while((z|0)!=8);}while((x|0)!=17);i=D;return B|0}function Lc(a,b,d,e,f,h){a=a|0;b=b|0;d=d|0;e=e|0;f=+f;h=h|0;var j=0.0,k=0.0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0.0,A=0.0;x=i;r=a<<2;s=i;i=i+((1*r|0)+15&-16)|0;t=i;i=i+((1*r|0)+15&-16)|0;u=i;i=i+((1*r|0)+15&-16)|0;v=i;i=i+((1*r|0)+15&-16)|0;w=i;i=i+((1*r|0)+15&-16)|0;n=+g[d>>2]+f;n=n<1.0?1.0:n;k=n*n*.5;n=k*n;g[s>>2]=k;g[t>>2]=k;g[u>>2]=0.0;g[v>>2]=n;g[w>>2]=0.0;if((a|0)>1){m=1;q=k;j=0.0;p=0.0;o=1.0;while(1){y=+g[d+(m<<2)>>2]+f;y=y<1.0?1.0:y;A=y*y;q=A+q;z=A*o;k=z+k;j=z*o+j;n=A*y+n;p=z*y+p;g[s+(m<<2)>>2]=q;g[t+(m<<2)>>2]=k;g[u+(m<<2)>>2]=j;g[v+(m<<2)>>2]=n;g[w+(m<<2)>>2]=p;m=m+1|0;if((m|0)==(a|0))break;else o=o+1.0;}}m=c[b>>2]|0;l=m>>16;if((l|0)>-1){j=0.0;o=0.0;n=1.0;l=0;k=0.0;}else {d=0;k=0.0;do{r=m&65535;m=0-l|0;z=+g[s+(m<<2)>>2]+ +g[s+(r<<2)>>2];n=+g[t+(r<<2)>>2]-+g[t+(m<<2)>>2];A=+g[u+(m<<2)>>2]+ +g[u+(r<<2)>>2];o=+g[v+(m<<2)>>2]+ +g[v+(r<<2)>>2];p=+g[w+(r<<2)>>2]-+g[w+(m<<2)>>2];j=o*A-p*n;o=p*z-o*n;n=A*z-n*n;z=(o*k+j)/n;g[e+(d<<2)>>2]=(z<0.0?0.0:z)-f;d=d+1|0;k=k+1.0;m=c[b+(d<<2)>>2]|0;l=m>>16;}while((l|0)<=-1);l=d;}d=m&65535;if((d|0)<(a|0)){do{r=m>>16;z=+g[s+(d<<2)>>2]-+g[s+(r<<2)>>2];n=+g[t+(d<<2)>>2]-+g[t+(r<<2)>>2];A=+g[u+(d<<2)>>2]-+g[u+(r<<2)>>2];o=+g[v+(d<<2)>>2]-+g[v+(r<<2)>>2];p=+g[w+(d<<2)>>2]-+g[w+(r<<2)>>2];j=o*A-p*n;o=p*z-o*n;n=A*z-n*n;z=(o*k+j)/n;g[e+(l<<2)>>2]=(z<0.0?0.0:z)-f;l=l+1|0;k=k+1.0;m=c[b+(l<<2)>>2]|0;d=m&65535;}while((d|0)<(a|0));m=l;}else m=l;if((m|0)<(a|0))while(1){z=(k*o+j)/n;g[e+(m<<2)>>2]=(z<0.0?0.0:z)-f;m=m+1|0;if((m|0)==(a|0))break;else k=k+1.0;}if((h|0)<1){i=x;return}b=(h|0)/2|0;m=b-h|0;if((m|0)>-1){p=j;d=0;j=0.0;}else {d=h-b|0;l=b;r=0;j=0.0;while(1){m=0-m|0;k=+g[s+(m<<2)>>2]+ +g[s+(l<<2)>>2];n=+g[t+(l<<2)>>2]-+g[t+(m<<2)>>2];z=+g[u+(m<<2)>>2]+ +g[u+(l<<2)>>2];o=+g[v+(m<<2)>>2]+ +g[v+(l<<2)>>2];A=+g[w+(l<<2)>>2]-+g[w+(m<<2)>>2];p=o*z-A*n;o=A*k-o*n;n=z*k-n*n;k=(o*j+p)/n-f;m=e+(r<<2)|0;if(k<+g[m>>2])g[m>>2]=k;r=r+1|0;j=j+1.0;m=b+r|0;if((r|0)==(d|0))break;else {l=m;m=m-h|0;}}}m=d+b|0;if((m|0)<(a|0)){l=a-b|0;while(1){r=m-h|0;k=+g[s+(m<<2)>>2]-+g[s+(r<<2)>>2];n=+g[t+(m<<2)>>2]-+g[t+(r<<2)>>2];z=+g[u+(m<<2)>>2]-+g[u+(r<<2)>>2];o=+g[v+(m<<2)>>2]-+g[v+(r<<2)>>2];A=+g[w+(m<<2)>>2]-+g[w+(r<<2)>>2];p=o*z-A*n;o=A*k-o*n;n=z*k-n*n;k=(o*j+p)/n-f;m=e+(d<<2)|0;if(k<+g[m>>2])g[m>>2]=k;d=d+1|0;j=j+1.0;if((d|0)==(l|0))break;else m=d+b|0;}}else l=d;if((l|0)<(a|0))m=l;else {i=x;return}while(1){k=(j*o+p)/n-f;l=e+(m<<2)|0;if(k<+g[l>>2])g[l>>2]=k;m=m+1|0;if((m|0)==(a|0))break;else j=j+1.0;}i=x;return}function Mc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0.0,j=0,k=0,l=0,m=0,n=0.0,o=0,p=0,q=0,r=0,s=0;s=i;o=d<<2;p=i;i=i+((1*o|0)+15&-16)|0;q=i;i=i+((1*o|0)+15&-16)|0;if((d|0)>0){o=0;e=0;}else {i=s;return}do{do if((e|0)>=2){n=+g[a+(o<<2)>>2];while(1){f=e+-1|0;h=+g[q+(f<<2)>>2];if(n<h){j=8;break}if(!((e|0)>1?(o|0)<((c[p+(f<<2)>>2]|0)+b|0):0)){j=12;break}j=e+-2|0;if(!(h<=+g[q+(j<<2)>>2])){j=12;break}if((o|0)<((c[p+(j<<2)>>2]|0)+b|0))e=f;else {j=12;break}}if((j|0)==8){c[p+(e<<2)>>2]=o;g[q+(e<<2)>>2]=n;f=e;break}else if((j|0)==12){c[p+(e<<2)>>2]=o;g[q+(e<<2)>>2]=n;f=e;break}}else {c[p+(e<<2)>>2]=o;c[q+(e<<2)>>2]=c[a+(o<<2)>>2];f=e;}while(0);e=f+1|0;o=o+1|0;}while((o|0)!=(d|0));o=f;if((o|0)<=-1){i=s;return}m=b+1|0;b=0;k=0;while(1){if((b|0)<(o|0)?(r=b+1|0,+g[q+(r<<2)>>2]>+g[q+(b<<2)>>2]):0)j=c[p+(r<<2)>>2]|0;else j=m+(c[p+(b<<2)>>2]|0)|0;if((k|0)<(((j|0)>(d|0)?d:j)|0)){l=c[q+(b<<2)>>2]|0;f=(j|0)<(d|0)?j:d;j=k;do{c[a+(j<<2)>>2]=l;j=j+1|0;}while((j|0)!=(f|0));}else f=k;b=b+1|0;if((b|0)==(e|0))break;else k=f;}i=s;return}function Nc(a,b,d,e,f,j,l,m,n){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;j=j|0;l=l|0;m=m|0;n=n|0;var o=0.0,p=0,q=0.0,r=0,s=0,t=0,u=0.0,v=0,w=0,x=0,y=0;y=i;x=i;i=i+((1*(m<<2)|0)+15&-16)|0;if(!(c[a+500>>2]|0))p=m;else p=(c[a+504>>2]|0)-l|0;if((((p|0)>(m|0)?m:p)|0)>0){r=(j|0)==0;t=(p|0)<(m|0)?p:m;s=0;do{if(!(!r?(c[j+(s<<2)>>2]|0)!=0:0))w=9;do if((w|0)==9){w=0;v=+g[d+(s<<2)>>2]<0.0;q=+Gd(+P(+(+g[e+(s<<2)>>2]/+g[f+(s<<2)>>2])));if(v){c[n+(s<<2)>>2]=~~-q;break}else {c[n+(s<<2)>>2]=~~q;break}}while(0);s=s+1|0;}while((s|0)!=(t|0));}else t=0;if((t|0)>=(m|0)){o=0.0;i=y;return +o}v=(j|0)!=0;b=b-l|0;o=0.0;s=0;do{if(!(v?(c[j+(t<<2)>>2]|0)!=0:0))w=15;do if((w|0)==15){w=0;r=e+(t<<2)|0;p=f+(t<<2)|0;u=+g[r>>2]/+g[p>>2];if(!(u<.25)|v&(t|0)<(b|0)){l=+g[d+(t<<2)>>2]<0.0;q=+Gd(+P(+u));l=~~(l?-q:q);c[n+(t<<2)>>2]=l;q=+($(l,l)|0);g[r>>2]=q*+g[p>>2];break}else {c[x+(s<<2)>>2]=r;o=u+o;s=s+1|0;break}}while(0);t=t+1|0;}while((t|0)!=(m|0));l=s;if(!l){i=y;return +o}Ed(x,l,4,9);if((l|0)<=0){i=y;return +o}u=+h[a+512>>3];t=0;do{r=c[x+(t<<2)>>2]|0;s=r-e>>2;if(!(o>=u)){p=0;q=0.0;}else {o=o+-1.0;p=~~(c[k>>2]=c[d+(s<<2)>>2]&-2147483648|1065353216,+g[k>>2]);q=+g[f+(s<<2)>>2];}c[n+(s<<2)>>2]=p;g[r>>2]=q;t=t+1|0;}while((t|0)!=(l|0));i=y;return +o}function Oc(a,b){a=a|0;b=b|0;var d=0.0,e=0.0;e=+g[c[a>>2]>>2];d=+g[c[b>>2]>>2];return (e<d&1)-(e>d&1)|0}function Pc(a){a=a|0;if(a)Md(a);return}function Qc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;if(!a)return;f=a+4|0;d=c[f>>2]|0;g=a+20|0;if((d|0)>0){b=0;do{e=c[(c[g>>2]|0)+(b<<2)>>2]|0;if(e){Md(e);d=c[f>>2]|0;}b=b+1|0;}while((b|0)<(d|0));}Md(c[g>>2]|0);b=a+24|0;d=a+28|0;if((c[b>>2]|0)>0){e=0;do{Md(c[(c[d>>2]|0)+(e<<2)>>2]|0);e=e+1|0;}while((e|0)<(c[b>>2]|0));}Md(c[d>>2]|0);Md(a);return}function Rc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;cb(b,c[a>>2]|0,24);cb(b,c[a+4>>2]|0,24);cb(b,(c[a+8>>2]|0)+-1|0,24);h=a+12|0;cb(b,(c[h>>2]|0)+-1|0,6);cb(b,c[a+20>>2]|0,8);if((c[h>>2]|0)<=0)return;g=a+24|0;f=0;i=0;do{e=g+(i<<2)|0;j=(bd(c[e>>2]|0)|0)>3;d=c[e>>2]|0;if(j){cb(b,d,3);cb(b,1,1);cb(b,c[e>>2]>>3,5);}else cb(b,d,4);e=c[e>>2]|0;if(!e)e=0;else {d=0;do{d=(e&1)+d|0;e=e>>>1;}while((e|0)!=0);e=d;}f=e+f|0;i=i+1|0;}while((i|0)<(c[h>>2]|0));if((f|0)<=0)return;d=a+280|0;e=0;do{cb(b,c[d+(e<<2)>>2]|0,8);e=e+1|0;}while((e|0)!=(f|0));return}function Sc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;m=Nd(1,2840)|0;j=c[a+28>>2]|0;c[m>>2]=hb(b,24)|0;c[m+4>>2]=hb(b,24)|0;c[m+8>>2]=(hb(b,24)|0)+1;a=hb(b,6)|0;k=m+12|0;c[k>>2]=a+1;h=hb(b,8)|0;i=m+20|0;c[i>>2]=h;a:do if((h|0)>=0){if((a|0)>-1){h=m+24|0;e=0;g=0;do{f=hb(b,3)|0;d=hb(b,1)|0;if((d|0)<0){l=26;break a}if(d){d=hb(b,5)|0;if((d|0)<0){l=26;break a}f=d<<3|f;}c[h+(g<<2)>>2]=f;if(!f)f=0;else {d=0;do{d=(f&1)+d|0;f=f>>>1;}while((f|0)!=0);f=d;}e=f+e|0;g=g+1|0;}while((g|0)<(c[k>>2]|0));f=(e|0)>0;if(f){d=m+280|0;h=0;do{a=hb(b,8)|0;if((a|0)<0)break a;c[d+(h<<2)>>2]=a;h=h+1|0;}while((h|0)<(e|0));}else f=0;}else {f=0;e=0;}g=c[i>>2]|0;h=c[j+24>>2]|0;if((g|0)<(h|0)){if(f){f=m+280|0;a=0;do{d=c[f+(a<<2)>>2]|0;if((d|0)>=(h|0))break a;a=a+1|0;if(!(c[(c[j+1824+(d<<2)>>2]|0)+12>>2]|0))break a}while((a|0)<(e|0));}a=c[j+1824+(g<<2)>>2]|0;f=c[a+4>>2]|0;a=c[a>>2]|0;if((a|0)>=1){e=c[k>>2]|0;d=a;a=1;while(1){a=$(e,a)|0;if((a|0)>(f|0))break a;if((d|0)>1)d=d+-1|0;else break}c[m+16>>2]=a;k=m;return k|0}}}else l=26;while(0);if((l|0)==26?(m|0)==0:0){k=0;return k|0}Md(m);k=0;return k|0}function Tc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;o=Nd(1,44)|0;l=c[(c[a+4>>2]|0)+28>>2]|0;c[o>>2]=b;n=c[b+12>>2]|0;c[o+4>>2]=n;l=l+2848|0;m=c[l>>2]|0;c[o+12>>2]=m;m=m+((c[b+20>>2]|0)*56|0)|0;c[o+16>>2]=m;m=c[m>>2]|0;a=Nd(n,4)|0;c[o+20>>2]=a;if((n|0)>0){k=b+24|0;f=b+280|0;d=0;b=0;e=0;do{g=k+(b<<2)|0;j=bd(c[g>>2]|0)|0;if(j){e=(j|0)>(e|0)?j:e;c[a+(b<<2)>>2]=Nd(j,4)|0;if((j|0)>0){h=c[g>>2]|0;g=a+(b<<2)|0;i=0;do{if(h&1<<i){c[(c[g>>2]|0)+(i<<2)>>2]=(c[l>>2]|0)+((c[f+(d<<2)>>2]|0)*56|0);d=d+1|0;}i=i+1|0;}while((i|0)!=(j|0));}}b=b+1|0;}while((b|0)<(n|0));}else e=0;d=o+24|0;c[d>>2]=1;g=(m|0)>0;if(g){a=1;b=0;do{a=$(a,n)|0;b=b+1|0;}while((b|0)!=(m|0));c[d>>2]=a;j=a;}else j=1;c[o+8>>2]=e;h=Ld(j<<2)|0;a=o+28|0;c[a>>2]=h;if((j|0)<=0)return o|0;i=m<<2;if(!g){a=0;do{c[h+(a<<2)>>2]=Ld(i)|0;a=a+1|0;}while((a|0)<(j|0));return o|0}d=c[a>>2]|0;a=0;do{c[h+(a<<2)>>2]=Ld(i)|0;b=c[d+(a<<2)>>2]|0;e=j;f=0;g=a;do{e=(e|0)/(n|0)|0;k=(g|0)/(e|0)|0;g=g-($(k,e)|0)|0;c[b+(f<<2)>>2]=k;f=f+1|0;}while((f|0)!=(m|0));a=a+1|0;}while((a|0)<(j|0));return o|0}function Uc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;if((f|0)>0){h=0;g=0;}else return 0;do{if(c[e+(h<<2)>>2]|0){c[d+(g<<2)>>2]=c[d+(h<<2)>>2];g=g+1|0;}h=h+1|0;}while((h|0)!=(f|0));if(!g)return 0;$c(a,b,d,g,2);return 0}function Vc(a,b,d,e,f,g,h,i){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;if((g|0)>0){b=0;i=0;}else return 0;do{if(c[f+(b<<2)>>2]|0){c[e+(i<<2)>>2]=c[e+(b<<2)>>2];i=i+1|0;}b=b+1|0;}while((b|0)!=(g|0));if(!i)return 0;ad(a,d,e,i,h);return 0}function Wc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0,u=0;if((f|0)>0){h=0;g=0;}else {m=0;return m|0}do{if(c[e+(h<<2)>>2]|0){c[d+(g<<2)>>2]=c[d+(h<<2)>>2];g=g+1|0;}h=h+1|0;}while((h|0)!=(f|0));if(!g){m=0;return m|0}o=c[b>>2]|0;p=c[o+8>>2]|0;f=c[o+12>>2]|0;q=((c[o+4>>2]|0)-(c[o>>2]|0)|0)/(p|0)|0;r=Ab(a,g<<2)|0;s=100.0/+(p|0);t=(g|0)>0;if(t){e=q<<2;h=0;do{m=Ab(a,e)|0;c[r+(h<<2)>>2]=m;Sd(m|0,0,e|0)|0;h=h+1|0;}while((h|0)!=(g|0));}if((q|0)>0){m=(p|0)>0;n=f+-1|0;i=(f|0)>1;k=0;do{j=$(k,p)|0;j=(c[o>>2]|0)+j|0;if(t){l=0;do{if(m){h=c[d+(l<<2)>>2]|0;e=0;f=0;a=0;do{u=c[h+(j+f<<2)>>2]|0;u=(u|0)>-1?u:0-u|0;a=(u|0)>(a|0)?u:a;e=u+e|0;f=f+1|0;}while((f|0)!=(p|0));h=a;}else {e=0;h=0;}a=~~(+(e|0)*s);a:do if(i){e=0;do{if((h|0)<=(c[o+2328+(e<<2)>>2]|0)?(f=c[o+2584+(e<<2)>>2]|0,(f|0)<0|(a|0)<(f|0)):0)break a;e=e+1|0;}while((e|0)<(n|0));}else e=0;while(0);c[(c[r+(l<<2)>>2]|0)+(k<<2)>>2]=e;l=l+1|0;}while((l|0)!=(g|0));}k=k+1|0;}while((k|0)!=(q|0));}m=b+40|0;c[m>>2]=(c[m>>2]|0)+1;m=r;return m|0}function Xc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;if((f|0)>0){h=0;g=0;}else return 0;do{if(c[e+(h<<2)>>2]|0){c[d+(g<<2)>>2]=c[d+(h<<2)>>2];g=g+1|0;}h=h+1|0;}while((h|0)!=(f|0));if(!g)return 0;$c(a,b,d,g,3);return 0}function Yc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if((f|0)>0){h=0;g=0;}else {n=0;return n|0}do{g=((c[e+(h<<2)>>2]|0)!=0&1)+g|0;h=h+1|0;}while((h|0)!=(f|0));if(!g){n=0;return n|0}s=c[b>>2]|0;t=c[s+8>>2]|0;e=c[s+12>>2]|0;q=((c[s+4>>2]|0)-(c[s>>2]|0)|0)/(t|0)|0;r=Ab(a,4)|0;n=q<<2;m=Ab(a,n)|0;c[r>>2]=m;Sd(m|0,0,n|0)|0;if((q|0)>0){o=(t|0)>0;p=e+-1|0;k=(e|0)>1;l=c[r>>2]|0;m=(f|0)>1;n=0;a=(c[s>>2]|0)/(f|0)|0;while(1){if(o){i=c[d>>2]|0;h=0;j=0;e=0;do{g=c[i+(a<<2)>>2]|0;g=(g|0)>-1?g:0-g|0;e=(g|0)>(e|0)?g:e;if(m){g=1;do{u=c[(c[d+(g<<2)>>2]|0)+(a<<2)>>2]|0;u=(u|0)>-1?u:0-u|0;h=(u|0)>(h|0)?u:h;g=g+1|0;}while((g|0)!=(f|0));}a=a+1|0;j=j+f|0;}while((j|0)<(t|0));g=a;}else {h=0;g=a;e=0;}a:do if(k){a=0;do{if((e|0)<=(c[s+2328+(a<<2)>>2]|0)?(h|0)<=(c[s+2584+(a<<2)>>2]|0):0)break a;a=a+1|0;}while((a|0)<(p|0));}else a=0;while(0);c[l+(n<<2)>>2]=a;n=n+1|0;if((n|0)==(q|0))break;else a=g;}}n=b+40|0;c[n>>2]=(c[n>>2]|0)+1;n=r;return n|0}function Zc(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;r=i;i=i+16|0;q=r;j=c[b+36>>2]|0;p=(j|0)/2|0;o=Ab(b,$(g<<2,p)|0)|0;c[q>>2]=o;if((g|0)<=0){i=r;return 0}l=(j|0)>1;n=0;j=0;do{m=c[e+(n<<2)>>2]|0;j=((c[f+(n<<2)>>2]|0)!=0&1)+j|0;if(l){b=0;k=n;while(1){c[o+(k<<2)>>2]=c[m+(b<<2)>>2];b=b+1|0;if((b|0)>=(p|0))break;else k=k+g|0;}}n=n+1|0;}while((n|0)!=(g|0));if(!j){i=r;return 0}ad(a,d,q,1,h);i=r;return 0}function _c(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;u=c[b>>2]|0;v=c[u+8>>2]|0;w=b+16|0;x=c[c[w>>2]>>2]|0;g=($(c[a+36>>2]|0,f)|0)>>1;t=c[u+4>>2]|0;g=((t|0)<(g|0)?t:g)-(c[u>>2]|0)|0;if((g|0)<=0)return 0;s=(g|0)/(v|0)|0;t=Ab(a,((x+-1+s|0)/(x|0)|0)<<2)|0;a:do if((f|0)>0){g=0;do{if(c[e+(g<<2)>>2]|0)break a;g=g+1|0;}while((g|0)<(f|0));}else g=0;while(0);if((g|0)==(f|0))return 0;q=b+8|0;e=c[q>>2]|0;if((e|0)<=0)return 0;r=(s|0)>0;m=a+4|0;n=u+16|0;o=b+28|0;p=(x|0)>0;l=b+20|0;k=0;b:while(1){if(r){h=(k|0)==0;i=1<<k;a=0;j=0;while(1){if(h){e=Lb(c[w>>2]|0,m)|0;if((e|0)==-1){g=23;break b}if((e|0)>=(c[n>>2]|0)){g=23;break b}g=c[(c[o>>2]|0)+(e<<2)>>2]|0;c[t+(j<<2)>>2]=g;if(!g){g=23;break b}}if(p&(a|0)<(s|0)){g=t+(j<<2)|0;e=0;do{b=c[(c[g>>2]|0)+(e<<2)>>2]|0;if(((c[u+24+(b<<2)>>2]&i|0)!=0?(y=c[(c[(c[l>>2]|0)+(b<<2)>>2]|0)+(k<<2)>>2]|0,(y|0)!=0):0)?(b=$(a,v)|0,(Ob(y,d,(c[u>>2]|0)+b|0,f,m,v)|0)==-1):0){g=23;break b}e=e+1|0;a=a+1|0;}while((e|0)<(x|0)&(a|0)<(s|0));}if((a|0)<(s|0))j=j+1|0;else break}e=c[q>>2]|0;}k=k+1|0;if((k|0)>=(e|0)){g=23;break}}if((g|0)==23)return 0;return 0}function $c(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;A=c[b>>2]|0;B=c[A+8>>2]|0;C=b+16|0;D=c[c[C>>2]>>2]|0;g=c[a+36>>2]>>1;z=c[A+4>>2]|0;g=((z|0)<(g|0)?z:g)-(c[A>>2]|0)|0;if((g|0)<=0){i=F;return}x=(g|0)/(B|0)|0;y=i;i=i+((1*(e<<2)|0)+15&-16)|0;z=(e|0)>0;if(z){g=((D+-1+x|0)/(D|0)|0)<<2;h=0;do{c[y+(h<<2)>>2]=Ab(a,g)|0;h=h+1|0;}while((h|0)!=(e|0));}v=b+8|0;if((c[v>>2]|0)<=0){i=F;return}w=(x|0)>0;r=a+4|0;s=A+16|0;t=b+28|0;u=(D|0)>0;m=b+20|0;l=z^1;q=0;a:while(1){if(w){n=1<<q;o=(q|0)!=0|l;b=0;p=0;while(1){if(!o){h=0;do{a=Lb(c[C>>2]|0,r)|0;if((a|0)==-1){g=25;break a}if((a|0)>=(c[s>>2]|0)){g=25;break a}g=c[(c[t>>2]|0)+(a<<2)>>2]|0;c[(c[y+(h<<2)>>2]|0)+(p<<2)>>2]=g;h=h+1|0;if(!g){g=25;break a}}while((h|0)<(e|0));}b:do if(u&(b|0)<(x|0)){if(z)k=0;else {a=0;while(1){a=a+1|0;b=b+1|0;if(!((a|0)<(D|0)&(b|0)<(x|0)))break b}}do{h=$(b,B)|0;j=0;do{a=(c[A>>2]|0)+h|0;g=c[(c[(c[y+(j<<2)>>2]|0)+(p<<2)>>2]|0)+(k<<2)>>2]|0;if(((c[A+24+(g<<2)>>2]&n|0)!=0?(E=c[(c[(c[m>>2]|0)+(g<<2)>>2]|0)+(q<<2)>>2]|0,(E|0)!=0):0)?(La[f&3](E,(c[d+(j<<2)>>2]|0)+(a<<2)|0,r,B)|0)==-1:0){g=25;break a}j=j+1|0;}while((j|0)<(e|0));k=k+1|0;b=b+1|0;}while((k|0)<(D|0)&(b|0)<(x|0));}while(0);if((b|0)<(x|0))p=p+1|0;else break}}q=q+1|0;if((q|0)>=(c[v>>2]|0)){g=25;break}}if((g|0)==25){i=F;return}}
function ad(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0;ma=i;i=i+1088|0;ja=ma+1056|0;ia=ma+1024|0;ka=ma+512|0;la=ma;V=c[d>>2]|0;ba=c[V+8>>2]|0;ea=c[V+12>>2]|0;fa=d+16|0;ga=c[c[fa>>2]>>2]|0;W=((c[V+4>>2]|0)-(c[V>>2]|0)|0)/(ba|0)|0;Sd(ka|0,0,512)|0;Sd(la|0,0,512)|0;X=d+8|0;h=c[X>>2]|0;if((h|0)<=0){i=ma;return}Y=(W|0)>0;Z=(f|0)>0;_=(ga|0)>1;aa=d+36|0;ca=(ga|0)>0;da=d+20|0;T=d+32|0;U=0-ga|0;S=0;do{if(Y){P=(S|0)==0;Q=1<<S;R=P&Z;h=0;do{a:do if(R){if(_)m=0;else {k=0;while(1){d=c[(c[g+(k<<2)>>2]|0)+(h<<2)>>2]|0;j=c[fa>>2]|0;if((d|0)<(c[j+4>>2]|0)){O=Kb(j,d,b)|0;c[aa>>2]=(c[aa>>2]|0)+O;}k=k+1|0;if((k|0)==(f|0))break a}}do{d=c[g+(m<<2)>>2]|0;l=1;k=c[d+(h<<2)>>2]|0;do{k=$(k,ea)|0;j=l+h|0;if((j|0)<(W|0))k=(c[d+(j<<2)>>2]|0)+k|0;l=l+1|0;}while((l|0)!=(ga|0));d=c[fa>>2]|0;if((k|0)<(c[d+4>>2]|0)){O=Kb(d,k,b)|0;c[aa>>2]=(c[aa>>2]|0)+O;}m=m+1|0;}while((m|0)!=(f|0));}while(0);if(ca&(h|0)<(W|0)){O=h-W|0;O=O>>>0<U>>>0?U:O;J=0-O|0;L=h;N=0;while(1){K=$(L,ba)|0;K=(c[V>>2]|0)+K|0;if(Z){M=0;do{I=g+(M<<2)|0;k=c[I>>2]|0;l=c[k+(L<<2)>>2]|0;if(P){H=la+(l<<2)|0;c[H>>2]=(c[H>>2]|0)+ba;}if((c[V+24+(l<<2)>>2]&Q|0)!=0?(ha=c[(c[(c[da>>2]|0)+(l<<2)>>2]|0)+(S<<2)>>2]|0,(ha|0)!=0):0){F=c[e+(M<<2)>>2]|0;G=c[ha>>2]|0;H=(ba|0)/(G|0)|0;if((H|0)>0){A=ha+48|0;B=ha+52|0;C=ha+44|0;D=ha+12|0;E=ha+4|0;z=G;l=0;m=0;while(1){w=($(m,G)|0)+K|0;k=F+(w<<2)|0;t=c[A>>2]|0;x=c[B>>2]|0;u=c[C>>2]|0;s=u>>1;c[ja>>2]=0;c[ja+4>>2]=0;c[ja+8>>2]=0;c[ja+12>>2]=0;c[ja+16>>2]=0;c[ja+20>>2]=0;c[ja+24>>2]=0;c[ja+28>>2]=0;y=(z|0)>0;do if((x|0)==1){if(!y){d=0;break}p=u+-1|0;q=0;d=0;r=z;do{r=r+-1|0;o=c[F+(w+r<<2)>>2]|0;n=o-t|0;if((n|0)<(s|0))n=(s-n<<1)+-1|0;else n=n-s<<1;d=$(d,u)|0;d=((n|0)<0?0:(n|0)>=(u|0)?p:n)+d|0;c[ja+(r<<2)>>2]=o;q=q+1|0;}while((q|0)!=(z|0));}else {if(!y){d=0;break}p=(x>>1)-t|0;n=u+-1|0;q=0;d=0;r=z;do{r=r+-1|0;j=(p+(c[F+(w+r<<2)>>2]|0)|0)/(x|0)|0;if((j|0)<(s|0))o=(s-j<<1)+-1|0;else o=j-s<<1;d=$(d,u)|0;d=((o|0)<0?0:(o|0)>=(u|0)?n:o)+d|0;c[ja+(r<<2)>>2]=($(j,x)|0)+t;q=q+1|0;}while((q|0)!=(z|0));}while(0);v=c[(c[D>>2]|0)+8>>2]|0;do if((a[v+d>>0]|0)<1){c[ia>>2]=0;c[ia+4>>2]=0;c[ia+8>>2]=0;c[ia+12>>2]=0;c[ia+16>>2]=0;c[ia+20>>2]=0;c[ia+24>>2]=0;c[ia+28>>2]=0;s=($(u+-1|0,x)|0)+t|0;q=c[E>>2]|0;if((q|0)>0){r=-1;u=0;}else break;while(1){do if((a[v+u>>0]|0)>0){if(y){o=0;j=0;do{p=(c[ia+(o<<2)>>2]|0)-(c[F+(w+o<<2)>>2]|0)|0;j=($(p,p)|0)+j|0;o=o+1|0;}while((o|0)!=(z|0));}else j=0;if(!((r|0)==-1|(j|0)<(r|0))){j=r;break};c[ja>>2]=c[ia>>2];c[ja+4>>2]=c[ia+4>>2];c[ja+8>>2]=c[ia+8>>2];c[ja+12>>2]=c[ia+12>>2];c[ja+16>>2]=c[ia+16>>2];c[ja+20>>2]=c[ia+20>>2];c[ja+24>>2]=c[ia+24>>2];c[ja+28>>2]=c[ia+28>>2];d=u;}else j=r;while(0);n=c[ia>>2]|0;if((n|0)<(s|0))o=ia;else {n=ia;p=0;while(1){p=p+1|0;c[n>>2]=0;o=ia+(p<<2)|0;n=c[o>>2]|0;if((n|0)<(s|0))break;else n=o;}}if((n|0)>-1){n=n+x|0;c[o>>2]=n;}c[o>>2]=0-n;u=u+1|0;if((u|0)==(q|0))break;else r=j;}}while(0);if(y&(d|0)>-1){j=0;while(1){c[k>>2]=(c[k>>2]|0)-(c[ja+(j<<2)>>2]|0);j=j+1|0;if((j|0)==(z|0))break;else k=k+4|0;}}l=(Kb(ha,d,b)|0)+l|0;m=m+1|0;if((m|0)==(H|0))break;z=c[ha>>2]|0;}k=c[I>>2]|0;}else l=0;c[T>>2]=(c[T>>2]|0)+l;I=ka+(c[k+(L<<2)>>2]<<2)|0;c[I>>2]=(c[I>>2]|0)+l;}M=M+1|0;}while((M|0)!=(f|0));}N=N+1|0;if((N|0)==(J|0))break;else L=L+1|0;}h=h-O|0;}}while((h|0)<(W|0));h=c[X>>2]|0;}S=S+1|0;}while((S|0)<(h|0));i=ma;return}function bd(a){a=a|0;var b=0;if(!a)a=0;else {b=a;a=0;do{b=b>>>1;a=a+1|0;}while((b|0)!=0);}return a|0}function cd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;u=i;i=i+144|0;s=u;q=(e|0)!=0;f=Ld((q?e:d)<<2)|0;Sd(s|0,0,132)|0;r=(d|0)>0;do if(r){p=s+4|0;n=(e|0)==0&1;e=0;o=0;a:while(1){m=a[b+o>>0]|0;g=m<<24>>24;b:do if(m<<24>>24>0){j=c[s+(g<<2)>>2]|0;if(!(m<<24>>24>31|(j>>>g|0)==0)){t=5;break a}c[f+(e<<2)>>2]=j;m=s+(g<<2)|0;c:do if(!(j&1)){h=j;k=g;while(1){c[m>>2]=h+1;l=k+-1|0;if((k|0)<=1)break c;h=c[s+(l<<2)>>2]|0;m=s+(l<<2)|0;if(h&1){t=8;break}else k=l;}}else {l=g;t=8;}while(0);do if((t|0)==8){t=0;if((l|0)==1){c[p>>2]=(c[p>>2]|0)+1;break}else {c[m>>2]=c[s+(l+-1<<2)>>2]<<1;break}}while(0);m=g+1|0;if((m|0)<33){l=g;k=m;while(1){m=s+(k<<2)|0;h=j;j=c[m>>2]|0;if((j>>>1|0)!=(h|0)){k=1;break b}c[m>>2]=c[s+(l<<2)>>2]<<1;m=k+1|0;if((m|0)>=33){k=1;break}else {l=k;k=m;}}}else k=1;}else k=n;while(0);e=e+k|0;o=o+1|0;if((o|0)>=(d|0)){t=16;break}}if((t|0)==5){Md(f);o=0;i=u;return o|0}else if((t|0)==16){if((e|0)!=1){e=1;t=27;break}if((c[s+8>>2]|0)==2)break;else {e=1;t=27;break}}}else {e=1;t=27;}while(0);d:do if((t|0)==27){while(1){if(c[s+(e<<2)>>2]&-1>>>(32-e|0))break;e=e+1|0;if((e|0)>=33)break d;else t=27;}Md(f);o=0;i=u;return o|0}while(0);if(!r){o=f;i=u;return o|0}if(q){g=0;m=0;}else {l=0;k=0;while(1){g=a[b+k>>0]|0;if(g<<24>>24>0){j=c[f+(l<<2)>>2]|0;e=g<<24>>24;h=0;g=0;do{g=j>>>h&1|g<<1;h=h+1|0;}while((h|0)<(e|0));}else g=0;c[f+(l<<2)>>2]=g;k=k+1|0;if((k|0)==(d|0))break;else l=l+1|0;}i=u;return f|0}do{l=a[b+m>>0]|0;if(l<<24>>24>0){h=c[f+(g<<2)>>2]|0;j=l<<24>>24;k=0;e=0;do{e=h>>>k&1|e<<1;k=k+1|0;}while((k|0)<(j|0));}else e=0;if(l<<24>>24){c[f+(g<<2)>>2]=e;g=g+1|0;}m=m+1|0;}while((m|0)!=(d|0));i=u;return f|0}function dd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;h=c[a+4>>2]|0;g=c[a>>2]|0;if((g|0)<=0)while(1){}a=~~+N(+(+Q(+(+(h|0)),+(1.0/+(g|0)))));while(1){e=a+1|0;d=1;b=1;f=0;do{d=$(d,a)|0;b=$(b,e)|0;f=f+1|0;}while((f|0)<(g|0));if((d|0)<=(h|0)&(b|0)>(h|0))break;a=a+((d|0)>(h|0)?-1:1)|0;}return a|0}function ed(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,l=0.0,m=0,n=0,o=0.0,p=0,q=0,r=0.0,s=0.0,t=0,u=0,v=0,w=0,x=0,y=0;f=c[b+12>>2]|0;if((f+-1|0)>>>0>=2){p=0;return p|0}y=c[b+16>>2]|0;r=+(y&2097151|0);r=+Dd((y|0)<0?-r:r,(y>>>21&1023)+-788|0);y=c[b+20>>2]|0;s=+(y&2097151|0);s=+Dd((y|0)<0?-s:s,(y>>>21&1023)+-788|0);y=c[b>>2]|0;d=Nd($(y,d)|0,4)|0;if((f|0)==1){x=c[b+4>>2]|0;if((y|0)<=0)while(1){}k=~~+N(+(+Q(+(+(x|0)),+(1.0/+(y|0)))));while(1){i=k+1|0;h=1;f=1;j=0;do{h=$(h,k)|0;f=$(f,i)|0;j=j+1|0;}while((j|0)!=(y|0));if((f|0)>(x|0)&(h|0)<=(x|0))break;k=((h|0)>(x|0)?-1:1)+k|0;}if((x|0)<=0){p=d;return p|0}t=(e|0)==0;q=b+8|0;p=b+32|0;w=b+28|0;h=0;v=0;do{if(t){f=c[p>>2]|0;m=$(y,h)|0;if(!(c[w>>2]|0)){j=1;i=0;do{g[d+(m+i<<2)>>2]=r+ +O(+(+(c[f+((((v|0)/(j|0)|0|0)%(k|0)|0)<<2)>>2]|0)))*s;j=$(j,k)|0;i=i+1|0;}while((i|0)<(y|0));u=21;}else {j=1;i=0;l=0.0;do{l=l+r+ +O(+(+(c[f+((((v|0)/(j|0)|0|0)%(k|0)|0)<<2)>>2]|0)))*s;g[d+(m+i<<2)>>2]=l;j=$(j,k)|0;i=i+1|0;}while((i|0)<(y|0));u=21;}}else if(a[(c[q>>2]|0)+v>>0]|0){m=c[p>>2]|0;j=(c[w>>2]|0)==0;i=$(c[e+(h<<2)>>2]|0,y)|0;f=1;n=0;o=0.0;while(1){l=o+r+ +O(+(+(c[m+((((v|0)/(f|0)|0|0)%(k|0)|0)<<2)>>2]|0)))*s;g[d+(i+n<<2)>>2]=l;f=$(f,k)|0;n=n+1|0;if((n|0)>=(y|0)){u=21;break}else o=j?o:l;}}if((u|0)==21){u=0;h=h+1|0;}v=v+1|0;}while((v|0)<(x|0));return d|0}else if((f|0)==2){t=c[b+4>>2]|0;if((t|0)<=0){p=d;return p|0}u=(e|0)!=0;v=b+8|0;w=b+32|0;p=b+28|0;q=(y|0)>0;h=0;b=0;do{if(!(u?(a[(c[v>>2]|0)+b>>0]|0)==0:0)){if(q){n=c[w>>2]|0;m=(c[p>>2]|0)==0;k=e+(h<<2)|0;j=$(y,b)|0;i=$(y,h)|0;f=0;l=0.0;while(1){o=l+r+ +O(+(+(c[n+(j+f<<2)>>2]|0)))*s;if(u)g[d+(($(c[k>>2]|0,y)|0)+f<<2)>>2]=o;else g[d+(i+f<<2)>>2]=o;f=f+1|0;if((f|0)>=(y|0))break;else l=m?l:o;}}h=h+1|0;}b=b+1|0;}while((b|0)<(t|0));return d|0}else {p=d;return p|0}return 0}function fd(a){a=a|0;var b=0;if(!(c[a+36>>2]|0))return;b=c[a+32>>2]|0;if(b)Md(b);b=c[a+8>>2]|0;if(b)Md(b);Md(a);return}function gd(a){a=a|0;var b=0;b=c[a+16>>2]|0;if(b)Md(b);b=c[a+20>>2]|0;if(b)Md(b);b=c[a+24>>2]|0;if(b)Md(b);b=c[a+28>>2]|0;if(b)Md(b);b=c[a+32>>2]|0;if(b)Md(b);b=a;a=b+56|0;do{c[b>>2]=0;b=b+4|0;}while((b|0)<(a|0));return}function hd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0.0;d=a;e=d+56|0;do{c[d>>2]=0;d=d+4|0;}while((d|0)<(e|0));c[a+12>>2]=b;i=b+4|0;j=c[i>>2]|0;c[a+4>>2]=j;c[a+8>>2]=j;c[a>>2]=c[b>>2];c[a+20>>2]=cd(c[b+8>>2]|0,j,0)|0;i=c[i>>2]|0;j=c[b>>2]|0;if((j|0)<=0)while(1){}d=~~+N(+(+Q(+(+(i|0)),+(1.0/+(j|0)))));while(1){g=d+1|0;f=1;e=1;h=0;do{f=$(f,d)|0;e=$(e,g)|0;h=h+1|0;}while((h|0)!=(j|0));if((e|0)>(i|0)&(f|0)<=(i|0))break;d=((f|0)>(i|0)?-1:1)+d|0;}c[a+44>>2]=d;d=c[b+16>>2]|0;k=+(d&2097151|0);c[a+48>>2]=~~+Hd(+Dd((d|0)<0?-k:k,(d>>>21&1023)+-788|0));d=c[b+20>>2]|0;k=+(d&2097151|0);c[a+52>>2]=~~+Hd(+Dd((d|0)<0?-k:k,(d>>>21&1023)+-788|0));return 0}function id(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;s=i;e=b;f=e+56|0;do{c[e>>2]=0;e=e+4|0;}while((e|0)<(f|0));p=d+4|0;h=c[p>>2]|0;if((h|0)>0){e=c[d+8>>2]|0;g=0;f=0;do{f=((a[e+g>>0]|0)>0&1)+f|0;g=g+1|0;}while((g|0)<(h|0));}else f=0;c[b+4>>2]=h;n=b+8|0;c[n>>2]=f;c[b>>2]=c[d>>2];if((f|0)<=0){n=0;i=s;return n|0}m=d+8|0;k=cd(c[m>>2]|0,h,f)|0;l=f<<2;e=i;i=i+((1*l|0)+15&-16)|0;if(!k){e=c[b+16>>2]|0;if(e)Md(e);e=c[b+20>>2]|0;if(e)Md(e);e=c[b+24>>2]|0;if(e)Md(e);e=c[b+28>>2]|0;if(e)Md(e);e=c[b+32>>2]|0;if(e)Md(e);e=b;f=e+56|0;do{c[e>>2]=0;e=e+4|0;}while((e|0)<(f|0));n=-1;i=s;return n|0}else g=0;do{j=k+(g<<2)|0;h=c[j>>2]|0;h=h>>>16|h<<16;h=h>>>8&16711935|h<<8&-16711936;h=h>>>4&252645135|h<<4&-252645136;h=h>>>2&858993459|h<<2&-858993460;c[j>>2]=h>>>1&1431655765|h<<1&-1431655766;c[e+(g<<2)>>2]=j;g=g+1|0;}while((g|0)!=(f|0));Ed(e,f,4,10);o=i;i=i+((1*l|0)+15&-16)|0;g=Ld(l)|0;r=b+20|0;c[r>>2]=g;j=k;h=0;do{c[o+((c[e+(h<<2)>>2]|0)-j>>2<<2)>>2]=h;h=h+1|0;}while((h|0)!=(f|0));h=0;do{c[g+(c[o+(h<<2)>>2]<<2)>>2]=c[k+(h<<2)>>2];h=h+1|0;}while((h|0)!=(f|0));Md(k);c[b+16>>2]=ed(d,f,o)|0;f=Ld(l)|0;c[b+24>>2]=f;e=c[p>>2]|0;l=(e|0)>0;if(l){h=c[m>>2]|0;j=0;g=0;do{if((a[h+j>>0]|0)>0){c[f+(c[o+(g<<2)>>2]<<2)>>2]=j;g=g+1|0;}j=j+1|0;}while((j|0)<(e|0));}else g=0;d=b+28|0;c[d>>2]=Ld(g)|0;g=b+40|0;c[g>>2]=0;if(l){e=0;h=c[m>>2]|0;k=0;l=0;while(1){j=a[h+k>>0]|0;if(j<<24>>24>0){f=l+1|0;a[(c[d>>2]|0)+(c[o+(l<<2)>>2]|0)>>0]=j;j=c[m>>2]|0;h=a[j+k>>0]|0;e=c[g>>2]|0;if((h|0)>(e|0)){c[g>>2]=h;e=h;}}else {j=h;f=l;}k=k+1|0;if((k|0)>=(c[p>>2]|0))break;else {h=j;l=f;}}if((f|0)==1)if((e|0)==1){c[b+36>>2]=1;n=Nd(2,4)|0;c[b+32>>2]=n;c[n+4>>2]=1;c[n>>2]=1;n=0;i=s;return n|0}else p=1;else p=f;}else p=0;f=c[n>>2]|0;if(!f)f=-4;else {e=0;while(1){f=f>>>1;if(!f){f=e;break}else e=e+1|0;}f=f+-3|0;}o=b+36|0;k=(f|0)<5?5:f;k=(k|0)>8?8:k;c[o>>2]=k;m=1<<k;n=Nd(m,4)|0;c[b+32>>2]=n;if((p|0)>0){f=k;l=0;do{e=(c[d>>2]|0)+l|0;h=a[e>>0]|0;if((f|0)>=(h|0)?(q=c[(c[r>>2]|0)+(l<<2)>>2]|0,q=q>>>16|q<<16,q=q>>>8&16711935|q<<8&-16711936,q=q>>>4&252645135|q<<4&-252645136,q=q>>>2&858993459|q<<2&-858993460,q=q>>>1&1431655765|q<<1&-1431655766,(f-h|0)!=31):0){g=l+1|0;j=0;do{c[n+((q|j<<h)<<2)>>2]=g;j=j+1|0;f=c[o>>2]|0;h=a[e>>0]|0;}while((j|0)<(1<<f-h|0));}l=l+1|0;}while((l|0)!=(p|0));}else f=k;d=-2<<31-f;if((k|0)==31){n=0;i=s;return n|0}else {g=0;e=0;h=0;}while(1){j=e<<32-f;l=j>>>16|j<<16;l=l>>>8&16711935|l<<8&-16711936;l=l>>>4&252645135|l<<4&-252645136;l=l>>>2&858993459|l<<2&-858993460;l=n+((l>>>1&1431655765|l<<1&-1431655766)<<2)|0;if(!(c[l>>2]|0)){f=h;while(1){h=f+1|0;if((h|0)>=(p|0))break;if((c[(c[r>>2]|0)+(h<<2)>>2]|0)>>>0>j>>>0)break;else f=h;}a:do if((p|0)>(g|0)){h=c[r>>2]|0;do{if(j>>>0<(c[h+(g<<2)>>2]&d)>>>0)break a;g=g+1|0;}while((p|0)>(g|0));}while(0);h=p-g|0;c[l>>2]=(f>>>0>32767?-1073774592:f<<15|-2147483648)|(h>>>0>32767?32767:h);h=f;}e=e+1|0;if((e|0)>=(m|0)){e=0;break}f=c[o>>2]|0;}i=s;return e|0}function jd(a,b){a=a|0;b=b|0;var d=0;d=c[c[a>>2]>>2]|0;a=c[c[b>>2]>>2]|0;return (d>>>0>a>>>0&1)-(d>>>0<a>>>0&1)|0}function kd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;p=c[a>>2]|0;if((p|0)==1)return;q=c[a+4>>2]|0;j=c[a+8>>2]|0;k=c[j+4>>2]|0;if((k|0)<=0)return;l=k+1|0;i=p+-1|0;m=p;n=0;o=p;a=1;do{e=c[j+(l-n<<2)>>2]|0;g=(p|0)/(o|0)|0;o=(o|0)/(e|0)|0;d=$(g,o)|0;m=m-($(g,e+-1|0)|0)|0;h=1-a|0;do if((e|0)==2){a=q+(i+m<<2)|0;if(!h){od(g,o,b,q,a);a=0;break}else {od(g,o,q,b,a);a=h;break}}else if((e|0)==4){e=m+g|0;a=q+(i+m<<2)|0;d=q+(i+e<<2)|0;e=q+(i+g+e<<2)|0;if(!h){nd(g,o,b,q,a,d,e);a=0;break}else {nd(g,o,q,b,a,d,e);a=h;break}}else {f=q+(i+m<<2)|0;if(!(((g|0)==1?a:h)|0)){pd(g,e,o,d,b,b,b,q,q,f);a=1;break}else {pd(g,e,o,d,q,q,q,b,b,f);a=0;break}}while(0);n=n+1|0;}while((n|0)!=(k|0));if((p|0)>0&(a|0)!=1)a=0;else return;do{c[b+(a<<2)>>2]=c[q+(a<<2)>>2];a=a+1|0;}while((a|0)!=(p|0));return}function ld(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0.0,o=0.0,p=0,q=0,r=0,s=0,t=0.0,u=0,v=0,w=0.0;c[a>>2]=b;u=Nd(b*3|0,4)|0;c[a+4>>2]=u;v=Nd(32,4)|0;c[a+8>>2]=v;if((b|0)==1)return;l=v+8|0;a=-1;e=0;f=b;d=0;a:while(1){j=a+1|0;if((j|0)<4)k=c[25768+(j<<2)>>2]|0;else k=d+2|0;i=(k|0)!=2;m=e;h=f;while(1){a=m+1|0;f=h;h=(h|0)/(k|0)|0;if((f|0)!=($(h,k)|0)){a=j;e=m;d=k;continue a}c[v+(m+2<<2)>>2]=k;d=(m|0)==0;if(!(i|d)){if((m|0)>=1){e=1;do{f=a-e|0;c[v+(f+2<<2)>>2]=c[v+(f+1<<2)>>2];e=e+1|0;}while((e|0)!=(a|0));}c[l>>2]=2;}if((h|0)==1)break a;else m=a;}}c[v>>2]=b;c[v+4>>2]=a;t=6.2831854820251465/+(b|0);if(!((m|0)>0&(d^1)))return;q=b+1|0;d=0;r=0;s=1;do{f=c[v+(r+2<<2)>>2]|0;p=s;s=$(f,s)|0;e=(b|0)/(s|0)|0;if((f|0)>1){a=(e|0)>2;l=f+-1|0;i=d;h=0;f=0;while(1){f=f+p|0;n=+(f|0)*t;if(a){o=0.0;k=i;j=2;while(1){o=o+1.0;w=n*o;g[u+(k+b<<2)>>2]=+R(+w);g[u+(q+k<<2)>>2]=+S(+w);j=j+2|0;if((j|0)>=(e|0))break;else k=k+2|0;}}h=h+1|0;if((h|0)==(l|0))break;else i=i+e|0;}d=($(e,l)|0)+d|0;}r=r+1|0;}while((r|0)!=(m|0));return}function md(a){a=a|0;var b=0;if(!a)return;b=c[a+4>>2]|0;if(b)Md(b);b=c[a+8>>2]|0;if(b)Md(b);c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;return}function nd(a,b,c,d,e,f,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0;r=$(b,a)|0;q=r<<1;p=(b|0)>0;if(p){o=(a<<2)+-1|0;n=a<<1;m=0;l=r;k=r*3|0;j=0;i=q;while(1){t=c+(l<<2)|0;u=c+(k<<2)|0;x=+g[u>>2]+ +g[t>>2];w=c+(j<<2)|0;v=c+(i<<2)|0;y=+g[v>>2]+ +g[w>>2];s=j<<2;g[d+(s<<2)>>2]=y+x;g[d+(o+s<<2)>>2]=y-x;s=s+n|0;g[d+(s+-1<<2)>>2]=+g[w>>2]-+g[v>>2];g[d+(s<<2)>>2]=+g[u>>2]-+g[t>>2];m=m+1|0;if((m|0)==(b|0))break;else {l=l+a|0;k=k+a|0;j=j+a|0;i=i+a|0;}}}if((a|0)<2)return;if((a|0)!=2){if(p){o=a<<1;m=0;l=0;while(1){i=l<<2;n=2;k=l;j=i;i=i+o|0;do{u=k;k=k+2|0;t=j;j=j+2|0;s=i;i=i+-2|0;v=k+r|0;G=n+-2|0;B=+g[e+(G<<2)>>2];F=+g[c+(v+-1<<2)>>2];w=n+-1|0;E=+g[e+(w<<2)>>2];x=+g[c+(v<<2)>>2];C=x*E+F*B;F=x*B-E*F;v=v+r|0;E=+g[f+(G<<2)>>2];B=+g[c+(v+-1<<2)>>2];x=+g[f+(w<<2)>>2];z=+g[c+(v<<2)>>2];D=z*x+B*E;B=z*E-x*B;v=v+r|0;x=+g[h+(G<<2)>>2];E=+g[c+(v+-1<<2)>>2];z=+g[h+(w<<2)>>2];A=+g[c+(v<<2)>>2];y=A*z+E*x;E=A*x-z*E;z=y+C;C=y-C;y=E+F;E=F-E;F=+g[c+(k<<2)>>2];x=F+B;B=F-B;F=+g[c+(u+1<<2)>>2];A=F+D;D=F-D;g[d+((t|1)<<2)>>2]=z+A;g[d+(j<<2)>>2]=y+x;g[d+(s+-3<<2)>>2]=D-E;g[d+(i<<2)>>2]=C-B;s=j+o|0;g[d+(s+-1<<2)>>2]=E+D;g[d+(s<<2)>>2]=C+B;s=i+o|0;g[d+(s+-1<<2)>>2]=A-z;g[d+(s<<2)>>2]=y-x;n=n+2|0;}while((n|0)<(a|0));m=m+1|0;if((m|0)==(b|0))break;else l=l+a|0;}}if(a&1)return}i=a+-1+r|0;n=a<<2;o=a<<1;if(!p)return;l=0;m=i;i=i+q|0;j=a;k=a;while(1){z=+g[c+(m<<2)>>2];y=+g[c+(i<<2)>>2];x=(y+z)*-.7071067690849304;y=(z-y)*.7071067690849304;v=c+(k+-1<<2)|0;g[d+(j+-1<<2)>>2]=y+ +g[v>>2];w=j+o|0;g[d+(w+-1<<2)>>2]=+g[v>>2]-y;v=c+(m+r<<2)|0;g[d+(j<<2)>>2]=x-+g[v>>2];g[d+(w<<2)>>2]=+g[v>>2]+x;l=l+1|0;if((l|0)==(b|0))break;else {m=m+a|0;i=i+a|0;j=j+n|0;k=k+a|0;}}return}function od(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0.0,u=0,v=0,w=0,x=0.0,y=0.0,z=0.0,A=0.0;q=$(b,a)|0;r=a<<1;p=(b|0)>0;if(p){k=r+-1|0;j=0;i=0;h=q;while(1){m=d+(i<<2)|0;n=d+(h<<2)|0;o=i<<1;g[e+(o<<2)>>2]=+g[n>>2]+ +g[m>>2];g[e+(k+o<<2)>>2]=+g[m>>2]-+g[n>>2];j=j+1|0;if((j|0)==(b|0))break;else {i=i+a|0;h=h+a|0;}}}if((a|0)<2)return;if((a|0)!=2){if(p){j=0;i=0;h=q;while(1){o=i<<1;k=2;l=h;m=o+r|0;n=i;do{w=l;l=l+2|0;s=m;m=m+-2|0;u=n;n=n+2|0;v=o;o=o+2|0;z=+g[f+(k+-2<<2)>>2];x=+g[d+(w+1<<2)>>2];y=+g[f+(k+-1<<2)>>2];A=+g[d+(l<<2)>>2];t=A*y+x*z;x=A*z-y*x;w=d+(n<<2)|0;g[e+(o<<2)>>2]=x+ +g[w>>2];g[e+(m<<2)>>2]=x-+g[w>>2];u=d+(u+1<<2)|0;g[e+((v|1)<<2)>>2]=+g[u>>2]+t;g[e+(s+-3<<2)>>2]=+g[u>>2]-t;k=k+2|0;}while((k|0)<(a|0));j=j+1|0;if((j|0)==(b|0))break;else {i=i+a|0;h=h+a|0;}}}if(((a|0)%2|0|0)==1)return}h=a+-1|0;if(!p)return;j=0;k=a;i=q+h|0;while(1){g[e+(k<<2)>>2]=-+g[d+(i<<2)>>2];c[e+(k+-1<<2)>>2]=c[d+(h<<2)>>2];j=j+1|0;if((j|0)==(b|0))break;else {k=k+r|0;i=i+a|0;h=h+a|0;}}return}function pd(a,b,d,e,f,h,i,j,k,l){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0.0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0.0;E=6.2831854820251465/+(b|0);D=+R(+E);E=+S(+E);I=b+1>>1;G=a+-1>>1;J=$(d,a)|0;K=$(b,a)|0;F=(a|0)==1;a:do if(!F){if((e|0)>0){q=0;do{c[k+(q<<2)>>2]=c[i+(q<<2)>>2];q=q+1|0;}while((q|0)!=(e|0));}o=(b|0)>1;if(o){w=(d|0)>0;v=1;m=0;do{m=m+J|0;if(w){x=0;n=m;while(1){c[j+(n<<2)>>2]=c[h+(n<<2)>>2];x=x+1|0;if((x|0)==(d|0))break;else n=n+a|0;}}v=v+1|0;}while((v|0)!=(b|0));}w=0-a|0;if((G|0)>(d|0)){if(o){s=(d|0)>0;t=(a|0)>2;n=1;p=0;do{p=p+J|0;w=w+a|0;if(s){x=w+-1|0;o=0;q=p-a|0;do{q=q+a|0;if(t){v=2;m=x;r=q;do{L=m;m=m+2|0;L=l+(L+1<<2)|0;N=r+1|0;r=r+2|0;u=h+(N<<2)|0;C=l+(m<<2)|0;M=h+(r<<2)|0;g[j+(N<<2)>>2]=+g[M>>2]*+g[C>>2]+ +g[u>>2]*+g[L>>2];g[j+(r<<2)>>2]=+g[M>>2]*+g[L>>2]-+g[u>>2]*+g[C>>2];v=v+2|0;}while((v|0)<(a|0));}o=o+1|0;}while((o|0)!=(d|0));}n=n+1|0;}while((n|0)!=(b|0));}}else if(o){t=(a|0)>2;u=(d|0)>0;q=1;r=0;do{w=w+a|0;r=r+J|0;if(t){o=2;p=w+-1|0;s=r;do{x=p;p=p+2|0;s=s+2|0;if(u){x=l+(x+1<<2)|0;v=l+(p<<2)|0;m=0;n=s;while(1){M=n+-1|0;C=h+(M<<2)|0;L=h+(n<<2)|0;g[j+(M<<2)>>2]=+g[L>>2]*+g[v>>2]+ +g[C>>2]*+g[x>>2];g[j+(n<<2)>>2]=+g[L>>2]*+g[x>>2]-+g[C>>2]*+g[v>>2];m=m+1|0;if((m|0)==(d|0))break;else n=n+a|0;}}o=o+2|0;}while((o|0)<(a|0));}q=q+1|0;}while((q|0)!=(b|0));}x=$(J,b)|0;q=(I|0)>1;if((G|0)>=(d|0)){if(!q)break;q=(d|0)>0;r=(a|0)>2;s=1;t=0;while(1){t=t+J|0;x=x-J|0;if(q){v=0;m=t;n=x;while(1){if(r){w=2;o=m;p=n;do{u=o;o=o+2|0;u=u+1|0;C=j+(u<<2)|0;M=p+1|0;p=p+2|0;l=j+(M<<2)|0;g[h+(u<<2)>>2]=+g[l>>2]+ +g[C>>2];u=j+(o<<2)|0;L=j+(p<<2)|0;g[h+(M<<2)>>2]=+g[u>>2]-+g[L>>2];g[h+(o<<2)>>2]=+g[L>>2]+ +g[u>>2];g[h+(p<<2)>>2]=+g[l>>2]-+g[C>>2];w=w+2|0;}while((w|0)<(a|0));}v=v+1|0;if((v|0)==(d|0))break;else {m=m+a|0;n=n+a|0;}}}s=s+1|0;if((s|0)==(I|0))break a}}if(q){q=(a|0)>2;r=(d|0)>0;s=1;t=0;do{t=t+J|0;x=x-J|0;if(q){w=2;m=t;n=x;do{m=m+2|0;n=n+2|0;if(r){v=0;o=m-a|0;p=n-a|0;do{o=o+a|0;p=p+a|0;u=o+-1|0;C=j+(u<<2)|0;M=p+-1|0;l=j+(M<<2)|0;g[h+(u<<2)>>2]=+g[l>>2]+ +g[C>>2];u=j+(o<<2)|0;L=j+(p<<2)|0;g[h+(M<<2)>>2]=+g[u>>2]-+g[L>>2];g[h+(o<<2)>>2]=+g[L>>2]+ +g[u>>2];g[h+(p<<2)>>2]=+g[l>>2]-+g[C>>2];v=v+1|0;}while((v|0)!=(d|0));}w=w+2|0;}while((w|0)<(a|0));}s=s+1|0;}while((s|0)!=(I|0));}}while(0);l=(e|0)>0;if(l){q=0;do{c[i+(q<<2)>>2]=c[k+(q<<2)>>2];q=q+1|0;}while((q|0)!=(e|0));}q=$(e,b)|0;C=(I|0)>1;if(C){x=(d|0)>0;w=1;m=0;n=q;do{m=m+J|0;n=n-J|0;if(x){v=0;o=m-a|0;p=n-a|0;do{o=o+a|0;p=p+a|0;r=j+(o<<2)|0;s=j+(p<<2)|0;g[h+(o<<2)>>2]=+g[s>>2]+ +g[r>>2];g[h+(p<<2)>>2]=+g[s>>2]-+g[r>>2];v=v+1|0;}while((v|0)!=(d|0));}w=w+1|0;}while((w|0)!=(I|0));s=$(b+-1|0,e)|0;if(C){t=(I|0)>2;A=0.0;B=1.0;u=1;h=0;do{h=h+e|0;q=q-e|0;y=B;B=B*D-A*E;A=y*E+A*D;if(l){x=0;w=h;v=q;m=s;n=e;while(1){g[k+(w<<2)>>2]=+g[i+(n<<2)>>2]*B+ +g[i+(x<<2)>>2];g[k+(v<<2)>>2]=+g[i+(m<<2)>>2]*A;x=x+1|0;if((x|0)==(e|0))break;else {w=w+1|0;v=v+1|0;m=m+1|0;n=n+1|0;}}}if(t){y=A;z=B;w=2;v=e;m=s;do{v=v+e|0;m=m-e|0;O=z;z=z*B-y*A;y=O*A+y*B;if(l){x=0;n=h;o=q;p=v;r=m;while(1){L=k+(n<<2)|0;g[L>>2]=+g[L>>2]+ +g[i+(p<<2)>>2]*z;L=k+(o<<2)|0;g[L>>2]=+g[L>>2]+ +g[i+(r<<2)>>2]*y;x=x+1|0;if((x|0)==(e|0))break;else {n=n+1|0;o=o+1|0;p=p+1|0;r=r+1|0;}}}w=w+1|0;}while((w|0)!=(I|0));}u=u+1|0;}while((u|0)!=(I|0));if(C){r=1;q=0;do{q=q+e|0;if(l){s=0;p=q;while(1){x=k+(s<<2)|0;g[x>>2]=+g[x>>2]+ +g[i+(p<<2)>>2];s=s+1|0;if((s|0)==(e|0))break;else p=p+1|0;}}r=r+1|0;}while((r|0)!=(I|0));}}}if((a|0)<(d|0)){if((a|0)>0){m=(d|0)>0;n=0;do{if(m){o=0;p=n;q=n;while(1){c[f+(q<<2)>>2]=c[j+(p<<2)>>2];o=o+1|0;if((o|0)==(d|0))break;else {p=p+a|0;q=q+K|0;}}}n=n+1|0;}while((n|0)!=(a|0));}}else if((d|0)>0){q=(a|0)>0;o=0;n=0;m=0;while(1){if(q){p=0;r=n;s=m;while(1){c[f+(s<<2)>>2]=c[j+(r<<2)>>2];p=p+1|0;if((p|0)==(a|0))break;else {r=r+1|0;s=s+1|0;}}}o=o+1|0;if((o|0)==(d|0))break;else {n=n+a|0;m=m+K|0;}}}l=a<<1;p=$(J,b)|0;if(C){h=(d|0)>0;v=1;m=0;n=0;o=p;do{m=m+l|0;n=n+J|0;o=o-J|0;if(h){w=0;q=m;r=n;s=o;while(1){c[f+(q+-1<<2)>>2]=c[j+(r<<2)>>2];c[f+(q<<2)>>2]=c[j+(s<<2)>>2];w=w+1|0;if((w|0)==(d|0))break;else {q=q+K|0;r=r+a|0;s=s+a|0;}}}v=v+1|0;}while((v|0)!=(I|0));}if(F)return;q=0-a|0;if((G|0)>=(d|0)){if(!C)return;v=(d|0)<1|(a|0)<3;w=1;u=0;h=0;do{q=q+l|0;u=u+l|0;h=h+J|0;p=p-J|0;if(!v){r=0;o=q;n=u;m=h;t=p;while(1){s=2;do{i=s+m|0;b=j+(i+-1<<2)|0;C=s+t|0;e=j+(C+-1<<2)|0;x=s+n|0;g[f+(x+-1<<2)>>2]=+g[e>>2]+ +g[b>>2];k=a-s+o|0;g[f+(k+-1<<2)>>2]=+g[b>>2]-+g[e>>2];i=j+(i<<2)|0;C=j+(C<<2)|0;g[f+(x<<2)>>2]=+g[C>>2]+ +g[i>>2];g[f+(k<<2)>>2]=+g[C>>2]-+g[i>>2];s=s+2|0;}while((s|0)<(a|0));r=r+1|0;if((r|0)==(d|0))break;else {o=o+K|0;n=n+K|0;m=m+a|0;t=t+a|0;}}}w=w+1|0;}while((w|0)!=(I|0));return}if(!C)return;u=(a|0)>2;h=(d|0)>0;x=1;s=0;t=0;do{q=q+l|0;s=s+l|0;t=t+J|0;p=p-J|0;if(u?(H=q+a|0,h):0){v=2;do{w=0;m=H-v|0;n=v+s|0;o=v+t|0;r=v+p|0;while(1){i=j+(o+-1<<2)|0;k=j+(r+-1<<2)|0;g[f+(n+-1<<2)>>2]=+g[k>>2]+ +g[i>>2];g[f+(m+-1<<2)>>2]=+g[i>>2]-+g[k>>2];k=j+(o<<2)|0;i=j+(r<<2)|0;g[f+(n<<2)>>2]=+g[i>>2]+ +g[k>>2];g[f+(m<<2)>>2]=+g[i>>2]-+g[k>>2];w=w+1|0;if((w|0)==(d|0))break;else {m=m+K|0;n=n+K|0;o=o+a|0;r=r+a|0;}}v=v+2|0;}while((v|0)<(a|0));}x=x+1|0;}while((x|0)!=(I|0));return}function qd(a){a=a|0;var b=0,d=0,e=0,f=0.0,i=0,j=0,k=0.0,l=0,m=0,n=0.0,o=0,p=0,q=0,r=0.0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0.0;N=a+28|0;O=c[N>>2]|0;if(!O){A=-131;return A|0}K=(c[O+3456>>2]|0)==0;L=K&1;e=O+3496|0;f=+h[e>>3];if(!(f>-80.0)){if(f<-200.0)h[e>>3]=-200.0;}else h[e>>3]=-80.0;e=O+3512|0;f=+h[e>>3];if(!(f>0.0)){if(f<-99999.0)h[e>>3]=-99999.0;}else h[e>>3]=0.0;I=c[O+3396>>2]|0;if(!I){A=-131;return A|0}c[O+3392>>2]=1;H=O+3400|0;f=+h[H>>3];J=~~f;A=c[(c[I+24>>2]|0)+(J<<2)>>2]|0;J=c[(c[I+28>>2]|0)+(J<<2)>>2]|0;c[O>>2]=A;c[O+4>>2]=J;J=(A|0)==(J|0);A=I+144|0;if((c[A>>2]|0)>0){B=I+136|0;C=I+140|0;D=I+148|0;z=O;j=0;while(1){x=c[B>>2]|0;m=c[C>>2]|0;w=c[(c[D>>2]|0)+(j<<2)>>2]|0;y=Nd(1,1120)|0;w=w+(~~f<<2)|0;v=c[w>>2]|0;Yd(y|0,m+(v*1120|0)|0,1120)|0;m=c[y>>2]|0;if((m|0)>0){l=y+4|0;i=0;o=-1;do{u=c[l+(i<<2)>>2]|0;o=(u|0)>(o|0)?u:o;i=i+1|0;}while((i|0)!=(m|0));if((o|0)>=0){p=y+256|0;u=z+24|0;b=y+192|0;s=y+320|0;t=0;m=-1;while(1){d=p+(t<<2)|0;l=c[d>>2]|0;m=(l|0)>(m|0)?l:m;c[d>>2]=(c[u>>2]|0)+l;d=b+(t<<2)|0;l=c[d>>2]|0;if((l|0)!=31){q=0;do{i=s+(t<<5)+(q<<2)|0;e=c[i>>2]|0;m=(e|0)>(m|0)?e:m;if((e|0)>-1){c[i>>2]=(c[u>>2]|0)+e;l=c[d>>2]|0;}q=q+1|0;}while((q|0)<(1<<l|0));}if((t|0)==(o|0))break;else t=t+1|0;}if((m|0)>=0?(t=c[c[x+(v<<2)>>2]>>2]|0,v=c[u>>2]|0,c[u>>2]=v+1,c[z+1824+(v<<2)>>2]=t,(m|0)!=0):0){o=0;do{o=o+1|0;t=c[(c[x+(c[w>>2]<<2)>>2]|0)+(o<<2)>>2]|0;v=c[u>>2]|0;c[u>>2]=v+1;c[z+1824+(v<<2)>>2]=t;}while((o|0)!=(m|0));}}}x=z+16|0;c[z+800+(c[x>>2]<<2)>>2]=1;c[z+1056+(c[x>>2]<<2)>>2]=y;c[x>>2]=(c[x>>2]|0)+1;j=j+1|0;if((j|0)>=(c[A>>2]|0))break;f=+h[H>>3];z=c[N>>2]|0;}e=c[N>>2]|0;}else e=O;f=+h[O+3520>>3];d=c[I+124>>2]|0;A=c[I+128>>2]|0;p=~~f;f=f-+(p|0);q=A+(p<<3)|0;Yd(e+2868|0,d+(~~+h[q>>3]*492|0)|0,492)|0;f=+h[A+(p+1<<3)>>3]*f+ +h[q>>3]*(1.0-f);q=~~f;f=f-+(q|0);p=(q|0)>0&f==0.0;f=p?1.0:f;q=(p<<31>>31)+q|0;r=1.0-f;p=q+1|0;g[e+2872>>2]=r*+g[d+(q*492|0)+4>>2]+f*+g[d+(p*492|0)+4>>2];g[e+2900>>2]=r*+g[d+(q*492|0)+32>>2]+f*+g[d+(p*492|0)+32>>2];g[e+2876>>2]=r*+g[d+(q*492|0)+8>>2]+f*+g[d+(p*492|0)+8>>2];g[e+2904>>2]=+g[d+(p*492|0)+36>>2]*f+r*+g[d+(q*492|0)+36>>2];g[e+2880>>2]=+g[d+(p*492|0)+12>>2]*f+ +g[d+(q*492|0)+12>>2]*r;g[e+2908>>2]=+g[d+(p*492|0)+40>>2]*f+ +g[d+(q*492|0)+40>>2]*r;g[e+2884>>2]=+g[d+(p*492|0)+16>>2]*f+ +g[d+(q*492|0)+16>>2]*r;g[e+2912>>2]=+g[d+(p*492|0)+44>>2]*f+ +g[d+(q*492|0)+44>>2]*r;g[e+2936>>2]=+h[e+3512>>3];q=c[I+132>>2]|0;r=+h[O+3472>>3];d=~~r;r=r-+(d|0);p=c[N>>2]|0;a:do if(!q){z=c[p>>2]|0;c[p+3240>>2]=z;A=c[p+4>>2]|0;c[p+3300>>2]=A;c[p+3244>>2]=z;c[p+3304>>2]=A;c[p+3248>>2]=z;c[p+3308>>2]=A;c[p+3252>>2]=z;c[p+3312>>2]=A;c[p+3256>>2]=z;c[p+3316>>2]=A;c[p+3260>>2]=z;c[p+3320>>2]=A;c[p+3264>>2]=z;c[p+3324>>2]=A;c[p+3268>>2]=z;c[p+3328>>2]=A;c[p+3272>>2]=z;c[p+3332>>2]=A;c[p+3276>>2]=z;c[p+3336>>2]=A;c[p+3280>>2]=z;c[p+3340>>2]=A;c[p+3284>>2]=z;c[p+3344>>2]=A;c[p+3288>>2]=z;c[p+3348>>2]=A;c[p+3292>>2]=z;c[p+3352>>2]=A;c[p+3296>>2]=z;c[p+3356>>2]=A;}else {j=p+3120|0;i=q+(d*240|0)|0;e=j+60|0;do{c[j>>2]=c[i>>2];j=j+4|0;i=i+4|0;}while((j|0)<(e|0));j=p+3180|0;i=q+(d*240|0)+60|0;e=j+60|0;do{c[j>>2]=c[i>>2];j=j+4|0;i=i+4|0;}while((j|0)<(e|0));if(c[O+3420>>2]|0){f=1.0-r;j=d+1|0;i=p+4|0;k=+(c[a+8>>2]|0);l=0;while(1){n=+g[q+(j*240|0)+120+(l<<2)>>2]*r+ +g[q+(d*240|0)+120+(l<<2)>>2]*f;P=n*1.0e3/k;c[p+3e3+(l<<2)>>2]=~~(+(c[p>>2]|0)*P);c[p+3060+(l<<2)>>2]=~~(+(c[i>>2]|0)*P);c[p+2940+(l<<2)>>2]=~~n;n=(+g[q+(j*240|0)+180+(l<<2)>>2]*r+ +g[q+(d*240|0)+180+(l<<2)>>2]*f)*1.0e3/k;c[p+3240+(l<<2)>>2]=~~(+(c[p>>2]|0)*n);c[p+3300+(l<<2)>>2]=~~(+(c[i>>2]|0)*n);l=l+1|0;if((l|0)==15)break a}}k=1.0-r;m=d+1|0;n=+g[q+(m*240|0)+148>>2]*r+ +g[q+(d*240|0)+148>>2]*k;i=p+4|0;l=~~n;f=+(c[a+8>>2]|0);n=n*1.0e3/f;o=0;do{c[p+3e3+(o<<2)>>2]=~~(+(c[p>>2]|0)*n);c[p+3060+(o<<2)>>2]=~~(+(c[i>>2]|0)*n);c[p+2940+(o<<2)>>2]=l;o=o+1|0;}while((o|0)!=15);f=(+g[q+(m*240|0)+208>>2]*r+ +g[q+(d*240|0)+208>>2]*k)*1.0e3/f;j=0;do{c[p+3240+(j<<2)>>2]=~~(+(c[p>>2]|0)*f);c[p+3300+(j<<2)>>2]=~~(+(c[i>>2]|0)*f);j=j+1|0;}while((j|0)!=15);}while(0);o=I+92|0;i=c[o>>2]|0;q=I+100|0;e=c[q>>2]|0;u=I+108|0;d=c[u>>2]|0;b=c[N>>2]|0;m=b+2852|0;l=c[m>>2]|0;p=~~+h[H>>3];j=b+28|0;if((c[j>>2]|0)<=0)c[j>>2]=1;if(!l){l=Nd(1,520)|0;c[m>>2]=l;}Yd(l|0,25784,520)|0;c[l>>2]=0;if(c[b+3460>>2]|0){c[l+500>>2]=1;c[l+504>>2]=c[i+(p<<2)>>2];c[l+508>>2]=c[e+(p<<2)>>2];h[l+512>>3]=+h[d+(p<<3)>>3];}o=c[o>>2]|0;l=c[q>>2]|0;d=c[u>>2]|0;b=c[N>>2]|0;i=b+2856|0;j=c[i>>2]|0;m=~~+h[H>>3];e=b+28|0;if((c[e>>2]|0)<=1)c[e>>2]=2;if(!j){j=Nd(1,520)|0;c[i>>2]=j;}Yd(j|0,25784,520)|0;c[j>>2]=0;if(c[b+3460>>2]|0){c[j+500>>2]=1;c[j+504>>2]=c[o+(m<<2)>>2];c[j+508>>2]=c[l+(m<<2)>>2];h[j+512>>3]=+h[d+(m<<3)>>3];}if(!J){j=I+96|0;i=c[j>>2]|0;q=I+104|0;e=c[q>>2]|0;d=c[u>>2]|0;p=c[N>>2]|0;o=p+2860|0;l=c[o>>2]|0;b=~~+h[H>>3];m=p+28|0;if((c[m>>2]|0)<=2)c[m>>2]=3;if(!l){l=Nd(1,520)|0;c[o>>2]=l;}Yd(l|0,25784,520)|0;c[l>>2]=1;if(c[p+3460>>2]|0){c[l+500>>2]=1;c[l+504>>2]=c[i+(b<<2)>>2];c[l+508>>2]=c[e+(b<<2)>>2];h[l+512>>3]=+h[d+(b<<3)>>3];}o=c[j>>2]|0;m=c[q>>2]|0;d=c[u>>2]|0;b=c[N>>2]|0;i=b+2864|0;j=c[i>>2]|0;l=~~+h[H>>3];e=b+28|0;if((c[e>>2]|0)<=3)c[e>>2]=4;if(!j){j=Nd(1,520)|0;c[i>>2]=j;}Yd(j|0,25784,520)|0;c[j>>2]=1;if(c[b+3460>>2]|0){c[j+500>>2]=1;c[j+504>>2]=c[o+(l<<2)>>2];c[j+508>>2]=c[m+(l<<2)>>2];h[j+512>>3]=+h[d+(l<<3)>>3];}}i=I+32|0;e=I+36|0;sd(a,+h[O+3528+(L<<5)>>3],0,c[i>>2]|0,c[e>>2]|0,c[I+44>>2]|0);d=I+52|0;sd(a,+h[O+3560>>3],1,c[i>>2]|0,c[e>>2]|0,c[d>>2]|0);if(!J){sd(a,+h[O+3592>>3],2,c[i>>2]|0,c[e>>2]|0,c[d>>2]|0);sd(a,+h[O+3624>>3],3,c[i>>2]|0,c[e>>2]|0,c[I+48>>2]|0);}f=+h[O+3528+(L<<5)+24>>3];q=c[I+80>>2]|0;m=c[I+84>>2]|0;j=~~f;f=f-+(j|0);t=c[N>>2]|0;s=c[t+2852>>2]|0;f=+h[m+(j+1<<3)>>3]*f+ +h[m+(j<<3)>>3]*(1.0-f);j=~~f;f=f-+(j|0);l=(j|0)>0&f==0.0;f=l?1.0:f;j=(l<<31>>31)+j|0;k=1.0-f;l=j+1|0;i=0;do{g[s+336+(i<<2)>>2]=+(c[q+(l*160|0)+(i<<2)>>2]|0)*f+ +(c[q+(j*160|0)+(i<<2)>>2]|0)*k;i=i+1|0;}while((i|0)!=40);f=+h[O+3584>>3];j=~~f;f=f-+(j|0);e=c[t+2856>>2]|0;f=+h[m+(j+1<<3)>>3]*f+ +h[m+(j<<3)>>3]*(1.0-f);j=~~f;f=f-+(j|0);l=(j|0)>0&f==0.0;f=l?1.0:f;j=(l<<31>>31)+j|0;k=1.0-f;l=j+1|0;i=0;do{g[e+336+(i<<2)>>2]=+(c[q+(l*160|0)+(i<<2)>>2]|0)*f+ +(c[q+(j*160|0)+(i<<2)>>2]|0)*k;i=i+1|0;}while((i|0)!=40);if(!J){k=+h[O+3616>>3];i=c[I+88>>2]|0;m=~~k;k=k-+(m|0);o=c[t+2860>>2]|0;k=+h[i+(m+1<<3)>>3]*k+ +h[i+(m<<3)>>3]*(1.0-k);m=~~k;k=k-+(m|0);l=(m|0)>0&k==0.0;k=l?1.0:k;m=(l<<31>>31)+m|0;n=1.0-k;l=m+1|0;j=0;do{g[o+336+(j<<2)>>2]=+(c[q+(l*160|0)+(j<<2)>>2]|0)*k+ +(c[q+(m*160|0)+(j<<2)>>2]|0)*n;j=j+1|0;}while((j|0)!=40);k=+h[O+3648>>3];l=~~k;k=k-+(l|0);o=c[t+2864>>2]|0;k=+h[i+(l+1<<3)>>3]*k+ +h[i+(l<<3)>>3]*(1.0-k);l=~~k;k=k-+(l|0);m=(l|0)>0&k==0.0;k=m?1.0:k;l=(m<<31>>31)+l|0;f=1.0-k;m=l+1|0;j=0;do{g[o+336+(j<<2)>>2]=+(c[q+(m*160|0)+(j<<2)>>2]|0)*k+ +(c[q+(l*160|0)+(j<<2)>>2]|0)*f;j=j+1|0;}while((j|0)!=40);}f=+h[O+3528+(L<<5)+8>>3];j=c[I+40>>2]|0;A=~~f;f=f-+(A|0);g[s+32>>2]=+(c[j+(A+1<<2)>>2]|0)*f+ +(c[j+(A<<2)>>2]|0)*(1.0-f);f=+h[O+3568>>3];A=~~f;f=f-+(A|0);g[e+32>>2]=+(c[j+(A+1<<2)>>2]|0)*f+ +(c[j+(A<<2)>>2]|0)*(1.0-f);if(!J){f=+h[O+3600>>3];A=~~f;f=f-+(A|0);g[(c[t+2860>>2]|0)+32>>2]=+(c[j+(A+1<<2)>>2]|0)*f+ +(c[j+(A<<2)>>2]|0)*(1.0-f);f=+h[O+3632>>3];A=~~f;f=f-+(A|0);g[(c[t+2864>>2]|0)+32>>2]=+(c[j+(A+1<<2)>>2]|0)*f+ +(c[j+(A<<2)>>2]|0)*(1.0-f);}i=I+76|0;e=I+56|0;if(K)f=0.0;else f=+h[O+3408>>3];td(a,+h[O+3528+(L<<5)+16>>3],0,c[i>>2]|0,c[I+60>>2]|0,c[e>>2]|0,f);td(a,+h[O+3576>>3],1,c[i>>2]|0,c[I+64>>2]|0,c[e>>2]|0,0.0);if(J){K=c[N>>2]|0;A=c[K+2852>>2]|0;k=+h[K+3496>>3];g[A+4>>2]=k;f=+h[K+3504>>3];g[A+8>>2]=f;A=c[K+2856>>2]|0;g[A+4>>2]=k;g[A+8>>2]=f;}else {td(a,+h[O+3608>>3],2,c[i>>2]|0,c[I+68>>2]|0,c[e>>2]|0,0.0);td(a,+h[O+3640>>3],3,c[i>>2]|0,c[I+72>>2]|0,c[e>>2]|0,0.0);K=c[N>>2]|0;A=c[K+2852>>2]|0;k=+h[K+3496>>3];g[A+4>>2]=k;f=+h[K+3504>>3];g[A+8>>2]=f;A=c[K+2856>>2]|0;g[A+4>>2]=k;g[A+8>>2]=f;A=c[K+2860>>2]|0;g[A+4>>2]=k;g[A+8>>2]=f;A=c[K+2864>>2]|0;g[A+4>>2]=k;g[A+8>>2]=f;}C=c[I+152>>2]|0;E=~~+h[H>>3];D=c[C+(E<<3)>>2]|0;E=c[C+(E<<3)+4>>2]|0;C=(c[K>>2]|0)==(c[K+4>>2]|0)?1:2;F=K+8|0;G=K+12|0;H=a+8|0;L=a+4|0;J=0;do{j=K+544+(J<<2)|0;c[j>>2]=Nd(1,3208)|0;A=Nd(1,16)|0;c[K+32+(J<<2)>>2]=A;z=26304+(J<<4)|0;c[A>>2]=c[z>>2];c[A+4>>2]=c[z+4>>2];c[A+8>>2]=c[z+8>>2];c[A+12>>2]=c[z+12>>2];if((J|0)>=(c[F>>2]|0))c[F>>2]=J+1;c[K+288+(J<<2)>>2]=0;I=D+(J*3208|0)|0;Yd(c[j>>2]|0,I|0,3208)|0;if((J|0)>=(c[G>>2]|0))c[G>>2]=J+1;if((c[I>>2]|0)>0){p=0;do{t=c[D+(J*3208|0)+1092+(p<<2)>>2]|0;s=c[N>>2]|0;b=Ld(2840)|0;c[s+1568+(t<<2)>>2]=b;Yd(b|0,c[E+(t<<5)+12>>2]|0,2840)|0;m=s+20|0;if((c[m>>2]|0)<=(t|0))c[m>>2]=t+1;B=b+8|0;c[B>>2]=c[E+(t<<5)+8>>2];u=s+1312+(t<<2)|0;c[u>>2]=c[E+(t<<5)>>2];v=s+3420|0;w=b+12|0;o=c[w>>2]|0;m=(o|0)>0;do if(!(c[v>>2]|0)){if(m){m=c[E+(t<<5)+24>>2]|0;l=b+24|0;j=0;do{o=l+(j<<2)|0;if(c[m+(j<<4)>>2]|0)c[o>>2]=c[o>>2]|1;if(c[m+(j<<4)+4>>2]|0)c[o>>2]=c[o>>2]|2;if(c[m+(j<<4)+8>>2]|0)c[o>>2]=c[o>>2]|4;if(c[m+(j<<4)+12>>2]|0)c[o>>2]=c[o>>2]|8;j=j+1|0;o=c[w>>2]|0;}while((j|0)<(o|0));}l=c[E+(t<<5)+16>>2]|0;x=s+24|0;m=c[x>>2]|0;i=l;b:do if((m|0)>0){j=0;while(1){if((c[s+1824+(j<<2)>>2]|0)==(l|0)){m=j;break b}j=j+1|0;if((j|0)>=(m|0)){M=116;break}}}else M=116;while(0);if((M|0)==116){M=0;c[x>>2]=m+1;}c[b+20>>2]=m;c[s+1824+(m<<2)>>2]=i;if((o|0)<=0)break;A=E+(t<<5)+24|0;z=b+280|0;o=0;y=0;do{m=c[A>>2]|0;j=c[m+(y<<4)>>2]|0;i=j;if(j){m=c[x>>2]|0;c:do if((m|0)>0){l=0;while(1){if((c[s+1824+(l<<2)>>2]|0)==(j|0)){m=l;break c}l=l+1|0;if((l|0)>=(m|0)){M=123;break}}}else M=123;while(0);if((M|0)==123){M=0;c[x>>2]=m+1;}c[z+(o<<2)>>2]=m;c[s+1824+(m<<2)>>2]=i;m=c[A>>2]|0;o=o+1|0;}j=c[m+(y<<4)+4>>2]|0;i=j;if(j){m=c[x>>2]|0;d:do if((m|0)>0){l=0;while(1){if((c[s+1824+(l<<2)>>2]|0)==(j|0)){m=l;break d}l=l+1|0;if((l|0)>=(m|0)){M=147;break}}}else M=147;while(0);if((M|0)==147){M=0;c[x>>2]=m+1;}c[z+(o<<2)>>2]=m;c[s+1824+(m<<2)>>2]=i;m=c[A>>2]|0;o=o+1|0;}j=c[m+(y<<4)+8>>2]|0;i=j;if(j){m=c[x>>2]|0;e:do if((m|0)>0){l=0;while(1){if((c[s+1824+(l<<2)>>2]|0)==(j|0)){m=l;break e}l=l+1|0;if((l|0)>=(m|0)){M=153;break}}}else M=153;while(0);if((M|0)==153){M=0;c[x>>2]=m+1;}c[z+(o<<2)>>2]=m;c[s+1824+(m<<2)>>2]=i;m=c[A>>2]|0;o=o+1|0;}l=c[m+(y<<4)+12>>2]|0;i=l;if(l){m=c[x>>2]|0;f:do if((m|0)>0){j=0;while(1){if((c[s+1824+(j<<2)>>2]|0)==(l|0)){m=j;break f}j=j+1|0;if((j|0)>=(m|0)){M=159;break}}}else M=159;while(0);if((M|0)==159){M=0;c[x>>2]=m+1;}c[z+(o<<2)>>2]=m;c[s+1824+(m<<2)>>2]=i;o=o+1|0;}y=y+1|0;}while((y|0)<(c[w>>2]|0));}else {if(m){m=c[E+(t<<5)+28>>2]|0;l=b+24|0;j=0;do{o=l+(j<<2)|0;if(c[m+(j<<4)>>2]|0)c[o>>2]=c[o>>2]|1;if(c[m+(j<<4)+4>>2]|0)c[o>>2]=c[o>>2]|2;if(c[m+(j<<4)+8>>2]|0)c[o>>2]=c[o>>2]|4;if(c[m+(j<<4)+12>>2]|0)c[o>>2]=c[o>>2]|8;j=j+1|0;o=c[w>>2]|0;}while((j|0)<(o|0));}l=c[E+(t<<5)+20>>2]|0;x=s+24|0;m=c[x>>2]|0;i=l;g:do if((m|0)>0){j=0;while(1){if((c[s+1824+(j<<2)>>2]|0)==(l|0)){m=j;break g}j=j+1|0;if((j|0)>=(m|0)){M=100;break}}}else M=100;while(0);if((M|0)==100){M=0;c[x>>2]=m+1;}c[b+20>>2]=m;c[s+1824+(m<<2)>>2]=i;if((o|0)<=0)break;A=E+(t<<5)+28|0;z=b+280|0;o=0;y=0;do{m=c[A>>2]|0;j=c[m+(y<<4)>>2]|0;i=j;if(j){m=c[x>>2]|0;h:do if((m|0)>0){l=0;while(1){if((c[s+1824+(l<<2)>>2]|0)==(j|0)){m=l;break h}l=l+1|0;if((l|0)>=(m|0)){M=107;break}}}else M=107;while(0);if((M|0)==107){M=0;c[x>>2]=m+1;}c[z+(o<<2)>>2]=m;c[s+1824+(m<<2)>>2]=i;m=c[A>>2]|0;o=o+1|0;}j=c[m+(y<<4)+4>>2]|0;i=j;if(j){m=c[x>>2]|0;i:do if((m|0)>0){l=0;while(1){if((c[s+1824+(l<<2)>>2]|0)==(j|0)){m=l;break i}l=l+1|0;if((l|0)>=(m|0)){M=171;break}}}else M=171;while(0);if((M|0)==171){M=0;c[x>>2]=m+1;}c[z+(o<<2)>>2]=m;c[s+1824+(m<<2)>>2]=i;m=c[A>>2]|0;o=o+1|0;}j=c[m+(y<<4)+8>>2]|0;i=j;if(j){m=c[x>>2]|0;j:do if((m|0)>0){l=0;while(1){if((c[s+1824+(l<<2)>>2]|0)==(j|0)){m=l;break j}l=l+1|0;if((l|0)>=(m|0)){M=177;break}}}else M=177;while(0);if((M|0)==177){M=0;c[x>>2]=m+1;}c[z+(o<<2)>>2]=m;c[s+1824+(m<<2)>>2]=i;m=c[A>>2]|0;o=o+1|0;}l=c[m+(y<<4)+12>>2]|0;i=l;if(l){m=c[x>>2]|0;k:do if((m|0)>0){j=0;while(1){if((c[s+1824+(j<<2)>>2]|0)==(l|0)){m=j;break k}j=j+1|0;if((j|0)>=(m|0)){M=183;break}}}else M=183;while(0);if((M|0)==183){M=0;c[x>>2]=m+1;}c[z+(o<<2)>>2]=m;c[s+1824+(m<<2)>>2]=i;o=o+1|0;}y=y+1|0;}while((y|0)<(c[w>>2]|0));}while(0);n=+h[s+3480>>3]*1.0e3;r=+(c[H>>2]|0)*.5;z=c[s+(J<<2)>>2]>>1;n=n>r?r:n;k=+(z|0);c[(c[s+1056+(J<<2)>>2]|0)+1116>>2]=~~(k*(n/r));o=c[E+(t<<5)+4>>2]|0;do if((o|0)==2)n=250.0;else if((o|0)==1){n=+(c[((c[v>>2]|0)==0?s+2968|0:s+2996|0)>>2]|0)*1.0e3;if(!(n>r))break;n=r;}while(0);do if((c[u>>2]|0)==2){q=c[s+12>>2]|0;if((q|0)>0){d=0;do{j=c[s+544+(d<<2)>>2]|0;i=c[j>>2]|0;if((i|0)>0){e=0;do{do if((c[j+1092+(e<<2)>>2]|0)==(t|0)){o=c[L>>2]|0;if((o|0)>0){l=0;m=0;}else {l=0;break}do{l=((c[j+4+(m<<2)>>2]|0)==(e|0)&1)+l|0;m=m+1|0;}while((m|0)!=(o|0));}else l=0;while(0);e=e+1|0;}while((e|0)<(i|0)&(l|0)==0);}else l=0;d=d+1|0;}while((d|0)<(q|0)&(l|0)==0);}else l=0;j=c[B>>2]|0;m=$(~~(+(l|0)*k*(n/r)/+(j|0)+.9),j)|0;o=b+4|0;c[o>>2]=m;l=$(l,z)|0;if((m|0)<=(l|0)){l=o;break}m=l-((l|0)%(j|0)|0)|0;c[o>>2]=m;l=o;}else {j=c[B>>2]|0;m=$(~~(n/r*k/+(j|0)+.9),j)|0;l=b+4|0;c[l>>2]=m;if((m|0)<=(z|0))break;m=z-((z|0)%(j|0)|0)|0;c[l>>2]=m;}while(0);if(!m)c[l>>2]=j;p=p+1|0;}while((p|0)<(c[I>>2]|0));}J=J+1|0;}while((J|0)<(C|0));j=O+3428|0;i=c[j>>2]|0;if((i|0)>0)c[a+16>>2]=i;else {d=c[N>>2]|0;f=+h[d+3400>>3];e=~~f;f=f-+(e|0);d=c[(c[d+3396>>2]|0)+4>>2]|0;if(!d)b=-1;else b=~~((+h[d+(e+1<<3)>>3]*f+ +h[d+(e<<3)>>3]*(1.0-f))*+(c[L>>2]|0));c[a+16>>2]=b;}d=O+3424|0;c[a+20>>2]=c[d>>2];e=O+3440|0;c[a+12>>2]=c[e>>2];if(!i)b=0;else b=~~(+(c[O+3444>>2]|0)/+(i|0));c[a+24>>2]=b;if(!(c[O+3420>>2]|0)){A=0;return A|0}c[O+3360>>2]=c[j>>2];c[O+3364>>2]=c[d>>2];c[O+3368>>2]=c[e>>2];c[O+3372>>2]=c[O+3444>>2];h[O+3376>>3]=+h[O+3448>>3];h[O+3384>>3]=+h[O+3432>>3];A=0;return A|0}function rd(a,b,d,e){a=a|0;b=b|0;d=d|0;e=+e;var f=0,h=0;if((d|0)>=1){f=c[a+28>>2]|0;e=e+1.0e-07;e=!(e>=1.0)?e:.9998999834060669;g[f+3416>>2]=e;h=ud(b,d,e,0,f+3400|0)|0;c[f+3396>>2]=h;if(!h)f=-130;else {vd(a,b,d);c[f+3420>>2]=0;c[f+3464>>2]=1;f=qd(a)|0;if(!f){f=0;return f|0}kc(a);return f|0}}else f=-131;kc(a);return f|0}function sd(a,b,d,e,f,h){a=a|0;b=+b;d=d|0;e=e|0;f=f|0;h=h|0;var i=0,j=0.0,k=0;k=~~b;j=b-+(k|0);i=c[(c[a+28>>2]|0)+2852+(d<<2)>>2]|0;b=1.0-j;a=k+1|0;g[i+12>>2]=+(c[e+(a*20|0)>>2]|0)*j+ +(c[e+(k*20|0)>>2]|0)*b;g[i+16>>2]=+(c[e+(a*20|0)+4>>2]|0)*j+ +(c[e+(k*20|0)+4>>2]|0)*b;g[i+20>>2]=+(c[e+(a*20|0)+8>>2]|0)*j+ +(c[e+(k*20|0)+8>>2]|0)*b;g[i+24>>2]=+g[e+(a*20|0)+12>>2]*j+ +g[e+(k*20|0)+12>>2]*b;g[i+28>>2]=+g[e+(a*20|0)+16>>2]*j+ +g[e+(k*20|0)+16>>2]*b;g[i+496>>2]=+(c[f+(a<<2)>>2]|0)*j+ +(c[f+(k<<2)>>2]|0)*b;d=0;do{g[i+36+(d<<2)>>2]=+(c[h+(a*68|0)+(d<<2)>>2]|0)*j+ +(c[h+(k*68|0)+(d<<2)>>2]|0)*b;d=d+1|0;}while((d|0)!=17);return}function td(a,b,d,e,f,h,i){a=a|0;b=+b;d=d|0;e=e|0;f=f|0;h=h|0;i=+i;var j=0,k=0.0,l=0,m=0;l=~~b;k=b-+(l|0);m=c[(c[a+28>>2]|0)+2852+(d<<2)>>2]|0;b=1.0-k;j=l+1|0;g[m+108>>2]=+(c[e+(j<<2)>>2]|0)*k+ +(c[e+(l<<2)>>2]|0)*b;c[m+120>>2]=c[h+(d*12|0)>>2];c[m+124>>2]=c[h+(d*12|0)+4>>2];c[m+128>>2]=c[h+(d*12|0)+8>>2];a=0;do{g[m+132+(a<<2)>>2]=+(c[f+(j*204|0)+(a<<2)>>2]|0)*k+ +(c[f+(l*204|0)+(a<<2)>>2]|0)*b;a=a+1|0;}while((a|0)!=17);a=0;do{g[m+200+(a<<2)>>2]=+(c[f+(j*204|0)+68+(a<<2)>>2]|0)*k+ +(c[f+(l*204|0)+68+(a<<2)>>2]|0)*b;a=a+1|0;}while((a|0)!=17);a=0;do{g[m+268+(a<<2)>>2]=+(c[f+(j*204|0)+136+(a<<2)>>2]|0)*k+ +(c[f+(l*204|0)+136+(a<<2)>>2]|0)*b;a=a+1|0;}while((a|0)!=17);k=+g[m+132>>2];b=k+6.0;k=k+i;g[m+132>>2]=k<b?b:k;a=1;do{k=+g[m+132+(a<<2)>>2]+i;g[m+132+(a<<2)>>2]=k<b?b:k;a=a+1|0;}while((a|0)!=17);k=+g[m+200>>2];b=k+6.0;k=k+i;g[m+200>>2]=k<b?b:k;a=1;do{k=+g[m+200+(a<<2)>>2]+i;g[m+200+(a<<2)>>2]=k<b?b:k;a=a+1|0;}while((a|0)!=17);k=+g[m+268>>2];b=k+6.0;k=k+i;g[m+268>>2]=k<b?b:k;a=1;do{k=+g[m+268+(a<<2)>>2]+i;g[m+268+(a<<2)>>2]=k<b?b:k;a=a+1|0;}while((a|0)!=17);return}function ud(a,b,d,e,f){a=a|0;b=b|0;d=+d;e=e|0;f=f|0;var g=0,i=0.0,j=0,k=0,l=0,m=0,n=0.0;a:do if(!e){j=26336;e=0;while(1){g=c[j>>2]|0;l=c[g+12>>2]|0;if(((((l|0)==-1|(l|0)==(a|0)?(c[g+16>>2]|0)<=(b|0):0)?(c[g+20>>2]|0)>=(b|0):0)?(k=c[g>>2]|0,m=c[g+8>>2]|0,n=+h[m>>3],!(n>d)):0)?!(+h[m+(k<<3)>>3]<d):0){l=k;k=j;j=m;i=n;break a}e=e+1|0;if((e|0)==17){g=0;break}else j=26336+(e<<2)|0;}return g|0}else {d=d/+(a|0);k=26336;e=0;while(1){g=c[k>>2]|0;m=c[g+12>>2]|0;if(((((m|0)==-1|(m|0)==(a|0)?(c[g+16>>2]|0)<=(b|0):0)?(c[g+20>>2]|0)>=(b|0):0)?(l=c[g>>2]|0,j=c[g+4>>2]|0,i=+h[j>>3],!(d<i)):0)?!(d>+h[j+(l<<3)>>3]):0)break a;e=e+1|0;if((e|0)==17){g=0;break}else k=26336+(e<<2)|0;}return g|0}while(0);b:do if((l|0)>0){e=0;while(1){g=e+1|0;if(d>=i?d<+h[j+(g<<3)>>3]:0){g=e;break b}if((g|0)>=(l|0))break b;i=+h[j+(g<<3)>>3];e=g;}}else g=0;while(0);if((g|0)==(l|0))i=+(l|0)+-.001;else {i=+h[j+(g<<3)>>3];i=(d-i)/(+h[j+(g+1<<3)>>3]-i)+ +(g|0);}h[f>>3]=i;g=c[k>>2]|0;return g|0}function vd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0.0,f=0.0,g=0.0,i=0,j=0;i=c[a+28>>2]|0;j=c[i+3396>>2]|0;c[a>>2]=0;c[a+4>>2]=b;c[a+8>>2]=d;c[i+3456>>2]=1;c[i+3460>>2]=1;g=+h[i+3400>>3];d=~~g;f=g-+(d|0);h[i+3472>>3]=g;if(!(c[i+3488>>2]|0)){b=c[j+120>>2]|0;e=1.0-f;a=d+1|0;h[i+3480>>3]=+h[b+(a<<3)>>3]*f+ +h[b+(d<<3)>>3]*e;}else {a=d+1|0;e=1.0-f;}b=c[j+112>>2]|0;h[i+3496>>3]=+(c[b+(a<<2)>>2]|0)*f+ +(c[b+(d<<2)>>2]|0)*e;b=c[j+116>>2]|0;h[i+3504>>3]=+(c[b+(a<<2)>>2]|0)*f+ +(c[b+(d<<2)>>2]|0)*e;h[i+3512>>3]=-6.0;h[i+3520>>3]=g;h[i+3528>>3]=g;h[i+3536>>3]=g;h[i+3544>>3]=g;h[i+3552>>3]=g;h[i+3560>>3]=g;h[i+3568>>3]=g;h[i+3576>>3]=g;h[i+3584>>3]=g;h[i+3592>>3]=g;h[i+3600>>3]=g;h[i+3608>>3]=g;h[i+3616>>3]=g;h[i+3624>>3]=g;h[i+3632>>3]=g;h[i+3640>>3]=g;h[i+3648>>3]=g;return}function wd(a,b,d,e,f,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0;k=(f|0)!=0;j=k?e:0;k=k?h:0;l=c[520336+(c[b+(j<<2)>>2]<<2)>>2]|0;n=c[520336+(c[b+(k<<2)>>2]<<2)>>2]|0;o=c[d+(f<<2)>>2]|0;j=c[d+(j<<2)>>2]|0;k=c[d+(k<<2)>>2]|0;b=(o|0)/4|0;h=(j|0)/4|0;i=b-h|0;j=(j|0)/2|0;e=((o|0)/2|0)+b+((k|0)/-4|0)|0;f=(k|0)/2|0;m=e+f|0;if((i|0)>0){Sd(a|0,0,b-h<<2|0)|0;d=i;}else d=0;if((d|0)<(i+j|0)){h=b+j-d-h|0;b=0;while(1){j=a+(d<<2)|0;g[j>>2]=+g[j>>2]*+g[l+(b<<2)>>2];b=b+1|0;if((b|0)==(h|0))break;else d=d+1|0;}}if((k|0)>1){d=e+1|0;b=(m|0)>(d|0);do{f=f+-1|0;l=a+(e<<2)|0;g[l>>2]=+g[l>>2]*+g[n+(f<<2)>>2];e=e+1|0;}while((e|0)<(m|0));e=b?m:d;}if((o|0)<=(e|0))return;Sd(a+(e<<2)|0,0,o-e<<2|0)|0;return}function xd(a,b,d){a=a|0;b=+b;d=+d;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;m=i;i=i+64|0;f=m+32|0;e=m;l=Ld(688)|0;j=l+408|0;jc(j);rd(j,a,~~b,d)|0;g=l+440|0;gc(g);hc(g,553008,553016);h=l+456|0;Cb(h,j)|0;zb(h,l+568|0)|0;Jd(Ha(0)|0);kb(l,Kd()|0)|0;j=l+680|0;c[j>>2]=0;k=l+684|0;c[k>>2]=0;a=l+360|0;lc(h,g,a,f,e)|0;ob(l,a)|0;ob(l,f)|0;ob(l,e)|0;a=l+392|0;if(!(pb(l,a)|0)){i=m;return l|0}e=l+396|0;f=l+404|0;g=l+400|0;do{h=(c[e>>2]|0)+(c[k>>2]|0)+(c[f>>2]|0)|0;if(h){o=Od(c[j>>2]|0,h)|0;c[j>>2]=o;h=c[k>>2]|0;n=c[e>>2]|0;Yd(o+h|0,c[a>>2]|0,n|0)|0;h=n+h|0;c[k>>2]=h;n=c[f>>2]|0;Yd(o+h|0,c[g>>2]|0,n|0)|0;c[k>>2]=n+h;}}while((pb(l,a)|0)!=0);i=m;return l|0}function yd(a){a=a|0;lb(a)|0;Bb(a+568|0)|0;Db(a+456|0);ic(a+440|0);kc(a+408|0);Md(c[a+680>>2]|0);Md(a);return}function zd(a,b){a=a|0;b=b|0;return Eb(a+456|0,b)|0}function Ad(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;m=a+456|0;Fb(m,b)|0;b=a+568|0;if((Gb(m,b)|0)!=1)return;g=a+360|0;h=a+392|0;i=a+684|0;j=a+396|0;k=a+404|0;l=a+680|0;d=a+392|0;e=a+400|0;do{tb(b,0)|0;xb(b)|0;if(yb(m,g)|0)do{ob(a,g)|0;if(qb(a,h)|0)do{f=(c[j>>2]|0)+(c[i>>2]|0)+(c[k>>2]|0)|0;if(f){o=Od(c[l>>2]|0,f)|0;c[l>>2]=o;f=c[i>>2]|0;n=c[j>>2]|0;Yd(o+f|0,c[d>>2]|0,n|0)|0;f=n+f|0;c[i>>2]=f;n=c[k>>2]|0;Yd(o+f|0,c[e>>2]|0,n|0)|0;c[i>>2]=n+f;}}while((qb(a,h)|0)!=0);}while((yb(m,g)|0)!=0);}while((Gb(m,b)|0)==1);return}function Bd(a){a=a|0;return c[a+684>>2]|0}function Cd(a){a=a|0;c[a+684>>2]=0;return c[a+680>>2]|0}function Dd(a,b){a=+a;b=b|0;return +(+Id(a,b));}function Ed(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;B=i;i=i+688|0;x=B+424|0;w=B+192|0;z=B;f=$(d,b)|0;if(!f){i=B;return}j=f-d|0;c[z+4>>2]=d;c[z>>2]=d;g=d;b=d;h=2;while(1){g=g+d+b|0;c[z+(h<<2)>>2]=g;if(g>>>0<f>>>0){y=b;b=g;h=h+1|0;g=y;}else break}y=0-d|0;t=a+j|0;if((j|0)>0){r=(d|0)==0;s=t;f=1;g=0;b=1;do{do if((f&3|0)!=3){q=b+-1|0;if((c[z+(q<<2)>>2]|0)>>>0<(s-a|0)>>>0){c[w>>2]=a;a:do if((b|0)>1){j=b;h=a;o=a;k=1;while(1){p=h+y|0;l=j+-2|0;h=h+(0-((c[z+(l<<2)>>2]|0)+d))|0;if((Ra[e&15](o,h)|0)>-1?(Ra[e&15](o,p)|0)>-1:0){n=k;break}n=k+1|0;m=w+(k<<2)|0;if((Ra[e&15](h,p)|0)>-1){c[m>>2]=h;j=j+-1|0;}else {c[m>>2]=p;h=p;j=l;}if((j|0)<=1)break;o=c[w>>2]|0;k=n;}if((n|0)>=2?(v=w+(n<<2)|0,c[v>>2]=x,!r):0){k=d;j=x;while(1){h=k>>>0>256?256:k;l=c[w>>2]|0;Yd(j|0,l|0,h|0)|0;m=0;do{p=m;m=m+1|0;o=l;l=c[w+(m<<2)>>2]|0;Yd(o|0,l|0,h|0)|0;c[w+(p<<2)>>2]=o+h;}while((m|0)!=(n|0));if((k|0)==(h|0))break a;k=k-h|0;j=c[v>>2]|0;}}}while(0);}else Fd(a,d,e,f,g,b,0,z);if((b|0)==1){j=f<<1;g=f>>>31|g<<1;b=0;break}else {p=q>>>0>31;o=p?0:f;b=p?b+-33|0:q;j=o<<b;g=o>>>(32-b|0)|(p?f:g)<<b;b=1;break}}else {c[w>>2]=a;b:do if((b|0)>1){j=b;h=a;n=a;l=1;while(1){o=h+y|0;p=j+-2|0;h=h+(0-((c[z+(p<<2)>>2]|0)+d))|0;if((Ra[e&15](n,h)|0)>-1?(Ra[e&15](n,o)|0)>-1:0){m=l;break}m=l+1|0;k=w+(l<<2)|0;if((Ra[e&15](h,o)|0)>-1){c[k>>2]=h;j=j+-1|0;}else {c[k>>2]=o;h=o;j=p;}if((j|0)<=1)break;n=c[w>>2]|0;l=m;}if((m|0)>=2?(u=w+(m<<2)|0,c[u>>2]=x,!r):0){k=d;j=x;while(1){l=k>>>0>256?256:k;h=c[w>>2]|0;Yd(j|0,h|0,l|0)|0;j=h;h=0;do{q=h;h=h+1|0;p=j;j=c[w+(h<<2)>>2]|0;Yd(p|0,j|0,l|0)|0;c[w+(q<<2)>>2]=p+l;}while((h|0)!=(m|0));if((k|0)==(l|0))break b;k=k-l|0;j=c[u>>2]|0;}}}while(0);j=f>>>2|g<<30;g=g>>>2;b=b+2|0;}while(0);f=j|1;a=a+d|0;}while(a>>>0<t>>>0);}else {g=0;f=1;b=1;}Fd(a,d,e,f,g,b,0,z);if((g|0)==0&((f|0)==1&(b|0)==1)){i=B;return}else {h=f;p=a;o=b;}while(1){if((o|0)>=2){v=h>>>30;x=o+-2|0;u=(h<<1&2147483646|v<<31)^3;w=(v|g<<2)>>>1;Fd(p+(0-((c[z+(x<<2)>>2]|0)+d))|0,d,e,u,w,o+-1|0,1,z);v=w<<1|v&1;u=u<<1|1;w=p+y|0;Fd(w,d,e,u,v,x,1,z);h=u;g=v;p=w;o=x;continue}b=h+-1|0;do if(b){if(!(b&1)){f=b;b=0;do{b=b+1|0;f=f>>>1;}while((f&1|0)==0);if(!b)A=51;}else A=51;if((A|0)==51){A=0;if(!g){b=64;A=56;break}if(!(g&1)){f=g;b=0;}else {f=0;a=h;b=0;break}while(1){a=b+1|0;f=f>>>1;if(f&1){f=a;break}else b=a;}if(!f){f=0;a=h;b=0;break}else b=b+33|0;}if(b>>>0>31)A=56;else {f=b;a=h;}}else {b=32;A=56;}while(0);if((A|0)==56){A=0;f=b+-32|0;a=g;g=0;}h=g<<32-f|a>>>f;g=g>>>f;o=b+o|0;if((g|0)==0&((h|0)==1&(o|0)==1))break;else p=p+y|0;}i=B;return}function Fd(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;v=i;i=i+720|0;u=v+456|0;t=v+228|0;q=v;c[q>>2]=a;r=0-b|0;a:do if((f|0)!=0|(e|0)!=1?(l=a+(0-(c[j+(g<<2)>>2]|0))|0,(Ra[d&15](l,a)|0)>=1):0){m=l;k=f;l=1;while(1){if((h|0)==0&(g|0)>1){f=c[j+(g+-2<<2)>>2]|0;if((Ra[d&15](a+r|0,m)|0)>-1)break a;if((Ra[d&15](a+(0-(f+b))|0,m)|0)>-1)break a}n=l+1|0;c[q+(l<<2)>>2]=m;f=e+-1|0;do if(f){if(!(f&1)){l=f;f=0;do{f=f+1|0;l=l>>>1;}while((l&1|0)==0);if(!f)o=10;}else o=10;if((o|0)==10){o=0;if(!k){f=64;o=15;break}if(!(k&1)){a=k;l=0;}else {h=0;l=e;a=k;f=0;break}while(1){f=l+1|0;a=a>>>1;if(a&1){a=f;break}else l=f;}if(!a){h=0;l=e;a=k;f=0;break}else f=l+33|0;}if(f>>>0>31)o=15;else {h=f;l=e;a=k;}}else {f=32;o=15;}while(0);if((o|0)==15){o=0;h=f+-32|0;l=k;a=0;}e=a<<32-h|l>>>h;k=a>>>h;g=f+g|0;if(!((k|0)!=0|(e|0)!=1)){a=m;l=n;break a}l=m+(0-(c[j+(g<<2)>>2]|0))|0;if((Ra[d&15](l,c[q>>2]|0)|0)<1){a=m;h=0;f=n;o=18;break}else {a=m;h=0;m=l;l=n;}}}else {f=1;o=18;}while(0);if((o|0)==18)if(!h)l=f;else {i=v;return}b:do if((l|0)>=2?(p=q+(l<<2)|0,c[p>>2]=u,(b|0)!=0):0){e=b;h=u;while(1){k=e>>>0>256?256:e;f=c[q>>2]|0;Yd(h|0,f|0,k|0)|0;h=0;do{n=h;h=h+1|0;m=f;f=c[q+(h<<2)>>2]|0;Yd(m|0,f|0,k|0)|0;c[q+(n<<2)>>2]=m+k;}while((h|0)!=(l|0));if((e|0)==(k|0))break b;e=e-k|0;h=c[p>>2]|0;}}while(0);c[t>>2]=a;c:do if((g|0)>1){e=a;k=a;f=1;while(1){a=e+r|0;l=g+-2|0;e=e+(0-((c[j+(l<<2)>>2]|0)+b))|0;if((Ra[d&15](k,e)|0)>-1?(Ra[d&15](k,a)|0)>-1:0){h=f;break}h=f+1|0;k=t+(f<<2)|0;if((Ra[d&15](e,a)|0)>-1){c[k>>2]=e;g=g+-1|0;}else {c[k>>2]=a;e=a;g=l;}if((g|0)<=1)break;k=c[t>>2]|0;f=h;}if((h|0)>=2?(s=t+(h<<2)|0,c[s>>2]=u,(b|0)!=0):0){k=u;while(1){g=b>>>0>256?256:b;e=c[t>>2]|0;Yd(k|0,e|0,g|0)|0;k=e;e=0;do{n=e;e=e+1|0;m=k;k=c[t+(e<<2)>>2]|0;Yd(m|0,k|0,g|0)|0;c[t+(n<<2)>>2]=m+g;}while((e|0)!=(h|0));if((b|0)==(g|0))break c;b=b-g|0;k=c[s>>2]|0;}}}while(0);i=v;return}function Gd(a){a=+a;var b=0,d=0;h[k>>3]=a;b=c[k+4>>2]|0;d=b&2146435072;if(d>>>0>1126170624|(d|0)==1126170624&0>0)return +a;b=(b|0)<0;a=b?a+-4503599627370496.0+4503599627370496.0:a+4503599627370496.0+-4503599627370496.0;if(!(a==0.0))return +a;a=b?-0.0:0.0;return +a}function Hd(a){a=+a;var b=0;b=(g[k>>2]=a,c[k>>2]|0);if((b&2130706432)>>>0>1249902592)return +a;b=(b|0)<0;a=b?a+-8388608.0+8388608.0:a+8388608.0+-8388608.0;if(!(a==0.0))return +a;a=b?-0.0:0.0;return +a}function Id(a,b){a=+a;b=b|0;var d=0;if((b|0)>1023){a=a*8988465674311579538646525.0e283;d=b+-1023|0;if((d|0)>1023){d=b+-2046|0;d=(d|0)>1023?1023:d;a=a*8988465674311579538646525.0e283;}}else if((b|0)<-1022){a=a*2.2250738585072014e-308;d=b+1022|0;if((d|0)<-1022){d=b+2044|0;d=(d|0)<-1022?-1022:d;a=a*2.2250738585072014e-308;}}else d=b;b=Vd(d+1023|0,0,52)|0;d=D;c[k>>2]=b;c[k+4>>2]=d;return +(a*+h[k>>3]);}function Jd(a){a=a|0;var b=0;b=553040;c[b>>2]=a+-1;c[b+4>>2]=0;return}function Kd(){var a=0,b=0,d=0;b=553040;b=fe(c[b>>2]|0,c[b+4>>2]|0,1284865837,1481765933)|0;b=Wd(b|0,D|0,1,0)|0;a=D;d=553040;c[d>>2]=b;c[d+4>>2]=a;a=Xd(b|0,a|0,33)|0;return a|0}function Ld(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;do if(a>>>0<245){q=a>>>0<11?16:a+11&-8;a=q>>>3;l=c[138262]|0;j=l>>>a;if(j&3){e=(j&1^1)+a|0;f=e<<1;b=553088+(f<<2)|0;f=553088+(f+2<<2)|0;g=c[f>>2]|0;h=g+8|0;i=c[h>>2]|0;do if((b|0)!=(i|0)){if(i>>>0<(c[138266]|0)>>>0)Ga();d=i+12|0;if((c[d>>2]|0)==(g|0)){c[d>>2]=b;c[f>>2]=i;break}else Ga();}else c[138262]=l&~(1<<e);while(0);w=e<<3;c[g+4>>2]=w|3;w=g+(w|4)|0;c[w>>2]=c[w>>2]|1;w=h;return w|0}b=c[138264]|0;if(q>>>0>b>>>0){if(j){f=2<<a;f=j<<a&(f|0-f);f=(f&0-f)+-1|0;a=f>>>12&16;f=f>>>a;e=f>>>5&8;f=f>>>e;d=f>>>2&4;f=f>>>d;g=f>>>1&2;f=f>>>g;h=f>>>1&1;h=(e|a|d|g|h)+(f>>>h)|0;f=h<<1;g=553088+(f<<2)|0;f=553088+(f+2<<2)|0;d=c[f>>2]|0;a=d+8|0;e=c[a>>2]|0;do if((g|0)!=(e|0)){if(e>>>0<(c[138266]|0)>>>0)Ga();i=e+12|0;if((c[i>>2]|0)==(d|0)){c[i>>2]=g;c[f>>2]=e;k=c[138264]|0;break}else Ga();}else {c[138262]=l&~(1<<h);k=b;}while(0);w=h<<3;b=w-q|0;c[d+4>>2]=q|3;j=d+q|0;c[d+(q|4)>>2]=b|1;c[d+w>>2]=b;if(k){e=c[138267]|0;g=k>>>3;i=g<<1;f=553088+(i<<2)|0;h=c[138262]|0;g=1<<g;if(h&g){h=553088+(i+2<<2)|0;i=c[h>>2]|0;if(i>>>0<(c[138266]|0)>>>0)Ga();else {m=h;n=i;}}else {c[138262]=h|g;m=553088+(i+2<<2)|0;n=f;}c[m>>2]=e;c[n+12>>2]=e;c[e+8>>2]=n;c[e+12>>2]=f;}c[138264]=b;c[138267]=j;w=a;return w|0}a=c[138263]|0;if(a){h=(a&0-a)+-1|0;v=h>>>12&16;h=h>>>v;u=h>>>5&8;h=h>>>u;w=h>>>2&4;h=h>>>w;i=h>>>1&2;h=h>>>i;g=h>>>1&1;g=c[553352+((u|v|w|i|g)+(h>>>g)<<2)>>2]|0;h=(c[g+4>>2]&-8)-q|0;i=g;while(1){d=c[i+16>>2]|0;if(!d){d=c[i+20>>2]|0;if(!d){l=h;k=g;break}}i=(c[d+4>>2]&-8)-q|0;w=i>>>0<h>>>0;h=w?i:h;i=d;g=w?d:g;}a=c[138266]|0;if(k>>>0<a>>>0)Ga();b=k+q|0;if(k>>>0>=b>>>0)Ga();j=c[k+24>>2]|0;g=c[k+12>>2]|0;do if((g|0)==(k|0)){h=k+20|0;i=c[h>>2]|0;if(!i){h=k+16|0;i=c[h>>2]|0;if(!i){e=0;break}}while(1){g=i+20|0;f=c[g>>2]|0;if(f){i=f;h=g;continue}g=i+16|0;f=c[g>>2]|0;if(!f)break;else {i=f;h=g;}}if(h>>>0<a>>>0)Ga();else {c[h>>2]=0;e=i;break}}else {f=c[k+8>>2]|0;if(f>>>0<a>>>0)Ga();i=f+12|0;if((c[i>>2]|0)!=(k|0))Ga();h=g+8|0;if((c[h>>2]|0)==(k|0)){c[i>>2]=g;c[h>>2]=f;e=g;break}else Ga();}while(0);do if(j){i=c[k+28>>2]|0;h=553352+(i<<2)|0;if((k|0)==(c[h>>2]|0)){c[h>>2]=e;if(!e){c[138263]=c[138263]&~(1<<i);break}}else {if(j>>>0<(c[138266]|0)>>>0)Ga();i=j+16|0;if((c[i>>2]|0)==(k|0))c[i>>2]=e;else c[j+20>>2]=e;if(!e)break}h=c[138266]|0;if(e>>>0<h>>>0)Ga();c[e+24>>2]=j;i=c[k+16>>2]|0;do if(i)if(i>>>0<h>>>0)Ga();else {c[e+16>>2]=i;c[i+24>>2]=e;break}while(0);i=c[k+20>>2]|0;if(i)if(i>>>0<(c[138266]|0)>>>0)Ga();else {c[e+20>>2]=i;c[i+24>>2]=e;break}}while(0);if(l>>>0<16){w=l+q|0;c[k+4>>2]=w|3;w=k+(w+4)|0;c[w>>2]=c[w>>2]|1;}else {c[k+4>>2]=q|3;c[k+(q|4)>>2]=l|1;c[k+(l+q)>>2]=l;d=c[138264]|0;if(d){e=c[138267]|0;g=d>>>3;i=g<<1;f=553088+(i<<2)|0;h=c[138262]|0;g=1<<g;if(h&g){i=553088+(i+2<<2)|0;h=c[i>>2]|0;if(h>>>0<(c[138266]|0)>>>0)Ga();else {p=i;o=h;}}else {c[138262]=h|g;p=553088+(i+2<<2)|0;o=f;}c[p>>2]=e;c[o+12>>2]=e;c[e+8>>2]=o;c[e+12>>2]=f;}c[138264]=l;c[138267]=b;}w=k+8|0;return w|0}else z=q;}else z=q;}else if(a>>>0<=4294967231){a=a+11|0;p=a&-8;k=c[138263]|0;if(k){j=0-p|0;a=a>>>8;if(a)if(p>>>0>16777215)l=31;else {q=(a+1048320|0)>>>16&8;w=a<<q;o=(w+520192|0)>>>16&4;w=w<<o;l=(w+245760|0)>>>16&2;l=14-(o|q|l)+(w<<l>>>15)|0;l=p>>>(l+7|0)&1|l<<1;}else l=0;a=c[553352+(l<<2)>>2]|0;a:do if(!a){h=0;a=0;w=86;}else {e=j;h=0;d=p<<((l|0)==31?0:25-(l>>>1)|0);b=a;a=0;while(1){g=c[b+4>>2]&-8;j=g-p|0;if(j>>>0<e>>>0)if((g|0)==(p|0)){g=b;a=b;w=90;break a}else a=b;else j=e;w=c[b+20>>2]|0;b=c[b+16+(d>>>31<<2)>>2]|0;h=(w|0)==0|(w|0)==(b|0)?h:w;if(!b){w=86;break}else {e=j;d=d<<1;}}}while(0);if((w|0)==86){if((h|0)==0&(a|0)==0){a=2<<l;a=k&(a|0-a);if(!a){z=p;break}a=(a&0-a)+-1|0;n=a>>>12&16;a=a>>>n;m=a>>>5&8;a=a>>>m;o=a>>>2&4;a=a>>>o;q=a>>>1&2;a=a>>>q;h=a>>>1&1;h=c[553352+((m|n|o|q|h)+(a>>>h)<<2)>>2]|0;a=0;}if(!h){n=j;q=a;}else {g=h;w=90;}}if((w|0)==90)while(1){w=0;q=(c[g+4>>2]&-8)-p|0;h=q>>>0<j>>>0;j=h?q:j;a=h?g:a;h=c[g+16>>2]|0;if(h){g=h;w=90;continue}g=c[g+20>>2]|0;if(!g){n=j;q=a;break}else w=90;}if((q|0)!=0?n>>>0<((c[138264]|0)-p|0)>>>0:0){a=c[138266]|0;if(q>>>0<a>>>0)Ga();m=q+p|0;if(q>>>0>=m>>>0)Ga();j=c[q+24>>2]|0;g=c[q+12>>2]|0;do if((g|0)==(q|0)){h=q+20|0;i=c[h>>2]|0;if(!i){h=q+16|0;i=c[h>>2]|0;if(!i){s=0;break}}while(1){g=i+20|0;f=c[g>>2]|0;if(f){i=f;h=g;continue}g=i+16|0;f=c[g>>2]|0;if(!f)break;else {i=f;h=g;}}if(h>>>0<a>>>0)Ga();else {c[h>>2]=0;s=i;break}}else {f=c[q+8>>2]|0;if(f>>>0<a>>>0)Ga();i=f+12|0;if((c[i>>2]|0)!=(q|0))Ga();h=g+8|0;if((c[h>>2]|0)==(q|0)){c[i>>2]=g;c[h>>2]=f;s=g;break}else Ga();}while(0);do if(j){i=c[q+28>>2]|0;h=553352+(i<<2)|0;if((q|0)==(c[h>>2]|0)){c[h>>2]=s;if(!s){c[138263]=c[138263]&~(1<<i);break}}else {if(j>>>0<(c[138266]|0)>>>0)Ga();i=j+16|0;if((c[i>>2]|0)==(q|0))c[i>>2]=s;else c[j+20>>2]=s;if(!s)break}h=c[138266]|0;if(s>>>0<h>>>0)Ga();c[s+24>>2]=j;i=c[q+16>>2]|0;do if(i)if(i>>>0<h>>>0)Ga();else {c[s+16>>2]=i;c[i+24>>2]=s;break}while(0);i=c[q+20>>2]|0;if(i)if(i>>>0<(c[138266]|0)>>>0)Ga();else {c[s+20>>2]=i;c[i+24>>2]=s;break}}while(0);b:do if(n>>>0>=16){c[q+4>>2]=p|3;c[q+(p|4)>>2]=n|1;c[q+(n+p)>>2]=n;i=n>>>3;if(n>>>0<256){h=i<<1;f=553088+(h<<2)|0;g=c[138262]|0;i=1<<i;if(g&i){i=553088+(h+2<<2)|0;h=c[i>>2]|0;if(h>>>0<(c[138266]|0)>>>0)Ga();else {t=i;u=h;}}else {c[138262]=g|i;t=553088+(h+2<<2)|0;u=f;}c[t>>2]=m;c[u+12>>2]=m;c[q+(p+8)>>2]=u;c[q+(p+12)>>2]=f;break}d=n>>>8;if(d)if(n>>>0>16777215)f=31;else {v=(d+1048320|0)>>>16&8;w=d<<v;u=(w+520192|0)>>>16&4;w=w<<u;f=(w+245760|0)>>>16&2;f=14-(u|v|f)+(w<<f>>>15)|0;f=n>>>(f+7|0)&1|f<<1;}else f=0;i=553352+(f<<2)|0;c[q+(p+28)>>2]=f;c[q+(p+20)>>2]=0;c[q+(p+16)>>2]=0;h=c[138263]|0;g=1<<f;if(!(h&g)){c[138263]=h|g;c[i>>2]=m;c[q+(p+24)>>2]=i;c[q+(p+12)>>2]=m;c[q+(p+8)>>2]=m;break}d=c[i>>2]|0;c:do if((c[d+4>>2]&-8|0)!=(n|0)){h=n<<((f|0)==31?0:25-(f>>>1)|0);while(1){b=d+16+(h>>>31<<2)|0;i=c[b>>2]|0;if(!i)break;if((c[i+4>>2]&-8|0)==(n|0)){z=i;break c}else {h=h<<1;d=i;}}if(b>>>0<(c[138266]|0)>>>0)Ga();else {c[b>>2]=m;c[q+(p+24)>>2]=d;c[q+(p+12)>>2]=m;c[q+(p+8)>>2]=m;break b}}else z=d;while(0);d=z+8|0;b=c[d>>2]|0;w=c[138266]|0;if(b>>>0>=w>>>0&z>>>0>=w>>>0){c[b+12>>2]=m;c[d>>2]=m;c[q+(p+8)>>2]=b;c[q+(p+12)>>2]=z;c[q+(p+24)>>2]=0;break}else Ga();}else {w=n+p|0;c[q+4>>2]=w|3;w=q+(w+4)|0;c[w>>2]=c[w>>2]|1;}while(0);w=q+8|0;return w|0}else z=p;}else z=p;}else z=-1;while(0);a=c[138264]|0;if(a>>>0>=z>>>0){b=a-z|0;d=c[138267]|0;if(b>>>0>15){c[138267]=d+z;c[138264]=b;c[d+(z+4)>>2]=b|1;c[d+a>>2]=b;c[d+4>>2]=z|3;}else {c[138264]=0;c[138267]=0;c[d+4>>2]=a|3;w=d+(a+4)|0;c[w>>2]=c[w>>2]|1;}w=d+8|0;return w|0}a=c[138265]|0;if(a>>>0>z>>>0){v=a-z|0;c[138265]=v;w=c[138268]|0;c[138268]=w+z;c[w+(z+4)>>2]=v|1;c[w+4>>2]=z|3;w=w+8|0;return w|0}do if(!(c[138380]|0)){a=za(30)|0;if(!(a+-1&a)){c[138382]=a;c[138381]=a;c[138383]=-1;c[138384]=-1;c[138385]=0;c[138373]=0;c[138380]=(Ha(0)|0)&-16^1431655768;break}else Ga();}while(0);l=z+48|0;d=c[138382]|0;b=z+47|0;e=d+b|0;d=0-d|0;m=e&d;if(m>>>0<=z>>>0){w=0;return w|0}a=c[138372]|0;if((a|0)!=0?(t=c[138370]|0,u=t+m|0,u>>>0<=t>>>0|u>>>0>a>>>0):0){w=0;return w|0}d:do if(!(c[138373]&4)){a=c[138268]|0;e:do if(a){h=553496;while(1){j=c[h>>2]|0;if(j>>>0<=a>>>0?(r=h+4|0,(j+(c[r>>2]|0)|0)>>>0>a>>>0):0){g=h;a=r;break}h=c[h+8>>2]|0;if(!h){w=174;break e}}j=e-(c[138265]|0)&d;if(j>>>0<2147483647){h=wa(j|0)|0;u=(h|0)==((c[g>>2]|0)+(c[a>>2]|0)|0);a=u?j:0;if(u){if((h|0)!=(-1|0)){x=h;w=194;break d}}else w=184;}else a=0;}else w=174;while(0);do if((w|0)==174){g=wa(0)|0;if((g|0)!=(-1|0)){a=g;j=c[138381]|0;h=j+-1|0;if(!(h&a))j=m;else j=m-a+(h+a&0-j)|0;a=c[138370]|0;h=a+j|0;if(j>>>0>z>>>0&j>>>0<2147483647){u=c[138372]|0;if((u|0)!=0?h>>>0<=a>>>0|h>>>0>u>>>0:0){a=0;break}h=wa(j|0)|0;w=(h|0)==(g|0);a=w?j:0;if(w){x=g;w=194;break d}else w=184;}else a=0;}else a=0;}while(0);f:do if((w|0)==184){g=0-j|0;do if(l>>>0>j>>>0&(j>>>0<2147483647&(h|0)!=(-1|0))?(v=c[138382]|0,v=b-j+v&0-v,v>>>0<2147483647):0)if((wa(v|0)|0)==(-1|0)){wa(g|0)|0;break f}else {j=v+j|0;break}while(0);if((h|0)!=(-1|0)){x=h;a=j;w=194;break d}}while(0);c[138373]=c[138373]|4;w=191;}else {a=0;w=191;}while(0);if((((w|0)==191?m>>>0<2147483647:0)?(x=wa(m|0)|0,y=wa(0)|0,x>>>0<y>>>0&((x|0)!=(-1|0)&(y|0)!=(-1|0))):0)?(A=y-x|0,B=A>>>0>(z+40|0)>>>0,B):0){a=B?A:a;w=194;}if((w|0)==194){j=(c[138370]|0)+a|0;c[138370]=j;if(j>>>0>(c[138371]|0)>>>0)c[138371]=j;n=c[138268]|0;g:do if(n){e=553496;do{j=c[e>>2]|0;h=e+4|0;g=c[h>>2]|0;if((x|0)==(j+g|0)){C=j;D=h;E=g;F=e;w=204;break}e=c[e+8>>2]|0;}while((e|0)!=0);if(((w|0)==204?(c[F+12>>2]&8|0)==0:0)?n>>>0<x>>>0&n>>>0>=C>>>0:0){c[D>>2]=E+a;w=(c[138265]|0)+a|0;v=n+8|0;v=(v&7|0)==0?0:0-v&7;u=w-v|0;c[138268]=n+v;c[138265]=u;c[n+(v+4)>>2]=u|1;c[n+(w+4)>>2]=40;c[138269]=c[138384];break}j=c[138266]|0;if(x>>>0<j>>>0){c[138266]=x;j=x;}h=x+a|0;e=553496;while(1){if((c[e>>2]|0)==(h|0)){g=e;h=e;w=212;break}e=c[e+8>>2]|0;if(!e){g=553496;break}}if((w|0)==212)if(!(c[h+12>>2]&8)){c[g>>2]=x;p=h+4|0;c[p>>2]=(c[p>>2]|0)+a;p=x+8|0;p=(p&7|0)==0?0:0-p&7;k=x+(a+8)|0;k=(k&7|0)==0?0:0-k&7;i=x+(k+a)|0;o=p+z|0;q=x+o|0;m=i-(x+p)-z|0;c[x+(p+4)>>2]=z|3;h:do if((i|0)!=(n|0)){if((i|0)==(c[138267]|0)){w=(c[138264]|0)+m|0;c[138264]=w;c[138267]=q;c[x+(o+4)>>2]=w|1;c[x+(w+o)>>2]=w;break}l=a+4|0;h=c[x+(l+k)>>2]|0;if((h&3|0)==1){b=h&-8;e=h>>>3;i:do if(h>>>0>=256){d=c[x+((k|24)+a)>>2]|0;g=c[x+(a+12+k)>>2]|0;do if((g|0)==(i|0)){f=k|16;g=x+(l+f)|0;h=c[g>>2]|0;if(!h){g=x+(f+a)|0;h=c[g>>2]|0;if(!h){K=0;break}}while(1){f=h+20|0;e=c[f>>2]|0;if(e){h=e;g=f;continue}f=h+16|0;e=c[f>>2]|0;if(!e)break;else {h=e;g=f;}}if(g>>>0<j>>>0)Ga();else {c[g>>2]=0;K=h;break}}else {f=c[x+((k|8)+a)>>2]|0;if(f>>>0<j>>>0)Ga();j=f+12|0;if((c[j>>2]|0)!=(i|0))Ga();h=g+8|0;if((c[h>>2]|0)==(i|0)){c[j>>2]=g;c[h>>2]=f;K=g;break}else Ga();}while(0);if(!d)break;j=c[x+(a+28+k)>>2]|0;h=553352+(j<<2)|0;do if((i|0)!=(c[h>>2]|0)){if(d>>>0<(c[138266]|0)>>>0)Ga();j=d+16|0;if((c[j>>2]|0)==(i|0))c[j>>2]=K;else c[d+20>>2]=K;if(!K)break i}else {c[h>>2]=K;if(K)break;c[138263]=c[138263]&~(1<<j);break i}while(0);h=c[138266]|0;if(K>>>0<h>>>0)Ga();c[K+24>>2]=d;j=k|16;i=c[x+(j+a)>>2]|0;do if(i)if(i>>>0<h>>>0)Ga();else {c[K+16>>2]=i;c[i+24>>2]=K;break}while(0);i=c[x+(l+j)>>2]|0;if(!i)break;if(i>>>0<(c[138266]|0)>>>0)Ga();else {c[K+20>>2]=i;c[i+24>>2]=K;break}}else {g=c[x+((k|8)+a)>>2]|0;f=c[x+(a+12+k)>>2]|0;h=553088+(e<<1<<2)|0;do if((g|0)!=(h|0)){if(g>>>0<j>>>0)Ga();if((c[g+12>>2]|0)==(i|0))break;Ga();}while(0);if((f|0)==(g|0)){c[138262]=c[138262]&~(1<<e);break}do if((f|0)==(h|0))G=f+8|0;else {if(f>>>0<j>>>0)Ga();j=f+8|0;if((c[j>>2]|0)==(i|0)){G=j;break}Ga();}while(0);c[g+12>>2]=f;c[G>>2]=g;}while(0);i=x+((b|k)+a)|0;j=b+m|0;}else j=m;i=i+4|0;c[i>>2]=c[i>>2]&-2;c[x+(o+4)>>2]=j|1;c[x+(j+o)>>2]=j;i=j>>>3;if(j>>>0<256){h=i<<1;f=553088+(h<<2)|0;g=c[138262]|0;i=1<<i;do if(!(g&i)){c[138262]=g|i;L=553088+(h+2<<2)|0;M=f;}else {i=553088+(h+2<<2)|0;h=c[i>>2]|0;if(h>>>0>=(c[138266]|0)>>>0){L=i;M=h;break}Ga();}while(0);c[L>>2]=q;c[M+12>>2]=q;c[x+(o+8)>>2]=M;c[x+(o+12)>>2]=f;break}d=j>>>8;do if(!d)f=0;else {if(j>>>0>16777215){f=31;break}v=(d+1048320|0)>>>16&8;w=d<<v;u=(w+520192|0)>>>16&4;w=w<<u;f=(w+245760|0)>>>16&2;f=14-(u|v|f)+(w<<f>>>15)|0;f=j>>>(f+7|0)&1|f<<1;}while(0);i=553352+(f<<2)|0;c[x+(o+28)>>2]=f;c[x+(o+20)>>2]=0;c[x+(o+16)>>2]=0;h=c[138263]|0;g=1<<f;if(!(h&g)){c[138263]=h|g;c[i>>2]=q;c[x+(o+24)>>2]=i;c[x+(o+12)>>2]=q;c[x+(o+8)>>2]=q;break}d=c[i>>2]|0;j:do if((c[d+4>>2]&-8|0)!=(j|0)){h=j<<((f|0)==31?0:25-(f>>>1)|0);while(1){b=d+16+(h>>>31<<2)|0;i=c[b>>2]|0;if(!i)break;if((c[i+4>>2]&-8|0)==(j|0)){N=i;break j}else {h=h<<1;d=i;}}if(b>>>0<(c[138266]|0)>>>0)Ga();else {c[b>>2]=q;c[x+(o+24)>>2]=d;c[x+(o+12)>>2]=q;c[x+(o+8)>>2]=q;break h}}else N=d;while(0);d=N+8|0;b=c[d>>2]|0;w=c[138266]|0;if(b>>>0>=w>>>0&N>>>0>=w>>>0){c[b+12>>2]=q;c[d>>2]=q;c[x+(o+8)>>2]=b;c[x+(o+12)>>2]=N;c[x+(o+24)>>2]=0;break}else Ga();}else {w=(c[138265]|0)+m|0;c[138265]=w;c[138268]=q;c[x+(o+4)>>2]=w|1;}while(0);w=x+(p|8)|0;return w|0}else g=553496;while(1){h=c[g>>2]|0;if(h>>>0<=n>>>0?(i=c[g+4>>2]|0,f=h+i|0,f>>>0>n>>>0):0)break;g=c[g+8>>2]|0;}j=h+(i+-39)|0;h=h+(i+-47+((j&7|0)==0?0:0-j&7))|0;j=n+16|0;h=h>>>0<j>>>0?n:h;i=h+8|0;g=x+8|0;g=(g&7|0)==0?0:0-g&7;w=a+-40-g|0;c[138268]=x+g;c[138265]=w;c[x+(g+4)>>2]=w|1;c[x+(a+-36)>>2]=40;c[138269]=c[138384];g=h+4|0;c[g>>2]=27;c[i>>2]=c[138374];c[i+4>>2]=c[138375];c[i+8>>2]=c[138376];c[i+12>>2]=c[138377];c[138374]=x;c[138375]=a;c[138377]=0;c[138376]=i;i=h+28|0;c[i>>2]=7;if((h+32|0)>>>0<f>>>0)do{w=i;i=i+4|0;c[i>>2]=7;}while((w+8|0)>>>0<f>>>0);if((h|0)!=(n|0)){f=h-n|0;c[g>>2]=c[g>>2]&-2;c[n+4>>2]=f|1;c[h>>2]=f;i=f>>>3;if(f>>>0<256){h=i<<1;f=553088+(h<<2)|0;g=c[138262]|0;i=1<<i;if(g&i){d=553088+(h+2<<2)|0;b=c[d>>2]|0;if(b>>>0<(c[138266]|0)>>>0)Ga();else {H=d;I=b;}}else {c[138262]=g|i;H=553088+(h+2<<2)|0;I=f;}c[H>>2]=n;c[I+12>>2]=n;c[n+8>>2]=I;c[n+12>>2]=f;break}d=f>>>8;if(d)if(f>>>0>16777215)h=31;else {v=(d+1048320|0)>>>16&8;w=d<<v;u=(w+520192|0)>>>16&4;w=w<<u;h=(w+245760|0)>>>16&2;h=14-(u|v|h)+(w<<h>>>15)|0;h=f>>>(h+7|0)&1|h<<1;}else h=0;i=553352+(h<<2)|0;c[n+28>>2]=h;c[n+20>>2]=0;c[j>>2]=0;d=c[138263]|0;b=1<<h;if(!(d&b)){c[138263]=d|b;c[i>>2]=n;c[n+24>>2]=i;c[n+12>>2]=n;c[n+8>>2]=n;break}d=c[i>>2]|0;k:do if((c[d+4>>2]&-8|0)!=(f|0)){i=f<<((h|0)==31?0:25-(h>>>1)|0);while(1){b=d+16+(i>>>31<<2)|0;e=c[b>>2]|0;if(!e)break;if((c[e+4>>2]&-8|0)==(f|0)){J=e;break k}else {i=i<<1;d=e;}}if(b>>>0<(c[138266]|0)>>>0)Ga();else {c[b>>2]=n;c[n+24>>2]=d;c[n+12>>2]=n;c[n+8>>2]=n;break g}}else J=d;while(0);d=J+8|0;b=c[d>>2]|0;w=c[138266]|0;if(b>>>0>=w>>>0&J>>>0>=w>>>0){c[b+12>>2]=n;c[d>>2]=n;c[n+8>>2]=b;c[n+12>>2]=J;c[n+24>>2]=0;break}else Ga();}}else {w=c[138266]|0;if((w|0)==0|x>>>0<w>>>0)c[138266]=x;c[138374]=x;c[138375]=a;c[138377]=0;c[138271]=c[138380];c[138270]=-1;d=0;do{w=d<<1;v=553088+(w<<2)|0;c[553088+(w+3<<2)>>2]=v;c[553088+(w+2<<2)>>2]=v;d=d+1|0;}while((d|0)!=32);w=x+8|0;w=(w&7|0)==0?0:0-w&7;v=a+-40-w|0;c[138268]=x+w;c[138265]=v;c[x+(w+4)>>2]=v|1;c[x+(a+-36)>>2]=40;c[138269]=c[138384];}while(0);b=c[138265]|0;if(b>>>0>z>>>0){v=b-z|0;c[138265]=v;w=c[138268]|0;c[138268]=w+z;c[w+(z+4)>>2]=v|1;c[w+4>>2]=z|3;w=w+8|0;return w|0}}c[(Ea()|0)>>2]=12;w=0;return w|0}function Md(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if(!a)return;g=a+-8|0;h=c[138266]|0;if(g>>>0<h>>>0)Ga();f=c[a+-4>>2]|0;e=f&3;if((e|0)==1)Ga();o=f&-8;q=a+(o+-8)|0;do if(!(f&1)){g=c[g>>2]|0;if(!e)return;i=-8-g|0;l=a+i|0;m=g+o|0;if(l>>>0<h>>>0)Ga();if((l|0)==(c[138267]|0)){g=a+(o+-4)|0;f=c[g>>2]|0;if((f&3|0)!=3){u=l;k=m;break}c[138264]=m;c[g>>2]=f&-2;c[a+(i+4)>>2]=m|1;c[q>>2]=m;return}d=g>>>3;if(g>>>0<256){e=c[a+(i+8)>>2]|0;f=c[a+(i+12)>>2]|0;g=553088+(d<<1<<2)|0;if((e|0)!=(g|0)){if(e>>>0<h>>>0)Ga();if((c[e+12>>2]|0)!=(l|0))Ga();}if((f|0)==(e|0)){c[138262]=c[138262]&~(1<<d);u=l;k=m;break}if((f|0)!=(g|0)){if(f>>>0<h>>>0)Ga();g=f+8|0;if((c[g>>2]|0)==(l|0))b=g;else Ga();}else b=f+8|0;c[e+12>>2]=f;c[b>>2]=e;u=l;k=m;break}b=c[a+(i+24)>>2]|0;e=c[a+(i+12)>>2]|0;do if((e|0)==(l|0)){f=a+(i+20)|0;g=c[f>>2]|0;if(!g){f=a+(i+16)|0;g=c[f>>2]|0;if(!g){j=0;break}}while(1){e=g+20|0;d=c[e>>2]|0;if(d){g=d;f=e;continue}e=g+16|0;d=c[e>>2]|0;if(!d)break;else {g=d;f=e;}}if(f>>>0<h>>>0)Ga();else {c[f>>2]=0;j=g;break}}else {d=c[a+(i+8)>>2]|0;if(d>>>0<h>>>0)Ga();g=d+12|0;if((c[g>>2]|0)!=(l|0))Ga();f=e+8|0;if((c[f>>2]|0)==(l|0)){c[g>>2]=e;c[f>>2]=d;j=e;break}else Ga();}while(0);if(b){g=c[a+(i+28)>>2]|0;f=553352+(g<<2)|0;if((l|0)==(c[f>>2]|0)){c[f>>2]=j;if(!j){c[138263]=c[138263]&~(1<<g);u=l;k=m;break}}else {if(b>>>0<(c[138266]|0)>>>0)Ga();g=b+16|0;if((c[g>>2]|0)==(l|0))c[g>>2]=j;else c[b+20>>2]=j;if(!j){u=l;k=m;break}}f=c[138266]|0;if(j>>>0<f>>>0)Ga();c[j+24>>2]=b;g=c[a+(i+16)>>2]|0;do if(g)if(g>>>0<f>>>0)Ga();else {c[j+16>>2]=g;c[g+24>>2]=j;break}while(0);g=c[a+(i+20)>>2]|0;if(g)if(g>>>0<(c[138266]|0)>>>0)Ga();else {c[j+20>>2]=g;c[g+24>>2]=j;u=l;k=m;break}else {u=l;k=m;}}else {u=l;k=m;}}else {u=g;k=o;}while(0);if(u>>>0>=q>>>0)Ga();g=a+(o+-4)|0;f=c[g>>2]|0;if(!(f&1))Ga();if(!(f&2)){if((q|0)==(c[138268]|0)){l=(c[138265]|0)+k|0;c[138265]=l;c[138268]=u;c[u+4>>2]=l|1;if((u|0)!=(c[138267]|0))return;c[138267]=0;c[138264]=0;return}if((q|0)==(c[138267]|0)){l=(c[138264]|0)+k|0;c[138264]=l;c[138267]=u;c[u+4>>2]=l|1;c[u+l>>2]=l;return}h=(f&-8)+k|0;b=f>>>3;do if(f>>>0>=256){b=c[a+(o+16)>>2]|0;g=c[a+(o|4)>>2]|0;do if((g|0)==(q|0)){f=a+(o+12)|0;g=c[f>>2]|0;if(!g){f=a+(o+8)|0;g=c[f>>2]|0;if(!g){p=0;break}}while(1){e=g+20|0;d=c[e>>2]|0;if(d){g=d;f=e;continue}e=g+16|0;d=c[e>>2]|0;if(!d)break;else {g=d;f=e;}}if(f>>>0<(c[138266]|0)>>>0)Ga();else {c[f>>2]=0;p=g;break}}else {f=c[a+o>>2]|0;if(f>>>0<(c[138266]|0)>>>0)Ga();e=f+12|0;if((c[e>>2]|0)!=(q|0))Ga();d=g+8|0;if((c[d>>2]|0)==(q|0)){c[e>>2]=g;c[d>>2]=f;p=g;break}else Ga();}while(0);if(b){g=c[a+(o+20)>>2]|0;f=553352+(g<<2)|0;if((q|0)==(c[f>>2]|0)){c[f>>2]=p;if(!p){c[138263]=c[138263]&~(1<<g);break}}else {if(b>>>0<(c[138266]|0)>>>0)Ga();g=b+16|0;if((c[g>>2]|0)==(q|0))c[g>>2]=p;else c[b+20>>2]=p;if(!p)break}g=c[138266]|0;if(p>>>0<g>>>0)Ga();c[p+24>>2]=b;f=c[a+(o+8)>>2]|0;do if(f)if(f>>>0<g>>>0)Ga();else {c[p+16>>2]=f;c[f+24>>2]=p;break}while(0);d=c[a+(o+12)>>2]|0;if(d)if(d>>>0<(c[138266]|0)>>>0)Ga();else {c[p+20>>2]=d;c[d+24>>2]=p;break}}}else {d=c[a+o>>2]|0;e=c[a+(o|4)>>2]|0;g=553088+(b<<1<<2)|0;if((d|0)!=(g|0)){if(d>>>0<(c[138266]|0)>>>0)Ga();if((c[d+12>>2]|0)!=(q|0))Ga();}if((e|0)==(d|0)){c[138262]=c[138262]&~(1<<b);break}if((e|0)!=(g|0)){if(e>>>0<(c[138266]|0)>>>0)Ga();f=e+8|0;if((c[f>>2]|0)==(q|0))n=f;else Ga();}else n=e+8|0;c[d+12>>2]=e;c[n>>2]=d;}while(0);c[u+4>>2]=h|1;c[u+h>>2]=h;if((u|0)==(c[138267]|0)){c[138264]=h;return}else g=h;}else {c[g>>2]=f&-2;c[u+4>>2]=k|1;c[u+k>>2]=k;g=k;}f=g>>>3;if(g>>>0<256){e=f<<1;g=553088+(e<<2)|0;b=c[138262]|0;d=1<<f;if(b&d){d=553088+(e+2<<2)|0;b=c[d>>2]|0;if(b>>>0<(c[138266]|0)>>>0)Ga();else {r=d;s=b;}}else {c[138262]=b|d;r=553088+(e+2<<2)|0;s=g;}c[r>>2]=u;c[s+12>>2]=u;c[u+8>>2]=s;c[u+12>>2]=g;return}b=g>>>8;if(b)if(g>>>0>16777215)f=31;else {k=(b+1048320|0)>>>16&8;l=b<<k;j=(l+520192|0)>>>16&4;l=l<<j;f=(l+245760|0)>>>16&2;f=14-(j|k|f)+(l<<f>>>15)|0;f=g>>>(f+7|0)&1|f<<1;}else f=0;d=553352+(f<<2)|0;c[u+28>>2]=f;c[u+20>>2]=0;c[u+16>>2]=0;b=c[138263]|0;e=1<<f;a:do if(b&e){d=c[d>>2]|0;b:do if((c[d+4>>2]&-8|0)!=(g|0)){f=g<<((f|0)==31?0:25-(f>>>1)|0);while(1){b=d+16+(f>>>31<<2)|0;e=c[b>>2]|0;if(!e)break;if((c[e+4>>2]&-8|0)==(g|0)){t=e;break b}else {f=f<<1;d=e;}}if(b>>>0<(c[138266]|0)>>>0)Ga();else {c[b>>2]=u;c[u+24>>2]=d;c[u+12>>2]=u;c[u+8>>2]=u;break a}}else t=d;while(0);b=t+8|0;d=c[b>>2]|0;l=c[138266]|0;if(d>>>0>=l>>>0&t>>>0>=l>>>0){c[d+12>>2]=u;c[b>>2]=u;c[u+8>>2]=d;c[u+12>>2]=t;c[u+24>>2]=0;break}else Ga();}else {c[138263]=b|e;c[d>>2]=u;c[u+24>>2]=d;c[u+12>>2]=u;c[u+8>>2]=u;}while(0);l=(c[138270]|0)+-1|0;c[138270]=l;if(!l)b=553504;else return;while(1){b=c[b>>2]|0;if(!b)break;else b=b+8|0;}c[138270]=-1;return}function Nd(a,b){a=a|0;b=b|0;var d=0;if(a){d=$(b,a)|0;if((b|a)>>>0>65535)d=((d>>>0)/(a>>>0)|0|0)==(b|0)?d:-1;}else d=0;b=Ld(d)|0;if(!b)return b|0;if(!(c[b+-4>>2]&3))return b|0;Sd(b|0,0,d|0)|0;return b|0}function Od(a,b){a=a|0;b=b|0;var d=0,e=0;if(!a){d=Ld(b)|0;return d|0}if(b>>>0>4294967231){c[(Ea()|0)>>2]=12;d=0;return d|0}d=Pd(a+-8|0,b>>>0<11?16:b+11&-8)|0;if(d){d=d+8|0;return d|0}d=Ld(b)|0;if(!d){d=0;return d|0}e=c[a+-4>>2]|0;e=(e&-8)-((e&3|0)==0?8:4)|0;Yd(d|0,a|0,(e>>>0<b>>>0?e:b)|0)|0;Md(a);return d|0}function Pd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;o=a+4|0;p=c[o>>2]|0;j=p&-8;l=a+j|0;i=c[138266]|0;e=p&3;if(!((e|0)!=1&a>>>0>=i>>>0&a>>>0<l>>>0))Ga();d=a+(j|4)|0;g=c[d>>2]|0;if(!(g&1))Ga();if(!e){if(b>>>0<256){m=0;return m|0}if(j>>>0>=(b+4|0)>>>0?(j-b|0)>>>0<=c[138382]<<1>>>0:0){m=a;return m|0}m=0;return m|0}if(j>>>0>=b>>>0){e=j-b|0;if(e>>>0<=15){m=a;return m|0}c[o>>2]=p&1|b|2;c[a+(b+4)>>2]=e|3;c[d>>2]=c[d>>2]|1;Qd(a+b|0,e);m=a;return m|0}if((l|0)==(c[138268]|0)){e=(c[138265]|0)+j|0;if(e>>>0<=b>>>0){m=0;return m|0}m=e-b|0;c[o>>2]=p&1|b|2;c[a+(b+4)>>2]=m|1;c[138268]=a+b;c[138265]=m;m=a;return m|0}if((l|0)==(c[138267]|0)){e=(c[138264]|0)+j|0;if(e>>>0<b>>>0){m=0;return m|0}d=e-b|0;if(d>>>0>15){c[o>>2]=p&1|b|2;c[a+(b+4)>>2]=d|1;c[a+e>>2]=d;e=a+(e+4)|0;c[e>>2]=c[e>>2]&-2;e=a+b|0;}else {c[o>>2]=p&1|e|2;e=a+(e+4)|0;c[e>>2]=c[e>>2]|1;e=0;d=0;}c[138264]=d;c[138267]=e;m=a;return m|0}if(g&2){m=0;return m|0}m=(g&-8)+j|0;if(m>>>0<b>>>0){m=0;return m|0}n=m-b|0;f=g>>>3;do if(g>>>0>=256){h=c[a+(j+24)>>2]|0;g=c[a+(j+12)>>2]|0;do if((g|0)==(l|0)){d=a+(j+20)|0;e=c[d>>2]|0;if(!e){d=a+(j+16)|0;e=c[d>>2]|0;if(!e){k=0;break}}while(1){f=e+20|0;g=c[f>>2]|0;if(g){e=g;d=f;continue}g=e+16|0;f=c[g>>2]|0;if(!f)break;else {e=f;d=g;}}if(d>>>0<i>>>0)Ga();else {c[d>>2]=0;k=e;break}}else {f=c[a+(j+8)>>2]|0;if(f>>>0<i>>>0)Ga();e=f+12|0;if((c[e>>2]|0)!=(l|0))Ga();d=g+8|0;if((c[d>>2]|0)==(l|0)){c[e>>2]=g;c[d>>2]=f;k=g;break}else Ga();}while(0);if(h){e=c[a+(j+28)>>2]|0;d=553352+(e<<2)|0;if((l|0)==(c[d>>2]|0)){c[d>>2]=k;if(!k){c[138263]=c[138263]&~(1<<e);break}}else {if(h>>>0<(c[138266]|0)>>>0)Ga();e=h+16|0;if((c[e>>2]|0)==(l|0))c[e>>2]=k;else c[h+20>>2]=k;if(!k)break}d=c[138266]|0;if(k>>>0<d>>>0)Ga();c[k+24>>2]=h;e=c[a+(j+16)>>2]|0;do if(e)if(e>>>0<d>>>0)Ga();else {c[k+16>>2]=e;c[e+24>>2]=k;break}while(0);e=c[a+(j+20)>>2]|0;if(e)if(e>>>0<(c[138266]|0)>>>0)Ga();else {c[k+20>>2]=e;c[e+24>>2]=k;break}}}else {g=c[a+(j+8)>>2]|0;d=c[a+(j+12)>>2]|0;e=553088+(f<<1<<2)|0;if((g|0)!=(e|0)){if(g>>>0<i>>>0)Ga();if((c[g+12>>2]|0)!=(l|0))Ga();}if((d|0)==(g|0)){c[138262]=c[138262]&~(1<<f);break}if((d|0)!=(e|0)){if(d>>>0<i>>>0)Ga();e=d+8|0;if((c[e>>2]|0)==(l|0))h=e;else Ga();}else h=d+8|0;c[g+12>>2]=d;c[h>>2]=g;}while(0);if(n>>>0<16){c[o>>2]=m|p&1|2;m=a+(m|4)|0;c[m>>2]=c[m>>2]|1;m=a;return m|0}else {c[o>>2]=p&1|b|2;c[a+(b+4)>>2]=n|3;m=a+(m|4)|0;c[m>>2]=c[m>>2]|1;Qd(a+b|0,n);m=a;return m|0}return 0}function Qd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;q=a+b|0;h=c[a+4>>2]|0;do if(!(h&1)){j=c[a>>2]|0;if(!(h&3))return;n=a+(0-j)|0;m=j+b|0;i=c[138266]|0;if(n>>>0<i>>>0)Ga();if((n|0)==(c[138267]|0)){g=a+(b+4)|0;h=c[g>>2]|0;if((h&3|0)!=3){t=n;l=m;break}c[138264]=m;c[g>>2]=h&-2;c[a+(4-j)>>2]=m|1;c[q>>2]=m;return}e=j>>>3;if(j>>>0<256){f=c[a+(8-j)>>2]|0;g=c[a+(12-j)>>2]|0;h=553088+(e<<1<<2)|0;if((f|0)!=(h|0)){if(f>>>0<i>>>0)Ga();if((c[f+12>>2]|0)!=(n|0))Ga();}if((g|0)==(f|0)){c[138262]=c[138262]&~(1<<e);t=n;l=m;break}if((g|0)!=(h|0)){if(g>>>0<i>>>0)Ga();h=g+8|0;if((c[h>>2]|0)==(n|0))d=h;else Ga();}else d=g+8|0;c[f+12>>2]=g;c[d>>2]=f;t=n;l=m;break}d=c[a+(24-j)>>2]|0;f=c[a+(12-j)>>2]|0;do if((f|0)==(n|0)){f=16-j|0;g=a+(f+4)|0;h=c[g>>2]|0;if(!h){g=a+f|0;h=c[g>>2]|0;if(!h){k=0;break}}while(1){f=h+20|0;e=c[f>>2]|0;if(e){h=e;g=f;continue}f=h+16|0;e=c[f>>2]|0;if(!e)break;else {h=e;g=f;}}if(g>>>0<i>>>0)Ga();else {c[g>>2]=0;k=h;break}}else {e=c[a+(8-j)>>2]|0;if(e>>>0<i>>>0)Ga();h=e+12|0;if((c[h>>2]|0)!=(n|0))Ga();g=f+8|0;if((c[g>>2]|0)==(n|0)){c[h>>2]=f;c[g>>2]=e;k=f;break}else Ga();}while(0);if(d){h=c[a+(28-j)>>2]|0;g=553352+(h<<2)|0;if((n|0)==(c[g>>2]|0)){c[g>>2]=k;if(!k){c[138263]=c[138263]&~(1<<h);t=n;l=m;break}}else {if(d>>>0<(c[138266]|0)>>>0)Ga();h=d+16|0;if((c[h>>2]|0)==(n|0))c[h>>2]=k;else c[d+20>>2]=k;if(!k){t=n;l=m;break}}f=c[138266]|0;if(k>>>0<f>>>0)Ga();c[k+24>>2]=d;h=16-j|0;g=c[a+h>>2]|0;do if(g)if(g>>>0<f>>>0)Ga();else {c[k+16>>2]=g;c[g+24>>2]=k;break}while(0);h=c[a+(h+4)>>2]|0;if(h)if(h>>>0<(c[138266]|0)>>>0)Ga();else {c[k+20>>2]=h;c[h+24>>2]=k;t=n;l=m;break}else {t=n;l=m;}}else {t=n;l=m;}}else {t=a;l=b;}while(0);i=c[138266]|0;if(q>>>0<i>>>0)Ga();h=a+(b+4)|0;g=c[h>>2]|0;if(!(g&2)){if((q|0)==(c[138268]|0)){m=(c[138265]|0)+l|0;c[138265]=m;c[138268]=t;c[t+4>>2]=m|1;if((t|0)!=(c[138267]|0))return;c[138267]=0;c[138264]=0;return}if((q|0)==(c[138267]|0)){m=(c[138264]|0)+l|0;c[138264]=m;c[138267]=t;c[t+4>>2]=m|1;c[t+m>>2]=m;return}j=(g&-8)+l|0;d=g>>>3;do if(g>>>0>=256){d=c[a+(b+24)>>2]|0;f=c[a+(b+12)>>2]|0;do if((f|0)==(q|0)){g=a+(b+20)|0;h=c[g>>2]|0;if(!h){g=a+(b+16)|0;h=c[g>>2]|0;if(!h){p=0;break}}while(1){f=h+20|0;e=c[f>>2]|0;if(e){h=e;g=f;continue}f=h+16|0;e=c[f>>2]|0;if(!e)break;else {h=e;g=f;}}if(g>>>0<i>>>0)Ga();else {c[g>>2]=0;p=h;break}}else {e=c[a+(b+8)>>2]|0;if(e>>>0<i>>>0)Ga();h=e+12|0;if((c[h>>2]|0)!=(q|0))Ga();g=f+8|0;if((c[g>>2]|0)==(q|0)){c[h>>2]=f;c[g>>2]=e;p=f;break}else Ga();}while(0);if(d){h=c[a+(b+28)>>2]|0;g=553352+(h<<2)|0;if((q|0)==(c[g>>2]|0)){c[g>>2]=p;if(!p){c[138263]=c[138263]&~(1<<h);break}}else {if(d>>>0<(c[138266]|0)>>>0)Ga();g=d+16|0;if((c[g>>2]|0)==(q|0))c[g>>2]=p;else c[d+20>>2]=p;if(!p)break}f=c[138266]|0;if(p>>>0<f>>>0)Ga();c[p+24>>2]=d;g=c[a+(b+16)>>2]|0;do if(g)if(g>>>0<f>>>0)Ga();else {c[p+16>>2]=g;c[g+24>>2]=p;break}while(0);f=c[a+(b+20)>>2]|0;if(f)if(f>>>0<(c[138266]|0)>>>0)Ga();else {c[p+20>>2]=f;c[f+24>>2]=p;break}}}else {e=c[a+(b+8)>>2]|0;f=c[a+(b+12)>>2]|0;h=553088+(d<<1<<2)|0;if((e|0)!=(h|0)){if(e>>>0<i>>>0)Ga();if((c[e+12>>2]|0)!=(q|0))Ga();}if((f|0)==(e|0)){c[138262]=c[138262]&~(1<<d);break}if((f|0)!=(h|0)){if(f>>>0<i>>>0)Ga();g=f+8|0;if((c[g>>2]|0)==(q|0))o=g;else Ga();}else o=f+8|0;c[e+12>>2]=f;c[o>>2]=e;}while(0);c[t+4>>2]=j|1;c[t+j>>2]=j;if((t|0)==(c[138267]|0)){c[138264]=j;return}else h=j;}else {c[h>>2]=g&-2;c[t+4>>2]=l|1;c[t+l>>2]=l;h=l;}g=h>>>3;if(h>>>0<256){e=g<<1;h=553088+(e<<2)|0;d=c[138262]|0;f=1<<g;if(d&f){f=553088+(e+2<<2)|0;e=c[f>>2]|0;if(e>>>0<(c[138266]|0)>>>0)Ga();else {r=f;s=e;}}else {c[138262]=d|f;r=553088+(e+2<<2)|0;s=h;}c[r>>2]=t;c[s+12>>2]=t;c[t+8>>2]=s;c[t+12>>2]=h;return}d=h>>>8;if(d)if(h>>>0>16777215)g=31;else {l=(d+1048320|0)>>>16&8;m=d<<l;k=(m+520192|0)>>>16&4;m=m<<k;g=(m+245760|0)>>>16&2;g=14-(k|l|g)+(m<<g>>>15)|0;g=h>>>(g+7|0)&1|g<<1;}else g=0;f=553352+(g<<2)|0;c[t+28>>2]=g;c[t+20>>2]=0;c[t+16>>2]=0;e=c[138263]|0;d=1<<g;if(!(e&d)){c[138263]=e|d;c[f>>2]=t;c[t+24>>2]=f;c[t+12>>2]=t;c[t+8>>2]=t;return}d=c[f>>2]|0;a:do if((c[d+4>>2]&-8|0)!=(h|0)){g=h<<((g|0)==31?0:25-(g>>>1)|0);while(1){e=d+16+(g>>>31<<2)|0;f=c[e>>2]|0;if(!f)break;if((c[f+4>>2]&-8|0)==(h|0)){d=f;break a}else {g=g<<1;d=f;}}if(e>>>0<(c[138266]|0)>>>0)Ga();c[e>>2]=t;c[t+24>>2]=d;c[t+12>>2]=t;c[t+8>>2]=t;return}while(0);e=d+8|0;f=c[e>>2]|0;m=c[138266]|0;if(!(f>>>0>=m>>>0&d>>>0>=m>>>0))Ga();c[f+12>>2]=t;c[e>>2]=t;c[t+8>>2]=f;c[t+12>>2]=d;c[t+24>>2]=0;return}function Rd(){c[6410]=n;}function Sd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;h=b&3;i=d|d<<8|d<<16|d<<24;g=f&~3;if(h){h=b+4-h|0;while((b|0)<(h|0)){a[b>>0]=d;b=b+1|0;}}while((b|0)<(g|0)){c[b>>2]=i;b=b+4|0;}}while((b|0)<(f|0)){a[b>>0]=d;b=b+1|0;}return b-e|0}function Td(b){b=b|0;var c=0;c=b;while(a[c>>0]|0)c=c+1|0;return c-b|0}function Ud(b,c){b=b|0;c=c|0;var d=0,e=0;e=b+(Td(b)|0)|0;do{a[e+d>>0]=a[c+d>>0];d=d+1|0;}while(a[c+(d-1)>>0]|0);return b|0}function Vd(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){D=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}D=a<<c-32;return 0}function Wd(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;c=a+c>>>0;return (D=b+d+(c>>>0<a>>>0|0)>>>0,c|0)|0}function Xd(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){D=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}D=0;return b>>>c-32|0}function Yd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return ya(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if(!e)return f|0;a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0;}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0;}}while((e|0)>0){a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0;}return f|0}function Zd(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if((c|0)<(b|0)&(b|0)<(c+d|0)){e=b;c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b>>0]=a[c>>0]|0;}b=e;}else Yd(b,c,d)|0;return b|0}function _d(b,c){b=b|0;c=c|0;var d=0;do{a[b+d>>0]=a[c+d>>0];d=d+1|0;}while(a[c+(d-1)>>0]|0);return b|0}function $d(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;b=b-d-(c>>>0>a>>>0|0)>>>0;return (D=b,a-c>>>0|0)|0}function ae(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){D=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}D=(b|0)<0?-1:0;return b>>c-32|0}function be(b){b=b|0;var c=0;c=a[m+(b&255)>>0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)>>0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)>>0]|0;if((c|0)<8)return c+16|0;return (a[m+(b>>>24)>>0]|0)+24|0}function ce(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;f=a&65535;d=b&65535;c=$(d,f)|0;e=a>>>16;d=(c>>>16)+($(d,e)|0)|0;b=b>>>16;a=$(b,f)|0;return (D=(d>>>16)+($(b,e)|0)+(((d&65535)+a|0)>>>16)|0,d+a<<16|c&65535|0)|0}function de(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;j=b>>31|((b|0)<0?-1:0)<<1;i=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;f=d>>31|((d|0)<0?-1:0)<<1;e=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;h=$d(j^a,i^b,j,i)|0;g=D;b=f^j;a=e^i;return $d((ie(h,g,$d(f^c,e^d,f,e)|0,D,0)|0)^b,D^a,b,a)|0}function ee(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+8|0;j=f|0;h=b>>31|((b|0)<0?-1:0)<<1;g=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;l=e>>31|((e|0)<0?-1:0)<<1;k=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;b=$d(h^a,g^b,h,g)|0;a=D;ie(b,a,$d(l^d,k^e,l,k)|0,D,j)|0;a=$d(c[j>>2]^h,c[j+4>>2]^g,h,g)|0;b=D;i=f;return (D=b,a)|0}function fe(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;f=c;a=ce(e,f)|0;c=D;return (D=($(b,f)|0)+($(d,e)|0)+c|c&0,a|0|0)|0}function ge(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ie(a,b,c,d,0)|0}function he(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=i;i=i+8|0;f=g|0;ie(a,b,d,e,f)|0;i=g;return (D=c[f+4>>2]|0,c[f>>2]|0)|0}function ie(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;n=a;l=b;m=l;k=d;o=e;i=o;if(!m){g=(f|0)!=0;if(!i){if(g){c[f>>2]=(n>>>0)%(k>>>0);c[f+4>>2]=0;}l=0;m=(n>>>0)/(k>>>0)>>>0;return (D=l,m)|0}else {if(!g){l=0;m=0;return (D=l,m)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;l=0;m=0;return (D=l,m)|0}}j=(i|0)==0;do if(k){if(!j){h=(ba(i|0)|0)-(ba(m|0)|0)|0;if(h>>>0<=31){g=h+1|0;l=31-h|0;k=h-31>>31;i=g;j=n>>>(g>>>0)&k|m<<l;k=m>>>(g>>>0)&k;g=0;h=n<<l;break}if(!f){l=0;m=0;return (D=l,m)|0}c[f>>2]=a|0;c[f+4>>2]=l|b&0;l=0;m=0;return (D=l,m)|0}j=k-1|0;if(j&k){h=(ba(k|0)|0)+33-(ba(m|0)|0)|0;p=64-h|0;l=32-h|0;a=l>>31;b=h-32|0;k=b>>31;i=h;j=l-1>>31&m>>>(b>>>0)|(m<<l|n>>>(h>>>0))&k;k=k&m>>>(h>>>0);g=n<<p&a;h=(m<<p|n>>>(b>>>0))&a|n<<l&h-33>>31;break}if(f){c[f>>2]=j&n;c[f+4>>2]=0;}if((k|0)==1){l=l|b&0;m=a|0|0;return (D=l,m)|0}else {a=be(k|0)|0;l=m>>>(a>>>0)|0;m=m<<32-a|n>>>(a>>>0)|0;return (D=l,m)|0}}else {if(j){if(f){c[f>>2]=(m>>>0)%(k>>>0);c[f+4>>2]=0;}l=0;m=(m>>>0)/(k>>>0)>>>0;return (D=l,m)|0}if(!n){if(f){c[f>>2]=0;c[f+4>>2]=(m>>>0)%(i>>>0);}l=0;m=(m>>>0)/(i>>>0)>>>0;return (D=l,m)|0}j=i-1|0;if(!(j&i)){if(f){c[f>>2]=a|0;c[f+4>>2]=j&m|b&0;}l=0;m=m>>>((be(i|0)|0)>>>0);return (D=l,m)|0}h=(ba(i|0)|0)-(ba(m|0)|0)|0;if(h>>>0<=30){k=h+1|0;h=31-h|0;i=k;j=m<<h|n>>>(k>>>0);k=m>>>(k>>>0);g=0;h=n<<h;break}if(!f){l=0;m=0;return (D=l,m)|0}c[f>>2]=a|0;c[f+4>>2]=l|b&0;l=0;m=0;return (D=l,m)|0}while(0);if(!i){l=h;i=0;h=0;}else {m=d|0|0;l=o|e&0;b=Wd(m|0,l|0,-1,-1)|0;a=D;d=h;h=0;do{p=d;d=g>>>31|d<<1;g=h|g<<1;p=j<<1|p>>>31|0;o=j>>>31|k<<1|0;$d(b,a,p,o)|0;n=D;e=n>>31|((n|0)<0?-1:0)<<1;h=e&1;j=$d(p,o,e&m,(((n|0)<0?-1:0)>>31|((n|0)<0?-1:0)<<1)&l)|0;k=D;i=i-1|0;}while((i|0)!=0);l=d;i=0;}d=0;if(f){c[f>>2]=j;c[f+4>>2]=k;}l=(g|0)>>>31|(l|d)<<1|(d<<1|g>>>31)&0|i;m=(g<<1|0>>>31)&-2|h;return (D=l,m)|0}function je(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return La[a&3](b|0,c|0,d|0,e|0)|0}function ke(a,b){a=a|0;b=b|0;Ma[a&7](b|0);}function le(a,b,c){a=a|0;b=b|0;c=c|0;Na[a&3](b|0,c|0);}function me(a,b){a=a|0;b=b|0;return Oa[a&1](b|0)|0}function ne(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Pa[a&1](b|0,c|0,d|0);}function oe(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;return Qa[a&3](b|0,c|0,d|0,e|0,f|0,g|0,h|0,i|0)|0}function pe(a,b,c){a=a|0;b=b|0;c=c|0;return Ra[a&15](b|0,c|0)|0}function qe(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return Sa[a&7](b|0,c|0,d|0,e|0,f|0)|0}function re(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ca(0);return 0}function se(a){a=a|0;ca(1);}function te(a,b){a=a|0;b=b|0;ca(2);}function ue(a){a=a|0;ca(3);return 0}function ve(a,b,c){a=a|0;b=b|0;c=c|0;ca(4);}function we(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;ca(5);return 0}function xe(a,b){a=a|0;b=b|0;ca(6);return 0}function ye(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ca(7);return 0}

// EMSCRIPTEN_END_FUNCS
var La=[re,ec,Mb,Nb];var Ma=[se,bc,cc,rc,Pc,Qc,se,se];var Na=[te,_b,Rc,te];var Oa=[ue,sc];var Pa=[ve,pc];var Qa=[we,Vc,Zc,we];var Ra=[xe,$b,ac,dc,qc,tc,Sc,Tc,fc,Oc,jd,xe,xe,xe,xe,xe];var Sa=[ye,Uc,Wc,Xc,Yc,_c,ye,ye];return {_memmove:Zd,_strlen:Td,_strcat:Ud,_free:Md,_i64Add:Wd,_encoder_clear:yd,_encoder_transfer_data:Cd,_encoder_data_len:Bd,_memset:Sd,_malloc:Ld,_memcpy:Yd,_encoder_init:xd,_encoder_process:Ad,_bitshift64Lshr:Xd,_bitshift64Shl:Vd,_strcpy:_d,_encoder_analysis_buffer:zd,runPostSets:Rd,stackAlloc:Ta,stackSave:Ua,stackRestore:Va,establishStackSpace:Wa,setThrew:Xa,setTempRet0:_a,getTempRet0:$a,dynCall_iiiii:je,dynCall_vi:ke,dynCall_vii:le,dynCall_ii:me,dynCall_viii:ne,dynCall_iiiiiiiii:oe,dynCall_iii:pe,dynCall_iiiiii:qe}})


// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg,Module.asmLibraryArg,buffer);var runPostSets=Module["runPostSets"]=asm["runPostSets"];var _strlen=Module["_strlen"]=asm["_strlen"];var _strcat=Module["_strcat"]=asm["_strcat"];var _free=Module["_free"]=asm["_free"];var _encoder_init=Module["_encoder_init"]=asm["_encoder_init"];var _i64Add=Module["_i64Add"]=asm["_i64Add"];var _memmove=Module["_memmove"]=asm["_memmove"];var _encoder_transfer_data=Module["_encoder_transfer_data"]=asm["_encoder_transfer_data"];var _encoder_process=Module["_encoder_process"]=asm["_encoder_process"];var _encoder_data_len=Module["_encoder_data_len"]=asm["_encoder_data_len"];var _memset=Module["_memset"]=asm["_memset"];var _malloc=Module["_malloc"]=asm["_malloc"];var _memcpy=Module["_memcpy"]=asm["_memcpy"];var _encoder_clear=Module["_encoder_clear"]=asm["_encoder_clear"];var _bitshift64Lshr=Module["_bitshift64Lshr"]=asm["_bitshift64Lshr"];var _encoder_analysis_buffer=Module["_encoder_analysis_buffer"]=asm["_encoder_analysis_buffer"];var _strcpy=Module["_strcpy"]=asm["_strcpy"];var _bitshift64Shl=Module["_bitshift64Shl"]=asm["_bitshift64Shl"];var dynCall_iiiii=Module["dynCall_iiiii"]=asm["dynCall_iiiii"];var dynCall_vi=Module["dynCall_vi"]=asm["dynCall_vi"];var dynCall_vii=Module["dynCall_vii"]=asm["dynCall_vii"];var dynCall_ii=Module["dynCall_ii"]=asm["dynCall_ii"];var dynCall_viii=Module["dynCall_viii"]=asm["dynCall_viii"];var dynCall_iiiiiiiii=Module["dynCall_iiiiiiiii"]=asm["dynCall_iiiiiiiii"];var dynCall_iii=Module["dynCall_iii"]=asm["dynCall_iii"];var dynCall_iiiiii=Module["dynCall_iiiiii"]=asm["dynCall_iiiiii"];Runtime.stackAlloc=asm["stackAlloc"];Runtime.stackSave=asm["stackSave"];Runtime.stackRestore=asm["stackRestore"];Runtime.establishStackSpace=asm["establishStackSpace"];Runtime.setTempRet0=asm["setTempRet0"];Runtime.getTempRet0=asm["getTempRet0"];var i64Math=(function(){var goog={math:{}};goog.math.Long=(function(low,high){this.low_=low|0;this.high_=high|0;});goog.math.Long.IntCache_={};goog.math.Long.fromInt=(function(value){if(-128<=value&&value<128){var cachedObj=goog.math.Long.IntCache_[value];if(cachedObj){return cachedObj}}var obj=new goog.math.Long(value|0,value<0?-1:0);if(-128<=value&&value<128){goog.math.Long.IntCache_[value]=obj;}return obj});goog.math.Long.fromNumber=(function(value){if(isNaN(value)||!isFinite(value)){return goog.math.Long.ZERO}else if(value<=-goog.math.Long.TWO_PWR_63_DBL_){return goog.math.Long.MIN_VALUE}else if(value+1>=goog.math.Long.TWO_PWR_63_DBL_){return goog.math.Long.MAX_VALUE}else if(value<0){return goog.math.Long.fromNumber(-value).negate()}else {return new goog.math.Long(value%goog.math.Long.TWO_PWR_32_DBL_|0,value/goog.math.Long.TWO_PWR_32_DBL_|0)}});goog.math.Long.fromBits=(function(lowBits,highBits){return new goog.math.Long(lowBits,highBits)});goog.math.Long.fromString=(function(str,opt_radix){if(str.length==0){throw Error("number format error: empty string")}var radix=opt_radix||10;if(radix<2||36<radix){throw Error("radix out of range: "+radix)}if(str.charAt(0)=="-"){return goog.math.Long.fromString(str.substring(1),radix).negate()}else if(str.indexOf("-")>=0){throw Error('number format error: interior "-" character: '+str)}var radixToPower=goog.math.Long.fromNumber(Math.pow(radix,8));var result=goog.math.Long.ZERO;for(var i=0;i<str.length;i+=8){var size=Math.min(8,str.length-i);var value=parseInt(str.substring(i,i+size),radix);if(size<8){var power=goog.math.Long.fromNumber(Math.pow(radix,size));result=result.multiply(power).add(goog.math.Long.fromNumber(value));}else {result=result.multiply(radixToPower);result=result.add(goog.math.Long.fromNumber(value));}}return result});goog.math.Long.TWO_PWR_16_DBL_=1<<16;goog.math.Long.TWO_PWR_24_DBL_=1<<24;goog.math.Long.TWO_PWR_32_DBL_=goog.math.Long.TWO_PWR_16_DBL_*goog.math.Long.TWO_PWR_16_DBL_;goog.math.Long.TWO_PWR_31_DBL_=goog.math.Long.TWO_PWR_32_DBL_/2;goog.math.Long.TWO_PWR_48_DBL_=goog.math.Long.TWO_PWR_32_DBL_*goog.math.Long.TWO_PWR_16_DBL_;goog.math.Long.TWO_PWR_64_DBL_=goog.math.Long.TWO_PWR_32_DBL_*goog.math.Long.TWO_PWR_32_DBL_;goog.math.Long.TWO_PWR_63_DBL_=goog.math.Long.TWO_PWR_64_DBL_/2;goog.math.Long.ZERO=goog.math.Long.fromInt(0);goog.math.Long.ONE=goog.math.Long.fromInt(1);goog.math.Long.NEG_ONE=goog.math.Long.fromInt(-1);goog.math.Long.MAX_VALUE=goog.math.Long.fromBits(4294967295|0,2147483647|0);goog.math.Long.MIN_VALUE=goog.math.Long.fromBits(0,2147483648|0);goog.math.Long.TWO_PWR_24_=goog.math.Long.fromInt(1<<24);goog.math.Long.prototype.toInt=(function(){return this.low_});goog.math.Long.prototype.toNumber=(function(){return this.high_*goog.math.Long.TWO_PWR_32_DBL_+this.getLowBitsUnsigned()});goog.math.Long.prototype.toString=(function(opt_radix){var radix=opt_radix||10;if(radix<2||36<radix){throw Error("radix out of range: "+radix)}if(this.isZero()){return "0"}if(this.isNegative()){if(this.equals(goog.math.Long.MIN_VALUE)){var radixLong=goog.math.Long.fromNumber(radix);var div=this.div(radixLong);var rem=div.multiply(radixLong).subtract(this);return div.toString(radix)+rem.toInt().toString(radix)}else {return "-"+this.negate().toString(radix)}}var radixToPower=goog.math.Long.fromNumber(Math.pow(radix,6));var rem=this;var result="";while(true){var remDiv=rem.div(radixToPower);var intval=rem.subtract(remDiv.multiply(radixToPower)).toInt();var digits=intval.toString(radix);rem=remDiv;if(rem.isZero()){return digits+result}else {while(digits.length<6){digits="0"+digits;}result=""+digits+result;}}});goog.math.Long.prototype.getHighBits=(function(){return this.high_});goog.math.Long.prototype.getLowBits=(function(){return this.low_});goog.math.Long.prototype.getLowBitsUnsigned=(function(){return this.low_>=0?this.low_:goog.math.Long.TWO_PWR_32_DBL_+this.low_});goog.math.Long.prototype.getNumBitsAbs=(function(){if(this.isNegative()){if(this.equals(goog.math.Long.MIN_VALUE)){return 64}else {return this.negate().getNumBitsAbs()}}else {var val=this.high_!=0?this.high_:this.low_;for(var bit=31;bit>0;bit--){if((val&1<<bit)!=0){break}}return this.high_!=0?bit+33:bit+1}});goog.math.Long.prototype.isZero=(function(){return this.high_==0&&this.low_==0});goog.math.Long.prototype.isNegative=(function(){return this.high_<0});goog.math.Long.prototype.isOdd=(function(){return (this.low_&1)==1});goog.math.Long.prototype.equals=(function(other){return this.high_==other.high_&&this.low_==other.low_});goog.math.Long.prototype.notEquals=(function(other){return this.high_!=other.high_||this.low_!=other.low_});goog.math.Long.prototype.lessThan=(function(other){return this.compare(other)<0});goog.math.Long.prototype.lessThanOrEqual=(function(other){return this.compare(other)<=0});goog.math.Long.prototype.greaterThan=(function(other){return this.compare(other)>0});goog.math.Long.prototype.greaterThanOrEqual=(function(other){return this.compare(other)>=0});goog.math.Long.prototype.compare=(function(other){if(this.equals(other)){return 0}var thisNeg=this.isNegative();var otherNeg=other.isNegative();if(thisNeg&&!otherNeg){return -1}if(!thisNeg&&otherNeg){return 1}if(this.subtract(other).isNegative()){return -1}else {return 1}});goog.math.Long.prototype.negate=(function(){if(this.equals(goog.math.Long.MIN_VALUE)){return goog.math.Long.MIN_VALUE}else {return this.not().add(goog.math.Long.ONE)}});goog.math.Long.prototype.add=(function(other){var a48=this.high_>>>16;var a32=this.high_&65535;var a16=this.low_>>>16;var a00=this.low_&65535;var b48=other.high_>>>16;var b32=other.high_&65535;var b16=other.low_>>>16;var b00=other.low_&65535;var c48=0,c32=0,c16=0,c00=0;c00+=a00+b00;c16+=c00>>>16;c00&=65535;c16+=a16+b16;c32+=c16>>>16;c16&=65535;c32+=a32+b32;c48+=c32>>>16;c32&=65535;c48+=a48+b48;c48&=65535;return goog.math.Long.fromBits(c16<<16|c00,c48<<16|c32)});goog.math.Long.prototype.subtract=(function(other){return this.add(other.negate())});goog.math.Long.prototype.multiply=(function(other){if(this.isZero()){return goog.math.Long.ZERO}else if(other.isZero()){return goog.math.Long.ZERO}if(this.equals(goog.math.Long.MIN_VALUE)){return other.isOdd()?goog.math.Long.MIN_VALUE:goog.math.Long.ZERO}else if(other.equals(goog.math.Long.MIN_VALUE)){return this.isOdd()?goog.math.Long.MIN_VALUE:goog.math.Long.ZERO}if(this.isNegative()){if(other.isNegative()){return this.negate().multiply(other.negate())}else {return this.negate().multiply(other).negate()}}else if(other.isNegative()){return this.multiply(other.negate()).negate()}if(this.lessThan(goog.math.Long.TWO_PWR_24_)&&other.lessThan(goog.math.Long.TWO_PWR_24_)){return goog.math.Long.fromNumber(this.toNumber()*other.toNumber())}var a48=this.high_>>>16;var a32=this.high_&65535;var a16=this.low_>>>16;var a00=this.low_&65535;var b48=other.high_>>>16;var b32=other.high_&65535;var b16=other.low_>>>16;var b00=other.low_&65535;var c48=0,c32=0,c16=0,c00=0;c00+=a00*b00;c16+=c00>>>16;c00&=65535;c16+=a16*b00;c32+=c16>>>16;c16&=65535;c16+=a00*b16;c32+=c16>>>16;c16&=65535;c32+=a32*b00;c48+=c32>>>16;c32&=65535;c32+=a16*b16;c48+=c32>>>16;c32&=65535;c32+=a00*b32;c48+=c32>>>16;c32&=65535;c48+=a48*b00+a32*b16+a16*b32+a00*b48;c48&=65535;return goog.math.Long.fromBits(c16<<16|c00,c48<<16|c32)});goog.math.Long.prototype.div=(function(other){if(other.isZero()){throw Error("division by zero")}else if(this.isZero()){return goog.math.Long.ZERO}if(this.equals(goog.math.Long.MIN_VALUE)){if(other.equals(goog.math.Long.ONE)||other.equals(goog.math.Long.NEG_ONE)){return goog.math.Long.MIN_VALUE}else if(other.equals(goog.math.Long.MIN_VALUE)){return goog.math.Long.ONE}else {var halfThis=this.shiftRight(1);var approx=halfThis.div(other).shiftLeft(1);if(approx.equals(goog.math.Long.ZERO)){return other.isNegative()?goog.math.Long.ONE:goog.math.Long.NEG_ONE}else {var rem=this.subtract(other.multiply(approx));var result=approx.add(rem.div(other));return result}}}else if(other.equals(goog.math.Long.MIN_VALUE)){return goog.math.Long.ZERO}if(this.isNegative()){if(other.isNegative()){return this.negate().div(other.negate())}else {return this.negate().div(other).negate()}}else if(other.isNegative()){return this.div(other.negate()).negate()}var res=goog.math.Long.ZERO;var rem=this;while(rem.greaterThanOrEqual(other)){var approx=Math.max(1,Math.floor(rem.toNumber()/other.toNumber()));var log2=Math.ceil(Math.log(approx)/Math.LN2);var delta=log2<=48?1:Math.pow(2,log2-48);var approxRes=goog.math.Long.fromNumber(approx);var approxRem=approxRes.multiply(other);while(approxRem.isNegative()||approxRem.greaterThan(rem)){approx-=delta;approxRes=goog.math.Long.fromNumber(approx);approxRem=approxRes.multiply(other);}if(approxRes.isZero()){approxRes=goog.math.Long.ONE;}res=res.add(approxRes);rem=rem.subtract(approxRem);}return res});goog.math.Long.prototype.modulo=(function(other){return this.subtract(this.div(other).multiply(other))});goog.math.Long.prototype.not=(function(){return goog.math.Long.fromBits(~this.low_,~this.high_)});goog.math.Long.prototype.and=(function(other){return goog.math.Long.fromBits(this.low_&other.low_,this.high_&other.high_)});goog.math.Long.prototype.or=(function(other){return goog.math.Long.fromBits(this.low_|other.low_,this.high_|other.high_)});goog.math.Long.prototype.xor=(function(other){return goog.math.Long.fromBits(this.low_^other.low_,this.high_^other.high_)});goog.math.Long.prototype.shiftLeft=(function(numBits){numBits&=63;if(numBits==0){return this}else {var low=this.low_;if(numBits<32){var high=this.high_;return goog.math.Long.fromBits(low<<numBits,high<<numBits|low>>>32-numBits)}else {return goog.math.Long.fromBits(0,low<<numBits-32)}}});goog.math.Long.prototype.shiftRight=(function(numBits){numBits&=63;if(numBits==0){return this}else {var high=this.high_;if(numBits<32){var low=this.low_;return goog.math.Long.fromBits(low>>>numBits|high<<32-numBits,high>>numBits)}else {return goog.math.Long.fromBits(high>>numBits-32,high>=0?0:-1)}}});goog.math.Long.prototype.shiftRightUnsigned=(function(numBits){numBits&=63;if(numBits==0){return this}else {var high=this.high_;if(numBits<32){var low=this.low_;return goog.math.Long.fromBits(low>>>numBits|high<<32-numBits,high>>>numBits)}else if(numBits==32){return goog.math.Long.fromBits(high,0)}else {return goog.math.Long.fromBits(high>>>numBits-32,0)}}});var dbits;function BigInteger(a,b,c){if(a!=null)if("number"==typeof a)this.fromNumber(a,b,c);else if(b==null&&"string"!=typeof a)this.fromString(a,256);else this.fromString(a,b);}function nbi(){return new BigInteger(null)}function am1(i,x,w,j,c,n){while(--n>=0){var v=x*this[i++]+w[j]+c;c=Math.floor(v/67108864);w[j++]=v&67108863;}return c}{BigInteger.prototype.am=am1;dbits=26;}BigInteger.prototype.DB=dbits;BigInteger.prototype.DM=(1<<dbits)-1;BigInteger.prototype.DV=1<<dbits;var BI_FP=52;BigInteger.prototype.FV=Math.pow(2,BI_FP);BigInteger.prototype.F1=BI_FP-dbits;BigInteger.prototype.F2=2*dbits-BI_FP;var BI_RM="0123456789abcdefghijklmnopqrstuvwxyz";var BI_RC=new Array;var rr,vv;rr="0".charCodeAt(0);for(vv=0;vv<=9;++vv)BI_RC[rr++]=vv;rr="a".charCodeAt(0);for(vv=10;vv<36;++vv)BI_RC[rr++]=vv;rr="A".charCodeAt(0);for(vv=10;vv<36;++vv)BI_RC[rr++]=vv;function int2char(n){return BI_RM.charAt(n)}function intAt(s,i){var c=BI_RC[s.charCodeAt(i)];return c==null?-1:c}function bnpCopyTo(r){for(var i=this.t-1;i>=0;--i)r[i]=this[i];r.t=this.t;r.s=this.s;}function bnpFromInt(x){this.t=1;this.s=x<0?-1:0;if(x>0)this[0]=x;else if(x<-1)this[0]=x+DV;else this.t=0;}function nbv(i){var r=nbi();r.fromInt(i);return r}function bnpFromString(s,b){var k;if(b==16)k=4;else if(b==8)k=3;else if(b==256)k=8;else if(b==2)k=1;else if(b==32)k=5;else if(b==4)k=2;else {this.fromRadix(s,b);return}this.t=0;this.s=0;var i=s.length,mi=false,sh=0;while(--i>=0){var x=k==8?s[i]&255:intAt(s,i);if(x<0){if(s.charAt(i)=="-")mi=true;continue}mi=false;if(sh==0)this[this.t++]=x;else if(sh+k>this.DB){this[this.t-1]|=(x&(1<<this.DB-sh)-1)<<sh;this[this.t++]=x>>this.DB-sh;}else this[this.t-1]|=x<<sh;sh+=k;if(sh>=this.DB)sh-=this.DB;}if(k==8&&(s[0]&128)!=0){this.s=-1;if(sh>0)this[this.t-1]|=(1<<this.DB-sh)-1<<sh;}this.clamp();if(mi)BigInteger.ZERO.subTo(this,this);}function bnpClamp(){var c=this.s&this.DM;while(this.t>0&&this[this.t-1]==c)--this.t;}function bnToString(b){if(this.s<0)return "-"+this.negate().toString(b);var k;if(b==16)k=4;else if(b==8)k=3;else if(b==2)k=1;else if(b==32)k=5;else if(b==4)k=2;else return this.toRadix(b);var km=(1<<k)-1,d,m=false,r="",i=this.t;var p=this.DB-i*this.DB%k;if(i-->0){if(p<this.DB&&(d=this[i]>>p)>0){m=true;r=int2char(d);}while(i>=0){if(p<k){d=(this[i]&(1<<p)-1)<<k-p;d|=this[--i]>>(p+=this.DB-k);}else {d=this[i]>>(p-=k)&km;if(p<=0){p+=this.DB;--i;}}if(d>0)m=true;if(m)r+=int2char(d);}}return m?r:"0"}function bnNegate(){var r=nbi();BigInteger.ZERO.subTo(this,r);return r}function bnAbs(){return this.s<0?this.negate():this}function bnCompareTo(a){var r=this.s-a.s;if(r!=0)return r;var i=this.t;r=i-a.t;if(r!=0)return this.s<0?-r:r;while(--i>=0)if((r=this[i]-a[i])!=0)return r;return 0}function nbits(x){var r=1,t;if((t=x>>>16)!=0){x=t;r+=16;}if((t=x>>8)!=0){x=t;r+=8;}if((t=x>>4)!=0){x=t;r+=4;}if((t=x>>2)!=0){x=t;r+=2;}if((t=x>>1)!=0){x=t;r+=1;}return r}function bnBitLength(){if(this.t<=0)return 0;return this.DB*(this.t-1)+nbits(this[this.t-1]^this.s&this.DM)}function bnpDLShiftTo(n,r){var i;for(i=this.t-1;i>=0;--i)r[i+n]=this[i];for(i=n-1;i>=0;--i)r[i]=0;r.t=this.t+n;r.s=this.s;}function bnpDRShiftTo(n,r){for(var i=n;i<this.t;++i)r[i-n]=this[i];r.t=Math.max(this.t-n,0);r.s=this.s;}function bnpLShiftTo(n,r){var bs=n%this.DB;var cbs=this.DB-bs;var bm=(1<<cbs)-1;var ds=Math.floor(n/this.DB),c=this.s<<bs&this.DM,i;for(i=this.t-1;i>=0;--i){r[i+ds+1]=this[i]>>cbs|c;c=(this[i]&bm)<<bs;}for(i=ds-1;i>=0;--i)r[i]=0;r[ds]=c;r.t=this.t+ds+1;r.s=this.s;r.clamp();}function bnpRShiftTo(n,r){r.s=this.s;var ds=Math.floor(n/this.DB);if(ds>=this.t){r.t=0;return}var bs=n%this.DB;var cbs=this.DB-bs;var bm=(1<<bs)-1;r[0]=this[ds]>>bs;for(var i=ds+1;i<this.t;++i){r[i-ds-1]|=(this[i]&bm)<<cbs;r[i-ds]=this[i]>>bs;}if(bs>0)r[this.t-ds-1]|=(this.s&bm)<<cbs;r.t=this.t-ds;r.clamp();}function bnpSubTo(a,r){var i=0,c=0,m=Math.min(a.t,this.t);while(i<m){c+=this[i]-a[i];r[i++]=c&this.DM;c>>=this.DB;}if(a.t<this.t){c-=a.s;while(i<this.t){c+=this[i];r[i++]=c&this.DM;c>>=this.DB;}c+=this.s;}else {c+=this.s;while(i<a.t){c-=a[i];r[i++]=c&this.DM;c>>=this.DB;}c-=a.s;}r.s=c<0?-1:0;if(c<-1)r[i++]=this.DV+c;else if(c>0)r[i++]=c;r.t=i;r.clamp();}function bnpMultiplyTo(a,r){var x=this.abs(),y=a.abs();var i=x.t;r.t=i+y.t;while(--i>=0)r[i]=0;for(i=0;i<y.t;++i)r[i+x.t]=x.am(0,y[i],r,i,0,x.t);r.s=0;r.clamp();if(this.s!=a.s)BigInteger.ZERO.subTo(r,r);}function bnpSquareTo(r){var x=this.abs();var i=r.t=2*x.t;while(--i>=0)r[i]=0;for(i=0;i<x.t-1;++i){var c=x.am(i,x[i],r,2*i,0,1);if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1))>=x.DV){r[i+x.t]-=x.DV;r[i+x.t+1]=1;}}if(r.t>0)r[r.t-1]+=x.am(i,x[i],r,2*i,0,1);r.s=0;r.clamp();}function bnpDivRemTo(m,q,r){var pm=m.abs();if(pm.t<=0)return;var pt=this.abs();if(pt.t<pm.t){if(q!=null)q.fromInt(0);if(r!=null)this.copyTo(r);return}if(r==null)r=nbi();var y=nbi(),ts=this.s,ms=m.s;var nsh=this.DB-nbits(pm[pm.t-1]);if(nsh>0){pm.lShiftTo(nsh,y);pt.lShiftTo(nsh,r);}else {pm.copyTo(y);pt.copyTo(r);}var ys=y.t;var y0=y[ys-1];if(y0==0)return;var yt=y0*(1<<this.F1)+(ys>1?y[ys-2]>>this.F2:0);var d1=this.FV/yt,d2=(1<<this.F1)/yt,e=1<<this.F2;var i=r.t,j=i-ys,t=q==null?nbi():q;y.dlShiftTo(j,t);if(r.compareTo(t)>=0){r[r.t++]=1;r.subTo(t,r);}BigInteger.ONE.dlShiftTo(ys,t);t.subTo(y,y);while(y.t<ys)y[y.t++]=0;while(--j>=0){var qd=r[--i]==y0?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);if((r[i]+=y.am(0,qd,r,j,0,ys))<qd){y.dlShiftTo(j,t);r.subTo(t,r);while(r[i]<--qd)r.subTo(t,r);}}if(q!=null){r.drShiftTo(ys,q);if(ts!=ms)BigInteger.ZERO.subTo(q,q);}r.t=ys;r.clamp();if(nsh>0)r.rShiftTo(nsh,r);if(ts<0)BigInteger.ZERO.subTo(r,r);}function bnMod(a){var r=nbi();this.abs().divRemTo(a,null,r);if(this.s<0&&r.compareTo(BigInteger.ZERO)>0)a.subTo(r,r);return r}function Classic(m){this.m=m;}function cConvert(x){if(x.s<0||x.compareTo(this.m)>=0)return x.mod(this.m);else return x}function cRevert(x){return x}function cReduce(x){x.divRemTo(this.m,null,x);}function cMulTo(x,y,r){x.multiplyTo(y,r);this.reduce(r);}function cSqrTo(x,r){x.squareTo(r);this.reduce(r);}Classic.prototype.convert=cConvert;Classic.prototype.revert=cRevert;Classic.prototype.reduce=cReduce;Classic.prototype.mulTo=cMulTo;Classic.prototype.sqrTo=cSqrTo;function bnpInvDigit(){if(this.t<1)return 0;var x=this[0];if((x&1)==0)return 0;var y=x&3;y=y*(2-(x&15)*y)&15;y=y*(2-(x&255)*y)&255;y=y*(2-((x&65535)*y&65535))&65535;y=y*(2-x*y%this.DV)%this.DV;return y>0?this.DV-y:-y}function Montgomery(m){this.m=m;this.mp=m.invDigit();this.mpl=this.mp&32767;this.mph=this.mp>>15;this.um=(1<<m.DB-15)-1;this.mt2=2*m.t;}function montConvert(x){var r=nbi();x.abs().dlShiftTo(this.m.t,r);r.divRemTo(this.m,null,r);if(x.s<0&&r.compareTo(BigInteger.ZERO)>0)this.m.subTo(r,r);return r}function montRevert(x){var r=nbi();x.copyTo(r);this.reduce(r);return r}function montReduce(x){while(x.t<=this.mt2)x[x.t++]=0;for(var i=0;i<this.m.t;++i){var j=x[i]&32767;var u0=j*this.mpl+((j*this.mph+(x[i]>>15)*this.mpl&this.um)<<15)&x.DM;j=i+this.m.t;x[j]+=this.m.am(0,u0,x,i,0,this.m.t);while(x[j]>=x.DV){x[j]-=x.DV;x[++j]++;}}x.clamp();x.drShiftTo(this.m.t,x);if(x.compareTo(this.m)>=0)x.subTo(this.m,x);}function montSqrTo(x,r){x.squareTo(r);this.reduce(r);}function montMulTo(x,y,r){x.multiplyTo(y,r);this.reduce(r);}Montgomery.prototype.convert=montConvert;Montgomery.prototype.revert=montRevert;Montgomery.prototype.reduce=montReduce;Montgomery.prototype.mulTo=montMulTo;Montgomery.prototype.sqrTo=montSqrTo;function bnpIsEven(){return (this.t>0?this[0]&1:this.s)==0}function bnpExp(e,z){if(e>4294967295||e<1)return BigInteger.ONE;var r=nbi(),r2=nbi(),g=z.convert(this),i=nbits(e)-1;g.copyTo(r);while(--i>=0){z.sqrTo(r,r2);if((e&1<<i)>0)z.mulTo(r2,g,r);else {var t=r;r=r2;r2=t;}}return z.revert(r)}function bnModPowInt(e,m){var z;if(e<256||m.isEven())z=new Classic(m);else z=new Montgomery(m);return this.exp(e,z)}BigInteger.prototype.copyTo=bnpCopyTo;BigInteger.prototype.fromInt=bnpFromInt;BigInteger.prototype.fromString=bnpFromString;BigInteger.prototype.clamp=bnpClamp;BigInteger.prototype.dlShiftTo=bnpDLShiftTo;BigInteger.prototype.drShiftTo=bnpDRShiftTo;BigInteger.prototype.lShiftTo=bnpLShiftTo;BigInteger.prototype.rShiftTo=bnpRShiftTo;BigInteger.prototype.subTo=bnpSubTo;BigInteger.prototype.multiplyTo=bnpMultiplyTo;BigInteger.prototype.squareTo=bnpSquareTo;BigInteger.prototype.divRemTo=bnpDivRemTo;BigInteger.prototype.invDigit=bnpInvDigit;BigInteger.prototype.isEven=bnpIsEven;BigInteger.prototype.exp=bnpExp;BigInteger.prototype.toString=bnToString;BigInteger.prototype.negate=bnNegate;BigInteger.prototype.abs=bnAbs;BigInteger.prototype.compareTo=bnCompareTo;BigInteger.prototype.bitLength=bnBitLength;BigInteger.prototype.mod=bnMod;BigInteger.prototype.modPowInt=bnModPowInt;BigInteger.ZERO=nbv(0);BigInteger.ONE=nbv(1);function bnpFromRadix(s,b){this.fromInt(0);if(b==null)b=10;var cs=this.chunkSize(b);var d=Math.pow(b,cs),mi=false,j=0,w=0;for(var i=0;i<s.length;++i){var x=intAt(s,i);if(x<0){if(s.charAt(i)=="-"&&this.signum()==0)mi=true;continue}w=b*w+x;if(++j>=cs){this.dMultiply(d);this.dAddOffset(w,0);j=0;w=0;}}if(j>0){this.dMultiply(Math.pow(b,j));this.dAddOffset(w,0);}if(mi)BigInteger.ZERO.subTo(this,this);}function bnpChunkSize(r){return Math.floor(Math.LN2*this.DB/Math.log(r))}function bnSigNum(){if(this.s<0)return -1;else if(this.t<=0||this.t==1&&this[0]<=0)return 0;else return 1}function bnpDMultiply(n){this[this.t]=this.am(0,n-1,this,0,0,this.t);++this.t;this.clamp();}function bnpDAddOffset(n,w){if(n==0)return;while(this.t<=w)this[this.t++]=0;this[w]+=n;while(this[w]>=this.DV){this[w]-=this.DV;if(++w>=this.t)this[this.t++]=0;++this[w];}}function bnpToRadix(b){if(b==null)b=10;if(this.signum()==0||b<2||b>36)return "0";var cs=this.chunkSize(b);var a=Math.pow(b,cs);var d=nbv(a),y=nbi(),z=nbi(),r="";this.divRemTo(d,y,z);while(y.signum()>0){r=(a+z.intValue()).toString(b).substr(1)+r;y.divRemTo(d,y,z);}return z.intValue().toString(b)+r}function bnIntValue(){if(this.s<0){if(this.t==1)return this[0]-this.DV;else if(this.t==0)return -1}else if(this.t==1)return this[0];else if(this.t==0)return 0;return (this[1]&(1<<32-this.DB)-1)<<this.DB|this[0]}function bnpAddTo(a,r){var i=0,c=0,m=Math.min(a.t,this.t);while(i<m){c+=this[i]+a[i];r[i++]=c&this.DM;c>>=this.DB;}if(a.t<this.t){c+=a.s;while(i<this.t){c+=this[i];r[i++]=c&this.DM;c>>=this.DB;}c+=this.s;}else {c+=this.s;while(i<a.t){c+=a[i];r[i++]=c&this.DM;c>>=this.DB;}c+=a.s;}r.s=c<0?-1:0;if(c>0)r[i++]=c;else if(c<-1)r[i++]=this.DV+c;r.t=i;r.clamp();}BigInteger.prototype.fromRadix=bnpFromRadix;BigInteger.prototype.chunkSize=bnpChunkSize;BigInteger.prototype.signum=bnSigNum;BigInteger.prototype.dMultiply=bnpDMultiply;BigInteger.prototype.dAddOffset=bnpDAddOffset;BigInteger.prototype.toRadix=bnpToRadix;BigInteger.prototype.intValue=bnIntValue;BigInteger.prototype.addTo=bnpAddTo;var Wrapper={abs:(function(l,h){var x=new goog.math.Long(l,h);var ret;if(x.isNegative()){ret=x.negate();}else {ret=x;}HEAP32[tempDoublePtr>>2]=ret.low_;HEAP32[tempDoublePtr+4>>2]=ret.high_;}),ensureTemps:(function(){if(Wrapper.ensuredTemps)return;Wrapper.ensuredTemps=true;Wrapper.two32=new BigInteger;Wrapper.two32.fromString("4294967296",10);Wrapper.two64=new BigInteger;Wrapper.two64.fromString("18446744073709551616",10);Wrapper.temp1=new BigInteger;Wrapper.temp2=new BigInteger;}),lh2bignum:(function(l,h){var a=new BigInteger;a.fromString(h.toString(),10);var b=new BigInteger;a.multiplyTo(Wrapper.two32,b);var c=new BigInteger;c.fromString(l.toString(),10);var d=new BigInteger;c.addTo(b,d);return d}),stringify:(function(l,h,unsigned){var ret=(new goog.math.Long(l,h)).toString();if(unsigned&&ret[0]=="-"){Wrapper.ensureTemps();var bignum=new BigInteger;bignum.fromString(ret,10);ret=new BigInteger;Wrapper.two64.addTo(bignum,ret);ret=ret.toString(10);}return ret}),fromString:(function(str,base,min,max,unsigned){Wrapper.ensureTemps();var bignum=new BigInteger;bignum.fromString(str,base);var bigmin=new BigInteger;bigmin.fromString(min,10);var bigmax=new BigInteger;bigmax.fromString(max,10);if(unsigned&&bignum.compareTo(BigInteger.ZERO)<0){var temp=new BigInteger;bignum.addTo(Wrapper.two64,temp);bignum=temp;}var error=false;if(bignum.compareTo(bigmin)<0){bignum=bigmin;error=true;}else if(bignum.compareTo(bigmax)>0){bignum=bigmax;error=true;}var ret=goog.math.Long.fromString(bignum.toString());HEAP32[tempDoublePtr>>2]=ret.low_;HEAP32[tempDoublePtr+4>>2]=ret.high_;if(error)throw "range error"})};return Wrapper})();if(memoryInitializer){if(typeof Module["locateFile"]==="function"){memoryInitializer=Module["locateFile"](memoryInitializer);}else {memoryInitializer=new URL('./', import.meta.url).pathname+memoryInitializer;}if(ENVIRONMENT_IS_NODE||ENVIRONMENT_IS_SHELL){var data=Module["readBinary"](memoryInitializer);HEAPU8.set(data,STATIC_BASE);}else {addRunDependency();var applyMemoryInitializer=(function(data){if(data.byteLength)data=new Uint8Array(data);HEAPU8.set(data,STATIC_BASE);removeRunDependency();});var request=Module["memoryInitializerRequest"];if(request){if(request.response){setTimeout((function(){applyMemoryInitializer(request.response);}),0);}else {request.addEventListener("load",(function(){if(request.status!==200&&request.status!==0){console.warn("a problem seems to have happened with Module.memoryInitializerRequest, status: "+request.status);}if(!request.response||typeof request.response!=="object"||!request.response.byteLength){console.warn("a problem seems to have happened with Module.memoryInitializerRequest response (expected ArrayBuffer): "+request.response);}applyMemoryInitializer(request.response);}));}}else {Browser.asyncLoad(memoryInitializer,applyMemoryInitializer,(function(){throw "could not load memory initializer "+memoryInitializer}));}}}function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status;}ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;var initialStackTop;var preloadStartTime=null;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"])run();if(!Module["calledRun"])dependenciesFulfilled=runCaller;};Module["callMain"]=Module.callMain=function callMain(args){assert(runDependencies==0,"cannot call main when async dependencies remain! (listen on __ATMAIN__)");assert(__ATPRERUN__.length==0,"cannot call main when preRun functions remain to be called");args=args||[];ensureInitRuntime();var argc=args.length+1;function pad(){for(var i=0;i<4-1;i++){argv.push(0);}}var argv=[allocate(intArrayFromString(Module["thisProgram"]),"i8",ALLOC_NORMAL)];pad();for(var i=0;i<argc-1;i=i+1){argv.push(allocate(intArrayFromString(args[i]),"i8",ALLOC_NORMAL));pad();}argv.push(0);argv=allocate(argv,"i32",ALLOC_NORMAL);initialStackTop=STACKTOP;try{var ret=Module["_main"](argc,argv,0);exit(ret,true);}catch(e){if(e instanceof ExitStatus){return}else if(e=="SimulateInfiniteLoop"){Module["noExitRuntime"]=true;return}else {if(e&&typeof e==="object"&&e.stack)Module.printErr("exception thrown: "+[e,e.stack]);throw e}}finally{}};function run(args){args=args||Module["arguments"];if(preloadStartTime===null)preloadStartTime=Date.now();if(runDependencies>0){return}preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(ENVIRONMENT_IS_WEB&&preloadStartTime!==null){Module.printErr("pre-main prep time: "+(Date.now()-preloadStartTime)+" ms");}if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();if(Module["_main"]&&shouldRunNow)Module["callMain"](args);postRun();}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout((function(){setTimeout((function(){Module["setStatus"]("");}),1);doRun();}),1);}else {doRun();}}Module["run"]=Module.run=run;function exit(status,implicit){if(implicit&&Module["noExitRuntime"]){return}if(Module["noExitRuntime"]);else {ABORT=true;STACKTOP=initialStackTop;exitRuntime();if(Module["onExit"])Module["onExit"](status);}if(ENVIRONMENT_IS_NODE){process["stdout"]["once"]("drain",(function(){process["exit"](status);}));console.log(" ");setTimeout((function(){process["exit"](status);}),500);}else if(ENVIRONMENT_IS_SHELL&&typeof quit==="function"){quit(status);}throw new ExitStatus(status)}Module["exit"]=Module.exit=exit;var abortDecorators=[];function abort(what){if(what!==undefined){Module.print(what);Module.printErr(what);what=JSON.stringify(what);}else {what="";}ABORT=true;var extra="\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";var output="abort("+what+") at "+stackTrace()+extra;if(abortDecorators){abortDecorators.forEach((function(decorator){output=decorator(output,what);}));}throw output}Module["abort"]=Module.abort=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()();}}var shouldRunNow=true;if(Module["noInitialRun"]){shouldRunNow=false;}run();var encoder_init=Module._encoder_init,encoder_clear=Module._encoder_clear,encoder_analysis_buffer=Module._encoder_analysis_buffer,encoder_process=Module._encoder_process,encoder_data_len=Module._encoder_data_len,encoder_transfer_data=Module._encoder_transfer_data,HEAPU8=Module.HEAPU8,HEAPU32=Module.HEAPU32,HEAPF32=Module.HEAPF32;var Encoder=(function(sampleRate,numChannels,quality){this.numChannels=numChannels;this.oggBuffers=[];this.encoder=encoder_init(this.numChannels,sampleRate,quality);});Encoder.prototype.encode=(function(buffers){var length=buffers[0].length;var analysis_buffer=encoder_analysis_buffer(this.encoder,length)>>2;for(var ch=0;ch<this.numChannels;++ch)HEAPF32.set(buffers[ch],HEAPU32[analysis_buffer+ch]>>2);this.process(length);});Encoder.prototype.finish=(function(mimeType){this.process(0);var blob=new Blob(this.oggBuffers,{type:mimeType||"audio/ogg"});this.cleanup();return blob});Encoder.prototype.cancel=Encoder.prototype.cleanup=(function(){encoder_clear(this.encoder);delete this.encoder;delete this.oggBuffers;});Encoder.prototype.process=(function(length){encoder_process(this.encoder,length);var len=encoder_data_len(this.encoder);if(len>0){var data=encoder_transfer_data(this.encoder);this.oggBuffers.push(new Uint8Array(HEAPU8.subarray(data,data+len)));}});self.OggVorbisEncoder=Encoder;}))(self);

var drawWaveform = (canvas, data, state) => {
  console.time('draw waveform');
  if (state === 2) data = data.subarray(0, data.length / 4 | 0);
  if (state === 3) data = data.subarray(0, data.length / 8 | 0);
  if (state === 4) data = data.subarray(0, data.length / 16 | 0);
  if (state === 5) data = data.subarray(0, data.length / 32 | 0);
  if (state === 6) data = data.subarray(0, data.length / 64 | 0);
  if (state === 7) data = data.subarray(-(data.length / 64 | 0));
  const ctx = canvas.getContext('2d');
  const width = canvas.width*2;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  // ctx.globalCompositeOperation = 'source-over'
  // ctx.fillStyle = 'rgba(0,0,0,.5)' //'#99ff00'
  // ctx.fillRect(0, 0, width, height) //*2, height*2)
  // ctx.strokeStyle = '#a6e22e' //'#568208' //'#99ff00'
  const color = 'rgba(0,243,178,.5)';
  const peak = '#f00';
  ctx.lineWidth = 1;
  ctx.globalCompositeOperation = 'lighter';
  ctx.beginPath();
  const h = height/2;
  ctx.moveTo(0, h);
  const w = Math.floor(data.length / width);
  for (let x = 0; x < width; x++) {
    ctx.beginPath();
    ctx.globalCompositeOperation = 'lighter';

    let max = Math.max(0, Math.max(...data.subarray(x*w, x*w+w)));
    if (max > 1) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = peak;
      max = 1;
    }
    else ctx.strokeStyle = color;

    let min = Math.min(0, Math.min(...data.subarray(x*w, x*w+w)));
    if (min < -1) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = peak;
      min = -1;
    }
    else ctx.strokeStyle = color;

    ctx.moveTo(x/2, (h - (max * h)));
    ctx.lineTo(x/2, (h - (min * h)));
    ctx.stroke();

    // let sum = 0
    // for (let i = x*w; i < x*w+w; i += s) {
    //   sum += Math.abs(wave[i])
    // }
    // let avg = Math.min(1, (sum / (w / s) )) * h

  }
  ctx.lineTo(width, h);
  ctx.stroke();
  console.timeEnd('draw waveform');
};

class Shared32Array {
  constructor (length) {
    return new Float32Array(
      new SharedArrayBuffer(
        length * Float32Array.BYTES_PER_ELEMENT)
    )
  }
}

const dispatch = listeners => event =>
  listeners.forEach(fn => fn(event));

const PAUSE_TIMEOUT = 10 * 1000; // 10 secs

class SafeDynamicWorker {
  constructor (url) {
    this.url = url;

    this.ackId = 0;
    this.pendingAckMessages = [];

    this.listeners = {
      onerror: [this.reviveSafe.bind(this)],
      onmessage: [this.examineAck.bind(this)],
      onmessageerror: [],
      onfail: []
    };

    this.pause = this.pause.bind(this);

    this.updateInstance();
  }

  dispatch (type, event) {
    dispatch(this.listeners[type])(event);
  }

  markAsSafe () {
    const prevSafe = this.safe;
    this.safe = this.worker;
    if (prevSafe && prevSafe !== this.safe) {
      setTimeout(() => {
        try {
          console.warn('safe: terminating previous safe worker');
          prevSafe.terminate();
        } catch (error) {
          console.error(error);
        }
      // give some time to finish operations
      // before forcefully terminating
      }, 5000);
    }
  }

  reviveSafe (err) {
    if (this.worker && this.worker.state !== 'failed') {
      this.worker.state = 'failed';
      this.unbindListeners();
      try {
        console.log('failed: terminating worker');
        this.worker.terminate();
      } catch (error) {
        console.error(error);
      }
      this.worker = null;
    }
    if (this.safe && this.worker !== this.safe && this.safe.state !== 'failed') {
      this.worker = this.safe;
      this.bindListeners();
      this.retryMessages();
    } else {
      // this.pendingAckMessages.splice(0)
      this.dispatch('onfail', new Error('Impossible to heal: ' + this.url));
    }
  }

  retryMessages () {
    this.pendingAckMessages.forEach(([msg, transfer]) => {
      this.worker.postMessage(msg, transfer);
    });
  }

  examineAck ({ data }) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.pause, PAUSE_TIMEOUT);

    if (data.ack) {
      this.pendingAckMessages =
      this.pendingAckMessages
        .filter(([msg]) =>
          msg.ackId !== data.ack);
    }
  }

  updateInstance () {
    if (this.worker) {
      this.unbindListeners();
      if (this.worker !== this.safe) {
        try {
          console.log('update: terminating previous worker');
          this.worker.terminate();
        } catch (error) {
          console.error(error);
        }
      }
    }
    this.worker = new Worker(this.url, { type: 'module' });
    this.bindListeners();
    this.retryMessages();

    this.paused = false;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.pause, PAUSE_TIMEOUT);
  }

  pause () {
    try {
      if (this.worker) {
        this.worker.terminate();
      }
      this.worker = null;
    } catch {}

    try {
      if (this.safe) {
        this.safe.terminate();
      }
      this.safe = null;
    } catch {}

    this.paused = true;
    this.onpause();
    console.log('worker paused: ', this.url);
  }

  bindListeners () {
    this.worker.onerror = dispatch(this.listeners.onerror);
    this.worker.onmessage = dispatch(this.listeners.onmessage);
    this.worker.onmessageerror = dispatch(this.listeners.onmessageerror);
  }

  unbindListeners () {
    this.worker.onerror =
    this.worker.onmessage =
    this.worker.onmessageerror = null;
  }

  postMessage (message, transfer) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.pause, PAUSE_TIMEOUT);

    const payload = {
      ackId: ++this.ackId,
      message
    };
    this.pendingAckMessages.push([payload, transfer]);
    if (this.worker) {
      this.worker.postMessage(payload, transfer);
    }
  }

  set onerror (fn) {
    this.listeners.onerror.push(fn);
  }

  set onmessage (fn) {
    this.listeners.onmessage.push(fn);
  }

  set onmessageerror (fn) {
    this.listeners.onmessageerror.push(fn);
  }

  set onfail (fn) {
    this.listeners.onfail.push(fn);
  }
}

var randomId = (n = 6) => Array(n).fill().map(() => (16*Math.random()|0).toString(16)).join``;

let callbackId = 0;
const callbacks = self.callbacks ?? new Map;
const isMain = typeof window !== 'undefined';
if (!isMain) self.callbacks = callbacks;

const rpcs = new Map;

const rpc = (url, method, args = []) => getRpc(url).rpc(method, args);
rpc.get = url => getRpc(url);
rpc.update = (url, noCreate = false) => getRpc(url, noCreate)?.worker?.updateInstance();
rpc.markAsSafe = url => getRpc(url).worker.markAsSafe();
rpc.clear = () => rpcs.clear();
rpc.clearHanging = error => { [...callbacks.values()].forEach(fn => fn.reject(error)), callbacks.clear(); };
rpc.clearAll = () => (rpc.clear(), rpc.clearHanging());

const workers = self.workers ?? new Map;
if (!isMain) self.workers = workers;

class Rpc {
  constructor (url) {
    this.url = url;

    // here we distinguish between RPC instances
    // that run in Workers and RPC instances in the
    // main thread that interface as RPC workers
    if (new URL(url).protocol === 'main:') {
      this.worker = window[url].worker;
      this.bindListeners();
    } else {
      this.worker = workers.get(url);
      if (!this.worker) {
        this.worker = new SafeDynamicWorker(url);
        workers.set(url, this.worker);
        this.bindListeners();
      } else if (this.worker.paused) {
        this.worker.updateInstance();
      }
    }
  }

  bindListeners () {
    this.worker.onmessage = ({ data }) => {
      if (!data.call) return
      if (!(data.call in this)) {
        throw new ReferenceError('Rpc receive method not found: ' + data.call)
      }
      this[data.call](data);
    };
    this.worker.onmessageerror = error => rpc.onmessageerror?.(error, this.url);
    this.worker.onerror = error => rpc.onerror?.(error, this.url);
    this.worker.onfail = fail => rpc.onfail?.(fail, this.url);
    this.worker.onpause = () => rpcs.delete(this.url);
  }

  async proxyRpc ({ url, callbackId, method, args }) {
    try {
      const result = await rpc(url, method, args);
      this.worker.postMessage({
        call: 'onreply',
        replyTo: callbackId,
        result
      });
    } catch (error) {
      this.worker.postMessage({
        call: 'onreply',
        replyTo: callbackId,
        error
      });
    }
  }

  rpc (method, args) {
    const cid = ++callbackId;

    const promise = Promise.race([
      new Promise((_, reject) => setTimeout(reject, 30000, new Error('rpc: Timed out.'))),
      new Promise((resolve, reject) =>
        callbacks.set(cid, { resolve, reject }))
    ]);

    this.worker.postMessage({
      call: method,
      callbackId,
      args
    });

    return promise
  }

  onerror ({ error }) {
    this.worker.dispatch('onerror', error);
    rpc.clearHanging(error);
  }

  onreply ({ replyTo, error, result }) {
    const callback = callbacks.get(replyTo);
    if (callback) {
      callbacks.delete(replyTo);
      if (error) {
        callback.reject(error);
      } else {
        callback.resolve(result);
      }
    }
  }
}

class RpcProxy {
  constructor (url) {
    this.url = url;
  }

  rpc (method, args) {
    const cid = ++callbackId;

    const promise = Promise.race([
      new Promise((_, reject) => setTimeout(reject, 30000, new Error('rpc: Timed out.'))),
      new Promise((resolve, reject) =>
        callbacks.set(cid, { resolve, reject }))
    ]);

    postMessage({
      call: 'proxyRpc',
      url: this.url,
      callbackId: cid,
      method,
      args
    });

    return promise
  }
}

const getRpc = (url, noCreate = false) => {
  url = new URL(url, location.href).href;
  if (isMain) {
    if (!rpcs.has(url)) {
      if (noCreate) return
      rpcs.set(url, new Rpc(url));
    }
    return rpcs.get(url)
  } else {
    return new RpcProxy(url)
  }
};

const isMain$1 = typeof window !== 'undefined';

const install = self => {
  self.rpc = rpc;

  self.callbacks = self.callbacks ?? new Map;

  self.onmessage = async ({ data }) => {
    try {
      if (data.message.call === 'onreply') {
        const { replyTo, error, result } = data.message;
        const callback = self.callbacks.get(replyTo);
        if (callback) {
          self.callbacks.delete(replyTo);
          if (error) {
            callback.reject(error);
          } else {
            callback.resolve(result);
          }
        } else {
          console.warn('onreply discarded (receiver dead?)', replyTo, result ?? error, location.href);
        }
        self.postMessage({ ack: data.ackId });
        return
      }
      if (!(data.message.call in self.methods)) {
        throw new ReferenceError(
          'rpc: Method not found: ' + data.message.call)
      }
      const result = await self.methods[data.message.call](...data.message.args);
      self.postMessage({
        ack: data.ackId,
        call: 'onreply',
        replyTo: data.message.callbackId,
        result
      });
    } catch (error) {
      self.postMessage({
        ack: data.ackId,
        call: 'onreply',
        replyTo: data.message.callbackId,
        error
      });
    }
  };

  self.onerror = (a, b, c, d, error) =>
    self.postMessage({ call: 'onerror', error });

  self.onunhandledrejection = error =>
    self.postMessage({ call: 'onerror', error: error.reason });
};

if (!isMain$1) {
  install(self);
}

// hacky way to switch api urls from dev to prod
const API_URL = location.port.length === 4 ? 'http://localhost:3000' : location.origin;

var SampleService = audio => {
  const samples = new Map;

  const SampleService = {
    methods: {
      fetchSample: async url => {
        if (url[0] !== '/') {
          url = API_URL + '/fetch?url=' + encodeURIComponent(url);
        } else {
          url = new URL(url, location.href).href;
        }

        let sample = samples.get(url);

        if (!sample) {
          const res = await fetch(url);
          const arrayBuffer = await res.arrayBuffer();
          const audioBuffer = await audio.decodeAudioData(arrayBuffer);
          console.log('got audiobuffer', url, audioBuffer);
          const floats = Array(audioBuffer.numberOfChannels).fill(0).map((_, i) =>
            audioBuffer.getChannelData(i));
          sample = floats.map(buf => {
            const shared = new Shared32Array(buf.length);
            shared.set(buf);
            return shared
          });
          samples.set(url, sample);
        }

        return sample
      }
    },
    postMessage (data) {
      SampleService.worker.onmessage({ data });
    },
    worker: {
      postMessage (data) {
        SampleService.onmessage({ data: { ackId: -999999, message: data } });
      }
    }
  };

  install(SampleService);
  window['main:sample-service'] = SampleService;
  console.log('sample service running');
};

let audio;

var Audio$1 = () => {
  if (audio) return audio

  audio = new AudioContext({
    numberOfChannels: 2,
    sampleRate: 44100,
    latencyHint: 'playback' // without this audio glitches
  });

  audio.onstatechange = e => {
    console.log('audio context state change:', audio.state);
  };

  audio.gain = audio.createGain();
  audio.gain.gain.value = 1;
  audio.gain.connect(audio.destination);

  SampleService(audio);

  return audio
};

var atomic = (innerFn, { recentOnly = false, timeout = 5000 } = {}) => {
  let queue = [];

  let lock = false;

  const atomicWrapperFn = async (...args) => {
    if (lock) {
      return new Promise((resolve, reject) =>
        queue.push([resolve, reject, args]))
    }
    lock = true;
    let result;
    try {
      if (timeout) {
        result = await Promise.race([
          new Promise((resolve, reject) => setTimeout(reject, timeout, new Error('atomic: Timed out.'))),
          innerFn(...args)
        ]);
      } else {
        result = await innerFn(...args);
      }
    } catch (error) {
      // lock = false
      result = error;
      // console.log('ERROR WRAPPED', innerFn)
      const slice = queue.slice();
      queue = [];
      slice.forEach(([resolve, reject]) => reject(new Error('Queue discarded.')));
      // queue = []
    }
    lock = false;
    if (queue.length) {
      if (recentOnly) {
        const [resolve, reject, _args] = queue.pop();
        const slice = queue.slice();
        queue = [];
        slice.forEach(([resolve, reject]) => reject(new Error('atomic: Queue discarded.')));
        atomicWrapperFn(..._args).then(resolve, reject).catch(reject);
      } else {
        const [resolve, reject, _args] = queue.shift();
        atomicWrapperFn(..._args).then(resolve, reject).catch(reject);
      }
    }
    if (result instanceof Error) return Promise.reject(result)
    return result
  };

  atomicWrapperFn.innerFn = innerFn;
  atomicWrapperFn.setTimeout = ms => { timeout = ms; };

  return atomicWrapperFn
};

const checksumOf = (obj, ...args) => {
  if (args.length > 0) return serialize.array([obj, ...args])
  else return serialize[typeOf(obj)](obj, 10)
};

const serialize = {
  object: obj => {
    let sum = '';
    for (const key in obj) {
      if (key === 'n') continue
      if (key === 'buffer') continue
      if (key[0] === '_') continue
      if (obj[key] === undefined) {
        console.warn(key);
        continue
      }
      // console.log(key)
      sum += key + '=' + checksumOf(obj[key]) + ' ';
    }
    return sum
  },

  array: (array, limit = Infinity) => {
    if (array.length > limit) {
      return array.length
    } else {
      return array.map(el => checksumOf(el)).join(' ')
    }
  },

  string: string => string,

  number: number => number.toString(),

  function: fn => {
    if (fn.innerFn) return serialize.object(fn) + checksumOf(fn.innerFn)
    return serialize.object(fn) + fn.toString()
  },

  // undefined: x => console.warn('undefined found'),

  unknown: unknown => unknown.toString()
};

const typeOf = obj => {
  const type = typeof obj;

  if (type === 'object') {
    if (obj[0] != null) return 'array'
    else if (obj == null) return 'null'
    else return type
  } else if (type === 'string') {
    return type
  } else if (type === 'number') {
    return type
  } else if (type === 'function') {
    return type
  } else {
    return 'unknown'
  }
};

var Hyper = ({
  context: top,
  execute,
  mergeDown = Object.assign,
  mergeSide = Object.assign,
  mergeUp = x => x
}) => {
  const fnMap = new Map;
  const proto = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(top));
  const desc = Object.getOwnPropertyDescriptors(top);

  const createHyperFn = parent => {
    const context = { ...parent, parent };

    const fn = atomic(async (...args) => {
      fn.setTimeout(5000);

      if (parent === top) mergeDown(fn, ...args);

      const fns = args
        .filter(arg => typeof arg === 'function')
        .map(_fn => [
          _fn,
          mergeDown(
            mergeDown(createHyperFn(_fn), fn),
            ...args
          )
        ]);

      let lastSiblingHyperFn = null;
      for (const [_fn, hyperFn] of fns) {
        const checksum = checksumOf(_fn, fn);
        if (!fnMap.has(checksum)) {
          if (_fn.constructor.name === 'AsyncFunction') {
            const result = await execute(_fn, hyperFn);
            if (Array.isArray(result)) {
              fnMap.set(checksum, fn =>
                fn(...mergeDown(result, ...args))
              );
            } else {
              fnMap.set(checksum, typeof result === 'function' ? result : () => {});
            }
          } else {
            fnMap.set(checksum, _fn);
          }
        }

        await execute(
          fnMap.get(checksum),
          mergeSide(hyperFn, lastSiblingHyperFn)
        );

        lastSiblingHyperFn = hyperFn;
      }

      mergeUp(fn, lastSiblingHyperFn);
    }, { recentOnly: true, timeout: 60000 });

    Object.defineProperties(fn, desc);
    mergeDown(fn, context);
    Object.defineProperties(fn, proto);

    fn.innerFn = parent;

    return fn
  };

  return createHyperFn(top)
};

var assertFinite = n => {
  if (Number.isFinite(n)) return n
  else throw new TypeError(`Not a finite number value: ${n}`)
};

var render = async (fn, context) => {
  const { buffer } = context;
  const numOfChannels = buffer.length;

  assertFinite(context.n);

  if (numOfChannels > 2) {
    throw new RangeError('unsupported number of channels [' + numOfChannels + ']')
  }

  context.update();

  let result;
  if (fn.constructor.name === 'AsyncFunction') {
    result = await fn(context, context, context);
  } else {
    result = fn(context, context, context);
  }
  if (result instanceof Promise) {
    await result;
    context.tickBar();
    return
  }

  if (typeof result === 'object' && '0' in result && typeof result[0] === 'number') {
    if (numOfChannels === 1) {
      buffer[0][0] = (
        assertFinite(result[0])
      + assertFinite(result[1])
      ) / 2;
    } else {
      buffer[0][0] = assertFinite(result[0]);
      buffer[1][0] = assertFinite(result[1]);
    }
    context.tick();
    renderStereo(fn, context);
    return context
  } else if (typeof result === 'number') {
    buffer[0][0] = assertFinite(result) / numOfChannels;
    context.tick();
    renderMono(fn, context);
    if (numOfChannels === 2) {
      buffer[1].set(buffer[0]);
    }
    return context
  }

  return result
};

const renderMono = (fn, context) => {
  const { buffer } = context;
  const { length } = buffer[0];
  const numOfChannels = buffer.length;

  if (numOfChannels === 1) {
    for (let i = 1; i < length; i++, context.tick()) {
      buffer[0][i] = assertFinite(fn(context, context, context));
    }
  } else {
    for (let i = 1; i < length; i++, context.tick()) {
      buffer[0][i] = assertFinite(fn(context, context, context)) / 2;
    }
  }
};

const renderStereo = (fn, context) => {
  const { buffer } = context;
  const { length } = buffer[0];
  const numOfChannels = buffer.length;

  let sample = [];

  if (numOfChannels === 1) {
    for (let i = 1; i < length; i++, context.tick()) {
      sample = fn(context, context, context);
      buffer[0][i] = (
        assertFinite(sample[0])
      + assertFinite(sample[1])
      ) / 2;
    }
  } else {
    for (let i = 1; i < length; i++, context.tick()) {
      sample = fn(context, context, context);
      buffer[0][i] = assertFinite(sample[0]);
      buffer[1][i] = assertFinite(sample[1]);
    }
  }
};

const r=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t);}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

function FFT(size, shared = false) {
  this.shared = shared;

  this.size = size | 0;
  if (this.size <= 1 || (this.size & (this.size - 1)) !== 0)
    throw new Error('FFT size must be a power of two and bigger than 1');

  this._csize = size << 1;

  // NOTE: Use of `var` is intentional for old V8 versions
  var table = new Float32Array(this.size * 2);
  for (var i = 0; i < table.length; i += 2) {
    const angle = Math.PI * i / this.size;
    table[i] = Math.cos(angle);
    table[i + 1] = -Math.sin(angle);
  }
  this.table = table;

  // Find size's power of two
  var power = 0;
  for (var t = 1; this.size > t; t <<= 1)
    power++;

  // Calculate initial step's width:
  //   * If we are full radix-4 - it is 2x smaller to give inital len=8
  //   * Otherwise it is the same as `power` to give len=4
  this._width = power % 2 === 0 ? power - 1 : power;

  // Pre-compute bit-reversal patterns
  this._bitrev = new Float32Array(1 << this._width);
  for (var j = 0; j < this._bitrev.length; j++) {
    this._bitrev[j] = 0;
    for (var shift = 0; shift < this._width; shift += 2) {
      var revShift = this._width - shift - 2;
      this._bitrev[j] |= ((j >>> shift) & 3) << revShift;
    }
  }

  this._out = null;
  this._data = null;
  this._inv = 0;
}
module.exports = FFT;

FFT.prototype.fromComplexArray = function fromComplexArray(complex, storage) {
  var res = storage || new Float32Array(complex.length >>> 1);
  for (var i = 0; i < complex.length; i += 2)
    res[i >>> 1] = complex[i];
  return res;
};

FFT.prototype.createComplexArray = function createComplexArray() {
  let res;
  if (this.shared) {
    const buffer = new SharedArrayBuffer(this._csize * Float32Array.BYTES_PER_ELEMENT);
    res = new Float32Array(buffer);
  } else {
    res = new Float32Array(this._csize);
  }
  // for (var i = 0; i < res.length; i++)
    // res[i] = 0;
  return res;
};

FFT.prototype.toComplexArray = function toComplexArray(input, storage) {
  var res = storage || this.createComplexArray();
  for (var i = 0; i < res.length; i += 2) {
    res[i] = input[i >>> 1];
    // res[i + 1] = 0;
  }
  return res;
};

FFT.prototype.completeSpectrum = function completeSpectrum(spectrum) {
  var size = this._csize;
  var half = size >>> 1;
  for (var i = 2; i < half; i += 2) {
    spectrum[size - i] = spectrum[i];
    spectrum[size - i + 1] = -spectrum[i + 1];
  }
};

FFT.prototype.transform = function transform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 0;
  this._transform4();
  this._out = null;
  this._data = null;
};

FFT.prototype.realTransform = function realTransform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 0;
  this._realTransform4();
  this._out = null;
  this._data = null;
};

FFT.prototype.inverseTransform = function inverseTransform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 1;
  this._transform4();
  for (var i = 0; i < out.length; i++)
    out[i] /= this.size;
  this._out = null;
  this._data = null;
};

// radix-4 implementation
//
// NOTE: Uses of `var` are intentional for older V8 version that do not
// support both `let compound assignments` and `const phi`
FFT.prototype._transform4 = function _transform4() {
  var out = this._out;
  var size = this._csize;

  // Initial step (permute and transform)
  var width = this._width;
  var step = 1 << width;
  var len = (size / step) << 1;

  var outOff;
  var t;
  var bitrev = this._bitrev;
  if (len === 4) {
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleTransform2(outOff, off, step);
    }
  } else {
    // len === 8
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleTransform4(outOff, off, step);
    }
  }

  // Loop through steps in decreasing order
  var inv = this._inv ? -1 : 1;
  var table = this.table;
  for (step >>= 2; step >= 2; step >>= 2) {
    len = (size / step) << 1;
    var quarterLen = len >>> 2;

    // Loop through offsets in the data
    for (outOff = 0; outOff < size; outOff += len) {
      // Full case
      var limit = outOff + quarterLen;
      for (var i = outOff, k = 0; i < limit; i += 2, k += step) {
        const A = i;
        const B = A + quarterLen;
        const C = B + quarterLen;
        const D = C + quarterLen;

        // Original values
        const Ar = out[A];
        const Ai = out[A + 1];
        const Br = out[B];
        const Bi = out[B + 1];
        const Cr = out[C];
        const Ci = out[C + 1];
        const Dr = out[D];
        const Di = out[D + 1];

        // Middle values
        const MAr = Ar;
        const MAi = Ai;

        const tableBr = table[k];
        const tableBi = inv * table[k + 1];
        const MBr = Br * tableBr - Bi * tableBi;
        const MBi = Br * tableBi + Bi * tableBr;

        const tableCr = table[2 * k];
        const tableCi = inv * table[2 * k + 1];
        const MCr = Cr * tableCr - Ci * tableCi;
        const MCi = Cr * tableCi + Ci * tableCr;

        const tableDr = table[3 * k];
        const tableDi = inv * table[3 * k + 1];
        const MDr = Dr * tableDr - Di * tableDi;
        const MDi = Dr * tableDi + Di * tableDr;

        // Pre-Final values
        const T0r = MAr + MCr;
        const T0i = MAi + MCi;
        const T1r = MAr - MCr;
        const T1i = MAi - MCi;
        const T2r = MBr + MDr;
        const T2i = MBi + MDi;
        const T3r = inv * (MBr - MDr);
        const T3i = inv * (MBi - MDi);

        // Final values
        const FAr = T0r + T2r;
        const FAi = T0i + T2i;

        const FCr = T0r - T2r;
        const FCi = T0i - T2i;

        const FBr = T1r + T3i;
        const FBi = T1i - T3r;

        const FDr = T1r - T3i;
        const FDi = T1i + T3r;

        out[A] = FAr;
        out[A + 1] = FAi;
        out[B] = FBr;
        out[B + 1] = FBi;
        out[C] = FCr;
        out[C + 1] = FCi;
        out[D] = FDr;
        out[D + 1] = FDi;
      }
    }
  }
};

// radix-2 implementation
//
// NOTE: Only called for len=4
FFT.prototype._singleTransform2 = function _singleTransform2(outOff, off,
                                                             step) {
  const out = this._out;
  const data = this._data;

  const evenR = data[off];
  const evenI = data[off + 1];
  const oddR = data[off + step];
  const oddI = data[off + step + 1];

  const leftR = evenR + oddR;
  const leftI = evenI + oddI;
  const rightR = evenR - oddR;
  const rightI = evenI - oddI;

  out[outOff] = leftR;
  out[outOff + 1] = leftI;
  out[outOff + 2] = rightR;
  out[outOff + 3] = rightI;
};

// radix-4
//
// NOTE: Only called for len=8
FFT.prototype._singleTransform4 = function _singleTransform4(outOff, off,
                                                             step) {
  const out = this._out;
  const data = this._data;
  const inv = this._inv ? -1 : 1;
  const step2 = step * 2;
  const step3 = step * 3;

  // Original values
  const Ar = data[off];
  const Ai = data[off + 1];
  const Br = data[off + step];
  const Bi = data[off + step + 1];
  const Cr = data[off + step2];
  const Ci = data[off + step2 + 1];
  const Dr = data[off + step3];
  const Di = data[off + step3 + 1];

  // Pre-Final values
  const T0r = Ar + Cr;
  const T0i = Ai + Ci;
  const T1r = Ar - Cr;
  const T1i = Ai - Ci;
  const T2r = Br + Dr;
  const T2i = Bi + Di;
  const T3r = inv * (Br - Dr);
  const T3i = inv * (Bi - Di);

  // Final values
  const FAr = T0r + T2r;
  const FAi = T0i + T2i;

  const FBr = T1r + T3i;
  const FBi = T1i - T3r;

  const FCr = T0r - T2r;
  const FCi = T0i - T2i;

  const FDr = T1r - T3i;
  const FDi = T1i + T3r;

  out[outOff] = FAr;
  out[outOff + 1] = FAi;
  out[outOff + 2] = FBr;
  out[outOff + 3] = FBi;
  out[outOff + 4] = FCr;
  out[outOff + 5] = FCi;
  out[outOff + 6] = FDr;
  out[outOff + 7] = FDi;
};

// Real input radix-4 implementation
FFT.prototype._realTransform4 = function _realTransform4() {
  var out = this._out;
  var size = this._csize;

  // Initial step (permute and transform)
  var width = this._width;
  var step = 1 << width;
  var len = (size / step) << 1;

  var outOff;
  var t;
  var bitrev = this._bitrev;
  if (len === 4) {
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleRealTransform2(outOff, off >>> 1, step >>> 1);
    }
  } else {
    // len === 8
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleRealTransform4(outOff, off >>> 1, step >>> 1);
    }
  }

  // Loop through steps in decreasing order
  var inv = this._inv ? -1 : 1;
  var table = this.table;
  for (step >>= 2; step >= 2; step >>= 2) {
    len = (size / step) << 1;
    var halfLen = len >>> 1;
    var quarterLen = halfLen >>> 1;
    var hquarterLen = quarterLen >>> 1;

    // Loop through offsets in the data
    for (outOff = 0; outOff < size; outOff += len) {
      for (var i = 0, k = 0; i <= hquarterLen; i += 2, k += step) {
        var A = outOff + i;
        var B = A + quarterLen;
        var C = B + quarterLen;
        var D = C + quarterLen;

        // Original values
        var Ar = out[A];
        var Ai = out[A + 1];
        var Br = out[B];
        var Bi = out[B + 1];
        var Cr = out[C];
        var Ci = out[C + 1];
        var Dr = out[D];
        var Di = out[D + 1];

        // Middle values
        var MAr = Ar;
        var MAi = Ai;

        var tableBr = table[k];
        var tableBi = inv * table[k + 1];
        var MBr = Br * tableBr - Bi * tableBi;
        var MBi = Br * tableBi + Bi * tableBr;

        var tableCr = table[2 * k];
        var tableCi = inv * table[2 * k + 1];
        var MCr = Cr * tableCr - Ci * tableCi;
        var MCi = Cr * tableCi + Ci * tableCr;

        var tableDr = table[3 * k];
        var tableDi = inv * table[3 * k + 1];
        var MDr = Dr * tableDr - Di * tableDi;
        var MDi = Dr * tableDi + Di * tableDr;

        // Pre-Final values
        var T0r = MAr + MCr;
        var T0i = MAi + MCi;
        var T1r = MAr - MCr;
        var T1i = MAi - MCi;
        var T2r = MBr + MDr;
        var T2i = MBi + MDi;
        var T3r = inv * (MBr - MDr);
        var T3i = inv * (MBi - MDi);

        // Final values
        var FAr = T0r + T2r;
        var FAi = T0i + T2i;

        var FBr = T1r + T3i;
        var FBi = T1i - T3r;

        out[A] = FAr;
        out[A + 1] = FAi;
        out[B] = FBr;
        out[B + 1] = FBi;

        // Output final middle point
        if (i === 0) {
          var FCr = T0r - T2r;
          var FCi = T0i - T2i;
          out[C] = FCr;
          out[C + 1] = FCi;
          continue;
        }

        // Do not overwrite ourselves
        if (i === hquarterLen)
          continue;

        // In the flipped case:
        // MAi = -MAi
        // MBr=-MBi, MBi=-MBr
        // MCr=-MCr
        // MDr=MDi, MDi=MDr
        var ST0r = T1r;
        var ST0i = -T1i;
        var ST1r = T0r;
        var ST1i = -T0i;
        var ST2r = -inv * T3i;
        var ST2i = -inv * T3r;
        var ST3r = -inv * T2i;
        var ST3i = -inv * T2r;

        var SFAr = ST0r + ST2r;
        var SFAi = ST0i + ST2i;

        var SFBr = ST1r + ST3i;
        var SFBi = ST1i - ST3r;

        var SA = outOff + quarterLen - i;
        var SB = outOff + halfLen - i;

        out[SA] = SFAr;
        out[SA + 1] = SFAi;
        out[SB] = SFBr;
        out[SB + 1] = SFBi;
      }
    }
  }
};

// radix-2 implementation
//
// NOTE: Only called for len=4
FFT.prototype._singleRealTransform2 = function _singleRealTransform2(outOff,
                                                                     off,
                                                                     step) {
  const out = this._out;
  const data = this._data;

  const evenR = data[off];
  const oddR = data[off + step];

  const leftR = evenR + oddR;
  const rightR = evenR - oddR;

  out[outOff] = leftR;
  out[outOff + 1] = 0;
  out[outOff + 2] = rightR;
  out[outOff + 3] = 0;
};

// radix-4
//
// NOTE: Only called for len=8
FFT.prototype._singleRealTransform4 = function _singleRealTransform4(outOff,
                                                                     off,
                                                                     step) {
  const out = this._out;
  const data = this._data;
  const inv = this._inv ? -1 : 1;
  const step2 = step * 2;
  const step3 = step * 3;

  // Original values
  const Ar = data[off];
  const Br = data[off + step];
  const Cr = data[off + step2];
  const Dr = data[off + step3];

  // Pre-Final values
  const T0r = Ar + Cr;
  const T1r = Ar - Cr;
  const T2r = Br + Dr;
  const T3r = inv * (Br - Dr);

  // Final values
  const FAr = T0r + T2r;

  const FBr = T1r;
  const FBi = -T3r;

  const FCr = T0r - T2r;

  const FDr = T1r;
  const FDi = T3r;

  out[outOff] = FAr;
  out[outOff + 1] = 0;
  out[outOff + 2] = FBr;
  out[outOff + 3] = FBi;
  out[outOff + 4] = FCr;
  out[outOff + 5] = 0;
  out[outOff + 6] = FDr;
  out[outOff + 7] = FDi;
};

},{}],2:[function(require,module,exports){
module.exports = nextPowerOfTwo;

function nextPowerOfTwo (n) {
  if (n === 0) return 1
  n--;
  n |= n >> 1;
  n |= n >> 2;
  n |= n >> 4;
  n |= n >> 8;
  n |= n >> 16;
  return n+1
}
},{}],"ml-convolution":[function(require,module,exports){

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var FFT = _interopDefault(require('fft.js'));
var nextPOT = _interopDefault(require('next-power-of-two'));

function directConvolution(input, kernel) {
    const length = input.length + kernel.length - 1;
    const output = new Float32Array(length);
    output.fill(0);
    for (var i = 0; i < input.length; i++) {
        for (var j = 0; j < kernel.length; j++) {
            output[i + j] += input[i] * kernel[j];
        }
    }
    return output;
}

function fftProcessKernel(length, kernel, shared = true) {
  const resultLength = length + kernel.length;
  const fftLength = nextPOT(resultLength);

  const fft = new FFT(fftLength, shared);

  const fftKernel = createPaddedFFt(kernel, fft, fftLength);

  return fftKernel;
}

function fftConvolution(length, fftKernel, kernelLength) {
    const resultLength = length + kernelLength;
    const fftLength = nextPOT(resultLength);

    const fft = new FFT(fftLength);

    function go (input) {
      const fftInput = createPaddedFFt(input, fft, fftLength);

      // reuse arrays
      const fftConv = fftInput;
      const conv = new Float32Array(fftKernel.length);//.set(fftKernel);
      for (var i = 0; i < fftConv.length; i += 2) {
          const tmp = fftInput[i] * fftKernel[i] - fftInput[i + 1] * fftKernel[i + 1];
          fftConv[i + 1] = fftInput[i] * fftKernel[i + 1] + fftInput[i + 1] * fftKernel[i];
          fftConv[i] = tmp;
      }
      fft.inverseTransform(conv, fftConv);
      return fft.fromComplexArray(conv).slice(0, resultLength);
    }

    return go
}

function createPaddedFFt(data, fft, length) {
    const input = new Float32Array(length);
    input.set(data);
    const fftInput = fft.toComplexArray(input);
    const output = fft.createComplexArray();
    fft.transform(output, fftInput);
    return output;
}

exports.directConvolution = directConvolution;
exports.fftProcessKernel = fftProcessKernel;
exports.fftConvolution = fftConvolution;

},{"fft.js":1,"next-power-of-two":2}]},{},[]);

var convolve = r('ml-convolution');

var impulseConvolve = async (c, url, length) => {
  const impulse = await c.sample(url);
  if (length > -1) {
    impulse[0] = impulse[0].subarray(0, length);
  }
  const id = 'kernel:' + url + ':' + c.buffer[0].length + ':' + length;
  let kernel = await c.get(id);
  if (kernel === false) {
    // console.log('processing kernel:', id)
    kernel = convolve.fftProcessKernel(c.buffer[0].length, impulse[0]);
    await c.set(id, kernel);
    // console.log('set kernel cache:', id)
  }
  const reverb = convolve.fftConvolution(c.buffer[0].length, kernel, impulse[0].length);
  return reverb
};

var ImpulseReverb = async (c, { url, offset = 0, length = -1, id = '' }=c) => {
  const reverb = await impulseConvolve(c, url, length);
  let tail = 0;
  let prev = (await c.get('prev:'+id+url+(c.n-c.buffer[0].length)))||new Float32Array();
  let curr;
  let len = 0;
  let i = 0;
  return c => {
    len = c.buffer[0].length;
    curr = reverb(c.buffer[0]);
    // add remaining tail from previous step
    for (i = 0; i < prev.length; i++) {
      curr[i] += prev[i];
    }
    tail = (curr.length - offset) - len;
    prev = curr.subarray(-tail);
    c.set('prev:'+id+url+c.n, prev, 5000);
    return curr.subarray(offset, offset + len)
  }
};

var impulseConvolve$1 = async (c, url, length) => {
  const impulse = await c.sample(url);
  if (length > -1) {
    impulse[0] = impulse[0].subarray(0, length);
    impulse[1] = impulse[1].subarray(0, length);
  }
  const id = 'impulse-convolve-stereo:kernel:' + url + ':' + c.buffer[0].length + ':' + length;
  let kernel = await c.get(id);
  if (kernel === false) {
    // console.log('processing kernel:', id)
    kernel = [
      convolve.fftProcessKernel(c.buffer[0].length, impulse[0]),
      convolve.fftProcessKernel(c.buffer[0].length, impulse[1])
    ];
    await c.set(id, kernel);
    // console.log('set kernel cache:', id)
  }
  const reverb = [
    convolve.fftConvolution(c.buffer[0].length, kernel[0], impulse[0].length),
    convolve.fftConvolution(c.buffer[0].length, kernel[1], impulse[0].length)
  ];
  return reverb
};

var ImpulseReverbStereo = async (c, { url, offset = 0, length = -1, id = '' }=c) => {
  const reverb = await impulseConvolve$1(c, url, length);
  let tail = 0;
  let prev = (await c.get('impulse-reverb-stereo:prev:'+id+url+(c.n-c.buffer[0].length)))
    ||[new Float32Array(),new Float32Array()];
  let curr;
  let len = 0;
  let i = 0;
  return c => {
    len = c.buffer[0].length;
    curr = [
      reverb[0](c.buffer[0]),
      reverb[1](c.buffer[1])
    ];
    // add remaining tail from previous step
    for (i = 0; i < prev[0].length; i++) {
      curr[0][i] += prev[0][i];
      curr[1][i] += prev[1][i];
    }
    tail = (curr[0].length - offset) - len;
    prev[0] = curr[0].subarray(-tail);
    prev[1] = curr[1].subarray(-tail);
    c.set('impulse-reverb-stereo:prev:'+id+url+c.n, prev, 5000);
    return [
      curr[0].subarray(offset, offset + len),
      curr[1].subarray(offset, offset + len),
    ]
  }
};

const isMain$2 = typeof window !== 'undefined';

const GC_THRESHOLD = 20 * 1000;

const buffers = new Map;

const garbageCollect = match => {
  const now = performance.now();
  for (const [key, buffer] of buffers.entries()) {
    if ((match && key.includes(match))
    || (now - buffer.accessedAt > GC_THRESHOLD)) {
      buffers.delete(key);
      // console.log('buffer service gc:', key)
    }
  }
  return true
};

const BufferService = {
  buffers,
  methods: {
    getBuffer: (checksum, size, channels = 2) => {
      const id = (checksum + size + channels).toString();
      let buffer = buffers.get(id);
      // console.log(id + ' buffer found:', !!buffer)
      // console.log([...buffers])
      // setTimeout(garbageCollect, 5*1000)
      if (buffer) {
        buffer.createdNow = false;
        buffer.accessedAt = performance.now();
        return buffer
      }
      buffer = Array.from(Array(channels), () => new Shared32Array(size));
      buffer.createdNow = true;
      buffer.accessedAt = performance.now();
      buffer.checksum = checksum;
      buffers.set(id, buffer);
      return buffer
    },

    clear: match => garbageCollect(match)
  },
  postMessage (data) {
    BufferService.worker.onmessage({ data });
  },
  worker: {
    postMessage (data) {
      BufferService.onmessage({ data: { ackId: -999999, message: data } });
    }
  }
};

if (isMain$2) {
  install(BufferService);
  window['main:buffer-service'] = BufferService;
  console.log('buffer service running');
}
// setInterval(garbageCollect, GC_INTERVAL)

const isMain$3 = typeof window !== 'undefined';

const THREAD_URL = new URL('mix-worker-thread.js', import.meta.url).href;

const mixWorker = (url, context) => {
  const rpcUrl = getRpcUrl(url);
  return Promise.race([
    new Promise((resolve, reject) => setTimeout(reject, 30000, new Error('mixWorker: Timed out'))),
    rpc(rpcUrl, 'render', [url, context.toJSON?.() ?? context]).then(result => {
      if (isMain$3) rpc.markAsSafe(rpcUrl);
      return result
    })
  ])
};

rpc.onfail = rpc.onerror = (error, url) => mixWorker.onerror?.(error, url);

mixWorker.queueUpdates = false;

const scheduleUpdate = mixWorker.scheduleUpdate = new Set;
const skipCreate = new Set;

mixWorker.update = (url, force = false, noCreate = false) => {
  if (noCreate) {
    skipCreate.add(url);
  }
  if (!force && mixWorker.queueUpdates) {
    scheduleUpdate.add(url);
  } else {
    rpc.update(getRpcUrl(url), noCreate);
  }
};

mixWorker.flushUpdates = () => {
  for (const url of scheduleUpdate) {
    mixWorker.update(url, true, skipCreate.has(url));
  }
  scheduleUpdate.clear();
  skipCreate.clear();
};

mixWorker.clear = () => rpc.clearAll();

const getRpcUrl = url => {
  url = new URL(url, location.href).href;
  return THREAD_URL + '?' + encodeURIComponent(url)
};

var mixBuffers = (target, ...sources) => {
  // console.log('mixing', source[0].length, '>', target[0].length)
  const tl = target[0].length;
  sources.forEach(source => {
    let sl, rl, _vol = 1, vol, o = 0;
    if (Array.isArray(source[0])) { // [buffer,length,volume,offset]
      sl = (source[0][0].length * source[1])|0; // specified length
      _vol = source[2]??1;
      o = source[3]??0; // offset
      source = source[0]; // actual buffer
      rl = source[0].length; // real length
    } else {
      sl = rl = source[0].length;
    }

    // branching early so we don't branch in the loop
    if (typeof _vol === 'function') {
      if (target.length === 2) {
        if (source.length === 2) { // stereo to stereo
          for (let x = 0; x < tl; x++) {
            vol = _vol(x);
            target[0][x%tl] += source[0][(x+o)%sl%rl]*vol;
            target[1][x%tl] += source[1][(x+o)%sl%rl]*vol;
          }
        } else if (source.length === 1) { // mono to stereo
          for (let x = 0; x < tl; x++) {
            vol = _vol(x);
            target[0][x%tl] += (source[0][(x+o)%sl%rl]/2)*vol;
            target[1][x%tl] += (source[0][(x+o)%sl%rl]/2)*vol;
          }
        }
      } else if (target.length === 1) {
        if (source.length === 2) { // stereo to mono
          for (let x = 0; x < tl; x++) {
            vol = _vol(x);
            target[0][x%tl] += ((source[0][(x+o)%sl%rl] + source[1][(x+o)%sl%rl])/2)*vol;
          }
        } else if (source.length === 1) { // mono to mono
          for (let x = 0; x < tl; x++) {
            vol = _vol(x);
            target[0][x%tl] += source[0][(x+o)%sl%rl]*vol;
          }
        }
      }
    } else {
      vol = _vol;
      if (target.length === 2) {
        if (source.length === 2) { // stereo to stereo
          for (let x = 0; x < tl; x++) {
            target[0][x%tl] += source[0][(x+o)%sl%rl]*vol;
            target[1][x%tl] += source[1][(x+o)%sl%rl]*vol;
          }
        } else if (source.length === 1) { // mono to stereo
          for (let x = 0; x < tl; x++) {
            target[0][x%tl] += (source[0][(x+o)%sl%rl]/2)*vol;
            target[1][x%tl] += (source[0][(x+o)%sl%rl]/2)*vol;
          }
        }
      } else if (target.length === 1) {
        if (source.length === 2) { // stereo to mono
          for (let x = 0; x < tl; x++) {
            target[0][x%tl] += ((source[0][(x+o)%sl%rl] + source[1][(x+o)%sl%rl])/2)*vol;
          }
        } else if (source.length === 1) { // mono to mono
          for (let x = 0; x < tl; x++) {
            target[0][x%tl] += source[0][(x+o)%sl%rl]*vol;
          }
        }
      }
    }
  });
  return target
};

const BUFFER_SERVICE_URL = 'main:buffer-service';
const SAMPLE_SERVICE_URL = 'main:sample-service';
const GLOBAL_SERVICE_URL = 'main:global-service';

// const INTEGRATORS = {
//   // global frame position
//   n: c => c.frame,
//   // local frame position
//   p: c => c.position,

//   // global time = since user hit play
//   // global time in seconds: s=1=1 sec
//   s: c => (1+c.frame) / c.sampleRate,
//   // global time beat synced: b=1=1 beat
//   b: c => (1+c.frame) / c.beatRate,

//   // local time = since begin of this buffer
//   // local time in seconds (since the start of this buffer)
//   t: c => (1+c.position) / c.sampleRate,
//   // local time beat synced: k=1=1 beat (since the start of this buffer)
//   k: c => (1+c.position) / c.beatRate,

//   // current frame sample value of current scope buffer
//   x: c => +c.input
// }

class Context {
  static nonEnumerableProps (context) {
    return {
      // n: 0, // global frame position
      c: context,
      parent: null,
      p: 0, // local frame position
      s: 0,
      b: 0,
      t: 0,
      k: 0,
      n1: 1,
      p1: 1,
      sr: 44100,
      br: 44100,
    }
  }

  constructor (data) {
    this.id = data.id ?? randomId();

    this.bpm = 60;
    this.beatRate = 44100;
    this.sampleRate = 44100;

    Object.entries(this.constructor.nonEnumerableProps(this))
      .forEach(([key, value]) => {
        Object.defineProperty(this, key, {
          value,
          writable: true,
          enumerable: false,
          configurable: false
        });
      });

    // Object.keys(INTEGRATORS).forEach(key => {
    //   const contextKey = '__' + key
    //   Object.defineProperty(this, key, {
    //     get () {
    //       if (contextKey in this) {
    //         return this[contextKey]
    //       } else {
    //         const newContext = typeof this === 'function'
    //           ? this.clone({ ig: key, ref: this.ref })
    //           : new Context({ ...this, ig: key, ref: this.ref })

    //         Object.defineProperty(this, contextKey, {
    //           value: newContext,
    //           writable: false,
    //           enumerable: false,
    //           configurable: false
    //         })

    //         return this[contextKey]
    //       }
    //     },
    //     set (value) {
    //       if (key === 'n') {
    //         this.frame = value
    //       } else {
    //         throw new TypeError('Attempt to rewrite integrator: ' + key)
    //       }
    //     },
    //     enumerable: false,
    //     configurable: false
    //   })
    // })

    Object.assign(this, data);

    this.prepare();
  }

  // public api

  buf ({ id = '', len = this.bufferSize, ch = this.buffer.length } = {}) {
    return rpc(BUFFER_SERVICE_URL, 'getBuffer', [
      id+checksumOf(this),
      len|0,
      ch|0
    ])
  }

  get (id) {
    return rpc(GLOBAL_SERVICE_URL, 'get', [id])
  }

  set (id, value, ttl) {
    return rpc(GLOBAL_SERVICE_URL, 'set', [id, value, ttl])
  }

  sample (url) {
    return rpc(SAMPLE_SERVICE_URL, 'fetchSample', [url])
  }

  reverb (params) {
    return ImpulseReverb(this, params)
  }

  reverbStereo (params) {
    return ImpulseReverbStereo(this, params)
  }

  zero (buffer = this.buffer) {
    buffer.forEach(b => b.fill(0));
    return buffer
  }

  src (url, params = {}) {
    const targetUrl = new URL(url, this.url ?? location.href).href;
    const context = Object.assign(this.toJSON(), params, { url: targetUrl });
    return mixWorker(targetUrl, context).then(result => {
      result.update = c => { c.src(url, params); };
      return result
    })
  }

  async render (name, params) {
    const id = name + checksumOf(params);
    const buffer  = await this.buf({ ...params, id });
    if (buffer.createdNow) {
      console.log('shall render', name, id, buffer, params);
      await this.src('./' + name + '.js', { buffer, ...params, id });
    }
    return buffer
  }

  mix (...args) {
    return mixBuffers(...args)
  }

  async import (sources) {
    const entries = await Promise.all(
      Object.entries(sources)
        .map(async ([key, value]) => {
          const params = { ...value };
          delete params.src;
          const buffer = await this.render(value.src ?? key, {
            id: key,
            ...params,
          });
          return [key, buffer]
        }));

    return Object.fromEntries(entries)
  }

  // async import (sources) {
  //   const entries = await Promise.all(
  //     Object.entries(sources)
  //       .map(async ([key, value]) => {
  //         const buffer = value.buffer ?? await this.buf({
  //           id: value.id ?? key,
  //           len: value.len ?? this.br,
  //           ch: value.ch ?? 1,
  //         })
  //         const params = { ...value }
  //         delete params.src
  //         const src = await this.src('./' + (value.src ?? key) + '.js', {
  //           id: key,
  //           ...params,
  //           buffer
  //         })
  //         return [key, buffer]
  //       }))

  //   return Object.fromEntries(entries)
  // }

  // internals

  prepare () {
    this.c = this;

    this.sr = this.sampleRate;
    this.br = this.beatRate;

    this.n = this.n ?? 0;
    this.p = 0;

    this.update();
  }

  tick () {
    this.n = ++this.n;
    this.p = ++this.p;

    this.update();
  }

  tickBar () {
    this.n += this.buffer[0].length;
    this.p += this.buffer[0].length;

    this.update();
  }

  update () {
    this.n1 = this.n+1;
    this.p1 = this.p+1;

    this.s = this.n1 / this.sr;
    this.b = this.n1 / this.br;

    this.t = this.p1 / this.sr;
    this.k = this.p1 / this.br;
  }

  get bufferSize () { return this.buffer[0].length*4 }

  toJSON () {
    const json = {};
    for (const key in this) {
      if (key[0] === '_') continue
      if (typeof this[key] !== 'function') {
        json[key] = this[key];
      }
    }
    return json
  }

  // input=L+R of current buffer frame
  // input[0]=L
  // input[1]=R if stereo, otherwise L
  get input () {
    return [
      this.buffer[0][this.p],
      this.buffer[1]?.[this.p]??this.buffer[0][this.p]
    ]
  }

  get x () {
    return this.buffer[0][this.p]
      + (this.buffer[1]?.[this.p]??0)
  }
}

var Mix = context => {
  return Hyper({
    context: new Context(context),
    execute: render,
    mergeSide,
    mergeUp,
  })
};

const mergeUp = (...a) => {
  let ub, db;
  for (let u = a.length-1; u >= 1; u--) {
    for (let d = u-1; d >= 0; d--) {
      ub = a[u].buffer;
      db = a[d].buffer;
      if (ub !== db) {
        mixBuffers(db, ub);
      }
    }
  }
  return a[0]
};

const mergeSide = (...a) => {
  a = a.filter(x => typeof x !== 'string');
  for (let r = a.length-1; r >= 1; r--) {
    let l = r-1;
    for (let key in a[r]) {
      // sibling iteration shouldn't copy `frame`
      // i.e it should begin at the parent's
      //     position
      // if (key === 'n' || key === 'p') continue

      a[l][key] = a[r][key];
    }
  }
  return a[0]
};

class DynamicCache {
  static async cleanup () {
    const cacheKeys = await window.caches.keys();
    await Promise.all(cacheKeys
      // .filter(key => key.startsWith('dynamic-cache:')) //TODO: enable this in prod
      .map(key => window.caches.delete(key))
    );
  }

  static install () {
    return new Promise(async resolve => {
      await DynamicCache.cleanup();

      const reg = await navigator
        .serviceWorker
        .register('/dynamic-cache-service-worker.js', { scope: '/' });

      if (reg.active) return resolve(reg.active)

      reg.onupdatefound = () => {
        reg.installing.onstatechange = event => {
          if (event.target.state === 'activated') {
            resolve(event.target);
          }
        };
      };

      reg.update();
    })
  }

  constructor (namespace = 'test', headers = { 'Content-Type': 'application/javascript' }) {
    this.namespace = namespace;
    this.headers = headers;
    this.path = '/dynamic-cache/cache/' + this.namespace;
  }

  toJSON () {
    return {
      namespace: this.namespace,
      headers: this.headers,
      path: this.path
    }
  }

  async put (filename, content, headers = this.headers) {
    filename = `${this.path}/${filename}`;
    const req = new Request(filename, { method: 'GET', headers });
    const res = new Response(content, { status: 200, headers });
    const cache = await caches.open('dynamic-cache:' + this.namespace);
    await cache.put(req, res);
    this.onchange?.(location.origin + filename);
    return location.origin + filename
  }
}

const values = new Map;
const ttlMap = new Map;

const GlobalService = {
  values,
  ttlMap,
  methods: {
    get: id => {
      const value = values.get(id);
      if (!value) return false
      else return value
    },
    set: (id, value, ttl) => {
      values.set(id, value);
      if (ttl) ttlMap.set(id, [performance.now(), ttl]);
      return value
    }
  },
  postMessage (data) {
    GlobalService.worker.onmessage({ data });
  },
  worker: {
    postMessage (data) {
      GlobalService.onmessage({ data: { ackId: -999999, message: data } });
    }
  }
};

setInterval(() => {
  const now = performance.now();
  for (const [id, [time, ttl]] of ttlMap.entries()) {
    if (now > time + ttl) {
      ttlMap.delete(id);
      values.delete(id);
      console.log('gs gc:', id, ttl, [values.size]);
    }
  }
  if (values.size > 30) {
    console.warn('gs: too many values:', values.size);
  }
}, 1000);

install(GlobalService);
window['main:global-service'] = GlobalService;
console.log('global service running');

// hacky way to switch api urls from dev to prod
const API_URL$1 = location.port.length === 4
  ? 'http://localhost:3000' : location.origin;

const mode = 'cors';

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

const load = async (title) => {
  const url = title[0] === '.' ? title : API_URL$1 + '/' + title;

  const res = await fetch(url, { mode, headers });

  const json = await res.json();

  return json
};

const cache = new DynamicCache('projects', {
  'Content-Type': 'application/javascript'
});

const renderWaveform = async title => {
  const audio = Audio$1(); // required for sample service

  const getBeatRate = (sampleRate, bpm) => {
    return Math.round(sampleRate * (60 / bpm))
  };

  await DynamicCache.install();

  // warmup in cache
  fetch('/mix-worker-thread.js');

  const json = await load(title);

  await Promise.all([
    ...json.tracks,
    ...json.modules
  ].map(async file => {
    file.filename = await cache.put(file.title, file.value);
  }));

  const bpm = parseFloat(
    (60 * (
      44100
    / getBeatRate(44100, json.bpm)
    )
  ).toFixed(6));

  const beatRate = getBeatRate(44100, bpm);

  const bufferSize = beatRate * 4;

  const output = Array(2).fill(0).map(() =>
    new Shared32Array(bufferSize));

  const tracks = json.tracks
    .filter(track => !track.title.endsWith('shader.js'))
    .map(track => {
    track.buffer = Array(2).fill(0).map(() =>
      new Shared32Array(bufferSize));
    track.context = {
      n: 0,
      bpm,
      beatRate,
      sampleRate: 44100,
      buffer: track.buffer
    };
    track.mix = Mix(track.context);
    return track
  });

  await Promise.all(tracks.map(track => track.mix(c => c.src(track.filename))));

  mixBuffers(output, ...tracks.filter(track => !track.mute).map(track =>
    [track.buffer, 1, track.vol]
  ));

  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 500;
  canvas.style.width = '500px';
  canvas.style.height = '250px';
  container.appendChild(canvas);

  drawWaveform(canvas, output[0]);
  canvas.toBlob(blob => {
    const filename = title.replace(/[^a-z0-9]/gi, '_') + '.webp';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }, 'image/webp', .1);

  const encoder = new OggVorbisEncoder(44100, 2, .1);
  encoder.encode(output);
  const blob = encoder.finish();
  const filename = title.replace(/[^a-z0-9]/gi, '_') + '.ogg';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();

  // const audio = Audio()
  // const audioBuffer = audio.createBuffer(2, bufferSize, 44100)
  // audioBuffer.getChannelData(0).set(output[0])
  // audioBuffer.getChannelData(1).set(output[1])

  // const node = audio.createBufferSource()
  // node.buffer = audioBuffer

  // const dest = audio.createMediaStreamDestination()
  // const chunks = []
  // const mediaRecorder = new MediaRecorder(dest.stream)
  // mediaRecorder.ondataavailable = e => chunks.push(e.data)
  // mediaRecorder.onstop = e => {
  //   const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' })
  //   const filename = 'output.ogg'
  //   const a = document.createElement('a')
  //   a.href = URL.createObjectURL(blob)
  //   a.download = filename
  //   a.click()
  // }

  // // node.connect(audio.destination)
  // node.connect(dest)
  // mediaRecorder.start()
  // node.start()
  // node.onended = () => {
  //   mediaRecorder.stop()
  // }
  console.log('done');
};

const waveformQuery = new URL(location).searchParams.get('waveform');
if (waveformQuery) {
  renderWaveform(waveformQuery);
}
