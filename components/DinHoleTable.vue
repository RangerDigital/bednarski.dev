<template>
  <div class="flex flex-col gap-2">
    <p class="text-[11px] leading-snug text-white/35"> From the plate centre. Slot length is overall. Max 32 holes. </p>

    <div
      v-for="(hole, index) in modelValue"
      :key="index"
      class="flex flex-col gap-2.5 rounded border bg-dark/60 p-3"
      :class="rowError(index) ? 'border-primary' : 'border-dark-lighter'"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="text-[10px] uppercase tracking-wider text-white/40">Hole {{ index + 1 }}</span>
        <button
          type="button"
          :aria-label="`Remove hole ${index + 1}`"
          class="rounded border border-dark-lighter px-2 py-1 text-[10px] text-white/60 transition-colors duration-200 hover:border-primary hover:text-white"
          @click="removeHole(index)"
        >
          Remove
        </button>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <label class="flex flex-col gap-1">
          <span class="text-[10px] uppercase tracking-wider text-white/35">X mm</span>
          <input
            type="number"
            :aria-label="`Hole ${index + 1} X`"
            :value="hole.x ?? ''"
            class="w-full rounded border border-dark-lighter bg-dark px-2 py-1.5 text-xs text-white focus:border-primary focus:outline-none"
            @input="setField(index, 'x', $event.target.value)"
          />
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-[10px] uppercase tracking-wider text-white/35">Y mm</span>
          <input
            type="number"
            :aria-label="`Hole ${index + 1} Y`"
            :value="hole.y ?? ''"
            class="w-full rounded border border-dark-lighter bg-dark px-2 py-1.5 text-xs text-white focus:border-primary focus:outline-none"
            @input="setField(index, 'y', $event.target.value)"
          />
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-[10px] uppercase tracking-wider text-white/35">&Oslash; mm</span>
          <input
            type="number"
            min="2"
            max="8"
            step="0.1"
            :aria-label="`Hole ${index + 1} diameter`"
            :value="hole.diameter ?? defaultDiameter"
            class="w-full rounded border border-dark-lighter bg-dark px-2 py-1.5 text-xs text-white focus:border-primary focus:outline-none"
            @input="setField(index, 'diameter', $event.target.value)"
          />
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-[10px] uppercase tracking-wider text-white/35">Standoff mm</span>
          <input
            type="number"
            min="0"
            max="30"
            step="0.5"
            :aria-label="`Hole ${index + 1} standoff height`"
            :value="hole.standoffHeight ?? defaultStandoff"
            class="w-full rounded border border-dark-lighter bg-dark px-2 py-1.5 text-xs text-white focus:border-primary focus:outline-none"
            @input="setField(index, 'standoffHeight', $event.target.value)"
          />
        </label>
      </div>

      <div class="flex items-end gap-2 border-t border-dark-lighter pt-2.5">
        <label class="flex items-center gap-2 pb-1.5 text-[11px] text-white/60">
          <input
            type="checkbox"
            :aria-label="`Hole ${index + 1} is a slot`"
            :checked="isSlot(hole)"
            class="h-4 w-4 accent-primary"
            @change="setSlot(index, $event.target.checked)"
          />
          Slot
        </label>

        <template v-if="isSlot(hole)">
          <label class="flex flex-1 flex-col gap-1">
            <span class="text-[10px] uppercase tracking-wider text-white/35">Length mm</span>
            <input
              type="number"
              min="2"
              max="80"
              step="0.5"
              :aria-label="`Hole ${index + 1} slot length`"
              :value="hole.slotLength"
              class="w-full rounded border border-dark-lighter bg-dark px-2 py-1.5 text-xs text-white focus:border-primary focus:outline-none"
              @input="setField(index, 'slotLength', $event.target.value)"
            />
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-[10px] uppercase tracking-wider text-white/35">Axis</span>
            <select
              :aria-label="`Hole ${index + 1} slot axis`"
              :value="hole.slotAxis ?? 'x'"
              class="rounded border border-dark-lighter bg-dark px-2 py-1.5 text-xs text-white focus:border-primary focus:outline-none"
              @change="setAxis(index, $event.target.value)"
            >
              <option value="x">X</option>
              <option value="y">Y</option>
            </select>
          </label>
        </template>
      </div>
    </div>

    <p v-if="!modelValue.length" class="rounded border border-dashed border-dark-lighter px-3 py-4 text-center text-[11px] leading-snug text-white/40">
      No holes. Prints a plain plate.
    </p>

    <button
      type="button"
      :disabled="modelValue.length >= 32"
      class="rounded border border-dark-lighter bg-dark-light px-3 py-1.5 text-xs text-white/80 transition-colors duration-200 hover:border-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      @click="addHole"
    >
      Add hole
    </button>
  </div>
</template>

<script setup>
  const props = defineProps({
    modelValue: {
      type: Array,
      required: true,
    },
    defaultDiameter: {
      type: Number,
      default: 3.4,
    },
    defaultStandoff: {
      type: Number,
      default: 6,
    },
    standoffWall: {
      type: Number,
      default: 2,
    },
    errorRows: {
      type: Array,
      default: () => [],
    },
  });

  const emit = defineEmits(['update:modelValue']);

  const toNumber = (text) => (String(text).trim() === '' ? NaN : Number(text));

  const isSlot = (hole) => {
    const diameter = hole.diameter ?? props.defaultDiameter;
    return Number.isFinite(hole.slotLength) && hole.slotLength > diameter;
  };

  const rowError = (index) => props.errorRows.includes(index + 1);

  const cloneRows = () => props.modelValue.map((hole) => ({ ...hole }));

  function setField(index, key, text) {
    const rows = cloneRows();
    rows[index][key] = toNumber(text);
    emit('update:modelValue', rows);
  }

  function setAxis(index, axis) {
    const rows = cloneRows();
    rows[index].slotAxis = axis;
    emit('update:modelValue', rows);
  }

  function setSlot(index, enabled) {
    const rows = cloneRows();
    const hole = rows[index];
    const diameter = hole.diameter ?? props.defaultDiameter;

    if (enabled) {
      hole.slotLength = Math.min(diameter + 6, 80);
      hole.slotAxis = hole.slotAxis ?? 'x';
    } else {
      hole.slotLength = diameter;
      delete hole.slotAxis;
    }

    emit('update:modelValue', rows);
  }

  function addHole() {
    const rows = cloneRows();

    // Match the core's own footprint rule: a bossed hole claims its radius plus the wall.
    const clearance = (hole) => {
      const diameter = hole.diameter ?? props.defaultDiameter;
      const standoff = hole.standoffHeight ?? props.defaultStandoff;
      return diameter / 2 + (standoff > 0 ? props.standoffWall : 1.5);
    };
    const newClearance = clearance({ diameter: props.defaultDiameter, standoffHeight: props.defaultStandoff });

    // Walk outwards along X from the plate centre until the new hole clears the others,
    // so adding a hole does not immediately produce an invalid layout.
    let candidateX = 0;
    for (let attempt = 0; attempt < 150; attempt += 1) {
      const clash = rows.some((hole) => Math.hypot((Number(hole.x) || 0) - candidateX, Number(hole.y) || 0) < clearance(hole) + newClearance + 1.5);
      if (!clash) break;
      candidateX += 2;
    }

    rows.push({ x: candidateX, y: 0, diameter: props.defaultDiameter, standoffHeight: props.defaultStandoff });
    emit('update:modelValue', rows);
  }

  function removeHole(index) {
    const rows = cloneRows();
    rows.splice(index, 1);
    emit('update:modelValue', rows);
  }
</script>
