import{W as p,C as o,a as s,b as d}from"./tab2.e57cc3d0.js";import"../server.mjs";import"vue";import"#internal/nitro";import"vue-router";import"./index.d4e758c0.js";class u extends p{async getPhoto(t){return new Promise(async(e,a)=>{if(t.webUseInput||t.source===o.Photos)this.fileInputExperience(t,e);else if(t.source===o.Prompt){let i=document.querySelector("pwa-action-sheet");i||(i=document.createElement("pwa-action-sheet"),document.body.appendChild(i)),i.header=t.promptLabelHeader||"Photo",i.cancelable=!1,i.options=[{title:t.promptLabelPhoto||"From Photos"},{title:t.promptLabelPicture||"Take Picture"}],i.addEventListener("onSelection",async n=>{n.detail===0?this.fileInputExperience(t,e):this.cameraExperience(t,e,a)})}else this.cameraExperience(t,e,a)})}async pickImages(t){return new Promise(async e=>{this.multipleFileInputExperience(e)})}async cameraExperience(t,e,a){if(customElements.get("pwa-camera-modal")){const i=document.createElement("pwa-camera-modal");i.facingMode=t.direction===s.Front?"user":"environment",document.body.appendChild(i);try{await i.componentOnReady(),i.addEventListener("onPhoto",async n=>{const r=n.detail;r===null?a(new d("User cancelled photos app")):r instanceof Error?a(r):e(await this._getCameraPhoto(r,t)),i.dismiss(),document.body.removeChild(i)}),i.present()}catch{this.fileInputExperience(t,e)}}else console.error("Unable to load PWA Element 'pwa-camera-modal'. See the docs: https://capacitorjs.com/docs/web/pwa-elements."),this.fileInputExperience(t,e)}fileInputExperience(t,e){let a=document.querySelector("#_capacitor-camera-input");const i=()=>{var n;(n=a.parentNode)===null||n===void 0||n.removeChild(a)};a||(a=document.createElement("input"),a.id="_capacitor-camera-input",a.type="file",a.hidden=!0,document.body.appendChild(a),a.addEventListener("change",n=>{const r=a.files[0];let c="jpeg";if(r.type==="image/png"?c="png":r.type==="image/gif"&&(c="gif"),t.resultType==="dataUrl"||t.resultType==="base64"){const l=new FileReader;l.addEventListener("load",()=>{if(t.resultType==="dataUrl")e({dataUrl:l.result,format:c});else if(t.resultType==="base64"){const m=l.result.split(",")[1];e({base64String:m,format:c})}i()}),l.readAsDataURL(r)}else e({webPath:URL.createObjectURL(r),format:c}),i()})),a.accept="image/*",a.capture=!0,t.source===o.Photos||t.source===o.Prompt?a.removeAttribute("capture"):t.direction===s.Front?a.capture="user":t.direction===s.Rear&&(a.capture="environment"),a.click()}multipleFileInputExperience(t){let e=document.querySelector("#_capacitor-camera-input-multiple");const a=()=>{var i;(i=e.parentNode)===null||i===void 0||i.removeChild(e)};e||(e=document.createElement("input"),e.id="_capacitor-camera-input-multiple",e.type="file",e.hidden=!0,e.multiple=!0,document.body.appendChild(e),e.addEventListener("change",i=>{const n=[];for(let r=0;r<e.files.length;r++){const c=e.files[r];let l="jpeg";c.type==="image/png"?l="png":c.type==="image/gif"&&(l="gif"),n.push({webPath:URL.createObjectURL(c),format:l})}t({photos:n}),a()})),e.accept="image/*",e.click()}_getCameraPhoto(t,e){return new Promise((a,i)=>{const n=new FileReader,r=t.type.split("/")[1];e.resultType==="uri"?a({webPath:URL.createObjectURL(t),format:r,saved:!1}):(n.readAsDataURL(t),n.onloadend=()=>{const c=n.result;e.resultType==="dataUrl"?a({dataUrl:c,format:r,saved:!1}):a({base64String:c.split(",")[1],format:r,saved:!1})},n.onerror=c=>{i(c)})})}async checkPermissions(){throw this.unavailable("Permissions API not available in this browser")}async requestPermissions(){throw this.unimplemented("Not implemented on web.")}async pickLimitedLibraryPhotos(){throw this.unavailable("Not implemented on web.")}async getLimitedLibraryPhotos(){throw this.unavailable("Not implemented on web.")}}const E=new u;export{E as Camera,u as CameraWeb};
//# sourceMappingURL=web.33ad370d.js.map
