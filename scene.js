import {phase} from './narrative.js';
export function scene({stage=0,index=0,count=3,damage=0,live=false,victory=false}={}) {
  const p=phase(index,count);return `<div class="scene ${live?'live':'camp'} ${victory?'victory':''}" data-scene="${live?p.scene:'camp'}" data-world="${stage}" style="--damage:${damage}">
  <img class="camp-art" src="./assets/${live?'northern-wall.webp':'ember-camp.webp'}" alt="">
  <svg class="world-svg" viewBox="0 0 900 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#081816"/><stop offset=".65" stop-color="#263a32"/><stop offset="1" stop-color="#b46632"/></linearGradient><radialGradient id="glow"><stop stop-color="#e4a25b" stop-opacity=".6"/><stop offset="1" stop-color="#f3803200"/></radialGradient><linearGradient id="stone" x2="0" y2="1"><stop stop-color="#596457"/><stop offset="1" stop-color="#182822"/></linearGradient><filter id="fogblur"><feGaussianBlur stdDeviation="24"/></filter></defs>
  <rect width="900" height="1000" fill="url(#sky)"/><circle cx="650" cy="155" r="58" fill="#c9c79a" opacity=".3"/><circle cx="480" cy="570" r="390" fill="url(#glow)"/>
  <path class="far-layer" d="M-50 330L100 200 210 340 390 150 570 330 680 180 970 370V1000H-50" fill="#0e211e"/>
  <path d="M-50 560L60 440 180 520 300 420 450 570 650 420 910 540V1000H-50" fill="#182a24"/>
  <g class="fortress" transform="translate(0 50)"><path d="M100 540V380H145V345H180V380H225V345H260V380H290V540M610 540V380H650V345H685V380H720V345H755V380H790V540" fill="url(#stone)" stroke="#74806a" stroke-width="2"/>
  <path d="M245 560V300H270V275H300V300H345V275H375V300H415V560M485 560V300H525V275H555V300H600V275H630V300H655V560" fill="url(#stone)" stroke="#7c866c" stroke-width="2"/>
  <path d="M330 540V425H570V540M385 330V240H410V205H445V240H485V205H515V240H535V330" fill="#465347" stroke="#76816c"/>
  <path d="M410 560V450Q450 395 490 450V560" fill="#151e17" stroke="#81745a" stroke-width="6"/>
  <g class="gate"><path d="M415 555V455Q450 408 485 455V555Z" fill="#3d3529"/><path d="M450 422V555M417 475H483M417 515H483" stroke="#a39066" stroke-width="3"/></g>
  <path class="cracks" d="M449 428L437 460 461 483 445 504 474 538M380 432L355 455 378 478 365 502M548 413L525 446 540 465" stroke="#ffc775" stroke-width="3" fill="none"/>
  <g class="flag" style="--delay:-2s"><path d="M300 275V184" stroke="#9e9478" stroke-width="3"/><path d="M302 184Q330 178 348 192L345 228Q322 215 302 221" fill="#a08950"/><path d="M314 196L331 209 315 216" stroke="#d8c193" fill="none"/></g>
  <g class="flag" style="--delay:-.4s"><path d="M600 275V175" stroke="#9e9478" stroke-width="3"/><path d="M602 175Q630 171 649 187L645 215Q620 207 602 211" fill="#71633f"/></g>
  ${[250,385,520,645].map((x,i)=>`<g class="torch" style="--delay:-${i*.4}s"><path d="M${x} 468v30" stroke="#6c5d44" stroke-width="5"/><path d="M${x-8} 466q-5-12 8-25q12 16 5 25z" fill="#edbb61"/><ellipse cx="${x}" cy="466" rx="34" ry="48" fill="url(#glow)"/></g>`).join('')}</g>
  <path d="M-50 720Q140 595 325 650L412 577H490L560 650Q750 590 950 720V1000H-50" fill="#12231e"/><path d="M350 1000L411 637 450 602 490 637 570 1000" fill="#665542" opacity=".38"/>
  <g class="units">${Array.from({length:12},(_,i)=>{const x=230+(i%6)*70,y=690+Math.floor(i/6)*105;return `<g class="soldier" style="--delay:-${i*.63}s;--march:${i%2?12:-12}px" transform="translate(${x} ${y})"><circle cy="-22" r="9" fill="#a2936b"/><path d="M-8-12H8L14 15H-14Z" fill="#75826a"/><path d="M-5 14L-11 35M5 14L11 35M12-9L26-38" stroke="#a4a28a" stroke-width="5"/><path d="M-22-8L-7-8V15L-16 24-24 12Z" fill="#3b5042" stroke="#b2a06b" stroke-width="2"/></g>`;}).join('')}</g>
  <g class="projectile"><path d="M190 830L530 350" stroke="#ffdc82" stroke-width="4"/><circle cx="530" cy="350" r="7" fill="#fbe4a4"/></g>
  <g class="debris">${Array.from({length:9},(_,i)=>`<rect x="${415+i*8}" y="${450+(i%3)*28}" width="${5+i%4}" height="8" fill="#a48b5c" style="--dx:${(i-4)*40}px;--dy:${100+i*15}px;--delay:${i*.03}s"/>`).join('')}</g>
  <g class="settlement"><path d="M90 720V670L145 625 200 670V720Z" fill="#435244"/><path d="M620 760V680L690 630 760 680V760Z" fill="#435244"/><path d="M0 795H900V845H0" fill="#334538"/><path d="M0 790H900" stroke="#a58d57" stroke-width="6"/></g>
  <g class="fog" filter="url(#fogblur)"><ellipse cx="150" cy="670" rx="270" ry="48" fill="#c3cdab" opacity=".13"/><ellipse cx="720" cy="420" rx="220" ry="25" fill="#bdc5ac" opacity=".13"/></g>
  <g class="smoke" filter="url(#fogblur)"><ellipse cx="510" cy="400" rx="65" ry="135" fill="#171d17" opacity=".7"/></g>
  </svg>
  <div class="embers" aria-hidden="true">${Array.from({length:16},(_,i)=>`<i style="--x:${(i*37)%100}%;--delay:-${i*.61}s;--speed:${6+i%5}s"></i>`).join('')}</div><div class="scene-vignette"></div><div class="impact-flash" aria-hidden="true"></div></div>`;
}
