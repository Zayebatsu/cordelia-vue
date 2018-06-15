export default {
    props: ['init', 'color', 'rgbaColor', 'isDark', 'pickerUpdate', 'picker'],
    data() {
        return {
            dragger: {
                left: 0,
                top: 0
            }
        };
    },
    watch: {
        init() {
            this.setPosition();
        },
        color() {
            if(this.pickerUpdate) {
                this.setPosition();
            }
        }
    },
    methods: {
        pickerClicked(e, dragStatus) {
            this.$emit('pickerClicked', e, dragStatus);
        }
    }
};