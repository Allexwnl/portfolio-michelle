<template>
  <div class="yt" :class="{ playing }">
    <button v-if="!playing" class="yt-poster" :style="posterStyle" @click="playing = true">
      <span class="yt-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="34" height="34"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
      </span>
      <span class="sr-only">Speel video af</span>
    </button>
    <iframe
      v-else
      :src="src"
      title="YouTube video"
      frameborder="0"
      allow="accelerated-sensors; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { youtubeThumb, youtubeEmbed } from '../lib/youtube.js'

const props = defineProps({ id: { type: String, required: true } })
const playing = ref(false)
const posterStyle = computed(() => ({ backgroundImage: `url(${youtubeThumb(props.id)})` }))
const src = computed(() => youtubeEmbed(props.id))
</script>

<style scoped>
.yt {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius);
  overflow: hidden;
  background: #000;
  box-shadow: var(--shadow-sm);
}
.yt iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.yt-poster {
  position: absolute;
  inset: 0;
  border: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  display: grid;
  place-items: center;
  transition: filter var(--t-fast);
}
.yt-poster::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.28));
}
.yt-poster:hover {
  filter: brightness(1.05);
}
.yt-play {
  position: relative;
  z-index: 1;
  width: 74px;
  height: 74px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--accent) 92%, #000);
  color: #fff;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
  padding-left: 4px;
  transition: transform var(--t-fast) var(--ease);
}
.yt-poster:hover .yt-play {
  transform: scale(1.08);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
