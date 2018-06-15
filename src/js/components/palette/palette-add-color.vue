<template>
    <div class="cdp-palette-add-element" @click="addColor">
        <i class="cdp-icons"></i>
    </div>
</template>

<script>
export default {
    name: 'PaletteAddColor',
    props: ['addColor']
};
</script>