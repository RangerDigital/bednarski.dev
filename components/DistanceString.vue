<template>
  <span v-if="distance">({{ distance }} km away)</span>
</template>

<script>
  export default {
    data() {
      return {
        userLocation: null,
        distance: null,
        targetLocation: { lat: 50.041187, lon: 21.999121 },
      };
    },
    mounted() {
      this.fetchUserLocation();
    },
    methods: {
      async fetchUserIP() {
        try {
          const response = await fetch('https://api64.ipify.org?format=json');
          if (!response.ok) throw new Error('Network response was not ok.');
          return (await response.json()).ip;
        } catch (error) {
          console.error('Failed to fetch IP:', error);
        }
      },
      async fetchUserLocation() {
        const ip = await this.fetchUserIP();
        if (ip) {
          try {
            const response = await fetch(`http://ip-api.com/json/${ip}`);
            if (!response.ok) throw new Error('Network response was not ok.');
            this.userLocation = await response.json();
            this.calculateDistance();
          } catch (error) {
            console.error('Failed to fetch location:', error);
          }
        }
      },
      calculateDistance() {
        const earthRadius = 6371;
        const lat1 = (this.userLocation.lat * Math.PI) / 180;
        const lon1 = (this.userLocation.lon * Math.PI) / 180;
        const lat2 = (this.targetLocation.lat * Math.PI) / 180;
        const lon2 = (this.targetLocation.lon * Math.PI) / 180;

        const dLat = lat2 - lat1;
        const dLon = lon2 - lon1;

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadius * c;
        this.distance = distance.toFixed(2);
      },
    },
  };
</script>
