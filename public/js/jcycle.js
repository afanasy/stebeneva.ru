/*
 * jQuery Cycle Plugin (with Transition Definitions)
 * Examples and documentation at: http://malsup.com/jquery/cycle/
 * Copyright (c) 2007-2008 M. Alsup
 * Version: 2.25
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
;(function(G){var A="2.25";var B=G.browser.msie&&/MSIE 6.0/.test(navigator.userAgent);function D(){if(window.console&&window.console.log){window.console.log("[cycle] "+Array.prototype.join.call(arguments,""))}}G.fn.cycle=function(I){return this.each(function(){if(I===undefined||I===null){I={}}if(I.constructor==String){switch(I){case"stop":if(this.cycleTimeout){clearTimeout(this.cycleTimeout)}this.cycleTimeout=0;G(this).data("cycle.opts","");return ;case"pause":this.cyclePause=1;return ;case"resume":this.cyclePause=0;return ;default:I={fx:I}}}else{if(I.constructor==Number){var N=I;I=G(this).data("cycle.opts");if(!I){D("options not found, can not advance slide");return }if(N<0||N>=I.elements.length){D("invalid slide index: "+N);return }I.nextSlide=N;if(this.cycleTimeout){clearTimeout(this.cycleTimeout);this.cycleTimeout=0}E(I.elements,I,1,1);return }}if(this.cycleTimeout){clearTimeout(this.cycleTimeout)}this.cycleTimeout=0;this.cyclePause=0;var Q=G(this);var O=I.slideExpr?G(I.slideExpr,this):Q.children();var K=O.get();if(K.length<2){D("terminating; too few slides: "+K.length);return }var J=G.extend({},G.fn.cycle.defaults,I||{},G.metadata?Q.metadata():G.meta?Q.data():{});if(J.autostop){J.countdown=J.autostopCount||K.length}Q.data("cycle.opts",J);J.container=this;J.elements=K;J.before=J.before?[J.before]:[];J.after=J.after?[J.after]:[];J.after.unshift(function(){J.busy=0});if(J.continuous){J.after.push(function(){E(K,J,0,!J.rev)})}if(B&&J.cleartype&&!J.cleartypeNoBg){C(O)}var S=this.className;J.width=parseInt((S.match(/w:(\d+)/)||[])[1])||J.width;J.height=parseInt((S.match(/h:(\d+)/)||[])[1])||J.height;J.timeout=parseInt((S.match(/t:(\d+)/)||[])[1])||J.timeout;if(Q.css("position")=="static"){Q.css("position","relative")}if(J.width){Q.width(J.width)}if(J.height&&J.height!="auto"){Q.height(J.height)}if(J.random){J.randomMap=[];for(var L=0;L<K.length;L++){J.randomMap.push(L)}J.randomMap.sort(function(U,T){return Math.random()-0.5});J.randomIndex=0;J.startingSlide=J.randomMap[0]}else{if(J.startingSlide>=K.length){J.startingSlide=0}}var M=J.startingSlide||0;O.css({position:"absolute",top:0,left:0}).hide().each(function(T){var U=M?T>=M?K.length-(T-M):M-T:K.length-T;G(this).css("z-index",U)});G(K[M]).css("opacity",1).show();if(G.browser.msie){K[M].style.removeAttribute("filter")}if(J.fit&&J.width){O.width(J.width)}if(J.fit&&J.height&&J.height!="auto"){O.height(J.height)}if(J.pause){Q.hover(function(){this.cyclePause=1},function(){this.cyclePause=0})}var R=G.fn.cycle.transitions[J.fx];if(G.isFunction(R)){R(Q,O,J)}else{if(J.fx!="custom"){D("unknown transition: "+J.fx)}}O.each(function(){var T=G(this);this.cycleH=(J.fit&&J.height)?J.height:T.height();this.cycleW=(J.fit&&J.width)?J.width:T.width()});J.cssBefore=J.cssBefore||{};J.animIn=J.animIn||{};J.animOut=J.animOut||{};O.not(":eq("+M+")").css(J.cssBefore);if(J.cssFirst){G(O[M]).css(J.cssFirst)}if(J.timeout){if(J.speed.constructor==String){J.speed={slow:600,fast:200}[J.speed]||400}if(!J.sync){J.speed=J.speed/2}while((J.timeout-J.speed)<250){J.timeout+=J.speed}}if(J.easing){J.easeIn=J.easeOut=J.easing}if(!J.speedIn){J.speedIn=J.speed}if(!J.speedOut){J.speedOut=J.speed}J.slideCount=K.length;J.currSlide=M;if(J.random){J.nextSlide=J.currSlide;if(++J.randomIndex==K.length){J.randomIndex=0}J.nextSlide=J.randomMap[J.randomIndex]}else{J.nextSlide=J.startingSlide>=(K.length-1)?0:J.startingSlide+1}var P=O[M];if(J.before.length){J.before[0].apply(P,[P,P,J,true])}if(J.after.length>1){J.after[1].apply(P,[P,P,J,true])}if(J.click&&!J.next){J.next=J.click}if(J.next){G(J.next).bind("click",function(){return F(K,J,J.rev?-1:1)})}if(J.prev){G(J.prev).bind("click",function(){return F(K,J,J.rev?1:-1)})}if(J.pager){H(K,J)}J.addSlide=function(U){var T=G(U),V=T[0];if(!J.autostopCount){J.countdown++}K.push(V);if(J.els){J.els.push(V)}J.slideCount=K.length;T.css("position","absolute").appendTo(Q);if(B&&J.cleartype&&!J.cleartypeNoBg){C(T)}if(J.fit&&J.width){T.width(J.width)}if(J.fit&&J.height&&J.height!="auto"){O.height(J.height)}V.cycleH=(J.fit&&J.height)?J.height:T.height();V.cycleW=(J.fit&&J.width)?J.width:T.width();T.css(J.cssBefore);if(J.pager){G.fn.cycle.createPagerAnchor(K.length-1,V,G(J.pager),K,J)}if(typeof J.onAddSlide=="function"){J.onAddSlide(T)}};if(J.timeout||J.continuous){this.cycleTimeout=setTimeout(function(){E(K,J,0,!J.rev)},J.continuous?10:J.timeout+(J.delay||0))}})};function E(N,I,M,O){if(I.busy){return }var L=I.container,Q=N[I.currSlide],P=N[I.nextSlide];if(L.cycleTimeout===0&&!M){return }if(!M&&!L.cyclePause&&((I.autostop&&(--I.countdown<=0))||(I.nowrap&&!I.random&&I.nextSlide<I.currSlide))){if(I.end){I.end(I)}return }if(M||!L.cyclePause){if(I.before.length){G.each(I.before,function(R,S){S.apply(P,[Q,P,I,O])})}var J=function(){if(G.browser.msie&&I.cleartype){this.style.removeAttribute("filter")}G.each(I.after,function(R,S){S.apply(P,[Q,P,I,O])})};if(I.nextSlide!=I.currSlide){I.busy=1;if(I.fxFn){I.fxFn(Q,P,I,J,O)}else{if(G.isFunction(G.fn.cycle[I.fx])){G.fn.cycle[I.fx](Q,P,I,J)}else{G.fn.cycle.custom(Q,P,I,J,M&&I.fastOnEvent)}}}if(I.random){I.currSlide=I.nextSlide;if(++I.randomIndex==N.length){I.randomIndex=0}I.nextSlide=I.randomMap[I.randomIndex]}else{var K=(I.nextSlide+1)==N.length;I.nextSlide=K?0:I.nextSlide+1;I.currSlide=K?N.length-1:I.nextSlide-1}if(I.pager){G.fn.cycle.updateActivePagerLink(I.pager,I.currSlide)}}if(I.timeout&&!I.continuous){L.cycleTimeout=setTimeout(function(){E(N,I,0,!I.rev)},I.timeout)}else{if(I.continuous&&L.cyclePause){L.cycleTimeout=setTimeout(function(){E(N,I,0,!I.rev)},10)}}}G.fn.cycle.updateActivePagerLink=function(I,J){G(I).find("a").removeClass("activeSlide").filter("a:eq("+J+")").addClass("activeSlide")};function F(I,J,M){var L=J.container,K=L.cycleTimeout;if(K){clearTimeout(K);L.cycleTimeout=0}if(J.random&&M<0){J.randomIndex--;if(--J.randomIndex==-2){J.randomIndex=I.length-2}else{if(J.randomIndex==-1){J.randomIndex=I.length-1}}J.nextSlide=J.randomMap[J.randomIndex]}else{if(J.random){if(++J.randomIndex==I.length){J.randomIndex=0}J.nextSlide=J.randomMap[J.randomIndex]}else{J.nextSlide=J.currSlide+M;if(J.nextSlide<0){if(J.nowrap){return false}J.nextSlide=I.length-1}else{if(J.nextSlide>=I.length){if(J.nowrap){return false}J.nextSlide=0}}}}if(J.prevNextClick&&typeof J.prevNextClick=="function"){J.prevNextClick(M>0,J.nextSlide,I[J.nextSlide])}E(I,J,1,M>=0);return false}function H(J,K){var I=G(K.pager);G.each(J,function(L,M){G.fn.cycle.createPagerAnchor(L,M,I,J,K)});G.fn.cycle.updateActivePagerLink(K.pager,K.startingSlide)}G.fn.cycle.createPagerAnchor=function(K,L,I,J,M){var N=(typeof M.pagerAnchorBuilder=="function")?G(M.pagerAnchorBuilder(K,L)):G('<a href="#">'+(K+1)+"</a>");if(N.parents("body").length==0){N.appendTo(I)}N.bind(M.pagerEvent,function(){M.nextSlide=K;var P=M.container,O=P.cycleTimeout;if(O){clearTimeout(O);P.cycleTimeout=0}if(typeof M.pagerClick=="function"){M.pagerClick(M.nextSlide,J[M.nextSlide])}E(J,M,1,M.currSlide<K);return false})};function C(K){function J(L){var L=parseInt(L).toString(16);return L.length<2?"0"+L:L}function I(N){for(;N&&N.nodeName.toLowerCase()!="html";N=N.parentNode){var L=G.css(N,"background-color");if(L.indexOf("rgb")>=0){var M=L.match(/\d+/g);return"#"+J(M[0])+J(M[1])+J(M[2])}if(L&&L!="transparent"){return L}}return"#ffffff"}K.each(function(){G(this).css("background-color",I(this))})}G.fn.cycle.custom=function(T,N,I,K,J){var S=G(T),O=G(N);O.css(I.cssBefore);var L=J?1:I.speedIn;var R=J?1:I.speedOut;var M=J?null:I.easeIn;var Q=J?null:I.easeOut;var P=function(){O.animate(I.animIn,L,M,K)};S.animate(I.animOut,R,Q,function(){if(I.cssAfter){S.css(I.cssAfter)}if(!I.sync){P()}});if(I.sync){P()}};G.fn.cycle.transitions={fade:function(J,K,I){K.not(":eq("+I.startingSlide+")").css("opacity",0);I.before.push(function(){G(this).show()});I.animIn={opacity:1};I.animOut={opacity:0};I.cssBefore={opacity:0};I.cssAfter={display:"none"}}};G.fn.cycle.ver=function(){return A};G.fn.cycle.defaults={fx:"fade",timeout:4000,continuous:0,speed:1000,speedIn:null,speedOut:null,next:null,prev:null,prevNextClick:null,pager:null,pagerClick:null,pagerEvent:"click",pagerAnchorBuilder:null,before:null,after:null,end:null,easing:null,easeIn:null,easeOut:null,shuffle:null,animIn:null,animOut:null,cssBefore:null,cssAfter:null,fxFn:null,height:"auto",startingSlide:0,sync:1,random:0,fit:0,pause:0,autostop:0,autostopCount:0,delay:0,slideExpr:null,cleartype:0,nowrap:0,fastOnEvent:0}})(jQuery);(function(A){A.fn.cycle.transitions.scrollUp=function(C,D,B){C.css("overflow","hidden");B.before.push(function(G,E,F){A(this).show();F.cssBefore.top=E.offsetHeight;F.animOut.top=0-G.offsetHeight});B.cssFirst={top:0};B.animIn={top:0};B.cssAfter={display:"none"}};A.fn.cycle.transitions.scrollDown=function(C,D,B){C.css("overflow","hidden");B.before.push(function(G,E,F){A(this).show();F.cssBefore.top=0-E.offsetHeight;F.animOut.top=G.offsetHeight});B.cssFirst={top:0};B.animIn={top:0};B.cssAfter={display:"none"}};A.fn.cycle.transitions.scrollLeft=function(C,D,B){C.css("overflow","hidden");B.before.push(function(G,E,F){A(this).show();F.cssBefore.left=E.offsetWidth;F.animOut.left=0-G.offsetWidth});B.cssFirst={left:0};B.animIn={left:0}};A.fn.cycle.transitions.scrollRight=function(C,D,B){C.css("overflow","hidden");B.before.push(function(G,E,F){A(this).show();F.cssBefore.left=0-E.offsetWidth;F.animOut.left=G.offsetWidth});B.cssFirst={left:0};B.animIn={left:0}};A.fn.cycle.transitions.scrollHorz=function(C,D,B){C.css("overflow","hidden").width();B.before.push(function(I,G,H,F){A(this).show();var E=I.offsetWidth,J=G.offsetWidth;H.cssBefore=F?{left:J}:{left:-J};H.animIn.left=0;H.animOut.left=F?-E:E;D.not(I).css(H.cssBefore)});B.cssFirst={left:0};B.cssAfter={display:"none"}};A.fn.cycle.transitions.scrollVert=function(C,D,B){C.css("overflow","hidden");B.before.push(function(J,G,H,F){A(this).show();var I=J.offsetHeight,E=G.offsetHeight;H.cssBefore=F?{top:-E}:{top:E};H.animIn.top=0;H.animOut.top=F?I:-I;D.not(J).css(H.cssBefore)});B.cssFirst={top:0};B.cssAfter={display:"none"}};A.fn.cycle.transitions.slideX=function(C,D,B){B.before.push(function(G,E,F){A(G).css("zIndex",1)});B.onAddSlide=function(E){E.hide()};B.cssBefore={zIndex:2};B.animIn={width:"show"};B.animOut={width:"hide"}};A.fn.cycle.transitions.slideY=function(C,D,B){B.before.push(function(G,E,F){A(G).css("zIndex",1)});B.onAddSlide=function(E){E.hide()};B.cssBefore={zIndex:2};B.animIn={height:"show"};B.animOut={height:"hide"}};A.fn.cycle.transitions.shuffle=function(E,F,D){var B=E.css("overflow","visible").width();F.css({left:0,top:0});D.before.push(function(){A(this).show()});D.speed=D.speed/2;D.random=0;D.shuffle=D.shuffle||{left:-B,top:15};D.els=[];for(var C=0;C<F.length;C++){D.els.push(F[C])}for(var C=0;C<D.startingSlide;C++){D.els.push(D.els.shift())}D.fxFn=function(L,J,K,G,I){var H=I?A(L):A(J);H.animate(K.shuffle,K.speedIn,K.easeIn,function(){I?K.els.push(K.els.shift()):K.els.unshift(K.els.pop());if(I){for(var N=0,M=K.els.length;N<M;N++){A(K.els[N]).css("z-index",M-N)}}else{var O=A(L).css("z-index");H.css("z-index",parseInt(O)+1)}H.animate({left:0,top:0},K.speedOut,K.easeOut,function(){A(I?this:L).hide();if(G){G()}})})};D.onAddSlide=function(G){G.hide()}};A.fn.cycle.transitions.turnUp=function(C,D,B){B.before.push(function(G,E,F){A(this).show();F.cssBefore.top=E.cycleH;F.animIn.height=E.cycleH});B.onAddSlide=function(E){E.hide()};B.cssFirst={top:0};B.cssBefore={height:0};B.animIn={top:0};B.animOut={height:0};B.cssAfter={display:"none"}};A.fn.cycle.transitions.turnDown=function(C,D,B){B.before.push(function(G,E,F){A(this).show();F.animIn.height=E.cycleH;F.animOut.top=G.cycleH});B.onAddSlide=function(E){E.hide()};B.cssFirst={top:0};B.cssBefore={top:0,height:0};B.animOut={height:0};B.cssAfter={display:"none"}};A.fn.cycle.transitions.turnLeft=function(C,D,B){B.before.push(function(G,E,F){A(this).show();F.cssBefore.left=E.cycleW;F.animIn.width=E.cycleW});B.onAddSlide=function(E){E.hide()};B.cssBefore={width:0};B.animIn={left:0};B.animOut={width:0};B.cssAfter={display:"none"}};A.fn.cycle.transitions.turnRight=function(C,D,B){B.before.push(function(G,E,F){A(this).show();F.animIn.width=E.cycleW;F.animOut.left=G.cycleW});B.onAddSlide=function(E){E.hide()};B.cssBefore={left:0,width:0};B.animIn={left:0};B.animOut={width:0};B.cssAfter={display:"none"}};A.fn.cycle.transitions.zoom=function(C,D,B){B.cssFirst={top:0,left:0};B.cssAfter={display:"none"};B.before.push(function(G,E,F){A(this).show();F.cssBefore={width:0,height:0,top:E.cycleH/2,left:E.cycleW/2};F.cssAfter={display:"none"};F.animIn={top:0,left:0,width:E.cycleW,height:E.cycleH};F.animOut={width:0,height:0,top:G.cycleH/2,left:G.cycleW/2};A(G).css("zIndex",2);A(E).css("zIndex",1)});B.onAddSlide=function(E){E.hide()}};A.fn.cycle.transitions.fadeZoom=function(C,D,B){B.before.push(function(G,E,F){F.cssBefore={width:0,height:0,opacity:1,left:E.cycleW/2,top:E.cycleH/2,zIndex:1};F.animIn={top:0,left:0,width:E.cycleW,height:E.cycleH}});B.animOut={opacity:0};B.cssAfter={zIndex:0}};A.fn.cycle.transitions.blindX=function(D,E,C){var B=D.css("overflow","hidden").width();E.show();C.before.push(function(H,F,G){A(H).css("zIndex",1)});C.cssBefore={left:B,zIndex:2};C.cssAfter={zIndex:1};C.animIn={left:0};C.animOut={left:B}};A.fn.cycle.transitions.blindY=function(D,E,C){var B=D.css("overflow","hidden").height();E.show();C.before.push(function(H,F,G){A(H).css("zIndex",1)});C.cssBefore={top:B,zIndex:2};C.cssAfter={zIndex:1};C.animIn={top:0};C.animOut={top:B}};A.fn.cycle.transitions.blindZ=function(E,F,D){var C=E.css("overflow","hidden").height();var B=E.width();F.show();D.before.push(function(I,G,H){A(I).css("zIndex",1)});D.cssBefore={top:C,left:B,zIndex:2};D.cssAfter={zIndex:1};D.animIn={top:0,left:0};D.animOut={top:C,left:B}};A.fn.cycle.transitions.growX=function(C,D,B){B.before.push(function(G,E,F){F.cssBefore={left:this.cycleW/2,width:0,zIndex:2};F.animIn={left:0,width:this.cycleW};F.animOut={left:0};A(G).css("zIndex",1)});B.onAddSlide=function(E){E.hide().css("zIndex",1)}};A.fn.cycle.transitions.growY=function(C,D,B){B.before.push(function(G,E,F){F.cssBefore={top:this.cycleH/2,height:0,zIndex:2};F.animIn={top:0,height:this.cycleH};F.animOut={top:0};A(G).css("zIndex",1)});B.onAddSlide=function(E){E.hide().css("zIndex",1)}};A.fn.cycle.transitions.curtainX=function(C,D,B){B.before.push(function(G,E,F){F.cssBefore={left:E.cycleW/2,width:0,zIndex:1,display:"block"};F.animIn={left:0,width:this.cycleW};F.animOut={left:G.cycleW/2,width:0};A(G).css("zIndex",2)});B.onAddSlide=function(E){E.hide()};B.cssAfter={zIndex:1,display:"none"}};A.fn.cycle.transitions.curtainY=function(C,D,B){B.before.push(function(G,E,F){F.cssBefore={top:E.cycleH/2,height:0,zIndex:1,display:"block"};F.animIn={top:0,height:this.cycleH};F.animOut={top:G.cycleH/2,height:0};A(G).css("zIndex",2)});B.onAddSlide=function(E){E.hide()};B.cssAfter={zIndex:1,display:"none"}};A.fn.cycle.transitions.cover=function(E,F,D){var G=D.direction||"left";var B=E.css("overflow","hidden").width();var C=E.height();D.before.push(function(J,H,I){I.cssBefore=I.cssBefore||{};I.cssBefore.zIndex=2;I.cssBefore.display="block";if(G=="right"){I.cssBefore.left=-B}else{if(G=="up"){I.cssBefore.top=C}else{if(G=="down"){I.cssBefore.top=-C}else{I.cssBefore.left=B}}}A(J).css("zIndex",1)});if(!D.animIn){D.animIn={left:0,top:0}}if(!D.animOut){D.animOut={left:0,top:0}}D.cssAfter=D.cssAfter||{};D.cssAfter.zIndex=2;D.cssAfter.display="none"};A.fn.cycle.transitions.uncover=function(E,F,D){var G=D.direction||"left";var B=E.css("overflow","hidden").width();var C=E.height();D.before.push(function(J,H,I){I.cssBefore.display="block";if(G=="right"){I.animOut.left=B}else{if(G=="up"){I.animOut.top=-C}else{if(G=="down"){I.animOut.top=C}else{I.animOut.left=-B}}}A(J).css("zIndex",2);A(H).css("zIndex",1)});D.onAddSlide=function(H){H.hide()};if(!D.animIn){D.animIn={left:0,top:0}}D.cssBefore=D.cssBefore||{};D.cssBefore.top=0;D.cssBefore.left=0;D.cssAfter=D.cssAfter||{};D.cssAfter.zIndex=1;D.cssAfter.display="none"};A.fn.cycle.transitions.toss=function(E,F,D){var B=E.css("overflow","visible").width();var C=E.height();D.before.push(function(I,G,H){A(I).css("zIndex",2);H.cssBefore.display="block";if(!H.animOut.left&&!H.animOut.top){H.animOut={left:B*2,top:-C/2,opacity:0}}else{H.animOut.opacity=0}});D.onAddSlide=function(G){G.hide()};D.cssBefore={left:0,top:0,zIndex:1,opacity:1};D.animIn={left:0};D.cssAfter={zIndex:2,display:"none"}};A.fn.cycle.transitions.wipe=function(K,H,C){var J=K.css("overflow","hidden").width();var F=K.height();C.cssBefore=C.cssBefore||{};var D;if(C.clip){if(/l2r/.test(C.clip)){D="rect(0px 0px "+F+"px 0px)"}else{if(/r2l/.test(C.clip)){D="rect(0px "+J+"px "+F+"px "+J+"px)"}else{if(/t2b/.test(C.clip)){D="rect(0px "+J+"px 0px 0px)"}else{if(/b2t/.test(C.clip)){D="rect("+F+"px "+J+"px "+F+"px 0px)"}else{if(/zoom/.test(C.clip)){var L=parseInt(F/2);var E=parseInt(J/2);D="rect("+L+"px "+E+"px "+L+"px "+E+"px)"}}}}}}C.cssBefore.clip=C.cssBefore.clip||D||"rect(0px 0px 0px 0px)";var G=C.cssBefore.clip.match(/(\d+)/g);var L=parseInt(G[0]),B=parseInt(G[1]),I=parseInt(G[2]),E=parseInt(G[3]);C.before.push(function(T,O,R){if(T==O){return }var N=A(T).css("zIndex",2);var M=A(O).css({zIndex:3,display:"block"});var Q=1,P=parseInt((R.speedIn/13))-1;function S(){var V=L?L-parseInt(Q*(L/P)):0;var W=E?E-parseInt(Q*(E/P)):0;var X=I<F?I+parseInt(Q*((F-I)/P||1)):F;var U=B<J?B+parseInt(Q*((J-B)/P||1)):J;M.css({clip:"rect("+V+"px "+U+"px "+X+"px "+W+"px)"});(Q++<=P)?setTimeout(S,13):N.css("display","none")}S()});C.cssAfter={};C.animIn={left:0};C.animOut={left:0}}})(jQuery);
