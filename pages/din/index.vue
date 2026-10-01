<template>
  <div class="mx-auto flex w-full max-w-[1800px] flex-col gap-6 pt-2 xl:pt-8">
    <header class="flex flex-col gap-4">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="max-w-3xl">
          <h1 class="font-headings text-xl font-medium leading-tight xl:text-5xl">DIN rail mount generator</h1>
          <p class="mt-3 text-sm leading-relaxed text-white/50">
            3D-printable adapters for <strong class="font-medium text-white/80">35&nbsp;mm top-hat DIN rails</strong>, exported as millimetre STL.
          </p>
        </div>

        <BaseTag v-if="model" class="text-xs">
          {{ printable.length }} {{ printable.length === 1 ? 'file' : 'files' }} &middot; {{ model.parameters.width }} &times; {{ model.parameters.height }} mm plate
        </BaseTag>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <span class="text-[11px] uppercase tracking-wider text-white/35">Start from</span>

        <button
          v-for="preset in PRESET_LIST"
          :key="preset.id"
          type="button"
          :aria-pressed="activePreset === preset.id"
          class="rounded-full border px-4 py-1.5 text-xs transition-colors duration-200"
          :class="activePreset === preset.id ? 'border-primary bg-primary/10 text-white' : 'border-dark-lighter bg-dark-light text-white/70 hover:border-primary hover:text-white'"
          @click="applyPreset(preset.id)"
        >
          {{ preset.label }}
        </button>
      </div>
    </header>

    <div class="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-5">
      <div class="order-2 flex w-full min-w-0 flex-col gap-3 xl:order-1 xl:w-80 xl:shrink-0">
        <DinGroup v-for="group in basicGroups" :key="group.id" :title="group.title" :note="group.note" :open="group.open">
          <DinFieldRow v-for="row in group.rows" :key="row.field.key" v-model="params[row.field.key]" :field="row.field" :min="row.min" :max="row.max" :error="row.error" />

          <div v-if="group.id === 'plate'" class="flex flex-col gap-1.5">
            <button type="button" :class="smallButton" :disabled="!isValid" @click="minimiseWidth">Minimise plate width</button>
            <p class="text-[11px] leading-snug text-white/35">Narrowest width the clips, holes and rail fit still allow.</p>
          </div>

          <DinHoleTable
            v-if="group.id === 'holes' && params.pattern === 'custom'"
            v-model="params.holes"
            :default-diameter="params.holeDiameter"
            :default-standoff="params.standoffHeight"
            :standoff-wall="params.standoffWall"
            :error-rows="holeErrorRows"
          />
        </DinGroup>

        <button
          type="button"
          class="flex items-center justify-between gap-3 rounded border border-dark-lighter bg-dark-light/30 px-4 py-3 text-left transition-colors duration-200 hover:border-primary"
          :aria-expanded="showAdvanced"
          @click="showAdvanced = !showAdvanced"
        >
          <span>
            <span class="font-headings text-sm text-white">{{ showAdvanced ? 'Hide' : 'Show' }} advanced options</span>
            <span class="mt-0.5 block text-[11px] text-white/35">Rail fit tolerances, clip geometry, clamp hardware, mesh quality</span>
          </span>

          <svg
            class="h-3.5 w-3.5 shrink-0 text-white/40 transition-transform duration-200"
            :class="showAdvanced && 'rotate-180'"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <DinGroup v-for="group in advancedGroups" v-show="showAdvanced" :key="group.id" :title="group.title" :note="group.note" open>
          <DinFieldRow v-for="row in group.rows" :key="row.field.key" v-model="params[row.field.key]" :field="row.field" :min="row.min" :max="row.max" :error="row.error" />
        </DinGroup>

        <DinGroup title="Design file" note="reproducible JSON">
          <div class="flex flex-col gap-1.5">
            <span class="text-xs text-white/70">Design name (used in file names)</span>
            <input
              v-model="designName"
              type="text"
              aria-label="Design name"
              class="w-full rounded border border-dark-lighter bg-dark px-3 py-2 text-sm text-white transition-colors duration-200 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div class="flex flex-wrap gap-2">
            <button type="button" :class="smallButton" @click="downloadJson">Download parameters.json</button>

            <label :class="[smallButton, 'cursor-pointer']">
              Import parameters.json
              <input type="file" accept="application/json,.json" class="hidden" @change="importJson" />
            </label>
          </div>

          <p v-if="importError" class="text-[11px] leading-snug text-primary">Import failed: {{ importError }}</p>
          <p v-else class="text-[11px] leading-snug text-white/35">Imported JSON is validated before it is applied; never evaluated as code.</p>

          <details class="rounded border border-dark-lighter bg-dark/60">
            <summary class="cursor-pointer px-3 py-2 text-[11px] uppercase tracking-wider text-white/40 select-none">Current parameters (JSON)</summary>
            <pre class="max-h-72 overflow-auto px-3 pb-3 text-[11px] leading-snug text-white/60">{{ payloadJson }}</pre>
          </details>
        </DinGroup>
      </div>

      <div class="order-1 min-w-0 xl:order-2 xl:sticky xl:top-6 xl:flex-1 xl:self-start">
        <div class="h-[50vh] min-h-[20rem] xl:h-[calc(100vh-3rem)]">
          <ClientOnly>
            <DinViewer v-model:show-rail="showRail" :model="model" :busy="busy" :invalid="!isValid" :status="viewerStatus" />

            <template #fallback>
              <div
                class="flex h-full w-full items-center justify-center rounded border border-dark-lighter px-6 text-center text-xs text-white/40"
                style="background-color: #0b0b0c"
              >
                Loading the 3D preview&hellip;
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>

      <div class="order-3 flex w-full min-w-0 flex-col gap-4 xl:w-80 xl:shrink-0">
        <div v-if="!isValid" class="rounded border border-primary bg-primary/5 p-4">
          <p class="font-headings text-sm text-primary">This configuration cannot be generated</p>
          <ul class="mt-2 flex list-inside list-disc flex-col gap-1 text-[11px] leading-snug text-white/70">
            <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
          </ul>
          <p class="mt-3 text-[11px] text-white/40">Last valid preview stays; exports stay disabled.</p>
        </div>

        <div class="flex flex-col gap-3 rounded border border-dark-lighter bg-dark-light/30 p-4">
          <div class="flex items-baseline justify-between gap-2">
            <p class="font-headings text-sm text-white">Export STL</p>
            <span class="text-[11px] text-white/35">{{ printable.length }} separate part{{ printable.length === 1 ? '' : 's' }}</span>
          </div>

          <button type="button" :class="primaryButton" :disabled="!canExport" @click="downloadAll">Download all {{ printable.length }} parts</button>

          <div class="flex flex-wrap gap-2">
            <button v-for="part in printable" :key="part.name" type="button" :class="smallButton" :disabled="!canExport" @click="downloadPart(part)"> {{ part.name }}.stl </button>
          </div>

          <p class="text-[11px] leading-snug text-white/35">
            Separate STL per part, in the suggested print orientation, sitting on Z=0. Import as millimetres.
            <span v-if="params.retention === 'snap'"
              >Snap parts print with the flexure plane parallel to the bed, so the plate, leaves and shelf need supports, kept out of the moving clearances.</span
            >
            The grey rail is preview-only.
          </p>
        </div>

        <BaseCard title="Parts">
          <ul class="flex flex-col gap-2 text-xs text-white/70">
            <li v-for="part in modelParts" :key="part.name" class="flex flex-col gap-0.5 border-b border-dark-lighter pb-2 last:border-0 last:pb-0">
              <span class="font-medium text-white">{{ part.name }} &times;{{ part.quantity }}</span>
              <span class="text-[11px] text-white/40">{{ formatCount(part.triangles) }} triangles &middot; {{ formatNumber(part.volumeMm3) }} mm&sup3;</span>
            </li>
            <li v-if="!modelParts.length" class="text-white/40">Waiting for the first model&hellip;</li>
          </ul>
        </BaseCard>

        <BaseCard title="Hardware and dimensions">
          <template v-if="hardware">
            <ul class="flex flex-col gap-2 text-xs text-white/70">
              <li>
                <span v-if="hardware.clampScrews.count" class="font-medium text-white">{{ hardware.clampScrews.count }} &times;</span>
                {{ hardware.clampScrews.type }}
                <span v-if="hardware.clampScrews.lengthUnderHeadRange" class="block text-[11px] text-white/45">
                  {{ hardware.clampScrews.lengthUnderHeadRange[0] }}&ndash;{{ hardware.clampScrews.lengthUnderHeadRange[1] }} mm under head, no washer
                </span>
              </li>
              <li v-if="hardware.clampNuts.count"
                ><span class="font-medium text-white">{{ hardware.clampNuts.count }} &times;</span> {{ hardware.clampNuts.type }}</li
              >
              <li
                ><span class="font-medium text-white">{{ hardware.deviceScrews.count }} &times;</span> {{ hardware.deviceScrews.type }}</li
              >
            </ul>

            <dl v-if="dimensions" class="mt-3 flex flex-col gap-1 border-t border-dark-lighter pt-3 text-xs text-white/70">
              <div class="flex justify-between gap-3">
                <dt class="text-white/45">Flange pocket</dt>
                <dd>{{ dimensions.flangeGap.toFixed(2) }} mm</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-white/45">Clip centres along X</dt>
                <dd>{{ dimensions.clipCentersX.map((value) => value.toFixed(1)).join(', ') }} mm</dd>
              </div>
              <div v-if="overall" class="flex justify-between gap-3">
                <dt class="text-white/45">Overall envelope</dt>
                <dd>{{ overall.size.map((value) => value.toFixed(1)).join(' × ') }} mm</dd>
              </div>
              <div v-if="dimensions.lightening" class="flex flex-col gap-0.5">
                <dt class="text-white/45">Lightening</dt>
                <dd class="text-[11px]">{{ dimensions.lightening.slots }} slots &middot; {{ formatNumber(dimensions.lightening.removedMm3) }} mm&sup3; removed</dd>
              </div>
              <div class="flex flex-col gap-0.5">
                <dt class="text-white/45">Clamp screw centres (x, y)</dt>
                <dd class="text-[11px]">{{
                  dimensions.clampScrewCenters.length
                    ? dimensions.clampScrewCenters.map(([screwX, screwY]) => `(${screwX.toFixed(1)}, ${screwY.toFixed(1)})`).join(' ')
                    : 'none (snap clip)'
                }}</dd>
              </div>

              <template v-if="dimensions.snap">
                <div class="flex justify-between gap-3">
                  <dt class="text-white/45">Snap leaf, thickness / free length</dt>
                  <dd>{{ dimensions.snap.thickness }} / {{ dimensions.snap.length }} mm</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-white/45">Snap span along X</dt>
                  <dd>{{ dimensions.snap.span.toFixed(1) }} mm</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-white/45">Release travel / stop travel</dt>
                  <dd>{{ dimensions.snap.travel.toFixed(2) }} / {{ dimensions.snap.stopTravel.toFixed(2) }} mm</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-white/45">Strain, release / screened stop</dt>
                  <dd>{{ (dimensions.snap.strain * 100).toFixed(2) }} / {{ (dimensions.snap.screenedStrain * 100).toFixed(2) }} %</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-white/45">Release force estimate</dt>
                  <dd>{{ dimensions.snap.releaseForceEstimateN.map((value) => value.toFixed(2)).join(' to ') }} N</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-white/45">Rail room, per side</dt>
                  <dd>{{ dimensions.snap.pocketClearance.toFixed(2) }} mm</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-white/45">Depth behind plate / rail reference</dt>
                  <dd>{{ (-dimensions.snap.bearingBottom).toFixed(1) }} / {{ params.railHeight }} mm</dd>
                </div>
              </template>
            </dl>
          </template>

          <p v-else class="text-xs text-white/40">Waiting for the first model&hellip;</p>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from 'vue';
  import { LIMITS, PRESETS, SNAP_PRESETS, normalizeParameters, toSTL } from './core.mjs';

  useHead({
    title: 'DIN rail mount generator | Jakub Bednarski',
    meta: [
      {
        name: 'description',
        content: 'Parametric browser tool that generates 3D-printable mounts for 35 mm top-hat DIN rails and exports millimetre STL files. Runs entirely client-side.',
      },
    ],
  });

  const PRESET_LIST = [
    { id: 'pcb4', label: 'Four-hole PCB', file: 'pcb-mount' },
    { id: 'yline50', label: 'Snap clip · Y-line 50 mm', file: 'snap-mount', params: SNAP_PRESETS.yline50 },
    { id: 'psu2', label: 'Two-hole PSU (2 clips)', file: 'psu-mount' },
    { id: 'custom', label: 'Custom holes', file: 'custom-mount' },
    { id: 'fitCoupon', label: 'Rail fit coupon', file: 'rail-fit-coupon' },
  ];

  const presetInput = (preset) => PRESETS[preset.id] ?? { ...PRESETS.pcb4, ...preset.params };

  const RETENTION_OPTIONS = [
    { value: 'screw', label: 'Screw-retained bar' },
    { value: 'snap', label: 'Snap clip (no screws)' },
  ];

  const PATTERN_OPTIONS = [
    { value: 'rectangle', label: 'Rectangle (4 holes)' },
    { value: 'line-x', label: 'Line along X (2 holes)' },
    { value: 'line-y', label: 'Line along Y (2 holes)' },
    { value: 'custom', label: 'Custom holes / slots' },
  ];

  const RAIL_HEIGHT_OPTIONS = [
    { value: 7.5, label: '7.5 mm reference (NS 35/7.5)' },
    { value: 15, label: '15 mm reference (NS 35/15)' },
  ];

  const CLIP_COUNT_OPTIONS = [
    { value: 1, label: 'One clip station' },
    { value: 2, label: 'Two clip stations' },
  ];

  const LIGHTENING_OPTIONS = [
    { value: false, label: 'Solid plate' },
    { value: true, label: 'Lightened (rounded slots)' },
  ];

  const BASIC_GROUPS = [
    {
      id: 'mount',
      title: 'Mount style',
      note: 'how it grips the rail',
      open: true,
      fields: [
        {
          key: 'retention',
          label: 'Retention',
          options: RETENTION_OPTIONS,
          hint: 'Screw bar: clamped by two M3 screws, takes up fit play. Snap clip: an integral spring with a 45° insertion ramp and a release tab, strain-screened at design time, but still needing a print test.',
        },
      ],
    },
    {
      id: 'plate',
      title: 'Plate',
      note: 'mm',
      open: true,
      fields: [
        { key: 'width', label: 'Width along rail (X)', step: 1, slider: true },
        { key: 'height', label: 'Height across rail (Y)', step: 1, slider: true },
        { key: 'plateThickness', label: 'Thickness', step: 0.5, hint: 'Carries the clamp screws.' },
        { key: 'lightening', label: 'Plate body', options: LIGHTENING_OPTIONS },
        { key: 'cornerRadius', label: 'Corner radius', step: 0.5, advanced: true },
        { key: 'slotWidth', label: 'Lightening slot width', step: 0.5, slider: true, advanced: true, when: (parameters) => parameters.lightening },
        {
          key: 'ribWidth',
          label: 'Lightening rib width',
          step: 0.1,
          slider: true,
          advanced: true,
          when: (parameters) => parameters.lightening,
          hint: 'Material kept between slots and to the plate edge.',
        },
      ],
    },
    {
      id: 'holes',
      title: 'Mounting holes',
      note: 'plain clearance bores',
      open: true,
      fields: [
        { key: 'pattern', label: 'Hole pattern', options: PATTERN_OPTIONS },
        {
          key: 'pitchX',
          label: 'Spacing X (centre to centre)',
          step: 0.5,
          slider: true,
          when: (parameters) => parameters.pattern === 'rectangle' || parameters.pattern === 'line-x',
        },
        {
          key: 'pitchY',
          label: 'Spacing Y (centre to centre)',
          step: 0.5,
          slider: true,
          when: (parameters) => parameters.pattern === 'rectangle' || parameters.pattern === 'line-y',
        },
        {
          key: 'holeDiameter',
          label: 'Hole diameter',
          step: 0.1,
          slider: true,
          when: (parameters) => parameters.pattern !== 'custom',
          hint: 'Modelled size. 3.4 mm takes an M3 screw.',
        },
        { key: 'standoffHeight', label: 'Standoff height above plate', step: 0.5, slider: true, hint: '0 prints a flat plate.' },
        { key: 'standoffWall', label: 'Standoff wall (radial material)', step: 0.1, advanced: true },
      ],
    },
  ];

  const ADVANCED_GROUPS = [
    {
      id: 'rail',
      title: 'Rail fit',
      note: 'measure your rail',
      fields: [
        { key: 'railWidth', label: 'Measured rail width', step: 0.05, hint: 'Measure with calipers.' },
        { key: 'railHeight', label: 'Rail reference depth', options: RAIL_HEIGHT_OPTIONS },
        { key: 'flangeThickness', label: 'Rail flange thickness', step: 0.05 },
        {
          key: 'fitClearance',
          label: 'Fit clearance',
          step: 0.05,
          slider: true,
          hint: 'Per rail side, and the total added flange-gap height. Raise it if a printed part has to be forced onto a real rail; the depth row below and the error list show what else it then needs.',
        },
        { key: 'hookOverlap', label: 'Hook overlap', step: 0.1, hint: 'Capture inward from each nominal rail edge.' },
        { key: 'hookDepth', label: 'Hook / bar depth', step: 0.5, hint: 'Rearward depth below the plate underside.' },
      ],
    },
    {
      id: 'clips',
      title: 'Clips and clamp hardware',
      note: 'by retention style',
      fields: [
        { key: 'clipCount', label: 'Clip stations', options: CLIP_COUNT_OPTIONS },
        { key: 'clipWidth', label: 'Clip station width (along rail)', step: 1, slider: true },
        {
          key: 'clipSpacing',
          label: 'Clip centre spacing (along rail)',
          step: 1,
          slider: true,
          when: (parameters) => parameters.clipCount === 2,
          bounds: (parameters, snapGeometry) => {
            const minimum = snapGeometry
              ? Math.max(LIMITS.clipSpacing[0], Math.ceil(snapGeometry.wallEnd - snapGeometry.rootStart + 3))
              : Math.max(LIMITS.clipSpacing[0], parameters.clipWidth + 4);
            const maximum = snapGeometry ? Math.max(minimum, parameters.width - 2 * snapGeometry.wallEnd - 2) : Math.max(minimum, parameters.width - parameters.clipWidth - 4);
            return { min: minimum, max: maximum };
          },
          hint: 'From the tightest legal station clearance to the widest that still fits inside the plate.',
        },
        {
          key: 'snapBladeThickness',
          label: 'Snap leaf thickness (Y)',
          step: 0.05,
          when: (parameters) => parameters.retention === 'snap',
          hint: '0.8–1.6 mm. Thickness of each paired leaf in the bending direction.',
        },
        {
          key: 'snapFreeLength',
          label: 'Snap leaf free length (X)',
          step: 1,
          when: (parameters) => parameters.retention === 'snap',
          hint: '24–40 mm of straight leaf between the end fillets. Longer is softer.',
        },
        {
          key: 'snapClearance',
          label: 'Snap shelf clearance',
          step: 0.05,
          slider: true,
          when: (parameters) => parameters.retention === 'snap',
          hint: '0.3–0.6 mm gap below the jaw, and the extra outward travel before the stop. Above roughly 0.5 mm the shelf needs a 15 mm rail reference.',
        },
        { key: 'clampHoleDiameter', label: 'Clamp screw bore', step: 0.05, when: (parameters) => parameters.retention === 'screw' },
        { key: 'nutAcrossFlats', label: 'Nut across flats', step: 0.05, when: (parameters) => parameters.retention === 'screw', hint: 'Hex pocket fit.' },
        { key: 'nutDepth', label: 'Nut depth (thickness)', step: 0.05, when: (parameters) => parameters.retention === 'screw' },
      ],
    },
    {
      id: 'mesh',
      title: 'Mesh quality',
      note: 'export tessellation',
      fields: [{ key: 'segments', label: 'Cylinder facets', unit: 'count', step: 1, hint: 'Integer. 64 facets ≈ 0.004 mm undersize on a 3.4 mm bore.' }],
    },
  ];

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const params = reactive(clone(PRESETS.pcb4));
  const designName = ref(PRESET_LIST[0].file);
  const showRail = ref(false);
  const showAdvanced = ref(false);
  const importError = ref('');
  const workerErrors = ref([]);
  const engineFailed = ref('');
  const busy = ref(false);
  const model = shallowRef(null);

  // JSON round-trip: reading the reactive proxy walks nested objects, so any edit recomputes.
  const snapshot = computed(() => JSON.parse(JSON.stringify(params)));

  // Fully resolved, plain parameter set shared by validation, export and preset matching.
  const canonical = (normalized) => ({
    ...normalized.parameters,
    holes: normalized.holes.map((hole) => ({ ...hole })),
  });

  const validation = computed(() => {
    try {
      return { ok: true, errors: [], payload: canonical(normalizeParameters(snapshot.value)) };
    } catch (error) {
      const errors = Array.isArray(error?.errors) ? error.errors : [error?.message ?? 'Invalid parameters.'];
      return { ok: false, errors, payload: null };
    }
  });

  const PRESET_JSON = Object.fromEntries(PRESET_LIST.map((preset) => [preset.id, JSON.stringify(canonical(normalizeParameters(presetInput(preset))))]));

  const activePreset = computed(() => {
    if (!validation.value.payload) return '';
    const json = JSON.stringify(validation.value.payload);
    return PRESET_LIST.find((preset) => PRESET_JSON[preset.id] === json)?.id ?? '';
  });

  const errors = computed(() => (validation.value.ok ? workerErrors.value : validation.value.errors));
  const isValid = computed(() => validation.value.ok && workerErrors.value.length === 0);
  const canExport = computed(() => isValid.value && Boolean(model.value));
  const payloadJson = computed(() => (validation.value.payload ? JSON.stringify(validation.value.payload, null, 2) : ''));

  const printable = computed(() => model.value?.printParts ?? []);
  const modelParts = computed(() => model.value?.parts ?? []);
  const hardware = computed(() => model.value?.hardware ?? null);
  const dimensions = computed(() => model.value?.dimensions ?? null);

  const overall = computed(() => {
    const parts = model.value?.parts ?? [];
    if (!parts.length) return null;

    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (const part of parts) {
      if (!part.bounds) continue;
      for (let axis = 0; axis < 3; axis += 1) {
        min[axis] = Math.min(min[axis], part.bounds.min[axis]);
        max[axis] = Math.max(max[axis], part.bounds.max[axis]);
      }
    }
    return min.every(Number.isFinite) ? { size: max.map((value, axis) => value - min[axis]) } : null;
  });

  const fieldError = (key) => errors.value.find((error) => typeof error === 'string' && error.startsWith(`${key}:`)) ?? '';

  const snapGeometry = computed(() => model.value?.dimensions?.snap ?? null);

  const groupNote = (group) => (group.id === 'holes' && params.pattern === 'custom' ? `${params.holes.length} of 32 holes` : group.note);

  // Static LIMITS cover most fields; a field `bounds` derives its range from the current layout.
  const fieldBounds = (field) => (field.bounds ? field.bounds(params, snapGeometry.value) : { min: LIMITS[field.key]?.[0], max: LIMITS[field.key]?.[1] });

  // Rows are resolved once per change, so the template only reads plain data.
  const renderGroups = (groups) =>
    groups.map((group) => ({
      ...group,
      note: groupNote(group),
      rows: group.fields
        .filter((field) => showAdvanced.value || !field.advanced)
        .filter((field) => !field.when || field.when(params))
        .map((field) => ({ field, ...fieldBounds(field), error: fieldError(field.key) })),
    }));

  const basicGroups = computed(() => renderGroups(BASIC_GROUPS));
  const advancedGroups = computed(() => renderGroups(ADVANCED_GROUPS));

  const viewerStatus = computed(() => {
    if (engineFailed.value) return engineFailed.value;
    if (model.value) return '';
    return busy.value ? 'Generating the first preview…' : 'Starting the geometry engine…';
  });

  const holeErrorRows = computed(() =>
    errors.value
      .map((error) => (/^Hole (\d+):/.exec(error ?? '') ?? [])[1])
      .map(Number)
      .filter((row) => Number.isInteger(row) && row > 0),
  );

  let worker = null;
  let requestTimer = 0;
  let requestId = 0;
  let latestRequested = 0;

  function requestGeneration(payload) {
    if (!worker) return;
    requestId += 1;
    latestRequested = requestId;
    busy.value = true;

    try {
      worker.postMessage({ id: requestId, action: 'generate', parameters: clone(payload) });
    } catch (error) {
      busy.value = false;
      workerErrors.value = [error?.message ?? 'Could not send parameters to the geometry worker.'];
    }
  }

  function scheduleGeneration(payload) {
    window.clearTimeout(requestTimer);
    requestTimer = window.setTimeout(() => requestGeneration(payload), 250);
  }

  function handleMessage(event) {
    const data = event.data ?? {};
    // Only the newest request may update the preview.
    if (typeof data.id !== 'number' || data.id < latestRequested) return;

    busy.value = false;

    if (!data.ok) {
      workerErrors.value = data.errors?.length ? data.errors : [data.error ?? 'Geometry generation failed.'];
      return;
    }

    latestRequested = data.id;
    workerErrors.value = [];
    engineFailed.value = '';
    model.value = data.model;
  }

  onMounted(() => {
    try {
      worker = new Worker(new URL('./worker.mjs', import.meta.url), { type: 'module' });
      worker.addEventListener('message', handleMessage);
      worker.addEventListener('error', (event) => {
        busy.value = false;
        engineFailed.value = event.message ? `Geometry worker error: ${event.message}` : 'The geometry worker failed to start.';
        workerErrors.value = [engineFailed.value];
      });
    } catch (error) {
      engineFailed.value = error?.message ?? 'Web Workers are not available in this browser.';
      workerErrors.value = [engineFailed.value];
      return;
    }

    if (validation.value.payload) requestGeneration(validation.value.payload);
  });

  onBeforeUnmount(() => {
    window.clearTimeout(requestTimer);
    worker?.terminate();
    worker = null;
  });

  watch(validation, (current) => {
    if (!worker) return;

    if (!current.ok) {
      // Stop any queued regeneration but keep the last valid preview on screen.
      window.clearTimeout(requestTimer);
      busy.value = false;
      return;
    }

    scheduleGeneration(current.payload);
  });

  function minimiseWidth() {
    const probe = { ...snapshot.value };
    for (let width = LIMITS.width[0]; width < params.width; width += 1) {
      probe.width = width;
      try {
        normalizeParameters(probe);
        params.width = width;
        return;
      } catch {
        // Widen by one millimetre and ask the engine again.
      }
    }
  }

  function applyParameters(values) {
    for (const key of Object.keys(params)) if (!(key in values)) delete params[key];
    Object.assign(params, clone(values));
  }

  function applyPreset(id) {
    const preset = PRESET_LIST.find((entry) => entry.id === id);
    if (!preset) return;
    importError.value = '';
    applyParameters(canonical(normalizeParameters(presetInput(preset))));
    designName.value = preset.file;
  }

  async function importJson(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    importError.value = '';

    try {
      // Parsed as data only - imported text is never evaluated as JavaScript.
      applyParameters(canonical(normalizeParameters(JSON.parse(await file.text()))));
    } catch (error) {
      importError.value = Array.isArray(error?.errors) ? error.errors.join(' ') : (error?.message ?? 'Unreadable JSON.');
    }
  }

  const slug = () =>
    designName.value
      .trim()
      .replace(/[^a-z0-9-_]+/gi, '-')
      .replace(/^-+|-+$/g, '') || 'din-mount';

  function saveBytes(bytes, filename, mime) {
    const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function downloadPart(part) {
    if (!canExport.value) return;
    saveBytes(toSTL(part.mesh, `${slug()} ${part.name}; units mm; suggested print orientation`), `${slug()}-${part.name}.stl`, 'model/stl');
  }

  function downloadAll() {
    if (!canExport.value) return;
    printable.value.forEach((part, index) => window.setTimeout(() => downloadPart(part), index * 350));
  }

  function downloadJson() {
    if (!validation.value.payload) return;
    saveBytes(new TextEncoder().encode(`${JSON.stringify(validation.value.payload, null, 2)}\n`), `${slug()}-parameters.json`, 'application/json');
  }

  const formatNumber = (value) => Number(value ?? 0).toLocaleString('en-US', { maximumFractionDigits: 1 });
  const formatCount = (value) => Number(value ?? 0).toLocaleString('en-US');

  const smallButton =
    'rounded border border-dark-lighter bg-dark-light px-3 py-1.5 text-xs text-white/80 transition-colors duration-200 hover:border-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40';
  const primaryButton =
    'rounded border border-primary bg-primary/15 px-4 py-2 text-xs font-medium text-white transition-colors duration-200 hover:bg-primary/25 disabled:cursor-not-allowed disabled:opacity-40';
</script>
