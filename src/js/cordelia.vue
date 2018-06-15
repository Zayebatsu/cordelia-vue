<template>
    <transition v-if="embed" @enter="containerEnter" @leave="containerLeave">
        <div v-show="pickerOpen" ref="container" class="cdp-container" :cdp-size="size_">
            <div ref="rgbaColor" class="cdp-hidden" />
            <PickerContainer :color="color_" :rgbaColor="rgbaColor" :isDark="isDarkCurrent" :pickerUpdate="pickerUpdate" :majorPicker="majorPicker" :minorPicker="minorPicker" :opacityPicker="opacityPicker" :pickerStyle="pickerStyle" :allowOpacity="allowOpacity" :getRgbaValue="getRgbaValue" :setColor="setColor" />
            <Console v-if="showColorValue || allowClearColor || showButtons" :color="color_" :rgbaColor="rgbaColor" :initialColor="initialColor" :isDarkCurrent="isDarkCurrent" :isDarkInitial="isDarkInitial" :inputUpdate="inputUpdate" :showColorValue="showColorValue" :allowClearColor="allowClearColor" :showButtons="showButtons" :getRgbaValue="getRgbaValue" :convertColor="convertColor" :setColor="setColor" :clearColor="clearColor" :setInitialColorAsColor="setInitialColorAsColor" :save="save" :cancel="cancel" />
            <Arrow v-if="showPalette" @togglePalette="paletteOpen = !paletteOpen" />
            <transition @enter="paletteEnter" @leave="paletteLeave">
                <Palette v-if="showPalette" v-show="paletteOpen" :paletteColors="paletteColors" :allowPaletteAddColor="allowPaletteAddColor" :color="color_" :rgbaColor="rgbaColor" :getRgbaValue="getRgbaValue" :setColor="setColor" />
            </transition>
        </div>
    </transition>
    <div v-else="" ref="main" class="cdp-wrapper cdp-background-type-opacity" @click="openPicker">
        <div class="cdp-wrapper-overlay" :style="{background:color_}">
            <transition @enter="containerEnter" @leave="containerLeave">
                <div v-show="pickerOpen" ref="container" class="cdp-container" :class="{'cdp-right':pickerPosition.right, 'cdp-bottom':pickerPosition.bottom}" :cdp-size="size_">
                    <div ref="rgbaColor" class="cdp-hidden" />
                    <PickerContainer :color="color_" :rgbaColor="rgbaColor" :isDark="isDarkCurrent" :pickerUpdate="pickerUpdate" :majorPicker="majorPicker" :minorPicker="minorPicker" :opacityPicker="opacityPicker" :pickerStyle="pickerStyle" :allowOpacity="allowOpacity" :getRgbaValue="getRgbaValue" :setColor="setColor" />
                    <Console v-if="showColorValue || allowClearColor || showButtons" :color="color_" :rgbaColor="rgbaColor" :initialColor="initialColor" :isDarkCurrent="isDarkCurrent" :isDarkInitial="isDarkInitial" :inputUpdate="inputUpdate" :showColorValue="showColorValue" :allowClearColor="allowClearColor" :showButtons="showButtons" :getRgbaValue="getRgbaValue" :convertColor="convertColor" :setColor="setColor" :clearColor="clearColor" :setInitialColorAsColor="setInitialColorAsColor" :save="save" :cancel="cancel" />
                    <Arrow v-if="showPalette" @togglePalette="paletteOpen = !paletteOpen" />
                    <transition @enter="paletteEnter" @leave="paletteLeave">
                        <Palette v-if="showPalette" v-show="paletteOpen" :paletteColors="paletteColors" :allowPaletteAddColor="allowPaletteAddColor" :color="color_" :rgbaColor="rgbaColor" :getRgbaValue="getRgbaValue" :setColor="setColor" />
                    </transition>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import 'es6-promise/auto';
import defaultProps from './default-props.js';
import ColorConverter from './mixin/color-converter.js';
import Helper from './mixin/helper.js';
import PickerContainer from './components/picker/picker-container.vue';
import Console from './components/console/console.vue';
import Arrow from './components/palette/arrow.vue';
import Palette from './components/palette/palette.vue';

export default {
    name: 'Cordelia',
    mixins: [ColorConverter, Helper],
    components: {PickerContainer, Console, Arrow, Palette},
    props: defaultProps,
    data() {
        return {
            size_: this.size,
            color_: this.color,
            initialColor: null,
            isDarkCurrent: false,
            isDarkInitial: false,
            pickerUpdate: true,
            inputUpdate: true,

            // Stores RGBA values of the current color.
            rgbaColor: {},

            // Picker size
            majorPicker: {},
            minorPicker: {},
            opacityPicker: {},

            pickerOpen: (this.embed) ? true : false,
            animationProcessing: false,
            pickerPosition: {
                right: false,
                bottom: false
            },
            paletteOpen: false
        };
    },
    created() {
        this.init();
    },
    methods: {
        /**
         * Loads the picker.
         */
        init() {
            // size
            if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && !this.embed) {
                this.size_ = 'small';
            }

            if(this.size_ == 'small') {
                this.majorPicker.width = 125;
                this.majorPicker.height = 125;
                this.minorPicker.width = 20;
                this.minorPicker.height = 125;
            } else if(this.size_ == 'medium') {
                this.majorPicker.width = 175;
                this.majorPicker.height = 175;
                this.minorPicker.width = 30;
                this.minorPicker.height = 175;
            } else {
                this.majorPicker.width = 250;
                this.majorPicker.height = 250;
                this.minorPicker.width = 30;
                this.minorPicker.height = 250;
            }
            this.majorPicker.subtractedValue = 9;
            this.minorPicker.subtractedValue = 7;

            if(this.allowOpacity) {
                this.opacityPicker.width = this.minorPicker.width;
                this.opacityPicker.height = this.minorPicker.height;
                this.opacityPicker.subtractedValue = this.minorPicker.subtractedValue;
            }

            if(!this.color_ && !this.allowClearColor) {
                if(this.colorFormat == 'hex') { this.color_ = '#FF0000'; }
                else if(this.colorFormat == 'rgb') { this.color_ = 'rgb(255,0,0)'; }
                else if(this.colorFormat == 'rgba') { this.color_ = 'rgba(255,0,0,1)'; }
                else if(this.colorFormat == 'hsl') { this.color_ = 'hsl(0,100%,50%)'; }
                else if(this.colorFormat == 'hsla') { this.color_ = 'hsla(0,100%,50%,1)'; }
            }

            var rgbaColor = {},
                isDark;
            if(this.color_) {
                var rgbaColorElm = document.createElement('div');
                rgbaColorElm.style.display = 'none';
                document.body.appendChild(rgbaColorElm);
                rgbaColor = this.getRgbaValue(this.color_, rgbaColorElm);
                document.body.removeChild(rgbaColorElm);

                this.color_ = this.convertColor(rgbaColor).value;
                isDark = this.isDark(rgbaColor);
            } else {
                rgbaColor = {
                    r: 255,
                    g: 255,
                    b: 255,
                    a: 1
                };
                isDark = true;
            }
            this.rgbaColor = rgbaColor;
            this.initialColor = this.color_;
            this.isDarkCurrent = isDark;
            this.isDarkInitial = (rgbaColor.a < 0.4) ? true : isDark;
        },

        /**
         * Converts any color type to RGBA by using the getComputedStyle method.
         *
         * @param {String} color
         * @param {HTML Element} RgbaColorElm
         * @retuns {Object}
         */
        getRgbaValue(color, rgbaColorElm=this.$refs.rgbaColor) {
            rgbaColorElm.style.background = color;

            var backgroundValue = window.getComputedStyle(rgbaColorElm, false, null).getPropertyValue('background-color'),
                rgba = backgroundValue.replace(/^(rgb|rgba)\(/,'').replace(/\)$/,'').replace(/\s/g,'').split(',');

            rgba = {
                r: parseInt(rgba[0]),
                g: parseInt(rgba[1]),
                b: parseInt(rgba[2]),
                a: (rgba[3]) ? parseFloat(rgba[3]) : 1
            };

            return rgba;
        },

        /**
         * Converts and returns the current color according to the selected format that user has chosen.
         *
         * @param {Object} rgba
         * @returns {Object}
         */
        convertColor(rgba) {
            var {r, g, b, a} = rgba;

            if(a == 1 || !this.allowOpacity) {
                if(this.colorFormat == 'hex') {
                    return {
                        value: this.rgbTohex({r, g, b})
                    };
                } else if(this.colorFormat == 'rgb') {
                    return {
                        value:`rgb(${r}, ${g}, ${b})`, r, g, b
                    };
                } else if(this.colorFormat == 'rgba') {
                    return {
                        value:`rgba(${r}, ${g}, ${b}, 1)`, r, g, b, a:1
                    };
                } else {
                    var {h, s, l} = this.rgbTohsl({r, g, b});
                    if(this.colorFormat == 'hsl') {
                        return {
                            value:`hsl(${h}, ${s}%, ${l}%)`, h, s, l
                        };
                    } else {
                        return {
                            value:`hsla(${h}, ${s}%, ${l}%, 1)`, h, s, l, a:1
                        };
                    }
                }
            } else {
                if(this.colorFormat != 'hsl' && this.colorFormat != 'hsla') {
                    return {
                        value:`rgba(${r}, ${g}, ${b}, ${a})`, r, g, b, a
                    };
                } else {
                    var {h, s, l} = this.rgbTohsl({r, g, b});
                    return {
                        value:`hsla(${h}, ${s}%, ${l}%, ${a})`, h, s, l, a
                    };
                }
            }
        },

        /**
         * Sets the new color.
         *
         * @param {Object} rgba
         * @param {Boolean} pickerUpdate
         * @param {Boolean} inputUpdate
         * @param {Boolean} eventCall
         */
        setColor(rgba, pickerUpdate, inputUpdate, eventCall=true) {
            var color = this.convertColor(rgba);

            if(this.color_ != color.value) {
                this.color_ = color.value;
                this.rgbaColor = rgba;
                this.isDarkCurrent = this.isDark(rgba);
                this.pickerUpdate = pickerUpdate;
                this.inputUpdate = inputUpdate;

                if(eventCall) {
                    this.onChanged();
                }
            }
        },

        /**
         * Clears the color.
         */
        clearColor() {
            if(this.color_) {
                this.color_ = null;
                this.rgbaColor = {
                    r: 255,
                    g: 255,
                    b: 255,
                    a: 1
                };
                this.isDarkCurrent = true;
                this.pickerUpdate = true;
                this.inputUpdate = true;

                this.onChanged();
            }
        },

        /**
         * Sets the initial color as the current color.
         */
        setInitialColorAsColor() {
            if(this.color_ != this.initialColor) {
                if(this.initialColor) {
                    var rgba = this.getRgbaValue(this.initialColor);
                    this.setColor(rgba, true, true);
                } else {
                    this.clearColor();
                }
            }
        },

        /**
         * Shows the color picker.
         */
        openPicker() {
            if(!this.pickerOpen && !this.animationProcessing) {
                this.animationProcessing = true;
                this.pickerOpen = true;
            }
        },

        /**
         * Hides the picker if the click target is not the picker itself.
         *
         * @param {Object} event
         * @param {Boolean} pass
         */
        closePicker(event, pass=false) {
            if(((event && !this.$refs.container.contains(event.target)) || pass) && !this.animationProcessing) {
                this.animationProcessing = true;

                if(!this.embed) {
                    window.removeEventListener('resize', this.setPosition, true);

                    if(!this.showButtons) {
                        document.removeEventListener('mousedown', this.closePicker, true);
                        document.removeEventListener('touchstart', this.closePicker, true);
                    }
                }

                this.onClose();
                this.pickerOpen = false;
            }
        },

        /**
         * Set the picker's position.
         */
        setPosition() {
            var rect = this.$refs.main.getBoundingClientRect(),
                left = rect.left + window.pageXOffset,
                top = rect.top + window.pageYOffset,
                x = left + this.$refs.container.offsetWidth + 10,
                _x = left - this.$refs.container.offsetWidth,
                y = top + this.$refs.container.offsetHeight + 40,
                _y = top - (this.$refs.container.offsetHeight + 10),
                w = window.innerWidth + window.pageXOffset,
                h = window.innerHeight + window.pageYOffset,
                right = false,
                bottom = false;

            if (x >= w && _x > 0) {
                right = true;
            }

            if (y >= h && _y > 0) {
                bottom = true;
            }

            this.pickerPosition = {
                right,
                bottom
            };
        },

        containerEnter(elm, done) {
            if(!this.embed) {
                elm.classList.add('cdp-visibility-hidden');
                this.setPosition();
                elm.classList.remove('cdp-visibility-hidden');

                window.addEventListener('resize', this.setPosition, true);

                if(!this.showButtons) {
                    document.addEventListener('mousedown', this.closePicker, true);
                    document.addEventListener('touchstart', this.closePicker, true);
                }
            }

            this.onOpen();
            this.opacityAnimation(elm, true)
            .then(() => {
                this.animationProcessing = false;
                done();
            });
        },
        containerLeave(elm, done) {
            this.opacityAnimation(elm, false)
            .then(() => {
                this.animationProcessing = false;
                done();
            });
        },

        paletteEnter(elm, done) {
            this.opacityAnimation(elm, true)
            .then(done);
        },
        paletteLeave(elm, done) {
            this.opacityAnimation(elm, false)
            .then(done);
        },

        /**
         * Returns the current color.
         *
         * @returns {Object}
         */
        get() {
            return (!this.color_) ? {value:null} : this.convertColor(this.rgbaColor);
        },

        /**
         * Sets a new color.
         *
         * @param {String} newColor
         */
        set(newColor) {
            if(!newColor && this.allowClearColor) {
                this.clearColor();
            } else if(!newColor) {
                newColor = this.color_;
            } else {
                var rgba = this.getRgbaValue(newColor);
                this.setColor(rgba, true, true);
            }
        },

        /**
         * Shows the picker.
         */
        show() {
            this.openPicker();
        },

        /**
         * Hides the picker.
         */
        hide() {
            if(this.pickerOpen) {
                this.closePicker(null, true);
            }
        },

        /**
         * Sets the current color as initial color and fires the save callback.
         */
        save() {
            this.initialColor = this.color_;
            this.isDarkInitial = (this.rgbaColor.a < 0.4) ? true : this.isDarkCurrent;

            if(!this.embed) {
                this.hide();
            }

            this.onSave();
        },

        /**
         * Sets initial color as current color and fires the cancel callback.
         */
        cancel() {
            this.setInitialColorAsColor();

            if(!this.embed) {
                this.hide();
            }

            this.onCancel();
        }
    }
};
</script>