<template>
    <div ref="container" class="cdp-major-picker" @mousedown="(e) => pickerClicked(e, 'major')" @touchstart="(e) => pickerClicked(e, 'major')">
        <div v-if="pickerStyle == 0" class="cdp-major-picker-gradient cdp-background-type-current-color" :style="{background:`hsl(${hslColor.h}, 100%, 50%)`}">
            <div class="cdp-major-picker-gradient cdp-gradient-type-lr-white">
                <div class="cdp-major-picker-gradient cdp-gradient-type-bt-black cdp-last-gradient-child">
                    <div ref="dragger" class="cdp-major-dragger" :class="{'cdp-dark':isDark}" :style="{left:dragger.left+'px', top:dragger.top+'px'}"></div>
                </div>
            </div>
        </div>
        <div v-else="" class="cdp-major-picker-gradient cdp-gradient-type-lr-colorful">
            <div class="cdp-major-picker-gradient cdp-gradient-type-bt-gray cdp-last-gradient-child">
                <div ref="dragger" class="cdp-major-dragger" :style="{left:dragger.left+'px', top:dragger.top+'px'}"></div>
            </div>
        </div>
    </div>
</template>

<script>
import picker from '../../mixin/picker.js';

export default {
    name: 'MajorPicker',
    mixins: [picker],
    props: ['hslColor', 'pickerStyle'],
    methods: {
        /**
         * Sets the position of the picker according to the color.
         */
        setPosition() {
            if(this.color) {
                if(this.pickerStyle == 0) {
                    var {r, g, b} = this.rgbaColor,
                        x = this.picker.height,
                        maxColor = Math.max(r,g,b),
                        topCV = Math.abs(Math.round(((x/255) * maxColor) - x)),
                        minColor = Math.min(r,g,b),
                        leftV = Math.abs(Math.round(((x/255) * minColor) - x)),
                        leftCV = leftV - Math.abs(Math.round((topCV/maxColor) * minColor)),
                        left = leftCV - this.picker.subtractedValue,
                        top = topCV - this.picker.subtractedValue;
                } else {
                    var {h, s, l} = this.hslColor,
                        x = this.picker.height,
                        leftCV = Math.round((x/360) * h),
                        topCV = Math.abs(Math.round(((x/100) * s) - x)),
                        left = leftCV - this.picker.subtractedValue,
                        top = topCV - this.picker.subtractedValue;
                }
            } else {
                var value = this.picker.subtractedValue * -1,
                    left = value,
                    top = value;
            }

            this.dragger = {
                left,
                top
            };
        }
    }
};
</script>