<template>
    <div class="cdp-palette-container">
        <hr class="cdp-palette-line" />
        <PaletteColors :paletteColors="paletteColors" :allowPaletteAddColor="allowPaletteAddColor" :color="color" :rgbaColor="rgbaColor" :getRgbaValue="getRgbaValue" :setColor="setColor" />
    </div>
</template>

<script>
import PaletteColors from './palette-colors.vue';

export default {
    name: 'Palette',
    props: ['paletteColors', 'allowPaletteAddColor', 'color', 'rgbaColor', 'getRgbaValue', 'setColor'],
    components: {PaletteColors}
}
</script>