<template>
    <input type="text" spellCheck="false" v-model="color_" class="cdp-current-color" :class="{'cdp-dark':isDark || rgbaColor.a < 0.4}" @change="change" />
</template>

<script>
export default {
    name: 'ColorInput',
    props: ['color', 'rgbaColor', 'isDark', 'inputUpdate', 'getRgbaValue', 'convertColor', 'setColor'],
    data() {
        return {
            color_: this.color
        };
    },
    watch: {
        color() {
            if(this.inputUpdate) {
                this.color_ = this.color;
            }
        }
    },
    methods: {
        change(e) {
            if(e.target.value.trim()) {
                var rgba = this.getRgbaValue(e.target.value);
                this.setColor(rgba, true, false);
            }
        }
    }
};
</script>