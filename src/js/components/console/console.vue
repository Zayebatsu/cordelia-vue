<template>
    <div class="cdp-console-container" :class="[!showColorValue && !allowClearColor ? 'cdp-color-console-non-showing' : !showColorValue ? 'cdp-current-color-non-showing' : !allowClearColor ? 'cdp-clear-color-non-showing' : '']">
        <ColorConsole v-if="showColorValue || allowClearColor" :color="color" :rgbaColor="rgbaColor" :initialColor="initialColor" :isDarkCurrent="isDarkCurrent" :isDarkInitial="isDarkInitial" :inputUpdate="inputUpdate" :showColorValue="showColorValue" :allowClearColor="allowClearColor" :getRgbaValue="getRgbaValue" :convertColor="convertColor" :setColor="setColor" :clearColor="clearColor" :setInitialColorAsColor="setInitialColorAsColor"/>
        <Buttons v-if="showButtons" :save="save" :cancel="cancel" />
    </div>
</template>

<script>
import ColorConsole from './color-console.vue';
import Buttons from './buttons.vue';

export default {
    name: 'Console',
    props: ['color', 'rgbaColor', 'initialColor', 'isDarkCurrent', 'isDarkInitial', 'inputUpdate', 'showColorValue', 'allowClearColor', 'showButtons', 'getRgbaValue', 'convertColor', 'setColor', 'clearColor', 'setInitialColorAsColor', 'save', 'cancel'],
    components: {ColorConsole, Buttons}
};
</script>