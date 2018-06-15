<template>
    <div class="cdp-palette-element cdp-background-type-opacity" @click="setColor(rgba, true, true)">
        <div :style="{background:color.value}"></div>
    </div>
</template>

<script>
export default {
    name: 'PaletteColor',
    props: ['color', 'setColor'],
    computed: {
        rgba() {
            var {r, g, b, a} = this.color;
            return {
                r,
                g,
                b,
                a
            };
        }
    }
};
</script>