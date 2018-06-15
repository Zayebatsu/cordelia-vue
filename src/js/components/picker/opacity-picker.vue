<template>
    <div ref="container" class="cdp-opacity-picker" @mousedown="(e) => pickerClicked(e, 'opacity')" @touchstart="(e) => pickerClicked(e, 'opacity')">
        <div class="cdp-opacity-picker-gradient cdp-background-type-opacity">
            <div class="cdp-opacity-picker-gradient cdp-gradient-type-bt-current-color cdp-last-gradient-child" :style="{background:`linear-gradient(to top, rgba(${rgbaColor.r}, ${rgbaColor.g}, ${rgbaColor.b}, 1), rgba(${rgbaColor.r}, ${rgbaColor.g}, ${rgbaColor.b}, 0))`}">
                <div ref="dragger" class="cdp-opacity-dragger" :class="{'cdp-dark':isDark || rgbaColor.a < 0.25}" :style="{left:dragger.left+'px', top:dragger.top+'px'}"></div>
            </div>
        </div>
    </div>
</template>

<script>
import picker from '../../mixin/picker.js';

export default {
    name: 'OpacityPicker',
    mixins: [picker],
    methods: {
        /**
         * Sets the position of the picker according to the color.
         */
        setPosition() {
            var left = (this.picker.width - (this.picker.subtractedValue * 2)) / 2,
                top;

            if(this.color) {
                top = Math.round(((this.picker.height) / 100) * (this.rgbaColor.a * 100)) - this.picker.subtractedValue;
            } else {
                top = this.picker.height - this.picker.subtractedValue;
            }

            this.dragger = {
                left,
                top
            };
        }
    }
}
</script>