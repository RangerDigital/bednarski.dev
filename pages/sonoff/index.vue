<template>
  <div class="kiosk-container">
    <!-- Scan lines overlay -->
    <div class="scan-lines"></div>
    
    <!-- Cyber grid background -->
    <div class="cyber-grid"></div>

    <!-- Header with time and status -->
    <header class="kiosk-header">
      <div class="cyber-text glitch" data-text="NS-PANEL">NS-PANEL</div>
      <div class="status-indicator">
        <span class="pulse-dot"></span>
        <span class="mono-text">{{ currentTime }}</span>
      </div>
    </header>

    <!-- Main control panel -->
    <main class="control-panel">
      <!-- Left column - two buttons stacked -->
      <div class="left-controls">
        <button 
          class="cyber-btn lock-btn" 
          :class="{ active: lockActive, processing: lockProcessing }"
          @click="toggleLock"
          @touchstart.prevent="handleTouchStart('lock')"
          @touchend.prevent="handleTouchEnd('lock')"
        >
          <div class="btn-glow"></div>
          <div class="btn-content">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span class="btn-label">LOCK</span>
            <span class="btn-status">{{ lockActive ? 'SECURED' : 'UNLOCKED' }}</span>
          </div>
          <div class="btn-border"></div>
        </button>

        <button 
          class="cyber-btn light-btn" 
          :class="{ active: lightActive, processing: lightProcessing }"
          @click="toggleLight"
          @touchstart.prevent="handleTouchStart('light')"
          @touchend.prevent="handleTouchEnd('light')"
        >
          <div class="btn-glow"></div>
          <div class="btn-content">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18h6"/>
              <path d="M10 22h4"/>
              <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
            </svg>
            <span class="btn-label">LIGHT</span>
            <span class="btn-status">{{ lightActive ? 'ON' : 'OFF' }}</span>
          </div>
          <div class="btn-border"></div>
        </button>
      </div>

      <!-- Right column - long door button -->
      <button 
        class="cyber-btn door-btn" 
        :class="{ active: doorOpen, processing: doorProcessing }"
        @click="openDoor"
        @touchstart.prevent="handleTouchStart('door')"
        @touchend.prevent="handleTouchEnd('door')"
      >
        <div class="btn-glow"></div>
        <div class="btn-content">
          <svg class="btn-icon door-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <path d="M12 18v-6"/>
            <path d="M9 15l3 3 3-3"/>
          </svg>
          <span class="btn-label">OPEN</span>
          <span class="btn-sublabel">DOOR ACCESS</span>
          <div class="door-progress" :style="{ width: doorProgress + '%' }"></div>
        </div>
        <div class="btn-border"></div>
      </button>
    </main>

    <!-- Response time indicator -->
    <footer class="kiosk-footer">
      <div class="latency-display">
        <span class="label">LATENCY</span>
        <span class="value" :class="latencyClass">{{ lastLatency }}ms</span>
      </div>
      <div class="interaction-count">
        <span class="mono-text">INTERACTIONS: {{ interactionCount }}</span>
      </div>
    </footer>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SonoffPanel',
  
  data() {
    return {
      currentTime: '',
      lockActive: false,
      lightActive: false,
      doorOpen: false,
      lockProcessing: false,
      lightProcessing: false,
      doorProcessing: false,
      doorProgress: 0,
      lastLatency: 0,
      interactionCount: 0,
      touchStartTime: 0,
      timeInterval: null,
    };
  },

  computed: {
    latencyClass() {
      if (this.lastLatency < 50) return 'excellent';
      if (this.lastLatency < 100) return 'good';
      if (this.lastLatency < 200) return 'moderate';
      return 'slow';
    }
  },

  mounted() {
    this.updateTime();
    this.timeInterval = setInterval(this.updateTime, 1000);
  },

  beforeUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  },

  methods: {
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    },

    handleTouchStart(type) {
      this.touchStartTime = performance.now();
    },

    handleTouchEnd(type) {
      const latency = Math.round(performance.now() - this.touchStartTime);
      this.lastLatency = latency;
      this.interactionCount++;
      
      if (type === 'lock') this.toggleLock();
      else if (type === 'light') this.toggleLight();
      else if (type === 'door') this.openDoor();
    },

    async toggleLock() {
      if (this.lockProcessing) return;
      
      const start = performance.now();
      this.lockProcessing = true;
      
      // Simulate API call
      await this.simulateDelay(50 + Math.random() * 100);
      
      this.lockActive = !this.lockActive;
      this.lockProcessing = false;
      
      if (!this.touchStartTime) {
        this.lastLatency = Math.round(performance.now() - start);
        this.interactionCount++;
      }
    },

    async toggleLight() {
      if (this.lightProcessing) return;
      
      const start = performance.now();
      this.lightProcessing = true;
      
      await this.simulateDelay(30 + Math.random() * 70);
      
      this.lightActive = !this.lightActive;
      this.lightProcessing = false;
      
      if (!this.touchStartTime) {
        this.lastLatency = Math.round(performance.now() - start);
        this.interactionCount++;
      }
    },

    async openDoor() {
      if (this.doorProcessing) return;
      
      const start = performance.now();
      this.doorProcessing = true;
      this.doorProgress = 0;
      
      // Animate progress
      const progressInterval = setInterval(() => {
        this.doorProgress += 10;
        if (this.doorProgress >= 100) {
          clearInterval(progressInterval);
        }
      }, 50);
      
      await this.simulateDelay(500);
      
      this.doorOpen = true;
      this.doorProcessing = false;
      
      if (!this.touchStartTime) {
        this.lastLatency = Math.round(performance.now() - start);
        this.interactionCount++;
      }
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        this.doorOpen = false;
        this.doorProgress = 0;
      }, 3000);
    },

    simulateDelay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
});
</script>

<style scoped>
/* Kiosk container - fullscreen dark cyberpunk */
.kiosk-container {
  position: fixed;
  inset: 0;
  background: #070707;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
}

/* Scan lines overlay */
.scan-lines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 255, 0.015) 2px,
    rgba(0, 255, 255, 0.015) 4px
  );
  pointer-events: none;
  z-index: 100;
}

/* Cyber grid background */
.cyber-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

/* Header */
.kiosk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  margin-bottom: 16px;
}

.cyber-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.7);
  letter-spacing: 0.2em;
}

.glitch {
  animation: glitch 3s infinite;
}

@keyframes glitch {
  0%, 90%, 100% {
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.7);
  }
  92% {
    text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff;
  }
  94% {
    text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff;
  }
  96% {
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.7);
  }
  98% {
    text-shadow: -1px 0 #ff00ff, 1px 0 #00ffff;
  }
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #00ff88;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
  box-shadow: 0 0 10px #00ff88;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.mono-text {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.1em;
}

/* Control Panel Layout */
.control-panel {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 16px;
  min-height: 0;
}

.left-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Cyber Button Base */
.cyber-btn {
  position: relative;
  flex: 1;
  border: none;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.1s ease;
}

.cyber-btn:active {
  transform: scale(0.98);
}

.btn-glow {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
}

.cyber-btn:hover .btn-glow,
.cyber-btn.active .btn-glow {
  opacity: 1;
}

.btn-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: #141315;
  border-radius: 8px;
}

.btn-border {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  border: 2px solid;
  transition: all 0.3s ease;
}

.btn-icon {
  width: 36px;
  height: 36px;
  transition: all 0.3s ease;
}

.btn-label {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: #ededed;
}

.btn-status {
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.btn-sublabel {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  opacity: 0.5;
}

/* Lock Button - Cyan Theme */
.lock-btn .btn-glow {
  background: radial-gradient(ellipse at center, rgba(0, 255, 255, 0.3) 0%, transparent 70%);
}

.lock-btn .btn-border {
  border-color: rgba(0, 255, 255, 0.3);
}

.lock-btn .btn-icon {
  color: #00ffff;
  filter: drop-shadow(0 0 4px rgba(0, 255, 255, 0.5));
}

.lock-btn:hover .btn-border,
.lock-btn.active .btn-border {
  border-color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.1);
}

.lock-btn.active .btn-content {
  background: linear-gradient(135deg, #141315 0%, #0a1a1a 100%);
}

.lock-btn.active .btn-status {
  color: #00ffff;
  opacity: 1;
}

/* Light Button - Yellow/Amber Theme */
.light-btn .btn-glow {
  background: radial-gradient(ellipse at center, rgba(255, 200, 0, 0.3) 0%, transparent 70%);
}

.light-btn .btn-border {
  border-color: rgba(255, 200, 0, 0.3);
}

.light-btn .btn-icon {
  color: #ffc800;
  filter: drop-shadow(0 0 4px rgba(255, 200, 0, 0.5));
}

.light-btn:hover .btn-border,
.light-btn.active .btn-border {
  border-color: #ffc800;
  box-shadow: 0 0 20px rgba(255, 200, 0, 0.4), inset 0 0 20px rgba(255, 200, 0, 0.1);
}

.light-btn.active .btn-content {
  background: linear-gradient(135deg, #141315 0%, #1a1505 100%);
}

.light-btn.active .btn-icon {
  animation: light-glow 1.5s ease-in-out infinite;
}

.light-btn.active .btn-status {
  color: #ffc800;
  opacity: 1;
}

@keyframes light-glow {
  0%, 100% { filter: drop-shadow(0 0 4px rgba(255, 200, 0, 0.5)); }
  50% { filter: drop-shadow(0 0 12px rgba(255, 200, 0, 0.9)); }
}

/* Door Button - Magenta/Red Theme */
.door-btn .btn-glow {
  background: radial-gradient(ellipse at center, rgba(255, 0, 127, 0.3) 0%, transparent 70%);
}

.door-btn .btn-border {
  border-color: rgba(255, 0, 127, 0.3);
}

.door-btn .btn-icon {
  color: #ff007f;
  filter: drop-shadow(0 0 4px rgba(255, 0, 127, 0.5));
}

.door-btn:hover .btn-border,
.door-btn.active .btn-border {
  border-color: #ff007f;
  box-shadow: 0 0 30px rgba(255, 0, 127, 0.5), inset 0 0 30px rgba(255, 0, 127, 0.1);
}

.door-btn.active .btn-content {
  background: linear-gradient(135deg, #141315 0%, #1a0510 100%);
}

.door-btn .door-icon {
  width: 48px;
  height: 48px;
}

.door-btn .btn-label {
  font-size: 1.5rem;
}

/* Door progress bar */
.door-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #ff007f, #ff00ff);
  transition: width 0.05s linear;
  box-shadow: 0 0 10px #ff007f;
}

/* Processing state */
.cyber-btn.processing .btn-content {
  animation: processing-pulse 0.5s ease-in-out infinite;
}

@keyframes processing-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Footer */
.kiosk-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 255, 255, 0.2);
  margin-top: 16px;
}

.latency-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.latency-display .label {
  font-size: 0.625rem;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.5);
}

.latency-display .value {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.latency-display .value.excellent { color: #00ff88; text-shadow: 0 0 8px rgba(0, 255, 136, 0.5); }
.latency-display .value.good { color: #00ffff; text-shadow: 0 0 8px rgba(0, 255, 255, 0.5); }
.latency-display .value.moderate { color: #ffc800; text-shadow: 0 0 8px rgba(255, 200, 0, 0.5); }
.latency-display .value.slow { color: #ff007f; text-shadow: 0 0 8px rgba(255, 0, 127, 0.5); }

.interaction-count {
  opacity: 0.5;
}
</style>
