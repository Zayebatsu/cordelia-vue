export default {
    size: {
        type: String,
        default: 'medium'
    },
    embed: {
        type: Boolean,
        default: true
    },
    pickerStyle: {
        type: Number,
        default: 0
    },
    allowOpacity: {
        type: Boolean,
        default: true
    },
    allowClearColor: {
        type: Boolean,
        default: false
    },
    showColorValue: {
        type: Boolean,
        default: true
    },
    colorFormat: {
        type: String,
        default: 'hex'
    },
    color: {
        type: String,
        default: '#FF0000'
    },
    showButtons: {
        type: Boolean,
        default: true
    },
    showPalette: {
        type: Boolean,
        default: true
    },
    paletteColors: {
        type: Array,
        default: () => ['#FFFFB5', '#FBBD87', '#F45151', '#7AEA89', '#91C8E7', '#8EB4E6', '#B0A7F1']
    },
    allowPaletteAddColor: {
        type: Boolean,
        default: true
    },
    onOpen: {
        type: Function,
        default: () => {}
    },
    onClose: {
        type: Function,
        default: () => {}
    },
    onSave: {
        type: Function,
        default: () => {}
    },
    onCancel: {
        type: Function,
        default: () => {}
    },
    onChanged: {
        type: Function,
        default: () => {}
    }
};