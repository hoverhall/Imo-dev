import { app } from 'core/app';
import Board from 'core/components/Board';
import BoardProcessor from './BoardProcessor';
import { Draw, spriteMgr } from 'core/components/Draw';
import GameSymbol from 'core/components/GameSymbol';
import Reel from 'core/components/Reel';
import Reels from 'core/components/Reels';
import { GameEvent } from 'core/core/Enums';
import Sound from 'core/core/Sound';
import { IdleSpinsState, ResultSpinsState } from 'core/states/SpinsStates';
import { i18n, utils } from 'core/utils';
import { env } from 'gdk';
import BitmapCoinsText from './BitmapCoinsText';
import SkipController from 'core/controllers/SkipController';
//import MiniPaytable from 'core/components/MiniPaytable';
//import {MarkersController} from './Markers';
import CustomPopup from './CustomPopup';
import { SpineBigWin } from './SpineBigWin';
import { COINS_TEXT, WINSUM_TEXT } from './Styles';
import { default as character } from './character';
import { default as expandJoker } from './expandJoker';
import { default as UpperLayerGameSymbols } from './UpperLayerGameSymbols';

const logo_cord = [{
    'x': 0,
    'y': 0
}, {
    'x': 0,
    'y': 0
}];

const reel_pos = {
    'portrait': [{
        x: 215,
        y: 100.5
    }],
    'landscape': [{
        x: 205,
        y: 100.5
    }]
};

const ew_container_pos = {
    position: {
        x: 205,
        y: 100.5
    },
    ew_pos: {
        x: 87,
        y: 250
    }
}


Board.prototype.onResetOld = Board.prototype.onReset;
Object.assign(Board.prototype, {
    onInit() {
        // // console.log('### Board => onInit');
        // console.log(app.model.get("settings.symbols"))

        this.textTWvalue = new PIXI.Text()
        this.textFSvalue = new PIXI.Text()
        this.loopMulti = setInterval(() => {}, 0)

        this.multiF3Animation = Draw.buildSpine('multiplier', false, `2x`, { loop: false })
        this.multi_counter = 2

        this.createShadow();
        this.boardTextContainer = new PIXI.Container()
        if (app.model.data["game.current"] != "freespins") {
            this.bgSprite = this.root.addChild(Draw.buildSpine('board', true, 'spins'))
            this.bgSprite.position.set(logo_cord[1].x, logo_cord[1].y)
            this.oldArmature = this.bgSprite;

            this.logo = this.root.addChild(Draw.buildSpine('logo', true, env.get('lang').substr(0, 2) === 'zh' ? 'logo' : 'logo', { loop: false }));

            this.loopLogo = this.loop(() => {
                this.logo.state.setAnimation(0, "logo", false)
            }, 10)

            this.oldLogo = this.logo;
            this.logo.position.set(logo_cord[1].x, logo_cord[1].y);
        } else {
            let mode = 0
            switch (app.model.data['game.freespins.mode']) {
                case "":
                    mode = 0
                    break;
                case "mode10":
                    mode = 1
                    break;
                case "mode15":
                    mode = 2
                    break;
                case "mode20":
                    mode = 3
                    break;
                case "mode25":
                    mode = 4
                    break;
            }
            this.bgSprite = this.root.addChild(Draw.buildSpine('board', true, `freespins${mode}`))
            this.bgSprite.position.set(logo_cord[1].x, logo_cord[1].y)
            this.oldArmature = this.bgSprite;
            this.boardTextContainer = this.addBoardText(app.model.data["game.current"], mode)
        }

        // this.brick.removeFromParent()

        this.newReels = new Reels();
        this.reels = this.root.addChild(this.newReels);
        this.oldReels = this.reels
        this.reels.init();

        //this.lines = this.addComponent(this.addChild(new Lines()));
        //this.minipaytable = this.addComponent(new MiniPaytable());

        /*this.markers = new MarkersController(this.root);
        this.markers.on(GameEvent.MarkerTap, this.onMarkerTap, this);*/

        this.bigWinConstructor = SpineBigWin;

        app.ticker.add(this.update, this);

        // создаем персонажа и присваиваем отдельному свойству
        // this.character = new character( app.model.get('game.current') );
        // отдельный объект для экспанда джокера
        //

        this.upperLayerGameSymbols = new UpperLayerGameSymbols();
        this.oldUpperLayerGameSymbols = this.upperLayerGameSymbols
        this.processor = new BoardProcessor(this)


        // this.addChild(this.character);
        this.addChild(this.upperLayerGameSymbols);

        app.renderer.roundPixels = false;

        // this.reels.reels.forEach((reel)=>{
        //     reel.on('Reel.EVENT.PUSH_LAST', ()=>{
        //         for(let symbol of reel.symbols) {
        //             if([].indexOf(symbol.id) != -1) symbol.setStopState();
        //         }
        //     })
        // })

        this.reels.reels.forEach((reel) => {
            reel.on('Reel.EVENT.STOP', () => {
                // hide hair in 5 row symbols
                this.reels.forEachSymbol((symbol, coll, row) => {
                    if (row == 3) {
                        symbol.visible = false;

                        app.once('RoundStart', () => {
                            symbol.visible = true;
                        })
                    }
                })
            })
        })

        this.anticipationInit();
        this.onRotate();
    },

    addBoardText(mode, fs_mode) {
        let textFSstaticFunc = () => {
            let text = new PIXI.Text("FREE SPINS", {
                fontFamily: "nrkis",
                fill: "#ffffff",
                fontSize: 30
            })
            text.anchor.set(.5, 0)
            return text;
        }
        let textFSvalueFunc = () => {
            let text = new PIXI.Text("0", {
                fontFamily: "PR-Ex-Cathedra-Roman-Small-Caps-Medium",
                fill: "#ffffff",
                fontSize: 48
            })
            text.anchor.set(.5, 0)
            return text;
        }

        let textAWstaticFunc = () => {
            let text = new PIXI.Text("", {
                fontFamily: "nrkis",
                fill: "#ffffff",

                fontSize: 34
            })
            text.anchor.set(.5, 0)
            return text;
        }
        let textAWvalueFunc = () => {
            let text = new PIXI.Text("5x", {
                fontFamily: "PR-Ex-Cathedra-Roman-Small-Caps-Medium",
                fill: "#ffffff",
                fontSize: 42,
                letterSpacing: -3
            })
            text.anchor.set(.5, 0)
            return text;
        }

        let textTWstaticFunc = () => {
            let value = ""
            switch (fs_mode) {
                case 1:
                    value = "All Wins"
                    break;
                case 2:
                    value = "Rock"
                    break;
                case 3:
                    value = "Free"
                    break;
                case 4:
                    value = "Scarab"
                    break;
            }
            let text = new PIXI.Text(value, {
                fontFamily: "nrkis",
                fill: "#ffffff",
                fontSize: 30
            })
            text.anchor.set(.5, 0)
            return text;
        }
        let textTWvalueFunc = () => {
            let value = ""
            switch (fs_mode) {
                case 1:
                    value = "multiplied"
                    break;
                case 2:
                    value = "feature"
                    break;
                case 3:
                    value = "Falls Reels"
                    break;
                case 4:
                    value = "ExtraWild"
                    break;
            }
            let text = new PIXI.Text(value, {
                fontFamily: "nrkis",
                fill: "#ffffff",
                fontSize: 30
            })
            text.anchor.set(.5, 0)
            return text;
        }

        let textFSstatic = textFSstaticFunc()
        let textAWstatic = textAWstaticFunc()
        let textTWstatic = textTWstaticFunc()
        this.textFSvalue = textFSvalueFunc()
        this.textAWvalue = textAWvalueFunc()
        this.textTWvalue = textTWvalueFunc()
        this.multiAnimation = Draw.buildSpine('multiplier', false, "multiply_x5_fsp1", { loop: false })
        this.lighting = Draw.buildSpine('winshow', false, "lightning", { loop: false })
        this.multiLighting()

        this.textFSvalue.position.set(textFSstatic.width / 2 + 30, -13)
        this.textAWvalue.position.set(textAWstatic.width, -8)
        this.textTWvalue.position.set(0, textTWstatic.height / 1.3)
        this.multiAnimation.position.set(-317, -13.75)
        this.multiAnimation.scale.set(0.450)

        let boardTextContainer = new PIXI.Container()
        let textFS = new PIXI.Container()
        let textAW = new PIXI.Container()
        let textTW = new PIXI.Container()

        textFS.addChild(textFSstatic, this.textFSvalue)
        textAW.addChild(textAWstatic, this.textAWvalue, this.multiAnimation)
        textTW.addChild(textTWstatic, this.textTWvalue)
        fs_mode == 1 && app.bg.foreground.addChild(this.lighting)

        let tFSv = app.model.data["game.freespins.rounds_left"] - 1
        this.textFSvalue.text = tFSv < 0 ? 0 : tFSv

        // console.log([textFS, textAW, textTW])
        if (mode == "freespins") {
            boardTextContainer.addChild(
                textFS,
                fs_mode == 1 ? textAW : new PIXI.Container(),
                textTW
            )
            this.setBoardTextPosition(boardTextContainer, fs_mode)
        }
        this.root.addChild(boardTextContainer)
        return boardTextContainer;
    },

    multiLighting() {
        this.multiAnimation.alpha = 1
        new Promise(res => {
                this.lighting.state.setAnimation(0, "lightning", false)
                this.multiAnimation.state.setAnimation(0, "multiply_x5_fsp1", false)
                this.multiAnimation.state.addListener({
                    complete: entry => {
                        res()
                    }
                })
            })
            // .then(() => {
            //     new Promise(res => {
            //             this.multiAnimation.state.setAnimation(0, "5x_fullix", false) // multiply_x5_fsp1
            //             this.multiAnimation.state.addListener({
            //                 complete: entry => {
            //                     res()
            //                 }
            //             })
            //         })
            //         .then(() => {
            //             createjs.Tween.get(this.multiAnimation)
            //                 .to({ alpha: 0 }, 100)
            //         })
            // })
    },

    setBoardTextPosition(boardTextContainer, fs_mode) {
        boardTextContainer.position.set(200, 35)
        boardTextContainer.children[2].position.set(110, -4)
        boardTextContainer.children[1].position.set(440, 13)
        boardTextContainer.children[0].position.set(760, 13)
    },

    onRotate() {
        // // console.log("### Board => onRotate");
        this.portrait = false;
        //  portrait mode support.
        GR.UI.model.follow('orientation', (e) => {
            // console.log('e = ' + e);
            if (e === 'portrait') {
                this.portrait = true;
                this.reels.scale.set(1.0, 1.0);
                this.reels.position.set(reel_pos.portrait[0].x, reel_pos.portrait[0].y);

            } else {
                this.portrait = false;
                this.reels.scale.set(1, 1);
                this.reels.position.set(reel_pos.landscape[0].x, reel_pos.landscape[0].y);
            }
        });
    },

    loop(func, time) {
        return setInterval(() => {
            func && func()
        }, time * 1000)
    },

    use(mode, animated = true, time = 1000, fs_mode = 0) {
        if (this.mode === mode) {
            return Promise.resolve();
        }
        let children_count = 6

        this.boardTextContainer.removeFromParent()
        this.mode = mode;

        // if(modes.indexOf(mode) === -1){
        //     mode = 'spins';
        // }

        //const bg = this.container.addChild(Draw.buildSptrite(mode === 'freespins' ? 'bg_free' : 'bg_main'));

        this.bgSprite = this.root.addChild(Draw.buildSpine('board', true, mode == 'spins' ? 'spins' : `freespins${fs_mode}`));
        this.boardTextContainer.removeFromParent()
        this.boardTextContainer = this.addBoardText(mode, fs_mode)

        // this.brick.removeFromParent()

        let oldReels = this.oldReels;
        this.reels = this.root.addChild(new Reels())
        this.reels.alpha = 0
        this.onRotate()
        this.reels.init();

        let oldLogo = this.oldLogo;
        if (mode === 'spins') {
            children_count = 7
            this.logo = this.root.addChild(Draw.buildSpine('logo', true, env.get('lang').substr(0, 2) === 'zh' ? 'logo' : 'logo', { loop: false }));
            this.loopLogo = this.loop(() => {
                this.logo.state.setAnimation(0, "logo", false)
            }, 10)

            this.oldLogo = this.logo;
        } else {
            clearInterval(this.loopLogo);
            this.logo.state.addListener({ complete: () => {} })
            oldLogo.removeFromParent();
        }

        let oldUpperLayerGameSymbols = this.oldUpperLayerGameSymbols
        this.upperLayerGameSymbols = new UpperLayerGameSymbols()
        this.addChild(this.upperLayerGameSymbols)
        oldUpperLayerGameSymbols.removeFromParent()

        this.reels.reels.forEach((reel) => {
            reel.on('Reel.EVENT.STOP', () => {
                // hide hair in 5 row symbols
                this.reels.forEachSymbol((symbol, coll, row) => {
                    if (row == 3) {
                        symbol.visible = false;

                        app.once('RoundStart', () => {
                            symbol.visible = true;
                        })
                    }
                })
            })
        })

        //this.logo.position.set(135, 320);
        this.bgSprite.alpha = 0;

        if (!this.oldArmature) {
            this.bgSprite.alpha = 1;
            this.oldArmature = this.bgSprite;
        } else {
            return new Promise(res => {
                let oldArmature = this.oldArmature;

                createjs.Tween.get(oldReels)
                    .to({ alpha: 0 }, time)
                    .call(() => {
                        oldReels.removeFromParent();
                    })
                    .call(() => {
                        if (this.root.children.length > children_count) {
                            let delete_ = this.root.children.length - children_count
                            this.root.children.map((item, index) => {
                                if (index < delete_) {
                                    item.removeFromParent()
                                }
                            })
                        }
                        res()
                    });


                createjs.Tween.get(oldArmature)
                    .to({ alpha: 0 }, time)
                    .call(() => {
                        oldArmature.removeFromParent();
                    })

                createjs.Tween.get(this.reels)
                    .to({ alpha: 1 }, time)
                    .call(() => {
                        this.oldReels = this.reels
                    })

                createjs.Tween.get(this.bgSprite)
                    .to({ alpha: 1 }, time)
                    .call(() => {
                        this.oldArmature = this.bgSprite;
                    })
            });
        }

        return Promise.resolve();
    },

    cleanMultiList() {
        if (this.multi_list) {
            this.multi_list.map(item => {
                item.removeFromParent()
            })
        }
    },

    multiEmmiter(multiplier = true) {
        this.multiF3Animation.removeFromParent()
        if (multiplier && this.multi_counter >= 2 && this.multi_counter <= 5) {
            return new Promise(res => {
                this.multiF3Animation = this.root.addChild(Draw.buildSpine('multiplier', true, `${this.multi_counter}x`, { loop: false }))
                this.multiF3Animation.state.addListener({
                    complete: entry => {
                        res()
                    }
                })
            })
        } else {
            this.multi_counter = 1
            return;
        }
    },

    multiFullixEmmiter() {
        return new Promise(res => {
            if (this.multi_counter >= 2) {
                this.multiF3Animation.state.setAnimation(0, `${this.multi_counter}x_fullix`, false)
                this.multiF3Animation.state.addListener({
                    complete: entry => {
                        this.multi_counter++
                            res()
                    }
                })
            } else {
                this.multi_counter++
                res()
            }
        })
    },

    avalanche() {
        // console.log("### Board => avalanche");
        return new Promise(end => {
            const mode = app.model.get('game.current');
            const feature_info = app.model.data[`game.freespins.gonzo_feature`];

            async function start() {
                let multi_counter = 1
                this.multi_list = []
                let allawed = false
                let fall_winlines = []
                let fall_round_win = 0
                let fall_multiplier
                for (let fall of feature_info) {
                    console.log(multi_counter)
                    console.log("round_win", fall.round_win)
                    console.log("multiplier", fall.multiplier)
                    console.log("winlines", fall.winlines)
                    // if (fall.round_win) {
                        if (allawed) {
                            allawed = fall.round_win > 0
                            console.log("p2")
                            // await Promise.all([])
                            // console.log("after_feature")
                            // this.ui.setWin(fall.round_win);
                            await this.showLineEmitterAnimation(fall_winlines)
                                // Promise.all([
                                // this.showRoundWinSymbols(fall_winlines),
                                // this.showFeatureRoundWinCounter(fall_round_win, fall_multiplier),
                                // utils.wait(1000)
                            // ])
                            await Promise.all([
                                // this.seMultiplier(fall),
                                this.showFeatureRoundWinSymbols(fall_winlines),
                                this.multiFullixEmmiter()
                            ])
                            await this.multiEmmiter()
                            // await this.showFeatureRoundWinScatters(fall.winscatters);
                            // await utils.wait(2e3);   
                            await this.feature(fall);
                        // } else {
                            if (allawed == false) {
                                break;
                            } else {
                                fall_winlines = fall.winlines
                                fall_round_win = fall.round_win
                                fall_multiplier = fall.multiplier
                            }
                        } else if (!allawed) {
                            allawed = fall.round_win > 0
                            fall_winlines = fall.winlines
                            fall_round_win = fall.round_win
                            fall_multiplier = fall.multiplier
                            console.log("p1")
                            await utils.wait(2e3);   
                            await this.feature(fall);
                        }
                        multi_counter++
                    // }
                }
                this.multi_list.map(item => item.removeFromParent())
                end();
            }

            start.call(this);
        });
    },

    showFeatureRoundWinSymbols(winlines) {
        // console.log("### Board => showFeatureRoundWinSymbols");
        if (!winlines || winlines.length === 0) return Promise.resolve();
        let promises = [];

        this.reverseForEachSymbol((symbol, i, j) => {
            let isActive = winlines.some(winline => winline.positions.some(pos => pos[0] === i && pos[1] === j));
            if (isActive) {
                symbol.shakeSymbol()
                this.customShowWinSymbol(isActive, winlines, symbol, i, j, promises);
            } else {
                symbol.setBlurState();
            }
        });
        return Promise.all(promises)
    },

    showFeatureRoundWinCounter(roundWin, multiplier = 0) {
        // console.log("### Board => showFeatureRoundWinCounter");
        return this.showWinPanel(roundWin, true, true, multiplier);
    },

    showFeatureRoundWinScatters(winscatters) {
        // console.log("### Board => showFeatureRoundWinScatters");
        if (!winscatters || winscatters.length === 0) return Promise.resolve();
        let wonFreespins = winscatters.find(i => i.trigger === 'freespins');

        let freeSpinsCount = winscatters.reduce((prev, cur) => prev + cur.freespins, 0);
        app.emit(GameEvent.WinScatter);
        let promises = [];
        this.reels.forEachSymbol((symbol, i, j) => {
            let isActive = winscatters.some(winline => winline.positions.some(pos => pos[0] === i && pos[1] === j));
            isActive ? symbol.setShortState() : symbol.setBlurState();
            if (!symbol.complete)
                promises.push(new Promise(res => symbol.once(GameSymbol.EventAnimationComplete, res)));
        });

        //! important to do it there as we should show animation of other triggres too.
        if (!wonFreespins)
            return Promise.all(promises);

        if (wonFreespins.freespins > 0)
            app.model.set('game.freespins.additional', wonFreespins.freespins);

        return Promise.all(promises)
            .then(() => app.emit(app.model.isFreeSpins() ? GameEvent.WinAdditionalFreeSpins : GameEvent.WinFreeSpins, app.model.getFreeSpinsGranted()))
            // .then(() => this.showFreeSpinsIntroLabel(freeSpinsCount, app.model.isFreeSpins()));
    },

    feature(fall) {
        console.log("feature")
        // console.log("### Board => feature");
        // console.log(app.model.data[`game.freespins.winlines`])
        let winlines_hide = app.model.data[`game.freespins.winlines`]
        return new Promise(end => {
            // console.log(1)
            this.reels.forEachSymbol((symbol) => {
                symbol.setStaticState(); // stop all current animations
            });
            // console.log(2)
            const avalanche_fall = app.model.data[`game.freespins.gonzo_feature`];
            // get previous winlines
            let winlines = [];
            if (avalanche_fall.indexOf(fall) == 0) {
                winlines = app.model.data[`game.freespins.winlines`];
                // winlines = winlines.concat(app.model.winscatters());
            } else {
                const previous_avalanche = avalanche_fall[avalanche_fall.indexOf(fall) - 1];

                winlines = previous_avalanche.winlines;
                // if(previous_avalanche.winscatters) winlines = winlines.concat(previous_avalanche.winscatters);
            }
            // console.log(3)
            let symbols = [];

            // blinking
            const blinkingPromises = (winlines) => {
                const promises = [];
                for (let winline of winlines) {
                    for (let positions of winline.positions) {
                        if (!symbols.includes(positions)) symbols.push(positions);
                    }
                }

                symbols = Array.from(new Set(symbols.map(JSON.stringify)), JSON.parse); // delete duplicate coordinates of symbols
                for (let positions of symbols) {
                    // console.log('positions', this.reels.reels[positions[0]])
                    promises.push(this.reels.reels[positions[0]].blinking(positions[1])); // call blinking
                };
                return promises;
            }

            Promise.all(blinkingPromises(winlines))
                .then(() => {
                    // console.log(4)
                    const shiftingPromises = [];
                    this.reels.reels.forEach((reel, i) => {
                        // get for current reel
                        const symbolsOnCurrentReel = symbols.filter((positions) => {
                            return positions[0] == i;
                        });
                        if (symbolsOnCurrentReel.length > 0) {
                            async function shift() {
                                // calculate rows for deleted and remaining symbols before update board
                                const moveArr = await reel.calculateRows();
                                app.model.data[`game.freespins.board`] = fall.board;
                                /*!
                                    app.model.board() takes board from spins. It should get board from freespins
                                    the line below is incorrect way to set new board.
                                */
                                app.model.data[`game.spins.board`] = fall.board; //! #BugWarning
                                this.reels.fillFromModel();

                                reel.emit('Reel.EVENT.START');

                                // shift all symbols on reel
                                await reel.shifting(moveArr);

                                return Promise.resolve();
                            }

                            shiftingPromises.push(shift.call(this));
                        }
                    });
                    // console.log(5)
                    Promise.all(shiftingPromises)
                        .then(() => {
                            end();
                        });
                })
        });
    },

    anticipationInit() {
        //! anticipation
        let setBlurring = (reel) => {
            let r = this.reels.reels[reel].symbols;
            for (let j = 0; j < r.length; ++j) {
                let symbol = r[j];
                if (symbol.row >= 0 && symbol.row < 3 && symbol._id !== GameSymbol.SCATTER_ID) {
                    symbol.setBlurState();
                }
            }
        };

        this.anticipationFrameSprites = this.anticipationFrameSprites || {};
        this.reels.reels.forEach((r, index) => {
            r.on(Reel.EVENT.ANTICIPATION_STOPPING, () => {
                // let r = this.reels.reels[index].symbols;
                for (let j = 0; j < r.symbols.length; ++j) {
                    let symbol = r.symbols[j];
                    if (symbol._id === GameSymbol.SCATTER_ID) {
                        r.once(Reel.EVENT.STOP_BEFORE_BACK_OUT, () => {
                            app.camera.shake(2, 0.2)
                        })
                    }
                }
                this.showAnticipationFrame(r.id - 1);

                for (let i = 0; i < r.id; ++i) {
                    if (this.reels.reels[i].state === Reel.AT_STOP) {
                        setBlurring(i);
                    } else if (this.reels.reels[i].state === Reel.STATE.STOPPING) {
                        this.reels.reels[i].once(Reel.EVENT.STOP, () => {
                            setBlurring(i);
                        });
                    }
                }
            });
            r.on(Reel.EVENT.STOP, id => {
                app.board.hideAnticipationFrame(r.id - 1);
            });
        });
    },

    beforeWinAnimation(roundWin) {
        // console.log("### Board => beforeWinAnimation");
        let res = []

        return Promise.all(res).then(() => {
            if (roundWin > 0) {
                this.showShadow();
            }
        });
    },

    showShadow(t) {
        return;
    },

    hideShadow(t) {
        return;
    },

    /**
     * @override
     * @returns {*}
     */
    showRoundWinSymbols(start = false) {
        // console.log('### Board => showRoundWinSymbols')
        let winlines = app.model.winlines();
        if (!winlines || winlines.length === 0) return Promise.resolve();
        // let verticalExpandWild = app.model.verticalExpandWild();
        let promises = [];
        let initPos = app.model.data["game.freespins.scarab_wild.initial_pos"]
        
        this.reverseForEachSymbol((symbol, coll, row) => {
            let isActive = winlines.some(winline => winline.positions.some(pos => pos[0] === coll && pos[1] === row));
            if (isActive) {
                symbol.shakeSymbol()
                .then(() => {
                    this.customShowWinSymbol(isActive, winlines, symbol, coll, row, promises, start)
                })
            } else {
                !start && symbol.setBlurState();
            }
        });

        return Promise.all(promises);
    },

    reverseForEachSymbol(callback) { // by row
        // // console.log("### Board => reverseForEachSymbol")
        try {
            let cols = Math.min(app.model.cols(), this.reels.reels.length);
            let rows = app.config.get('App.rows');
            for (let i = 0; i < rows; ++i) {
                for (let j = 0; j < cols; ++j) {
                    callback.call(this.reels, this.reels.reels[j].symbols[i + 1], j + this.reels.reelOffset, i);
                }
            }
        } catch (e) {
            console.error(e)
        }
    },

    showRoundResult() {
        // console.log("### Board => showRoundResult");
        this.followRoundBetChange();
        let deferred = utils.deferred();
        let roundWin = app.model.roundWin();
        let roundBet = app.model.roundBet();
        let isBigWin = app.model.isBigWin();
        let playSymbolsBeforeBigWin = app.config.get('Board.playSymbolsBeforeBigWin') || false;
        let promise = Promise.resolve();

        // console.log(app.model.get('game.current'))

        if (app.model.get('game.current') === 'freespins')
            // promise = utils.wait(500);

        promise = promise.then(() => {
            return this.beforeWinAnimation(roundWin);
        });

        roundWin = 0;
        for (let item of app.model.winlines()) {
            roundWin += item.amount;
        }
        for (let item of app.model.winscatters()) {
            roundWin += item.amount;
        }
        if (roundWin > 0) {
            promise = promise
                .then(() => { app.model.data["game.freespins.mode"] == "mode10" && this.multiLighting() })
                .then(() => app.model.data["game.freespins.mode"] == "mode20" && this.multiEmmiter())
                .then(() => this.showWinAnimation(0))
            .then(() => this.showBigWinAnimation(roundWin));
            promise = promise
                .then(() => this.showWinAnimation(roundWin))
                
        } else {
            // passing null if bigwin to hide win panel and only show symbols and lines
            promise = promise
                .then(() => this.showWinAnimation(roundWin));
        }
        promise
            .then(() => this.showRoundWinScatters())
            .then(() => {
                return new Promise(res => {
                    // console.log("gonzo", app.model.data[`game.freespins.gonzo_feature`])
                    if (app.model.data[`game.freespins.gonzo_feature`] != null && app.model.data[`game.freespins.gonzo_feature`].length > 0) {
                        app.lock();

                        app.board.avalanche()
                            .then(() => app.unlock())
                            .then(() => res())
                    } else {
                        res();
                    }
 
                    app.board.hideShadow();
                });
            })
            .then(() => this.afterWinAnimation(roundWin))
            .then(deferred.resolve, deferred.resolve);
        return this.addAnimation(
            () => deferred.promise,
            () => deferred.resolve()
        );
    },

    setStaticState() {
        this.reels.forEachSymbol((symbol) => {
            symbol.setStaticState(); // stop all current animations
        })
        return;
    },

    showLineEmitterAnimation(winlines) {
        // let promises = []
        // for (let line of app.model.data["game.freespins.winlines"]) {
        //     promises.push(this.showWinLineEmitter(line))
        // }
        // return Promise.all(promises)

        let combinations = [].concat(app.model.winscatters(), winlines).filter(c => c.amount);

        if(combinations.length == 0){
            return Promise.resolve();
        }

        const winshow = async ()=>{
            for(let winline of combinations) {
                // if(!skip)
                    await this.showWinLineEmitter(winline);
            }
        }

        return winshow()
    },

    showWinAnimation(roundWin) {
        // console.log("### Board => showWinAnimation");
        // console.log(roundWin)
        roundWin && app.emit(GameEvent.Win);
        let promise = Promise.resolve();
        return this.addAnimation(
            () => promise
            .then(() => Promise.all([
                app.model.data['game.freespins.mode'] == "mode20" && this.showRoundWinSymbols(),
                app.model.data['game.freespins.mode'] == "mode20" && this.showLineEmitterAnimation(app.model.winlines())
            ]))
            .then(() => Promise.all([
                roundWin && utils.wait(app.config.get('Board.winAnimationMinTime')),
                app.model.data['game.freespins.mode'] != "mode20" && this.showRoundWinSymbols(),
                app.model.data['game.freespins.mode'] != "mode20" && this.showLineEmitterAnimation(app.model.winlines()),
                this.showRoundWinCounter(roundWin),
                utils.wait(500) // костыль
            ]))
            .then(() => app.model.canAction('freespin_init') && !app.model.canAction('spin') && this.showRoundWinSymbols(true))
            .then(() => this.hideAllLines()),
            () => {
                this.hideAllLines();
                promise && promise.cancel && promise.cancel();
            }, null, true);
    },

    /**
     * @override
     * @returns {*}
     */
    showRoundWinScatters() {
        // console.log("### Board => showRoundWinScatters");
        let winscatters = app.model.winscatters();

        if (!winscatters || winscatters.length === 0) return Promise.resolve();
        let wonFreespins = winscatters.find(i => i.trigger === 'freespins');

        if (winscatters.length === 4) {
            Sound.play('win_bonus', 'win_bonus', { loop: 0, volume: 0.6 });
        } else {
            Sound.play('freegame_win_bonus', 'freegame_win_bonus', { loop: 0, volume: 0.6 });
        }

        let freeSpinsCount = winscatters.reduce((prev, cur) => prev + cur.freespins, 0);
        app.emit(GameEvent.WinScatter);
        let promises = [];
        this.reels.forEachSymbol((symbol, i, j) => {
            let isActive = winscatters.some(winline => winline.positions.some(pos => pos[0] === i && pos[1] === j));
            isActive ? symbol.setShortState() : symbol.setBlurState();
            if (!symbol.complete)
                promises.push(new Promise(res => symbol.once(GameSymbol.EventAnimationComplete, res)));
        });

        //! important to do it there as we should show animation of other triggres too.
        if (!wonFreespins)
            return Promise.all(promises);

        if (wonFreespins.freespins > 0)
            app.model.set('game.freespins.additional', wonFreespins.freespins);

        return Promise.all(promises)
            .then(() => app.emit(app.model.isFreeSpins() ? GameEvent.WinAdditionalFreeSpins : GameEvent.WinFreeSpins, app.model.getFreeSpinsGranted()))
            .then(() => this.showFreeSpinsIntroLabel(freeSpinsCount, app.model.isFreeSpins()));
    },

    /**
     * @override
     * @param winline
     * @returns {Promise<any[]>}
     */
    showWinLine(winline) {
        // // console.log('### Boards => showWinLine()');
        let promises = [];
        let verticalExpandWild = app.model.verticalExpandWild();
        let winlines = app.model.winlines();

        // this.reels.forEachSymbol((symbol, coll, row) => {
        //     let isActive = winline.positions.some(pos => pos[0] === coll && pos[1] === row);
        //     this.customShowWinSymbol(isActive, winlines, symbol, verticalExpandWild, coll, row, promises);
        // });
        return Promise.all(promises);
    },

    /**
     * @override
     * @param winline
     * @returns {*}
     */
    showWinLineEmitter(winline) {
        // // console.log('### Board => showWinLineEmitter()');
        return this.upperLayerGameSymbols.startWinLineEmitter(winline)
    },

    /**
     * @override
     * @returns {*}
     */
    spin() {
        this.reels.alpha = 1
        this.upperLayerGameSymbols.stop();
        this.upperLayerGameSymbols.removeChildren();
        this.showAllSymbols();
        this.multiEmmiter(false);
        let tFSv = app.model.data["game.freespins.rounds_left"] - 1
        this.textFSvalue.text = tFSv < 0 ? 0 : tFSv

        return this.reels.spin();
    },

    stop() {
        return Promise.all([this.reels.stop() /*, this.playTriggersAnimations()*/ ]);
    },

    showAllSymbols() {
        this.reels.forEachSymbol(symbol => {
            symbol.visible = true;
        })
    },

    /**
     * @override
     * @returns {Promise<any[]>}
     */
    showStaticAll() {
        //! remove shadow if present. no promise use need.
        this.hideShadow();

        let promises = [];
        this.reels.forEachSymbol((symbol, i, j) => {
            symbol.setStaticState();
            if (!symbol.complete)
                promises.push(new Promise(res => symbol.once(GameSymbol.EventAnimationComplete, res)));
        });
        return Promise.all(promises);
    },

    /**
     * @override
     * @param roundWin
     * @returns {*}
     */
    showBigWinAnimation(roundWin) {
        // console.log("### Board => showBigWinAnimation")
        let animation = new this.bigWinConstructor();
        return this.addAnimation(() => animation.play(roundWin), () => animation.skip(), animation.getContainer());
    },

    update() {

    },
    onReset(animated) {
        this.hideWinPanel();
        return this.onResetOld(animated);
    },

    onMarkerTap(marker, e) {
        const needToShow = e.data.target._mouseOver === true; // !marker.enabled;
        if (needToShow) {
            this.showLine({ line: marker.id });
        }
    },

    hideLine(line) {
        this.lines.hide(line);
        //this.markers.disable(line);
    },

    showLabel(message) {
        // // console.log("### Board => showLabel");

        let popup = new CustomPopup(message);
        return Promise.resolve()
            .then(() => Sound.shot('popup_complimenti_freespin'))
            .then(() => { popup.showBgAnimation() })
            .then(() => popup.showAnimation())
            .then(() => utils.wait(500))
            .then(() => popup.staticBgAnimation())
            .then(() => utils.wait(500))
            .then(() => Sound.shot('freegame_popup_won_complimenti_out'))
            .then(() => popup.hideBgAnimation())
            .then(() => popup.hideAnimation())
            .then(() => popup.destruct());
    },

    showRoundWinCounter(roundWin) {
        // console.log("### Board => showRoundWinCounter");
        // console.log(roundWin)
        return Promise.resolve()
            .then(() => {
                this.showWinPanel(roundWin, true, true);
            })
    },

    showFreeSpinsOutroLabel(win = null) {
        // // console.log("### Board => showFreeSpinsOutroLabel");
        // this.showJokerCharacter();
        win = win === null ? app.model.current('total_win', 0) : win;

        gr.UI.view.balance.value(gr.UI.model.get('balance'));

        app.emit(GameEvent.FreeSpinsOutroLabel, win);
        return this.showLabel(i18n.coins(win));
    },

    showFreeSpinsIntroLabel(freeSpinsCount, freeSpinsAdditional) {
        // // console.log("### Board => showFreeSpinsIntroLabel");

        // this.showBonusCharacter();
        return new Promise(res => res());
    },

    showWinPanel(value, sound = false, anima = false) {
        // console.log("### Board => showWinPanel");
        //! hide prev data.
        this.hideWinPanel();

        value = value || app.model.roundWin();
        if (value === 0) {
            return;
        }
        let container = new PIXI.Container();

        const size = anima ? 140 : 70;
        container.x = app.config.get('App.width') / 2;
        container.y = this.getHalfHeight();

        let back = new PIXI.Sprite(app.loader.resources['winsum_back'].texture)
        back.blendMode = PIXI.BLEND_MODES.ADD;
        back.scale.set(.7)

        let text = new BitmapCoinsText(i18n.coins(1), WINSUM_TEXT(size));
        text.letterSpacing = 0; // for current font

        //let text = new PIXI.Text(0, LabelNumbersStyle);

        back.alpha = 0
        text.alpha = 0;
        text.coins = 1;

        back.anchor.set(.5)
        text.anchor.set(.5);

        container.addChild(back, text);

        app.lr('board').addChild(container);

        this.text = container;

        const mult = value / app.model.roundBet();
        let sound_type = 0;
        if (mult < 2) {
            const randNum = Math.round(Math.random() * 3 + 1);
            sound_type = `win_small_${randNum}`;
        } else if (mult < 5) {
            sound_type = 'win_schet_loop_1';
        } else if (mult < 11) {
            sound_type = 'win_schet_loop_2';
        } else {
            sound_type = 'win_schet_loop_3';
        }

        if (app.stateMachine.current == 'IdleSpinsState') sound = false;

        sound && Sound.play(sound_type, 'label', { loop: 0 });

        const start_balance = document.querySelector('#container > div > div > footer > div:nth-child(4) > div > div.value').innerHTML.slice(10).replace(',', '').replace('.', '') * 1;

        //! state show line
        if (!anima) {
            //const dur = Math.max(1000, this.WinDuration - 500);
            const dur = 1100;

            this.WinDuration = 0;
            text.coins = value;

            return new Promise(res => {

                createjs.Tween.get(text)
                    .wait(200)
                    .to({ alpha: 1 }, 200)
                    .wait(dur)
                    .to({ alpha: 0 }, 100)
                    .call(() => {
                        res();
                        this.hideWinPanel();

                        if (sound && sound_type.substr(0, 9) == 'win_schet') {
                            Sound.play(sound_type.replace('loop', 'end'), 'label', { loop: 0 });
                        } else {
                            Sound.stop('label'); // для всех звуков которые не "loop"
                        }
                    })
                    .on('change', () => {
                        text.text = i18n.coins(text.coins);
                    });
            });
        }

        const lll = value * 80;
        const V = Math.min(lll, this.WinDuration / 2)
        const dur = Math.max(100, V);

        // // calculating in UI
        // if(app.model.current() == 'spins' && gr.UI.model.get('play_mode') == 'play') {
        //     gr.UI.model.set("last_win", value, 800);
        // } else {
        //     gr.UI.model.set("total_win", gr.UI.model.get("total_win")+value, 800);
        // }

        // gr.UI.model.set("balance", start_balance+value, 800);

        // const text_show = Math.max(this.WinDuration - dur - 500, 500);
        const text_show = 1100;
        this.WinDuration = 0;

        return new Promise(res => {
            // console.log("promise")

            SkipController.once(() => {
                if (text && text.tweenjs_count && app.model.data["game.freespins.mode"] != "mode20") {
                    createjs.Tween.removeTweens(text);
                    text.coins = value
                    createjs.Tween.get(back)
                        .to({ alpha: 0 }, 100)
                        .call(() => {
                            // console.log("res")
                            res();
                            this.hideWinPanel();
                        })
                }
            })

            createjs.Tween.get(text)
                .call(() => {
                    createjs.Tween.get(back)
                        .to({ alpha: 1 }, 100)
                })
                .to({ alpha: 1 }, 100)
                .to({ coins: value - 1 }, dur)
                .to({ alpha: 0 }, 100)
                // .call(() =>{
                //     // sound && Sound.play('win_schet_end', 'label', {loop: 0});

            //     if(sound && sound_type.substr(0, 9) == 'win_schet') {
            //         Sound.play(sound_type.replace('loop', 'end'), 'label', {loop: 0});
            //     } else {
            //         Sound.stop('label'); // для всех звуков которые не "loop"
            //     }
            // })
            .to({
                    alpha: 1,
                    coins: value,
                    scaleX: 1.2,
                    scaleY: 1.2
                }, 100)
                .to({
                    scaleX: 1,
                    scaleY: 1
                }, 100)
                .wait(text_show)
                .to({ alpha: 0 }, 100)
                .call(() => {
                    createjs.Tween.get(back)
                        .to({ alpha: 0 }, 100)
                        .call(() => {
                            // console.log("res")
                            res();
                            this.hideWinPanel();
                        })
                })
                .on('change', () => {
                    gr.UI.view.balance.value(GR.CurrencyFormatter.format(start_balance + text.coinsValue));
                    gr.UI.view.last_win.value(GR.CurrencyFormatter.format(text.coinsValue));

                    text.text = i18n.coins(text.coins);
                });
        });
    },

    hideWinPanel() {
        if (this.text) {
            createjs.Tween.removeTweens(this.text);
            this.text.removeFromParent();
            this.text = null;
        }
    },

    createMultiplier() {

    },

    showAnticipationFrame(reelIdx) {
        // // console.log('### Board => showAnticipationFrame()');
        if (this.anticipationFrameSprites[reelIdx]) {
            return;
        }

        let isOne = true;
        let winscatters = app.model.winscatters();
        let anim_layer = this.reels.animation[reelIdx];
        let sprite = anim_layer.addChild(Draw.buildSpine('anticipation'));

        sprite.x = Math.round(app.config.get('GameSymbol.width') / 2);
        sprite.y = app.config.get('GameSymbol.height') + Math.round(app.config.get('GameSymbol.height') / 2);
        sprite.alpha = 0;
        sprite.y += 10;
        sprite.tween(true).to({ alpha: 1 }, 200);

        this.anticipationFrameSprites[reelIdx] = sprite;
    },

    hideAnticipationFrame(reelIdx) {
        if (!this.anticipationFrameSprites[reelIdx]) {
            return;
        }

        this.anticipationFrameSprites[reelIdx].tween(true)
            .to({ alpha: 0 }, 200)
            .call(() => {
                this.anticipationFrameSprites[reelIdx].kill();
                delete this.anticipationFrameSprites[reelIdx];
            });
    },

    showSymbolUpperLayer(coll, row, symbol, winlines, start) {
        // // console.log('### Board => showSymbolUpperLayer()');
        let width = app.config.get('GameSymbol.width');
        let x = width * (coll + 1) + 118;

        symbol.visible = false;
        return this.upperLayerGameSymbols.start(symbol.getSymbolName(), x, symbol.y + 100, start);
    },

    addSymbolMask(coll, row, symbol) {
        // // // console.log('### Board => showSymbolUpperLayer()');
        // let width = app.config.get('GameSymbol.width');
        // let x = width * (coll + 1) + 118;

        symbol.visible = false;

        // // console.log(`${animName}_idle`)
        // let sprite = new PIXI.Sprite(app.loader.resources[`${symbol.getSymbolName()}_idle`]);
        // // let sprite = PIXI.extras.AnimatedSprite.fromImages([`${symbol.getSymbolName()}_idle`])

        // this.upperLayerGameSymbols.addSymbolMask(sprite, x, symbol.y + 100);
    },

    removeSymbolMask(symbol) {
        // symbol.visible = true;
    },

    replaceSymbol(coll, row, symbol, id) {
        // console.log('### Board => showSymbolUpperLayer()');
        let width = app.config.get('GameSymbol.width');
        let x = width * (coll + 1) + 118;

        symbol.visible = false;
        return this.upperLayerGameSymbols.start(symbol.getSymbolName(), x, symbol.y + 100);
    },

    showExpandJoker(collWildExpand, rowWildExpand, symbol) {
        let width = app.config.get('GameSymbol.width');
        let x = width * (collWildExpand + 1) + 160;
        this.expJoker.start(rowWildExpand, x, symbol.y + 147);
    },

    customShowWinSymbol(isActive, winline, symbol, coll, row, promises, start = false) {
        // console.log('### Board => customShowWinSymbol()')
        if (isActive) {
            const true_symbol = symbol;
            symbol = this.showSymbolUpperLayer(coll, row, symbol, winline, start);
            true_symbol.visible = false;
            symbol.state.addListener({
                complete: () => {
                    if (app.model.data['game.freespins.mode'] !== 'mode20') {
                        true_symbol.visible = true;
                    }
                }
            });
        } else {
            !start && symbol.setBlurState();
        }

        // console.log(symbol)

        if (!symbol.complete) {
            promises.push(new Promise(res => symbol.once(GameSymbol.EventAnimationComplete, res)));
        }
    },

    customShowWinSymbol1(isActive, winline, symbol, verticalExpandWild, coll, row, promises) {
        // // console.log('### Board => customShowWinSymbol()');
        const true_symbol = symbol;

        verticalExpandWild = app.model.verticalExpandWild();

        if (!verticalExpandWild) {
            verticalExpandWild = []
        }

        if (symbol.getSymbolName() === 'joker' && verticalExpandWild.length !== 0) {
            let collWildExpand = verticalExpandWild[0].col_id;
            let rowWildExpand = verticalExpandWild[0].row_id;

            if (collWildExpand === coll && row === rowWildExpand) {
                symbol.setBlurState();
                if (!this.expJoker.isActive()) {
                    symbol = this.showExpandJoker(collWildExpand, rowWildExpand, symbol);
                    Sound.play('wild_big_open', 'wild_big_open');
                }
            }
        } else if (isActive) {
            // if (verticalExpandWild.length !== 0) {
            //     let collWildExpand = verticalExpandWild[0].col_id;
            //     if ( collWildExpand !== coll ) {
            //         symbol = this.showSymbolUpperLayer(coll, row, symbol, winline);
            //     }
            // }
            // else {
            symbol = this.showSymbolUpperLayer(coll, row, symbol, winline);
            // }

            if ((symbol && symbol.state) && true_symbol != symbol) {
                true_symbol.visible = false;
                symbol.state.addListener({ complete: () => { true_symbol.visible = true; } });
            }
        } else {
            symbol.setBlurState();
        }

        if (symbol && !symbol.complete) {
            promises.push(new Promise(res => symbol.once(GameSymbol.EventAnimationComplete, res)));
        }
    },

    showBgShadow() {
        // // console.log("### Board => showBgShadow");
        return new Promise(res => {
            createjs.Tween.get(this.bgContainer)
                .to({ alpha: 0.5 }, 500)
                .call(res);
        })
    },

    hideBgShadow() {
        // // console.log("### Board => hideBgShadow");
        return new Promise(res => {
            createjs.Tween.get(this.bgContainer)
                .to({ alpha: 0 }, 500)
                .call(res);
        })
    },

    hideOptionBoard() {
        // // console.log("### Board => hideOptionBoard");
        return new Promise(res => {
            res()
        })
    },

    initFreeSpinsModeOptions() {
        // // console.log("### Board => initFreeSpinsModeOptions");
        let promise = Promise.resolve()
        return promise
            // .then(() => this.showBgShadow())
            .then(() => this.showOptionBoard())
            // .then(() => utils.wait(2e3))
            .then(() => this.hideOptionBoard())
            .then(() => this.hideBgShadow())
    },

    createExpandWildMask() {
        return this.processor.expandWild.create()
    },

    addExpandWild(index) {
        return this.processor.expandWild.add()
    },

    destroyExpandWildMask() {
        this.processor.expandWild.destroyMask()
    },

    removeUpperLayerScarabWild() {
        return this.processor.scarabWild.remove()
    },

    addUpperLayerScarabWild() {
        return this.processor.scarabWild.add()
    },

    addUpperLayerStoneMultiplayer() {
        return this.processor.stoneMultiplier.add()
    }
});