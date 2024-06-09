<template>
  <section class="flex flex-col gap-4">
    <!-- Colors -->

    <p>Colors</p>
    <div class="flex flex-row gap-4">
      <BaseColorPreview color="#FF344A" name="Primary" />

      <BaseColorPreview color="#141315" name="Dark Light" />

      <BaseColorPreview color="#2C2B2D" name="Dark Lighter" />
    </div>

    <!-- Fonts -->
    <div class="flex flex-row gap-4">
      <BaseFontPreview name="Poppins" class="font-headings" />

      <BaseFontPreview name="Work Sans" class="font-sans" />
    </div>

    <!-- Logo -->
    <p>Branding</p>
  </section>
</template>
