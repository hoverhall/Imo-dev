/**
 * * @author Harupa Dzmitry <d7561985.gmail.com> on 04.07.2018.
 */
import {app} from 'core/app';
import {utils} from 'core/utils';
import {GameEvent} from 'core/core/Enums';
import {Draw, spriteMgr} from 'core/components/Draw';
import SkipController from "../../slotscore/core/controllers/SkipController";

export default class UpperLayerGameSymbols extends PIXI.Container{
    constructor(){
        super();

        this.animations = [];
        this.animationsUpLayer = [];
        this.staticUpLayer = []

        // SkipController.on(() => {
        //     let animation = this.animations.reduce((prev, cur) => {
        //         if (cur.skippable) return cur;
        //         return prev;
        //     }, null);
        //     if (animation) {
        //         animation.onStop.call(this);
        //     }
        // });

        SkipController.on(() => {
            let animation = this.animations.reduce((prev, cur) => {
                if (cur.skippable) return cur;
                return prev;
            }, null);
            if (animation) {
                animation.onStop.call(this);

                for(let symbol of this.animationsUpLayer) {
                    if(!symbol.state.tracks[0].loop) symbol.state.timeScale = 10000;
                }

                // if(this.expand_winline) {
                //     for(let item of this.expand_winline) {
                //         this.removeChild(item);
                //     }

                //     this.expand_winline = [];
                // }

            }
        });
    }

    addSymbolMask( sprite, x, y) {
        console.log("addSymbolMask")
        sprite.position.set(x, y);
        this.addChild( sprite );
    }

    removeSymbolsMask() {
        this.staticUpLayer.map(item => {
            // console.log("static => ", item)
            item.visible = false
            item.removeFromParent()
        })
        // this.ppoo.removeFromParent()
    }

    start( animName, x, y, start){
        let modeSettings = () => {
            switch (app.model.get('game.freespins.mode')) {
                case "mode10":
                    return {animation_name: animName, animation_mode: 'short'}
                case "mode15":
                    return {animation_name: animName, animation_mode: 'short'}
                case "mode20":
                    return {animation_name: 'emitterfall', animation_mode: 'short'}
                case "mode25":
                    return {animation_name: animName, animation_mode: 'short'}
                default:
                    return {animation_name: animName, animation_mode: 'short'}
            }
        }

        let anim = app.model.canAction('freespin_init') && !app.model.canAction('spin') && start && animName === "bonus" ? "start" : modeSettings().animation_mode;

        let animation = this.addChild( Draw.buildSpine(modeSettings().animation_name, true, anim, {loop: false} ) );
        // console.log(animation.getDuration())

        animation.position.set(x, y);
        animation.state.addListener({
            complete: entry =>{
                try{
                    animation.alpha = 0;
                    animation.emit('GameSymbol.EventAnimationComplete');

                    utils.wait(100).then(()=>{
                        if(animation.parent) {
                            animation.parent.removeChild(animation);
                            try { animation.destroy() } catch(e) {}
                        }
                        
                        this.animationsUpLayer.splice(this.animationsUpLayer.indexOf(animation), 1);
                    })
                } catch(e){
                    console.error(e)
                }
            }
        });
        this.animationsUpLayer.push(animation);
        return animation;
    }

    stop() {
        for ( let i = 0; i < this.animationsUpLayer.length; i++ ) {
            this.animationsUpLayer[i].alpha = 0;
        }
        this.animationsUpLayer = [];
    }

    startWinLineEmitter(winline) {
        if (!app.loader.resources['winshow'])
            return Promise.resolve();

        this.expand_winline = [];
        if(this.expand_winline) {
            for(let item of this.expand_winline) {
                this.removeChild(item);
            }

            this.expand_winline = [];
        }

        this.animations = [];

        let cancel = false;
        SkipController.once(()=>{
            cancel = true;
        })

        let p = Promise.resolve();
        console.log(winline)
        for (let i = 0; i < winline.positions.length; i++) {
            p = p.then(() => {
                if (cancel || app.model.get('gr.autogame'))
                return;

                const emitter = this.addChild(Draw.buildSpine('winshow', true, 'emitter', {loop: false}));
                emitter.alpha = 0;
                emitter.blendMode = PIXI.BLEND_MODES.ADD;
                emitter.position.set(
                    app.board.reels.x + app.config.get('GameSymbol.width') * winline.positions[i][0] + (app.config.get('GameSymbol.width') / 2),
                    app.board.reels.y + app.config.get('GameSymbol.height') * winline.positions[i][1] + (app.config.get('GameSymbol.height') / 2)
                );

                this.expand_winline.push(emitter);

                createjs.Tween.get(emitter)
                    .call(()=>{
                        // Sound.play('pick', 'monkey_voice', {loop: 0, volume: 1});
                    })
                    .to({alpha: 1}, 0)


                app.emit(GameEvent.LineEmittter, i, winline);
            })
            .then(() => utils.wait(0));
        }
        p = p.then(() => utils.wait(500))
        p = p.then(() => {
            if(this.expand_winline) {
                for(let item of this.expand_winline) {
                    this.removeChild(item);
                }

                this.expand_winline = [];
            }
        })

        return this.addAnimation(
            () => {
                return p;
            },
            () => {
                // cancel = true;
            }, null, true
        );
    }

    startWinLineEmitter1(winline){
        if (!app.loader.resources['winshow']) {
            console.log("NO LINE EMITTER!")
            return Promise.resolve();
        }

        let verticalExpandWild = app.model.verticalExpandWild();
        const  REPEAT_NUM = app.config.getDefault('Board.lineEmitterNum', 2);
        const StepWait = app.config.getDefault('Board.lineEmitterStepWait', 200);
        const EndWait = app.config.getDefault('Board.lineEmitterEndWait', 500);
        this.animations = [];

        let line = null;
        const h = Math.round(app.config.get('GameSymbol.height') / 2);
        const w = Math.round(app.config.get('GameSymbol.width') / 2);

        try {
            line = app.model.get(`settings.paylines`)[winline.line - 1];
        } catch (e) {
            return Promise.resolve();
        }

        let cancel = gr.UI.model.get('autogame.active') || app.stateMachine.current != "IdleSpinsState" ;
        let p = Promise.resolve();
        for (let n = 0; n < REPEAT_NUM; ++n) {
            for (let i in line) {
                // if ( verticalExpandWild.length !== 0  ) {
                //     let collWildExpand = verticalExpandWild[0].col_id;
                //     if ( collWildExpand == i ) {
                //        continue;
                //     }
                // }
                p = p.then(() => {
                    if (cancel)
                        return;
                    let width = app.config.get('GameSymbol.width');
                    let x = (width * ( i )) + 158 + width;
                    let height = app.config.get('GameSymbol.height');
                    let y = (height * ( line[i] )) + 145 + height/2;

                    let emitter = this.addChild(Draw.buildSpine('winshow', true, 'emitter', {loop: false}));
                    emitter.position.set(x, y);
                    app.emit(GameEvent.LineEmittter, i);
                })
                    .then(() => utils.wait(StepWait));
            }
            p = p.then(() => utils.wait(EndWait));
        }

        return this.addAnimation(
            () => {
                return p;
            },
            () => {
                cancel = true;
            }, null, true
        );
    }

    addAnimation(onStart, onStop, container = null, skippable = null) {
        if (skippable) {
            if (this.animations.find(i => i.skippable)) {
                console.warn('multiple skippable animations added. Only top will be skipped');
            }
        }
        let extendCallback = (original, fn) => () => utils.getPromise(original && original.call(this)).then(fn);

        if (skippable) {
            let lastTapTime = 0;
            let skipContainer = new PIXI.Container();
            skipContainer.interactive = true;
            skipContainer.on('click tap', function (e) {
                e.data.originalEvent.preventDefault();
                const time = Date.now();
                if (time - lastTapTime < 500)
                    onStop();
                lastTapTime = time;
            });
            skipContainer.hitArea = new PIXI.Rectangle(0, 0, app.config.get('App.width'), app.config.get('App.height'));
            this.addChild(skipContainer);

            onStop = extendCallback(onStop, () => skipContainer.destroy());
            onStart = extendCallback(onStart, () => skipContainer.destroy());
        }

        let removeAnimation = () => {
            const idx = this.animations.findIndex(i => i.onStop === onStop);
            if (idx !== -1) this.animations.splice(idx, 1);
        };
        onStop = extendCallback(onStop, removeAnimation);
        onStart = extendCallback(onStart, removeAnimation);

        let defer = utils.deferred();
        onStop = extendCallback(onStop, defer.resolve);
        onStart = extendCallback(onStart, defer.resolve);

        // make onstop call only once
        let stopPromise;
        onStop = (function (originalOnStop) {
            return function () {
                return stopPromise = stopPromise || originalOnStop.call(this);
            };
        })(onStop);

        this.animations.push({
            onStop: onStop,
            skippable: skippable
        });
        onStart.call(this);
        return defer.promise;
    }
}
