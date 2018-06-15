<template>
    <div class="cdp-palette">
        <PaletteAddColor v-if="allowPaletteAddColor" :addColor="addColor" />
        <PaletteColor v-for="p in paletteColors_" :key="p.value" :color="p" :setColor="setColor" />
    </div>
</template>

<script>
import PaletteAddColor from './palette-add-color.vue';
import PaletteColor from './palette-color.vue';

export default {
    name: 'PaletteColors',
    props: ['paletteColors', 'allowPaletteAddColor', 'color', 'rgbaColor', 'getRgbaValue', 'setColor'],
    components: {PaletteAddColor, PaletteColor},
    data() {
        return {
            paletteColors_: []
        };
    },
    mounted() {
        this.paletteColors.forEach(i => {
            var rgba = this.getRgbaValue(i),
                {r, g, b, a} = rgba,
                color = `rgba(${r}, ${g}, ${b}, ${a})`;

            this.paletteColors_.push({
                value: color,
                r,
                g,
                b,
                a
            });
        });
    },
    methods: {
        /**
         * Adds a color to the palette.
         */
        addColor() {
            if(this.color) {
                var {r, g, b, a} = this.rgbaColor,
                    color = `rgba(${r}, ${g}, ${b}, ${a})`;

                var check = this.paletteColors_.find(i => i.value == color);
                if(!check) {
                    this.paletteColors_.push({
                        value: color,
                        r,
                        g,
                        b,
                        a
                    });
                }
            }
        }
    }
};
</script>