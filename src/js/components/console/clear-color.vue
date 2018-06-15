<template>
    <div class="cdp-clear-color" :class="{'cdp-dark':isDark || rgbaColor.a < 0.4}" @click="clearColor">
        <i class="cdp-icons"></i>
    </div>
</template>

<script>
export default {
    name: 'ClearColor',
    props: ['rgbaColor', 'isDark', 'clearColor']
};
</script>