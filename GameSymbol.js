import {Draw} from 'core/components/Draw';
import {app, GameEvent, spriteMgr} from 'core/app';
import GameSymbol from 'core/components/GameSymbol';
import Reel from 'core/components/Reel';
import {console} from "../../slotscore/core/utils";
import {utils} from 'core/utils';
// because different image prefix in assets

Object.assign(GameSymbol, {
    mapping: {
        1: "top1",
        2: "top2",
        3: "top3",
        4: "top4",
        5: "pic1",
        6: "pic2",
        7: "ace",
        8: "king",
        9: "queen",
        10: "jack",
        11: "ten",
        12: "nine",
        13: "bonus",
        14: "wild_scarab",
        // 15: "wild_expand",
        16: "wild",
        17: "Multi",
        18: "2x",
        19: "3x"
    },

    getRandomSymbolId(reel) {
        let values = Object.keys(GameSymbol.mapping).map(i => parseInt(i, 10));
        try {
            values = app.model.get(`settings.reelsamples.spins`)[reel] || values;
        } catch (e) {
            console.error(e)
        }
        let val = values[utils.random(0, values.length)]
        val = [14, 18, 19].indexOf(val) != -1 ? [1] : val
        // console.log(val)
        // // console.log(![14, 18, 19].includes(val) ? [val] : [1])
        return val;
    },

    SCATTER_ID: 13,
    WILD_ID: 16,
});

GameSymbol.BLUR = 'blur';
GameSymbol.STOP = 'idle'; // stop
GameSymbol.STATIC = 'idle';
GameSymbol.SHORT = 'short';
GameSymbol.MOVE = 'move' // added

Object.assign(GameSymbol.prototype, {
    onCreateState(state, isAnimated){
        if(!isAnimated){
            return;
        }

        //! always after adding new operation should prock default operator.
        this.sprite.setOperationDefaultProperties();
    },
    getImgName(state){
        switch(state){
            case GameSymbol.MOVE:
            case GameSymbol.STATIC:
                return `${GameSymbol.mapping[this.id]}_${state}`;

            default:
                return `${GameSymbol.mapping[this.id]}`;
        }
        return nul;
    },
    getSymbolAnimation(state){
        if(state === GameSymbol.STOP ){ //  && this.id != GameSymbol.SCATTER_ID
            return GameSymbol.STATIC;
        }

        return state;
    },
    getSymbolName(){
        return `${GameSymbol.mapping[this.id]}`;
    },
    getEmitSymbolName(state){
        switch (state) {
            case 'blur':
                return 'blur';
            case 'idle':
                return 'shake';
            case 'short':
                return 'shake';
            case 'move':
                return 'shake';
            case 'dis':
                return 'blur';
        }
    },

    getEmitSymbolAut(state){
        switch (state) {
            case 'blur':
                return true;
            case 'idle':
                return true;
            case 'short':
                return false;
            case 'move':
                return true;
            case 'dis':
                return true;
        }
    },

    // setStopState() {
    //     return this.createState(this.getSymbolAnimation(GameSymbol.STOP));
    // },

    update() {

    },

    setStaticState(allowTimeScale = false) {
        this.createState(GameSymbol.STATIC);
    },

    shakeSymbol() {
        if (app.model.get('game.freespins.mode') === "mode20") {
            return new Promise(res => {
                // console.log("shake")
                this.emitterFallSpline.state.setAnimation(0, "shake", false)
                res() 
                // this.emitterFallSpline.state.addListener({ complete: entry => {
                //     res()
                // }})
            })
        } else {
            return Promise.resolve()
        }
    },
    
    createState(state, isAnimated = false, ts = false) {
        const imgName = this.getImgName(state);
        // // console.log(state)
        let emitterState = this.getEmitSymbolName(state)
        // const emitterFallSpline = Draw.buildSpine('emitterfall',  true, emitterState, {loop: false})

        let mode = 0
        switch (app.model.get('game.freespins.mode')) {
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
        
        const _state = state
        if (imgName === "top2" && state === "blur") {
            state = "dis"
        } else if (imgName === "2x" || imgName === "3x" && state === "blur") {
            state = "short"
        } else if (app.model.canAction('freespin_init') && imgName === 'bonus' && state === "short") {
            state = "start"
        } else {
            state = _state
        }
         
        if (this.state === state) {
            if (this.complete) {
                this.complete = false;
                this.sprite.gotoAndPlay(0);
            }
            return;
        }
        
        try {
            
            let oldSprite = this.sprite;
            let oldEmitterFallSpline = this.emitterFallSpline;
            this.emitterFallSpline = spriteMgr.buildSpineAdapter("emitterfall", emitterState, this)   
            // console.log(this.emitterFallSpline.duration)
            if (emitterState == "shake" && !ts) {
                this.emitterFallSpline.state.timeScale = 0
            } else {
                this.emitterFallSpline.state.timeScale = 500
            }
            // this.emitterFallSpline.state.timeScale = 0
            // todo: mykyta givnokoder
            // onComplete is still called even if sprite is deleted
            
            this.complete = false;

            const h = Math.round(app.config.get('GameSymbol.height') / 2);
            const w = Math.round(app.config.get('GameSymbol.width') / 2);
            const r = app.loader.resources[imgName];
            const gen = imgName + state;
            this.sprite = null;
            // this.emitterFallSpline = null

            if (r && 'spineData' in r) {
                this.sprite = spriteMgr.buildSpineAdapter(imgName, this.getSymbolAnimation(state), this);
                app.board.WinDuration = Math.max(app.board.WinDuration, this.sprite.getDuration());
            } else if (isAnimated) {
                this.sprite = spriteMgr.buildAnimationItem(imgName, 'animation', this);
                this.sprite.restore();
            }
            else {
                this.sprite = PIXI.extras.AnimatedSprite.fromImages([`${imgName}`]);
                this.sprite.loop = false;
                this.sprite.onComplete = () => this._onComplete();
            }

            //! add to correct layer.
            if (isAnimated) {
                let anim_layer = app.board.reels.animation[this.col - 1];
                this.sprite = anim_layer.addChildAt(this.sprite, 0);
                
                //! x - just offset, ass anim_layer is column layer.
                this.sprite.x = this.sprite.prop.x = w;
                //! require save y position of current layer.
                this.sprite.y = this.sprite.prop.y = this.y;
                app.board.WinDuration = Math.max(app.board.WinDuration, this.sprite.getDuration());
            } else {
                
                if (app.bg.mode === 'freespins' && app.bg.fs_mode == 3) {
                    this.emitterFallSpline = this.addChild(this.emitterFallSpline)
                    this.sprite = this.addChild(this.sprite);

                    this.sprite.x = this.emitterFallSpline.x = w;
                    this.sprite.y = this.emitterFallSpline.y = h;
                } else {
                    this.sprite = this.addChildAt(this.sprite, 0);

                    this.sprite.x = w;
                    this.sprite.y = h;
                }

                //this.sprite.texture.baseTexture.mipmap = true;
                //! set just offset as we already in correct cell
            }

            this.sprite.roundPixels = false;

            this.onCreateState(state, isAnimated);

            this.off(GameSymbol.EventAnimationComplete, this.setStaticState, this);
            this.sprite.play();

            if (this.sprite.anchor) {
                this.sprite.anchor.x = 0.5;
                this.sprite.anchor.y = 0.5;
            }

            if (this.scaleX !== 1 || this.scaleY !== 1 || this.alpha !== 1) {
                this.tween(true).to({scaleX: 1, scaleY: 1, alpha: 1}, 160);
            }

            if (oldSprite) {
                oldSprite.removeFromParent();
                // if (state == 'short') {
                    // oldEmitterFallSpline.removeFromParent()
                // } else {
                    // createjs.Tween.get(oldEmitterFallSpline)
                    //     .to({alpha: 0}, 500)
                    //     .call(() =>{
                        // });
                        // }
                oldSprite.onComplete = null;
                if (oldEmitterFallSpline != null) {
                    oldEmitterFallSpline.removeFromParent()
                    oldEmitterFallSpline.onComplete = null
                }
            }

            this.state = state;
        }
        catch (e) {
            console.error(e);
        }
    }
});

GameSymbol.getSprite = function(symbolId){
return PIXI.Sprite.fromFrame(`${GameSymbol.mapping[symbolId]}_${GameSymbol.STATIC}`);
};
