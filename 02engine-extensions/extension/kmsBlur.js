(function(){

    //不要动这两行神秘const
    const { 
        vm: { 
            runtime: { renderer } 
        }
        ,BlockType 
        ,ArgumentType
    } = Scratch

    const runtime = vm.runtime

    const BLOCK_ICON_URI = 'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxMjMuMDE4NTciIGhlaWdodD0iNzcuODM1NDEiIHZpZXdCb3g9IjAsMCwxMjMuMDE4NTcsNzcuODM1NDEiPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xODAuMjQ3NDcsLTEzNi41ODExNykiPjxnIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIj48cGF0aCBkPSJNMjE1LjkyMTY0LDE1NS44MjE0OWwtMjguNDI0MTYsMTguNzg4MTUiIHN0cm9rZT0iIzhjOWJmZiIgc3Ryb2tlLXdpZHRoPSIxNC41Ii8+PHBhdGggZD0iTTIxMS4zNzUzNywxOTguOTE1NDlsLTIzLjg3Nzg5LC0yNC4zMDU4NCIgc3Ryb2tlPSIjOGM5YmZmIiBzdHJva2Utd2lkdGg9IjE0LjUiLz48cGF0aCBkPSJNMjExLjM3NTM3LDE5OC45MTU0OWwtMjMuODc3ODksLTI0LjMwNTg0IiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iNC41Ii8+PHBhdGggZD0iTTIxNS45MjE2NCwxNTUuODIxNDlsLTI4LjQyNDE2LDE4Ljc4ODE1IiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iNC41Ii8+PGc+PHBhdGggZD0iTTI1NC40NjkyMSwxNDMuODMxMTdsLTI1LjE0NjMxLDYzLjMzNTQxIiBzdHJva2U9IiM4YzliZmYiIHN0cm9rZS13aWR0aD0iMTQuNSIvPjxwYXRoIGQ9Ik0yNTQuNDY5MjEsMTQzLjgzMTE3bC0yNS4xNDYzMSw2My4zMzU0MSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjQuNSIvPjwvZz48cGF0aCBkPSJNMjY5LjUzMDM2LDE1Ny4yMDg5OWwyNi40ODU2OCwyMS40MzQ0NiIgc3Ryb2tlPSIjOGM5YmZmIiBzdHJva2Utd2lkdGg9IjE0LjUiLz48cGF0aCBkPSJNMjY5LjkxMTQ3LDIwMC41NDA0NWwyNi4xMDQ1OCwtMjEuODk3IiBzdHJva2U9IiM4YzliZmYiIHN0cm9rZS13aWR0aD0iMTQuNSIvPjxwYXRoIGQ9Ik0yNjkuOTExNDcsMjAwLjU0MDQ1bDI2LjEwNDU4LC0yMS44OTciIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSI0LjUiLz48cGF0aCBkPSJNMjY5LjUzMDM2LDE1Ny4yMDg5OWwyNi40ODU2OCwyMS40MzQ0NiIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjQuNSIvPjwvZz48L2c+PC9zdmc+PCEtLXJvdGF0aW9uQ2VudGVyOjU5Ljc1MjUyNDk5OTk5OTk5OjQzLjQxODgzMDAwMDAwMDAxNC0tPg=='

    const SKINTYPES = {
        SVG:"",
        BITMAP:"r",
        TEXTCOSTUME:"TextCostumeSkin"
    }

    class kmsBlur3{
        constructor(){
            this.blurMap = new Map()
            this.blurValueMap = new Map()
            this.originalSkins = new Map()
            /**
             * 
             * blurMap数据存储结构
             *   key: 原图的drawableID
             *   value: 用于模糊的skin对象的id
             * 
             * blurValueMap数据存储结构
             *   key: drawableID
             *   value: {
             *      blur:模糊值
             *      skin:skin对象
             *  }
             * 
             * originalSkins数据存储结构
             *   key: 原图的drawableID
             *   value: 原图的skin对象
             * 
             */
            runtime.on("PROJECT_STOP",this.clearCache.bind(this))

        }
        


        getInfo(){
            return {
                name: "𝙆𝙢𝙨 𝘽𝙡𝙪𝙧",
                id: "kmsBlur",
                color1:'#668cff',
                color2:'#3d6dff',
                color3:'#7c9dff',
                blockIconURI:BLOCK_ICON_URI,
                blocks:[
                    {
                        opcode:"setBlur",
                        blockType:BlockType.COMMAND,
                        text:"设定模糊为[blur]px",
                        arguments:{
                            blur:{
                                type:ArgumentType.NUMBER,
                                defaultValue:5
                            }
                        }
                    },
                    {
                        opcode:"getBlur",
                        blockType:BlockType.REPORTER,
                        text:"当前模糊值(px)",
                    },
                    {
                        opcode:"changeBlur",
                        blockType:BlockType.COMMAND,
                        text:"增加模糊值[blur]px",
                        arguments:{
                            blur:{
                                type:ArgumentType.NUMBER,
                                defaultValue:5
                            }
                        }
                    },
                    {
                        opcode:"returnOriginal",
                        blockType:BlockType.COMMAND,
                        text:"还原图像",
                    },
                    {
                        blockType:BlockType.LABEL,
                        text:"如果你不知道你在做什么，千万不要使用以下积木！"
                    },
                    {
                        opcode:"clearCache",
                        blockType:BlockType.COMMAND,
                        text:"清除缓存",
                    }
                ]
            }
        }
        _colorData2Canvas(data,width,height){
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            canvas.getContext('2d')
            .putImageData(new ImageData(data, width, height), 0, 0)
            return canvas
        }
        _getKeyOfMap(map,value){
            for (const [key, v] of map) {
                if (v === value) {
                    return key
                }
            }
            return undefined
        }

        setBlur(args,util){
            let target = util.target
            ,originalDrawbleID = this._getKeyOfMap(this.blurMap,renderer._allDrawables[target.drawableID].skin.id) || target.drawableID
            ,originalSkin = this.originalSkins.get(target.drawableID) || renderer._allDrawables[originalDrawbleID].skin
            ,skin = this.blurMap.get(originalDrawbleID)
            
            //如果在设定模糊的过程中切换角色了 需要重新设定正确的键值
            if(this.blurMap.get(target.drawableID) != renderer._allDrawables[target.drawableID].skin.id){
                originalDrawbleID = target.drawableID
                originalSkin = renderer._allDrawables[originalDrawbleID].skin
                skin = this.blurMap.get(originalDrawbleID)
                this.originalSkins.set(target.drawableID,originalSkin) //将目前的skin更新到表中, 因为之前的表的原图skin已经无效了
            }

            let {_colorData,_width,_height,_lazyData} = originalSkin._silhouette
            let imageData = _lazyData || this._colorData2Canvas(_colorData, _width, _height)
            ,rotationCenter = originalSkin._rotationCenter

            let canvas = document.createElement('canvas')

            let ctx = canvas.getContext('2d')
            canvas.width = originalSkin.size[0] * 3
            canvas.height = originalSkin.size[1] * 3
            ctx.filter = `blur(${args.blur}px)`
            ctx.drawImage(
                imageData,
                originalSkin.size[0] * .5,
                originalSkin.size[1] * .5,
                originalSkin.size[0] * 2,
                originalSkin.size[1] * 2
            )

            rotationCenter = rotationCenter.map((v,i) => v - originalSkin.size[i] * .5 + [canvas.width,canvas.height][i] /4 )

            if(!skin){
                skin = renderer.createBitmapSkin(canvas, 2, rotationCenter)
                this.blurMap.set(originalDrawbleID, skin)
                this.originalSkins.set(target.drawableID,originalSkin)
                renderer._allSkins[skin].kmsBlur = true
            }else{
                renderer.updateBitmapSkin(skin, canvas, 2, rotationCenter)
            }

            this.blurValueMap.set(target.drawableID, {
                blur:args.blur,
                skin:originalSkin.id
            })

            renderer.updateDrawableSkinId(target.drawableID, skin)
            runtime.requestRedraw()
        }
        getBlur(args,util){
            return this.blurValueMap.get(util.target.drawableID)?.blur || 0
        }
        changeBlur(args,util){
            this.setBlur({
                blur:parseFloat(
                    (
                        ( +this.getBlur({},util) ) + ( +args.blur )
                    ).toFixed(10)
                )
            },util)
        }
        returnOriginal(args,util){
            let target = util.target
            ,drawableID = target.drawableID
            ,skin = renderer._allDrawables[drawableID].skin
            ,originalID = this.originalSkins.get(drawableID)?.id

            if(!originalID) return

            let r = this.blurValueMap.get(drawableID)
            r.blur = 0

            renderer.updateDrawableSkinId(drawableID, originalID)
            runtime.requestRedraw()
        }
        clearCache(){
            //还原所有角色至原图
            for(let target of runtime.targets){
                this.returnOriginal({},{target})
            }
            runtime.requestRedraw()
            for(let [drawableID,skin] of this.blurMap){
                renderer.destroySkin(skin)
            }
            this.blurMap.clear()
            this.blurValueMap.clear()
            this.originalSkins.clear()
        }
    }
    Scratch.extensions.register(runtime.kmsBlur = new kmsBlur3())
})()