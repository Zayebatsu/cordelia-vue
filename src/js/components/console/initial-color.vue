<template>
    <div class="cdp-initial-color" :class="{'cdp-dark':isDark}" :style="{background:color}" @click="setInitialColorAsColor">
        <i class="cdp-icons"></i>
    </div>
</template>

<script>
export default {
    name: 'InitialColor',
    props: ['color', 'isDark', 'setInitialColorAsColor']
}
</script>