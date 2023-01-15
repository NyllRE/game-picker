import{C as D,D as f,E}from"../server.mjs";import"vue";import"#internal/nitro";import"vue-router";/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const x=(s,h,m,p,g)=>{const r=s.ownerDocument.defaultView,c=D(s),X=t=>{const{startX:e}=t;return c?e>=r.innerWidth-50:e<=50},a=t=>c?-t.deltaX:t.deltaX,w=t=>c?-t.velocityX:t.velocityX;return f({el:s,gestureName:"goback-swipe",gesturePriority:40,threshold:10,canStart:t=>X(t)&&h(),onStart:m,onMove:t=>{const e=a(t)/r.innerWidth;p(e)},onEnd:t=>{const n=a(t),e=r.innerWidth,o=n/e,i=w(t),v=e/2,l=i>=0&&(i>.2||n>v),u=(l?1-o:o)*e;let d=0;if(u>5){const y=u/Math.abs(i);d=Math.min(y,540)}g(l,o<=0?.01:E(0,o,.9999),d)}})};export{x as createSwipeBackGesture};
//# sourceMappingURL=swipe-back.c1b58d63.js.map
