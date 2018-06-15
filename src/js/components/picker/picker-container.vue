<template>
    <div class="cdp-picker-container">
        <MajorPicker ref="majorPicker" @pickerClicked="pickerClicked" :init="init" :color="color" :rgbaColor="rgbaColor" :hslColor="hslColor" :isDark="isDark" :pickerUpdate="pickerUpdate" :picker="majorPicker" :pickerStyle="pickerStyle" />
        <MinorPicker ref="minorPicker" @pickerClicked="pickerClicked" :init="init" :color="color" :rgbaColor="rgbaColor" :hslColor="hslColor" :isDark="isDark" :pickerUpdate="pickerUpdate" :picker="minorPicker" :pickerStyle="pickerStyle" />
        <OpacityPicker v-if="allowOpacity" ref="opacityPicker" @pickerClicked="pickerClicked" :init="init" :color="color" :rgbaColor="rgbaColor" :isDark="isDark" :pickerUpdate="pickerUpdate" :picker="opacityPicker" />
    </div>
</template>

<script>
import ColorConverter from '../../mixin/color-converter.js';
import MajorPicker from './major-picker.vue';
import MinorPicker from './minor-picker.vue';
import OpacityPicker from './opacity-picker.vue';

export default {
    name: 'PickerContainer',
    mixins: [ColorConverter],
    props: ['color', 'rgbaColor', 'isDark', 'pickerUpdate', 'majorPicker', 'minorPicker', 'opacityPicker', 'pickerStyle', 'allowOpacity', 'getRgbaValue', 'setColor'],
    components: {MajorPicker, MinorPicker, OpacityPicker},
    data() {
        return {
            init: false,
            rgbColor: {}, //Holds the latest RGB value to calculate the new value when the picker position is changed on the palette
            hslColor: {}, //Holds the latest HSL value to calculate the new value when the picker position is changed on the palette
            dragStatus: null
        };
    },
    watch: {
        color() {
            if(this.pickerUpdate) {
                this.setRgbHslValue();
            }
        }
    },
    mounted() {
        this.setRgbHslValue();
        this.init = true;
    },
    methods: {
        /**
         * Sets RGB and HSL values according to the color.
         */
        setRgbHslValue() {
            if(this.color) {
                this.hslColor = this.rgbTohsl(this.rgbaColor);
                this.rgbColor = this.getRgbaValue(`hsl(${this.hslColor.h}, 100%, 50%)`);
            } else {
                this.rgbColor = {
                    r: 255,
                    g: 0,
                    b: 0
                };
                this.hslColor = {
                    h: 0,
                    s: 0,
                    l: 0
                };
            }
        },

        /**
         * This function is called when a color is chosen on the picker.
         * Sets the color.
         *
         * @param {Object} event
         * @param {String} dragStatus
         */
        pickerClicked(event, dragStatus) {
            this.dragStatus = dragStatus;
            document.body.classList.add('cdp-dragging-active');

            if(this.pickerStyle == 0 && dragStatus != 'minor' && !this.color) {
                var dragger = this.$refs.minorPicker.$refs.dragger;
                this.setColorWithPosition({ x: (dragger.offsetLeft + this.minorPicker.subtractedValue), y: (dragger.offsetTop + this.minorPicker.subtractedValue) }, 'minor');
            } else if(this.pickerStyle == 1 && dragStatus != 'major' && !this.color) {
                var dragger = this.$refs.majorPicker.$refs.dragger;
                this.setColorWithPosition({ x: (dragger.offsetLeft + this.majorPicker.subtractedValue), y: (dragger.offsetTop + this.majorPicker.subtractedValue) }, 'major');
            }

            this.pickerMoved(event);
            this.toggleDraggerListeners(true);
        },

        /**
         * This function is called when the picker is moved on the palette. Takes the event object as an argument. Calls the setColorWithPosition() to set the new color.
         *
         * @param {Object} event
         */
        pickerMoved(event) {
            var n;

            if(this.dragStatus == 'major') {
                n = this.newPosition(event, this.$refs.majorPicker);
            } else if(this.dragStatus == 'minor') {
                n = this.newPosition(event, this.$refs.minorPicker);
            } else {
                n = this.newPosition(event, this.$refs.opacityPicker);
            }
            this.setColorWithPosition(n, this.dragStatus, true);

            event.preventDefault();
        },

        /**
         * Sets and returns the new position of the picker.
         *
         * @param {Object} event
         * @param {Object} picker
         * @returns {Object} {x: Number, y: Number}
         */
        newPosition(event, picker) {
            var p = picker.picker,
                rect = picker.$refs.container.getBoundingClientRect(),
                eX = (event.clientX) ? event.clientX : event.pageX - window.pageXOffset,
                eY = (event.clientY) ? event.clientY : event.pageY - window.pageYOffset,
                x = eX - (rect.left + p.subtractedValue),
                y = eY - (rect.top + p.subtractedValue);

            if(x < -p.subtractedValue) { x = -p.subtractedValue; } else if(x > (p.width - p.subtractedValue)) { x = p.width - p.subtractedValue; }
            if(y < -p.subtractedValue) { y = -p.subtractedValue; } else if(y > (p.height - p.subtractedValue)) { y = p.height - p.subtractedValue; }

            picker.dragger = {
                left: x,
                top: y
            };

            return { x:(x + p.subtractedValue), y:(y + p.subtractedValue) };
        },

        /**
         * Sets the color according to the new position.
         *
         * @param {Object} n
         * @param {String} type
         * @param {Boolean} eventCall
         */
        setColorWithPosition(n, type, eventCall=false) {
            var rgb = this.rgbColor;

            if(type == 'major') {
                if(this.pickerStyle == 0) {
                    var rgb = [rgb.r, rgb.g, rgb.b],
                        x = this.majorPicker.height,
                        topCV,
                        leftV,
                        leftCV,
                        netV;

                    for(let i=0; i<rgb.length; i++) {
                        let v = rgb[i];
                        if(v == 255) {
                            netV = Math.abs(Math.round(((255/x) * n.y) - 255));
                        } else {
                            topCV = Math.round((x - n.y) * (v/x));
                            leftV = Math.round((x - n.x) * ((255-v)/x));
                            leftCV = Math.abs(Math.round((x - n.y) * (leftV/x)));
                            netV = topCV+leftCV;
                        }
                        rgb[i] = netV;
                    }

                    var rgba = {
                        r: rgb[0],
                        g: rgb[1],
                        b: rgb[2],
                        a: this.rgbaColor.a
                    };

                    this.setColor(rgba, false, true, eventCall);
                } else {
                    var x = this.majorPicker.height,
                        h = Math.round(n.x * (360/x)),
                        s = Math.abs(Math.round(n.y * (100/x)) - 100);

                    this.hslColor.h = h;
                    this.hslColor.s = s;

                    var dragger = this.$refs.minorPicker.$refs.dragger,
                        minorX = dragger.offsetLeft + this.minorPicker.subtractedValue,
                        minorY = dragger.offsetTop + this.minorPicker.subtractedValue;

                    this.setColorWithPosition({ x:minorX, y:minorY }, 'minor', eventCall);
                }
            } else if(type == 'minor') {
                if(this.pickerStyle == 0) {
                    var x = this.minorPicker.height,
                        h = Math.round(n.y * (360/x));

                    rgb = this.getRgbaValue(`hsl(${h}, 100%, 50%)`);
                    this.rgbColor = rgb;
                    this.hslColor.h = h;

                    var dragger = this.$refs.majorPicker.$refs.dragger,
                        majorX = dragger.offsetLeft + this.majorPicker.subtractedValue,
                        majorY = dragger.offsetTop + this.majorPicker.subtractedValue;

                    this.setColorWithPosition({ x:majorX, y:majorY }, 'major', eventCall);
                } else {
                    var x = this.minorPicker.height,
                        l = Math.abs(Math.round(n.y * (100/x)) - 100),
                        rgba = this.getRgbaValue(`hsl(${this.hslColor.h}, ${this.hslColor.s}%, ${l}%)`);

                    this.hslColor.l = l;
                    rgba.a = this.rgbaColor.a;

                    this.setColor(rgba, false, true, eventCall);
                }
            } else if(type == 'opacity') {
                var {r, g, b} = this.rgbaColor,
                    x = this.opacityPicker.height,
                    a = Math.round((100/x) * n.y) / 100;

                var rgba = {r, g, b, a};
                this.setColor(rgba, false, true, eventCall);
            }
        },

        /**
         * Ends dragging.
         */
        pickerReleased() {
            document.body.classList.remove('cdp-dragging-active');
            this.toggleDraggerListeners(false);
        },

        /**
         * Toggles dragger listeners according to status.
         *
         * @param {Boolean} status
         */
        toggleDraggerListeners(status) {
            if(status) {
                document.addEventListener('mousemove', this.pickerMoved);
                document.addEventListener('touchmove', this.pickerMoved);
                document.addEventListener('mouseup', this.pickerReleased);
                document.addEventListener('touchend', this.pickerReleased);
            } else {
                document.removeEventListener('mousemove', this.pickerMoved);
                document.removeEventListener('touchmove', this.pickerMoved);
                document.removeEventListener('mouseup', this.pickerReleased);
                document.removeEventListener('touchend', this.pickerReleased);
            }
        }
    }
};
</script>