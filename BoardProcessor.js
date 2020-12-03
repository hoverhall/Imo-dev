import { app } from 'core/app';
import { Draw } from 'core/components/Draw';
import { utils } from 'core/utils';

export default class {
    constructor (proto) {
        this.board = proto;
        this.expandWild = new ExpandWild(this.board)
        this.scarabWild = new ScarabWild(this.board)
        this.stoneMultiplier = new StoneMultiplier(this.board)
    }
}

class Processor {
    promiseReducer(list, func, await_=false) {
        return new Promise((res) => {
            for (let i = 0; i < list.length; i++) {
                let list_item = list[i]
                // if (await_) {
                //     await func(list_item, i, list)
                // } else {
                    func(list_item, i, list)
                // }
                if (i + 1 === list.length) {
                    res()
                }
            }
        })
    }
}

class ExpandWild extends Processor {
    constructor (proto) {
        super()
        this.board = proto;
    }

    createMask() {
        this.board.ew_cache = []
        return new Promise(res => {
            let promise = Promise.resolve()
            this.board.ew_container = new PIXI.Container()
            this.board.ew_container.position.set(ew_container_pos.position.x, ew_container_pos.position.y)
            this.board.root.addChild(this.board.ew_container)

            Promise.resolve()
                .then(() => {
                    return this.add(app.model.data['game.spins.expand_wild.initial_col'])
                        .then(() => this.replace(app.model.data['game.spins.expand_wild.initial_col'], 1e3))
                })
                .then(() => {
                    if (app.model.data['game.spins.expand_wild.additional_cols']) {
                        return new Promise(res_ => {
                            let add_cols = app.model.data['game.spins.expand_wild.additional_cols'].map((ew_index, index, list) => {
                                promise = promise.then(() =>
                                    this.add(ew_index)
                                    .then(() => this.replace(ew_index), 1e3))
                                list.length === index + 1 && promise.then(() => res_())
                            })
                        })
                    } else {
                        return;
                    }
                })
                .then(() => {
                    return promise
                })
                .then(() => res())
        })
    }

    destroyMask() {
        this.hide().then(() => {
            this.board.ew_container.removeFromParent()
            this.board.ew_container = null

            this.board.ew_1 = null
            this.board.ew_2 = null
            this.board.ew_3 = null
            this.board.ew_4 = null
            this.board.ew_5 = null
        }).catch(() => {})
    }
     
    replace() {
        switch (index) {
            case 0:
                this.board.ew_1.removeFromParent()
                this.board.ew_1 = this.board.ew_container.addChild(Draw.buildSpine('wild_expand', true, 'short_cycle'))
                this.board.ew_1.position.set(ew_container_pos.ew_pos.x, ew_container_pos.ew_pos.y)
                this.board.ew_cache.push(this.board.ew_1)
                return Promise.resolve()
                    .then(() => utils.wait(wait))
            case 1:
                this.board.ew_2.removeFromParent()
                this.board.ew_2 = this.board.ew_container.addChild(Draw.buildSpine('wild_expand', true, 'short_cycle'))
                this.board.ew_2.position.set(ew_container_pos.ew_pos.x * 3, ew_container_pos.ew_pos.y)
                this.board.ew_cache.push(this.board.ew_2)
                return Promise.resolve()
                    .then(() => utils.wait(wait))
            case 2:
                this.board.ew_3.removeFromParent()
                this.board.ew_3 = this.board.ew_container.addChild(Draw.buildSpine('wild_expand', true, 'short_cycle'))
                this.board.ew_3.position.set(ew_container_pos.ew_pos.x * (3 + 2), ew_container_pos.ew_pos.y)
                this.board.ew_cache.push(this.board.ew_3)
                return Promise.resolve()
                    .then(() => utils.wait(wait))
            case 3:
                this.board.ew_4.removeFromParent()
                this.board.ew_4 = this.board.ew_container.addChild(Draw.buildSpine('wild_expand', true, 'short_cycle'))
                this.board.ew_4.position.set(ew_container_pos.ew_pos.x * (3 + 4), ew_container_pos.ew_pos.y)
                this.board.ew_cache.push(this.board.ew_4)
                return Promise.resolve()
                    .then(() => utils.wait(wait))
            case 4:
                this.board.ew_5.removeFromParent()
                this.board.ew_5 = this.board.ew_container.addChild(Draw.buildSpine('wild_expand', true, 'short_cycle'))
                this.board.ew_5.position.set(ew_container_pos.ew_pos.x * (3 + 6), ew_container_pos.ew_pos.y)
                this.board.ew_cache.push(this.board.ew_5)
                return Promise.resolve()
                    .then(() => utils.wait(wait))
        }
    }

    add() {
        app.camera.shake(3, 0.2, false, true)
        switch (index) {
            case 0:
                this.board.ew_1 = this.board.ew_container.addChild(Draw.buildSpine('wild_expand', true, 'short_boom', { loop: false }))
                this.board.ew_1.position.set(ew_container_pos.ew_pos.x, ew_container_pos.ew_pos.y)
                return new Promise(res => {
                    this.board.ew_1.state.addListener({
                        complete: entry => {
                            res()
                        }
                    })
                })
            case 1:
                this.board.ew_2 = this.board.ew_container.addChild(Draw.buildSpine('wild_expand', true, 'short_boom', { loop: false }))
                this.board.ew_2.position.set(ew_container_pos.ew_pos.x * 3, ew_container_pos.ew_pos.y)
                return new Promise(res => {
                    this.board.ew_2.state.addListener({
                        complete: entry => {
                            res()
                        }
                    })
                })
            case 2:
                this.board.ew_3 = this.board.ew_container.addChild(Draw.buildSpine('wild_expand', true, 'short_boom', { loop: false }))
                this.board.ew_3.position.set(ew_container_pos.ew_pos.x * (3 + 2), ew_container_pos.ew_pos.y)
                return new Promise(res => { 
                    this.board.ew_3.state.addListener({
                        complete: entry => {
                            res()
                        }
                    })
                })
            case 3:
                this.board.ew_4 = this.board.ew_container.addChild(Draw.buildSpine('wild_expand', true, 'short_boom', { loop: false }))
                this.board.ew_4.position.set(ew_container_pos.ew_pos.x * (3 + 4), ew_container_pos.ew_pos.y)
                return new Promise(res => {
                    this.board.ew_4.state.addListener({
                        complete: entry => {
                            res()
                        }
                    })
                })
            case 4:
                this.board.ew_5 = this.board.ew_container.addChild(Draw.buildSpine('wild_expand', true, 'short_boom', { loop: false }))
                this.board.ew_5.position.set(ew_container_pos.ew_pos.x * (3 + 6), ew_container_pos.ew_pos.y)
                return new Promise(res => {
                    this.board.ew_5.state.addListener({
                        complete: entry => {
                            res()
                        }
                    })
                })
        }
    }

    hide() {
        if (typeof this.board.ew_cache !== 'undefined') {
            // console.log(this.board.ew_cache)
            return new Promise(res => {
                this.board.ew_cache.forEach((item, index, list) => {
                    createjs.Tween.get(item)
                        .to({ alpha: 0 }, 100)
                        .call(() => res());
                })
            })
        } else {
            return Promise.reject()
        }
    }
}

class ScarabWild extends Processor {
    constructor (proto) {
        super()
        this.board = proto;
    }

    remove() {
        if (typeof this.board.removeList !== 'undefined') {
            return this.promiseReducer(this.board.removeList, (item) => {
                // console.log(item)
                item.removeFromParent()
            })
        } else {
            return
        }
    }

    add() {
        let allawAdd = false;
        return Promise.resolve()
            .then(() => {
                let board = app.model.data['game.freespins.board']
                for (let i = 0; i < board.length; i++) {
                    for (let j = 0; j < board[i].length; j++) {
                        if (board[i][j] === 14) {
                            allawAdd = true;
                        }
                    }
                }
                return;
            })
            .then(() => {
                // console.log(allawAdd)
                if (allawAdd) {
                    this.board.removeList = []
                    // console.log('### Reels => addUpperLayerScarabWild')
                    return Promise.resolve()
                        .then(() => {
                                if (this.board.light) {
                                    this.board.light.removeFromParent()
                                    this.board.light = this.board.root.addChild(Draw.buildSpine('foreground', true, 'scarab_feature', { loop: true })) // 
                                } else {
                                    this.board.light = this.board.root.addChild(Draw.buildSpine('foreground', true, 'scarab_feature', { loop: true })) // 
                                }
                                let i = app.model.data['game.freespins.scarab_wild.initial_pos'][0]
                                let j = app.model.data['game.freespins.scarab_wild.initial_pos'][1]
    
                                this.board.head_scarab = this.board.upperLayerGameSymbols.addChild(Draw.buildSpine('wild_scarab', true, 'short_head_effect', { loop: true }))
                                this.board.main_scarab = this.board.upperLayerGameSymbols.addChild(Draw.buildSpine('wild_scarab', true, 'short', { loop: true }))
    
                                this.board.head_scarab.position.x = this.board.main_scarab.position.x = this.board.reels.reels[i].position.x + 293
                                this.board.head_scarab.position.y = this.board.main_scarab.position.y = j == 0 ? 180 : j == 1 ? 350 : j == 2 && 510
                                createjs.Tween.get(this.board.main_scarab)
                                    .to({ scaleX: 1.3, scaleY: 1.3 }, 250)
                                    .to({ scaleX: 1.15, scaleY: 1.15 }, 250)
                                    .to({ scaleX: 1.3, scaleY: 1.3 }, 250)
                                createjs.Tween.get(this.board.head_scarab)
                                    .to({ scaleX: 1.3, scaleY: 1.3 }, 250)
                                    .to({ scaleX: 1.15, scaleY: 1.15 }, 250)
                                    .to({ scaleX: 1.3, scaleY: 1.3 }, 250)
                                
                        })
                        .then(() => {
                            let promise = Promise.resolve()
                            let scarabs = app.model.data['game.freespins.scarab_wild.additional_pos']
                            let move_scarabs = []
                            let static_scarabs = []
                            promise = promise.then(() => {
                                return new Promise((res) => {
                                        for (let i = 0; i < scarabs.length; i++) {
                                            this.board.reels.reels.forEach((reel, index) => {
                                                reel.symbols.forEach((symbol, indexS) => {
                                                    if (index === scarabs[i][0] && indexS === scarabs[i][1]) {
                                                        let scarab = this.board.upperLayerGameSymbols.addChild(Draw.buildSpine('wild_scarab_new', true, 'short_cycle', { loop: true }))
                                                        scarab.position.x = reel.position.x + 245 + symbol.position.x
                                                        scarab.position.y = symbol.position.y + 166 + app.renderer.height + symbol.sprite.height / 2
                                                        scarab.leff = {
                                                            reel_id: index,
                                                            symbol_id: indexS
                                                        }
                                                        scarab.scale.set(2)
                                                        move_scarabs.push(scarab)
                                                    }
                                                })
                                            })
                                            if (i + 1 === scarabs.length) {
                                                res()
                                            }
                                        }
                                    })
                                    .then(() => {
                                        
                                    })
                                    .then(() => {
                                        return new Promise((res) => {
                                            move_scarabs.map((item) => {
                                                let rand = Math.round((Math.random() * 3 + 2) * 1000, 2)
                                                let way = Math.floor(Math.random() * 2) == 0 ? 1 : -1
                                                let startPos = item.position.x - 40
                                                item.position.x = way == 1 ? item.position.x : item.position.x - 80
                                                let endPosition = item.position.y - app.renderer.height
                                                let time = 5000
                                                let scarab_time = rand
                                                setTimeout(() => { res() }, 5000)
                                                createjs.Tween.get(item)
                                                    .setFPS(17)
                                                    .to({ y: endPosition }, rand)
                                                    .call(() => {
                                                        item.alpha = 0
                                                        let scarab_static = this.board.upperLayerGameSymbols.addChild(Draw.buildSpine('wild_scarab_new', true, 'short', { loop: false }))
                                                        new Promise(ress => {
                                                                scarab_static.position.x = startPos
                                                                scarab_static.position.y = item.position.y
                                                                scarab_static.scale.set(2)
                                                                scarab_static.state.addListener({
                                                                    complete: () => {
                                                                        ress()
                                                                    }
                                                                })
                                                            })
                                                            .then(() => {
                                                                let reels = this.board.reels.reels
                                                                for (let i = 0; i < reels.length; i++) {
                                                                    let symbols = reels[i].symbols
                                                                    for (let j = 1; j < symbols.length; j++) {
                                                                        let symbol = symbols[j]
                                                                        let symbol_pos = app.model.data['game.freespins.scarab_wild.additional_pos']
                                                                        for (let n = 0; n < symbol_pos.length; n++) {
                                                                            let pos = symbol_pos[n]
                                                                            if (i === item.leff.reel_id && j === item.leff.symbol_id + 1) {
                                                                                symbol.setId(14)
                                                                                app.model.data['game.freespins.board'][i][j - 1] = 14
                                                                                app.model.data['game.spins.board'][i][j - 1] = 14
                                                                                symbol.setStaticState()
                                                                                this.board.addSymbolMask(i, j, symbol)
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            })
                                                            .then(() => {
                                                                // scarab_static.removeFromParent()
                                                            })
                                                    })
                                                    .on('change', () => {
                                                        let syn = (scarab_time / 1000) * Math.sin(2 * Math.PI * (scarab_time / 1000))
                                                        // item.position.x = way == 0 ? item.position.x + syn : (item.position.x - 80) - syn;
                                                        item.position.x = way == 0 ? item.position.x + syn : item.position.x - syn;
                                                        
                                                        if (scarab_time == 0) {
                                                            createjs.Tween.get(item)
                                                            .to({x: startPos}, 300)
                                                        }
                                                        scarab_time = scarab_time > 0 ? scarab_time - 20 : 0
                                                    })
                                            })
                                        })
                                    })
                                    .then(() => {
                                        return new Promise((res_) => {
                                            move_scarabs.forEach((item, i) => {
                                                static_scarabs.push(item)
                                                item.state.addListener({
                                                    complete: entry => {
                                                        res_()
                                                    }
                                                })
                                            })
                                        })
                                    })
                                    .then(() => {
                                        static_scarabs.forEach((item) => {
                                            item.removeFromParent()
                                        })
                                    })
                            })
                            return promise
                        })
                        .then(() => {
                            return new Promise((res) => {
                                this.board.head_scarab.state.setAnimation(0, "short_head_effect", false)
                                this.board.main_scarab.state.loop = false
                                this.board.main_scarab.state.addListener({ complete: entry => {
                                    createjs.Tween.get(this.board.main_scarab)
                                        .to({ scaleX: 1, scaleY: 1 }, 250)
                                        .call(() => {
                                            this.board.light.state.addListener({ complete: entry => {
                                                this.board.light.alpha = 0
                                            }})
                                            let reels = this.board.reels.reels
                                            for (let i = 0; i < reels.length; i++) {
                                                let symbols = reels[i].symbols
                                                for (let j = 1; j < symbols.length; j++) {
                                                    let symbol = symbols[j]
                                                    let symbol_pos = app.model.data['game.freespins.scarab_wild.additional_pos']
                                                    for (let n = 0; n < symbol_pos.length; n++) {
                                                        let pos = symbol_pos[n]
                                                        if (i === pos[0] && j === pos[1] + 1) {
                                                            this.board.removeSymbolMask(symbol)
                                                            symbol.visible = true
                                                        }
                                                    }
                                                }
                                            }
                                            this.board.upperLayerGameSymbols.removeChildren()
                                            this.board.main_scarab.removeFromParent()
                                            this.board.head_scarab.removeFromParent()
                                            res()
                                        })
                                }})
                            })
                        })
                }
            })
    }
}

class StoneMultiplier extends Processor {
    constructor (proto) {
        super()
        this.board = proto;
    }

    add() {
        let allawAdd = false;
        return Promise.resolve()
            .then(() => {
                allawAdd = true;
                return;
            })
            .then(() => {
                let promise_list = Promise.resolve()
                let mults = app.model.data['game.freespins.rock']
                for (let i = 0; i < mults.length; i++) {

                    promise_list = promise_list
                        .then(() => {

                        })
                        .then(() => {
                            utils.wait(250)
                        })
                        .then(() => {
                            let mult = mults[i]
                            let move = {}

                            return new Promise((res) => {
                                    this.board.reels.reels.forEach((reel, index) => {
                                        reel.symbols.forEach((symbol, indexS) => {
                                            if (index === mult.pos[0] && indexS === mult.pos[1]) {
                                                let obval = this.board.upperLayerGameSymbols.addChild(Draw.buildSpine(`foreground`, true, 'obval', { loop: false }))
                                                obval.position.x = reel.position.x + 290
                                                setTimeout(() => {
                                                    obval.removeFromParent()
                                                }, 2000)
                                                let x = reel.position.x + 245 + symbol.position.x
                                                let y = symbol.position.y + 166
                                                let multi = { position: { x, y } }
                                                move = { sprite: multi, coef: mult.coef }
                                                res()
                                            }
                                        })
                                    })
                                })
                                .then(() => utils.wait(250))
                                .then(() => {
                                    return new Promise((res_) => {
                                        let multi_static = this.board.upperLayerGameSymbols.addChild(Draw.buildSpine(`stone`, true, 'stone', { loop: false }))
                                        multi_static.position.x = move.sprite.position.x - 30
                                        multi_static.position.y = move.sprite.position.y + 100
                                        let reels = this.board.reels.reels
                                        for (let i = 0; i < reels.length; i++) {
                                            let symbols = reels[i].symbols
                                            for (let j = 1; j < symbols.length; j++) {
                                                let symbol = symbols[j]
                                                if (i === mult.pos[0] && j === mult.pos[1] + 1) {
                                                    Promise.resolve()
                                                        .then(() => utils.wait(250))
                                                        .then(() => {
                                                            app.camera.shake(3, 0.2, false, true)
                                                            symbol.setId(mult.coef == 2 ? 18 : 19)
                                                            app.model.data['game.freespins.board'][i][j - 1] = mult.coef == 2 ? 18 : 19
                                                            app.model.data['game.spins.board'][i][j - 1] = mult.coef == 2 ? 18 : 19
                                                            symbol.setStaticState()
                                                        })
                                                }
                                            }
                                        }
                                        multi_static.state.addListener({
                                            complete: entry => {
                                                res_(multi_static)
                                            }
                                        })
                                    })
                                })
                                .then((item) => {
                                    item.removeFromParent()
                                    return;
                                })
                        })
                }

                return promise_list;
            })
    }
}

