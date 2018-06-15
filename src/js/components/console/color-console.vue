<template>
    <div class="cdp-color-console-container cdp-background-type-opacity">
        <InitialColor :color="initialColor" :isDark="isDarkInitial" :setInitialColorAsColor="setInitialColorAsColor" />
        <CurrentColorConsole :color="color" :rgbaColor="rgbaColor" :isDark="isDarkCurrent" :inputUpdate="inputUpdate" :showColorValue="showColorValue" :allowClearColor="allowClearColor" :getRgbaValue="getRgbaValue" :convertColor="convertColor" :setColor="setColor" :clearColor="clearColor" />
    </div>
</template>

<script>
import InitialColor from './initial-color.vue';
import CurrentColorConsole from './current-color-console.vue';

export default {
    name: 'ColorConsole',
    props: ['color', 'rgbaColor', 'initialColor', 'isDarkCurrent', 'isDarkInitial', 'inputUpdate', 'showColorValue', 'allowClearColor', 'getRgbaValue', 'convertColor', 'setColor', 'clearColor', 'setInitialColorAsColor'],
    components: {InitialColor, CurrentColorConsole}
}
</script>