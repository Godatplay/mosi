class ErrorOverlay extends Component {
    render({ errorMessage, closeOverlay }) {
        return overlay({ closeOverlay, header: 'oh no' }, [
            div({}, errorMessage),
            button({ onclick: closeOverlay, className: 'initial-focus' }, 'ok :(')
        ])
    }
}

class RemoveOverlay extends Component {
    render({ remove, closeOverlay, header, fileType }) {
        return overlay({ closeOverlay, header }, [
            row([
                button({ onclick: remove, className: 'initial-focus' }, 'yes!'),
                button({ onclick: closeOverlay }, 'no, keep it')
            ])
        ])
    }
}

class ImportOverlay extends Component {
    render({ onImport, closeOverlay, header, fileType, hideTextImport }) {
        let textImport = hideTextImport ? null :
            div({ className: 'content' }, [
                textarea({
                    value: '',
                    className: 'initial-focus',
                    ref: node => { this.textarea = node }
                }),
                button({ onclick: () => onImport(this.textarea.value) }, 'import from text'),
                h('hr')
            ])

        let fileImport = div({}, [
            div({}, 'import from file:'),
            fileinput({ onUpload: onImport, fileType })
        ])

        return overlay({ closeOverlay, header }, [ textImport, fileImport ])
    }
}

class ExportOverlay extends Component {
    render({ data, closeOverlay, header, fileName }) {
        let textExport = div({ className: 'content' }, [
            textarea({
                value: data,
                ref: node => { this.textarea = node }
            }),
            button({
                className: 'initial-focus',
                onclick: () => {
                    this.textarea.select()
                    document.execCommand('copy')
                }
            }, 'copy text'),
            h('hr')
        ])

        let fileExport = div({}, [
            button({
                onclick: () => Files.download(fileName, data)
            }, 'download file')
        ])

        return overlay({ closeOverlay, header }, [ textExport, fileExport ])
    }
}

class ShareOverlay extends Component {
    render({ closeOverlay, world }) {
        let downloadButton = div({}, [
            button({
                onclick: () => {
                    let template = window.resources['export-template.html']
                    let data = Files.fillTemplate(template, {
                        'TITLE': world.name || 'untitled',
                        'GAME_SCRIPT': window.resources['game.js'],
                        'TEXT_SCRIPT': window.resources['text.js'],
                        'GAME_DATA': World.export(world)
                    })
                    let filename = (world.name || 'untitled') + '.html'
                    Files.download(filename, data)
                }
            }, 'download game file')
        ])

        return overlay({ closeOverlay, header: 'share' }, [
            downloadButton
        ])
    }
}

class RoomGifOverlay extends Component {
    constructor() {
        super()
        this.state = {
            scale: 2,
            imageUri: null
        }

        this.updateGif = (scale) => {
            this.setState({ scale })
            let { createGif, colorList } = this.props
            createGif(scale, colorList, blob => {
                let imageUri = URL.createObjectURL(blob)
                this.setState({ imageUri })
            })
        }
    }

    componentDidMount() {
        this.updateGif(2)
    }

    render({ closeOverlay }, { scale, imageUri }) {
        let gif = imageUri ? img({ src: imageUri }) : null

        let scaleTextbox = label({}, [
            span({}, 'image scale'),
            numbox({ value: scale, min: 1, max: 4, onchange: e => this.updateGif(parseInt(e.target.value)) })
        ])

        return overlay({ closeOverlay, header: 'create gif' }, [
            div({}, gif),
            div({}, [ scaleTextbox ]),
        ])
    }
}

class SpriteListOverlay extends Component {
    render({ closeOverlay }) {
        return overlay({ closeOverlay, header: 'choose sprite' }, [
            h(SpriteList, this.props)
        ])
    }
}

class RoomPickerOverlay extends Component {
    render({ closeOverlay }) {
        this.props.className = 'initial-focus'
        return overlay({ closeOverlay, header: 'choose room' }, [
            h(WorldGrid, this.props)
        ])
    }
}

class TilePickerOverlay extends Component {
    render({ closeOverlay }) {
        this.props.className = 'initial-focus'
        this.props.showBackground = true
        this.props.isAnimated = true
        return overlay({ closeOverlay, header: 'choose tile' }, [
            h(RoomGrid, this.props)
        ])
    }
}

class NewWorldOverlay extends Component {
    constructor({ worldWidth, worldHeight, roomWidth, roomHeight, spriteWidth, spriteHeight }) {
        super()
        this.state = {
            worldWidth, worldHeight, roomWidth, roomHeight, spriteWidth, spriteHeight,
            randomStart: true
        }
    }
    render({ createWorld, closeOverlay }, { worldWidth, worldHeight, roomWidth, roomHeight, spriteWidth, spriteHeight, randomStart, showConfirmOverlay }) {

        let randomStartButton = button({
            className: 'toggle' + (randomStart ? ' selected' : ''),
            onclick: () => this.setState({ randomStart: !randomStart })
        }, 'randomize world')

        let createWorldButton = button({
            onclick: () => this.setState({ showConfirmOverlay: true })
        }, 'create world')

        let confirmOverlay = !showConfirmOverlay ? null :
            h(RemoveOverlay, {
                header: 'replace current world?',
                closeOverlay: () => this.setState({ showConfirmOverlay: false }),
                remove: () => {
                    createWorld(this.state)
                    this.setState({ showConfirmOverlay: false })
                }
            })

        return overlay({ closeOverlay, header: 'new world' }, [
            row([
                span({}, 'world size'),
                numbox({
                    value: worldWidth,
                    min: 1,
                    max: 24,
                    onchange: e => this.setState({ worldWidth: parseInt(e.target.value) })
                }),
                span({}, '×'),
                numbox({
                    value: worldHeight,
                    min: 1,
                    max: 24,
                    onchange: e => this.setState({ worldHeight: parseInt(e.target.value) })
                })
            ]),
            row([
                span({}, 'room size'),
                numbox({
                    value: roomWidth,
                    min: 1,
                    max: 24,
                    onchange: e => this.setState({ roomWidth: parseInt(e.target.value) })
                }),
                span({}, '×'),
                numbox({
                    value: roomHeight,
                    min: 1,
                    max: 24,
                    onchange: e => this.setState({ roomHeight: parseInt(e.target.value) })
                })
            ]),
            row([
                span({}, 'sprite size'),
                numbox({
                    value: spriteWidth,
                    min: 1,
                    max: 24,
                    onchange: e => this.setState({ spriteWidth: parseInt(e.target.value) }) }),
                span({}, '×'),
                numbox({
                    value: spriteHeight,
                    min: 1,
                    max: 24,
                    onchange: e => this.setState({ spriteHeight: parseInt(e.target.value) }) })
            ]),
            div({}, randomStartButton),
            h('hr'),
            div({}, createWorldButton),
            confirmOverlay
        ])
    }
}