<template>
    <div ref="container" class="cdp-minor-picker" @mousedown="(e) => pickerClicked(e, 'minor')" @touchstart="(e) => pickerClicked(e, 'minor')">
        <div v-if="pickerStyle == 0" class="cdp-minor-picker-gradient cdp-gradient-type-tb-colorful cdp-last-gradient-child">
            <div ref="dragger" class="cdp-minor-dragger" :style="{left:dragger.left+'px', top:dragger.top+'px'}"></div>
        </div>
        <div v-else="" class="cdp-minor-picker-gradient cdp-gradient-type-bt-white-current-color-black cdp-last-gradient-child" :style="style">
            <div ref="dragger" class="cdp-minor-dragger" :class="{'cdp-dark':isDark}" :style="{left:dragger.left+'px', top:dragger.top+'px'}"></div>
        </div>
    </div>
</template>

<script>
import picker from '../../mixin/picker.js';

export default {
    name: 'MinorPicker',
    mixins: [picker],
    props: ['hslColor', 'pickerStyle'],
    computed: {
        style() {
            var h,
                s;

            if(this.color) {
                h = this.hslColor.h;
                s = this.hslColor.s;
            } else {
                h = 0;
                s = 100;
            }

            return {
                background:`linear-gradient(to bottom, hsl(0, 100%, 100%), hsl(${h}, ${s}%, 50%), hsl(0, 0%, 0%))`
            };
        }
    },
    methods: {
        /**
         * Sets the position of the picker according to the color.
         */
        setPosition() {
            var left = (this.picker.width - (this.picker.subtractedValue * 2)) / 2;

            if(this.color) {
                if(this.pickerStyle == 0) {
                    var top = (Math.round(((this.picker.height) / 360) * this.hslColor.h)) - this.picker.subtractedValue;
                } else {
                    var y = this.picker.height,
                        top = (Math.abs(Math.round(((y/100) * this.hslColor.l) - y))) - this.picker.subtractedValue;
                }
            } else {
                var top = this.picker.subtractedValue * -1;
            }

            this.dragger = {
                left,
                top
            };
        }
    }
};
</script>