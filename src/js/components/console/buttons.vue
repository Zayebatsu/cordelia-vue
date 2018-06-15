<template>
    <div class="cdp-button-container">
        <div class="cdp-button" cdp-function="save" @click="save">
            <i class="cdp-icons"></i>
            SAVE
        </div>
        <div class="cdp-button" cdp-function="cancel" @click="cancel">
            <i class="cdp-icons"></i>
            CANCEL
        </div>
    </div>
</template>

<script>
export default {
    name: 'Buttons',
    props: ['save', 'cancel']
};
</script>