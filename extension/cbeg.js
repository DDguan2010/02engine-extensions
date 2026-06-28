(function (Scratch) {
    class CBEGExtension {
        getInfo () {
            return {
                id: 'cbeg',
                name: 'CB Extension Gallery',
                blocks: [
                    {
                        func: 'openGallery',
                        blockType: Scratch.BlockType.BUTTON,
                        text: '打开 CB Extension Gallery'
                    },
                    {
                        opcode: 'openGalleryCommand',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '打开 CB Extension Gallery'
                    },
                    {
                        opcode: 'getGalleryUrl',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'CB Extension Gallery 链接'
                    }
                ]
            };
        }

        openGallery () {
            window.open('https://chessbrain.qzz.io/CB-ExtGallary/', '_blank');
        }

        openGalleryCommand () {
            this.openGallery();
        }

        getGalleryUrl () {
            return 'https://chessbrain.qzz.io/CB-ExtGallary/';
        }
    }

    Scratch.extensions.register(new CBEGExtension());
})(Scratch);
