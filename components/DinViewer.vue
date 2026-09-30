<template>
  <div
    ref="host"
    class="relative h-full w-full overflow-hidden rounded border transition-colors duration-200"
    :class="invalid ? 'border-primary' : 'border-dark-lighter'"
    style="background-color: #0b0b0c"
  >
    <canvas ref="canvasRef" class="block h-full w-full" />

    <div v-if="!failed" class="absolute top-3 left-3 flex flex-wrap items-center gap-2">
      <button type="button" :class="toolButton" :aria-pressed="showRail" @click="$emit('update:showRail', !showRail)">
        {{ showRail ? 'Hide rail' : 'Show rail' }}
      </button>

      <button type="button" :class="toolButton" :aria-pressed="spin" @click="toggleSpin">
        {{ spin ? 'Stop spin' : 'Spin' }}
      </button>

      <button type="button" :class="toolButton" @click="frame">Reset view</button>
    </div>

    <div v-if="invalid" class="absolute top-3 right-3 rounded-full border border-primary bg-dark/90 px-3 py-1 text-[11px] text-primary"> Invalid configuration </div>

    <div v-else-if="busy" class="absolute top-3 right-3 rounded-full border border-dark-lighter bg-dark/80 px-3 py-1 text-[11px] text-white/60"> Regenerating&hellip; </div>

    <div v-if="failed" class="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
      <p class="font-headings text-sm text-primary">3D preview unavailable</p>
      <p class="max-w-sm text-xs leading-snug text-white/50">{{ failed }}</p>
      <p class="max-w-sm text-xs leading-snug text-white/35"> Parameters, validation, warnings and STL download still work without WebGL. </p>
    </div>

    <div v-else-if="!model" class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
      <p class="font-headings text-sm text-white/70">{{ status }}</p>
      <p class="max-w-sm text-xs leading-snug text-white/35"> Runs in a Web Worker in your browser. Nothing is uploaded. </p>
    </div>

    <div class="pointer-events-none absolute bottom-3 left-3 flex flex-col gap-1 text-[10px] uppercase tracking-wider text-white/40">
      <span class="flex items-center gap-2"><i class="h-2 w-2 rounded-sm" style="background: #d3d6dd"></i>Adapter (preview)</span>
      <span v-if="hasBars" class="flex items-center gap-2"><i class="h-2 w-2 rounded-sm" style="background: #ff283f"></i>Retaining bars</span>
      <span v-else-if="model" class="flex items-center gap-2"><i class="h-2 w-2 rounded-sm" style="background: #ff283f"></i>Snap clips</span>
      <span v-if="showRail" class="flex items-center gap-2"><i class="h-2 w-2 rounded-sm" style="background: #7c8291"></i>Reference rail (never exported)</span>
      <span>Z up &middot; millimetres</span>
    </div>

    <p class="pointer-events-none absolute right-3 bottom-3 text-[10px] uppercase tracking-wider text-white/30">Drag to orbit &middot; scroll to zoom</p>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

  const props = defineProps({
    model: {
      type: Object,
      default: null,
    },
    showRail: {
      type: Boolean,
      default: false,
    },
    busy: {
      type: Boolean,
      default: false,
    },
    invalid: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: 'Waiting for the geometry engine…',
    },
  });

  defineEmits(['update:showRail']);

  const hasBars = computed(() => (props.model?.parts?.length ?? 0) > 1);

  const toolButton =
    'rounded border border-dark-lighter bg-dark/80 px-2.5 py-1 text-[11px] text-white/70 backdrop-blur transition-colors duration-200 hover:border-primary hover:text-white';

  const COLOR_MAIN = 0xd3d6dd;
  const COLOR_JAW = 0xff283f;
  const COLOR_RAIL = 0x7c8291;

  const host = ref(null);
  const canvasRef = ref(null);
  const spin = ref(false);
  const failed = ref('');

  let renderer = null;
  let scene = null;
  let camera = null;
  let controls = null;
  let partsGroup = null;
  let railGroup = null;
  let resizeObserver = null;
  let frameHandle = 0;
  let needsRender = true;
  let framed = false;

  const colorFor = (partName) => (partName === 'main' ? COLOR_MAIN : COLOR_JAW);

  function requestRender() {
    needsRender = true;
  }

  function buildMesh(part, color, options = {}) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(part.mesh.positions, 3));
    geometry.setIndex(new THREE.BufferAttribute(part.mesh.indices, 1));

    // Non-indexed + face normals keeps the machined look crisp on flat faces.
    const flatGeometry = geometry.toNonIndexed();
    geometry.dispose();
    flatGeometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color,
      metalness: options.metalness ?? 0.12,
      roughness: options.roughness ?? 0.62,
      flatShading: true,
      transparent: Boolean(options.transparent),
      opacity: options.opacity ?? 1,
    });

    return new THREE.Mesh(flatGeometry, material);
  }

  function clearGroup(group) {
    if (!group) return;
    for (const child of [...group.children]) {
      group.remove(child);
      child.geometry?.dispose();
      child.material?.dispose();
    }
  }

  function frameBox(bounds) {
    if (!bounds || bounds.isEmpty() || !camera) return;

    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const radius = Math.max(size.length() * 0.5, 15);
    const distance = (radius / Math.sin((camera.fov * Math.PI) / 180 / 2)) * 1.15;

    controls.target.copy(center);
    camera.position.copy(center).add(new THREE.Vector3(0.85, -1.15, 0.7).normalize().multiplyScalar(distance));
    camera.near = Math.max(distance / 500, 0.5);
    camera.far = distance * 10 + 1000;
    camera.updateProjectionMatrix();

    controls.minDistance = radius * 0.3;
    controls.maxDistance = radius * 14;
    controls.update();
    requestRender();
  }

  function rebuild() {
    if (!partsGroup || !railGroup) return;

    clearGroup(partsGroup);
    clearGroup(railGroup);

    const model = props.model;
    if (!model) {
      requestRender();
      return;
    }

    const bounds = new THREE.Box3();
    for (const part of model.parts ?? []) {
      const mesh = buildMesh(part, colorFor(part.name));
      partsGroup.add(mesh);
      bounds.expandByObject(mesh);
    }

    // The reference rail is preview-only and must never be exported.
    railGroup.visible = props.showRail;
    if (model.reference) {
      railGroup.add(buildMesh(model.reference, COLOR_RAIL, { metalness: 0.55, roughness: 0.42, transparent: true, opacity: 0.9 }));
    }

    // Frame once: regenerating must not drag the camera away from the view you set up.
    if (!framed && !bounds.isEmpty()) {
      frameBox(bounds);
      framed = true;
    }
  }

  function resize() {
    if (!renderer || !camera || !host.value) return;
    const width = Math.max(1, host.value.clientWidth);
    const height = Math.max(1, host.value.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    requestRender();
  }

  function toggleSpin() {
    spin.value = !spin.value;
    if (controls) controls.autoRotate = spin.value;
    requestRender();
  }

  function frame() {
    if (!partsGroup || !controls) return;
    const bounds = new THREE.Box3().setFromObject(partsGroup);
    frameBox(bounds);
  }

  function loop() {
    frameHandle = requestAnimationFrame(loop);
    if (!renderer || !controls) return;
    controls.update();
    if (needsRender) {
      renderer.render(scene, camera);
      needsRender = false;
    }
  }

  onMounted(() => {
    const hostEl = host.value;
    const canvasEl = canvasRef.value;

    // A client-only wrapper can mount this before its own template exists, so the refs may be null.
    if (!hostEl || !canvasEl) {
      failed.value = 'The viewer canvas was not ready when the preview initialised. Reload the page to retry.';
      return;
    }

    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, powerPreference: 'high-performance' });
    } catch (error) {
      failed.value = error?.message ?? 'WebGL is not available in this browser.';
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0b0c);

    camera = new THREE.PerspectiveCamera(38, 1, 1, 4000);
    camera.up.set(0, 0, 1);
    camera.position.set(120, -160, 110);

    controls = new OrbitControls(camera, canvasEl);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotateSpeed = 1.2;
    controls.addEventListener('change', requestRender);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x1b1b24, 1.15));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(80, -120, 170);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8ba6ff, 0.55);
    fillLight.position.set(-140, 90, -60);
    scene.add(fillLight);

    partsGroup = new THREE.Group();
    railGroup = new THREE.Group();
    railGroup.visible = props.showRail;
    scene.add(partsGroup, railGroup);

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(hostEl);

    resize();
    rebuild();
    loop();
  });

  onBeforeUnmount(() => {
    cancelAnimationFrame(frameHandle);
    resizeObserver?.disconnect();
    clearGroup(partsGroup);
    clearGroup(railGroup);
    controls?.dispose();
    renderer?.dispose();
    renderer = null;
  });

  watch(() => props.model, rebuild);
  watch(
    () => props.showRail,
    (value) => {
      if (railGroup) railGroup.visible = value;
      requestRender();
    },
  );
</script>
