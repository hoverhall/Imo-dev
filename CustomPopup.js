import app from 'core/app';
import * as Styles from './Styles';
import {i18n, utils} from 'core/helpers';
import {Draw, spriteMgr} from 'core/components/Draw';
// import buttonIMG from "./core/extra_assets/st_Adel.png"

export default class CustomPopup {
    constructor(text = '') {
        this.text = text;
        // console.log(text)

        this.bannerTextContainer = new PIXI.Container()
        let size = 150 - (text.length * 5)
        this.bannerText = new PIXI.extras.BitmapText(text, {font:`${size}px IMO_Banner_Finish_Text_2v`, align: "center"})
        this.bannerText.anchor.set(.5);
        this.bannerText.scale.set(1, -1);
        this.bannerText.position.set(0, this.bannerText.height - 30)
        this.bannerTextContainer.addChild(this.bannerText);

        this.width = app.config.get('App.width');
        this.height = app.config.get('App.height');

        this.container = new PIXI.Container();

        this.bgContainer = this.container.addChild(this.createBg());
        this.bgContainer.alpha = 0;
        this.bgContainer.interactive = true;
        this.bgContainer.buttonMode = true;
        this.bgContainer.cursor = 'default';
        this.allawPick = false

        this.bgAnimation = Draw.buildSpine('banner', false, 'youwon_start', {loop: false})
        this.bgAnimation.alpha = 0

        this.bgAnimation.children[this.bgAnimation.children.length - 1].addChild(this.bannerText);

        // this.bgAnimation.state.setAnimation(0, 'youwon_start');
        // // console.log(this.bgAnimation)
        // this.bgAnimation.children[this.bgAnimation.children.length - 1].removeFromParent()
        // this.bgAnimation.addChild(this.bannerTextContainer)
        // this.bgAnimation.updateTransform()
        // // console.log(this.bgAnimation)

        this.container.addChild(this.bgAnimation)


        this.contextText = this.container.addChild(this.createText());
        app.stage.addChild(this.container);

        let container = app.lr('customPopups');
        if (!container) {
            container = app.lr.addBefore('customPopups', 'popups');
        }

        container.addChild(this.container);

        return this;
    }

    /**
     * Is available
     * @returns {boolean}
     */
    isAvailable() {
        return this.container instanceof PIXI.Container;
    }

    showBgAnimation() {
        this.bgAnimation.alpha = 1
        this.bgAnimation.state.setAnimation(0, "youwon_start")
        this.container.addChild(this.bgAnimation);
        // console.log(this.bgAnimation)
    }

    staticBgAnimation() {
        return new Promise((res) => {
            this.bgAnimation.alpha = 1
            this.bgAnimation.state.setAnimation(0, "youwon_idle")
            // console.log(this.bgAnimation)
            this.bgAnimation.state.addListener({ complete: entry => {
                res()
            }})
        })
    }
 
    hideBgAnimation() {
        return new Promise((res) => {
            this.bgAnimation.alpha = 1
            this.bgAnimation.state.setAnimation(0, "youwon_finish")
            // console.log(this.bgAnimation)
            this.bgAnimation.state.addListener({ complete: entry => {
                res()
            }})
        })
    }

    createStyle() {
        return Object.assign({}, Styles.BIGWIN_STYLE_TEXT, {
            /*fontSize: '68px',
            strokeThickness: 2*/
        });
    }

    createBg() {
        let bg = new PIXI.Graphics();
        bg.beginFill(0x000000);
        bg.drawRect(0, 0, this.width, this.height);
        bg.endFill();
        return new PIXI.Sprite(app.renderer.generateTexture(bg));
    }

    createText() {
        let typeText = new PIXI.Text();
        typeText.x = this.width / 2;
        typeText.y = this.height / 2;
        typeText.anchor.set(0.5, 0.5);
        typeText.alpha = 0;
        return typeText;
    }

    showAnimation() {
        // // console.log("### CustomPopup => showAnimation");
        return new Promise(res => {
            createjs.Tween.get(this.bgContainer)
                .to({alpha: 0.3}, 500);

            createjs.Tween.get(this.contextText)
                .to({scaleX: 5, scaleY: 5, alpha: 0}, 0)
                .to({scaleX: 1, scaleY: 1, alpha: 1}, 550)
                .call(res);
        });
    }

    show() {
        // // console.log("### CustomPopup => show");
        return new Promise(res => {
            createjs.Tween.get(this.bgContainer)
                .to({alpha: 0.3}, 50)
                .call(() => {
                    this.contextText.alpha = 1;
                })
                .call(() => res());
        });
    }

    move(x = 0, y = 0, time = 200) {
        return new Promise(res => {
            createjs.Tween.get(this.contextText)
                .to({x: this.contextText.x + x, y: this.contextText.y +  y}, time)
                .call(() => res());
        });
    }

    hideAnimation() {
        return new Promise(res => {
            createjs.Tween.get(this.bgContainer)
                .to({alpha: 0}, 300)
                .call(res);

            createjs.Tween.get(this.contextText)
                .to({scaleX: 10, scaleY: 10, alpha: 0}, 200);
        });
    }

    hide() {
        return new Promise(res => {
            createjs.Tween.get(this.bgContainer)
                .to({alpha: 0}, 150)
                .call(res);

            createjs.Tween.get(this.contextText)
                .to({scaleX: 1, scaleY: 1, alpha: 0}, 50);
        });
    }

    showBgShadow () {
        // // console.log("### Board => showBgShadow");
        return new Promise(res => {
            createjs.Tween.get(this.bgContainer)
                .to({alpha: 0.5}, 500)
                .call(res);
        })
    }

    hideBgShadow () {
        // // console.log("### Board => hideBgShadow");
        return new Promise(res => {
            createjs.Tween.get(this.bgContainer)
                .to({alpha: 0}, 500)
                .call(res);
        })
    }

    showOptionBoard () {
        // // console.log("### Board => showOptionBoard");
        
        return new Promise(res => {
            this.allawPick = true
            let fs_series_count = app.model.data['game.spins.fs_series_count']

            document.getElementsByClassName("footer-item")[1].style.opacity = "0"
            document.getElementsByClassName("footer-item")[2].style.opacity = "0"
            document.getElementsByClassName("footer-item")[3].style.opacity = "0"
            document.getElementsByClassName("footer-item")[4].style.opacity = "0"

            this.optBoard = Draw.buildSpine('bannerstart', true, 'idle')
            this.optButton_1 = new PIXI.Sprite(app.loader.resources['st_Adel'].texture)
            this.optButton_2 = new PIXI.Sprite(app.loader.resources['st_Adel'].texture)
            this.optButton_3 = new PIXI.Sprite(app.loader.resources['st_Adel'].texture)
            this.optButton_4 = new PIXI.Sprite(app.loader.resources['st_Adel'].texture)

            this.mode10_free_activ = Draw.buildSpine('bannerstart', true, '10_free_activ', {loop: false})
            this.mode10_free_choice = Draw.buildSpine('bannerstart', true, '10_free_choice', {loop: false})
            this.mode15_free_activ = Draw.buildSpine('bannerstart', true, '15_free_activ', {loop: false})
            this.mode15_free_choice = Draw.buildSpine('bannerstart', true, '15_free_choice', {loop: false})
            this.mode20_free_activ = Draw.buildSpine('bannerstart', true, '20_free_activ', {loop: false})
            this.mode20_free_choice = Draw.buildSpine('bannerstart', true, '20_free_choice', {loop: false})
            this.mode25_free_activ = Draw.buildSpine('bannerstart', true, '25_free_activ', {loop: false})
            this.mode25_free_choice = Draw.buildSpine('bannerstart', true, '25_free_choice', {loop: false})
            this.start_effect = Draw.buildSpine('bannerstart', true, 'start_effect', {loop: false})

            this.mode10_free_activ.alpha = 0
            this.mode10_free_choice.alpha = 0
            this.mode15_free_activ.alpha = 0
            this.mode15_free_choice.alpha = 0
            this.mode20_free_activ.alpha = 0
            this.mode20_free_choice.alpha = 0
            this.mode25_free_activ.alpha = 0
            this.mode25_free_choice.alpha = 0
    
            // this.optButton_1.interactive = true
            // this.optButton_1.buttonMode = true
            this.optButton_1.position.set(220, 110)
            this.optButton_2.position.set(435, 110)
            this.optButton_3.position.set(645, 110)
            this.optButton_4.position.set(855, 110)
            this.optButton_1.alpha = 0
            this.optButton_2.alpha = 0
            this.optButton_3.alpha = 0
            this.optButton_4.alpha = 0
            // this.optButton.position.set(0, 0)
            this.optBoard.alpha = 0
            app.board.root.addChild(this.optBoard)

            createjs.Tween.get(this.optBoard)
            .to({alpha: 1}, 500)
            .call(() => {
                app.board.root.addChild(
                                this.optButton_1,
                                this.optButton_2,
                                this.optButton_3,
                                this.optButton_4
                )

                let indicators_count = fs_series_count < 20 ? fs_series_count : 20;
                let indicators_list = []
                let ethalon;
                new Promise((resolve) => {
                    for (let i = 0; i <  indicators_count; i++) {
                        // console.log("hello")
    
                        if (i == indicators_count - 1) {
                            setTimeout(() => {
                                new Promise((res_) => {
                                    let progress_item = this.optBoard.addChild(Draw.buildSpine('bannerstart', true, 'progress', {loop: false}))
                                    progress_item.position.set(240, 90)
                                    indicators_list.push(progress_item)
                                    ethalon = progress_item
                                    createjs.Tween.get(progress_item)
                                    .call(() => {
                                        progress_item.position.x += (progress_item.width + (progress_item.width / 2) + 3.1) * i / 2
                                    })
                                    .call(() => res_())
                                })
                                .then(() => {
                                    let progress_item = this.optBoard.addChild(Draw.buildSpine('bannerstart', true, 'progress_activ', {loop: true}))
                                    progress_item.position.set(240, 90)
                                    let lighting = 0
                                    progress_item.state.addListener({ complete: () => {
                                        if (lighting == 1) {
                                            progress_item.state.setAnimation(0, 'progress_activ', false)
                                        }
                                        lighting++
                                    }})
                                    indicators_list.push(progress_item)
                                    createjs.Tween.get(progress_item)
                                    .call(() => {
                                        progress_item.position.x += (ethalon.width + (ethalon.width / 2) + 3.1) * i / 2
                                    })
                                    .to({alpha: 1}, 200)
                                    .call(() => {resolve()})
                                })
                            }, 500 * (i / 10))
                        } else {
                            setTimeout(() => {
                                new Promise(ress => {
                                    let progress_item = this.optBoard.addChild(Draw.buildSpine('bannerstart', true, 'progress', {loop: false}))
                                    progress_item.position.set(240, 90)
                                    ethalon = progress_item
                                    indicators_list.push(progress_item)
                                    createjs.Tween.get(progress_item)
                                    .call(() => {
                                        progress_item.position.x += (progress_item.width + (progress_item.width / 2) + 3.1) * i / 2
                                        ress()
                                    })
                                    .to({alpha: 1}, 100)
                                    // .call(() => resolve())
                                })
                                .then(() => {
                                    let progress_item = this.optBoard.addChild(Draw.buildSpine('bannerstart', true, 'progress_activ', {loop: false}))
                                    progress_item.state.timeScale = 12
                                    progress_item.position.set(240, 90)
                                    indicators_list.push(progress_item)
                                    createjs.Tween.get(progress_item)
                                    .call(() => {
                                        progress_item.position.x += (ethalon.width + (ethalon.width / 2) + 3.1) * i / 2
                                    })
                                    // .call(() => {resolve()})
                                })
                            }, 500 * (i / 10))
                        }
                    }
                })
                .then(() => {
                    // let progress = indicators_list[indicators_list.length - 1]
                    // let light = last_indicator.addChild(Draw.buildSpine('bannerstart', true, 'progress_activ', {loop: true}))
                    // // light.position.x -= 65
                    // let lighting = 0
                    // // light.state.addListener({ complete: () => {
                    // //     if (lighting == 3) {
                    // //         light.state.setAnimation(0, 'progress_activ', false)
                    // //     }
                    // //     lighting++
                    // // }})
                })
                .then(() => {
                    this.optBoard.addChild(this.mode10_free_activ)
                    createjs.Tween.get(this.mode10_free_activ)
                    .to({alpha: 1}, 0)
                    if (fs_series_count > 5 && fs_series_count <= 10) {
                        this.optBoard.addChild(this.mode15_free_activ)
                        createjs.Tween.get(this.mode15_free_activ)
                        .to({alpha: 1}, 0)
                    } else if (fs_series_count > 10 && fs_series_count <= 15) {
                        this.optBoard.addChild(this.mode15_free_activ)
                        createjs.Tween.get(this.mode15_free_activ)
                        .to({alpha: 1}, 0)
                        this.optBoard.addChild(this.mode20_free_activ)
                        createjs.Tween.get(this.mode20_free_activ)
                        .to({alpha: 1}, 0)
                    } else if (fs_series_count > 15) {
                        this.optBoard.addChild(this.mode15_free_activ)
                        createjs.Tween.get(this.mode15_free_activ)
                        .to({alpha: 1}, 0)
                        this.optBoard.addChild(this.mode20_free_activ)
                        createjs.Tween.get(this.mode20_free_activ)
                        .to({alpha: 1}, 0)
                        this.optBoard.addChild(this.mode25_free_activ)
                        createjs.Tween.get(this.mode25_free_activ)
                        .to({alpha: 1}, 0)
                    } else {
    
                    }
                    [
                        this.mode10_free_activ,
                        this.mode15_free_activ,
                        this.mode20_free_activ,
                        this.mode25_free_activ,
                    ].forEach((item, index) => {
                        createjs.Tween.get(item)
                        .to({y: -10}, 0)
                    })
                })

            })

            function pointerCoords (Sprite) {
                let x = app.renderer.plugins.interaction.eventData.data.global.x
                let y = app.renderer.plugins.interaction.eventData.data.global.y
                return x > Sprite.position.x && y > Sprite.position.y &&
                       x < Sprite.position.x + Sprite.width && y < Sprite.position.y + Sprite.height
            }

            this.mode = 1
            this.allowHover = true

            window.addEventListener("mousemove", () => {
                if (this.allawPick) {
                    if (pointerCoords(this.optButton_1)) {
                        if (this.allowHover) {
                            this.clearHover(1)
                            this.mode10_free_choice = Draw.buildSpine('bannerstart', true, '10_free_choice', {loop: false})
                            this.operateMouseOverEvent(this.mode10_free_choice, 1)
                        }
                        this.allowHover = this.mode != 1 ? true : false
                    } else if (pointerCoords(this.optButton_2) && fs_series_count > 5) {
                        if (this.allowHover) {
                            this.clearHover(2)
                            this.mode15_free_choice = Draw.buildSpine('bannerstart', true, '15_free_choice', {loop: false})
                            this.operateMouseOverEvent(this.mode15_free_choice, 2)
                        }
                        this.allowHover = this.mode != 2 ? true : false
                    } else if (pointerCoords(this.optButton_3) && fs_series_count > 10) {
                        if (this.allowHover) {
                            this.clearHover(3)
                            this.mode20_free_choice = Draw.buildSpine('bannerstart', true, '20_free_choice', {loop: false})
                            this.operateMouseOverEvent(this.mode20_free_choice, 3)
                        }
                        this.allowHover = this.mode != 3 ? true : false
                    } else if (pointerCoords(this.optButton_4) && fs_series_count > 15) {
                        if (this.allowHover) {
                            this.clearHover(4)
                            this.mode25_free_choice = Draw.buildSpine('bannerstart', true, '25_free_choice', {loop: false})
                            this.operateMouseOverEvent(this.mode25_free_choice, 4)
                        }
                        this.allowHover = this.mode != 4 ? true : false
                    } else {
                        this.allowHover = true
                        this.clearHover(0)
                    }
                }
            })

            window.addEventListener("click", () => {
                if (this.allawPick) {
                    if (pointerCoords(this.optButton_1)) {
                        this.operateMouseClickEvent(1, this.mode10_free_choice, this.optButton_1, res)
                    } else if (pointerCoords(this.optButton_2) && fs_series_count > 5) {
                        this.operateMouseClickEvent(2, this.mode15_free_choice, this.optButton_2, res)
                    } else if (pointerCoords(this.optButton_3) && fs_series_count > 10) {
                        this.operateMouseClickEvent(3, this.mode20_free_choice, this.optButton_3, res)
                    } else if (pointerCoords(this.optButton_4) && fs_series_count > 15) {
                        this.operateMouseClickEvent(4, this.mode25_free_choice, this.optButton_4, res)
                    }
                }
            })
        }, this)
    }

    operateMouseClickEvent(mode, spline, pointerArea, func = () => {}) {
        this.allawPick = false
        let sp = this.optBoard.addChild(spline)
        createjs.Tween.get(sp)
        let se = this.optBoard.addChild(this.start_effect)
        se.position.set(pointerArea.position.x + 100, pointerArea.position.y + 200)
        this.disableUnusedModes(mode)
        createjs.Tween.get(se)
        .to({alpha: 1}, 500)
        Promise.resolve()
        .then(() => utils.wait(1e3))
        .then(() => this.hidePanel())
        .then(() => {
            this.sendPick(mode)
            .then(() => {
                app.bg.use('freespins', true, 1000, mode)
                return app.board.use('freespins', true, 1000, mode)
            })
            .then(() => func())
        })
    }

    clearHover(mode) {
        mode != 1 && this.mode10_free_choice.removeFromParent()
        mode != 2 && this.mode15_free_choice.removeFromParent()
        mode != 3 && this.mode20_free_choice.removeFromParent()
        mode != 4 && this.mode25_free_choice.removeFromParent()
    }

    operateMouseOverEvent (spline, mode) {
        this.allowHover = false
        this.mode = mode
        this.optBoard.addChild(spline)
        createjs.Tween.get(spline)
        .to({y: -10}, 0)
        .to({alpha: 1}, 500)
    }

    disableUnusedModes(usedMode) {
        [
            this.mode10_free_activ,
            this.mode15_free_activ,
            this.mode20_free_activ,
            this.mode25_free_activ
        ].forEach((item, index) => {
            if (usedMode != index + 1) {
                createjs.Tween.get(item)
                .to({alpha: 0}, 500)
                .call(() => {
                    item.removeFromParent()
                })
            }
        })
    }

    hidePanel() {
        let promise = Promise.resolve()
        return promise
        .then(() => {
            createjs.Tween.get(this.mode15_free_activ)
            .to({alpha: 0}, 500)
            createjs.Tween.get(this.mode15_free_choice)
            .to({alpha: 0}, 500)
            createjs.Tween.get(this.mode20_free_activ)
            .to({alpha: 0}, 500)
            createjs.Tween.get(this.mode20_free_choice)
            .to({alpha: 0}, 500)
            createjs.Tween.get(this.mode25_free_activ)
            .to({alpha: 0}, 500)
            createjs.Tween.get(this.mode25_free_choice)
            .to({alpha: 0}, 500)
            return createjs.Tween.get(this.optBoard)
            .to({alpha: 0}, 500)
        })
    }

    sendPick(mode) {
        return new Promise((resolve, reject)=>{
            let xhr = new XMLHttpRequest();
            xhr.open("POST", gr.Options.endpoints.server_url);
            
            xhr.onload = () => {
                resolve();
            }
            
            xhr.send(JSON.stringify({
                "command": "pick",
                "request_id":gr.Utils.uuid4().replace(/-/g, ''),
                "session_id": gr.Flow.data.session_id,
                "sign_key": window.BOOONGO.options.sign_key,
                "action": {
                    name: "pick",
                    params: {}
                },
                "pick":mode // может быть 1, 2, 3, 4 соответственно
            }))
        })
        .then(() => {
            this.allawPick = false
            createjs.Tween.get(this.optBoard)
            .to({alpha: 0}, 500)
            .call(() => {
                app.board.root.removeChild(this.optBoard)
                app.board.root.removeChild(
                                    this.optButton_1,
                                    this.optButton_2,
                                    this.optButton_3,
                                    this.optButton_4
                )
            })
            return;
        })
    }

    hideOptionBoard () {
        // // console.log("### Board => hideOptionBoard");
        return new Promise(res => {
            res()
        })
    }

    initFreeSpinsModeOptions () {
        // // console.log("### Board => initFreeSpinsModeOptions");
        let promise = Promise.resolve()
        return promise
            // .then(() => this.showBgShadow())
            .then(() => this.showOptionBoard())
            // .then(() => utils.wait(2e3))
            .then(() => this.hideOptionBoard())
            .then(() => this.hideBgShadow())
    }

    destruct() {
        this.bgContainer.removeFromParent();
        this.contextText.removeFromParent();
        this.container.removeFromParent();
        this.bgContainer.destroy();
        this.bgContainer = null;
        this.contextText = null;
        this.container = null;

        return Promise.resolve();
    }
}
