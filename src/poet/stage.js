/* The renderer for "Save the Poet": one scene at a time, a soft bloom, and a
   final pass for the film look (vignette, grain, warmth, fades, and the gold
   wash of the visions in Act IV). Everything eases toward its target. */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

const host = document.getElementById('view');
export const LOW = window.matchMedia('(max-width: 760px)').matches ||
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || /[?&]low=1/.test(location.search);
export const CALM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: !LOW, powerPreference: 'high-performance' });
} catch (e) {
  host.innerHTML = '<p class="err">This scene needs WebGL, which this browser is not providing. ' +
    'Open save-the-poet-text.html instead: it is the same trial without the 3D.</p>';
  throw e;
}
const BOARD = document.documentElement.classList.contains('board');
renderer.setPixelRatio(Math.min(window.devicePixelRatio, LOW ? 1.5 : 2, BOARD ? 1920 / Math.max(window.innerWidth, 1) : 9));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = !LOW;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
host.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
const blank = { scene: new THREE.Scene(), camera: new THREE.PerspectiveCamera() };
const renderPass = new RenderPass(blank.scene, blank.camera);
composer.addPass(renderPass);
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.3, 0.55, 0.85);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const film = new ShaderPass({
  uniforms: {
    tDiffuse: { value: null }, time: { value: 0 }, vig: { value: 0.32 }, grain: { value: 0.025 },
    fade: { value: 1 }, gold: { value: 0 }, dim: { value: 0 }, warm: { value: 0.06 },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float time, vig, grain, fade, gold, dim, warm; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(c, c * vec3(1.06, 1.0, 0.9), warm);
      /* the visions: the world goes to warm sepia and the highlights to gold */
      vec3 sep = vec3(l) * vec3(1.12, 0.95, 0.7);
      c = mix(c, sep, gold * 0.55);
      c += vec3(1.0, 0.75, 0.3) * smoothstep(0.55, 1.0, l) * gold * 0.25;
      /* a darkened room: the verdict, a condemnation */
      c = mix(c, vec3(l) * vec3(0.8, 0.82, 0.9), dim * 0.6) * (1.0 - dim * 0.35);
      vec2 q = vUv - 0.5;
      c *= 1.0 - vig * smoothstep(0.25, 0.85, length(q * vec2(1.15, 1.0)));
      c += (hash(gl_FragCoord.xy + fract(time) * 91.0) - 0.5) * grain;
      c *= 1.0 - fade;
      gl_FragColor = vec4(c, 1.0);
    }`,
});
composer.addPass(film);

const post = { fade: 1, gold: 0, dim: 0, bloom: 0.3, vig: 0.32, exposure: 0.92 };
const goal = Object.assign({}, post);
const speed = { fade: 0.8, gold: 0.5, dim: 0.5, bloom: 0.6, vig: 0.6, exposure: 0.5 };
export function setPost(k, v, perSec) { goal[k] = v; if (perSec) speed[k] = perSec; }
export function snapPost(k, v) { goal[k] = post[k] = v; }

export const look = { x: 0, y: 0, sx: 0, sy: 0, amount: 1 };
export function setLook(nx, ny) { look.x = Math.max(-1, Math.min(1, nx)); look.y = Math.max(-1, Math.min(1, ny)); }

let cur = blank;
export function show(s) { cur = s || blank; renderPass.scene = cur.scene; renderPass.camera = cur.camera; resize(); }
export const current = () => cur;
function resize() {
  const w = host.clientWidth || window.innerWidth, h = host.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  if (cur.camera.isPerspectiveCamera) { cur.camera.aspect = w / h; cur.camera.updateProjectionMatrix(); }
  if (cur.resize) cur.resize(w, h);
}
window.addEventListener('resize', resize);
resize();

/* window.__freeze / __advance step time by hand for the headless harness */
const clock = new THREE.Clock();
let time = 0;
window.__frames = 0;
const hooks = [];
export function onFrame(fn) { hooks.push(fn); }
function tick() {
  requestAnimationFrame(tick);
  let dt = Math.min(clock.getDelta(), 0.1);
  if (window.__freeze) { dt = Math.min(0.1, window.__advance || 0); window.__advance = (window.__advance || 0) - dt; }
  time += dt;
  for (const k in post) {
    const d = goal[k] - post[k], st = speed[k] * dt;
    post[k] = Math.abs(d) <= st ? goal[k] : post[k] + Math.sign(d) * st;
  }
  look.sx += (look.x * look.amount - look.sx) * Math.min(1, dt * 2.5);
  look.sy += (look.y * look.amount - look.sy) * Math.min(1, dt * 2.5);
  for (const fn of hooks) fn(dt, time);
  if (cur.update) cur.update(dt, time);
  const u = film.uniforms;
  u.time.value = time; u.fade.value = post.fade; u.gold.value = post.gold; u.dim.value = post.dim; u.vig.value = post.vig;
  u.grain.value = LOW ? 0 : 0.022;
  bloom.strength = post.bloom;
  renderer.toneMappingExposure = post.exposure;
  composer.render();
  window.__frames++;
}
requestAnimationFrame(tick);
export const now = () => time;
