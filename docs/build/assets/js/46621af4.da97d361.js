"use strict";(self.webpackChunkada_ca_ddocs=self.webpackChunkada_ca_ddocs||[]).push([[4317],{8905:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>l,contentTitle:()=>o,default:()=>p,frontMatter:()=>s,metadata:()=>i,toc:()=>a});var t=r(5893),c=r(3905);const s={},o="resize",i={id:"howtodevelop/reference/sequence/OneD/resize",title:"resize",description:"repeats or cuts the current sequence so that it is of a specified length.",source:"@site/docs/howtodevelop/reference/sequence/OneD/resize.md",sourceDirName:"howtodevelop/reference/sequence/OneD",slug:"/howtodevelop/reference/sequence/OneD/resize",permalink:"/docs/howtodevelop/reference/sequence/OneD/resize",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"devDocsSidebar",previous:{title:"pushMultiple",permalink:"/docs/howtodevelop/reference/sequence/OneD/pushMultiple"},next:{title:"unshift",permalink:"/docs/howtodevelop/reference/sequence/OneD/unshift"}},l={},a=[{value:"Parameters",id:"parameters",level:2},{value:"Returns",id:"returns",level:2},{value:"Implementation",id:"implementation",level:2}];function u(e){const n={code:"code",h1:"h1",h2:"h2",li:"li",p:"p",pre:"pre",ul:"ul",...(0,c.ah)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.h1,{id:"resize",children:"resize"}),"\n",(0,t.jsx)(n.p,{children:"repeats or cuts the current sequence so that it is of a specified length."}),"\n",(0,t.jsx)(n.h2,{id:"parameters",children:"Parameters"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsx)(n.li,{children:"A number representing the size to make the sequence"}),"\n"]}),"\n",(0,t.jsx)(n.h2,{id:"returns",children:"Returns"}),"\n",(0,t.jsx)(n.p,{children:"the current Sequence.OneD object"}),"\n",(0,t.jsx)(n.h2,{id:"implementation",children:"Implementation"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{children:"let seq = new Sequence.OneD([0,0,1,1])\nseq.resize(10)\n"})}),"\n",(0,t.jsx)(n.p,{children:"After calling resize, the sequence would be [0, 0, 1, 1, 0, 0, 1, 1, 0, 0]."}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{children:"let seq = new Sequence.OneD([0,0,1,1])\nseq.resize(3)\n"})}),"\n",(0,t.jsx)(n.p,{children:"After calling resize, the sequence would be [0, 0, 1]."})]})}function p(e={}){const{wrapper:n}={...(0,c.ah)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(u,{...e})}):u(e)}},3905:(e,n,r)=>{r.d(n,{ah:()=>a});var t=r(7294);function c(e,n,r){return n in e?Object.defineProperty(e,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[n]=r,e}function s(e,n){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),r.push.apply(r,t)}return r}function o(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?s(Object(r),!0).forEach((function(n){c(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):s(Object(r)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))}))}return e}function i(e,n){if(null==e)return{};var r,t,c=function(e,n){if(null==e)return{};var r,t,c={},s=Object.keys(e);for(t=0;t<s.length;t++)r=s[t],n.indexOf(r)>=0||(c[r]=e[r]);return c}(e,n);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(t=0;t<s.length;t++)r=s[t],n.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(c[r]=e[r])}return c}var l=t.createContext({}),a=function(e){var n=t.useContext(l),r=n;return e&&(r="function"==typeof e?e(n):o(o({},n),e)),r},u={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},p=t.forwardRef((function(e,n){var r=e.components,c=e.mdxType,s=e.originalType,l=e.parentName,p=i(e,["components","mdxType","originalType","parentName"]),d=a(r),h=c,f=d["".concat(l,".").concat(h)]||d[h]||u[h]||s;return r?t.createElement(f,o(o({ref:n},p),{},{components:r})):t.createElement(f,o({ref:n},p))}));p.displayName="MDXCreateElement"}}]);