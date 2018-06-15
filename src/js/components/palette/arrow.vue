<template>
    <div class="cdp-arrow-div">
        <i class="cdp-icons" @click="togglePalette"></i>
    </div>
</template>

<script>
export default {
    name: 'Arrow',
    methods: {
        togglePalette() {
            this.$emit('togglePalette');
        }
    }
}
</script>