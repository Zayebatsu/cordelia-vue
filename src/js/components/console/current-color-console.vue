<template>
    <div class="cdp-current-color-console" :style="style">
        <ColorInput v-if="showColorValue" :color="color" :rgbaColor="rgbaColor" :isDark="isDark" :inputUpdate="inputUpdate" :getRgbaValue="getRgbaValue" :convertColor="convertColor" :setColor="setColor" />
        <ClearColor v-if="allowClearColor" :rgbaColor="rgbaColor" :isDark="isDark" :clearColor="clearColor" />
    </div>
</template>

<script>
import ColorInput from './color-input.vue';
import ClearColor from './clear-color.vue';

export default {
    name: 'CurrentColorConsole',
    props: ['color', 'rgbaColor', 'isDark', 'inputUpdate', 'showColorValue', 'allowClearColor', 'getRgbaValue', 'convertColor', 'setColor', 'clearColor'],
    components: {ColorInput, ClearColor},
    computed: {
        style() {
            return {
                background: (this.color) ? this.color : 'transparent'
            };
        }
    }
};
</script>