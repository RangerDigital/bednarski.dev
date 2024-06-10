<template>
  <div class="w-32 bg-dark-light rounded-sm p-4" :style="signStyle"> Welcome! </div>
</template>

<script>
  export default {
    data() {
      return {
        rotationDegrees: 0,
      };
    },
    computed: {
      signStyle() {
        return {
          transform: `rotate(${this.rotationDegrees}deg)`,
          transition: 'transform 0.5s',
          position: 'relative',
        };
      },
    },
    methods: {
      handleOrientation(event) {
        const { gamma } = event; // Side to side
        this.rotationDegrees = gamma; // Rotate the sign based on side tilt
      },
    },
    mounted() {
      window.addEventListener('deviceorientation', this.handleOrientation);
    },
    beforeDestroy() {
      window.removeEventListener('deviceorientation', this.handleOrientation);
    },
  };
</script>
