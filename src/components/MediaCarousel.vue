<template>
  <div class="carousel" v-if="images.length">
    <div class="frame">
      <transition :name="dir" mode="out-in">
        <img
          :key="index"
          :src="cdnUrl(images[index].full || images[index].thumb)"
          :alt="`Afbeelding ${index + 1}`"
          class="slide"
          loading="lazy"
        />
      </transition>

      <template v-if="images.length > 1">
        <button class="arrow left" @click="prev" aria-label="Vorige">‹</button>
        <button class="arrow right" @click="next" aria-label="Volgende">›</button>
      </template>
    </div>

    <div v-if="images.length > 1" class="dots">
      <button
        v-for="(img, i) in images"
        :key="i"
        class="dot"
        :class="{ active: i === index }"
        @click="goTo(i)"
        :aria-label="`Ga naar afbeelding ${i + 1}`"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { cdnUrl } from '../lib/imageProcessing.js'

const props = defineProps({ images: { type: Array, default: () => [] } })
const index = ref(0)
const dir = ref('slide-next')

const next = () => {
  dir.value = 'slide-next'
  index.value = (index.value + 1) % props.images.length
}
const prev = () => {
  dir.value = 'slide-prev'
  index.value = (index.value - 1 + props.images.length) % props.images.length
}
const goTo = (i) => {
  dir.value = i > index.value ? 'slide-next' : 'slide-prev'
  index.value = i
}
</script>

<style scoped>
.frame {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface-2);
  box-shadow: var(--shadow-sm);
  aspect-ratio: 3 / 2;
}
.slide {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 0;
  font-size: 1.6rem;
  line-height: 1;
  color: var(--text);
  background: color-mix(in srgb, var(--surface) 80%, transparent);
  backdrop-filter: blur(6px);
  box-shadow: var(--shadow-sm);
  display: grid;
  place-items: center;
  transition: background var(--t-fast), transform var(--t-fast);
}
.arrow:hover {
  background: var(--surface);
  color: var(--accent);
}
.arrow.left {
  left: 12px;
}
.arrow.right {
  right: 12px;
}
.dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 1rem;
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  border: 0;
  background: var(--line);
  transition: background var(--t-fast), transform var(--t-fast);
}
.dot.active {
  background: var(--accent);
  transform: scale(1.25);
}

.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: opacity 0.35s var(--ease), transform 0.35s var(--ease);
}
.slide-next-enter-from {
  opacity: 0;
  transform: translateX(28px);
}
.slide-next-leave-to {
  opacity: 0;
  transform: translateX(-28px);
}
.slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-28px);
}
.slide-prev-leave-to {
  opacity: 0;
  transform: translateX(28px);
}
</style>
